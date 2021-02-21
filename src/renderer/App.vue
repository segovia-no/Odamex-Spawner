<template>
  <div id="app">

    <div class="d-flex" id="wrapper" :class="{toggled: toggledSidebar}">

      <!-- Sidebar -->
      <div class="border-right" id="sidebar-wrapper">

        <img id="odamexspawnerlogo" src="@/assets/logo.png" alt="OdamexSpawner" width="205">

        <div class="list-group list-group-flush">
          <router-link :to="'/'">
            <a href="#" class="list-group-item list-group-item-action"><font-awesome-icon icon="server" fixed-width class="mr-1" /> Server List</a>
          </router-link>
          <router-link :to="'/directconnection'">
            <a href="#" class="list-group-item list-group-item-action"><font-awesome-icon icon="plug" fixed-width class="mr-1" /> Direct Connection</a>
          </router-link>
          <router-link :to="'/singleplayer'">
            <a href="#" class="list-group-item list-group-item-action"><font-awesome-icon icon="user" fixed-width class="mr-1" /> Single Player</a>
          </router-link>
          <router-link :to="'/wads'">
            <a href="#" class="list-group-item list-group-item-action"><font-awesome-icon icon="box-open" fixed-width class="mr-1" /> WAD's</a>
          </router-link>
          <router-link :to="'/settings'">
            <a href="#" class="list-group-item list-group-item-action"><font-awesome-icon icon="cogs" fixed-width class="mr-1" /> Settings</a>
          </router-link>
          <router-link :to="'/community'">
            <a href="#" class="list-group-item list-group-item-action"><font-awesome-icon icon="share-alt" fixed-width class="mr-1" /> Community</a>
          </router-link>
          <router-link :to="'/development'">
            <a href="#" class="list-group-item list-group-item-action"><font-awesome-icon icon="code" fixed-width class="mr-1" /> Development</a>
          </router-link>
        </div>

        <div id="social">
            <img class="mr-2 pointer" @click="openURLExternalBrowser('https://discord.gg/aMUzcZE')" src="@/assets/discord.png" alt="Discord" width="28">
            <img class="mr-2 pointer" @click="openURLExternalBrowser('https://twitter.com/Odamex')" src="@/assets/twitter.png" alt="Twitter" width="25">
            <img class="pointer" @click="openURLExternalBrowser('https://steamcommunity.com/groups/odamex')" src="@/assets/steam.png" alt="Steam" width="25">
        </div>

      </div>
  
      <div id="page-content-wrapper">

        <!-- Navbar -->
        <b-navbar class="border-bottom" type="dark">

          <button class="btn" id="menu-toggle" @click="toggledSidebar = !toggledSidebar"><font-awesome-icon icon="bars" /></button>

          <b-navbar-nav class="ml-auto">

            <b-nav-item-dropdown right>

              <template v-slot:button-content>
                <em><font-awesome-icon icon="code-branch" /> <strong>Version:</strong> {{getSelectedOdamexVersion}}</em>
              </template>

              <b-dropdown-item v-for="(bin, index) in this.$store.state.installedBins" @click="setDefaultBIN(bin)" :index="index">
                {{bin}}
              </b-dropdown-item>

            </b-nav-item-dropdown>

          </b-navbar-nav>

        </b-navbar>


        <!-- Page content -->
        <div id="content-wrapper" class="container-fluid">
          <router-view></router-view>
        </div>
      </div>

    </div>

    <!-- Modal: Missing recommended wads -->
    <b-modal 
      id="missingwadsmodal" 
      title="Missing Recommended WAD's"
      header-bg-variant="dark"
      header-text-variant="light"
      >

      <p class="missingwadtext">You're missing these recommended commercial WAD's. To have a great experience make sure you own a copy of the missing wads and import it via the WAD's menu</p>

      <b-list-group>

        <b-list-group-item v-for="(wad, index) in missingWADS" :index="index" class="d-flex justify-content-between align-items-center">
          <strong>{{wad.name}}</strong>
          <b-button @click="openURLExternalBrowser(wad.steamURL)" size="sm" variant="primary"> Open in Steam store</b-button>
        </b-list-group-item>

      </b-list-group>

      <template v-slot:modal-footer="{ok}">
        <b-button variant="primary" @click="ok()"> Ok</b-button>
      </template>
    </b-modal>


  </div>
</template>

<script>

  import {mapActions} from 'vuex'

  import path from 'path'
  import fs from 'fs'
  import util from 'util'
  import { shell } from 'electron'
  import {lstatSync} from 'fs'
  import folders from '@/libs/folders.js'

  const readdirAsync = util.promisify(fs.readdir)

  const wadDirectory = path.join('./', 'wads')

  export default {
    name: 'odamexspawner',
    computed:{
      getSelectedOdamexVersion(){
        return this.$store.state.defaultBinPath
      }
    },
    data(){
      return{
        toggledSidebar: false,
        recommendedCommercialWADS:[
          {
            name: 'DOOM.WAD',
            steamURL: 'https://store.steampowered.com/app/2280/Ultimate_Doom/'
          },
          {
            name: 'DOOM2.WAD',
            steamURL: 'https://store.steampowered.com/app/2300/DOOM_II/'
          }
        ],
        missingWADS: []
      }
    },
    methods:{
      async checkCommercialWADS(){

        try{

          let WADfiles = await readdirAsync(this.$store.state.wadPath)

          WADfiles.forEach(wad => {
            wad = wad.toUpperCase()
          })

          this.missingWADS = []

          this.recommendedCommercialWADS.forEach(wad => {

            if(WADfiles.indexOf(wad.name) == -1){
              this.missingWADS.push(wad)
            }

          })

          if(this.missingWADS.length > 0){
            this.$root.$emit('bv::show::modal', 'missingwadsmodal')
          }
   
        }catch(err){
          console.error(err)
        }
      },
      async checkBINS(){
        try{

          let binDirs = await readdirAsync(this.$store.state.binPath)

          this.installedBins = []

          binDirs.forEach(binDir => {

            let relPath = path.join(this.$store.state.binPath, binDir)

            if(lstatSync(relPath).isDirectory()){
              this.installedBins.push({
                name: 'Odamex ' + binDir,
                filepath: relPath,
                downloaded: true
              })
            }

          })

        }catch(err){
          console.log(err)
        }
      },
      setDefaultBIN(binpath){
        this.$store.dispatch('setDefaultBIN', binpath)
      },
      openURLExternalBrowser(URL){
        shell.openExternal(URL)
      }
    },
    mounted(){
      folders.checkDirectory(this.$store.state.wadPath)
      folders.checkDirectory(this.$store.state.binPath)
      folders.checkDirectory(this.$store.state.downloadsPath)

      this.checkCommercialWADS()
      this.checkBINS()
      this.$store.dispatch('refreshBINSList')
    }
  }
</script>

<style lang="scss" src="./App.scss" scoped></style>
