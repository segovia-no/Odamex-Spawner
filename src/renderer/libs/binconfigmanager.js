import fs from 'fs'
import readline from 'readline'

//This lib manages the config files for each odamex binary installation
let binConfigManager = {

  readPlayerSettings: () => {
    return new Promise((resolve, reject) => {

      let playerSettings = {
        cl_name: 'Player',
        cl_color: '#40cf00',
        cl_team: 'blue',
        cl_gender: 'male',
        mouse_sensitivity: 1.5
      }
  
      const rl = readline.createInterface({
        input: fs.createReadStream('./odamexbinconfig.cfg'),
        crlfDelay: Infinity
      })
  
      rl.on('line', (line) => {
  
        let arrayArgs = line.split(/ "|" "|" |"$/)
  
        if (arrayArgs.length < 3) {
          return
        }
  
        if (arrayArgs[0].toLowerCase() == 'set') {
  
          switch (arrayArgs[1]) {
  
            case 'cl_name':
              playerSettings.cl_name = arrayArgs[2]
              break
  
            case 'cl_color':
              playerSettings.cl_color = '#' + arrayArgs[2].replace(/ /g, '')
              break
  
            case 'cl_team':
              playerSettings.cl_team = arrayArgs[2]
              break
  
            case 'cl_gender':
              playerSettings.cl_gender = arrayArgs[2]
              break
  
            case 'mouse_sensitivity':
              playerSettings.mouse_sensitivity = arrayArgs[2]
              break
  
          }
  
        }
  
      })
  
      rl.on('close', () => {  resolve(playerSettings)  })

      rl.on('error', () => {  reject()  })

    })
  },

  readGameSettings: () => {
    return new Promise((resolve, reject) => {

      let gameSettings = {
        vid_defwidth: 1024,
        vid_defheight: 768,
        vid_fullscreen: false,
        vid_maxfps: 0,
        cl_serverdownload: true
      }
  
      const rl = readline.createInterface({
        input: fs.createReadStream('./odamexbinconfig.cfg'),
        crlfDelay: Infinity
      })
  
      rl.on('line', (line) => {
  
        let arrayArgs = line.split(/ "|" "|" |"$/)
  
        if (arrayArgs.length < 3) {
          return
        }
  
        if (arrayArgs[0].toLowerCase() == 'set') {
  
          switch (arrayArgs[1]) {
  
            case 'vid_defwidth':
              gameSettings.vid_defwidth = arrayArgs[2]
              break
  
            case 'vid_defheight':
              gameSettings.vid_defheight = arrayArgs[2]
              break
  
            case 'vid_fullscreen':
              gameSettings.vid_fullscreen = (arrayArgs[2] === "1") ? true : false
              break
  
            case 'vid_maxfps':
              gameSettings.vid_maxfps = parseInt(arrayArgs[2])
              break
  
            case 'cl_serverdownload':
              gameSettings.cl_serverdownload = (arrayArgs[2] === "1") ? true : false
              break
  
          }
  
        }
  
      })
  
      rl.on('close', () => {  resolve(gameSettings)  })

      rl.on('error', () => {  reject()  })

    })
  },


  saveCFG: (confObj) => {
    return new Promise(function (resolve, reject) {

      let inputVars = Object.keys(confObj)

      const data = fs.readFileSync('./odamexbinconfig.cfg', 'UTF-8')
      const lines = data.split(/\r?\n/)

      let contentToSave = []
      let parsedSettings = []

      for(const line in lines){

        let arrayArgs = lines[line].split(/ "|" "|" |"$/)

        if(arrayArgs[0].toLowerCase() == 'set' && !arrayArgs.length < 3){ //replaces input settings and preserves "set" ones

          let currentSetting = arrayArgs[1].replace('"', '')

          parsedSettings.push(currentSetting)

          let foundIndex = inputVars.indexOf(currentSetting)

          if(foundIndex == -1){

            contentToSave.push(lines[line])

          }else{

            contentToSave.push('set "' + currentSetting + '" "' + confObj[currentSetting] + '"')
            
          }

        }else{ //line is not "set" type, omit it and add it to write string

          contentToSave.push(line)

        }

      }

      for(const setting in inputVars){ //inserts new settings if not in file

        let currentSetting = inputVars[setting]

        let foundIndex = parsedSettings.indexOf(currentSetting)

        if(foundIndex == -1){
          contentToSave.push('set "' + currentSetting + '" "' + confObj[currentSetting] + '"')
        }

      }

      fs.writeFile('./odamexbinconfig.cfg', contentToSave.join('\n'), function (err) { //save to file
        if (err) reject(err)
      })

      resolve()

    })
  }

}
export default binConfigManager