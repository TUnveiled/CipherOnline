import Vue from 'vue'
import VueRouter from 'vue-router'
// eslint-disable-next-line no-unused-vars
import firebase from 'firebase'

import login from './components/login'
import loggedin from "@/components/LoggedIn"
import register from './components/register'

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