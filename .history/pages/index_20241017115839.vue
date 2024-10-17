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
          <div ref="winnerName" class="winner-name">
            {{ currentName }}
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
const currentName = ref('Buscando...')
const names = ref([]) // Lista de nombres obtenidos de Supabase
let shuffleTimeline = null  // Usamos GSAP timeline

// Función para hacer shuffle (desordenar)
const shuffleNames = (arr) => {
  return arr.sort(() => Math.random() - 0.5)
}

// Función para iniciar el efecto de shuffle y detenerlo gradualmente
const startShuffle = (winnerNameElement) => {
  const shuffleEffect = () => {
    shuffleTimeline = gsap.timeline()

    // Repetir el shuffle de nombres al inicio con rapidez y luego desacelerar
    shuffleTimeline.to(winnerNameElement, {
      duration: 0.05,  // Velocidad inicial rápida
      repeat: 30,  // Repeticiones para simular la búsqueda rápida
      onRepeat: () => {
        currentName.value = names.value[Math.floor(Math.random() * names.value.length)]
      },
    })

    // Desacelerar y detener en 5 segundos
    shuffleTimeline.to(winnerNameElement, {
      duration: 0.5,
      ease: 'power1.out',  // Desaceleración suave
      onComplete: () => {
        // Establecemos el nombre final al azar
        currentName.value = names.value[Math.floor(Math.random() * names.value.length)]
      }
    })
  }

  shuffleEffect()
}

// Función para obtener los datos de la tabla ceteco_genio
const getGenioData = async (winnerNameElement) => {
  try {
    const { data, error } = await $supabase
      .from('ceteco_genio')
      .select('name') // Solo obtenemos el nombre
      .limit(200) // Limitar a 200 registros

    if (error) throw error

    // Guardamos los nombres obtenidos en el array names
    names.value = shuffleNames(data.map(item => item.name))

    // Iniciar el shuffle al obtener los datos
    startShuffle(winnerNameElement)

  } catch (error) {
    console.error('Error al obtener datos de ceteco_genio:', error)
  }
}

// Ejecutamos la consulta cuando el componente esté montado
onMounted(() => {
  // Accedemos al elemento con ref para aplicar animaciones
  const winnerNameElement = document.querySelector('.winner-name')
  getGenioData(winnerNameElement)
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

.winner-name {
  font-size: 24px;
  color: white;
  font-weight: bold;
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
