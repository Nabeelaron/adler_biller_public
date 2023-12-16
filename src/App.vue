<template>
  <Offline v-show="!status" />

  <Login :display="display" @close-dialog="display = false" />
  <nav-bar></nav-bar>
  <section id="page-container">
    <router-view></router-view>
  </section>
</template>

<script>
// @ is an alias to /src
import NavBar from "@/components/NavBar";

import { detectOffline } from "@/services/offlineDetection";

export default {
  name: "App",
  components: {
    NavBar,
  },
  data() {
    return {
      display: true,
      status: false,
    };
  },
  async created() {
    this.checkConnectionStatus();
    if (this.$store.getters.getUserProfile.user == "") this.display = true;
    else this.display = false;
  },
  methods: {
    async checkConnectionStatus() {
      this.status = await detectOffline();
      setTimeout(this.checkConnectionStatus, 5000);
    },
  },
};
</script>
<style>
:root {
  --radius: 1rem;
  --scale: 1.05;
  --animation-time: 0.2s;
  --animation-curve: "ease-in-out";
}

::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

body {
  min-height: 100vh;
}

a.box:focus,
a.box:hover {
  box-shadow: 0 0.5em 1em -0.125em rgb(10 10 10 / 10%);
}

* {
  outline: none !important;
}

.page-body {
  margin-top: 4rem;
}
</style>
