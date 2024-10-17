<template>
    <div class="main-body">
      <section style="padding: 10px;" class="maxwidth">
        <div>
          <img class="logo" src="assets/images/logoCeteco.png" alt="Cumple Deseo" />
        </div>
      </section>
  
      <div class="maxwidth container">
        <div class="header-container">
          <!-- Filtro de fecha -->
          <div class="date-filter">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="Hasta"
              start-placeholder="Fecha inicio"
              end-placeholder="Fecha fin"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              @change="handleDateChange"
            />
            <el-button @click="clearDateFilter" type="info" plain>Limpiar filtro</el-button>
          </div>
  
          <div class="header-right">
            <!-- Cuadro de registros -->
            <div>
              <span><b>Participantes: </b></span> {{ totalRecords }}
            </div>
  
            <!-- Botón para descargar CSV -->
            <el-button @click="downloadCSV" type="primary" :loading="isDownloading">
              {{ isDownloading ? 'Descargando...' : 'Descargar CSV' }}
            </el-button>
          </div>
        </div>
  
        <!-- Cargador global -->
        <el-loading v-model:full-screen="isLoading" element-loading-text="Cargando..." :lock-scroll="false" />
  
        <!-- Tabla con índice, paginación y encabezado fijo -->
        <el-table 
          v-if="winners.length > 0" 
          :data="winners" 
          style="width: 100%"
          height="67vh"
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
  
          <el-table-column prop="name" label="Nombre" width="300" />
          <el-table-column prop="dni" label="Identidad" width="150" />
          <el-table-column prop="phone" label="Teléfono" width="150" />
          <el-table-column prop="email" label="Email" width="320" />
          <el-table-column prop="state" label="Departamento" width="150" />
          <el-table-column prop="place" label="Lugar de Compra" width="240" />
          <el-table-column prop="reciepCode" label="Código" width="200" />
          <el-table-column prop="product" label="Producto" width="250" />
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
  
        <!-- Mostrar mensaje cuando no hay datos -->
        <div v-if="winners.length === 0 && !isLoading" class="no-data">
          No hay datos disponibles.
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useNuxtApp } from '#app'
  import { ElMessage, ElLoading } from 'element-plus'
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
  const isLoading = ref(true)
  const isDownloading = ref(false)
  const dateRange = ref([])
  
  // Función para obtener los datos con paginación y filtro de fecha
  const fetchWinners = async (page = 1) => {
    isLoading.value = true
    try {
      let query = $supabase
        .from(PARTICIPANTS_TABLE)
        .select(`*`, { count: 'exact' })
        .order('created_at', { ascending: false })
  
      // Aplicar filtro de fecha si está establecido
      if (dateRange.value && dateRange.value.length === 2) {
        query = query
          .gte('created_at', dateRange.value[0])
          .lte('created_at', `${dateRange.value[1]}T23:59:59`)
      }
  
      const { data, error, count } = await query
        .range((page - 1) * pageSize.value, page * pageSize.value - 1)
  
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
  
  // Función para manejar el cambio de fecha
  const handleDateChange = () => {
    page.value = 1  // Resetear a la primera página
    fetchWinners()
  }
  
  // Función para limpiar el filtro de fecha
  const clearDateFilter = () => {
    dateRange.value = []
    page.value = 1  // Resetear a la primera página
    fetchWinners()
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
      let query = $supabase
        .from(PARTICIPANTS_TABLE)
        .select(`*`)
        .order('created_at', { ascending: false })
  
      // Aplicar filtro de fecha si está establecido
      if (dateRange.value && dateRange.value.length === 2) {
        query = query
          .gte('created_at', dateRange.value[0])
          .lte('created_at', `${dateRange.value[1]}T23:59:59`)
      }
  
      const { data, error } = await query
  
      if (error) {
        console.error('Error fetching all data:', error)
        ElMessage.error('Error al descargar los datos')
      } else {
        const csv = Papa.unparse(data)  // Generar CSV usando PapaParse
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.setAttribute('download', 'participantes.csv')
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
  .main-body {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  .logo {
    width: 200px;
  }
  
  .container {
    flex-grow: 1;
    background-color: white;
    padding: 20px;
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
  }
  
  .maxwidth {
    max-width: 1200px;
    margin: auto;
  }
  
  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  
  .date-filter {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  /* Asegurarse de que el contenido de las celdas no se desborde */
  :deep(.el-table .cell) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .no-data {
    text-align: center;
    padding: 20px;
    font-size: 16px;
    color: #909399;
  }
  
  @media (max-width: 768px) {
    .header-container {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }
  
    .date-filter, .header-right {
      width: 100%;
      justify-content: space-between;
    }
  }
  </style>