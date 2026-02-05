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
              <span><b>Participantes Activos: </b></span> {{ participantesActivos }}
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
  
        <!-- Tabla con índice, paginación y encabezado fijo -->
        <el-table 
          v-if="winners.length > 0" 
          :data="winners" 
          style="width: 100%"
          height="68vh"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        >
          <el-table-column label="#" width="60" fixed="left">
            <template #default="scope">
              {{ (page - 1) * pageSize + scope.$index + 1 }}
            </template>
          </el-table-column>

          <el-table-column prop="name" label="Nombre" min-width="250" />
          <el-table-column prop="reciepCode" label="Número Factura" width="150" />
          <el-table-column prop="product" label="Producto" width="200" />
          <el-table-column label="Imagen" width="120">
            <template #default="scope">
              <!-- Error de imagen -->
              <span v-if="imageErrors[scope.row.id]" class="image-error" title="Imagen no disponible">
                <el-icon><Picture /></el-icon>
              </span>
              <!-- HEIC: placeholder (click para ver en modal) -->
              <span
                v-else-if="isHeicFile(scope.row.url)"
                class="heic-placeholder"
                @click="abrirFoto(scope.row)"
                title="Click para ver"
              >
                <el-icon><Picture /></el-icon>
                <small>HEIC</small>
              </span>
              <!-- Imagen normal -->
              <img
                v-else-if="scope.row.url"
                :src="scope.row.url"
                class="foto-thumbnail"
                @click="abrirFoto(scope.row)"
                @error="handleImageError(scope.row)"
                loading="lazy"
              />
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="Participa" width="100">
            <template #default="scope">
              <el-switch
                v-model="scope.row.participando"
                @change="toggleParticipa(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="Ganador" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.winner" type="success">Sí</el-tag>
              <el-tag v-else type="info">No</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="dni" label="Identidad" width="150" />
          <el-table-column prop="phone" label="Teléfono" width="130" />
          <el-table-column prop="created_at" label="Fecha" width="140">
            <template #default="scope">
              {{ formatDate(scope.row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="Acciones" width="100" fixed="right">
            <template #default="scope">
              <el-button
                type="danger"
                size="small"
                @click="eliminarRegistro(scope.row)"
                :icon="Delete"
              />
            </template>
          </el-table-column>
        </el-table>

        <!-- Modal para ver foto grande -->
        <el-dialog v-model="showFotoModal" title="Foto" width="90%">
          <img :src="fotoSeleccionada" class="foto-grande" />
        </el-dialog>
  
        <!-- Paginación -->
        <div class="pagination-container" v-if="totalRecords > 0">
          <el-pagination
            background
            @current-change="handlePageChange"
            :current-page="page"
            :page-size="pageSize"
            :total="totalRecords"
            layout="total, sizes, prev, pager, next, jumper"
            :page-sizes="[50, 100, 200]"
            @size-change="handleSizeChange"
          />
        </div>
  
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
  import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
  import { Delete, Picture, Loading } from '@element-plus/icons-vue'
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
  const participantesActivos = ref(0)
  const showFotoModal = ref(false)
  const fotoSeleccionada = ref('')

  // Caché para URLs de imágenes convertidas y errores
  const imageCache = ref({})
  const imageErrors = ref({})
  const convertingImage = ref(false)

  // Verificar si la URL es de un archivo HEIC
  const isHeicFile = (url) => {
    if (!url) return false
    const lowerUrl = url.toLowerCase()
    return lowerUrl.includes('.heic') || lowerUrl.includes('.heif')
  }

  // Convertir HEIC a JPEG (solo cuando el usuario lo solicita)
  const convertHeicToJpeg = async (url) => {
    try {
      const heic2any = (await import('heic2any')).default
      const response = await fetch(url)
      const blob = await response.blob()
      const convertedBlob = await heic2any({
        blob,
        toType: 'image/jpeg',
        quality: 0.7
      })
      const resultBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
      return URL.createObjectURL(resultBlob)
    } catch (error) {
      console.error('Error convirtiendo HEIC:', error)
      return null
    }
  }

  // Manejar error de carga de imagen
  const handleImageError = (row) => {
    imageErrors.value[row.id] = true
  }

  // Función para abrir foto en modal
  const abrirFoto = async (row) => {
    if (!row.url) return

    // Si ya está en caché, usar directamente
    if (imageCache.value[row.id]) {
      fotoSeleccionada.value = imageCache.value[row.id]
      showFotoModal.value = true
      return
    }

    // Si es HEIC, convertir primero
    if (isHeicFile(row.url)) {
      if (convertingImage.value) {
        ElMessage.warning('Ya hay una imagen convirtiéndose, espera...')
        return
      }
      convertingImage.value = true
      ElMessage.info('Convirtiendo imagen HEIC...')

      try {
        const convertedUrl = await convertHeicToJpeg(row.url)
        if (convertedUrl) {
          imageCache.value[row.id] = convertedUrl
          fotoSeleccionada.value = convertedUrl
          showFotoModal.value = true
        } else {
          ElMessage.error('No se pudo convertir la imagen')
        }
      } finally {
        convertingImage.value = false
      }
      return
    }

    // Imagen normal
    fotoSeleccionada.value = row.url
    showFotoModal.value = true
  }

  // Función para toggle de participa
  const toggleParticipa = async (row) => {
    try {
      const { error } = await $supabase
        .from(PARTICIPANTS_TABLE)
        .update({ participando: row.participando })
        .eq('id', row.id)

      if (error) throw error
      ElMessage.success('Actualizado correctamente')
      await actualizarContador()
    } catch (err) {
      console.error('Error al actualizar:', err)
      ElMessage.error('Error al actualizar')
      row.participando = !row.participando
    }
  }

  // Función para actualizar contador de participantes activos
  const actualizarContador = async () => {
    const { count: activos } = await $supabase
      .from(PARTICIPANTS_TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('year', 2026)
      .eq('participando', true)
    participantesActivos.value = activos || 0
  }

  // Función para eliminar registro
  const eliminarRegistro = async (row) => {
    try {
      await ElMessageBox.confirm(
        '¿Seguro que deseas eliminar este participante? Esta acción No se puede deshacer.',
        'Confirmar eliminación',
        { confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar', type: 'warning' }
      )

      const { error, data } = await $supabase
        .from(PARTICIPANTS_TABLE)
        .delete()
        .eq('id', row.id)
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        ElMessage.warning('No se pudo eliminar. Verifica permisos en Supabase.')
        return
      }

      ElMessage.success('Registro eliminado')
      await actualizarContador()
      fetchWinners()
    } catch (err) {
      if (err !== 'cancel') {
        console.error('Error al eliminar:', err)
        ElMessage.error('Error al eliminar')
      }
    }
  }

  // Función para obtener los datos con paginación y filtro de fecha
  const fetchWinners = async () => {
    isLoading.value = true
    const currentPage = page.value
    try {
      let query = $supabase
        .from(PARTICIPANTS_TABLE)
        .select(`*`, { count: 'exact' })
        .eq('year', 2026)
        .order('created_at', { ascending: false })

      // Aplicar filtro de fecha si está establecido
      if (dateRange.value && dateRange.value.length === 2) {
        query = query
          .gte('created_at', dateRange.value[0])
          .lte('created_at', `${dateRange.value[1]}T23:59:59`)
      }

      const { data, error, count } = await query
        .range((currentPage - 1) * pageSize.value, currentPage * pageSize.value - 1)
  
      if (error) {
        console.error('Error fetching winners:', error)
        ElMessage.error('Error al obtener los datos')
      } else {
        winners.value = data
        totalRecords.value = count

        // Contar participantes activos (participando = true, year = 2026)
        const { count: activos } = await $supabase
          .from(PARTICIPANTS_TABLE)
          .select('*', { count: 'exact', head: true })
          .eq('year', 2026)
          .eq('participando', true)

        participantesActivos.value = activos || 0
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
    fetchWinners()
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
        .eq('year', 2026)
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
        const fileName = dateRange.value && dateRange.value.length === 2
          ? `participantes_${dateRange.value[0]}_${dateRange.value[1]}.csv`
          : 'todos_los_participantes.csv'
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
  
  // Variable para guardar la suscripción
  let realtimeSubscription = null

  onMounted(() => {
    fetchWinners() // Cargar datos iniciales

    // Suscripción realtime para nuevos participantes
    realtimeSubscription = $supabase
      .channel('participantes-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: PARTICIPANTS_TABLE
        },
        (payload) => {
          console.log('Cambio detectado:', payload)
          // Recargar datos y actualizar contador
          fetchWinners()
        }
      )
      .subscribe()
  })

  onUnmounted(() => {
    // Limpiar suscripción al desmontar
    if (realtimeSubscription) {
      $supabase.removeChannel(realtimeSubscription)
    }
  })
  </script>
  
  <style scoped>
  .main-body {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #808080;
  }
  
  .logo {
    width: 200px;
  }
  
  .container {
    flex-grow: 1;
    background-color: white;
    padding: 10px;
    width: 95%;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    margin-bottom: 10px !important;
  }
  
  .maxwidth {
    max-width: 1600px;
    margin: auto;
  }

  .foto-thumbnail {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .foto-thumbnail:hover {
    transform: scale(1.1);
  }

  .image-error {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    background: #f5f5f5;
    border-radius: 4px;
    color: #909399;
    font-size: 24px;
  }

  .heic-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    background: #e6f7ff;
    border: 1px dashed #409eff;
    border-radius: 4px;
    color: #409eff;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .heic-placeholder:hover {
    background: #409eff;
    color: white;
  }

  .heic-placeholder small {
    font-size: 8px;
    margin-top: 2px;
  }

  .is-loading {
    animation: rotate 1s linear infinite;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .foto-grande {
    width: 100%;
    max-height: 100vh;
    object-fit: contain;
  }
  
  .header-container {
    display: flex;
    padding-bottom: 20px;
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
    width: 100%;
    justify-content: space-between;
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

  .pagination-container {
    padding: 20px 0;
    display: flex;
    justify-content: center;
    background: #f9f9f9;
    border-radius: 8px;
    margin-top: 15px;
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