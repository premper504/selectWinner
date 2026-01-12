<template>
  <div class="login-container">
    <div class="login-box">
      <img src="/assets/images/tituloceteco.png" alt="Ceteco" class="login-logo" />
      <h2>Acceso al Sistema</h2>
      <el-form @submit.prevent="handleLogin">
        <el-form-item>
          <el-input
            v-model="password"
            type="password"
            placeholder="Contraseña"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            @click="handleLogin"
            :loading="loading"
          >
            Entrar
          </el-button>
        </el-form-item>
      </el-form>
      <p v-if="error" class="error-message">Contraseña incorrecta</p>
    </div>
  </div>
</template>

<script setup>
const password = ref('')
const error = ref(false)
const loading = ref(false)

// Contraseña quemada - cambiar aquí
const SECRET_PASSWORD = 'Ceteco2026%'

const handleLogin = () => {
  loading.value = true
  error.value = false

  setTimeout(() => {
    if (password.value === SECRET_PASSWORD) {
      localStorage.setItem('tombola_auth', 'true')
      navigateTo('/')
    } else {
      error.value = true
    }
    loading.value = false
  }, 500)
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 380px;
  text-align: center;
}

.login-logo {
  width: 150px;
  margin-bottom: 20px;
}

h2 {
  margin-bottom: 30px;
  color: #333;
  font-weight: 600;
}

.error-message {
  color: #f56c6c;
  margin-top: 10px;
  font-size: 14px;
}
</style>
