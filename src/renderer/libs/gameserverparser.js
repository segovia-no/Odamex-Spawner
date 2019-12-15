let gameserverparser = {

  //Parse from SERVER_CHALLENGE packet
  getInfofromSERVER_CHALLENGE: (serverResponse, info) => {

    /////////////////////////////////////////////////////////////////////////////////////////////
    // This process has been done using this specification
    // https://odamex.net/w/index.php?title=Launcher_Protocol&oldid=3802#Specifications
    // in conjunction with odamexgo - https://github.com/Ch0wW/odamexgo/blob/master/odaquery.go
    /////////////////////////////////////////////////////////////////////////////////////////////

    let asciiResponse = serverResponse.toString('ascii')
    let currentindex = 8 //skips response and token
    
    //Data definition
    let serverInfo = {
      ip: info.address,
      port: info.port,
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

    //hostname
    let hostnameString = []

    while(serverResponse.readUInt8(currentindex) != 0 && currentindex < serverResponse.length){
      hostnameString.push(asciiResponse.charAt(currentindex))
      currentindex++
    }

    serverInfo.hostname = hostnameString.join('')
    currentindex++
    
    //in-game players
    serverInfo.inGamePlayers = serverResponse.readUInt8(currentindex)
    currentindex++

    //max clients
    serverInfo.maxClients = serverResponse.readUInt8(currentindex)
    currentindex++

    //current map
    let currentMapString = []

    while(serverResponse.readUInt8(currentindex) != 0 && currentindex < serverResponse.length){
      currentMapString.push(asciiResponse.charAt(currentindex))
      currentindex++
    }

    serverInfo.currentMap = currentMapString.join('')
    currentindex++

    //WAD count
    serverInfo.wadCount = serverResponse.readUInt8(currentindex)
    currentindex++

    //IWAD/PWAD
    for(let i = 0; i < serverInfo.wadCount; i++){

      let currentPwadString = []

      while(serverResponse.readUInt8(currentindex) != 0 && currentindex < serverResponse.length){
        currentPwadString.push(asciiResponse.charAt(currentindex))
        currentindex++
      }
  
      serverInfo.pwadList.push(currentPwadString.join(''))
      currentindex++

    }

    serverInfo.iwad = serverInfo.pwadList[0]
    serverInfo.pwadList.shift()

    //gametype
    let gametypeByte = serverResponse.readUInt8(currentindex)

    if(gametypeByte == 0){
      serverInfo.gameType = 'Cooperative'
    }else if(gametypeByte == 1){
      serverInfo.gameType = 'Deathmatch'
    }else if(gametypeByte == 2){
      serverInfo.gameType = 'Team Deathmatch'
    }else if(gametypeByte == 3){
      serverInfo.gameType = 'Capture The Flag'
    }

    currentindex++

    //skill level
    serverInfo.skillLevel = serverResponse.readUInt8(currentindex)
    currentindex++

    //teamplay
    serverInfo.teamPlay = (serverResponse.readUInt8(currentindex) == 1) ? true : false
    currentindex++

    //ctfmode
    serverInfo.ctfMode = (serverResponse.readUInt8(currentindex) == 1) ? true : false
    currentindex++

    //players stats (1 of 2 phases)
    for(let i = 0; i < serverInfo.inGamePlayers; i++){

      let currentPlayer = {
        name: '',
        frags: 0,
        ping: 0,
        team: 0
      }

      //name
      let playerNameString = []

      while(serverResponse.readUInt8(currentindex) != 0 && currentindex < serverResponse.length){
        playerNameString.push(asciiResponse.charAt(currentindex))
        currentindex++
      }
  
      currentPlayer.name = playerNameString.join('')
      currentindex++

      //frags
      currentPlayer.frags = serverResponse.readUInt16LE(currentindex)
      currentindex += 2

      //ping
      currentPlayer.ping = serverResponse.readUInt32LE(currentindex)
      currentindex += 4

      //team
      if(serverResponse.ctfMode || serverResponse.teamPlay){

        currentPlayer.team = serverResponse.readUInt8(currentindex)
        currentindex++

      }else{
        currentPlayer.team = 3
      }

      serverInfo.playersList.push(currentPlayer)

    }

    //PWAD MD5 hashes
    for(let i = 0; i < serverInfo.wadCount; i++){

      let currentMD5String = []

      while(serverResponse.readUInt8(currentindex) != 0 && currentindex < serverResponse.length){
        currentMD5String.push(asciiResponse.charAt(currentindex))
        currentindex++
      }
  
      serverInfo.pwadMD5hashes.push(currentMD5String.join(''))
      currentindex++

    }

    //server website
    let websiteString = []

    while(serverResponse.readUInt8(currentindex) != 0 && currentindex < serverResponse.length){
      websiteString.push(asciiResponse.charAt(currentindex))
      currentindex++
    }

    serverInfo.serverWebsite = websiteString.join('')
    currentindex++


    //teams processing
    if(serverResponse.ctfMode || serverResponse.teamPlay){

      //teamplay/ctf limit
      serverInfo.teamScoreLimit = serverResponse.readUInt32LE(currentindex)
      currentindex += 4

      //blue team
      serverInfo.blueTeam = (serverResponse.readUInt8(currentindex) == 1) ? true : false
      currentindex++

      if(serverInfo.blueTeam){
        serverInfo.blueScore = serverResponse.readUInt32LE(currentindex)
        currentindex += 4
      }

      //red team
      if(serverInfo.teamPlay){

        serverInfo.redTeam = (serverResponse.readUInt8(currentindex) == 1) ? true : false
        currentindex++

        if(serverInfo.redTeam){
          serverInfo.redScore = serverResponse.readUInt32LE(currentindex)
          currentindex += 4
        }

      }
      
      //gold team
      if(serverInfo.teamPlay){

        serverInfo.goldTeam = (serverResponse.readUInt8(currentindex) == 1) ? true : false
        currentindex++

        if(serverInfo.goldTeam){
          serverInfo.goldScore = serverResponse.readUInt32LE(currentindex)
          currentindex += 4
        }

      }

    }

    //protocol version
    serverInfo.protocolVersion = serverResponse.readUInt16LE(currentindex)
    currentindex += 2

    //admin email
    let adminEmailString = []

    while(serverResponse.readUInt8(currentindex) != 0 && currentindex < serverResponse.length){
      adminEmailString.push(asciiResponse.charAt(currentindex))
      currentindex++
    }

    serverInfo.adminEmail = adminEmailString.join('')
    currentindex++

    //time limit
    serverInfo.timeLimit = serverResponse.readUInt16LE(currentindex)
    currentindex += 2

    //time left
    serverInfo.timeLeft = serverResponse.readUInt16LE(currentindex)
    currentindex += 2

    //frag limit
    serverInfo.fragLimit = serverResponse.readUInt16LE(currentindex)
    currentindex += 2

    //item respawn
    serverInfo.itemRespawn = (serverResponse.readUInt8(currentindex) == 1) ? true : false
    currentindex++

    //weapon stay
    serverInfo.weaponStay = (serverResponse.readUInt8(currentindex) == 1) ? true : false
    currentindex++

    //friendly fire
    serverInfo.friendlyFire = (serverResponse.readUInt8(currentindex) == 1) ? true : false
    currentindex++

    //allow exit
    serverInfo.allowExit = (serverResponse.readUInt8(currentindex) == 1) ? true : false
    currentindex++

    //infinite ammo
    serverInfo.infiniteAmmo = (serverResponse.readUInt8(currentindex) == 1) ? true : false
    currentindex++

    //no monsters
    serverInfo.noMonsters = (serverResponse.readUInt8(currentindex) == 1) ? true : false
    currentindex++

    //monsters respawn
    serverInfo.monstersRespawn = (serverResponse.readUInt8(currentindex) == 1) ? true : false
    currentindex++

    //fast monsters
    serverInfo.fastMonsters = (serverResponse.readUInt8(currentindex) == 1) ? true : false
    currentindex++

    //allow jumping
    serverInfo.allowJumping = (serverResponse.readUInt8(currentindex) == 1) ? true : false
    currentindex++

    //allow freelook
    serverInfo.weaponStay = (serverResponse.readUInt8(currentindex) == 1) ? true : false
    currentindex++

    //wad download
    serverInfo.wadDownload = (serverResponse.readUInt8(currentindex) == 1) ? true : false
    currentindex++

    //empty reset
    serverInfo.emptyReset = (serverResponse.readUInt8(currentindex) == 1) ? true : false
    currentindex++

    //frag exit switch
    serverInfo.fragExitSwitch = (serverResponse.readUInt8(currentindex) == 1) ? true : false
    currentindex++

    //players stats (2 of 2 phases)
    for(let i = 0; i < serverInfo.inGamePlayers; i++){

      let currentPlayer = {
        killCount: 0,
        deathCount: 0,
        timeInGame: 0
      }

      //kill count
      currentPlayer.killCount = serverResponse.readUInt16LE(currentindex)
      currentindex += 2

      //death count
      currentPlayer.deathCount = serverResponse.readUInt16LE(currentindex)
      currentindex += 2

      //time in-game
      currentPlayer.timeInGame = serverResponse.readUInt16LE(currentindex)
      currentindex += 2

      Object.assign(serverInfo.playersList[i], currentPlayer) //rewrite data inside playerslist of phase 1

    }

    if(serverInfo.inGamePlayers == 0){
      currentindex++
    }

    currentindex += 4 //skip spectator field

    //max players
    serverInfo.maxPlayers = serverResponse.readUInt8(currentindex)

    if(serverInfo.maxPlayers <= 2 && serverInfo.gameType == 'Deathmatch'){
      serverInfo.gameType = 'Duel'
    }

    currentindex++

    //spectators
    for(let i = 0; i < serverInfo.inGamePlayers; i++){

      let isSpectator = (serverResponse.readUInt8(currentindex) == 1) ? true : false
      currentindex++

      Object.assign(serverInfo.playersList[i], {isSpectator: isSpectator}) //rewrite data inside playerslist of phase 1

    }

    if(serverInfo.inGamePlayers == 0){
      currentindex++ //skips no data for players
    }

    currentindex += 4 //skip extra information field

    //passworded
    serverInfo.passworded = (serverResponse.readUInt8(currentindex) == 1) ? true : false
    currentindex++

    //game version
    serverInfo.gameVersion = serverResponse.readUInt32LE(currentindex)

    //return object definition
    return serverInfo

  },

  //DEPRECATION WARNING: This function below is being deprecated due to the implementation of 'getInfofromSERVER_CHALLENGE', which is more precise than this reversed engineered way
  getInfofromLAUNCHER_CHALLENGE: (serverResponse, info) => { 

    let asciiResponse = serverResponse.toString('ascii')

    //maxplayers parsing
    let indexMaxplayers = serverResponse.indexOf('73765f6d6178706c617965727300', 'hex') + 15 //all spaces away from this string + 1
    let maxplayers = serverResponse.readUInt8(indexMaxplayers)

    //gametype parsing
    let indexGametype = asciiResponse.indexOf('sv_gametype') + 13
    let gametypeByte = serverResponse.readUInt8(indexGametype)
    let gametype = null

    if(gametypeByte == 0){
      gametype = 'Cooperative'
    }else if(gametypeByte == 1){
      gametype = (maxplayers <= 2) ? 'Deathmatch' : 'Duel'
    }else if(gametypeByte == 2){
      gametype = 'Team Deathmatch'
    }else if(gametypeByte == 3){
      gametype = 'Capture The Flag'
    }

    //hostname parsing
    let indexHostname = asciiResponse.indexOf('sv_hostname') + 13
    let hostnameString = []

    while(serverResponse.readUInt8(indexHostname) != 0 && indexHostname < serverResponse.length){
      hostnameString.push(asciiResponse.charAt(indexHostname))
      indexHostname++
    }

    hostnameString = hostnameString.join('')

    //IWAD parsing
    let indexIWAD = asciiResponse.indexOf('ODAMEX.WAD') + 28
    let iwadString = []

    while(serverResponse.readUInt8(indexIWAD) != 0 && indexIWAD < serverResponse.length){
      iwadString.push(asciiResponse.charAt(indexIWAD))
      indexIWAD++
    }

    iwadString = iwadString.join('')

    //PWAD parsing
    let indexPWAD = indexIWAD + 18
    let pwadString = []

    while(serverResponse.readUInt8(indexPWAD) != 0 && indexPWAD < serverResponse.length){
      pwadString.push(asciiResponse.charAt(indexPWAD))
      indexPWAD++
    }

    pwadString = pwadString.join('')

    //return object definition
    let serverInfo = {
      ip: info.address,
      port: info.port,
      gametype: gametype,
      maxplayers: maxplayers,
      hostname: hostnameString,
      iwad: iwadString,
      pwad: pwadString
    }

    return serverInfo

  }

}

export default gameserverparser