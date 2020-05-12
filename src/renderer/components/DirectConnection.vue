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
            <b-button @click="retrieveGameServerInfo()" :disabled="!isValidIP" variant="primary">Get server</b-button>
          </b-button-group>

        </b-button-toolbar>
      
      </b-col>
    </b-row>

    <b-row class="mb-3">
      <b-col sm="12">

        <b-card v-if="madefirstconnection">

          <b-row>

            <b-col xl="7" lg="6" md="12" class="serverInfo">
              <b-card-title>{{serverData.hostname}}</b-card-title>
              <b-card-sub-title class="mb-2 serverAddress">{{serverData.ip}}:{{serverData.port}}</b-card-sub-title>
              <p><strong>{{ serverData.inGamePlayers }} out of {{ serverData.maxClients }} Players</strong></p>
              <p><strong>MAP: {{ serverData.currentMap}}</strong></p>
              <p><strong>IWAD: {{ serverData.iwad}}</strong></p>

              <b-badge v-if="!serverData.ctfMode" :variant="gameTypeColor"><font-awesome-icon icon="users" fixed-width /> {{(serverData.teamPlay && serverData.gameType == 'Deathmatch') ? 'Team Deathmatch' : serverData.gameType}}</b-badge>
              <b-badge v-if="serverData.ctfMode" variant="info"><font-awesome-icon icon="flag" fixed-width /> CTF</b-badge>
              <b-badge v-if="serverData.friendlyFire" variant="warning"><font-awesome-icon icon="crosshairs" fixed-width /> Friendly Fire</b-badge>
              <b-badge v-if="serverData.fastMonsters" variant="danger"><font-awesome-icon icon="running" fixed-width /> Fast Monsters</b-badge>
              <b-badge v-if="serverData.passworded" variant="secondary"><font-awesome-icon icon="key" fixed-width /> Passworded</b-badge>
              <b-badge v-if="serverData.infiniteAmmo" variant="success"><font-awesome-icon icon="infinity" fixed-width /> Infinite Ammo</b-badge>
              <b-badge v-if="serverData.wadDownload" variant="dark"><font-awesome-icon icon="box-open" fixed-width /> WAD Downloads</b-badge>

            </b-col>

            <b-col xl="5" lg="6" md="12">

              <div v-if="!serverData.passworded">
                <b-button @click="connectToGameServer" variant="primary" class="float-right">Connect <font-awesome-icon :icon="(!serverData.passworded) ? 'plug' : 'key'" fixed-width /></b-button>
              </div>

              <div v-if="serverData.passworded" class="w-100">
                <b-input-group prepend="Server password" size="sm" class="mb-3">
                  <b-form-input v-model="connectPassword" type="password"></b-form-input>
                </b-input-group>

                <b-button @click="connectToGameServer" :disabled="!connectPassword" variant="warning" class="float-right">Connect <font-awesome-icon icon="key" fixed-width /></b-button>
                
              </div>

            </b-col>

          </b-row>

        </b-card>

        <b-card v-else class="noserverretrievedcard">

          <font-awesome-icon icon="hand-pointer" size="2x" fixed-width />
          <h5 class="infotext">Write an IP and press "Get Server" to start</h5>

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
        connectPassword: null,
        madefirstconnection: false
      }
    },
    computed:{
      isValidIP(){

        let spllitedIP = this.serverData.address.split('.')

        if(spllitedIP.length != 4){ //regex didn't catch the repeat expresion for some reason
          return false
        }
        
        let ipPatt1 = new RegExp("^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$") //ip without port
        let ipPatt2 = new RegExp("^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]):[0-9]+$") // ip with port

        if(ipPatt1.test(this.serverData.address) || ipPatt2.test(this.serverData.address)){
          return true
        }else{
          return false
        }

      },
      gameTypeColor(){

        if(this.serverData.gameType == 'Cooperative'){
          return 'success'

        }else if(this.serverData.gameType == 'Deathmatch'){

          if(this.serverData.teamPlay){
            return 'primary'
          }else{
            return 'warning'
          }

        }else if(this.serverData.gameType == 'Duel'){
          return 'info'
        }
      }
    },
    methods:{
      open(link){
        this.$electron.shell.openExternal(link)
      },
      retrieveGameServerInfo(){

        let ip, port

        if(this.serverData.address.indexOf(':') !== -1){

          ip = this.serverData.address.split(':')[0]
          port = this.serverData.address.split(':')[1]

        }else{

          ip = this.serverData.address
          port = 10666

        }

        socket.send(SERVER_CHALLENGE, port, ip)
      },
      connectToGameServer(){

        if(this.serverData.passworded){

          if(this.connectPassword != null){
            let connectParam = ["-connect", this.serverData.ip + ":" + this.serverData.port, this.connectPassword]
            this.$store.dispatch('connecttoServer', connectParam)
          }
          
        }else{

          let connectParam = ["-connect", this.serverData.ip + ":" + this.serverData.port]
          this.$store.dispatch('connecttoServer', connectParam)

        }

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
        vueThis.madefirstconnection = true

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

  .noserverretrievedcard > .card-body{

    background-color: #ECF1F5;
    text-align: center;
    color: var(--mainText);
    opacity: 0.7;
  
    & i{
      font-size: 1.7em;
      margin-top: 10px;
      margin-bottom: 15px;
    }
  
    & .infotext{
      font-size: 1em;
    }
    
  }

</style>
