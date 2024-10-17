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

        <div class="containerGanador"> 

        </div>
      </div>

    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useNuxtApp } from '#app'

const { $supabase } = useNuxtApp()

// Función para obtener los datos de la tabla ceteco_genio de forma aleatoria y limitada a 200 registros
const getGenioData = async () => {
  try {
    const { data, error } = await $supabase
      .from('ceteco_genio')
      .select('*')
      .order('id', { ascending: false }) // Simular orden aleatorio
      .limit(200)  // Limitar a 200 registros

    if (error) throw error

    // Mandamos los datos a consola
    console.log('Datos de ceteco_genio (aleatorio, limitado a 200):', data)

  } catch (error) {
    console.error('Error al obtener datos de ceteco_genio:', error)
  }
}

// Ejecutamos la consulta cuando el componente esté montado
onMounted(() => {
  getGenioData()
})

</script>

<style scoped>
.ganadorB{
  width: 400px;
  padding: 100px;
} 

.header-genio{
  width: 1000px;
  position: relative;
  z-index: 10;
}

.containerGanador{
  background-color: red;
  padding: 15px 30px;
  width: 500px;
  height: 50px;
  border-radius: 50px;
  border: 5px solid #fc7a7aca;
  margin-top: -70px;
  overflow: hidden;
}

.containerResultado{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 0px;
  padding-bottom: 70px;
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

  .containerGanador{
    width: 80%;
  margin-top: ;}
  
  .header-image {
    width: 200px;
  }
}
</style>
