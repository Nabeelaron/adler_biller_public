<template>
  <div class="loading-container">
    <div class="loading-indicator">
      <i class="pi pi-spin pi-spinner spinner"></i>
    </div>
  </div>
</template>
<script>
export default {
  data() {},
};
</script>
<style scoped>
.loading-container {
  position: absolute;
  top: 0;
  left: 0;
  backdrop-filter: blur(10px);
  background-color: rgba(0, 0, 0, 0.25);
  height: 500vh;
  width: 100vw;
  z-index: 9999;
}
.loading-indicator {
  position: relative;
  top: 50vh;
  left: 48vw;
}
.spinner {
  font-size: 5rem;
  animation: example 3s infinite ease-in, spin 1s infinite linear;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
@keyframes example {
  0% {
    color: orange;
  }
  50% {
    color: red;
  }
  100% {
    color: black;
  }
}
</style>
