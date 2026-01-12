export default defineNuxtRouteMiddleware((to, from) => {
  // Solo ejecutar en el cliente (localStorage no existe en servidor)
  if (import.meta.server) return

  const isAuthenticated = localStorage.getItem('tombola_auth') === 'true'

  // Si va a login y ya está autenticado, redirigir al home
  if (to.path === '/login' && isAuthenticated) {
    return navigateTo('/')
  }

  // Si no está autenticado y no va a login, redirigir a login
  if (to.path !== '/login' && !isAuthenticated) {
    return navigateTo('/login')
  }
})
