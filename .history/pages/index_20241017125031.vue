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
          <div class="blur-overlay top"></div>
          <div ref="namesContainer" class="names-container">
            <div v-for="(name, index) in displayNames" :key="index" class="name-item">
              {{ name }}
            </div>
          </div>
          <div class="blur-overlay bottom"></div>
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
  displayNames.value = [...names.value, ...names.value] // Nombres duplicados para un efecto continuo
}

const spinSlotMachine = () => {
  const duration = 10 // Aumentamos la duración para mayor suspenso
  const itemHeight = 60 // Altura de cada nombre
  const totalDistance = names.value.length * itemHeight
  const winnerIndex = Math.floor(Math.random() * names.value.length)

  gsap.to(namesContainer.value, {
    y: -totalDistance, // Movemos el contenedor para el efecto rápido
    duration: duration, // Duración total de la animación
    ease: "power2.out", // Desaceleración progresiva para mayor suspenso
    onComplete: () => {
      // Finalmente se ajusta al nombre del ganador con una animación suave
      gsap.to(namesContainer.value, {
        y: -(winnerIndex * itemHeight),
        duration: 2, // Animación lenta y suave al final
        ease: "power3.out", // Efecto suave para detenerse
        onComplete: () => {
          // Efecto de agrandamiento para el ganador
          gsap.to(namesContainer.value.children[winnerIndex], {
            scale: 1.5,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
              gsap.to(namesContainer.value.children[winnerIndex], {
                scale: 1,
                duration: 0.2,
                ease: "power2.in"
              })
            }
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
  width: 600px;
  height: 60px;
  border-radius: 50px;
  border: 5px solid #fc7a7aca;
  margin-top: -70px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.names-container {
  display: flex;
  margin-top: 18px;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  transition: transform 0.1s ease;
}

.name-item {
  height: 60px;
  font-size: 24px;
  color: white;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap; /* Para que el texto no haga salto de línea */
  overflow: hidden;
  text-overflow: ellipsis; /* Para truncar texto si es necesario */
  max-width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
}

.blur-overlay {
  position: absolute;
  left: 0;
  right: 0;
  height: 20px;
  z-index: 1;
  backdrop-filter: blur(5px);
}

.blur-overlay.top {
  top: 0;
}

.blur-overlay.bottom {
  bottom: 0;
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
