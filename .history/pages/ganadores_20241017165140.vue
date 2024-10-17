<template>
    <div class="main-body">
      <section style="padding: 10px;" class="maxwidth">
        <div>
          <img class="logo" src="assets/images/logoCeteco.png" alt="Cumple Deseo" />
        </div>
      </section>
  
      <div class="maxwidth container">
        <!-- Condicional para verificar si hay datos -->
        <el-table v-if="winners.length > 0" :data="winners" style="width: 100%">
          <el-table-column prop="id" label="#" width="150" />
          <el-table-column
            label="Fecha de Gane"
            width="200"
            :formatter="formatDate"
          />
          <el-table-column prop="ganadorUser.name" label="Nombre" width="200" />
          <el-table-column prop="ganadorUser.dni" label="Identidad" width="200" />
          <el-table-column prop="ganadorUser.phone" label="Teléfono" width="150" />
          <el-table-column prop="ganadorUser.email" label="Email" width="200" />
          <el-table-column prop="ganadorUser.state" label="Departamento" width="150" />
          <el-table-column prop="ganadorUser.place" label="Lugar de Compra" width="200" />
          <el-table-column prop="ganadorUser.reciepCode" label="Código" width="150" />
          <el-table-column prop="ganadorUser.product" label="Producto" width="200" />
        </el-table>
  
        <!-- Mostrar mensaje de carga -->
        <div v-else>
          Cargando datos...
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useNuxtApp } from '#app'
  
  // Función para formatear la fecha
  const formatDate = (row, column, cellValue) => {
    if (!cellValue) return ''
    const date = new Date(cellValue)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  
  const { $supabase } = useNuxtApp()
  const winners = ref([])
  
  // Consulta para obtener los ganadores
  const fetchWinners = async () => {
    try {
      const { data, error } = await $supabase
        .from('ganadoresCeteco')
        .select(`
          *,
          ganadorUser(*)
        `)
  
      if (error) {
        console.error('Error fetching winners:', error)
      } else {
        console.log('Data fetched:', data) // Verificar los datos en la consola
        winners.value = data
      }
    } catch (err) {
      console.error('Error in fetchWinners:', err)
    }
  }
  
  // Suscripción a cambios en tiempo real
  const subscribeToRealtime = () => {
    $supabase
      .channel('realtime-winners')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ganadoresCeteco' }, (payload) => {
        console.log('Change received!', payload)
        fetchWinners() // Refrescar datos al detectar un cambio
      })
      .subscribe()
  }
  
  onMounted(() => {
    fetchWinners() // Cargar datos iniciales
    subscribeToRealtime() // Activar suscripción en tiempo real
  })
  </script>
  
  <style scoped>
  .logo {
    width: 200px;
  }
  
  .container {
    background-color: white;
    padding: 10px;
    width: 100%;
    min-height: 150px;
  }
  
  .maxwidth {
    max-width: 1100px;
    margin: auto;
  }
  </style>
  