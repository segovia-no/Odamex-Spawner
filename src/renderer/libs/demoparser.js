let demoparser = {

  getDemosfromPath: async (demoPath) => {

    /////////////////////////////////////////////////////////////////////////////////////////////
    // This process returns odamex demos from the Demo Path
    /////////////////////////////////////////////////////////////////////////////////////////////

    const fs = require('fs')
    const path = require('path');

    let demos = []
    let defaultPath = path.resolve('demos')

    try {

      const files = await fs.promises.readdir(demoPath)
      
      for (const file of files)

        if (path.extname(file) == ".odd")
          demos.push({demoname: String(file)})

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