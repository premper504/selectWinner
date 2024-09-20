<template>
  <div class="main-body">
    <section class="header-section">
      <div class="header-container">
        <img
          class="header-image"
          src="assets/images/ceteco___cumpledeseo.png"
          alt="Cumple Deseo"
        />
        <img
          src="assets/images/ceteco___premios.png"
          class="awards-image"
          alt="Premios Ceteco"
        />
        <div class="raffle-announcement">Participa en los sorteos quincenales</div>
      </div>
    </section>
    <div class="red-bar-container"></div>

    <section class="products-section">
      <div class="products-container">
        <img class="items-image" src="assets/images/items.png" alt="Items" />
        <img src="assets/images/latas.png" class="cans-image" alt="Latas Ceteco" />

        <div style="width: 80%;">
          <div class="form-container">
            <h2>Registro de Participación</h2>

            <el-form :model="form" :rules="rules" ref="formRef" label-width="250px" class="form-content">
              <el-form-item label="Nombre Completo" prop="name">
                <el-input v-model="form.name"></el-input>
              </el-form-item>

              <el-form-item label="DNI" prop="dni">
                <el-input v-model="form.dni"></el-input>
              </el-form-item>

              <el-form-item label="Teléfono" prop="phone">
                <el-input v-model="form.phone"></el-input>
              </el-form-item>

              <el-form-item label="Correo Electrónico" prop="email">
                <el-input v-model="form.email"></el-input>
              </el-form-item>

              <el-form-item label="Departamento" prop="state">
                <el-input v-model="form.state"></el-input>
              </el-form-item>

              <el-form-item label="Lugar donde se realizó la compra" prop="place">
                <el-input v-model="form.place"></el-input>
              </el-form-item>

              <el-form-item label="Producto Ceteco que adquiriste" prop="product">
                <el-input v-model="form.product"></el-input>
              </el-form-item>

              <el-form-item label="Número de factura" prop="reciepCode">
                <el-input v-model="form.reciepCode"></el-input>
              </el-form-item>
            </el-form>

            <div>
              <p class="verify-message">
                Antes de subir tu factura verifica que la fecha, código y productos CETECO que compraste son elegibles para poder participar.
              </p>

              <!-- File Upload Section -->
              <div>
                <p>Agregar factura de compra (subir archivo)</p>
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
                  <div class="upload-placeholder">
                    Seleccionar archivo   
                    <el-icon style="margin-left: 10px;"><Plus /> </el-icon>
                  </div>
                </el-upload>

                <div v-else class="upload-preview">
                  <img :src="imageUrl" alt="Factura" style="max-width: 100%; height: auto;">
                  <el-button @click="handleRemove(selectedFile, fileList)" type="danger" icon="el-icon-delete" circle>
                    <el-icon style="margin-left: -5px;"><Plus /> </el-icon>
                  </el-button>
                </div>
              </div>

              <div class="terms-section">
                <input type="checkbox" id="terms" v-model="acceptedTerms" />
                <label for="terms" class="terms-text">
                  Acepto los <a href="https://example.com/terminos" target="_blank">Términos y Condiciones</a>
                </label>
              </div>

              <div class="form-footer">
                <ElButton type="primary" @click="handleConfirm" :loading="loading" :disabled="!acceptedTerms" class="submit-button">Enviar</ElButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { v4 as uuidv4 } from 'uuid'
import { useNuxtApp } from '#app'

const { $supabase } = useNuxtApp()
const imageUrl = ref(null)
const loading = ref(false)
const fileList = ref([])
const selectedFile = ref(null)
const acceptedTerms = ref(false)

const form = ref({
  name: '',
  dni: '',
  phone: '',
  email: '',
  state: '',
  place: '',
  product: '',
  reciepCode: ''
})

const rules = ref({
  name: [{ required: true, message: 'Por favor ingrese el nombre completo', trigger: 'blur' }],
  dni: [{ required: true, message: 'Por favor ingrese el DNI', trigger: 'blur' }],
  phone: [{ required: true, message: 'Por favor ingrese el teléfono', trigger: 'blur' }],
  email: [{ required: true, message: 'Por favor ingrese un correo válido', trigger: 'blur', type: 'email' }],
  state: [{ required: true, message: 'Por favor ingrese el departamento', trigger: 'blur' }],
  place: [{ required: true, message: 'Por favor ingrese el lugar de compra', trigger: 'blur' }],
  product: [{ required: true, message: 'Por favor ingrese el producto', trigger: 'blur' }],
  reciepCode: [{ required: true, message: 'Por favor ingrese el número de factura', trigger: 'blur' }]
})

const formRef = ref(null)

const handleConfirm = async () => {
  loading.value = true
  formRef.value.validate(async (valid) => {
    if (valid) {
      if (selectedFile.value) {
        const url = await uploadFileToSupabase(selectedFile.value.raw)
        if (!url) {
          ElMessage.error('Error al subir la factura. Por favor, inténtalo de nuevo.')
          loading.value = false
          return
        }
        form.value.reciepCode = url
      } else {
        ElMessage.error('Por favor, sube la factura.')
        loading.value = false
        return
      }

      try {
        const { data, error } = await $supabase.from('ceteco_genio').insert([form.value])
        if (error) throw error
        ElMessage.success('Formulario enviado con éxito')
        resetForm()
      } catch (error) {
        ElMessage.error('Error al enviar el formulario')
        console.error(error)
      }
    } else {
      ElMessage.error('Por favor completa todos los campos obligatorios')
    }
    loading.value = false
  })
}

const resetForm = () => {
  form.value = {
    name: '',
    dni: '',
    phone: '',
    email: '',
    state: '',
    place: '',
    product: '',
    reciepCode: ''
  }
  fileList.value = []
  selectedFile.value = null
}

const handleFileChange = (file, fileList) => {
  if (fileList.length > 1) {
    handleRemove(fileList[0], fileList);
  }
  if (file) {
    selectedFile.value = file;
    imageUrl.value = URL.createObjectURL(file.raw);
  }
}

const handleRemove = (file, fileList) => {
  fileList.length = 0
  imageUrl.value = null
  selectedFile.value = null
}

const handleExceed = () => {
  ElMessage.warning('Solo puedes subir un archivo')
}

const uploadFileToSupabase = async (file) => {
  if (!file) return null

  const uuid = uuidv4()
  const fileName = `cetecogenio/${uuid}-${file.name}`
  const { data, error } = await $supabase.storage.from('storage').upload(fileName, file)

  if (error) {
    console.error('Error al subir archivo:', error)
    return null
  }

  return `https://wtzcjehvfofuphkmvsru.supabase.co/storage/v1/object/public/storage/${fileName}`
}
</script>

<style scoped>
.form-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  width: 100%;
}

.submit-button {
  width: 100%;
}

.red-bar-container {
  background-image: url('/assets/images/bar_roja.png');
  background-repeat: repeat-x;
  background-size: contain;
  background-position: top; /* Ajusta la posición si es necesario */
  width: 100%;
  height: 30px; /* Ajusta la altura según lo que necesites */
}


.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.verify-message {
  color: #f00;
  margin-bottom: 10px;
}

.terms-section {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.terms-text {
  margin-left: 10px;
  font-size: 14px;
}

.el-form-item {
  display: flex;
  flex-direction: column;
}


.el-form-item__label{

  justify-content: flex-start!important;


}

@media screen and (max-width: 768px) {
  .el-form-item {
    flex-direction: column;
  }
  
  .el-form-item label {
    display: block;
  }
}
</style>
