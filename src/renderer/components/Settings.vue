<template>
  <div id="insidewrapper">
    
    <h2 class="pageTitle">Settings</h2>

    <b-row class="mt-4 mb-3">
      <b-col sm="12">

        <b-card>

          <b-card-title>
            <font-awesome-icon icon="download" fixed-width /> Game Client Version
          </b-card-title>

          <b-card-sub-title>
            Install, download and manage your odamex versions
          </b-card-sub-title>

          <b-list-group class="mt-3">

            <b-list-group-item class="d-flex justify-content-between align-items-center">

              <span><strong>Odamex 0.8.2</strong> <b-badge variant="primary" pill>Default</b-badge><b-badge variant="success" pill>Downloaded</b-badge></span>

              <b-button-group size="sm">
                <b-button variant="danger">Delete</b-button>
              </b-button-group>
              
            </b-list-group-item>


            <b-list-group-item class="d-flex justify-content-between align-items-center">

              <span><strong>Odamex 0.8.1</strong> <b-badge variant="success" pill>Downloaded</b-badge></span>

              <b-button-group size="sm">
                <b-button variant="secondary">Set as default</b-button>
                <b-button variant="danger">Delete</b-button>
              </b-button-group>
              
            </b-list-group-item>

          </b-list-group>

        </b-card>
      
      </b-col>
    </b-row>

  </div>
</template>

<script>
  export default {
    name: 'settings',
    data(){
      return{

      }
    },
    methods:{
      
    },
    mounted(){

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
