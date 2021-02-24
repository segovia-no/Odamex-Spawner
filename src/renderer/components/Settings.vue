<template>
  <div id="insidewrapper">
    
    <h2 class="pageTitle">Settings</h2>

    <b-row class="mt-4 mb-3">
      <b-col sm="12">

        <b-card no-body>
          <b-tabs pills card vertical>

            <!-- Game Versions -->
            <b-tab active>

              <template v-slot:title>
                <font-awesome-icon icon="code-branch" fixed-width /> Client versions
              </template>
              
              <b-card-title>
                <font-awesome-icon icon="code-branch" fixed-width /> Client versions
              </b-card-title>

              <b-card-sub-title>
                Here you can see the installed and available versions of Odamex
              </b-card-sub-title>

              <ClientVersions />
              
            </b-tab>

            <!-- Player Settings -->
            <b-tab>

              <template v-slot:title>
                <font-awesome-icon icon="user" fixed-width /> Player settings
              </template>
                         
              <b-card-title>
                <font-awesome-icon icon="user" fixed-width /> Player settings
              </b-card-title>

              <b-card-sub-title>
                Set your nickname, color and preffered team
              </b-card-sub-title>

              <PlayerSettings />
            
            </b-tab>

            <!-- Game Settings -->
            <b-tab>

              <template v-slot:title>
                <font-awesome-icon icon="cogs" fixed-width /> Game settings
              </template>
                         
              <b-card-title>
                <font-awesome-icon icon="cogs" fixed-width /> Game settings
              </b-card-title>

              <b-card-sub-title>
                Adjust your resolution, visual preset and control settings
              </b-card-sub-title>

              <GameSettings />
            
            </b-tab>

            <!-- WADS Settings -->
            <b-tab>

              <template v-slot:title>
                <font-awesome-icon icon="box-open" fixed-width /> WAD's Settings
              </template>
                         
              <b-card-title>
                <font-awesome-icon icon="box-open" fixed-width /> WAD's Settings
              </b-card-title>

              <b-card-sub-title>
                Configure the WAD's folders
              </b-card-sub-title>

              <WADSSettings />
            
            </b-tab>

            <!-- Demo Settings -->
            <b-tab>

              <template v-slot:title>
                <font-awesome-icon icon="box-open" fixed-width /> Demo Settings
              </template>

              <b-card-title>
                <font-awesome-icon icon="box-open" fixed-width /> Demo Settings
              </b-card-title>

              <b-card-sub-title>
                Configure demo settings
              </b-card-sub-title>

              <DemoSettings />

            </b-tab>
            <!-- Server/repo Settings -->
            <b-tab>

              <template v-slot:title>
                <font-awesome-icon icon="server" fixed-width /> Server/Repo settings
              </template>
                         
              <b-card-title>
                <font-awesome-icon icon="server" fixed-width /> Server/Repo settings
              </b-card-title>

              <b-card-sub-title>
                Set your master servers and content repo
              </b-card-sub-title>
            
            </b-tab>

          </b-tabs>
        </b-card>

      </b-col>
    </b-row>

  </div>
</template>

<script>

  import ClientVersions from './settings/ClientVersions'
  import PlayerSettings from './settings/PlayerSettings'
  import GameSettings from './settings/GameSettings'
  import WADSSettings from './settings/WADSSettings'
  import DemoSettings from './settings/DemoSettings'
  
  export default {
    name: 'settings',
    components:{
      ClientVersions,
      PlayerSettings,
      GameSettings,
      WADSSettings,
      DemoSettings
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

</style>
