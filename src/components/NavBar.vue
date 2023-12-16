<template>
  <nav class="navbar is-fixed-top" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" href="/">
        <img class="is-rounded" src="../assets/img/logo.png" title="Home" />
      </a>

      <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarCollapsed">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbarCollapsed" class="navbar-menu">
      <div class="navbar-start">
        <router-link class="navbar-item" to="/">Home</router-link>
        <router-link class="navbar-item" to="/bill">Bill</router-link>
        <router-link class="navbar-item" to="/package">Packages</router-link>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">{{ time }}</div>
        <div class="navbar-item" :class="{ admin: admin }">
          <Chip :label="user" icon="pi pi-user" />
          <i class="p-3 pi pi-sign-out" @click="signout()"></i>
        </div>
      </div>
    </div>
  </nav>
</template>
<script>
import dayjs from "dayjs";
export default {
  data() {
    return {
      time: "",
      user: "",
      admin: false,
    };
  },
  mounted() {
    this.updateTime();
    const burgerIcon = document.querySelector(".navbar-burger");
    const navbarMenu = document.querySelector(".navbar-menu");

    burgerIcon.addEventListener("click", () => {
      navbarMenu.classList.toggle("is-active");
      burgerIcon.classList.toggle("is-active");
    });
  },
  methods: {
    signout() {
      this.$router.go();
    },
    updateTime() {
      this.time = dayjs().format("dd h:mm:ss  MMM-YYYY");
      setTimeout(this.updateTime, 1000);
    },
  },
  beforeUpdate() {
    let res = this.$store.getters.getUserProfile;
    this.user = res.user;
    this.admin = res.admin;
  },
};
</script>
<style scoped>
.navbar-item {
  color: WHITE;
  font-weight: 400;
  text-shadow: 0px 0px 10px black;
}

.navbar-item:hover {
  color: black;
}

.admin {
  background: orangered;
  color: white;
  font-weight: bolder;
  font-kerning: 0.2rem;
}
.router-link-active,
.navbar-item:focus {
  background: snow;
  color: orangered;
  font-weight: bolder;
}
.router-link-active:hover {
  color: orangered;
}
.navbar,
.navbar-menu {
  background: rgba(241, 175, 47, 0);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  backdrop-filter: blur(6.5px);
  -webkit-backdrop-filter: blur(6.5px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}
</style>
