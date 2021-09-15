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

    try {

      const files = await fs.promises.readdir(demoPath)
      
      for (const file of files)

        if (path.extname(file) == ".odd"){
  
          let stats = fs.statSync(path.join(demoPath, file))

          //parse the GAMEVER byte, found in 0.6.0 and newer
          let gamever = 0
          let legacy_demo = false
          let hex_arr = fs.readFileSync(path.join(demoPath, file)).slice(0, 1024).toString('hex').match(/(..)/g)
          let demo_slice = hex_arr.slice(81, 1024)  

          if (hex_arr[4] == '02') { //NETDEMOVER 02 indicates 0.5.4 - 0.5.6 

            legacy_demo = true

          } else if (demo_slice[demo_slice.indexOf('aa')-1] == '0a'){

            let gamever_index = demo_slice.indexOf('aa') - 69 
            gamever = new Uint8Array(demo_slice[gamever_index].match(/.{1,2}/g).map(byte => parseInt(byte, 16)))
          
          } else { 

            let gamever_index = demo_slice.indexOf('aa') - 5 
            gamever = new Uint8Array(demo_slice[gamever_index].match(/.{1,2}/g).map(byte => parseInt(byte, 16)))
          
          }

          //major + minor + patch release
          let gamever_str = Math.floor(gamever / 256).toString() + '.' + Math.floor((gamever % 256) / 10).toString() + '.' + ((gamever % 256) % 10).toString()
          
          //parse the hostname
          let hostname = Buffer.from(demo_slice.slice(0, demo_slice.indexOf('00')).join(' ').replace(/\s+/g, ''), 'hex').toString('utf8')

          demos.push({
            demoName: String(file), 
            fileSizeMB : Math.round( (stats["size"] / 1000000.0) * 1e2 ) / 1e2,
            clientVersion: (legacy_demo) ? '0.5.4-0.5.6' : gamever_str,
            hostName: hostname
          })
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