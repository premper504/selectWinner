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
            <div v-for="(name, index) in visibleNames" :key="index" class="name-item">
              {{ name }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useNuxtApp } from '#app'
import gsap from 'gsap'

const { $supabase } = useNuxtApp()

const names = ref([])
const currentIndex = ref(0)
const namesContainer = ref(null)

const visibleNames = computed(() => {
  const visibleCount = 3 // Número de nombres visibles en la marquesina
  return [...Array(visibleCount)].map((_, i) => 
    names.value[(currentIndex.value + i) % names.value.length]
  )
})

const shuffleNames = (arr) => {
  return [...arr].sort(() => Math.random() - 0.5)
}

const spinSlotMachine = () => {
  const duration = 7000 // 7 segundos
  const startTime = Date.now()
  const totalRotations = names.value.length * 2 // Aumentamos las rotaciones para un efecto más rápido
  const winnerIndex = Math.floor(Math.random() * names.value.length)

  gsap.to(namesContainer.value, {
    y: `-${100 * totalRotations}%`,
    duration: duration / 1000,
    ease: "power2.inOut",
    onUpdate: () => {
      const progress = (Date.now() - startTime) / duration
      currentIndex.value = Math.floor(progress * totalRotations) % names.value.length
    },
    onComplete: () => {
      // Asegurarse de que termine en el ganador
      currentIndex.value = winnerIndex
      gsap.to(namesContainer.value, {
        y: `-${100 * winnerIndex}%`,
        duration: 0.5,
        ease: "bounce.out"
      })
    }
  })
}

const getGenioData = async () => {
  try {
    const { data, error } = await $supabase
      .from('ceteco_genio')
      .select('name')
      .limit(900)

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
  transition: transform 0.1s linear;
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