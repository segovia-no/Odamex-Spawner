<template>
  
  <b-input-group prepend="WAD'S Folder" size="sm" class="mt-3">

    <b-form-input readonly :value="getWADSFolder"/>

    <b-input-group-append>
      <b-button @click="openBrowseFolderWindow()" variant="primary">Browse</b-button>
    </b-input-group-append>
    
  </b-input-group>


</template>

<script>

const { dialog } = require('electron').remote

export default {
  name: 'wadssettings',
  computed:{

    getWADSFolder: function(){
      return this.$store.state.wadPath
    }
    
  },
  methods:{
    openBrowseFolderWindow(){

      dialog.showOpenDialog({properties: ['openDirectory']}, (folder) => {

        if(typeof folder[0] == 'string'){

          this.$store.dispatch('setDefaultWADsFolder', folder[0])

        }

      })

    }
  }
}
  
</script>

<style lang="scss" scoped></style>

