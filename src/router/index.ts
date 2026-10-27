import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'tasks', component: () => import('@/views/TaskListView.vue') },
    { path: '/tasks/new', name: 'task-create', component: () => import('@/views/TaskFormView.vue') },
    {
      path: '/tasks/:id(\\d+)/edit',
      name: 'task-edit',
      component: () => import('@/views/TaskFormView.vue'),
      props: (route) => ({ id: Number(route.params.id) }),
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
