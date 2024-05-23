<template>
  <div>
    <ElDialog
      v-model="dialogVisible"
      title="Solicitud para ser Distribuidor"
      @close="handleClose"
      :style="{ width: isMobile ? '90%' : '50%' }"
    >
      <div>
        <el-form :model="form" :rules="rules" ref="formRef" label-width="250px" style="font-size: 13px; padding-top: 20px">
          <el-form-item label="Nombre del negocio" prop="businessName">
            <el-input v-model="form.businessName"></el-input>
          </el-form-item>
          <el-form-item label="Nombre del contacto" prop="contactName">
            <el-input v-model="form.contactName"></el-input>
          </el-form-item>
          <el-form-item label="Dirección" prop="address">
            <el-input v-model="form.address"></el-input>
          </el-form-item>
          <el-form-item label="Estado" prop="state">
            <el-input v-model="form.state"></el-input>
          </el-form-item>
          <el-form-item label="Celular" prop="phone">
            <el-input v-model="form.phone"></el-input>
          </el-form-item>
          <el-form-item label="Email" prop="email">
            <el-input v-model="form.email"></el-input>
          </el-form-item>
          <el-form-item style="line-height: 10px;" label="¿En cuáles de nuestros productos estás interesado?" prop="products">
            <el-input v-model="form.products"></el-input>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="handleClose">Cancelar</ElButton>
          <ElButton type="primary" @click="handleConfirm">Confirmar</ElButton>
        </span>
      </template>
    </ElDialog>

    <div ref="menu" class="menu-hidden" style="position: fixed; background-color:#7DB251; width: 100%; z-index: 40000; padding-bottom:6px; padding-top:7px;">
      <div class="menu" style="max-width: 1100px;">
        <img src="/images/sulalogo.svg" loading="lazy" alt="" style="margin-right: 30px">
        <div class="menulist">
          <a href="#" style="color: white" class="itemmenu">HOME</a>
          <a href="#" style="color:white" class="itemmenu">PRODUCTOS</a>
          <a href="#recetas" style="color:white" class="itemmenu">RECETAS</a>
          <a href="#" style="color:white" class="itemmenu">ENCUÉNTRANOS</a>
          <a @click="handleOpen" class="button w-button">SEA DISTRIBUIDOR</a>
        </div>
        <div class="div-block-11">
          <img src="/images/MENU.svg" loading="lazy" alt="" class="image-7">
        </div>
      </div>
    </div>

    <section class="header">
      <div class="contendorcontent widthslide">
        <div class="menu">
          <img src="/images/sulalogo.svg" loading="lazy" alt="" style="margin-right: 30px">
          <div class="menulist">
            <a href="#" class="itemmenu">HOME</a>
            <a href="#" class="itemmenu">PRODUCTOS</a>
            <a href="#recetas" class="itemmenu">RECETAS</a>
            <a href="#" class="itemmenu">ENCUÉNTRANOS</a>
            <a @click="handleOpen" class="button w-button">SEA DISTRIBUIDOR</a>
          </div>
          <div class="div-block-11">
            <img src="/images/MENU.svg" loading="lazy" alt="" class="image-7">
          </div>
        </div>
        <div class="slider">
          <div data-delay="4000" data-animation="slide" class="slider-2 w-slider" data-autoplay="true" data-easing="ease" data-hide-arrows="false" data-disable-swipe="false" data-autoplay-limit="0" data-nav-spacing="3" data-duration="400" data-infinite="true">
            <div class="w-slider-mask">
              <div class="slide w-slide">
                <div class="distribuidor">
                  <div style="-webkit-transform:translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);-moz-transform:translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);-ms-transform:translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);transform:translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)" class="div-block-2 imagenslider">
                    <img src="/images/crema_1.png" loading="lazy" sizes="(max-width: 479px) 96vw, (max-width: 767px) 80vw, 40vw" srcset="/images/crema_1-p-500.png 500w, /images/crema_1-p-800.png 800w, /images/crema_1.png 939w" alt="" class="image crema">
                  </div>
                  <div style="opacity:1;-webkit-transform:translate3d(0px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);-moz-transform:translate3d(0px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);-ms-transform:translate3d(0px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);transform:translate3d(0px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)" class="div-block-2 ladoright textslider">
                    <h1 class="heading crema">CREMA AUTÉNTICA HECHA EN CENTROAMÉRICA</h1>
                  </div>
                </div>
              </div>
              <div class="slide w-slide">
                <div class="distribuidor">
                  <div style="-webkit-transform:translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);-moz-transform:translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);-ms-transform:translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);transform:translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)" class="div-block-2 imagenslider">
                    <img src="/images/sulaPack.png" loading="lazy" alt="" class="image">
                  </div>
                  <div style="opacity:1;-webkit-transform:translate3d(0px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);-moz-transform:translate3d(0px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);-ms-transform:translate3d(0px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);transform:translate3d(0px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)" class="div-block-2 ladoright textslider">
                    <h1 class="heading jugo">FIESTAS DE SABORES Y DELICIOSAS FRUTAS</h1>
                  </div>
                </div>
              </div>
              <div class="slide w-slide">
                <div class="distribuidor">
                  <div style="-webkit-transform:translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);-moz-transform:translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);-ms-transform:translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);transform:translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)" class="div-block-2 imagenslider">
                    <img src="/images/nectar.png" loading="lazy" width="366" sizes="(max-width: 479px) 76vw, (max-width: 767px) 59vw, 32vw" alt="" srcset="/images/nectar-p-500.png 500w, /images/nectar.png 692w" class="image nectar">
                  </div>
                  <div style="opacity:1;-webkit-transform:translate3d(0px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);-moz-transform:translate3d(0px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);-ms-transform:translate3d(0px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);transform:translate3d(0px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)" class="div-block-2 ladoright textslider">
                    <h1 class="heading nectar" style="max-width:100%">TRES SABORES <br> QUE SON UNA DELICIA<br>NATURAL EN TU MESA</h1>
                  </div>
                </div>
              </div>
            </div>
            <div class="left-arrow w-slider-arrow-left">
              <div class="icon-2 w-icon-slider-left"></div>
            </div>
            <div class="right-arrow w-slider-arrow-right">
              <div class="icon w-icon-slider-right"></div>
            </div>
            <div color="blue" class="slide-nav w-slider-nav w-slider-nav-invert w-round"></div>
          </div>
        </div>
        <div class="div-block-10">
          <img src="/images/sfblogo.svg" loading="lazy" alt="">
        </div>
      </div>
    </section>

    <div>
      <div class="distribuidor dis">
        <div class="columright">
          <p class="paragraph black">ÚNETE HOY</p>
          <h1 class="heading dark sub">Sé un distribuidor</h1>
          <p class="paragraph black">Únete a nuestra red de distribuidores y lleva auténticos productos hondureños a tu comunidad. Llena el formulario y descubre cómo puedes ser parte de nuestra misión de compartir los sabores de Honduras en Estados Unidos. <strong>¡Impulsa tu negocio con nosotros hoy mismo!</strong></p>
          <div @click="handleOpen" class="button green w-button">LLENAR FORMULARIO</div>
        </div>
        <div class="div-block-2 ladoright dis">
          <img src="/images/personSula.png" loading="lazy" alt="" class="image-2">
        </div>
      </div>
    </div>

    <section class="productos">
      <div class="contendorcontent products">
        <div class="productlist">
          <div class="itemlistprouduct">
            <img src="/images/crema.png" loading="lazy" sizes="(max-width: 479px) 40vw, 30vw" srcset="/images/crema-p-500.png 500w, /images/crema-p-800.png 800w, /images/crema.png 869w" alt="">
          </div>
          <div class="itemlistprouduct">
            <img src="/images/jugos.png" loading="lazy" sizes="(max-width: 479px) 40vw, 30vw" srcset="/images/jugos-p-500.png 500w, /images/jugos-p-800.png 800w, /images/jugos.png 869w" alt="">
          </div>
          <div class="itemlistprouduct mobile">
            <img src="/images/milkshake.png" loading="lazy" sizes="(max-width: 479px) 40vw, 30vw" srcset="/images/milkshake-p-500.png 500w, /images/milkshake-p-800.png 800w, /images/milkshake.png 869w" alt="">
          </div>
        </div>
        <a href="https://sazonsula.com/recetas/acompanantes/bruschettas-con-manzana-y-tomates-cherry" target="_blank" class="button green w-button">VER PRODUCTOS</a>
      </div>
    </section>

    <section class="recetas">
      <div id="recetas" class="contendorcontent recetas">
        <p class="paragraph black">EXPLORA LAS</p>
        <h1 class="heading dark sub">Recetas con nuestros productos</h1>
        <div class="div-block-3">
          <div class="leftreceta">
            <div class="imagecontainer"></div>
            <div class="newtext">
              <h2 class="h2">BROCHETAS CON TOMATES CHERRY Y MOZZARELLA<br></h2>
              <p class="paragraph black">Dip con Bacon y Jalapeño es una receta muy práctica a la hora de elegir el menú, cuenta con una presentación elegante que se adapta con cualquier otro platillo. Conoce el procedimiento para preparar Dip con Bacon y Jalapeño de la manera más práctica y divertida, utilizando los productos Sula que ya tienes en tu refrigerador, esta receta solo te llevara 40 min en prepararla y tenerla lista para su consumo.</p>
              <a href="https://sazonsula.com/recetas/acompanantes/bruschettas-con-manzana-y-tomates-cherry" target="_blank" class="button green w-button">VER LA RECETA</a>
            </div>
          </div>
          <div class="rightreceta">
            <div class="itemnewsright">
              <div class="imagecontainer rigth _1"></div>
              <div class="div-block-4">
                <h2 class="h2"><strong class="bold-text">DIP CON BACON JALAPEÑO</strong></h2>
                <a href="https://sazonsula.com/recetas/acompanantes/dip-con-bacon-y-jalapeno" target="_blank" class="link-block w-inline-block">
                  <div class="text-block">VER LA RECETA</div>
                </a>
              </div>
            </div>
            <div class="itemnewsright">
              <div class="imagecontainer rigth"></div>
              <div class="div-block-4">
                <h2 class="h2"><strong><em class="italic-text">CREMA DE BROCOLI CON QUESO CHEDAR</em></strong></h2>
                <a href="https://sazonsula.com/recetas/plato-fuerte/sopa-de-brocoli-con-queso-cheddar" target="_blank" class="link-block w-inline-block">
                  <div class="text-block">VER LA RECETA</div>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="div-block-5">
          <a href="https://sazonsula.com/" class="button lithtext w-button">VER MÁS RECETAS</a>
          <img src="/images/SAZON.svg" loading="lazy" alt="" class="image-3">
        </div>
      </div>
    </section>

    <section class="responsabilidad">
      <div class="contendorcontent flex">
        <div class="columright">
          <p class="paragraph">ASPECTO SOCIAL</p>
          <h1 class="heading sub">RESPONSABILIDAD SOCIAL EMPRESARIAL</h1>
          <p class="paragraph">Cada vez que compras nuestros productos, estás promoviendo el desarrollo sostenible de más de 2.000 granjas lecheras en Honduras.Nuestra leche proviene exclusivamente de pequeños productores que han crecido con nosotros, que han recibido nuestra asistencia técnica y financiera y que son el primer eslabón de nuestra cadena de valor. Estas granjas producen la mejor leche de Honduras, que se utiliza como ingrediente principal de nuestros productos.</p>
        </div>
        <div class="div-block-2 ladoright dis">
          <img src="/images/picRes.png" loading="lazy" sizes="(max-width: 479px) 90vw, 35vw" srcset="/images/picRes-p-500.png 500w, /images/picRes.png 591w" alt="" class="image-4">
        </div>
      </div>
      <div class="div-block-6">
        <div class="contendorcontent">
          <div class="contenedorform">
            <div>
              <p class="paragraph">NOS ENCANTARÍA ESTAR EN</p>


              <h1 class="heading sub light">CONTACTO CONTIGO</h1>
              
            </div>
            <div class="div-block-7"></div>
            <div class="div-block-8">
              <el-input v-model="input" style="width: 240px; height: 40px;" placeholder="Correo electrónico" />

              <a href="#" class="button lithtext form w-button">ENVIAR</a>
            </div>  
          </div>
        </div>
      </div>
    </section>

    <section class="footer">
      <div class="contendorcontent">
        <div class="distribuidor dis">
          <div class="columright footer">
            <img src="/images/SFBdistribution.png" loading="lazy" sizes="(max-width: 479px) 83vw, (max-width: 767px) 250px, (max-width: 991px) 30vw, 250px" srcset="/images/SFBdistribution-p-500.png 500w, /images/SFBdistribution-p-800.png 800w, /images/SFBdistribution.png 861w" alt="" class="image-5">
            <div class="div-block-9">
              <a href="https://m.facebook.com/sulausa" class="w-inline-block">
                <img src="/images/faceIcon.png" loading="lazy" alt="" class="image-6">
              </a>
              <a href="https://www.instagram.com/sula_usa_/" class="w-inline-block">
                <img src="/images/instaIcon.png" loading="lazy" alt="" class="image-6">
              </a>
              <img src="/images/linkicon.png" loading="lazy" alt="" class="image-6">
            </div>
          </div>
          <div class="div-block-2 ladoright dis">
            <p class="paragraph black">Estamos muy orgullosos de ser una empresa de distribución de alimentos y bebidas dedicada a ofrecer productos de la máxima calidad elaborados por empresas socialmente responsables. Nuestra misión es obtener los mejores alimentos de todo el mundo y llevarlos al mercado estadounidense, garantizando un sabor excepcional y unos estándares sin concesiones.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ElDialog, ElButton, ElMessage } from 'element-plus'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useNuxtApp } from '#app'

const { $supabase } = useNuxtApp()

const dialogVisible = ref(false)
const input = ref('')
const isMobile = ref(false);


const checkScreenWidth = () => {
  const screenWidth = window.innerWidth;
  isMobile.value = screenWidth < 600;
};

const form = ref({
  businessName: '',
  contactName: '',
  address: '',
  state: '',
  phone: '',
  email: '',
  products: ''
})

const rules = {
  businessName: [
    { required: true, message: 'Nombre del negocio es obligatorio', trigger: 'blur' }
  ],
  contactName: [
    { required: true, message: 'Nombre del contacto es obligatorio', trigger: 'blur' }
  ],
  address: [
    { required: true, message: 'Dirección es obligatoria', trigger: 'blur' }
  ],
  state: [
    { required: true, message: 'Estado es obligatorio', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: 'Celular es obligatorio', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Email es obligatorio', trigger: 'blur' }
  ],
  products: [
    { required: true, message: 'Indicar productos es obligatorio', trigger: 'blur' }
  ]
}

const formRef = ref(null)

const handleConfirm = async () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const { error } = await $supabase
          .from('distribution')
          .insert([{
            name: form.value.businessName,
            contact: form.value.contactName,
            address: form.value.address,
            state: form.value.state,
            phone: form.value.phone,
            email: form.value.email,
            product_interest: form.value.products
          }])

        if (error) {
          throw error
        }

        ElMessage.success('Formulario enviado con éxito')
        dialogVisible.value = false
        resetForm()
      } catch (error) {
        ElMessage.error('Error al enviar el formulario')
        console.error('Error al enviar el formulario:', error)
      }
    } else {
      ElMessage.error('Por favor completa todos los campos obligatorios')
    }
  })
}

const resetForm = () => {
  form.value = {
    businessName: '',
    contactName: '',
    address: '',
    state: '',
    phone: '',
    email: '',
    products: ''
  }
}

const handleOpen = () => {
  dialogVisible.value = true
}

const handleClose = () => {
  dialogVisible.value = false
}

// Scroll functionality for showing/hiding the menu
const menu = ref(null)

const handleScroll = () => {
  if (window.scrollY > 300) {
    menu.value.classList.add('menu-visible')
    menu.value.classList.remove('menu-hidden')
  } else {
    menu.value.classList.add('menu-hidden')
    menu.value.classList.remove('menu-visible')
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  checkScreenWidth();
  window.addEventListener('resize', checkScreenWidth);
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', checkScreenWidth);

})
</script>




<style>
.el-form-item__label {
  line-height: 20px !important;
  justify-content: flex-start !important;
  font-weight: 300;
}

.menu-hidden {
  display: none;
}

.menu-visible {
  display: flex;
}


.el-form-item {
  flex-direction:column;
  }


</style>