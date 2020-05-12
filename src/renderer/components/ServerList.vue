<template>
  <div id="insidewrapper">
    
    <h2 class="pageTitle">Server List <b-button size="sm" variant="primary" @click="retrieveServerIPS()" class="float-right mt-1"><font-awesome-icon icon="sync" /> Refresh</b-button></h2>

    <p>Server count: {{serverList.length}}</p>

    <b-input-group class="serverFilterInput" :class="{filtering: serverListfilter}" size="sm">

      <template v-slot:prepend>
        <b-input-group-text><font-awesome-icon icon="filter" />Filter</b-input-group-text>
      </template>

      <b-form-input v-model="serverListfilter"></b-form-input>

    </b-input-group>

    <!--Server list table -->
    <b-table
      striped
      hover
      small
      bordered
      head-variant="dark"
      sticky-header="550px"
      :items="serverList" 
      :fields="serverFields"
      :filter="serverListfilter"
      :busy="(tableState != 'ok') ? true : false"
      selectable
      select-mode="single"
      @row-selected="showServerInfo"
    >

      <template v-slot:head(passworded)="data">
        <font-awesome-icon icon="key" fixed-width />
      </template>

      <template v-slot:cell(passworded)="data">
        <font-awesome-icon v-if="data.value" icon="key" fixed-width />
      </template>

      <template v-slot:cell(fulladdress)="data">
        {{ data.item.ip }}:{{ data.item.port }}
      </template>

      <template v-slot:cell(playeroccupance)="data">
        {{ data.item.inGamePlayers }} / {{ data.item.maxClients }}
      </template>

      <template v-slot:cell(pwadList)="data">
        {{ data.item.pwadList.toString() }}
      </template>

      <template v-slot:row-details="row">
        <b-card>

          <b-row>

            <b-col xl="7" lg="6" md="12" class="serverInfo">
              <b-card-title>{{row.item.hostname}}</b-card-title>
              <b-card-sub-title class="mb-2 serverAddress">{{row.item.ip}}:{{row.item.port}}</b-card-sub-title>
              <p><strong>{{ row.item.inGamePlayers }} out of {{ row.item.maxClients }} Players</strong></p>
              <p><strong>MAP: {{ row.item.currentMap}}</strong></p>
              <p><strong>IWAD: {{ row.item.iwad}}</strong></p>

              <b-badge v-if="!row.item.ctfMode" :variant="gameTypeColor(row.item)"><font-awesome-icon icon="users" fixed-width /> {{(row.item.teamPlay && row.item.gameType == 'Deathmatch') ? 'Team Deathmatch' : row.item.gameType}}</b-badge>
              <b-badge v-if="row.item.ctfMode" variant="info"><font-awesome-icon icon="flag" fixed-width /> CTF</b-badge>
              <b-badge v-if="row.item.friendlyFire" variant="warning"><font-awesome-icon icon="crosshairs" fixed-width /> Friendly Fire</b-badge>
              <b-badge v-if="row.item.fastMonsters" variant="danger"><font-awesome-icon icon="running" fixed-width /> Fast Monsters</b-badge>
              <b-badge v-if="row.item.passworded" variant="secondary"><font-awesome-icon icon="key" fixed-width /> Passworded</b-badge>
              <b-badge v-if="row.item.infiniteAmmo" variant="success"><font-awesome-icon icon="infinity" fixed-width /> Infinite Ammo</b-badge>
              <b-badge v-if="row.item.wadDownload" variant="dark"><font-awesome-icon icon="box-open" fixed-width /> WAD Downloads</b-badge>

            </b-col>

            <b-col xl="5" lg="6" md="12">

              <div v-if="!row.item.passworded">
                <b-button @click="connectToGameServer" variant="primary" class="float-right">Connect <font-awesome-icon :icon="(!selectedServer.passworded) ? 'plug' : 'key'" fixed-width /></b-button>
              </div>

              <div v-if="row.item.passworded" class="w-100">
                <b-input-group prepend="Server password" size="sm" class="mb-3">
                  <b-form-input v-model="connectPassword" type="password"></b-form-input>
                </b-input-group>

                <b-button @click="connectToGameServer" :disabled="!connectPassword" variant="warning" class="float-right">Connect <font-awesome-icon icon="key" fixed-width /></b-button>
                
              </div>

            </b-col>

          </b-row>

        </b-card>
      </template>

      <template v-slot:table-busy>
        <div class="text-center my-2">
          <b-spinner class="align-middle"></b-spinner>
          <strong>Loading...</strong>
        </div>
      </template>

    </b-table>
    
  </div>
</template>

<script>
  import dgram from 'dgram'

  import apiparser from '@/libs/apiparser.js'
  import masterserverparser from '@/libs/masterserverparser.js'
  import gameserverparser from '@/libs/gameserverparser.js'

  import { mapActions } from 'vuex'

  //declare socket configs 
  let socket

  //master server ip
  let masterServer = '208.97.140.174'
  let masterServer2 = '64.62.190.251'

  let SERVER_CHALLENGE = Buffer.from('a3db0b00', 'hex')
  let LAUNCHER_CHALLENGE = Buffer.from('021001ad510000000800000000000000', 'hex')

  export default {
    name: 'serverlist',
    data(){
      return{
        retrieveMode: 'manual',
        serverIPS: [],
        serverList: [],
        serverListfilter: null,
        tableState: 'loading',
        lastselectedServerIndex: null,
        selectedServer: {
          ip: null,
          port: null,
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
        },
        connectPhase: 1,
        connectPassword: null,
        serverFields:[
          {
            key: 'passworded',
            sortable: true
          },
          {
            key: 'hostname',
            label: 'Hostname',
            sortable: true
          },
          {
            key: 'fulladdress',
            label: 'IP',
            sortable: true
          },
          { key: 'playeroccupance',
            label: 'Players',
            sortable: true
          },
          {
            key: 'gameType',
            label: 'Type',
            sortable: true
          },
          {
            key: 'pwadList',
            label: "PWAD's",
            sortable: true
          },
          {
            key: 'iwad',
            label: 'IWAD',
            sortable: true
          }
        ]
      }
    },
    methods:{
      open(link){
        this.$electron.shell.openExternal(link)
      },
      async retrieveServerIPS(){
        this.tableState = 'loading'
        this.serverList = []

        if(this.retrieveMode == 'manual'){
          socket.send(SERVER_CHALLENGE, 15000, masterServer)
          socket.send(SERVER_CHALLENGE, 15000, masterServer2)

        }else if(this.retrieveMode == 'api'){
          let response = await apiparser.getInfofromAPI('https://odamex.net/api/servers')
        }
        
      },
      saveServerIPS(ips, masterServerAddress){

        if(masterServerAddress == masterServer){
          this.serverIPS = ips
        }else{

          let strServers = JSON.stringify(ips)

          ips.forEach(ip =>{
            let regIP = JSON.stringify(ip)

            if(strServers.search(regIP) == -1){
              this.serverIPS.push(ip)
            }
          })
        }
        
        this.retrieveGameServerInfo()
      },
      retrieveGameServerInfo(){
        if(this.serverIPS.length > 0){
          this.serverIPS.forEach(server => {
            socket.send(SERVER_CHALLENGE, server.port, server.ip)
          })
        }
      },
      saveGameServer(serverinfo){

        let indexFound = this.serverList.findIndex(server => {return server.ip == serverinfo.ip && server.port == serverinfo.port })

        serverinfo.playeroccupance = serverinfo.inGamePlayers + (0.001 * serverinfo.maxPlayers) //precalcs virtual column of players

        if(indexFound == -1){
          this.serverList.push(serverinfo)
        }else{
          Object.assign(this.serverList[indexFound], serverinfo)
        }

        this.tableState = (this.serverList.length > 0) ? 'ok' : 'loading'
      },
      showServerInfo(server){

        if(server.length > 0){

          let newServerIndex = this.serverList.findIndex(srv => srv.hostname === server[0].hostname)

          this.connectPassword = null
          this.selectedServer = server[0]
          server[0]._showDetails = true
          
          //close old selected server
          if(this.lastselectedServerIndex != -1 && this.lastselectedServerIndex != null){
            this.serverList[this.lastselectedServerIndex]._showDetails = false
          }

          this.lastselectedServerIndex = newServerIndex

        }
        
      },
      connectToGameServer(){

        if(this.selectedServer.passworded){

          if(this.connectPassword != null){
            let connectParam = ["-connect", this.selectedServer.ip + ":" + this.selectedServer.port, this.connectPassword]
            this.$store.dispatch('connecttoServer', connectParam)
          }
          
        }else{

          let connectParam = ["-connect", this.selectedServer.ip + ":" + this.selectedServer.port]
          this.$store.dispatch('connecttoServer', connectParam)

        }

      },
      gameTypeColor(item){
        if(item.gameType == 'Cooperative'){
          return 'success'
        }else if(item.gameType == 'Deathmatch'){
          if(item.teamPlay){
            return 'primary'
          }else{
            return 'warning'
          }
        }else if(item.gameType == 'Duel'){
          return 'info'
        }
      }
    },
    mounted(){

      //init socket
      socket = dgram.createSocket('udp4')

      let vueThis = this
      let serverResponse

      //set listener
      socket.on('message', function(serverResponse, info){

        if(info.port == 15000){ //Response from Master Server

          vueThis.saveServerIPS(masterserverparser.getIPS(serverResponse), info.address)

        }else{ //Response from Game Server

          let hexResponse = serverResponse.toString('hex')

          if(hexResponse.indexOf('d4d65400') != -1){
            vueThis.saveGameServer(gameserverparser.getInfofromSERVER_CHALLENGE(serverResponse, info))
          }else{
            vueThis.saveGameServer(gameserverparser.getInfofromLAUNCHER_CHALLENGE(serverResponse, info)) 
          }
          
        }
 
      })

      //get server list
      this.retrieveServerIPS()

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

  .serverFilterInput{
    margin-bottom: 10px;

    &.filtering{
      .input-group-text{
        color: #eee;
        background-color: #444444;
      }
    }
  }

  th{
    font-size: 13px;
  }

  td{
    font-size: 13px;
    cursor: pointer;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to{
    opacity: 0;
  }

  .serverInfo{

    .serverAddress{
      border-bottom: 2px solid #fa8225;
      padding-bottom: 5px;
      margin-bottom: 15px;
    }

    p{
      margin-bottom: 3px;
    }

  }

</style>
