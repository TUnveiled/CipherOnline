import Vue from 'vue'
import Vuex from 'vuex'
const fb = require('./firebaseConfig.js');
const url = 'ws://127.0.0.1:4969';

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        currentUser: null,
        userProfile: {},
        token: null,
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
            }).catch(err => {
               alert(err.toString());// TODO error handling
            });
            state.currentUser.getIdToken(true).then(idToken => {
                commit('setToken', idToken);
                state.connection.send(JSON.stringify({
                    type: "FB Tok",
                    contents: {
                        token: idToken
                    }
                }));
            })
        },
        resetConnection({commit}){
            commit('setConnection', new WebSocket(url));
        }
    },
    mutations: {
        setCurrentUser(state, val) {
            state.currentUser = val;
        },
        setUserProfile(state, val) {
            state.userProfile = val;
        },
        setConnection(state, val) {
            state.connection = val;
        },
        setToken(state, val) {
            state.token = val;
        }
    }
});