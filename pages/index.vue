<template>
  <div class="main-body">
    <section class="header-section" v-show="!showResult">
      <div class="header-container">
        <div class="button-container">
          <Button class="ganadorB" @click="startSelection">
            Sorteo de Ganador
          </Button>
          
          <!-- Icono de configuración -->
          <Button class="configB" @click="toggleConfig">
            ⚙️
          </Button>
        </div>

        <!-- Panel de configuración -->
        <div class="config-panel" v-show="showConfig">
          <div class="config-item">
            <label>User list</label>
            <select v-model="selectedSegment" class="config-select">
          
              <option value="A">A</option>
             
              
            </select>
          </div>
          
          <div class="config-item">
            <label>Cantidad de ganadores:</label>
            <select v-model="winnersCount" class="config-select">
              <option value="1">1 Ganador</option>
              <option value="2">2 Ganadores</option>
              <option value="3">3 Ganadores</option>
              <option value="4">4 Ganadores</option>
              <option value="5">5 Ganadores</option>
            </select>
          </div>
          
                     <div class="config-actions">
             <Button class="config-apply" @click="applyConfig">
               Aplicar Configuración
             </Button>
           </div>
           
           <div class="config-reset-section">
             <Button class="config-reset-small" @click="confirmResetAllWinners">
               Reset All
             </Button>
           </div>
         </div>
      </div>
    </section>

    <section class="result-section" v-show="showResult">
      <div class="containerResultado">
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

      <!-- Diálogo con los ganadores -->
      <el-dialog v-model="showWinnerDialog" :title="getDialogTitle()" width="70%">
        <div class="dialog-content">
          <div v-for="(winner, index) in selectedWinners" :key="index" class="winner-item">
            <div class="winner-position">{{ getWinnerPosition(index) }}</div>
            <div class="dialog-text" style="font-size: 32px; font-weight: 900;">
              {{ winner?.name }} {{ winner?.lastname }}
            </div>
          </div>
        </div>
        
        <div ref="congratsText" class="congrats-text" v-show="showCongrats">
          ¡FELICIDADES A {{ winnersCount > 1 ? 'TODOS LOS GANADORES' : 'NUESTRO GANADOR' }}!
        </div>

        <template #footer>
          <div class="modal-footer-buttons">
           
            <el-button
              v-show="showCongrats"
              @click="resetConfigAndGoToStart"
              class="resetConfigB"
            >
              Reset
            </el-button>

            
            <el-button
              v-show="showCongrats"
              @click="resetAndSelectNewWinner"
              class="newGanadorB"
            >
              Nuevo Sorteo
            </el-button>

          
          </div>
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
const PARTICIPANTS_TABLE = "tombola_lufussa";

// Variables reactivas
const participants = ref([]);
const namesContainer = ref(null);
const displayNames = ref([]);
const showResult = ref(false);
const showWinnerDialog = ref(false);
const selectedWinners = ref([]); // Cambiado de selectedWinner a selectedWinners (array)
const showCongrats = ref(false);
const isSpinning = ref(false);

// Variables de configuración
const showConfig = ref(false);
const selectedSegment = ref("A");
const winnersCount = ref("1");

// Función para mezclar los nombres (sin duplicación)
const shuffleNames = (arr) => {
  return [...arr].sort(() => Math.random() - 0.5);
};

// Toggle del panel de configuración
const toggleConfig = () => {
  showConfig.value = !showConfig.value;
};

// Aplicar configuración
const applyConfig = () => {
  console.log("Configuración aplicada:", {
    segment: selectedSegment.value,
    winnersCount: winnersCount.value
  });
  showConfig.value = false;
  // Recargar participantes con la nueva configuración
  getGenioData();
};

// Confirmación para reset de todos los ganadores
const confirmResetAllWinners = () => {
  if (confirm("¿Estás seguro que quieres hacer reset? Se perderán todos los ganadores.")) {
    resetAllWinners();
  }
};

// Reset de todos los ganadores en la BD
const resetAllWinners = async () => {
  try {
    console.log("Reseteando todos los ganadores...");
    
    const { data, error } = await $supabase
      .from(PARTICIPANTS_TABLE)
      .update({ winner: false })
      .eq("winner", true);

    if (error) {
      console.error("Error al resetear ganadores:", error);
      alert("Error al resetear ganadores. Por favor intenta de nuevo.");
      return;
    }

    console.log("Ganadores reseteados correctamente:", data);
    alert("✅ Todos los ganadores han sido reseteados exitosamente");
    
    // Recargar participantes
    await getGenioData();
    
  } catch (error) {
    console.error("Error en resetAllWinners:", error);
    alert("Error inesperado al resetear ganadores");
  }
};

// Reset de configuración y volver al inicio
const resetConfigAndGoToStart = () => {
  // Detener el confeti
  stopConfetti();
  
  // Resetear configuración
  selectedSegment.value = "A";
  winnersCount.value = "1";
  
  // Ocultar elementos del modal
  showCongrats.value = false;
  showWinnerDialog.value = false;
  showResult.value = false;
  
  // Resetear ganadores seleccionados
  selectedWinners.value = [];
  
  // Mostrar mensaje de reset
  console.log("Configuración reseteada");
  
  // Recargar participantes con configuración por defecto
  getGenioData();
};

// Obtener título del diálogo basado en cantidad de ganadores
const getDialogTitle = () => {
  return parseInt(winnersCount.value) > 1 ? "¡Tenemos Ganadores!" : "¡Tenemos Ganador/a!";
};

// Obtener posición del ganador (1°, 2°, etc.)
const getWinnerPosition = (index) => {
  const positions = ["1°", "2°", "3°", "4°", "5°"];
  return positions[index] || `${index + 1}°`;
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
  selectedWinners.value = [];

  // Recargar los participantes con la configuración actual
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
    console.log("Iniciando selección de ganador(es)");
    const duration = 12;
    const itemHeight = 60;
    
    if (!participants.value.length) {
      console.error("No hay participantes para animar");
      return;
    }
    
    // Seleccionar múltiples ganadores aleatorios
    const numberOfWinners = parseInt(winnersCount.value);
    const winnersIndices = [];
    const availableIndices = [...Array(participants.value.length).keys()];
    
    // Seleccionar ganadores únicos
    for (let i = 0; i < numberOfWinners && availableIndices.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      const selectedIndex = availableIndices.splice(randomIndex, 1)[0];
      winnersIndices.push(selectedIndex);
    }
    
    console.log("Índices de ganadores:", winnersIndices);
    
    const totalDistance = participants.value.length * itemHeight;
    const loops = 6;
    
    // Animación continua sin saltos visibles:
    await gsap.to(namesContainer.value, {
      y: -(totalDistance * loops),
      duration: duration,
      ease: "power2.inOut",
      modifiers: {
        y: (y) => {
          return (parseFloat(y) % totalDistance) + "px";
        }
      }
    });
    
    // Resetear la posición a 0 antes de detener en el primer ganador
    gsap.set(namesContainer.value, { y: 0 });
    
    // Animación final para detener en el primer ganador
    await gsap.to(namesContainer.value, {
      y: -(winnersIndices[0] * itemHeight),
      duration: 0.1,
      ease: "bounce.out"
    });
    
    // Seleccionar todos los ganadores
    const winners = winnersIndices.map(index => participants.value[index]);
    selectedWinners.value = winners;
    console.log("Ganadores seleccionados:", winners);
    showWinnerDialog.value = true;
    
    // Marcar todos los ganadores en la base de datos
    for (const winner of winners) {
      await markWinner(winner.id);
    }
    
    showCongrats.value = true;
    showContinuousConfetti();
    
    // Animar todos los ganadores (opcional)
    for (const index of winnersIndices) {
      if (namesContainer.value.children[index]) {
        await gsap.to(namesContainer.value.children[index], {
          scale: 1.5,
          duration: 0.3,
          ease: "power2.out"
        });
        await gsap.to(namesContainer.value.children[index], {
          scale: 1,
          duration: 0.2,
          ease: "power2.in"
        });
      }
    }
    
  } catch (error) {
    console.error("Error en el proceso de selección:", error);
  } finally {
    isSpinning.value = false;
  }
};

const markWinner = async (id) => {
  const { data, error } = await $supabase
    .from(PARTICIPANTS_TABLE)
    .update({ winner: true })
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
    console.log("Consultando tabla:", PARTICIPANTS_TABLE);
    console.log("Segmento seleccionado:", selectedSegment.value);
    
    let query = $supabase
      .from(PARTICIPANTS_TABLE)
      .select("*")
      .or("winner.is.null,winner.eq.false");
    
    // Aplicar filtro de segmento si está seleccionado
    if (selectedSegment.value && selectedSegment.value !== "") {
      query = query.eq("segment", selectedSegment.value);
    }
    
    const { data, error } = await query.limit(900);

    if (error) throw error;

    console.log("Participantes elegibles:", data.length);
    console.log("Configuración actual:", {
      segment: selectedSegment.value || "Todos",
      winnersCount: winnersCount.value
    });
    
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
  const colors = ["#ffffff", "#adff2f", "#161fc6", "#38a9f0"];

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
  getGenioData();
});
</script>

<style scoped>
.button-container {
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: center;
}

.ganadorB {
  min-width: 200px;
  padding: 20px 40px;
  border: 1px solid;
  border-radius: 50px;
  font-size: 30px;
  color: white;
  cursor: pointer;
  background-color: rgb(61, 44, 243);
  font-weight: bolder;
  transition: transform 0.2s;
}

.ganadorB:hover {
  transform: scale(1.05);
}

.configB {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #6c757d;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.configB:hover {
  background-color: #5a6268;
  transform: scale(1.1);
}

.config-panel {
  background: white;
  border: 2px solid #ddd;
  border-radius: 15px;
  padding: 25px;
  margin-top: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  max-width: 400px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.config-item {
  margin-bottom: 20px;
}

.config-item label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
  font-size: 16px;
}

.config-select {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.config-select:focus {
  outline: none;
  border-color: rgb(61, 44, 243);
}

.config-actions {
  text-align: center;
  margin-top: 25px;
}

.config-apply {
  background-color: rgb(61, 44, 243);
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.config-apply:hover {
  background-color: rgb(51, 34, 233);
  transform: scale(1.05);
}

.config-reset-section {
  margin-top: 15px;
  text-align: center;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.config-reset-small {
  background-color: #6c757d;
  color: white;
  padding: 8px 20px;
  border: none;
  border-radius: 15px;
  font-size: 12px;
  font-weight: normal;
  cursor: pointer;
  transition: all 0.3s ease;
}

.config-reset-small:hover {
  background-color: #dc3545;
  transform: scale(1.05);
}

.modal-footer-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.resetConfigB {
  border-radius: 15px;
  background-color: #6c757d;
  color: #ffffff;
  font-size: 18px;
  padding: 12px 24px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.resetConfigB:hover {
  background-color: #5a6268;
  transform: scale(1.05);
}

.result-section {
  padding-top: 50vh;
}

.containerGanador {
  background-color: #1d35cf;
  padding: 15px 30px;
  width: 600px;
  height: 60px;
  border-radius: 50px;
  border: 5px solid rgb(80, 43, 201);
  margin-top: -20px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  color: white;
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

.winner-item {
  margin-bottom: 20px;
  text-align: center;
}

.winner-position {
  font-size: 24px;
  font-weight: bold;
  color: #ff6b35;
  margin-bottom: 5px;
}

.congrats-text {
  font-size: 48px;
  margin-bottom: 30px;
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
  background-color: rgb(22, 31, 198);
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
    .button-container {
      flex-direction: column;
      gap: 15px;
    }
    
    .ganadorB {
      width: 90%;
      padding: 15px 30px;
      font-size: 24px;
    }

    .config-panel {
      margin: 20px 10px;
      padding: 20px;
    }
    
         .config-actions {
       flex-direction: column;
       gap: 10px;
     }
     
     .modal-footer-buttons {
       flex-direction: column;
       gap: 10px;
     }
    
    .modal-footer-buttons {
      flex-direction: column;
      gap: 10px;
    }

    .containerGanador {
      width: 80%;
      margin-top: -30px;
    }

    .congrats-text {
      font-size: 36px;
    }

    .dialog-text {
      font-size: 16px;
    }
    
    .winner-position {
      font-size: 20px;
    }
  }
</style>