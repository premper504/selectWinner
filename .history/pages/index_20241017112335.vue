<template>
  <div class="main-body">
    <section class="header-section">
      <div class="header-container">
        <img
          class="header-image"
          src="assets/images/logoCeteco.png"
          alt="Cumple Deseo"
        />

        <div>
          <img
          class="ganadorB"
          src="assets/images/ganador.png"
          alt="Cumple Deseo"
        />

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
import { ElMessageBox } from 'element-plus';
import {Icon} from '@iconify/vue';


const { $supabase } = useNuxtApp()


const uploadFileToSupabase = async (file) => {

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
