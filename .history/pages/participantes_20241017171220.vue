


  
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
  