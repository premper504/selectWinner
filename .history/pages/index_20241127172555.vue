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
          <strong>Premio:</strong>
          {{ selectedPrize?.name || "No disponible" }}
        </p>

        <!-- Mostrar la imagen del premio seleccionado -->
        <div class="prize-display" v-if="selectedPrize?.image">
          <img :src="selectedPrize.image" alt="Premio seleccionado" class="prize-image" />
        </div>
        <div class="prize-display" v-else>
          <p>Sin imagen de premio</p>
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
import confetti from "canvas-confetti";

const { $supabase } = useNuxtApp();
const PARTICIPANTS_TABLE = "participantes_genio";
const PRIZES_TABLE = "ceteco_premios";

// Variables
const participants = ref([]);
const namesContainer = ref(null);
const displayNames = ref([]);
const showResult = ref(false);
const showWinnerDialog = ref(false); // Control del diálogo del ganador
const selectedWinner = ref(null); // Ganador seleccionado
const selectedPrize = ref(null); // Premio seleccionado
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

// Animar los premios
const startPrizeAnimation = () => {
  prizeInterval = setInterval(() => {
    currentPrizeIndex.value =
      (currentPrizeIndex.value + 1) % prizes.value.length;
    currentPrize.value = prizes.value[currentPrizeIndex.value];
  }, 100); // Cambiar imagen cada 100 ms
};

// Detener animación de premios
const stopPrizeAnimation = () => {
  if (prizeInterval) {
    clearInterval(prizeInterval);
    prizeInterval = null;
  }
};

// Seleccionar un premio aleatorio
const selectRandomPrize = async () => {
  try {
    const { data, error } = await $supabase
      .from(PRIZES_TABLE)
      .select("*")
      .eq("active", true);

    if (error) {
      console.error("Error al obtener premios activos:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn("No hay premios activos disponibles");
      return null;
    }

    const randomIndex = Math.floor(Math.random() * data.length);
    const prize = data[randomIndex];

    // Marcar el premio como "inactive"
    const { error: updateError } = await $supabase
      .from(PRIZES_TABLE)
      .update({ active: false })
      .eq("id", prize.id);

    if (updateError) {
      console.error("Error al marcar premio como inactivo:", updateError);
      throw updateError;
    }

    return prize;
  } catch (error) {
    console.error("Error seleccionando un premio:", error);
    return null;
  }
};

// Función principal que controla el "slot machine"
const spinSlotMachine = async () => {
  isSpinning.value = true; // Evita dobles procesos
  try {
    const duration = 7;
    const itemHeight = 60;
    const winnerIndex = Math.floor(Math.random() * participants.value.length);

    // Animación de los nombres
    const totalDistance = participants.value.length * itemHeight;
    await gsap.to(namesContainer.value, {
      y: -totalDistance,
      duration: duration,
      ease: "power2.inOut",
    });

    // Mostrar ganador
    gsap.set(namesContainer.value, { y: 0 });
    await gsap.to(namesContainer.value, {
      y: -(winnerIndex * itemHeight),
      duration: 0.1,
      ease: "bounce.out",
    });

    selectedWinner.value = participants.value[winnerIndex];

    // Animación de premios
    startPrizeAnimation();
    await new Promise((resolve) => setTimeout(resolve, 3000));
    stopPrizeAnimation();

    // Seleccionar premio
    selectedPrize.value = await selectRandomPrize();

    if (!selectedPrize.value) {
      console.warn("No se pudo seleccionar un premio.");
      selectedPrize.value = { name: "Sin premio", image: "" }; // Fallback
    }

    // Registrar ganador
    await markWinner(selectedWinner.value.id);
    await createWinnerEntry(selectedWinner.value, selectedPrize.value.name);

    // Mostrar popup
    showWinnerDialog.value = true;
    showConfetti(); // Mostrar confeti
  } catch (error) {
    console.error("Error en el proceso de selección del ganador:", error);
    showWinnerDialog.value = true; // Mostrar popup aunque haya errores
  } finally {
    isSpinning.value = false;
  }
};

// Mostrar confeti
const showConfetti = () => {
  confetti({
    particleCount: 300,
    spread: 120,
    origin: { y: 0.6 },
    disableForReducedMotion: true,
  });
};

// Marcar ganador como `winner = true`
const markWinner = async (id) => {
  await $supabase
    .from(PARTICIPANTS_TABLE)
    .update({ winner: true })
    .eq("id", id);
};

// Crear entrada en la tabla `ganadoresCeteco`
const createWinnerEntry = async (winner, prizeName) => {
  await $supabase.from("ganadoresCeteco").insert({
    ganadorName: winner.name,
    ganadorDepartamento: winner.departamento,
    ganadorTelefono: winner.telefono,
    premio: prizeName, // Agregar premio
  });
};

// Obtener participantes
const getGenioData = async () => {
  const { data } = await $supabase
    .from(PARTICIPANTS_TABLE)
    .select("*")
    .eq("winner", false)
    .limit(900);

  participants.value = shuffleNames(data);
  displayNames.value = [...participants.value];
};

onMounted(() => {
  getGenioData();
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
