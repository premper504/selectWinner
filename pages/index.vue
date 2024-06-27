<template>


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
          <el-form-item label="Correo electrónico" prop="email">
            <el-input v-model="form.email"></el-input>
          </el-form-item>
          <el-form-item label="Edad" prop="edad">
            <el-input v-model="form.edad"></el-input>
          </el-form-item>
          <el-form-item label="Ciudad" prop="ciudad">
            <el-input v-model="form.ciudad"></el-input>
          </el-form-item>
          <el-form-item label="Nombre de los padres" prop="parents">
            <el-input v-model="form.nombre_padres"></el-input>
          </el-form-item>
          <el-form-item label="Número de identidad" prop="numero_de_identidad">
            <el-input v-model="form.numero_de_identidad"></el-input>
          </el-form-item>
          <el-form-item label="Celular" prop="telefono">
            <el-input v-model="form.telefono"></el-input>
          </el-form-item>
          <el-form-item style="line-height: 10px;" label="Tipo de leche" prop="tipo_leche">
            <el-input v-model="form.tipo_leche"></el-input>
          </el-form-item>
          <el-form-item style="line-height: 10px;" label="Cuál es el mayor sueño de tu hijo/a" prop="pregunta">
            <el-input v-model="form.pregunta"></el-input>
          </el-form-item>
        </el-form>
      </div>

      <div>
        <p>Agregar fotografía de tu niño posando originalmente</p>
        <el-upload
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
            <el-icon><Plus /></el-icon>
          </div>
        </el-upload>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="handleClose">Cancelar</ElButton>
          <ElButton type="primary" @click="handleConfirm()">Continuar</ElButton>
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
          <div class="text-block">DA CLICK EN "<strong>PARTICIPAR</strong>" Y LLENA EL FORMULARIO CON LA INFORMACIÓN DE TU HIJO/A Y TUYA</div>
        </div>
        <div class="number">
          <img src="../public/images/two.png" loading="lazy" alt="" class="image-7 dos">
          <div class="text-block">SUBE UNA FOTO DE TU NIÑO POSANDO ORIGINALMENTE.</div>
        </div>
        <div class="number">
          <img src="../public/images/three.png" loading="lazy" alt="" class="image-7 tres">
          <div class="text-block">ASEGURATE DE RESPONDER LA PREGUNTA: <strong>¿CUÁL ES EL MAYOR SUEÑO DE TU HIJO?</strong></div>
        </div>
      </div>
      <div class="botoncontainer">
        <a href="#" @click="handleOpen" class="button w-button">PARTICIPAR</a>
      </div>
    </div>
  </body>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { v4 as uuidv4 } from 'uuid'
import { useNuxtApp } from '#app'

const { $supabase } = useNuxtApp()

const dialogVisible = ref(false)
const isMobile = ref(false);
const fileList = ref([])
const selectedFile = ref(null)




const form = ref({
  name: '',
  email: '',
  edad: '',
  ciudad: '',
  nombre_padres: '',
  numero_de_identidad: '',
  telefono: '',
  tipo_leche: '',
  pregunta: '',
  url: ''
})

const rules = ref({
  name: [{ required: true, message: 'Por favor ingrese el nombre', trigger: 'blur' }],
  edad: [{ required: true, message: 'Por favor ingrese la edad', trigger: 'blur' }],
  ciudad: [{ required: true, message: 'Por favor ingrese la ciudad', trigger: 'blur' }],
  nombre_padres: [{ required: true, message: 'Por favor ingrese el nombre de los padres', trigger: 'blur' }],
  numero_de_identidad: [{ required: true, message: 'Por favor ingrese el número de identidad', trigger: 'blur' }],
  telefono: [{ required: true, message: 'Por favor ingrese el número de celular', trigger: 'blur' }],
  tipo_leche: [{ required: true, message: 'Por favor ingrese el tipo de leche', trigger: 'blur' }],
  pregunta: [{ required: true, message: 'Por favor ingrese el mayor sueño', trigger: 'blur' }],
  email: [{ required: true, message: 'Por favor ingrese correo electrónico', trigger: 'blur' }]
})

const formRef = ref(null)

const checkScreenWidth = () => {
  const screenWidth = window.innerWidth;
  isMobile.value = screenWidth < 600;
};

const handleConfirm = async () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      console.log('Validación de formulario exitosa')
      if (selectedFile.value) {
        console.log('Archivo seleccionado para subir:', selectedFile.value)
        const url = await uploadFileToSupabase(selectedFile.value)
        console.log('URL del archivo subido:', url)
        form.value.url = url
      } else {
        console.log('No hay archivos para subir')
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
      } catch (error) {
        ElMessage.error('Error al enviar el formulario')
        console.error('Error al enviar el formulario:', error)
      }
    } else {
      ElMessage.error('Por favor completa todos los campos obligatorios')
    }
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
    pregunta: '',
    url: ''
  }
  fileList.value = []
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
  console.log('selectedFile:', selectedFile.value)
}


const handleRemove = (file, fileList) => {
  fileList.length = 0 // Vaciar la lista de archivos
  console.log('Archivo eliminado:', file)
  console.log('Lista de archivos después de eliminar:', fileList)
}

onMounted(() => {
  checkScreenWidth();
  window.addEventListener('resize', checkScreenWidth);
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenWidth);
})
const uploadFileToSupabase = async (file) => {
  if (!file) {
    console.log('No hay archivo para subir')
    return null;
  }

  const uuid = uuidv4();
  console.log('Objeto de archivo:', file);
  console.log('Nombre del archivo:', file.name);

  const fileName = `ceteco/${uuid}-${file.name}`;
  console.log('Generando nombre de archivo:', fileName)
  
  // Usa directamente 'file' en lugar de 'file.raw'
  const { data, error } = await $supabase.storage
    .from('storage')
    .upload(fileName, file);

  if (error) {
    console.error('Error al subir archivo:', error);
    return null;
  }

  const url = `https://wtzcjehvfofuphkmvsru.supabase.co/storage/v1/object/public/storage/${fileName}`
  console.log('Archivo subido con éxito. URL:', url)
  return url;
};

</script>

<style>
.el-form-item__label {
  justify-content: flex-start !important;
  font-weight: 300;
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

.el-upload--picture-card{
  --el-upload-picture-card-size: 100%!important; 
  width: 100%;
  height: 200px;
}
</style>
