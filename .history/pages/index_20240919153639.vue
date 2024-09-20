<<template>
  <body class="body">
    <ElDialog
      v-model="dialogVisible"
      title="Información del Niño/a"
      @close="handleClose"
      :style="{ width: isMobile ? '90%' : '50%' }"
    >
      <div>
        <el-form :model="form" :rules="rules" ref="formRef" label-width="250px" style="font-size: 13px; padding-top: 20px">
          <el-form-item label="Nombre de hijo/a" prop="name">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
      
          <el-form-item label="Edad del niño" prop="edad">
            <el-input v-model="form.edad"></el-input>
          </el-form-item>
          <el-form-item label="Ciudad" prop="ciudad">
            <el-input v-model="form.ciudad"></el-input>
          </el-form-item>
          <el-form-item label="Nombre de los padres" prop="nombre_padres">
            <el-input v-model="form.nombre_padres"></el-input>
          </el-form-item>
          <el-form-item label="Número de identidad (sin guiones)" prop="numero_de_identidad">
            <el-input v-model="form.numero_de_identidad"></el-input>
          </el-form-item>
          <el-form-item label="Celular" prop="telefono">
            <el-input v-model="form.telefono"></el-input>
          </el-form-item>
          <el-form-item label="Correo electrónico" prop="email">
            <el-input v-model="form.email"></el-input>
          </el-form-item>
          <el-form-item style="line-height: 10px;" label="¿Qué tipo de leche Ceteco consume su hijo?" prop="tipo_leche">
            <el-input v-model="form.tipo_leche"></el-input>
          </el-form-item>
        </el-form>
      </div>

      <div>
        <p>Agregar fotografía de tu niño posando originalmente</p>
        <el-upload
          v-if="!selectedFile"
          action="#"
          list-type="picture-card"
          :auto-upload="false"
          :limit="1"
          :file-list="fileList"
          :on-change="handleFileChange"
          :on-remove="handleRemove"
          :on-exceed="handleExceed"
        >
          <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
            Toma o selecciona una imagen   
            <el-icon style="margin-left: 10px;"><Plus /> </el-icon>
          </div>
        </el-upload>

        <div v-else style="display: flex; flex-direction: column; align-items: center;">
          <img :src="imageUrl" alt="Fotografía " style="max-width: 100%; height: auto;">
          <el-button @click="handleRemove(selectedFile, fileList)" type="danger" icon="el-icon-delete" circle>
            <el-icon style="margin-left: -5px;"><Plus /> </el-icon>
          </el-button>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="handleClose">Cancelar</ElButton>
          <ElButton type="primary" @click="handleConfirm">Continuar</ElButton>
        </span>
      </template>
    </ElDialog>

    <div class="webcontainer">
      <div class="backhistorieta">
        <div class="containertitle">
          <img src="../public/images/locoCeteco.png" loading="lazy" sizes="(max-width: 479px) 85vw, 160px" srcset="../public/images/locoCeteco-p-500.png 500w, ../public/images/locoCeteco-p-800.png 800w, ../public/images/locoCeteco.png 1036w" alt="" class="logoceteco">
          <img src="../public/images/Clip-path-group.svg" loading="lazy" alt="" class="logobusca12">
        </div>
        <div class="containerkids">
          <img src="../public/images/girl.png" loading="lazy" sizes="(max-width: 479px) 100vw, (max-width: 767px) 250px, (max-width: 991px) 320px, 400px" srcset="../public/images/girl-p-500.png 500w, ../public/images/girl.png 686w" alt="" class="girl">
          <img src="../public/images/boyCeteco.png" loading="lazy" sizes="(max-width: 479px) 100vw, (max-width: 767px) 220px, (max-width: 991px) 280px, 37vw" srcset="../public/images/boyCeteco-p-500.png 500w, ../public/images/boyCeteco.png 628w" alt="" class="boy">
        </div>
      </div>
      <div class="backamarillo">
        <div class="div-block-3"></div>
      </div>
      <div class="div-block-6">
        <img src="../public/images/participa-1.png" loading="lazy" sizes="(max-width: 479px) 92vw, (max-width: 767px) 55vw, (max-width: 991px) 32vw, 33vw" srcset="../public/images/participa-1-p-500.png 500w, ../public/images/participa-1-p-800.png 800w, ../public/images/participa-1.png 1695w" alt="" class="label2">
        <img src="../public/images/latasLecheCeteco.png" loading="lazy" sizes="(max-width: 767px) 92vw, (max-width: 991px) 59vw, 61vw" srcset="../public/images/latasLecheCeteco-p-500.png 500w, ../public/images/latasLecheCeteco-p-800.png 800w, ../public/images/latasLecheCeteco-p-1080.png 1080w, ../public/images/latasLecheCeteco.png 1405w" alt="" class="latasceteco">
      </div>
      <div class="containernumber">
        <div class="number">
          <img src="../public/images/Sin-one.png" loading="lazy" alt="" class="image-7">
        </div>
        <div class="number">
          <img src="../public/images/two.png" loading="lazy" alt="" class="image-7 dos">
        </div>
        <div class="number">
          <img src="../public/images/three.png" loading="lazy" alt="" class="image-7 tres">
        </div>
      </div>

      <div style="padding:20px; margin-top:50px; color: white; display:flex; justify-content: center;"> 
        <input style="margin-right: 10px; width: 20px;" type="checkbox" id="terms" v-model="acceptedTerms">
        <span style="font-weight: 900; margin-right: 6px"> Acepto </span>
        <a style="color:white" href="https://wtzcjehvfofuphkmvsru.supabase.co/storage/v1/object/public/storage/terminosycondicionespromoceteco.pdf" target="_blank"> Términos y Condiciones</a>
      </div> 

      <div class="botoncontainer">
        <button @click="handleOpen" :class="{ 'disabled': !acceptedTerms }" class="button w-button" :style="buttonStyle" :disabled="!acceptedTerms">PARTICIPAR</button>
      </div>

      <div style="margin-top: 70px; margin-left: 20px;">
        <img src="../public/images/participantes.svg" loading="lazy" alt="" class="imageParticipantes">
      </div>

      <div class="containerParticipantes" style="margin-top: -30px;">
        <div v-for="participante in participantes" :key="participante.id" class="card">
          <img :src="participante.url" alt="" class="participante-img" />
          <div class="participante-name">{{ participante.name }}</div>
        </div>
      </div>

      <el-pagination
        background
        layout="prev, pager, next"
        :total="totalParticipants"
        :page-size="pageSize"
        @current-change="handlePageChange"
        style="text-align: center; margin-top: 20px; display: flex;
    justify-content: center;"
      />
    </div>
  </body>
</template>


<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { v4 as uuidv4 } from 'uuid'
import { useNuxtApp } from '#app'

const { $supabase } = useNuxtApp()
const imageUrl = ref(null)
const dialogVisible = ref(false)
const isMobile = ref(false)
const fileList = ref([])
const selectedFile = ref(null)
const acceptedTerms = ref(true)
const loading = ref(false) // Define loading state
const participantes = ref([]) // Define the participantes ref

const form = ref({
  name: '',
  email: '',
  edad: '',
  ciudad: '',
  nombre_padres: '',
  numero_de_identidad: '',
  telefono: '',
  tipo_leche: '',
  url: ''
})

const rules = ref({
  name: [
    { required: true, message: 'Por favor ingrese el nombre', trigger: 'blur' },
    { type: 'string', min: 5, message: 'El nombre debe tener al menos 5 caracteres', trigger: 'blur' },
    { pattern: /^[a-zA-Z\s]*$/, message: 'Por favor ingrese un nombre válido', trigger: 'blur' }
  ],
  edad: [{ required: true, message: 'Por favor ingrese la edad', trigger: 'blur' }],
  ciudad: [
    { required: true, message: 'Por favor ingrese la ciudad', trigger: 'blur' },
    { type: 'string', min: 4, message: 'La Ciudad debe tener al menos 4 caracteres', trigger: 'blur' },
    { pattern: /^[a-zA-Z\s]*$/, message: 'Por favor ingrese un nombre válido', trigger: 'blur' }
  ],
  nombre_padres: [
    { required: true, message: 'Por favor ingrese el nombre de los padres', trigger: 'blur' },
    { type: 'string', min: 5, message: 'El nombre de los padres debe tener al menos 5 caracteres', trigger: 'blur' },
    { pattern: /^[a-zA-Z\s]*$/, message: 'Por favor ingrese un nombre válido', trigger: 'blur' }
  ],
  numero_de_identidad: [
    { required: true, message: 'Por favor ingrese el número de identidad', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('Por favor ingrese el número de identidad'))
        } else if (!/^\d{10,}$/.test(value)) {
          callback(new Error('El número de identidad no parece ser válido'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  telefono: [
    { required: true, message: 'Por favor ingrese el número de celular', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('Por favor ingrese el número de celular'))
        } else if (!/^\d{8}$/.test(value)) {
          callback(new Error('Este no parece ser un número de teléfono válido'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  tipo_leche: [
    { required: true, message: 'Por favor ingrese el tipo de leche', trigger: 'blur' },
    { type: 'string', min: 5, message: 'El nombre debe tener al menos 5 caracteres', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Por favor ingrese correo electrónico', trigger: 'blur' },
    { type: 'email', message: 'Por favor ingrese un correo electrónico válido', trigger: 'blur' }
  ]
})

const formRef = ref(null)

const checkScreenWidth = () => {
  const screenWidth = window.innerWidth
  isMobile.value = screenWidth < 600
}

const handleConfirm = async () => {
  loading.value = true // Start loading
  formRef.value.validate(async (valid) => {
    if (valid) {
      console.log('Validación de formulario exitosa')
      if (selectedFile.value) {
        console.log('Archivo seleccionado para subir:', selectedFile.value.raw)
        const url = await uploadFileToSupabase(selectedFile.value.raw)
        if (!url) {
          ElMessage.error('Error al subir la foto. Por favor, inténtalo de nuevo.')
          loading.value = false // Stop loading
          return
        }
        console.log('URL del archivo subido:', url)
        form.value.url = url
      } else {
        ElMessage.error('Por favor, sube una foto de tu niño/a.')
        loading.value = false // Stop loading
        return
      }

      try {
        console.log('Enviando formulario a la base de datos')
        const { data, error } = await $supabase
          .from('ceteco_concurso')
          .insert([form.value])

        if (error) {
          throw error
        }

        console.log('Formulario enviado con éxito:', data)
        ElMessage.success('Formulario enviado con éxito')
        dialogVisible.value = false
        resetForm()
        await fetchParticipantes() // Fetch participants after successful form submission
      } catch (error) {
        ElMessage.error('Error al enviar el formulario')
        console.error('Error al enviar el formulario:', error)
      }
    } else {
      ElMessage.error('Por favor completa todos los campos obligatorios')
    }
    loading.value = false // Stop loading
  })
}

const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    edad: '',
    ciudad: '',
    nombre_padres: '',
    numero_de_identidad: '',
    telefono: '',
    tipo_leche: '',
    url: ''
  }
  fileList.value = []
  selectedFile.value = null
}

const handleOpen = () => {
  dialogVisible.value = true
}

const handleClose = () => {
  dialogVisible.value = false
}

const handleExceed = () => {
  ElMessage.warning('Solo puedes subir una foto')
}

const handleFileChange = (file, fileList) => {
  console.log('Archivo añadido:', file)
  console.log('Lista de archivos actualizada:', fileList)
  if (fileList.length > 1) {
    handleRemove(fileList[0], fileList)
  }
  selectedFile.value = file
  imageUrl.value = URL.createObjectURL(file.raw)
}

const handleRemove = (file, fileList) => {
  fileList.length = 0
  imageUrl.value = null
  selectedFile.value = null
}

const currentPage = ref(1)
const pageSize = ref(16)
const totalParticipants = ref(0)

const fetchParticipantes = async () => {
  try {
    const from = (currentPage.value - 1) * pageSize.value
    const to = currentPage.value * pageSize.value - 1

    const { data, error, count } = await $supabase
      .from('ceteco_concurso')
      .select('*', { count: 'exact' })
      .order('id', { ascending: false })
      .range(from, to)
      .eq('aprobado', true) 
    if (error) {
      throw error
    }

    participantes.value = data
    totalParticipants.value = count
  } catch (error) {
    console.error('Error al obtener participantes:', error)
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchParticipantes()
}

onMounted(() => {
  checkScreenWidth()
  window.addEventListener('resize', checkScreenWidth)
  fetchParticipantes() // Fetch participants on component mount
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenWidth)
})

const uploadFileToSupabase = async (file) => {
  if (!file) {
    console.log('No hay archivo para subir')
    return null
  }

  const uuid = uuidv4()
  const fileName = `ceteco/${uuid}-${file.name}`

  const { data, error } = await $supabase.storage
    .from('storage')
    .upload(fileName, file)

  if (error) {
    console.error('Error al subir archivo:', error)
    return null
  }

  const url = `https://wtzcjehvfofuphkmvsru.supabase.co/storage/v1/object/public/storage/${fileName}`
  console.log('Archivo subido con éxito. URL:', url)
  return url
}

const buttonStyle = computed(() => ({
  height: '55px',
  backgroundColor: acceptedTerms.value ? 'yellow' : 'gray',
  color: acceptedTerms.value ? 'red' : 'white',
  fontWeight: '900',
  width: '200px',
  cursor: acceptedTerms.value ? 'pointer' : 'not-allowed'
}))
</script>




<style>
.el-form-item__label {
  justify-content: flex-start !important;
  font-weight: 350;
  width: 100%!important;
}\]

.imageParticipantes {
  height: 40px;
  margin-top: 50px;
  margin-left: 50px;
}

.containerParticipantes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  padding: 20px;
  background-image: url('../images/white.svg');
  justify-content: center;
  background-size: cover;
  align-items: center;
  width: 100%;
  margin-top: -50px;
  margin-bottom: 49px;
  padding: 60px 20px 50px 60px;
}

.card {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width:100%
}

.participante-img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  object-position: top;
}

.participante-name {
  padding: 10px;
  text-align: center;
  font-weight: 500;
}

label {
  height: 0px;
}

.menu-hidden {
  display: none;
}

.menu-visible {
  display: flex;
}

.el-form-item {
  flex-direction: column;
}

.el-input__wrapper {
  height: 45px;
}

.el-upload-list--picture-card .el-upload-list__item {
  width: 100%!important;
  height: 550px;
}

.el-upload-list--picture-card {
  --el-upload-picture-card-size: 100%!important;
  width: 100%;
}

.el-upload--picture-card {
  --el-upload-picture-card-size: 100%!important;
  width: 100%;
  height: 200px;
}

.disabled {
  pointer-events: none;
  opacity: 0.5;
}
</style>
>