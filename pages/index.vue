<template>
  <div class="main-body">
    <!-- PANTALLA 1: Selección de Sorteo -->
    <section class="selector-section" v-if="currentScreen === 'selector'">
      <div class="selector-container">
        <img src="/assets/images/tituloceteco.png" alt="Ceteco" class="main-logo" />
        <h2 class="selector-subtitle">Selecciona Sorteo</h2>

        <!-- Todos los Sorteos -->
        <div class="sorteo-group">
          <div class="sorteo-buttons">
            <button
              v-for="sorteo in smallSorteos"
              :key="sorteo.id"
              class="sorteo-btn small-btn"
              :class="{ 'completado': sorteo.progreso >= sorteo.total }"
              @click="seleccionarSorteo(sorteo.id)"
            >
              <span class="sorteo-id">{{ sorteo.id.toUpperCase() }}</span>
              <span class="sorteo-progreso">{{ sorteo.progreso }}/{{ sorteo.total }}</span>
            </button>
            <button
              v-for="sorteo in bigSorteos"
              :key="sorteo.id"
              class="sorteo-btn big-btn"
              :class="{ 'completado': sorteo.progreso >= sorteo.total }"
              @click="seleccionarSorteo(sorteo.id)"
            >
              <span class="sorteo-id">{{ sorteo.id.toUpperCase() }}</span>
              <span class="sorteo-progreso">{{ sorteo.progreso }}/{{ sorteo.total }}</span>
            </button>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="action-buttons">
          <button class="btn-historial" @click="verHistorial">
            📋 Ver Ganadores
          </button>
          <button class="btn-reset-all" @click="confirmResetAll">
            🔄 Reset Todo
          </button>
        </div>
      </div>
    </section>

    <!-- PANTALLA 2: Sorteo Activo -->
    <section class="sorteo-section" v-if="currentScreen === 'sorteo'">
      <div class="sorteo-header">
        <button class="btn-volver" @click="volverAlSelector">← Volver</button>
        <img src="/assets/images/tituloceteco.png" alt="Ceteco" class="sorteo-logo" />
        <span class="sorteo-progreso-header">{{ progresoActual }}/{{ sorteoActual?.total }}</span>
      </div>

      <!-- Premio actual -->
      <div class="premio-container" v-if="premioActual">
        <div class="premio-card">
          <img :src="premioActual.imagen" :alt="premioActual.nombre" class="premio-imagen" />
          <h3 class="premio-nombre">{{ premioActual.nombre }}</h3>
          <p class="premio-contador">Premio {{ premioActualNumero }} de {{ premioActual.cantidad }}</p>
        </div>
        <img src="/assets/images/genio.png" alt="Genio" class="genio-flotante" />
      </div>

      <!-- Mensaje si ya se completó -->
      <div class="sorteo-completado" v-else>
        <h3>🎉 ¡Sorteo Completado!</h3>
        <p>Todos los premios han sido entregados.</p>
      </div>

      <!-- Botón de sortear -->
      <div class="sorteo-actions">
        <button
          class="btn-sortear"
          @click="iniciarSorteo"
          :disabled="!premioActual || isSpinning"
          v-if="premioActual"
        >
          SORTEAR
        </button>
        <div class="sorteo-btns-secondary">
          <button class="btn-ganadores-sorteo" @click="verGanadoresSorteo">
            Ganadores
          </button>
          <button class="btn-reset-sorteo" @click="confirmResetSorteo">
            Reset {{ sorteoSeleccionado?.toUpperCase() }}
          </button>
        </div>
      </div>
    </section>

    <!-- PANTALLA 3: Animación del Sorteo -->
    <section class="animacion-section" v-if="currentScreen === 'animacion'">
      <div class="containerResultado">
        <img src="/assets/images/tituloceteco.png" alt="Ceteco" class="animacion-logo" />
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
        <img src="/assets/images/genio.png" alt="Genio" class="animacion-genio" />
      </div>
    </section>

    <!-- MODAL: Ganador -->
    <el-dialog v-model="showWinnerDialog" title="🎉 ¡Tenemos Ganador!" width="70%" :close-on-click-modal="false">
      <div class="dialog-content">
        <div class="winner-premio">
          <img :src="premioGanado?.imagen" :alt="premioGanado?.nombre" class="winner-premio-img" />
          <h3>{{ premioGanado?.nombre }}</h3>
        </div>
        <div class="winner-info">
          <p class="winner-codigo">{{ codigoGanador }}</p>
          <h2 class="winner-nombre">{{ ganadorActual?.name }}</h2>
        </div>
      </div>

      <div class="congrats-text" v-show="showCongrats">
        ¡FELICIDADES!
      </div>

      <template #footer>
        <div class="modal-footer-buttons">
          <el-button @click="cerrarYVolver" class="btn-modal-volver">
            Volver al Sorteo
          </el-button>
          <el-button @click="siguienteSorteo" class="btn-modal-siguiente" v-if="premioActual">
            Siguiente Premio →
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- MODAL: Historial de Ganadores -->
    <el-dialog v-model="showHistorial" title="📋 Historial de Ganadores" width="80%">
      <div class="historial-filtros">
        <select v-model="historialFiltro" class="filtro-select">
          <option value="">Todos los sorteos</option>
          <option v-for="id in Object.keys(sorteosConfig)" :key="id" :value="id">
            {{ id.toUpperCase() }}
          </option>
        </select>
      </div>
      <el-table :data="historialFiltrado" style="width: 100%" max-height="400">
        <el-table-column prop="codigo" label="Código" width="100" />
        <el-table-column prop="participante_nombre" label="Ganador" />
        <el-table-column prop="premio" label="Premio" />
        <el-table-column prop="created_at" label="Fecha" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useNuxtApp } from "#app";
import gsap from "gsap";
import confetti from "canvas-confetti";
import sorteosConfig from "~/config/sorteos.json";

const { $supabase } = useNuxtApp();

// Constantes
const PARTICIPANTS_TABLE = "ceteco_genio";
const SORTEOS_TABLE = "sorteos_genio";

// Estado de pantallas
const currentScreen = ref("selector"); // selector, sorteo, animacion

// Estado de sorteos
const sorteoSeleccionado = ref(null);
const progresosPorSorteo = ref({});
const premiosPorSorteo = ref({}); // Cuenta de premios entregados por tipo

// Estado del sorteo activo
const participants = ref([]);
const displayNames = ref([]);
const namesContainer = ref(null);
const isSpinning = ref(false);

// Estado del ganador
const ganadorActual = ref(null);
const premioGanado = ref(null);
const codigoGanador = ref("");
const showWinnerDialog = ref(false);
const showCongrats = ref(false);

// Historial
const showHistorial = ref(false);
const historialGanadores = ref([]);
const historialFiltro = ref("");

// Confetti
let confettiFrame = null;

// Computed
const smallSorteos = computed(() => {
  return Object.entries(sorteosConfig)
    .filter(([_, config]) => config.tipo === "small")
    .map(([id, config]) => ({
      id,
      ...config,
      progreso: progresosPorSorteo.value[id] || 0
    }));
});

const bigSorteos = computed(() => {
  return Object.entries(sorteosConfig)
    .filter(([_, config]) => config.tipo === "big")
    .map(([id, config]) => ({
      id,
      ...config,
      progreso: progresosPorSorteo.value[id] || 0
    }));
});

const sorteoActual = computed(() => {
  if (!sorteoSeleccionado.value) return null;
  return {
    id: sorteoSeleccionado.value,
    ...sorteosConfig[sorteoSeleccionado.value]
  };
});

const progresoActual = computed(() => {
  return progresosPorSorteo.value[sorteoSeleccionado.value] || 0;
});

const premioActual = computed(() => {
  if (!sorteoActual.value) return null;

  const premiosEntregados = premiosPorSorteo.value[sorteoSeleccionado.value] || {};
  const premios = sorteoActual.value.premios;

  // Filtrar premios que aún tienen disponibles (sin el marcado como ultimo)
  let disponibles = premios.filter(p => {
    const entregados = premiosEntregados[p.nombre] || 0;
    return entregados < p.cantidad && !p.ultimo;
  });

  // Si no hay disponibles (excepto ultimo), usar el ultimo
  if (disponibles.length === 0) {
    disponibles = premios.filter(p => {
      const entregados = premiosEntregados[p.nombre] || 0;
      return entregados < p.cantidad && p.ultimo;
    });
  }

  if (disponibles.length === 0) return null;

  // Seleccionar random entre disponibles
  return disponibles[Math.floor(Math.random() * disponibles.length)];
});

const premioActualNumero = computed(() => {
  if (!premioActual.value || !sorteoSeleccionado.value) return 0;
  const premiosEntregados = premiosPorSorteo.value[sorteoSeleccionado.value] || {};
  return (premiosEntregados[premioActual.value.nombre] || 0) + 1;
});

const historialFiltrado = computed(() => {
  if (!historialFiltro.value) return historialGanadores.value;
  return historialGanadores.value.filter(g => g.sorteo_id === historialFiltro.value);
});

// Funciones
const cargarProgresos = async () => {
  try {
    const { data, error } = await $supabase
      .from(SORTEOS_TABLE)
      .select("sorteo_id, premio");

    if (error) throw error;

    // Contar progreso por sorteo
    const progresos = {};
    const premios = {};

    data.forEach(row => {
      // Progreso total
      progresos[row.sorteo_id] = (progresos[row.sorteo_id] || 0) + 1;

      // Premios por tipo
      if (!premios[row.sorteo_id]) premios[row.sorteo_id] = {};
      premios[row.sorteo_id][row.premio] = (premios[row.sorteo_id][row.premio] || 0) + 1;
    });

    progresosPorSorteo.value = progresos;
    premiosPorSorteo.value = premios;

  } catch (error) {
    console.error("Error al cargar progresos:", error);
  }
};

const cargarParticipantes = async () => {
  try {
    const { data, error } = await $supabase
      .from(PARTICIPANTS_TABLE)
      .select("*")
      .eq("winner", false)
      .eq("participando", true)
      .eq("year", 2026);

    if (error) throw error;

    participants.value = shuffleArray(data);
    displayNames.value = [...participants.value];

  } catch (error) {
    console.error("Error al cargar participantes:", error);
  }
};

const cargarHistorial = async () => {
  try {
    const { data, error } = await $supabase
      .from(SORTEOS_TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    historialGanadores.value = data;

  } catch (error) {
    console.error("Error al cargar historial:", error);
  }
};

const seleccionarSorteo = async (id) => {
  sorteoSeleccionado.value = id;
  await cargarParticipantes();
  currentScreen.value = "sorteo";
};

const volverAlSelector = () => {
  sorteoSeleccionado.value = null;
  currentScreen.value = "selector";
};

const iniciarSorteo = async () => {
  if (!participants.value.length) {
    alert("No hay participantes disponibles");
    return;
  }

  if (isSpinning.value) return;

  currentScreen.value = "animacion";
  await nextTick();
  await spinSlotMachine();
};

const spinSlotMachine = async () => {
  isSpinning.value = true;

  try {
    const duration = 8;
    const itemHeight = 60;

    // Seleccionar ganador aleatorio
    const winnerIndex = Math.floor(Math.random() * participants.value.length);
    const winner = participants.value[winnerIndex];

    const totalDistance = participants.value.length * itemHeight;
    const loops = 5;

    // Animación
    await gsap.to(namesContainer.value, {
      y: -(totalDistance * loops),
      duration: duration,
      ease: "power2.inOut",
      modifiers: {
        y: (y) => (parseFloat(y) % totalDistance) + "px"
      }
    });

    gsap.set(namesContainer.value, { y: 0 });

    await gsap.to(namesContainer.value, {
      y: -(winnerIndex * itemHeight),
      duration: 0.5,
      ease: "bounce.out"
    });

    // Guardar ganador
    await guardarGanador(winner);

  } catch (error) {
    console.error("Error en sorteo:", error);
  } finally {
    isSpinning.value = false;
  }
};

const guardarGanador = async (winner) => {
  try {
    const sorteoId = sorteoSeleccionado.value;
    const progreso = (progresosPorSorteo.value[sorteoId] || 0) + 1;
    const codigo = `${sorteoId}-${progreso}`;
    const premio = premioActual.value;

    // Guardar en sorteos_genio
    const { error: errorSorteo } = await $supabase
      .from(SORTEOS_TABLE)
      .insert({
        codigo,
        sorteo_id: sorteoId,
        participante_id: winner.id,
        participante_nombre: winner.name,
        premio: premio.nombre,
        imagen_premio: premio.imagen
      });

    if (errorSorteo) throw errorSorteo;

    // Actualizar participante ganador
    const { error: errorParticipante } = await $supabase
      .from(PARTICIPANTS_TABLE)
      .update({ winner: true, codwinner: codigo })
      .eq("id", winner.id);

    if (errorParticipante) throw errorParticipante;

    // Marcar TODOS los registros con el mismo DNI como no participando
    // (una persona solo puede ganar una vez, aunque tenga múltiples compras)
    if (winner.dni) {
      const { error: errorDni } = await $supabase
        .from(PARTICIPANTS_TABLE)
        .update({ participando: false })
        .eq("dni", winner.dni)
        .eq("year", 2026);

      if (errorDni) throw errorDni;
    }

    // Actualizar estado local
    ganadorActual.value = winner;
    premioGanado.value = premio;
    codigoGanador.value = codigo;

    // Actualizar progresos
    progresosPorSorteo.value[sorteoId] = progreso;
    if (!premiosPorSorteo.value[sorteoId]) premiosPorSorteo.value[sorteoId] = {};
    premiosPorSorteo.value[sorteoId][premio.nombre] =
      (premiosPorSorteo.value[sorteoId][premio.nombre] || 0) + 1;

    // Mostrar modal
    currentScreen.value = "sorteo";
    showWinnerDialog.value = true;
    showCongrats.value = true;
    showContinuousConfetti();

  } catch (error) {
    console.error("Error al guardar ganador:", error);
    alert("Error al guardar ganador. Intenta de nuevo.");
  }
};

const cerrarYVolver = () => {
  stopConfetti();
  showWinnerDialog.value = false;
  showCongrats.value = false;
  ganadorActual.value = null;
  cargarParticipantes();
};

const siguienteSorteo = async () => {
  stopConfetti();
  showWinnerDialog.value = false;
  showCongrats.value = false;
  ganadorActual.value = null;
  await cargarParticipantes();

  // Mostrar pantalla con el siguiente premio por 4 segundos antes de sortear
  currentScreen.value = "sorteo";
  setTimeout(() => {
    iniciarSorteo();
  }, 4000);
};

const verHistorial = async () => {
  await cargarHistorial();
  historialFiltro.value = "";
  showHistorial.value = true;
};

const verGanadoresSorteo = async () => {
  await cargarHistorial();
  historialFiltro.value = sorteoSeleccionado.value;
  showHistorial.value = true;
};

const confirmResetSorteo = () => {
  const sorteoId = sorteoSeleccionado.value?.toUpperCase();
  if (confirm(`¿Estás seguro que quieres resetear ${sorteoId}? Se eliminarán todos los ganadores de este sorteo.`)) {
    resetSorteo(sorteoSeleccionado.value);
  }
};

const resetSorteo = async (sorteoId) => {
  try {
    // Obtener participantes de este sorteo con su DNI
    const { data: ganadores } = await $supabase
      .from(SORTEOS_TABLE)
      .select("participante_id")
      .eq("sorteo_id", sorteoId);

    if (ganadores?.length) {
      const ids = ganadores.map(g => g.participante_id);

      // Obtener los DNIs de los ganadores
      const { data: participantesGanadores } = await $supabase
        .from(PARTICIPANTS_TABLE)
        .select("dni")
        .in("id", ids);

      // Obtener DNIs únicos
      const dnis = [...new Set(participantesGanadores?.map(p => p.dni).filter(Boolean))];

      // Reactivar TODOS los registros con esos DNIs (participando = true)
      if (dnis.length) {
        await $supabase
          .from(PARTICIPANTS_TABLE)
          .update({ participando: true })
          .in("dni", dnis)
          .eq("year", 2026);
      }

      // Resetear los registros ganadores (winner = false)
      await $supabase
        .from(PARTICIPANTS_TABLE)
        .update({ winner: false, codwinner: null })
        .in("id", ids);
    }

    // Eliminar registros del sorteo
    await $supabase
      .from(SORTEOS_TABLE)
      .delete()
      .eq("sorteo_id", sorteoId);

    // Recargar
    await cargarProgresos();
    await cargarParticipantes();

    alert(`✅ Sorteo ${sorteoId.toUpperCase()} reseteado`);

  } catch (error) {
    console.error("Error al resetear sorteo:", error);
    alert("Error al resetear sorteo");
  }
};

const confirmResetAll = () => {
  if (confirm("⚠️ ¿Estás seguro que quieres resetear TODOS los sorteos? Esta acción no se puede deshacer.")) {
    resetAll();
  }
};

const resetAll = async () => {
  try {
    // Resetear todos los participantes
    await $supabase
      .from(PARTICIPANTS_TABLE)
      .update({ winner: false, codwinner: null })
      .eq("winner", true);

    // Eliminar todos los registros de sorteos
    await $supabase
      .from(SORTEOS_TABLE)
      .delete()
      .neq("id", 0); // Truco para eliminar todo

    // Recargar
    await cargarProgresos();

    alert("✅ Todos los sorteos han sido reseteados");

  } catch (error) {
    console.error("Error al resetear todo:", error);
    alert("Error al resetear");
  }
};

// Utilidades
const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("es-HN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const showContinuousConfetti = () => {
  const end = Date.now() + 10 * 1000;
  const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"];

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.5 },
      colors
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.5 },
      colors
    });

    if (Date.now() < end) {
      confettiFrame = requestAnimationFrame(frame);
    }
  };

  confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors });
  frame();
};

const stopConfetti = () => {
  if (confettiFrame) {
    cancelAnimationFrame(confettiFrame);
    confettiFrame = null;
  }
  confetti.reset();
};

// Inicialización
onMounted(() => {
  cargarProgresos();
});
</script>

<style scoped>
.main-body {
  min-height: 100vh;
  background:
    url('/assets/images/redbg.svg') center top no-repeat,
    linear-gradient(180deg, #ff9600 0%, #ffc900 50%, #ff9600 100%);
  background-size: 100% auto, 100% 100%;
  background-position: center 550%, top center;
  padding: 20px;
}

/* Selector de Sorteos */
.selector-container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.main-logo {
  max-width: 400px;
  height: auto;
  margin-bottom: 20px;
}

.selector-subtitle {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 30px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.sorteo-group {
  margin-bottom: 30px;
}

.group-title {
  color: #a0a0a0;
  font-size: 1.2rem;
  margin-bottom: 15px;
}

.sorteo-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.sorteo-btn {
  width: 120px;
  height: 100px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.sorteo-btn:hover {
  transform: scale(1.05);
}

.small-btn {
  background: linear-gradient(135deg, #f5a623 0%, #ff8f00 100%);
  box-shadow: 0 4px 15px rgba(245, 166, 35, 0.4);
}

.big-btn {
  background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
  box-shadow: 0 4px 15px rgba(229, 57, 53, 0.4);
}

.sorteo-btn.completado {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
}

.sorteo-id {
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
}

.sorteo-progreso {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 5px;
}

.action-buttons {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn-historial, .btn-reset-all {
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-historial {
  background: #3498db;
  color: white;
}

.btn-reset-all {
  background: #e74c3c;
  color: white;
}

.btn-historial:hover, .btn-reset-all:hover {
  transform: scale(1.05);
}

/* Pantalla de Sorteo */
.sorteo-section {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.sorteo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.btn-volver {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}

.sorteo-titulo {
  color: white;
  font-size: 1.5rem;
}

.sorteo-logo {
  max-width: 200px;
  height: auto;
}

.sorteo-progreso-header {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
}

.premio-container {
  margin: 40px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  position: relative;
  margin-left: 200px;
}

.genio-flotante {
  max-width: 200px;
  height: auto;
  animation: flotar 3s ease-in-out infinite;
}

@keyframes flotar {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.premio-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  display: inline-block;
}

.premio-imagen {
  width: 200px;
  height: 200px;
  object-fit: contain;
  margin-bottom: 15px;
}

.premio-nombre {
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.premio-contador {
  color: #666;
  font-size: 1rem;
}

.sorteo-completado {
  background: rgba(46, 204, 113, 0.2);
  border-radius: 20px;
  padding: 40px;
  margin: 40px 0;
}

.sorteo-completado h3 {
  color: #2ecc71;
  font-size: 2rem;
}

.sorteo-completado p {
  color: white;
  margin-top: 10px;
}

.sorteo-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.btn-sortear {
  background: linear-gradient(135deg, #e60808 0%, #c62828 100%);
  color: white;
  border: 3px solid #ff3333;
  padding: 20px 60px;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(230, 8, 8, 0.5);
  margin-bottom: 50px;
}

.btn-sortear:hover:not(:disabled) {
  transform: scale(1.05);
}

.btn-sortear:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sorteo-btns-secondary {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn-ganadores-sorteo {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-ganadores-sorteo:hover {
  background: #2980b9;
  transform: scale(1.05);
}

.btn-reset-sorteo {
  background: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}

/* Animación */
.animacion-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.containerResultado {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.containerGanador {
  background-color: #1d35cf;
  padding: 15px 30px;
  width: 500px;
  height: 60px;
  border-radius: 50px;
  border: 5px solid rgb(80, 43, 201);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.names-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  margin-top: 18px;
}

.name-item {
  height: 60px;
  font-size: 24px;
  color: white;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
}

.blur-overlay {
  position: absolute;
  left: 0;
  right: 0;
  height: 20px;
  z-index: 1;
  backdrop-filter: blur(5px);
}

.blur-overlay.top { top: 0; }
.blur-overlay.bottom { bottom: 0; }

.animacion-logo {
  max-width: 200px;
  height: auto;
  margin-bottom: 20px;
}

.animacion-genio {
  max-width: 150px;
  height: auto;
  margin-top: 20px;
}

/* Modal Ganador */
.dialog-content {
  text-align: center;
}

.winner-premio {
  margin-bottom: 20px;
}

.winner-premio-img {
  width: 150px;
  height: 150px;
  object-fit: contain;
}

.winner-premio h3 {
  color: #333;
  margin-top: 10px;
}

.winner-info {
  margin-top: 20px;
}

.winner-codigo {
  background: #f0f0f0;
  display: inline-block;
  padding: 5px 15px;
  border-radius: 20px;
  color: #666;
  font-size: 0.9rem;
}

.winner-nombre {
  font-size: 2rem;
  color: #333;
  margin-top: 15px;
}

.congrats-text {
  font-size: 2.5rem;
  font-weight: bold;
  color: #f5576c;
  text-align: center;
  margin-top: 20px;
}

.modal-footer-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn-modal-volver {
  background: #95a5a6;
  color: white;
}

.btn-modal-siguiente {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

/* Historial */
.historial-filtros {
  margin-bottom: 20px;
}

.filtro-select {
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .main-title {
    font-size: 1.8rem;
  }

  .sorteo-btn {
    width: 100px;
    height: 80px;
  }

  .sorteo-id {
    font-size: 1.4rem;
  }

  .premio-imagen {
    width: 150px;
    height: 150px;
  }

  .containerGanador {
    width: 90%;
  }
}
</style>
