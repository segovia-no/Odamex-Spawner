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

        fs.access(wadDirectory, (err) => {
          if(err){
            vueThis.createWADDirectory()
          }else{
            vueThis.checkCommercialWADS()
          }
        })

      },
      createWADDirectory(){

        let vueThis = this

        fs.mkdir(wadDirectory, { recursive: true }, (err) => {
          if(err){
            console.error(err)
          }

          vueThis.checkCommercialWADS()
        })

      },
      async checkCommercialWADS(){

        try{

          let WADfiles = await readdirAsync(wadDirectory)

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
      openURLExternalBrowser(URL){
        shell.openExternal(URL)
      }
    },
    mounted(){
      this.checkWADDirectory()
    }
  }
</script>

<style lang="scss" scoped>
  body {
    font-family: 'Source Sans Pro', sans-serif;
    overflow-x: hidden;
  }

  #odamexspawnerlogo{
    padding-left: 10px;
    margin-top: 15px;
    margin-bottom: 15px;
  }

  #sidebar-wrapper {
    background-color: #2d2d2d;
    border-right-color: #222;
    color: #eee;
    min-height: 100vh;
    margin-left: -15rem;
    -webkit-transition: margin .25s ease-out;
    -moz-transition: margin .25s ease-out;
    -o-transition: margin .25s ease-out;
    transition: margin .25s ease-out;
    -webkit-box-shadow: 7px 10px 20px 0px rgba(0,0,0,0.1);
    -moz-box-shadow: 7px 10px 20px 0px rgba(0,0,0,0.1);
    box-shadow: 7px 10px 20px 0px rgba(0,0,0,0.1);
    z-index: 999;
    overflow-x: visible;

    .sidebar-heading{
      margin-bottom: 30px;
    }

    a:hover{
      text-decoration: none !important;
    }

    .list-group-item{
      color: #ddd;
      background-color: #2d2d2d;
      transition: all 0.2s;

      &:hover{
        background-color: #444;
      }
    }

    .router-link-exact-active .list-group-item{
      margin-right: -7px;
      color: #303030;
      background-color: #e3e7ea;
      border-left: 6px solid #EF5435;
      -webkit-box-shadow: 4px 6px 21px 0px rgba(0,0,0,0.18);
      -moz-box-shadow: 4px 6px 21px 0px rgba(0,0,0,0.18);
      box-shadow: 4px 6px 21px 0px rgba(0,0,0,0.18);
    }
  }

  #sidebar-wrapper .sidebar-heading {
    padding: 0.875rem 1.25rem;
    font-size: 1.2rem;
  }

  #sidebar-wrapper .list-group {
    width: 15rem;
  }

  .navbar{
    background-color: #222;
    -webkit-box-shadow: 0px 10px 20px 0px rgba(0,0,0,0.11);
    -moz-box-shadow: 0px 10px 20px 0px rgba(0,0,0,0.11);
    box-shadow: 0px 10px 20px 0px rgba(0,0,0,0.11);
  }

  #menu-toggle{
    background-color: #ddd;

    &:hover{
      background-color: #c8c8c8;
    }

    span{
      color: #333;
    }
  }

  #page-content-wrapper {
    background-color: #ECF1F5;
    min-width: 100vw;
  }

  #wrapper.toggled #sidebar-wrapper {
    margin-left: 0;
  }

  .missingwadtext{
    font-size: 14px;
    padding-bottom: 5px;
    border-bottom: 3px solid #EF5435;
  }

  ul{
    list-style-type: none;
  }

  @media (min-width: 768px) {
    #sidebar-wrapper {
      margin-left: 0;
    }

    #page-content-wrapper {
      min-width: 0;
      width: 100%;
    }

    #wrapper.toggled #sidebar-wrapper {
      margin-left: -15rem;
    }
  }
</style>
