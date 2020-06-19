import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        curNode: ''
    },
    mutations: {
        setCurNode(state, data) {
            state.curNode =  data;
        }
    }
})

export default store
