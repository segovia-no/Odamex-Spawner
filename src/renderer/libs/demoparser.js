let demoparser = {

  getDemosfromPath: async (demoPath) => {

    /////////////////////////////////////////////////////////////////////////////////////////////
    // This process returns odamex demos from the Demo path
    /////////////////////////////////////////////////////////////////////////////////////////////

    const fs = require('fs')
    const path = require('path');

    let demos = []

    try {

      const files = await fs.promises.readdir(demoPath)
      
      for (const file of files)

        if (path.extname(file) == ".odd")
          demos.push({demoname: String(file)})

    } catch (err) {

      console.error(err)

    }

      return demos

    }

}

export default demoparser