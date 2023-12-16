<template>
  <div class="offline-container">
    <div class="message-container">
      <div><img src="@/assets/img/offline.png/" alt="" srcset="" /></div>
      <div class="message">
        <h1>No Internet Connection</h1>
        <p class="help">
          Connect to internet to continue using the application.
          <br />
          Closes automatically once connection is established
        </p>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {},
};
</script>
<style scoped>
.offline-container {
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(55px);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3000;
  text-align: center;
}

.message-container {
  position: relative;
  top: 40%;
}
.message {
  background-color: black;
  color: white;
  padding: 0.5rem;
  font-weight: bolder;
}
</style>
