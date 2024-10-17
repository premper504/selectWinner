<template>
  <div class="main-body">
    <section class="header-section" v-show="!showResult">
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
            @click="startSelection"
          />
        </div>



      </div>
    </section>

    <section class="result-section" v-show="showResult">
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
              {{ name.name }}
            </div>
          </div>
          <div class="blur-overlay bottom"></div>
        </div>
      </div>
      <div ref="congratsText" class="congrats-text" v-show="showCongrats">FELICIDADES</div>
    </section>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import gsap from 'gsap'
import confetti from 'canvas-confetti'


const { $supabase } = useNuxtApp()
const PARTICIPANTS_TABLE = 'ceteco_genio'

const names = ref([])
const namesContainer = ref(null)
const displayNames = ref([])
const showResult = ref(false)
const showCongrats = ref(false)
const congratsText = ref(null)

const shuffleNames = (arr) => {
  return [...arr].sort(() => Math.random() - 0.5)
}

const prepareDisplayNames = () => {
  displayNames.value = [...names.value, ...names.value] // Duplicamos para que el scroll funcione correctamente
}

const startSelection = () => {
  showResult.value = true
  spinSlotMachine()
}



const spinSlotMachine = () => {
  const duration = 7
  const itemHeight = 60
  const totalDistance = names.value.length * itemHeight
  const winnerIndex = Math.floor(Math.random() * names.value.length)

  gsap.to(namesContainer.value, {
    y: -totalDistance,
    duration: duration,
    ease: "power2.inOut",
    onComplete: async () => {
      gsap.set(namesContainer.value, { y: 0 })
      gsap.to(namesContainer.value, {
        y: -(winnerIndex * itemHeight),
        duration: 0.5,
        ease: "bounce.out",
        onComplete: async () => {
          const winner = names.value[winnerIndex]
          console.log('Ganador ID :', winner.id)

          try {
            await markWinner(winner.id)
            await createWinnerEntry(winner)

            gsap.to(namesContainer.value.children[winnerIndex], {
              scale: 1.5,
              duration: 0.3,
              ease: "power2.out",
              onComplete: () => {
                gsap.to(namesContainer.value.children[winnerIndex], {
                  scale: 1,
                  duration: 0.2,
                  ease: "power2.in",
                  onComplete: showConfetti
                })
              }
            })
          } catch (error) {
            console.error('Error en el proceso de selección del ganador:', error)
          }
        }
      })
    }
  })
}
const showConfetti = () => {
  console.log("Ejecutando confetti...");
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
  
  showCongrats.value = true;
  if (congratsText.value) {
    gsap.from(congratsText.value, {
      y: 100,
      opacity: 0,
      duration: 1,
      ease: "bounce.out"
    });
  }
}

const testConfetti = () => {
  console.log("Testing confetti...");
  showConfetti();
}


// Función para marcar el ganador en ceteco_genio
const markWinner = async (id) => {
  console.log(`Intentando marcar ganador con id: ${id} en la tabla ${PARTICIPANTS_TABLE}`)

  const { data, error } = await $supabase
    .from(PARTICIPANTS_TABLE)
    .update({ winner: true })
    .eq('id', id)

  if (error) {
    console.error(`Error al marcar el ganador en ${PARTICIPANTS_TABLE}:`, error)
    throw error
  } else {
    console.log(`Ganador marcado correctamente en ${PARTICIPANTS_TABLE}:`, data)
    return data
  }
}

// Función para crear el registro en la tabla ganadoresCeteco
const createWinnerEntry = async (winner) => {
  console.log('Intentando crear entrada para el ganador:', winner)

  const { data, error } = await $supabase
    .from('ganadoresCeteco')
    .insert({
      ganadorName: winner.name,
      ganadorEmail: winner.email,
      ganadorUser: winner.id
    })

  if (error) {
    console.error('Error al crear el registro de ganador:', error)
    throw error // Lanzamos el error para manejarlo en spinSlotMachine
  } else {
    console.log('Registro de ganador creado correctamente')
    return data
  }
}




const createConfetti = () => {
  console.log("Creating confetti...");
  const container = document.getElementById('confetti-container');
  container.innerHTML = ''; // Clear previous confetti
  
  const confettiCount = 100;
  const colors = ['#ffd700', '#ff0000', '#00ff00', '#0000ff', '#ff00ff'];

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
    confetti.style.animationDelay = Math.random() * 5 + 's';
    
    container.appendChild(confetti);
  }

  console.log(`Created ${confettiCount} confetti elements`);

  setTimeout(() => {
    container.innerHTML = '';
    console.log("Confetti removed");
  }, 10000); // Remove after 10 seconds
}




const getGenioData = async () => {
  try {
    const { data, error } = await $supabase
      .from(PARTICIPANTS_TABLE)
      .select('id, name, email, winner') // Traer los datos necesarios
      .eq('winner', false) // Solo traemos los que no son ganadores aún
      .limit(900)

    console.log('Datos obtenidos de:', PARTICIPANTS_TABLE, '->',{ data, error })

    if (error) throw error

    names.value = shuffleNames(data) // Hacemos shuffle a los datos
    prepareDisplayNames()
    spinSlotMachine()

  } catch (error) {
    console.error('Error al obtener datos:', error)
  }
}

onMounted(() => {
  getGenioData()
  
})
</script>

<style scoped>
.ganadorB {
  width: 400px;
  padding: 100px;
}

.header-genio {
  width: 1000px;
  position: relative;
  z-index: 10;
  margin-top: -20px;
}

.containerGanador {
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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



#confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  animation: confettiFall 5s linear infinite;
}

@keyframes confettiFall {
  to {
    transform: translateY(100vh) rotate(720deg);
  }
}

.confetti-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10000;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}


.congrats-text {
  font-size: 48px;
  font-weight: bold;
  color: #ff0000;
  text-align: center;
  margin-top: -50px;
  margin-bottom: 50px;
}

.containerResultado {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 0px;
  padding-bottom: 70px;
}

@media screen and (max-width: 768px) {
  .ganadorB {
    width: 90%;
    padding: 0px;
    padding-top: 80px;
  }

  .header-genio {
    width: 95%;
  }

  .containerGanador {
    width: 80%;
    margin-top: -30px;
  }

  .header-image {
    width: 200px;
  }
}
</style>
