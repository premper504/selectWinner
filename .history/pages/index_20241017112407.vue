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

.ganadorB{
  wid
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
