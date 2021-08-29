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
    async openBrowseFolderWindow(){

      let chosenPath = await dialog.showOpenDialog({properties: ['openDirectory']})
        
      this.$store.dispatch('setDefaultWADsFolder', chosenPath.filePaths[0])

    }
  }
}
  
</script>

<style lang="scss" scoped></style>

