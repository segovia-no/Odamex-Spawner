<template>

  <div v-if="!isLoading" class="mt-3">

    <b-input-group prepend="Demos Folder" size="sm" class="mt-3 mb-2">
      <b-form-input readonly :value="getDemosFolder"/>
      <b-input-group-append>
        <b-button @click="openBrowseFolderWindow()" variant="primary">Browse</b-button>
      </b-input-group-append>
    </b-input-group>

    <b-input-group size="sm" prepend="Autorecord Demos" class="mb-2">
      <b-form-select v-model="demoSettings.cl_autorecord" :options="autorecordOptions"></b-form-select>
    </b-input-group>

    <b-input-group size="sm" prepend="Split Demos" class="mb-2">
      <b-form-select v-model="demoSettings.cl_splitnetdemos" :options="splitOptions"></b-form-select>
    </b-input-group>

    <b-input-group size="sm" prepend="Demo Format" class="mb-2">
      <b-form-input v-model="demoSettings.cl_netdemoname"></b-form-input>
    </b-input-group>


    <b-button @click="saveSettings()" variant="success" class="float-right mt-3 mb-4"><font-awesome-icon icon="save" fixed-width /> Save settings</b-button>

  </div>

  <div v-else class="text-center my-2">

    <b-spinner class="align-middle"></b-spinner>
    <strong>Loading</strong>

  </div>

</template>

<script>

import binConfigManager from '@/libs/binconfigmanager.js'

const { dialog } = require('electron').remote

export default {
  name: 'demosettings',
  data(){
    return {
      isLoading: true,
      demoSettings: {
        cl_autorecord: false,
        cl_splitnetdemos: false,
        cl_netdemoname: 'Odamex_%g_%d_%t_%w_%m',
      },
      autorecordOptions: [
        {text: 'Yes', value: true},
        {text: 'No', value: false}
      ],
      splitOptions: [
        {text: 'Yes', value: true},
        {text: 'No', value: false}
      ]
    }
  },
  methods:{
    async openBrowseFolderWindow(){

      let chosenPath = await dialog.showOpenDialog({properties: ['openDirectory']})

      this.$store.dispatch('setDefaultDemosFolder', chosenPath.filePaths[0])

    },

    async readDemoSettingsFromCFGFile(){
      try{

        let loadedConfigs = await binConfigManager.readDemoSettings()

        Object.assign(this.demoSettings, loadedConfigs)

        this.isLoading = false

      }catch(err){
        console.log(err)
      }
    },

    async saveSettings(){
      try{

        let parsedSettings = {
          cl_autorecord: (this.demoSettings.cl_autorecord) ? '1' : '0',
          cl_splitnetdemos: (this.demoSettings.cl_splitnetdemos) ? '1' : '0',
          cl_netdemoname: this.demoSettings.cl_netdemoname,
        }

        await binConfigManager.saveCFG(parsedSettings)

        await this.readDemoSettingsFromCFGFile()

        this.$bvToast.toast(`Settings Saved`, {
          title: 'Odamex Spawner',
          autoHideDelay: 3000,
          appendToast: true,
          variant: 'success'
        })

      }catch(err){
        console.log(err)
      }
    }

  },
  computed:{

    getDemosFolder: function(){
      return this.$store.state.demoPath
    }
    
  },
  mounted(){
    this.readDemoSettingsFromCFGFile()
  }
}
</script>

<style lang="scss" scoped></style>