<template>

  <div class="mt-3">

    <b-input-group size="sm" prepend="Player name" class="mb-2">
      <b-form-input v-model="playername"></b-form-input>
    </b-input-group>

    <b-input-group size="sm" prepend="Color" class="mb-2">
      <b-form-input v-model="color" type="color"></b-form-input>
    </b-input-group>

    <b-input-group size="sm" prepend="Preferred Team" class="mb-2">
      <b-form-select v-model="team" :options="teamOptions"></b-form-select>
    </b-input-group>

    <b-input-group size="sm" prepend="Gender" class="mb-2">
      <b-form-select v-model="gender" :options="genderOptions"></b-form-select>
    </b-input-group>

    <b-input-group size="sm" prepend="Mouse sensitivity" class="mb-2">

      <b-form-input v-model="mouseSensitivity" type="range" min="0.001" max="2.5" step="0.001"></b-form-input>

      <b-form-input v-model="mouseSensitivity"></b-form-input>

    </b-input-group>

    <b-button variant="success" class="float-right mt-3 mb-4"><font-awesome-icon icon="save" fixed-width /> Save settings</b-button>

  </div>
  
</template>

<script>

import fs from 'fs'
import readline from 'readline'

export default {
  name: 'playersettings',
  data(){
    return {
      playername: 'Player',
      color: '#40cf00',
      team: 'blue',
      gender: 'male',
      mouseSensitivity: 1.5,
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

    readPlayerSettingsFromCFGFile(){

      const rl = readline.createInterface({
        input: fs.createReadStream('./odamexbinconfig.cfg'),
        crlfDelay: Infinity
      })

      rl.on('line', (line) => {

        let arrayArgs = line.split(/ "|" "|" |"$/)

        if(arrayArgs.length < 3){
          return
        }

        if(arrayArgs[0].toLowerCase() == 'set'){

          switch (arrayArgs[1]) {

            case 'cl_name':
              this.playername = arrayArgs[2]
              break

            case 'cl_color':
              this.color = '#' + arrayArgs[2].replace(/ /g, '')
              break

            case 'cl_team':
              this.team = arrayArgs[2]
              break

            case 'cl_gender':
              this.gender = arrayArgs[2]
              break

            case 'mouse_sensitivity':
              this.mouseSensitivity = arrayArgs[2]
              break
          }

        }

      })

    },

    saveSettings(){

    }

  },
  mounted(){
    this.readPlayerSettingsFromCFGFile()
  }
}
</script>

<style lang="scss" scoped></style>