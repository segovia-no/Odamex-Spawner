let gameserverparser = {

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

  },

  getInGamePlayers: (serverResponse, info) => {

    let indexPlayersplaying = 10

    while(serverResponse.readUInt8(indexPlayersplaying) != 0 && indexPlayersplaying < serverResponse.length){
      indexPlayersplaying++
    }

    let serverInfo = {
      ip: info.address,
      port: info.port,
      ingameplayers: serverResponse.readUInt8(indexPlayersplaying + 1)
    }

    return serverInfo
    
  }

}

export default gameserverparser