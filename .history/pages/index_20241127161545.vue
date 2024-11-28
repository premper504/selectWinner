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
            <div v-for="(participant, index) in displayNames" :key="index" class="name-item">
              {{ participant.name }}
              ../assets/images/premios/
            </div>
          </div>
          <div class="blur-overlay bottom"></div>
        </div>
      </div>

      <!-- Diálogo con el ganador -->
      <el-dialog v-model="showWinnerDialog" title="Ganador/a" width="50%">
        <p class="dialog-text">
          <strong>Ganador/a:</strong> {{ selectedWinner?.name }}
        </p>
        <p class="dialog-text">
          <strong>Seleccionando premio aleatorio...</strong>
        </p>

        <!-- Animación de premios -->
        <div class="prize-container">
          <img
            v-for="(prize, index) in prizes"
            :key="index"
            :src="prize"
            class="prize-item"
          />
        </div>



        <template #footer>
          <el-button @click="closeDialog">Cerrar</el-button>
        </template>
      </el-dialog>
    </section>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import gsap from 'gsap'
import confetti from 'canvas-confetti'

const { $supabase } = useNuxtApp()
const PARTICIPANTS_TABLE = 'participantes_genio'

// Variables
const participants = ref([])
const namesContainer = ref(null)
const displayNames = ref([])
const showResult = ref(false)
const showWinnerDialog = ref(false) // Control del diálogo del ganador
const selectedWinner = ref(null) // Ganador seleccionado
const prizes = ref([
  "../assets/images/premios/band.png",
  "../assets/images/premios/dinero.png",
  "../assets/images/premios/moto.png",
  "../assets/images/premios/movil.png",
  "../assets/images/premios/nintendo.png"
])
const isSpinning = ref(false)

// Función para mezclar los nombres (sin duplicación)
const shuffleNames = (arr) => {
  return [...arr].sort(() => Math.random() - 0.5)
}

// Iniciar selección al hacer clic en el botón
const startSelection = () => {
  if (!isSpinning.value) {
    showResult.value = true
    spinSlotMachine() // Inicia el proceso de selección
  }
}


const animatePrizes = () => {
  const container = document.querySelector('.prize-container')
  if (!container) return

  const items = container.querySelectorAll('.prize-item')
  gsap.to(items, {
    y: (i) => `-${i * 100}%`,
    duration: 2,
    repeat: -1,
    ease: "none",
    stagger: 0.2
  })
}
// Función principal que controla el "slot machine"

const spinSlotMachine = async () => {
  isSpinning.value = true // Activa la bandera para evitar dobles procesos
  try {
    const duration = 7
    const itemHeight = 60
    const winnerIndex = Math.floor(Math.random() * participants.value.length)

    // Calculamos la distancia total y la animación
    const totalDistance = participants.value.length * itemHeight

    // Animación inicial del scroll de nombres
    await gsap.to(namesContainer.value, {
      y: -totalDistance,
      duration: duration,
      ease: "power2.inOut"
    })

    // Resetear la posición y mostrar el ganador
    gsap.set(namesContainer.value, { y: 0 })
    await gsap.to(namesContainer.value, {
      y: -(winnerIndex * itemHeight),
      duration: 0.1,
      ease: "bounce.out"
    })

    // Marcar ganador y crear entrada en la tabla de ganadores
    const winner = participants.value[winnerIndex]
    selectedWinner.value = winner // Actualizar ganador seleccionado
    await markWinner(winner.id) // Marcamos el ganador en la tabla `participantes_genio`
    await createWinnerEntry(winner) // Creamos la entrada en `ganadoresCeteco`

    // Mostrar el diálogo del ganador y animar premios
    showWinnerDialog.value = true
    animatePrizes()
  } catch (error) {
    console.error('Error en el proceso de selección del ganador:', error)
  } finally {
    isSpinning.value = false // Restablece la bandera al finalizar
  }
}

// Función para cerrar el diálogo del ganador
const closeDialog = () => {
  showWinnerDialog.value = false
}

// Función para marcar el ganador en participantes_genio
const markWinner = async (id) => {
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

// Función para crear la entrada del ganador en ganadoresCeteco
const createWinnerEntry = async (winner) => {
  const { data, error } = await $supabase
    .from('ganadoresCeteco')
    .insert({
      ganadorName: winner.name,
      ganadorDepartamento: winner.departamento,
      ganadorTelefono: winner.telefono
    })

  if (error) {
    console.error('Error al crear el registro de ganador:', error)
    throw error
  } else {
    console.log('Registro de ganador creado correctamente')
    return data
  }
}

// Función para obtener los datos desde Supabase
const getGenioData = async () => {
  try {
    const { data, error } = await $supabase
      .from(PARTICIPANTS_TABLE)
      .select('*')
      .eq('winner', false) // Traer solo los que no son ganadores
      .limit(900)

    if (error) throw error

    participants.value = shuffleNames(data) // Mezclar participantes
    displayNames.value = [...participants.value] // Asignar a displayNames sin duplicar
  } catch (error) {
    console.error('Error al obtener datos:', error)
  }
}

onMounted(() => {
  getGenioData() // Cargar los participantes inicialmente
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

.newGanador{
  width: 100%;
  display: flex;
  margin-bottom: 50px;
  padding-bottom: 50px;
  justify-content: center;

}


.newGanadorB
{
  border-radius: 15px;
  background-color: red;
  color: white;

}


prize-container {
  position: relative;
  height: 120px; /* Ajusta el alto */
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.prize-item {
  position: absolute;
  width: 100px;
  height: auto;
  transition: transform 0.3s ease;
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
