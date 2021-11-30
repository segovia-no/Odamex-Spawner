<template>
  <div id="insidewrapper">
    
    <h2 class="pageTitle">Odamex Demos 
      <b-button size="sm" variant="primary" @click="retrieveDemos()" class="float-right mt-1"><font-awesome-icon icon="sync" /> Refresh</b-button>
    </h2>

    <p><strong>Demo count:</strong> {{demoList.length}} | <strong>Total Size:</strong> {{totalSize}} MB</p>

    <b-input-group class="demoFilterInput" :class="{filtering: demoListFilter}" size="sm">

      <template v-slot:prepend>
        <b-input-group-text><font-awesome-icon icon="filter" />Filter</b-input-group-text>
      </template>

      <b-form-input v-model="demoListFilter"></b-form-input>

    </b-input-group>

    <!--All Demos table -->
    <b-table
      striped
      hover
      small
      bordered
      head-variant="dark"
      sticky-header="550px"
      :items="demoList" 
      :fields="demoFields"
      :filter="demoListFilter"
      :busy="(tableState != 'ok') ? true : false"
      selectable
      select-mode="single"
      @row-selected="showDemoInfo"
      > 

      <template v-slot:cell(name)="data">
        {{ data.item.demoName }}
      </template>

      <template v-slot:cell(gametype)="data">
        {{ data.item.gameType }}
      </template>
      
      <template v-slot:cell(version)="data">
        {{ data.item.clientVersion }}
      </template>

      <template v-slot:row-details="row">
        <b-card>

          <b-row>

            <b-col cols="10" class="serverInfo mt-2">
              <b-card-sub-title class="serverAddress">{{row.item.hostName}}</b-card-sub-title>
            </b-col>

            <b-col>
              <b-button size="sm" @click="playDemo" variant="outline-primary">
                <font-awesome-icon icon="play" fixed-width /> Play
              </b-button>
            </b-col>

          </b-row>

          <b-row class="mb-n2">

            <b-col class="serverInfo">
              <p><strong>POV: {{row.item.pov}}</strong></p>
              <b-badge v-if="row.item.gameType === 'Capture The Flag'" variant="info"><font-awesome-icon icon="flag" fixed-width /> CTF</b-badge>
              <b-badge v-else :variant="gameTypeColor(row.item)"><font-awesome-icon icon="users" fixed-width /> {{row.item.gameType}}</b-badge> 
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
  import binConfigManager from '@/libs/binconfigmanager.js'
  import DemoSettings from './settings/DemoSettings'
  import demoparser from '@/libs/demoparser.js'

  export default {
    name: 'demolist',
    data(){
      return{
        demoList: [],
        demoListFilter: null,
        tableState: 'loading',
        lastselectedDemoIndex: null,
        demoFields: [
        {
          key: 'demoName',
          label: 'Demo Name',
          sortable: true
        },
        {
          key: 'gameType',
          label: 'Type',
          sortable: true
        },
        {
          key: 'clientVersion',
          label: 'Version',
          sortable: true
        }
        ],
        demoSettings: {
          cl_autorecord: false,
          cl_splitnetdemos: false,
          cl_netdemoname: 'Odamex_%g_%d_%t_%w_%m'
        }
      }
    },
    computed:{
      totalSize(){
        if(this.demoList.length > 0){
          return this.demoList.reduce((acc, demo) => demo.fileSizeMB + acc, 0).toFixed(2)
        }else{
          return 0
        }
      }
    },
    methods:{
      open(link){
        this.$electron.shell.openExternal(link)
      },
      async retrieveDemos(){

        this.tableState = 'loading'
        this.demoList = []

        this.demoList = await demoparser.getDemosfromPath(this.$store.state.demoPath)
        this.tableState = 'ok'
           
      },
      showDemoInfo(demo){

        if(demo.length > 0){

          let newDemoIndex = this.demoList.findIndex(d => d.demoName === demo[0].demoName)

          this.connectPassword = null
          this.selectedDemo = demo[0]
          demo[0]._showDetails = true
          
          //close old selected demo
          if(this.lastselectedDemoIndex != -1 && this.lastselectedDemoIndex != null){
            this.demoList[this.lastselectedDemoIndex]._showDetails = false
          }

          this.lastselectedDemoIndex = newDemoIndex

        }
        
      },
      playDemo(){
        let connectParam = ["-netplay", this.$store.state.demoPath + "/" + this.selectedDemo.demoName]
        this.$store.dispatch('connecttoServer', connectParam)
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
      this.retrieveDemos()
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

  .demoFilterInput{
    margin-bottom: 10px;

    &.filtering{
      .input-group-text{
        color: #eee;
        background-color: #444444;
      }
    }
  }

</style>
