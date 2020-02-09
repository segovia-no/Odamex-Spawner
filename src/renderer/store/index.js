import Vue from 'vue'
import Vuex from 'vuex'
import path from 'path'
import VuexPersist from 'vuex-persistfile'

import {createPersistedState} from 'vuex-electron'

import modules from './modules'

//set paths
const binPath = path.join('./', 'odamexbin')
const wadPath = path.join('./', 'wads')

//bin executable
let child = require('child_process').execFile

//state hydration
const persist = new VuexPersist({
  path: './',
  file: 'spawner.cfg'
})

Vue.use(Vuex)

export default new Vuex.Store({
  modules,
  plugins: [
    createPersistedState(),
    persist.subscribe()
  ],
  strict: process.env.NODE_ENV !== 'production',
  state:{
    binPath: binPath,
    defaultBinPath: 'dev-rc5-6ebc2ef5',
    wadPath: wadPath
  },
  mutations: {
    setDefaultBinPath(state, path){
      state.defaultBinPath == path
    }
  },
  actions: {
    connecttoServer(context, params){

      let fullBinPath = path.join(context.state.binPath, context.state.defaultBinPath, 'odamex.exe')
      child(fullBinPath, params, function(err, data){})

    },
    setDefaultBIN(context, path){
      context.commit('setDefaultBinPath', path)
    }
  }
})
