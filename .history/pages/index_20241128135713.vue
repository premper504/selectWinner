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

      <!-- Texto de Felicitaciones -->
   

      <!-- Diálogo con el ganador -->
      <el-dialog v-model="showWinnerDialog" title="¡Tenemos Ganador/a!" width="70%">
        <div class="dialog-content">
     
            <div class="dialog-text" style="font-size: 40px; font-weight: 900;">  {{ selectedWinner?.name }} </div>
       
          <p class="dialog-text" v-if="!selectedPrize">
            <strong>Seleccionando premio aleatorio...</strong>
          </p>

          <div class="prize-display">
            <img :src="currentPrize" alt="Premio seleccionado" class="prize-image" />
          </div>

          <p v-if="selectedPrize" class="dialog-text prize-announcement">
            ¡Has ganado: <strong> {{ selectedPrize.name }}!</strong> 
          </p>
        </div>
        <div ref="congratsText" class="congrats-text" v-show="showCongrats">
        ¡ FELICIDADES !
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

      <!-- Botón para nuevo ganador -->
      <div class="newGanador">
      
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useNuxtApp } from "#app";
import gsap from "gsap";
import confetti from 'canvas-confetti';
let confettiFrame = null;




const { $supabase } = useNuxtApp();
const PARTICIPANTS_TABLE = "participantes_genio";

// Variables
const participants = ref([]);
const namesContainer = ref(null);
const displayNames = ref([]);
const showResult = ref(false);
const showWinnerDialog = ref(false); // Control del diálogo del ganador
const selectedWinner = ref(null); // Ganador seleccionado
const selectedPrize = ref(null)
const preloadedPrizes = ref(new Map());
const showCongrats = ref(false);
const isAnimating = ref(false);

const prizes = ref([
  "/assets/images/band.png",
  "/assets/images/dinero.png",
  "/assets/images/moto.png",
  "/assets/images/movil.png",
  "/assets/images/nintendo.png",
]);


const preloadPrizeImages = () => {
  return Promise.all(
    prizes.value.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
    })
  );
};

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


const resetAndSelectNewWinner = async () => {
  // Detener el confeti
  stopConfetti();
  
  // Ocultar elementos actuales
  showCongrats.value = false;
  showWinnerDialog.value = false;
  showResult.value = false;
  
  // Resetear variables
  selectedWinner.value = null;
  selectedPrize.value = null;
  currentPrize.value = prizes.value[0];
  
  // Recargar los participantes
  await getGenioData();
  
  // Pequeña pausa para asegurar que todo se ha reseteado
  setTimeout(() => {
    // Iniciar nueva selección
    startSelection();
  }, 100);
};


// Función para animar los premios
const startPrizeAnimation = () => {
  if (isAnimating.value) return;
  
  isAnimating.value = true;
  currentPrizeIndex.value = 0;
  
  const animate = () => {
    if (!isAnimating.value) return;
    
    currentPrizeIndex.value = (currentPrizeIndex.value + 1) % prizes.value.length;
    currentPrize.value = prizes.value[currentPrizeIndex.value];
    
    // Forzar actualización del DOM
    requestAnimationFrame(() => {
      const prizeImage = document.querySelector('.prize-image');
      if (prizeImage) {
        prizeImage.style.opacity = '0';
        setTimeout(() => {
          prizeImage.src = currentPrize.value;
          prizeImage.style.opacity = '1';
        }, 50);
      }
    });
  };

  prizeInterval = setInterval(animate, 200);
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
    console.log('Obteniendo premios activos de Supabase')
    const { data, error } = await $supabase
      .from('ceteco_premios')
      .select('*')
      .eq('active', true)

    if (error) {
      console.error('Error al obtener premios:', error)
      throw error
    }
    
    console.log('Premios disponibles:', data)
    if (data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length)
      console.log('Premio seleccionado índice:', randomIndex)
      return data[randomIndex]
    }
    return null
  } catch (error) {
    console.error('Error al obtener premio aleatorio:', error)
    return null
  }
}


const stopConfetti = () => {
  // Cancelar el frame de animación
  if (confettiFrame) {
    cancelAnimationFrame(confettiFrame);
    confettiFrame = null;
  }
  
  confetti.reset();
};


const spinSlotMachine = async () => {
  isSpinning.value = true
  try {
    console.log('Iniciando selección de ganador')
    const duration = 7
    const itemHeight = 60
    const winnerIndex = Math.floor(Math.random() * participants.value.length)

    const totalDistance = participants.value.length * itemHeight

    await gsap.to(namesContainer.value, {
      y: -totalDistance,
      duration: duration,
      ease: "power2.inOut"
    })

    gsap.set(namesContainer.value, { y: 0 })
    await gsap.to(namesContainer.value, {
      y: -(winnerIndex * itemHeight),
      duration: 0.1,
      ease: "bounce.out"
    })

    // Seleccionar ganador y premio
    const winner = participants.value[winnerIndex]
    selectedWinner.value = winner
    console.log('Ganador seleccionado:', winner)

    await preloadPrizeImages();

    // Mostrar el diálogo y comenzar animación de premios
    showWinnerDialog.value = true
    console.log('Mostrando diálogo de ganador')
    startPrizeAnimation()

    // Obtener y precargar el premio final mientras se muestra la animación
    const finalPrize = await getRandomPrize()
    
    // Precargar la imagen del premio seleccionado
    if (finalPrize) {
      await new Promise((resolve) => {
        const img = new Image()
        img.onload = resolve
        img.src = finalPrize.image
      })
    }

    // Después de un tiempo y con la imagen ya precargada, mostrar el premio final
    setTimeout(async () => {
      stopPrizeAnimation()

      if (finalPrize) {
        selectedPrize.value = finalPrize
        currentPrize.value = finalPrize.image
        console.log('Premio seleccionado:', finalPrize)

        try {
          // Resto del código...
          await createWinnerEntry(winner, finalPrize)
          await markWinner(winner.id)
          await markPrizeAsInactive(finalPrize.id)

          showCongrats.value = true
          showContinuousConfetti()

          await gsap.to(namesContainer.value.children[winnerIndex], {
            scale: 1.5,
            duration: 0.3,
            ease: "power2.out"
          })

          await gsap.to(namesContainer.value.children[winnerIndex], {
            scale: 1,
            duration: 0.2,
            ease: "power2.in"
          })

        } catch (error) {
          console.error('Error en el proceso:', error)
        }
      }
    }, 3000)

  } catch (error) {
    console.error('Error en el proceso de selección:', error)
  } finally {
    isSpinning.value = false
  }
}



const markPrizeAsInactive = async (prizeId) => {
  const { error } = await $supabase
    .from('ceteco_premios')
    .update({ active: false })
    .eq('id', prizeId)

  if (error) {
    console.error('Error al marcar premio como inactivo:', error)
    throw error
  }
}

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
  console.log('Creando entrada con datos:', { winner, prize })
  try {
    const { data, error } = await $supabase
      .from('ganadoresCeteco')
      .insert({
        ganadorName: winner.name,
        ganadorDepartamento: winner.departamento,
        ganadorTelefono: winner.telefono,
        premio: prize.name // Usar el campo correcto del premio
      })

    if (error) throw error
    console.log('Entrada creada exitosamente:', data)
    return data
  } catch (error) {
    console.error('Error al crear entrada:', error)
    throw error
  }
}


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



const showContinuousConfetti = () => {
  // Asegurarse de que confetti está disponible
  if (typeof confetti === 'undefined') {
    console.error('Confetti no está disponible');
    return;
  }

  const end = Date.now() + (15 * 1000);
  const colors = ['#ff0000', '#ffffff', '#ff69b4'];

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
    zIndex: 3000,
  });

  frame();
};



onMounted(() => {
  getGenioData(); // Cargar los participantes inicialmente
});
</script>


<style scoped>
.ganadorB {
  width: 400px;
  padding: 100px;
  cursor: pointer;
  transition: transform 0.2s;
}

.ganadorB:hover {
  transform: scale(1.05);
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
  color: white;
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

.prize-announcement {
  font-size: 24px;
  color: #ff0000;
  margin-top: 20px;
}

.prize-display {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
  height: 250px;
  overflow: hidden;
}

.prize-image {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
  transition: opacity 0.3s ease;
}

.el-overlay-dialog{

  z-index: 200!important;
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

  .prize-announcement {
    font-size: 20px;
  }
}
</style>