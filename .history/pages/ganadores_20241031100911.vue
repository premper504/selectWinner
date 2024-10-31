<template>
  <div class="main-body">
    <section style="padding: 10px;" class="maxwidth">
      <div>
        <img class="logo" src="assets/images/logoCeteco.png" alt="Cumple Deseo" />
      </div>
    </section>

    <div class="maxwidth container">
      <div class="header-container">
        <div class="header-right">
          <!-- Cuadro de registros -->
          <div>
            <span><b>Ganadores: </b></span> {{ totalRecords }}
          </div>

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

          <!-- Botón para descargar CSV -->
          <el-button @click="downloadCSV" type="primary" :loading="isDownloading">
            {{ isDownloading ? 'Descargando...' : 'Descargar CSV' }}
          </el-button>
        </div>
      </div>

      <!-- Cargador global -->
      <el-loading v-model:full-screen="isLoading" element-loading-text="Cargando..." :lock-scroll="false" />

      <!-- Tabla con índice, paginación, encabezado fijo y líneas entre columnas -->
      <el-table 
        v-if="winners.length > 0" 
        :data="winners" 
        style="width: 100%" 
        border
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        table-layout="auto"
      >
        <!-- Columna personalizada para el índice -->
        <el-table-column 
          label="#" 
          width="50" 
          fixed="left"
          align="center"
        >
          <template #default="scope">
            {{ (page - 1) * pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>

        <!-- Columna del nombre con el máximo espacio disponible -->
        <el-table-column 
          prop="ganadorName" 
          label="Nombre" 
          min-width="50%"
          fixed="left"
        />

        <!-- Columnas con ancho proporcional -->
        <el-table-column 
          prop="ganadorDepartamento" 
          label="Departamento" 
          min-width="25%"
        />
        
        <el-table-column 
          prop="ganadorTelefono" 
          label="Teléfono" 
          min-width="25%"
        />

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
import { ref, onMounted, onUnmounted } from 'vue'
import { useNuxtApp } from '#app'
import { ElMessage, ElLoading } from 'element-plus'
import Papa from 'papaparse'

const WINNERS_TABLE = 'ganadoresCeteco'

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

// Función para obtener la fecha de hoy en formato YYYY-MM-DD
const getTodayDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

const { $supabase } = useNuxtApp()
const winners = ref([])
const page = ref(1)
const pageSize = ref(50)
const totalRecords = ref(0)
const isLoading = ref(true)
const isDownloading = ref(false)
const dateRange = ref([getTodayDate(), getTodayDate()])

// Variable para almacenar la suscripción
let subscription = null

// Función para suscribirse a cambios en tiempo real
const subscribeToRealtime = () => {
  // Cancelar suscripción existente si hay una
  if (subscription) {
    subscription.unsubscribe()
  }

  subscription = $supabase
    .channel('winners-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Escuchar inserts, updates y deletes
        schema: 'public',
        table: WINNERS_TABLE
      },
      (payload) => {
        console.log('Realtime change received:', payload)
        // Recargar datos cuando hay cambios
        fetchWinners(page.value)
        // Mostrar notificación
        if (payload.eventType === 'INSERT') {
          ElMessage.success('¡Nuevo ganador registrado!')
        }
      }
    )
    .subscribe()
}

// Función para obtener los datos con paginación y filtro de fecha
const fetchWinners = async (page = 1) => {
  isLoading.value = true
  try {
    let query = $supabase
      .from(WINNERS_TABLE)
      .select(`*`, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Aplicar filtro de fecha
    if (dateRange.value && dateRange.value.length === 2) {
      query = query
        .gte('created_at', `${dateRange.value[0]}T00:00:00`)
        .lte('created_at', `${dateRange.value[1]}T23:59:59`)
    }

    const { data, error, count } = await query
      .range((page - 1) * pageSize.value, page * pageSize.value - 1)

    if (error) {
      console.error('Error fetching winners:', error)
      ElMessage.error('Error al obtener los datos')
    } else {
      winners.value = data
      totalRecords.value = count
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
  page.value = 1
  fetchWinners()
}

// Función para limpiar el filtro de fecha y mostrar solo los de hoy
const clearDateFilter = () => {
  dateRange.value = [getTodayDate(), getTodayDate()]
  page.value = 1
  fetchWinners()
}

const handlePageChange = (newPage) => {
  page.value = newPage
  fetchWinners(newPage)
}

const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  page.value = 1
  fetchWinners()
}

const downloadCSV = async () => {
  isDownloading.value = true
  try {
    let query = $supabase
      .from(WINNERS_TABLE)
      .select(`*`)
      .order('created_at', { ascending: false })

    if (dateRange.value && dateRange.value.length === 2) {
      query = query
        .gte('created_at', `${dateRange.value[0]}T00:00:00`)
        .lte('created_at', `${dateRange.value[1]}T23:59:59`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching all data:', error)
      ElMessage.error('Error al descargar los datos')
    } else {
      const csv = Papa.unparse(data)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      const fileName = `ganadores_${dateRange.value[0]}_${dateRange.value[1]}.csv`
      link.setAttribute('download', fileName)
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
  subscribeToRealtime() // Iniciar suscripción a cambios en tiempo real
})

// Limpiar suscripción al desmontar el componente
onUnmounted(() => {
  if (subscription) {
    subscription.unsubscribe()
  }
})
</script>


