import Vue from 'vue'
import Vuex from 'vuex'
import path from 'path'
import VuexPersist from 'vuex-persistfile'
import fs from 'fs'
import util from 'util'
import {lstatSync} from 'fs'

const readdirAsync = util.promisify(fs.readdir)

import {createPersistedState} from 'vuex-electron'

import modules from './modules'

//set paths
const binPath = path.join('./', 'odamexbin')
const wadPath = path.join('./', 'wads')
const downloadsPath = path.join('./', 'downloads')

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
    wadPath: wadPath,
    downloadsPath: downloadsPath,
    installedBins: []
  },
  mutations: {
    setDefaultBinPath(state, path){
      state.defaultBinPath = path
    },
    setWADFolder(state, path){
      state.wadPath = path
    },
    setBINsList(state){

      state.installedBins = []

      fs.readdir(state.binPath, (err, bin) => {
        bin.forEach(binDir => {

          let relPath = path.join(state.binPath, binDir)

          if(lstatSync(relPath).isDirectory()){
            state.installedBins.push(binDir)
          }

        })
      })

    }
  },
  actions: {
    connecttoServer(context, params){

      let fullBinPath = path.join(context.state.binPath, context.state.defaultBinPath, 'odamex.exe')
      child(fullBinPath, params, function(err, data){})

    },
    setDefaultBIN(context, path){
      context.commit('setDefaultBinPath', path)
    },
    setDefaultWADsFolder(context, path){
      context.commit('setWADFolder', path)
    },
    refreshBINSList(context){
      context.commit('setBINsList')
    }
  }
})
