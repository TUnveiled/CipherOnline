import Vue from 'vue'
import Vuex from 'vuex'
const fb = require('./firebaseConfig.js')
const url = 'ws://127.0.0.1:4969';

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        currentUser: null,
        userProfile: {},
        connection: new WebSocket(url)
    },
    actions: {
        clearData({commit}) {
            commit('setCurrentUser', null);
            commit('setUserProfile', {});
        },
        fetchUserProfile({commit, state}) {
            fb.usersCollection.doc(state.currentUser.uid).get().then(result => {
                commit('setUserProfile', result.data())
                // eslint-disable-next-line no-unused-vars
            }).catch(err => {
               // TODO error handling
            })
        },
        resetConnection({commit}){
            commit('setConnection', new WebSocket(url));
        }
    },
    mutations: {
        setCurrentUser(state, val) {
            state.currentUser = val
        },
        setUserProfile(state, val) {
            state.userProfile = val
        },
        setConnection(state, val){
            state.connection = val
        }
    }
});