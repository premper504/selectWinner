<template>
    <div class="main-body">
      <section style="padding: 10px;" class="maxwidth">
        <div>
          <img class="logo" src="assets/images/logoCeteco.png" alt="Cumple Deseo" />
        </div>
      </section>
  
      <div class="maxwidth container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <!-- Cuadro de registros -->
          <div>
            Registros: {{ totalRecords }}
          </div>
  
          <!-- Botón para descargar CSV -->
          <el-button @click="downloadCSV" type="primary" :loading="isDownloading">
            {{ isDownloading ? 'Descargando...' : 'Descargar CSV' }}
          </el-button>
        </div>
  
        <!-- Tabla con índice, paginación y encabezado fijo -->
        <el-table 
          v-if="winners.length > 0" 
          :data="winners" 
          style="width: 100%"
          v-loading="isLoading"
          height="65vh"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        >
          <el-table-column label="#" width="50" fixed="left">
            <template #default="scope">
              {{ (page - 1) * pageSize + scope.$index + 1 }}
            </template>
          </el-table-column>
  
          <el-table-column prop="id" label="ID" width="80" fixed="left" />
          
          <!-- Columna para la fecha con slot para formatear -->
          <el-table-column label="Fecha creación" width="150">
            <template #default="scope">
              {{ formatDate(scope.row.created_at) }}
            </template>
          </el-table-column>
  
          <el-table-column prop="name" label="Nombre" width="200" />
          <el-table-column prop="dni" label="Identidad" width="150" />
          <el-table-column prop="phone" label="Teléfono" width="150" />
          <el-table-column prop="email" label="Email" width="200" />
          <el-table-column prop="state" label="Departamento" width="150" />
          <el-table-column prop="place" label="Lugar de Compra" width="200" />
          <el-table-column prop="reciepCode" label="Código" width="150" />
          <el-table-column prop="product" label="Producto" width="200" />
        </el-table>
  
        <!-- Paginación -->
        <el-pagination
          v-if="totalRecords > pageSize"
          @current-change="handlePageChange"
          :current-page="page"
          :page-size="pageSize"
          :total="totalRecords"
          layout="total, sizes, prev, pager, next"
          :page-sizes="[50, 100, 200]"
          @size-change="handleSizeChange"
          style="margin-top: 20px;"
        >
        </el-pagination>
  
        <!-- Mostrar mensaje de carga -->
        <div v-if="winners.length === 0 && !isLoading">
          No hay datos disponibles.
        </div>
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
  const page = ref(1)
  const pageSize = ref(50)
  const totalRecords = ref(0)
  const isLoading = ref(false)
  const isDownloading = ref(false)
  
  // Función para obtener los datos con paginación
  const fetchWinners = async (page = 1) => {
    isLoading.value = true
    try {
      const { data, error, count } = await $supabase
        .from(PARTICIPANTS_TABLE)
        .select(`*`, { count: 'exact' })
        .range((page - 1) * pageSize.value, page * pageSize.value - 1)  // Paginación
  
      if (error) {
        console.error('Error fetching winners:', error)
        ElMessage.error('Error al obtener los datos')
      } else {
        winners.value = data
        totalRecords.value = count  // Número total de registros
      }
    } catch (err) {
      console.error('Error in fetchWinners:', err)
      ElMessage.error('Error inesperado al cargar los datos')
    } finally {
      isLoading.value = false
    }
  }
  
  // Función para manejar el cambio de página
  const handlePageChange = (newPage) => {
    page.value = newPage
    fetchWinners(newPage)
  }
  
  // Función para manejar el cambio de tamaño de página
  const handleSizeChange = (newSize) => {
    pageSize.value = newSize
    page.value = 1  // Resetear a la primera página
    fetchWinners()
  }
  
  // Función para descargar CSV
  const downloadCSV = async () => {
    isDownloading.value = true
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
        ElMessage.success('CSV descargado exitosamente')
      }
    } catch (err) {
      console.error('Error in downloadCSV:', err)
      ElMessage.error('Error inesperado al descargar el CSV')
    } finally {
      isDownloading.value = false
    }
  }
  
  onMounted(() => {
    fetchWinners() // Cargar datos iniciales
  })
  </script>
  
  <style scoped>
  .logo {
    width: 200px;
  }
  
  .container {
    background-color: white;
    padding: 20px;
    width: 100%;
    min-height: 150px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
  
  .maxwidth {
    max-width: 1200px;
    margin: auto;
  }
  
  /* Asegurarse de que el contenido de las celdas no se desborde */
  .el-table .cell {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  </style>