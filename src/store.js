import Vue from 'vue'
import Vuex from 'vuex'
const fb = require('./firebaseConfig.js')

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        currentUser: null,
        userProfile: {}
    },
    actions: {
        fetchUserProfile({commit, state}) {
            fb.usersCollection.doc(state.currentUser.uid).get().then(result => {
                commit('setUserProfile', result.data())
                // eslint-disable-next-line no-unused-vars
            }).catch(err => {
               // TODO error handling
            })
        }
    },
    mutations: {
        setCurrentUser(state, val) {
            state.currentUser = val
        },
        setUserProfile(state, val) {
            state.userProfile = val
        }
    }
});