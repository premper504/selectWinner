




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
