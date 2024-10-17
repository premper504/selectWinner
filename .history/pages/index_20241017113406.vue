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


      <div class="containerResultado">
        <img
          class="header-genio"
          src="assets/images/ceteco___cumpledeseo.png"
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
  width: 400px;
  padding: 100px;
} 

.header-genio{
width: 1000px;
}

.containerResultado{
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 0px;
  padding-bottom: ;
}

@media screen and (max-width: 768px) {
  .ganadorB{
  width: 90%;

  padding: 0px;
  padding-top: 80px;
} 

.header-genio{
width: 90%;
}
.header-image {
  width: 200px;
}
}
</style>
