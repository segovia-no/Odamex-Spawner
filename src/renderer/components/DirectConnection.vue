<template>
  <div id="insidewrapper">
    
    <h2 class="pageTitle">Direct Connection</h2>

    <p>Enter the server IP and Port</p>

    <b-row class="mb-3">
      <b-col sm="12">

        <b-button-toolbar>
          
          <b-input-group class="ipinput mr-2" size="sm" prepend="IP Address" type="number">
            <b-form-input v-model="serverData.address" placeholder="ex: 45.255.255.255:10666"></b-form-input>
          </b-input-group>

          <b-button-group size="sm" class="mr-1">
            <b-button @click="retrieveGameServerInfo()" variant="primary">Get server</b-button>
          </b-button-group>

        </b-button-toolbar>
      
      </b-col>
    </b-row>

    <b-row class="mb-3">
      <b-col sm="12">

        <b-card :title="serverData.hostname" :sub-title="serverData.iwad">

          <b-card-text>
            <p><strong>MAP:</strong> {{serverData.currentMap}}</p>
            
          </b-card-text>

          <b-card-text>A second paragraph of text in the card.</b-card-text>

          <a href="#" class="card-link">Card link</a>
          <b-link href="#" class="card-link">Another link</b-link>

        </b-card>

      </b-col>
    </b-row>

    
  </div>
</template>

<script>
  import dgram from 'dgram'

  import masterserverparser from '@/libs/masterserverparser.js'
  import gameserverparser from '@/libs/gameserverparser.js'

  let socket

  let SERVER_CHALLENGE = Buffer.from('a3db0b00', 'hex')

  //launcher setup
  let child = require('child_process').execFile
  let executablePath = "./odamexbin/odamex.exe"

  export default {
    name: 'directconnection',
    data(){
      return{
        serverData:{
          address: '',
          password: '',
          hostname: '',
          iwad: ''
        },
      }
    },
    methods:{
      open(link){
        this.$electron.shell.openExternal(link)
      },
      retrieveGameServerInfo(){

        let ip = this.serverData.address.split(':')[0]
        let port = this.serverData.address.split(':')[1]

        socket.send(SERVER_CHALLENGE, port, ip)
      },
      saveGameServer(serverinfo){

        let indexFound = this.serverList.findIndex(server => {return server.ip == serverinfo.ip && server.port == serverinfo.port })

        if(indexFound == -1){
          this.serverList.push(serverinfo)
        }else{
          Object.assign(this.serverList[indexFound], serverinfo)
          this.serverList[indexFound].playeroccupance = this.serverList[indexFound].inGamePlayers + (0.001 * this.serverList[indexFound].maxPlayers) //precalcs virtual column of players
        }

        this.tableState = (this.serverList.length > 0) ? 'ok' : 'loading'
      },
      connectToGameServer(server){

        let connectParam = ["-connect", server[0].ip + ":" + server[0].port, "-waddir", "./odamexbin"]

        child(executablePath, connectParam, function(err, data){})
      }
    },
    mounted(){

      //socket init
      socket = dgram.createSocket('udp4')

      let vueThis = this
      let serverResponse

      //set listener
      socket.on('message', function(serverResponse, info){

        let parsedServer = gameserverparser.getInfofromSERVER_CHALLENGE(serverResponse, info)
        Object.assign(vueThis.serverData, parsedServer)

      })

    },
    beforeDestroy(){
      socket.close()
    }
  }
</script>

<style lang="scss">
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  #insidewrapper{
    margin: 20px;
  }

  .pageTitle{
    padding-bottom: 5px;
    border-bottom: 4px solid #fa8225;
  }

  .ipinput{
    min-width: 300px;
  }

</style>
