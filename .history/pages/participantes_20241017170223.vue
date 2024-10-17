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
          <el-table-column prop="id" label="ID" width="50" />
          
          <!-- Columna para la fecha con slot para formatear -->
          <el-table-column label="Fecha creación" width="150">
            <template #default="scope">
              {{ formatDate(scope.row.created_at) }}
            </template>
          </el-table-column>
  
          <el-table-column prop="name" label="Nombre" width="300" />
          <el-table-column prop="dni" label="Identidad" width="200" />
          <el-table-column prop="phone" label="Teléfono" width="150" />
          <el-table-column prop="email" label="Email" width="250" />
          <el-table-column prop="state" label="Departamento" width="150" />
          <el-table-column prop="place" label="Lugar de Compra" width="200" />
          <el-table-column prop="reciepCode" label="Código" width="200" />
          <el-table-column prop="product" label="Producto" width="200" />
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
  
  // Definir el nombre de la tabla como una constante
  const PARTICIPANTS_TABLE = 'ceteco_genio'
  
  // Función para formatear la fecha y hora
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString().slice(-2)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }
  
  const { $supabase } = useNuxtApp()
  const winners = ref([])
  
  // Consulta para obtener los ganadores
  const fetchWinners = async () => {
    try {
      const { data, error } = await $supabase
        .from(PARTICIPANTS_TABLE)  // Usar la constante aquí
        .select(`*`)
  
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
      .on('postgres_changes', { event: '*', schema: 'public', table: PARTICIPANTS_TABLE }, (payload) => {
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
  