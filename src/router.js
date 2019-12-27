import Vue from 'vue'
import VueRouter from 'vue-router'
// eslint-disable-next-line no-unused-vars
import firebase from 'firebase'
//const fb = require('./firebaseConfig.js');
//import {store} from './store'

import login from './components/login'
import loggedin from "@/components/LoggedIn"
import register from './components/register'
import matchmaking from '@/components/matchmaking'
import room from '@/components/room'

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '*',
            redirect: '/login'
        },
        {
            path: '/login',
            name: 'login',
            component: login
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: loggedin,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/signup',
            name: 'sign up',
            component: register
        },
        {
            path: '/matchmaking',
            name: 'matchmaking',
            component: matchmaking,
            meta: {
                requiresAuth: true,
            }
        },
        {
            path: '/room/:id',
            name: 'room',
            component: room,
            meta: {
                requiresAuth: true,
            }
        }
    ]
});

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(x => x.meta.requiresAuth);
    const currentUser = firebase.auth().currentUser;

    if (requiresAuth && !currentUser) {
        next('/login');
    } else if (requiresAuth && currentUser) {
        next();
    } else {
        next();
    }
});

export default router;