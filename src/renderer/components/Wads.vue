<template>
  <div id="insidewrapper">
    
    <h2 class="pageTitle">Downloaded WAD's 
      <b-button size="sm" variant="success" class="float-right mt-1" disabled><font-awesome-icon icon="plus" /> Get More!</b-button>
      <b-button size="sm" variant="primary" class="float-right mt-1 mr-1"><font-awesome-icon icon="file-upload" /> Import</b-button>
      <b-button @click="loadWads()"size="sm" variant="secondary" class="float-right mt-1 mr-1"><font-awesome-icon icon="sync" /> Refresh</b-button>
    </h2>

    <p>WAD count: {{wadsList.length}}</p>

    <b-row class="mt-3 mb-3">
      <b-col sm="12">

        <b-list-group class="wadlistcontainer">

          <b-list-group-item v-for="(wad, index) in wadsList" class="flex-column align-items-start">
            <div class="d-flex w-100 justify-content-between">
                
              <h5 class="mb-1">
                {{wad.filename}}
                
                <span v-if="wad.validCommercialChecksum == true" class="checksumicon valid"><font-awesome-icon icon="check-circle" fixed-width/> Valid Checksum</span>
                <span v-if="wad.validCommercialChecksum == false" class="checksumicon invalid"><font-awesome-icon icon="times-circle" fixed-width /> Invalid Checksum</span>

              </h5>

              <small>File</small>
            </div>

            <p class="mb-1">
              Filesize: {{wad.fileSizeMB}} MB
            </p>

            <small>
              <b-button size="sm" variant="secondary" class="float-right"><font-awesome-icon icon="edit" /> Rename</b-button>
              <b-button size="sm" variant="danger" class="float-right mr-1"><font-awesome-icon icon="times" /> Delete</b-button>
            </small>

          </b-list-group-item>

        </b-list-group>
             
      </b-col>
    </b-row>
    
  </div>
</template>

<script>

  import path from 'path'
  import fs from 'fs'
  import crypto from 'crypto'
  import util from 'util'

  const directoryPath = path.join('./', 'wads')
  const readdirAsync = util.promisify(fs.readdir)

  export default {
    name: 'wads',
    data(){
      return{
        wadsList: [],
        commercialWADS: [
          {
            name: 'DOOM.WAD',
            sha1: '9b07b02ab3c275a6a7570c3f73cc20d63a0e3833'
          },
          {
            name: 'DOOM2.WAD',
            sha1: '7ec7652fcfce8ddc6e801839291f0e28ef1d5ae7'
          },
          {
            name: 'PLUTONIA.WAD',
            sha1: '90361e2a538d2388506657252ae41aceeb1ba360'
          },
          {
            name: 'TNT.WAD',
            sha1: '9fbc66aedef7fe3bae0986cdb9323d2b8db4c9d3'
          },
          {
            name: 'SIGIL_V1_21.WAD',
            sha1: 'e2efdf379e1383c4e15c03de89063361897cd459'
          },
          {
            name: 'SIGIL_COMPAT_V1_21.WAD',
            sha1: 'b5e68950820b3a0385375dbace81376e73568207'
          }
        ]
      }
    },
    methods:{
      async loadWads(){

        try{

          this.wadsList = []
        
          let WADfiles = await readdirAsync(directoryPath) //read from ./wads
          
          for(let i = 0; i < WADfiles.length; i++){

            let relPath = path.join('./', 'wads', '/', WADfiles[i])

            //get only .wad extension
            let extension = path.extname(relPath)

            if(extension.toUpperCase() == '.WAD'){

              let newWAD = {
                filename: null,
                fileSizeMB: null
              }

              //get filename
              newWAD.filename = WADfiles[i]

              //get filesize
              let stats = fs.statSync(relPath)
              let fileSizeMB = stats["size"] / 1000000.0

              let indexComma = fileSizeMB.toString().indexOf('.')

              newWAD.fileSizeMB = fileSizeMB.toString().substring(0, indexComma + 3)

              //if commercial wad, check valid sha-1 for online play
              let comWADIndex = this.commercialWADS.findIndex(wad => wad.name == WADfiles[i].toUpperCase())

              if(comWADIndex != -1){

                let sha1 = await this.checkSHA1(relPath)

                if(sha1 == this.commercialWADS[comWADIndex].sha1){
                  newWAD.validCommercialChecksum = true
                }else{
                  newWAD.validCommercialChecksum = false
                }

              }

              //push wad to list
              this.wadsList.push(newWAD)

            }

          }

        }catch(e){
          console.log(e)
        }
      },
      checkSHA1(filePath){
        return new Promise(resolve => {

          const hash = crypto.createHash('sha1')
          fs.createReadStream(filePath).on('data', data => hash.update(data)).on('end', () => resolve(hash.digest('hex')))

        })
      }
    },
    mounted(){
      this.loadWads()
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

  .wadlistcontainer{
    overflow-y: auto;
    max-height: 600px;

    small > button{
      font-size: 12px;
    }

    .checksumicon{

      font-size: 12px;

      & > svg{
        font-size: 18px;
      }

      &.valid{
        color: var(--success);
      }

      &.invalid{
        color: var(--danger);
      }
    }

  }

</style>
