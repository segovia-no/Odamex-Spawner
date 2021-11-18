import { strictEqual } from 'assert';

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
        'name': 'gameType',
        're': /73,76,5f,67,61,6d,65,74,79,70,65,00,(?<gameType>..)/,
      },
      {
        'name': 'hostName',
        're': /73,76,5f,68,6f,73,74,6e,61,6d,65,00,(?<hostName>(.*?))00/,
      },
      {
        'name': 'pov',
        're': /aa(...){49}(?<pov>(.*?))00/
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
          let gamever = 0

          //file size
          let stats = fs.statSync(path.join(demoPath, file))
          currentDemo.fileSizeMB = Math.round( (stats["size"] / 1000000.0) * 1e2 ) / 1e2

          //store first 2560 bytes of the demo
          let hex_arr = fs.readFileSync(path.join(demoPath, file)).slice(0, 2560).toString('hex').match(/(..)/g)
          let demo_slice = hex_arr.slice(81, 1024)  
          let demo_str = hex_arr.slice(81, 2560).toString()
          
          //parse the GAMEVER byte
          if (hex_arr[4] == '02') { //NETDEMOVER 02 indicates 0.5.4 - 0.5.6 
            legacy_demo = true
          } else if (demo_slice[demo_slice.indexOf('aa')-1] == '0a'){
            gamever = new Uint8Array(demo_slice[demo_slice.indexOf('aa') - 69].match(/.{1,2}/g).map(byte => parseInt(byte, 16)))     
          } else { 
            gamever = new Uint8Array(demo_slice[demo_slice.indexOf('aa') - 5].match(/.{1,2}/g).map(byte => parseInt(byte, 16)))      
          }

          //convert gamever to oda version - major.minor.patch 
          let oda_version = Math.floor(gamever / 256).toString() + '.' + Math.floor((gamever % 256) / 10).toString() + '.' + ((gamever % 256) % 10).toString()
          currentDemo.clientVersion = (legacy_demo) ? '0.5.4-0.5.6' : oda_version

          //parse the regexs
          for (const regex of hex_regexs){
            try {
              let found_re = regex['re'].exec(demo_str)
              let decode = Buffer.from(found_re.groups[regex['name']].replace(/,/g, ''), 'hex').toString('utf8')
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