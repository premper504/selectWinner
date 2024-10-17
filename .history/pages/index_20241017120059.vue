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
          <div ref="namesContainer" class="names-container">
            <div v-for="(name, index) in names" :key="index" class="name-item">
              {{ name }}
            </div>
          </div>
        </div>
      </div>

    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import gsap from 'gsap'  // Importamos GSAP

const { $supabase } = useNuxtApp()

// Variables reactivas
const names = ref([]) // Lista de nombres obtenidos de Supabase
let shuffleTimeline = null  // Usamos GSAP timeline

// Función para hacer shuffle (desordenar)
const shuffleNames = (arr) => {
  return arr.sort(() => Math.random() - 0.5)
}

// Función para iniciar el efecto de shuffle con movimiento vertical
const startShuffle = (namesContainerElement) => {
  const totalNames = names.value.length;
  const itemHeight = 50; // Altura de cada nombre en px
  const duration = 5; // Duración total de la animación

  // Creamos un timeline de GSAP
  shuffleTimeline = gsap.timeline({
    repeat: 0, // No repetir
    ease: "power1.inOut" // Movimiento suave
  });

  // Desplazamos el contenedor hacia arriba para simular el movimiento de los nombres
  shuffleTimeline.to(namesContainerElement, {
    y: -(totalNames * itemHeight), // Desplazamos el contenedor según el número de elementos
    duration: duration, // Duración de la animación
    onComplete: () => {
      // Al completar, elegimos el ganador final
      const winnerIndex = Math.floor(Math.random() * totalNames)
      gsap.to(namesContainerElement, {
        y: -(winnerIndex * itemHeight), // Ajustamos el scroll al nombre del ganador
        duration: 3,
        ease: "bounce.out" // Efecto de rebote al detenerse
      })
    }
  });
}

// Función para obtener los datos de la tabla ceteco_genio
const getGenioData = async (namesContainerElement) => {
  try {
    const { data, error } = await $supabase
      .from('ceteco_genio')
      .select('name') // Solo obtenemos el nombre
      .limit(300) // Limitar a 200 registros

    if (error) throw error

    // Guardamos los nombres obtenidos en el array names
    names.value = shuffleNames(data.map(item => item.name))

    // Iniciar el shuffle al obtener los datos
    startShuffle(namesContainerElement)

  } catch (error) {
    console.error('Error al obtener datos de ceteco_genio:', error)
  }
}

// Ejecutamos la consulta cuando el componente esté montado
onMounted(() => {
  const namesContainerElement = document.querySelector('.names-container')
  getGenioData(namesContainerElement)
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
  display: flex;
  justify-content: center;
  align-items: center;
}

.names-container {
  display: flex;
  flex-direction: column;
  transform: translateY(0);
}

.name-item {
  height: 50px;
  font-size: 24px;
  color: white;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
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
    width: 95%;
  }

  .containerGanador{
    width: 80%;
    margin-top: -30px;
  }

  .header-image {
    width: 200px;
  }
}
</style>
