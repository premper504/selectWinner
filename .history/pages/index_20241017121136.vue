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
import gsap from 'gsap'

const { $supabase } = useNuxtApp()

const names = ref([])
let shuffleTimeline = null

const shuffleNames = (arr) => {
  return arr.sort(() => Math.random() - 0.5)
}

const startShuffle = (namesContainerElement) => {
  const totalNames = names.value.length;
  const itemHeight = 50;
  const duration = 30; // Aumentado a 30 segundos para una animación más lenta
  const shuffleDuration = 25; // Duración del efecto de mezcla
  const finalSelectionDuration = 5; // Duración de la selección final

  shuffleTimeline = gsap.timeline({
    repeat: 0,
    ease: "power1.inOut"
  });

  // Efecto de mezcla inicial
  shuffleTimeline.to(namesContainerElement, {
    y: -(totalNames * itemHeight),
    duration: shuffleDuration,
    ease: "none",
    onUpdate: () => {
      // Crear efecto de mezcla aleatoria durante la animación
      if (Math.random() < 0.1) { // 10% de probabilidad en cada frame
        gsap.to(namesContainerElement, {
          y: -Math.random() * totalNames * itemHeight,
          duration: 0.2,
          ease: "power1.inOut"
        });
      }
    }
  });

  // Selección final del ganador
  shuffleTimeline.to(namesContainerElement, {
    y: -(Math.floor(Math.random() * totalNames) * itemHeight),
    duration: finalSelectionDuration,
    ease: "elastic.out(1, 0.3)", // Efecto elástico para el final
    onComplete: () => {
      console.log("¡Ganador seleccionado!");
    }
  });
}

const getGenioData = async (namesContainerElement) => {
  try {
    const { data, error } = await $supabase
      .from('ceteco_genio')
      .select('name')
      .limit(300)

    if (error) throw error

    names.value = shuffleNames(data.map(item => item.name))
    startShuffle(namesContainerElement)

  } catch (error) {
    console.error('Error al obtener datos de ceteco_genio:', error)
  }
}

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
