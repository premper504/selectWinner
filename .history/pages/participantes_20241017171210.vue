<template>
    <div class="main-body">
      <section style="padding: 10px;" class="maxwidth">
        <div>
          <img class="logo" src="assets/images/logoCeteco.png" alt="Cumple Deseo" />
        </div>
      </section>
  
      <div class="maxwidth container">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <!-- Cuadro de registros -->
          <div>
            Registros: {{ totalRecords }}
          </div>
  
          <!-- Botón para descargar CSV -->
          <el-button @click="downloadCSV">
            Descargar CSV
          </el-button>
        </div>
  
        <!-- Tabla con índice y scroll progresivo -->
        <el-table
          v-if="winners.length > 0"  <!-- El bloque v-if debe estar antes del v-else -->
          v-infinite-scroll="loadMore"
          :data="winners"
          style="width: 100%; max-height: 400px; overflow-y: auto;"
          infinite-scroll-disabled="isLoading"
          infinite-scroll-distance="10"
        >
          <el-table-column label="#" width="50">
            <template #default="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
  
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
          <el-table-column prop="product" label="Producto" width="250" />
        </el-table>
  
        <!-- Mostrar mensaje de carga -->
        <div v-else>
          Cargando datos...
        </div> <!-- El bloque v-else debe estar inmediatamente después del v-if -->
      </div>
    </div>
  </template>
  
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useNuxtApp } from '#app'
  import { ElMessage } from 'element-plus'
  import Papa from 'papaparse'  // Para generar el CSV
  
  // Definir el nombre de la tabla como una constante
  const PARTICIPANTS_TABLE = 'ceteco_genio'
  
  // Variables de estado
  const winners = ref([])
  const page = ref(1)
  const pageSize = ref(10)
  const totalRecords = ref(0)
  const isLoading = ref(false)  // Estado de carga para el scroll progresivo
  
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
  
  // Función para obtener los datos con scroll progresivo
  const loadMore = async () => {
    if (isLoading.value || winners.value.length >= totalRecords.value) return  // Si ya está cargando o se alcanzó el total, no hacer nada
    isLoading.value = true
  
    try {
      const { data, error, count } = await $supabase
        .from(PARTICIPANTS_TABLE)
        .select(`*`, { count: 'exact' })
        .range((page.value - 1) * pageSize.value, page.value * pageSize.value - 1)  // Cargar siguiente lote
  
      if (error) {
        console.error('Error fetching winners:', error)
        ElMessage.error('Error al obtener los datos')
      } else {
        console.log('Data fetched:', data) // Verificar los datos en la consola
        winners.value.push(...data)  // Agregar más datos al array existente
        totalRecords.value = count  // Número total de registros
        page.value++  // Incrementar el número de página para la próxima carga
      }
    } catch (err) {
      console.error('Error in fetchWinners:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  // Función para descargar CSV
  const downloadCSV = async () => {
    try {
      const { data, error } = await $supabase
        .from(PARTICIPANTS_TABLE)
        .select(`*`)  // Descargar todos los datos de la tabla
  
      if (error) {
        console.error('Error fetching all data:', error)
        ElMessage.error('Error al descargar los datos')
      } else {
        const csv = Papa.unparse(data)  // Generar CSV usando PapaParse
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.setAttribute('download', 'ganadores.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err) {
      console.error('Error in downloadCSV:', err)
    }
  }
  
  onMounted(() => {
    loadMore()  // Cargar los primeros datos
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
  