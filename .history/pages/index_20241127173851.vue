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
      <el-dialog v-model="showWinnerDialog" title="Ganador/a" width="50%">
        <p class="dialog-text">
          <strong>Ganador/a:</strong> {{ selectedWinner?.name }}
        </p>
        <p class="dialog-text">
          <strong>Seleccionando premio aleatorio...</strong>
        </p>

        <!-- Mostrar la imagen actual del premio -->
        <div class="prize-display">
          <img :src="currentPrize" alt="Premio seleccionado" class="prize-image" />
        </div>

        <template #footer>
          <el-button @click="closeDialog">Cerrar</el-button>
        </template>
      </el-dialog>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useNuxtApp } from "#app";
import gsap from "gsap";

const { $supabase } = useNuxtApp();
const PARTICIPANTS_TABLE = "participantes_genio";

// Variables
const participants = ref([]);
const namesContainer = ref(null);
const displayNames = ref([]);
const showResult = ref(false);
const showWinnerDialog = ref(false); // Control del diálogo del ganador
const selectedWinner = ref(null); // Ganador seleccionado
const prizes = ref([
  "/assets/images/band.png",
  "/assets/images/dinero.png",
  "/assets/images/moto.png",
  "/assets/images/movil.png",
  "/assets/images/nintendo.png",
]);
const currentPrizeIndex = ref(0); // Índice del premio actual
const currentPrize = ref(prizes.value[currentPrizeIndex.value]); // Premio actual
const isSpinning = ref(false);
let prizeInterval = null; // Intervalo para animar premios

// Función para mezclar los nombres (sin duplicación)
const shuffleNames = (arr) => {
  return [...arr].sort(() => Math.random() - 0.5);
};

// Iniciar selección al hacer clic en el botón
const startSelection = () => {
  if (!isSpinning.value) {
    showResult.value = true;
    spinSlotMachine(); // Inicia el proceso de selección
  }
};

// Función para animar los premios
const startPrizeAnimation = () => {
  prizeInterval = setInterval(() => {
    currentPrizeIndex.value =
      (currentPrizeIndex.value + 1) % prizes.value.length;
    currentPrize.value = prizes.value[currentPrizeIndex.value];
  }, 100); // Cambiar imagen cada 500 ms
};

// Detener animación de premios
const stopPrizeAnimation = () => {
  if (prizeInterval) {
    clearInterval(prizeInterval);
    prizeInterval = null;
  }
};

const getRandomPrize = async () => {
  try {
    const { data, error } = await $supabase
      .from('ceteco_premios')
      .select('*')
      .eq('active', true);

    if (error) throw error;
    
    if (data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      return data[randomIndex];
    }
    return null;
  } catch (error) {
    console.error('Error al obtener premio aleatorio:', error);
    return null;
  }
};



// Función principal que controla el "slot machine"
const spinSlotMachine = async () => {
  isSpinning.value = true;
  try {
    const duration = 7;
    const itemHeight = 60;
    const winnerIndex = Math.floor(Math.random() * participants.value.length);

    const totalDistance = participants.value.length * itemHeight;

    // Animación inicial del scroll de nombres
    await gsap.to(namesContainer.value, {
      y: -totalDistance,
      duration: duration,
      ease: "power2.inOut",
    });

    // Resetear la posición y mostrar el ganador
    gsap.set(namesContainer.value, { y: 0 });
    await gsap.to(namesContainer.value, {
      y: -(winnerIndex * itemHeight),
      duration: 0.1,
      ease: "bounce.out",
    });

    // Seleccionar ganador
    const winner = participants.value[winnerIndex];
    selectedWinner.value = winner;
    
    // Mostrar diálogo y comenzar animación
    showWinnerDialog.value = true;
    startPrizeAnimation();

    // Después de la animación, seleccionar el premio final
    setTimeout(async () => {
      stopPrizeAnimation();
      const finalPrize = await getRandomPrize();
      if (finalPrize) {
        selectedPrize.value = finalPrize;
        currentPrize.value = finalPrize.image_url;
        
        // Marcar ganador y crear entrada
        await markWinner(winner.id);
        await createWinnerEntry(winner, finalPrize);
      }
    }, 3000);

  } catch (error) {
    console.error("Error en el proceso de selección:", error);
  } finally {
    isSpinning.value = false;
  }
};


// Función para cerrar el diálogo del ganador
const closeDialog = () => {
  stopPrizeAnimation(); // Detener animación al cerrar
  showWinnerDialog.value = false;
};

// Función para marcar el ganador en participantes_genio
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

// Función para crear la entrada del ganador en ganadoresCeteco
const createWinnerEntry = async (winner, prize) => {
  const { data, error } = await $supabase.from("ganadoresCeteco").insert({
    ganadorName: winner.name,
    ganadorDepartamento: winner.departamento,
    ganadorTelefono: winner.telefono,
    premioId: prize.id,
    premioNombre: prize.nombre
  });

  if (error) {
    console.error("Error al crear el registro de ganador:", error);
    throw error;
  }
  return data;
};

// Función para obtener los datos desde Supabase
const getGenioData = async () => {
  try {
    const { data, error } = await $supabase
      .from(PARTICIPANTS_TABLE)
      .select("*")
      .eq("winner", false) // Traer solo los que no son ganadores
      .limit(900);

    if (error) throw error;

    participants.value = shuffleNames(data); // Mezclar participantes
    displayNames.value = [...participants.value]; // Asignar a displayNames sin duplicar
  } catch (error) {
    console.error("Error al obtener datos:", error);
  }
};

onMounted(() => {
  getGenioData(); // Cargar los participantes inicialmente
});
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


.dialog-text {
  font-size: 18px;
  color: #333;
  margin: 10px 0;
}

.prize-display {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  height: 250px;
  overflow: hidden;
}

.prize-image {
  width: 200px;
  height: auto;
  transition: opacity 0.3s ease;
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
