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
            <div class="name-item">{{ currentName }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import gsap from 'gsap'

const { $supabase } = useNuxtApp()

const names = ref([])
const currentName = ref('')
const namesContainer = ref(null)

const shuffleNames = (arr) => {
  return [...arr].sort(() => Math.random() - 0.5)
}

const spinSlotMachine = () => {
  const duration = 7000 // 7 segundos en milisegundos
  const startTime = Date.now()
  const winnerIndex = Math.floor(Math.random() * names.value.length)

  const updateName = () => {
    const elapsedTime = Date.now() - startTime
    const progress = Math.min(elapsedTime / duration, 1)
    
    // Función de ease-out personalizada para una desaceleración más pronunciada
    const easeOutQuint = t => 1 + (--t) * t * t * t * t
    const easedProgress = easeOutQuint(progress)

    // Calcular el índice basado en el progreso
    const currentIndex = Math.min(
      Math.floor(easedProgress * names.value.length),
      names.value.length - 1
    )

    // Actualizar el nombre actual
    currentName.value = names.value[currentIndex]

    if (progress < 1) {
      // Continuar la animación
      requestAnimationFrame(updateName)
    } else {
      // Finalizar con el nombre ganador
      currentName.value = names.value[winnerIndex]
      
      // Efecto final de "asentamiento"
      gsap.to(namesContainer.value, {
        y: -10,
        duration: 0.1,
        yoyo: true,
        repeat: 3,
        ease: "power2.inOut"
      })
    }
  }

  updateName()
}

const getGenioData = async () => {
  try {
    const { data, error } = await $supabase
      .from('ceteco_genio')
      .select('name')
      .limit(300)

    if (error) throw error

    names.value = shuffleNames(data.map(item => item.name))
    spinSlotMachine()

  } catch (error) {
    console.error('Error al obtener datos de ceteco_genio:', error)
  }
}

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
  display: flex;
  justify-content: center;
  align-items: center;
}

.names-container {
  display: flex;
  flex-direction: column;
  transition: transform 0.1s ease;
}

.name-item {
  height: 50px;
  font-size: 22px;
  color: white;
  font-weight: 600!important;
  display: flex;
  justify-content: center;
  align-items: center;
text-align: center;}

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
