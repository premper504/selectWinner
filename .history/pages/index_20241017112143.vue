<template>
  <div class="main-body">
    <section class="header-section">
      <div class="header-container">
        <img
          class="header-image"
          src="assets/images/logoCeteco.png"
          alt="Cumple Deseo"
        />
      
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
import { ElMessageBox } from 'element-plus';
import {Icon} from '@iconify/vue';


const { $supabase } = useNuxtApp()
const imageUrl = ref(null)
const loading = ref(false)
const fileList = ref([])
const selectedFile = ref(null)
const acceptedTerms = ref(false)

const showSuccessModal = () => {
  ElMessageBox.alert('El formulario ha sido enviado con éxito.', 'Éxito', {
    confirmButtonText: 'OK',
    type: 'success',
  });
};
const form = ref({
  name: '',
  dni: '',
  phone: '',
  email: '',
  state: '',
  place: '',
  product: '',
  reciepCode: '', 
  url: ''
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
  loading.value = true; // Iniciar el estado de carga
  formRef.value.validate(async (valid) => {
    if (valid) {
      if (selectedFile.value) {
        const url = await uploadFileToSupabase(selectedFile.value.raw);
        if (!url) {
          ElMessage.error('Error al subir la factura. Por favor, inténtalo de nuevo.');
          loading.value = false;
          return;
        }
        form.value.url = url; // Asignar la URL al campo correcto
      } else {
        ElMessage.error('Por favor, sube la factura.');
        loading.value = false;
        return;
      }

      try {
        const { data, error } = await $supabase.from('ceteco_genio').insert([form.value]);
        if (error) throw error;

        // Mostrar mensaje de éxito
        ElMessage.success('Formulario enviado con éxito');
        
        // Restablecer el formulario y el estado
        resetForm();
        showSuccessModal(); // Asegúrate de que el modal de éxito se muestre
      } catch (error) {
        ElMessage.error('Error al enviar el formulario');
        console.error(error);
      }
    } else {
      ElMessage.error('Por favor completa todos los campos obligatorios');
    }
    loading.value = false; // Detener el estado de carga
  });
};



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


const departments = [
  'Atlántida',
  'Choluteca',
  'Colón',
  'Comayagua',
  'Copán',
  'Cortés',
  'El Paraíso',
  'Francisco Morazán',
  'Gracias a Dios',
  'Intibucá',
  'Islas de la Bahía',
  'La Paz',
  'Lempira',
  'Ocotepeque',
  'Olancho',
  'Santa Bárbara',
  'Valle',
  'Yoro'
]


const handleFileChange = (file) => {
  selectedFile.value = file
  imageUrl.value = URL.createObjectURL(file.raw)
}

const handleRemove = () => {
  selectedFile.value = null;
  imageUrl.value = null;
  progress.value = 0;
}

const handleExceed = () => {
  ElMessage.warning('Solo puedes subir un archivo')
}

const beforeUpload = async (file) => {
  uploading.value = true;
  progress.value = 0;

  const uploadUrl = await uploadFileToSupabase(file.raw);

  if (uploadUrl) {
    selectedFile.value.url = uploadUrl; // Guarda la URL del archivo subido
    ElMessage.success('Archivo subido correctamente');
  } else {
    ElMessage.error('Error al subir el archivo');
  }

  uploading.value = false;
}

const uploadFileToSupabase = async (file) => {
  const uuid = uuidv4();

  const cleanFileName = file.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Elimina acentos
    .replace(/\s+/g, '_') // Reemplaza espacios por guiones bajos
    .replace(/[^a-zA-Z0-9._-]/g, ''); // Elimina cualquier otro carácter que no sea alfanumérico, punto, guion bajo o guion

  const fileName = `cetecogenio/${uuid}-${cleanFileName}`;
  
  try {
    const { data, error } = await $supabase
      .storage
      .from('storage')
      .upload(fileName, file, {
        onUploadProgress: (event) => {
          progress.value = Math.round((event.loaded * 100) / event.total);
        }
      });

    if (error) throw error;

    return `https://wtzcjehvfofuphkmvsru.supabase.co/storage/v1/object/public/storage/${fileName}`;
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return null;
  }
};


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
