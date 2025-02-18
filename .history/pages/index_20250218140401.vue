<template>
  <div class="main-body">
    <section class="header-section" v-show="!showResult">
      <div class="header-container">
        <img
          class="header-image"
          src="assets/images/tigrelogosula.png"
          alt="Cumple Deseo"
        />
        <div>

          <Button  class="ganadorB"  @click="startSelection" >
Seleccionar Ganador
          </Button >
        
        </div>
      </div>
    </section>

    <section class="result-section" v-show="showResult">
      <div class="containerResultado">
        <img
          class="header-genio"
          src="assets/images/tigrelogosula.png"
          alt="Cumple Deseo"
        />

        <div class="containerGanador">
          <div class="blur-overlay top"></div>
          <div ref="namesContainer" class="names-container">
            <div
              v-for="(participant, index) in displayNames"
              :key="index"
              class="name-item"
            >
              {{ participant.name }}
            </div>
          </div>
          <div class="blur-overlay bottom"></div>
        </div>
      </div>

      <!-- Diálogo con el ganador -->
      <el-dialog v-model="showWinnerDialog" title="¡Tenemos Ganador/a!" width="70%">
        <div class="dialog-content">
          <div class="dialog-text" style="font-size: 40px; font-weight: 900;">
            {{ selectedWinner?.name }} {{ selectedWinner?.lastname }}
          </div>
        </div>
        <div ref="congratsText" class="congrats-text" v-show="showCongrats">
          ¡FELICIDADES!
        </div>

        <template #footer>
          <el-button
            v-show="showCongrats"
            @click="resetAndSelectNewWinner"
            class="newGanadorB"
          >
            Nuevo Ganador
          </el-button>
        </template>
      </el-dialog>

      <!-- Botón para nuevo ganador (opcional) -->
      <div class="newGanador"></div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useNuxtApp } from "#app";
import gsap from "gsap";
import confetti from "canvas-confetti";

let confettiFrame = null;
const { $supabase } = useNuxtApp();
const PARTICIPANTS_TABLE = "jaguar";

// Variables reactivas
const participants = ref([]);
const namesContainer = ref(null);
const displayNames = ref([]);
const showResult = ref(false);
const showWinnerDialog = ref(false);
const selectedWinner = ref(null);
const showCongrats = ref(false);
const isSpinning = ref(false);

// Función para mezclar los nombres (sin duplicación)
const shuffleNames = (arr) => {
  return [...arr].sort(() => Math.random() - 0.5);
};

// Iniciar selección al hacer clic en el botón
const startSelection = async () => {
  if (!isSpinning.value) {
    // Si no hay participantes, evitamos iniciar la selección
    if (!participants.value.length) {
      console.error("No hay participantes para seleccionar.");
      return;
    }
    showResult.value = true;
    // Esperamos a que el DOM se actualice para que namesContainer ya esté renderizado
    await nextTick();
    spinSlotMachine();
  }
};

const resetAndSelectNewWinner = async () => {
  // Detener el confeti
  stopConfetti();

  // Ocultar elementos actuales
  showCongrats.value = false;
  showWinnerDialog.value = false;
  showResult.value = false;

  // Resetear variables
  selectedWinner.value = null;

  // Recargar los participantes
  await getGenioData();

  // Pequeña pausa para asegurar que todo se ha reseteado
  setTimeout(() => {
    startSelection();
  }, 100);
};

const stopConfetti = () => {
  if (confettiFrame) {
    cancelAnimationFrame(confettiFrame);
    confettiFrame = null;
  }
  confetti.reset();
};

const spinSlotMachine = async () => {
  isSpinning.value = true;
  try {
    console.log("Iniciando selección de ganador");
    const duration = 7;
    const itemHeight = 60;

    // Verificar que haya participantes
    if (!participants.value.length) {
      console.error("No hay participantes para animar");
      return;
    }

    const winnerIndex = Math.floor(Math.random() * participants.value.length);
    const totalDistance = participants.value.length * itemHeight;

    // Animación de desplazamiento total
    await gsap.to(namesContainer.value, {
      y: -totalDistance,
      duration: duration,
      ease: "power2.inOut"
    });

    // Resetear posición y animar hasta el ganador
    gsap.set(namesContainer.value, { y: 0 });
    await gsap.to(namesContainer.value, {
      y: -(winnerIndex * itemHeight),
      duration: 0.1,
      ease: "bounce.out"
    });

    // Seleccionar ganador
    const winner = participants.value[winnerIndex];
    selectedWinner.value = winner;
    console.log("Ganador seleccionado:", winner);

    // Mostrar el diálogo de ganador
    showWinnerDialog.value = true;

    // Actualizar la columna winner a true en la tabla "jaguar"
    await markWinner(winner.id);

    // Mostrar confeti y mensaje de felicitaciones
    showCongrats.value = true;
    showContinuousConfetti();

    // Animar el nombre del ganador
    await gsap.to(namesContainer.value.children[winnerIndex], {
      scale: 1.5,
      duration: 0.3,
      ease: "power2.out"
    });

    await gsap.to(namesContainer.value.children[winnerIndex], {
      scale: 1,
      duration: 0.2,
      ease: "power2.in"
    });
  } catch (error) {
    console.error("Error en el proceso de selección:", error);
  } finally {
    isSpinning.value = false;
  }
};

const markWinner = async (id) => {
  const { data, error } = await $supabase
    .from(PARTICIPANTS_TABLE)
    .update({ winner: true })  // Se edita el registro modificando la columna winner a true
    .eq("id", id);

  if (error) {
    console.error(`Error al marcar el ganador en ${PARTICIPANTS_TABLE}:`, error);
    throw error;
  } else {
    console.log(`Ganador marcado correctamente en ${PARTICIPANTS_TABLE}:`, data);
    return data;
  }
};

const getGenioData = async () => {
  try {
    const { data, error } = await $supabase
      .from(PARTICIPANTS_TABLE)
      .select("*")
      .eq("winner", false)
      .limit(900);

    if (error) throw error;

    console.log("Participantes obtenidos:", data.length);
    participants.value = shuffleNames(data);
    displayNames.value = [...participants.value];
  } catch (error) {
    console.error("Error al obtener datos:", error);
  }
};

const showContinuousConfetti = () => {
  if (typeof confetti === "undefined") {
    console.error("Confetti no está disponible");
    return;
  }

  const end = Date.now() + 15 * 1000;
  const colors = ["#ffffff", "#adff2f", "#ff69b4"];

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.3 },
      colors: colors,
      zIndex: 3000
    });

    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.3 },
      colors: colors,
      zIndex: 3000
    });

    if (Date.now() < end) {
      confettiFrame = requestAnimationFrame(frame);
    }
  };

  // Explosión inicial
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.3 },
    colors: colors,
    zIndex: 3000
  });

  frame();
};

onMounted(() => {
  getGenioData(); // Cargar los participantes inicialmente
});
</script>

<style scoped>
.ganadorB {
  min-width: 200px;
  padding: 20px 40px;
  border: 1px solid ;
  border-radius: 50px;
  font-size: 30px;
  cursor: pointer;
  background-color: rgb(163, 243, 44);
font-weight: bolder;
  transition: transform 0.2s;
}

.ganadorB:hover {
  transform: scale(1.05);
}

.header-genio {
  width: 700px;
  position: relative;
  z-index: 10;
  margin-top: 0px;
}

.containerGanador {
  background-color: #adff2f;
  padding: 15px 30px;
  width: 600px;
  height: 60px;
  border-radius: 50px;
  border: 5px solid rgb(138, 201, 43);
  margin-top: -20px;
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
  color: black;
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
  margin-top: 30px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.containerResultado {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 0px;
}

.newGanador {
  width: 100%;
  display: flex;
  margin-top: 30px;
  justify-content: center;
}

.newGanadorB {
  border-radius: 15px;
  background-color: red;
  color: #ffffff;
  font-size: 18px;
  padding: 12px 24px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.newGanadorB:hover {
  background-color: #e60000;
  transform: scale(1.05);
}

.header-image{
  width: 600px;}

.dialog-content {
  text-align: center;
}

.dialog-text {
  font-size: 22px;
  color: #333;
  margin: 15px 0;
  font-weight: 400;
}

.el-overlay-dialog {
  z-index: 200 !important;
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

  .congrats-text {
    font-size: 36px;
  }

  .dialog-text {
    font-size: 16px;
  }
}
</style>
