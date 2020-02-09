import fs from 'fs'

//This lib checks for the necessary folders to make odamex spawner work correctly
let folderLib = {

  checkDirectory: (path) => {

    fs.access(path, (err) => {
      if(err){
        
        fs.mkdir(path, { recursive: true }, (err) => {
          if(err){
            console.error(err)
          }
        })

      }
    })

  }

}

export default folderLib