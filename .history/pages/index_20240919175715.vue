<template>
  
<div> </div>
  <div class="main-body">
    <section class="header-section">
      <div class="header-container">
        <img
          class="header-image"
          src="assets/images/ceteco___cumpledeseo.png"
          alt="Cumple Deseo"
        />
        <img
          src="assets/images/ceteco___premios.png"
          class="awards-image"
          alt="Premios Ceteco"
        />
        <div class="raffle-announcement">Participa en los sorteos quincenales</div>
      </div>
    </section>
    <div class="red-bar-container"> </div>

    <section class="products-section">

      <div class="products-container">

        <img class="items-image" src="assets/images/items.png" alt="Items" />


        <img
          src="assets/images/latas.png"
          class="cans-image"
          alt="Latas Ceteco"
        />

<div> 

  <div class="form-container">
    <h2>Registro de Participación</h2>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="250px" style="font-size: 13px; padding-top: 20px">
      <el-form-item label="Nombre Completo" prop="name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>

      <el-form-item label="DNI" prop="dni">
        <el-input v-model="form.dni"></el-input>
      </el-form-item>

      <el-form-item label="Teléfono" prop="phone">
        <el-input v-model="form.phone"></el-input>
      </el-form-item>

      <el-form-item label="Correo Electrónico" prop="email">
        <el-input v-model="form.email"></el-input>
      </el-form-item>

      <el-form-item label="Departamento" prop="state">
        <el-input v-model="form.state"></el-input>
      </el-form-item>

      <el-form-item label="Lugar donde se realizó la compra" prop="place">
        <el-input v-model="form.place"></el-input>
      </el-form-item>

      <el-form-item label="Producto Ceteco que adquiriste" prop="product">
        <el-input v-model="form.product"></el-input>
      </el-form-item>

      <el-form-item label="Número de factura" prop="reciepCode">
        <el-input v-model="form.reciepCode"></el-input>
      </el-form-item>
    </el-form>

    <!-- File Upload Section -->
    <div>
      <p>Agregar factura de compra (subir archivo)</p>
      <el-upload
        v-if="!selectedFile"
        action="#"
        list-type="picture-card"
        :auto-upload="false"
        :limit="1"
        :file-list="fileList"
        :on-change="handleFileChange"
        :on-remove="handleRemove"
        :on-exceed="handleExceed"
      >
        <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
          Seleccionar archivo   
          <el-icon style="margin-left: 10px;"><Plus /> </el-icon>
        </div>
      </el-upload>

      <div v-else style="display: flex; flex-direction: column; align-items: center;">
        <img :src="imageUrl" alt="Factura" style="max-width: 100%; height: auto;">
        <el-button @click="handleRemove(selectedFile, fileList)" type="danger" icon="el-icon-delete" circle>
          <el-icon style="margin-left: -5px;"><Plus /> </el-icon>
        </el-button>
      </div>
    </div>

    <div class="form-footer">
      <ElButton type="primary" @click="handleConfirm" :loading="loading">Enviar</ElButton>
    </div>
  </div>



</div>


      </div>

    </section>
  </div> 

</template>





<style scoped >

.red-bar-container{
  background-image: url('/assets/images/bar_roja.png');
  background-repeat: repeat-x;
  background-size: contain;
  background-position: top; 
  width: 100%;
  height: 40px;
  margin-top: -20px;
}


</style>