let demoparser = {

  getDemosfromPath: async (demoPath) => {

    /////////////////////////////////////////////////////////////////////////////////////////////
    // This process parses odamex demos from the Demo Path
    // https://github.com/odamex/odamex/blob/stable/client/src/cl_demo.cpp 
    /////////////////////////////////////////////////////////////////////////////////////////////

    const fs = require('fs')
    const path = require('path');

    let demos = []
    let defaultPath = path.resolve('demos')

    const gametypes = {0: 'Cooperative', 1: 'Deathmatch', 2: 'Team Deathmatch', 3: 'Capture The Flag', 4: 'Horde'}

    const demoRegexs = { 

      'clientVersion': /050302010000(?<clientVersion>....)/,  // the GAMEVER bytes, found in demo versions 0.5.4+
      'gametype': /73765f67616d6574797065((..)*?)(?<gametype>30|31|32|33|34)/, 
      'hostname': /(..){81}(?<hostname>((..)*?))(00..00?)/,   // found in 0.6+
      'pov': /((..){65}050302010000..00((..)*?)aa(..){49}|(..){65}050302010000....((..)*?)aa(..){57})(?<pov>(..)*?)(00|2a)/   //0.6+

    }

    try {

      const files = await fs.promises.readdir(demoPath)
      
      for (const file of files){

        if (path.extname(file) == ".odd"){

          let currentDemo = {
            demoName: String(file), 
            fileSizeMB : 0,
            clientVersion: '',
            hostName: '',
            gameType: '',
            pov: ''
          }

          try {

            let stats = fs.statSync(path.join(demoPath, file))
            currentDemo.fileSizeMB = Math.round( (stats["size"] / 1000000.0) * 1e2 ) / 1e2

            //slice first 2560 bytes of the demo
            let hexStr = fs.readFileSync(path.join(demoPath, file)).slice(0, 2560).toString('hex')

            if (hexStr.slice(8, 10) == '01') { 
              currentDemo.clientVersion = '0.5.3'
            }

            let versionMatch = demoRegexs.clientVersion.exec(hexStr)
            let gamever = Buffer.from(versionMatch.groups.clientVersion, 'hex').readInt16LE()
            let odaVersionStr = Math.floor(gamever / 256).toString() + '.' + Math.floor((gamever % 256) / 10).toString() + '.' + ((gamever % 256) % 10).toString()
            currentDemo.clientVersion = odaVersionStr

            let gametypeMatch = demoRegexs.gametype.exec(hexStr)            
            currentDemo.gameType = gametypes[Buffer.from(gametypeMatch.groups.gametype, 'hex').toString('utf8')]

            let povMatch = demoRegexs.pov.exec(hexStr)
            currentDemo.pov = Buffer.from(povMatch.groups.pov, 'hex').toString('utf8').replace(/[\u0018|\u0001]+/g, '')

            let hostnameMatch = demoRegexs.hostname.exec(hexStr)     
            currentDemo.hostName = Buffer.from(hostnameMatch.groups.hostname, 'hex').toString('utf8')

          } catch(err) {} //pass silently to next demo if any parsing fails
          
          demos.push(currentDemo)

        }

      }
          
    } catch (err) {

      //create the default demoPath dir if it does not exist
      if(err.message.includes("no such file or directory, scandir '" + defaultPath)){
        fs.promises.mkdir(defaultPath)
      } else {
        console.error(err)
      }

    }

      return demos

    }

}

export default demoparser
