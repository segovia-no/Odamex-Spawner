<template>
  
  <b-list-group class="mt-3">

    <b-list-group-item v-for="(bin, index) in mergedBins" class="flex-column align-items-start">

      <div class="d-flex w-100 justify-content-between">

        <h5 class="mb-1">{{bin.name}}</h5>

        <b-button-group size="sm">

          <b-button v-if="!bin.downloaded" :disabled="(bin._isDownloading) ? bin._isDownloading : false" @click="downloadBin(bin)" variant="primary">

            <span v-if="(bin._isDownloading) ? bin._isDownloading : false"><b-spinner small label="Downloading"></b-spinner> Downloading</span>

            <span v-else><font-awesome-icon icon="download" fixed-width /> Download</span>
            
          </b-button>

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

</template>

<script>

import axios from 'axios'
import os from 'os'
import path from 'path'
import fs from 'fs'
import {lstatSync} from 'fs'
import util from 'util'
import https from 'https'
import unzipper from 'unzipper'
import folders from '@/libs/folders.js'

const readdirAsync = util.promisify(fs.readdir)

let parseXML = require('xml2js').parseString

export default {
  name: 'clientversions',
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

          result.ListBucketResult.Contents.slice().reverse().forEach(element => { //sort by last version
            
            let path = element.Key[0]

            //get official bins
            if(path.includes("clientbinaries/official/") && path !== "clientbinaries/official/"){

              let filepath = path.replace('clientbinaries/official/', '')


              if(os.platform() == 'win32' && path.includes("_win64")){ //windows

                  this.repoBins.push({
                    name: 'Odamex ' + filepath.replace('_win64.zip', ''),
                    filename: filepath,
                    foldername: filepath.replace('_win64.zip', ''),
                    url: path,
                    kind: 'official'
                  })

              }else if(os.platform() == 'darwin' && path.includes("_macos")){ //macos

                  this.repoBins.push({
                    name: 'Odamex ' + filepath.replace('macos.dmg', ''),
                    filename: filepath,
                    foldername: filepath.replace('macos.dmg', ''),
                    url: path,
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
                    filename: filepath,
                    foldername: filepath.replace('_win64.zip', ''),
                    url: path,
                    kind: 'experimental'
                  })

              }else if(os.platform() == 'darwin' && path.includes("_macos")){ //macos

                  this.repoBins.push({
                    name: 'Odamex ' + filepath.replace('macos.dmg', ''),
                    filename: filepath,
                    foldername: filepath.replace('macos.dmg', ''),
                    url: path,
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

          this.mergedBins[indexFound] = Object.assign(this.mergedBins[indexFound], repo, {_isDownloading : false})

        }

      })
      
    },
    async downloadBin(binObject){
      try{

        //set download state
        let indexFound = this.mergedBins.findIndex(binFromList => binFromList.url == binObject.url)

        if(indexFound != -1){
          this.$set(this.mergedBins[indexFound], '_isDownloading', true)
        }

        //download
        let downloadPath = path.join(this.$store.state.downloadsPath, binObject.filename)

        const file = fs.createWriteStream(downloadPath)

        const request = https.get("https://storage.googleapis.com/spawner_repo/" + binObject.url, (resp) => {  
          
          resp.pipe(file)
          .on('finish', () => {
            
            this.extractBin(binObject) //unextract zip file (for windows binaries)
            
            //TODO: install macOS binary 

          })

        })

      }catch(e){
        console.error(e)
      }
    },
    async extractBin(binObject){

      try{

        let downloadPath = path.join(this.$store.state.downloadsPath, binObject.filename)
        let newBinPath = path.join(this.$store.state.binPath, binObject.foldername)

        folders.checkDirectory(newBinPath)

        fs.createReadStream(downloadPath)

        .pipe(unzipper.Extract({ path: newBinPath}))

        .on('close', () => {

          //set download state
          let indexFound = this.mergedBins.findIndex(binFromList => binFromList.url == binObject.url)

          if(indexFound != -1){
            this.$set(this.mergedBins[indexFound], '_isDownloading', false)
            this.$set(this.mergedBins[indexFound], 'downloaded', true)
          }

          this.$store.dispatch('refreshBINSList') //refresh select version in navbar

        })

      }catch(e){
        console.error(e)
      }
    }
  },
  async mounted(){
    await this.listInstalledBins()
    await this.getBinsfromRepo()
    this.mergeVersions()
  }
}

</script>

<style lang="scss" scoped></style>
