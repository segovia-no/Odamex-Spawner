<template>

  <div v-if="!isLoading" class="mt-3">

    <b-input-group size="sm" prepend="Resolution" class="mb-2">
      <b-form-select @change="selectRes" v-model="resSelect" :options="resOptions" />
    </b-input-group>


    <b-input-group v-if="resSelect == 'custom'" size="sm" prepend="Custom Resolution" class="pl-5 mb-3">

      <b-form-input v-model="gameSettings.vid_defwidth" type="number" min="320" step="1" placeholder="Width"></b-form-input>
      <b-form-input v-model="gameSettings.vid_defheight" type="number" min="240" step="1" placeholder="Height"></b-form-input>

    </b-input-group>


    <b-input-group size="sm" prepend="Display Mode" class="mb-2">
      <b-form-select v-model="gameSettings.vid_fullscreen" :options="displayOptions" />
    </b-input-group>


    <b-input-group size="sm" prepend="Max Framerate" class="mb-2">

      <b-form-input v-model="gameSettings.vid_maxfps" type="number" min="0" max="250" step="1"></b-form-input>

      <b-input-group-append v-if="displayFPS == 'Unlimited'" is-text>
        <span>Unlimited</span>
      </b-input-group-append>

    </b-input-group>


    <b-input-group size="sm" prepend="Download WAD's from Server" class="mb-2">
      <b-form-select v-model="gameSettings.cl_serverdownload" :options="srvDownOptions" />
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

export default {
  name: 'gamesettings',
  computed:{
    displayFPS(){
      return (this.gameSettings.vid_maxfps == 0) ? 'Unlimited' : this.gameSettings.vid_maxfps
    }
  },
  data(){
    return {
      isLoading: true,
      resSelect: false,
      gameSettings: {
        vid_defwidth: 1024,
        vid_defheight: 768,
        vid_fullscreen: false,
        vid_maxfps: 0,
        cl_serverdownload: true
      },
      resOptions: [
        {text: '640x480', value: '640x480'},
        {text: '800x600', value: '800x600'},
        {text: '1024x768', value: '1024x768'},
        {text: '1366x768', value: '1366x768'},
        {text: '1920x1080', value: '1920x1080'},
        {text: '2560x1440', value: '2560x1440'},
        {text: 'Custom', value: 'custom'}
      ],
      displayOptions: [
        {text: 'Windowed', value: false},
        {text: 'Fullscreen', value: true}
      ],
      srvDownOptions: [
        {text: 'Yes', value: true},
        {text: 'No', value: false}
      ]
    }
  },
  methods:{

    async readGameSettingsFromCFGFile(){
      try{

        let loadedConfigs = await binConfigManager.readGameSettings()

        Object.assign(this.gameSettings, loadedConfigs)

        //parse resolution
        let stringResolution = this.gameSettings.vid_defwidth + 'x' + this.gameSettings.vid_defheight

        if (this.resOptions.findIndex(res => res.value == stringResolution) != -1) {
          this.resSelect = stringResolution
        } else {
          this.resSelect = 'custom'
        }

        this.isLoading = false

      }catch(err){
        console.log(err)
      }
    },

    selectRes(res){

      this.resSelect = res

      if (res != 'custom') {

        let arrRes = res.split('x')

        if (arrRes.length == 2) {

          this.gameSettings.vid_defwidth = (!isNaN(arrRes[0])) ? arrRes[0] : this.gameSettings.vid_defwidth
          this.gameSettings.vid_defheight = (!isNaN(arrRes[1])) ? arrRes[1] : this.gameSettings.vid_defheight

        }

      }

    },

    async saveSettings(){
      try{

        let parsedSettings = {
          vid_defwidth: this.gameSettings.vid_defwidth,
          vid_defheight: this.gameSettings.vid_defheight,
          vid_fullscreen: (this.gameSettings.vid_fullscreen) ? '1' : '0',
          vid_maxfps: this.gameSettings.vid_maxfps,
          cl_serverdownload: (this.gameSettings.cl_serverdownload) ? '1' : '0'
        }

        await binConfigManager.saveCFG(parsedSettings)

        await this.readGameSettingsFromCFGFile()

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
  mounted(){
    this.readGameSettingsFromCFGFile()
  }
}
</script>

<style lang="scss" scoped></style>