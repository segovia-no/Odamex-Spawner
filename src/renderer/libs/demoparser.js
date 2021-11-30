let demoparser = {

  getDemosfromPath: async (demoPath) => {

    /////////////////////////////////////////////////////////////////////////////////////////////
    // This process parses odamex demos from the Demo Path
    /////////////////////////////////////////////////////////////////////////////////////////////

    const fs = require('fs')
    const path = require('path');

    let demos = []
    let defaultPath = path.resolve('demos')

    const gametypes = {0:'Cooperative', 1:'Deathmatch', 2:'Team Deathmatch', 3: 'Capture The Flag'}

    const hex_regexs = [
      {
        'name': 'clientVersion',
        're': /(..){65}050302010000(?<clientVersion>..)00000000aa?/
      },
      {
        'name': 'clientVersion',
        're': /(..){65}050302010000(?<clientVersion>..)(..){67}0aaa?/  //occasionally the gamever is found here
      },
      {
        'name': 'gameType',
        're': /73765f67616d657479706500(?<gameType>..)/,
      },
      {
        'name': 'hostName',
        're': /73765f686f73746e616d6500(?<hostName>.*?)00/,
      },
      {
        'name': 'pov',
        're': /(..){65}((..)*?)050302010000(..){5}aa(..){49}(?<pov>.*?)00/
      }
    ]

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
          
          let legacy_demo = false

          //file size
          let stats = fs.statSync(path.join(demoPath, file))
          currentDemo.fileSizeMB = Math.round( (stats["size"] / 1000000.0) * 1e2 ) / 1e2

          //read first 2560 bytes of the demo
          let hex_str = fs.readFileSync(path.join(demoPath, file)).slice(0, 2560).toString('hex')
          
          if (hex_str.slice(8, 10) == '02') { //NETDEMOVER byte 02 indicates 0.5.4 - 0.5.6 
            legacy_demo = true
          } 

          //parse the regexs
          for (const regex of hex_regexs){

            try {
              let found_re = regex['re'].exec(hex_str)
              if (regex['name'] == 'clientVersion' && legacy_demo){
                currentDemo.clientVersion = '0.5.4-0.5.6'
                continue
              } else if (regex['name'] == 'clientVersion'){
                let gamever = new Uint8Array(found_re.groups.clientVersion.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))
                //convert the GAMEVER byte to odamex version - major.minor.patch
                var decode = Math.floor(gamever / 256).toString() + '.' + Math.floor((gamever % 256) / 10).toString() + '.' + ((gamever % 256) % 10).toString()
              } else {
                var decode = Buffer.from(found_re.groups[regex['name']], 'hex').toString('utf8')
              }
              
              currentDemo[regex['name']] = (regex['name'] == 'gameType') ? gametypes[decode] : decode
              
            } catch (err) {}
          }

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