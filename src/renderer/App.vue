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
      </div>

      <!-- Page Content -->
      <div id="page-content-wrapper">

        <nav class="navbar navbar-expand-lg border-bottom">
          <button class="btn" id="menu-toggle" @click="toggledSidebar = !toggledSidebar"><font-awesome-icon icon="bars" /></button>

          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav ml-auto mt-2 mt-lg-0">
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  About
                </a>
                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                  <a class="dropdown-item" href="#">Action</a>
                  <a class="dropdown-item" href="#">Another action</a>
                  <div class="dropdown-divider"></div>
                  <a class="dropdown-item" href="#">Something else here</a>
                </div>
              </li>
            </ul>
          </div>
        </nav>

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

      <template v-slot:modal-footer="{ ok}">
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

  const readdirAsync = util.promisify(fs.readdir)

  const wadDirectory = path.join('./', 'wads')

  export default {
    name: 'odamexlauncher',
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
      checkWADDirectory(){

        let vueThis = this

        fs.access(this.$store.state.wadPath, (err) => {
          if(err){
            vueThis.createWADDirectory()
          }else{
            vueThis.checkCommercialWADS()
          }
        })

      },
      createWADDirectory(){

        let vueThis = this

        fs.mkdir(this.$store.state.wadPath, { recursive: true }, (err) => {
          if(err){
            console.error(err)
          }

          vueThis.checkCommercialWADS()
        })

      },
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
      checkBINDirectory(){

        let vueThis = this

        fs.access(this.$store.state.binPath, (err) => {
          if(err){
            vueThis.createBINDirectory()
          }else{
            vueThis.checkBINS()
          }
        })

      },
      createBINDirectory(){

        let vueThis = this

        fs.mkdir(this.$store.state.binPath, { recursive: true }, (err) => {
          if(err){
            console.error(err)
          }

          vueThis.checkBINS()
        })

      },
      checkBINS(){

      },
      openURLExternalBrowser(URL){
        shell.openExternal(URL)
      }
    },
    mounted(){
      this.checkWADDirectory()
      this.checkBINDirectory()
    }
  }
</script>

<style lang="scss" src="./App.scss" scoped></style>
