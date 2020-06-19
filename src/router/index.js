import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const router = new VueRouter({
    routes: [
        {
            path: '/',
            redirect: '/home'
        },
        {
            path: '/home',
            component: () => import('../views/home.vue')
        },
        {
            path: '/g6',
            component: () => import('../views/g6.vue')
        },
        {
            path: '/jsplumb',
            component: () => import('../views/jsplumb.vue')
        }
    ]
});

export default router
