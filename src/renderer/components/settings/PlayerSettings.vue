<template>

  <div v-if="!isLoading" class="mt-3">

    <b-input-group size="sm" prepend="Player name" class="mb-2">
      <b-form-input v-model="playerSettings.cl_name"></b-form-input>
    </b-input-group>


    <b-input-group size="sm" prepend="Color" class="mb-2">
      <b-form-input v-model="playerSettings.cl_color" type="color"></b-form-input>
    </b-input-group>


    <b-input-group size="sm" prepend="Preferred Team" class="mb-2">
      <b-form-select v-model="playerSettings.cl_team" :options="teamOptions"></b-form-select>
    </b-input-group>


    <b-input-group size="sm" prepend="Gender" class="mb-2">
      <b-form-select v-model="playerSettings.cl_gender" :options="genderOptions"></b-form-select>
    </b-input-group>


    <b-input-group size="sm" prepend="Mouse sensitivity (ZDoom)" class="mb-2">

      <b-form-input v-model="playerSettings.mouse_sensitivity" type="range" min="0.001" max="2.5" step="0.001"></b-form-input>

      <b-form-input v-model="playerSettings.mouse_sensitivity"></b-form-input>

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
  name: 'playersettings',
  data(){
    return {
      isLoading: true,
      playerSettings: {
        cl_name: 'Player',
        cl_color: '#40cf00',
        cl_team: 'blue',
        cl_gender: 'male',
        mouse_sensitivity: 1.5,
      },
      teamOptions: [
        {text: 'Red', value: 'red'},
        {text: 'Blue', value: 'blue'}
      ],
      genderOptions: [
        {text: 'Male', value: 'male'},
        {text: 'Female', value: 'female'},
        {text: 'Cyborg', value: 'cyborg'}
      ]
    }
  },
  methods:{

    async readPlayerSettingsFromCFGFile(){
      try{

        let loadedConfigs = await binConfigManager.readPlayerSettings()

        Object.assign(this.playerSettings, loadedConfigs)

        this.isLoading = false

      }catch(err){
        console.log(err)
      }
    },

    async saveSettings(){
      try{

        let formattedColor = this.playerSettings.cl_color.replace('#', '')
        formattedColor = formattedColor.match(/.{1,2}/g)
        formattedColor = formattedColor.join(' ')

        let parsedSettings = {
          cl_name: this.playerSettings.cl_name,
          cl_color: formattedColor,
          cl_team: this.playerSettings.cl_team,
          cl_gender: this.playerSettings.cl_gender,
          mouse_sensitivity: this.playerSettings.mouse_sensitivity,
          mouse_type: 1
        }

        await binConfigManager.saveCFG(parsedSettings)

        await this.readPlayerSettingsFromCFGFile()

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
    this.readPlayerSettingsFromCFGFile()
  }
}
</script>

<style lang="scss" scoped></style>