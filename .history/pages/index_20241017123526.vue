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
            <div v-for="(name, index) in displayNames" :key="index" class="name-item">
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
import gsap from 'gsap'

const { $supabase } = useNuxtApp()

const names = ref([])
const namesContainer = ref(null)
const displayNames = ref([])

const shuffleNames = (arr) => {
  return [...arr].sort(() => Math.random() - 0.5)
}

const prepareDisplayNames = () => {
  displayNames.value = [...names.value, ...names.value]
}

const spinSlotMachine = () => {
  const duration =  // 7 segundos
  const itemHeight = 60 // Aumentado para más espacio entre nombres
  const totalDistance = names.value.length * itemHeight
  const winnerIndex = Math.floor(Math.random() * names.value.length)

  gsap.to(namesContainer.value, {
    y: -totalDistance,
    duration: duration,
    ease: "power2.inOut",
    onComplete: () => {
      // Reseteamos la posición y ajustamos al ganador
      gsap.set(namesContainer.value, { y: 0 })
      gsap.to(namesContainer.value, {
        y: -(winnerIndex * itemHeight),
        duration: 0.5,
        ease: "bounce.out",
        onComplete: () => {
          // Efecto de rebote para el ganador
          gsap.to(namesContainer.value.children[winnerIndex], {
            scale: 1.2,
            yoyo: true,
            repeat: 3,
            duration: 0.2,
            ease: "power2.inOut"
          })
        }
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
    prepareDisplayNames()
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
  height: 60px; /* Aumentado para asegurar que solo se vea un nombre */
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
  margin-top: 60px;
}

.name-item {
  height: 60px; /* Aumentado para más espacio entre nombres */
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