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

    switch(gametypeByte) {
      case 0:
        serverInfo.gameType = 'Cooperative'
        break
      case 1:
        serverInfo.gameType = 'Deathmatch'
        break
      case 2:
        serverInfo.gameType = 'Team Deathmatch'
        break
      case 3:
        serverInfo.gameType = 'Capture The Flag'
      break
    }

    currentindex++

    //skill level
    let skilllevel = serverResponse.readUInt8(currentindex)

    switch(skilllevel) {
      case 1:
        serverInfo.skillLevel = "I'm too young to die"
        break
      case 2:
        serverInfo.skillLevel = "Hey, not too rough"
        break
      case 3:
        serverInfo.skillLevel = "Hurt me plenty"
        break
      case 4:
        serverInfo.skillLevel = "Ultra-Violence"
      break
      case 5:
        serverInfo.skillLevel = "Nightmare!"
        break
    }

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
    let indexExtrainfo = serverResponse.indexOf("05030201", 0, "hex")
    serverInfo.passworded = (serverResponse.readUInt8(indexExtrainfo + 4)) ? true : false
    currentindex++

    //game version
    serverInfo.gameVersion = serverResponse.readUInt32LE(indexExtrainfo + 7)

    //return object definition
    return serverInfo

  }

}

export default gameserverparser