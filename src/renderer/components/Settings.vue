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
                <font-awesome-icon icon="download" fixed-width /> Client versions
              </template>
              
              <b-card-title>
                <font-awesome-icon icon="download" fixed-width /> Client versions
              </b-card-title>

              <b-card-sub-title>
                Here you can see the installed and available versions of Odamex
              </b-card-sub-title>

              <b-list-group class="mt-3">

                <b-list-group-item v-for="(bin, index) in mergedBins" class="flex-column align-items-start">

                  <div class="d-flex w-100 justify-content-between">

                    <h5 class="mb-1">{{bin.name}}</h5>

                    <b-button-group size="sm">
                      <b-button v-if="!bin.downloaded" variant="primary"><font-awesome-icon icon="download" fixed-width /> Download</b-button>
                      <b-button v-if="bin.downloaded" variant="danger"><font-awesome-icon icon="times" fixed-width /> Delete</b-button>
                    </b-button-group>

                  </div>

                  <span>
                    <b-badge v-if="bin.kind == 'official'" variant="success" pill><font-awesome-icon icon="check-circle" fixed-width /> Official</b-badge>
                    <b-badge v-if="bin.kind == 'experimental'" variant="warning" pill><font-awesome-icon icon="flask" fixed-width /> Experimental</b-badge>
                    <b-badge v-if="bin.downloaded" variant="primary" pill><font-awesome-icon icon="download" fixed-width /> Downloaded</b-badge>
                    <b-badge v-if="!bin.downloaded" variant="secondary" pill><font-awesome-icon icon="cloud" fixed-width /> Not Downloaded</b-badge>
                  </span>
                  
                </b-list-group-item>

              </b-list-group>
              
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
            
            </b-tab>

            <!-- Server Settings -->
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

  import axios from 'axios'
  import os from 'os'
  import path from 'path'
  import fs from 'fs'
  import {lstatSync} from 'fs'
  import util from 'util'

  const binPath = path.join('./', 'odamexbin')
  const readdirAsync = util.promisify(fs.readdir)

  let parseXML = require('xml2js').parseString

  export default {
    name: 'settings',
    data(){
      return{
        repoBins: [],
        installedBins: [],
        mergedBins: []
      }
    },
    methods:{
      async getBinsfromRepo(){

        try{

          let response = await axios.get('https://storage.googleapis.com/spawner_repo')

          this.repoBins = []

          parseXML(response.data, (err, result) => {

            result.ListBucketResult.Contents.forEach(element => {
              
              let path = element.Key[0]

              //get official bins
              if(path.includes("clientbinaries/official/") && path !== "clientbinaries/official/"){

                let filepath = path.replace('clientbinaries/official/', '')


                if(os.platform() == 'win32' && path.includes("_win64")){ //windows

                    this.repoBins.push({
                      name: 'Odamex ' + filepath.replace('_win64.zip', ''),
                      url: filepath,
                      kind: 'official'
                    })

                }else if(os.platform() == 'darwin' && path.includes("_macos")){ //macos

                    this.repoBins.push({
                      name: 'Odamex ' + filepath.replace('macos.zip', ''),
                      url: filepath,
                      kind: 'official'
                    })

                }
                
              }

              //get experimental bins
              if(path.includes("clientbinaries/experimental/") && path !== "clientbinaries/experimental/"){

                let filepath = path.replace('clientbinaries/experimental/', '')


                if(os.platform() == 'win32' && path.includes("_win64")){ //windows

                    this.repoBins.push({
                      name: 'Odamex ' + filepath.replace('_win64.zip', ''),
                      url: filepath,
                      kind: 'experimental'
                    })

                }else if(os.platform() == 'darwin' && path.includes("_macos")){ //macos

                    this.repoBins.push({
                      name: 'Odamex ' + filepath.replace('macos.zip', ''),
                      url: filepath,
                      kind: 'experimental'
                    })

                }
                
              }

            })

          })
          
        }catch(err){
          console.log(err)
        }

      },
      async listInstalledBins(){
        try{

          let binDirs = await readdirAsync(binPath)

          this.installedBins = []

          binDirs.forEach(binDir => {

            let relPath = path.join(binPath, binDir)

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
      mergeVersions(){

        this.mergedBins = []

        this.installedBins.forEach(installed => {

          let indexFound = this.mergedBins.findIndex(merged => {return merged.name == installed.name})

          if(indexFound == -1){
            this.mergedBins.push(installed)
          }

        })

        this.repoBins.forEach(repo => {

          let indexFound = this.mergedBins.findIndex(merged => {return merged.name == repo.name})

          if(indexFound == -1){

            this.mergedBins.push(repo)

          }else{

            this.mergedBins[indexFound] = Object.assign(this.mergedBins[indexFound], repo)

          }

        })
        
      }
    },
    async mounted(){
      await this.listInstalledBins()
      await this.getBinsfromRepo()
      this.mergeVersions()
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
