let masterserverparser = {

  getIPS: (serverresponse) => {

    let serverIPS = []

    let start = 0

    while(start + 4 < serverresponse.length){

      let serverIPstring = ''

      for(let index = 0; index < 4; index++){

        serverIPstring += serverresponse.readUInt8(start + index)

        if(index != 3){
          serverIPstring += '.'
        }

      }

      serverIPS.push({
        ip: serverIPstring,
        port: serverresponse.readUInt16LE(start+4)
      })

      start += 6
    }

    return serverIPS

  }

}

export default masterserverparser