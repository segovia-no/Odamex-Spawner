<template>
  <div id="insidewrapper">
    
    <h2 class="pageTitle">Server List <b-button size="sm" @click="retrieveServerIPS()"><font-awesome-icon icon="sync" /></b-button></h2>

    <p>Server count: {{serverList.length}}</p>

    <b-input-group class="serverFilterInput" :class="{filtering: serverListfilter}" size="sm">

      <template v-slot:prepend>
        <b-input-group-text><font-awesome-icon icon="filter" />Filter</b-input-group-text>
      </template>

      <b-form-input v-model="serverListfilter"></b-form-input>

    </b-input-group>

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
      @row-selected="connectToGameServer"
    >

      <template v-slot:cell(fulladdress)="data">
        {{ data.item.ip }}:{{ data.item.port }}
      </template>

      <template v-slot:cell(playeroccupance)="data">
        {{ data.item.inGamePlayers }} / {{ data.item.maxClients }}
      </template>

      <template v-slot:cell(pwadList)="data">
        {{ data.item.pwadList.toString() }}
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

  import masterserverparser from '@/libs/masterserverparser.js'
  import gameserverparser from '@/libs/gameserverparser.js'

  //declare socket configs 
  let socket

  //master server ip
  let masterServer = '208.97.140.174'
  let masterServer2 = '64.62.190.251'

  let SERVER_CHALLENGE = Buffer.from('a3db0b00', 'hex')
  let LAUNCHER_CHALLENGE = Buffer.from('021001ad510000000800000000000000', 'hex')

  //launcher setup
  let child = require('child_process').execFile
  let executablePath = "./odamexbin/odamex.exe"

  export default {
    name: 'serverlist',
    data(){
      return{
        serverIPS: [],
        serverList: [],
        serverListfilter: null,
        tableState: 'loading',
        serverFields:[
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
      retrieveServerIPS(){
        this.tableState = 'loading'
        this.serverList = []
        socket.send(SERVER_CHALLENGE, 15000, masterServer)
        socket.send(SERVER_CHALLENGE, 15000, masterServer2)
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

</style>
