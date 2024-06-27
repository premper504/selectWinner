// plugins/supabaseClient.js
import { createClient } from '@supabase/supabase-js'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.SUPABASE_URL
  const supabaseKey = config.public.SUPABASE_KEY

  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Key:', supabaseKey)

  if (!supabaseUrl || !supabaseKey) {
    console.error('No se pudo acceder alas variables de entorno!')
  } else {
    const supabase = createClient(supabaseUrl, supabaseKey)
    nuxtApp.provide('supabase', supabase)
  }
})
