let demoparser = {

  getDemosfromPath: (demoPath) => {

    /////////////////////////////////////////////////////////////////////////////////////////////
    // This process parses demos in the demos folder
    /////////////////////////////////////////////////////////////////////////////////////////////

    const fs = require('fs')
    
    try {
      //Data definition
      let demos = []

      const files = fs.readdirSync(demoPath);

      for (const file of files)
        demos.push({demoname: file, favorite: false})

      return demos

    }catch (e) {
      console.error(e);
      return False
    }

  },

}

export default demoparser