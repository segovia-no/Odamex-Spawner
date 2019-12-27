let gameserverparser = {

  getInfofromAPI: async (apiURL) => {

    /////////////////////////////////////////////////////////////////////////////////////////////
    // This process parses the public api listed below
    // https://odamex.net/api/servers
    /////////////////////////////////////////////////////////////////////////////////////////////
    
    const axios = require('axios')

    try {

      //Data definition
      let serverInfo = {
        ip: '',
        port: 0,
        hostname: '',
        inGamePlayers: 0,
        maxClients: 0,
        currentMap: '',
        wadCount: 0,
        iwad: '',
        pwadList: [],
        gameType: '',
        skillLevel: '',
        teamPlay: false,
        ctfMode: false,
        playersList: [],
        pwadMD5hashes: [],
        serverWebsite: '',
        teamScoreLimit: 0,
        blueTeam: false,
        blueScore: 0,
        redTeam: false,
        redScore: 0,
        goldTeam: false,
        goldScore: 0,
        protocolVersion: 0,
        adminEmail: '',
        timeLimit: 0,
        timeLeft: 0,
        fragLimit: 0,
        itemRespawn: false,
        weaponStay: false,
        friendlyFire: false,
        allowExit: false,
        infiniteAmmo: false,
        noMonsters: false,
        monstersRespawn: false,
        fastMonsters: false,
        allowJumping: false,
        allowFreelook: false,
        wadDownload: false,
        emptyReset: false,
        fragExitSwitch: false,
        maxPlayers: 0,
        spectators: [],
        passworded: false,
        gameVersion: 0
      }

    
      let apiResponse = await axios.get(apiURL)

      //return object definition
      return apiResponse

      
    }catch(e){
      console.error(e)
      return false
    }

  },

}

export default gameserverparser