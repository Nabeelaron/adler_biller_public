<template>
  <div class="login-container" v-show="display" ref="top">
    <div class="login-input-container">
      <p class="title">Authenticate</p>
      <p class="subtitle is-size-6 has-text-danger" v-if="status">Please provide correct credentials.</p>
      <form class="field">
        <div class="field">
          <p class="control has-icons-left has-icons-right">
            <input class="input is-medium" type="text" placeholder="Username" v-model="username" @click="$refs.top.focus()" />
            <span class="icon is-small is-left">
              <i class="pi pi-user"></i>
            </span>
          </p>
        </div>
        <div class="field">
          <p class="control has-icons-left">
            <input class="input is-medium" type="password" placeholder="Password" v-model="password" />
            <span class="icon is-small is-left">
              <i class="pi pi-lock"></i>
            </span>
          </p>
        </div>
      </form>

      <hr />
      <div class="control">
        <button class="button is-danger" :class="{ 'is-loading': loading }" @click="authenticate()">Login</button>
        <button class="button is-danger" v-show="close" @click="display1 = false">Cancel</button>
      </div>
    </div>
  </div>
</template>
<script>
import { ipcRenderer } from "electron";
export default {
  props: ["display", "close"],
  data() {
    return { username: "", password: "", status: false, loading: false };
  },
  beforeUpdate() {},
  methods: {
    async authenticate() {
      this.loading = true;
      let res = await ipcRenderer.sendSync("authenticate", JSON.parse(JSON.stringify({ username: this.username, password: this.password })));
      console.log(res);
      let that = this;
      setTimeout(function () {
        if (res.status) {
          that.username = "";
          that.password = "";
          that.$store.commit("setUserProfile", res.message);
          that.$emit("loggedIn", true);
          that.$emit("close-dialog");
        } else {
          that.status = true;
        }
        that.loading = false;
      }, 1000);
    },
  },
};
</script>
<style scoped>
.login-container {
  position: absolute;
  top: 0;
  left: 0;
  backdrop-filter: blur(25px);
  height: 200vh;
  width: 100vw;
  z-index: 2500;
}
.login-input-container {
  background-color: rgba(0, 0, 0, 0.774);
  backdrop-filter: blur(5px);
  box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
  border-radius: 1rem;
  color: WHITE;
  padding: 2rem 5rem;
  position: relative;
  top: 30vh;
  margin: auto;
  width: 50vw;
}
label {
  color: wheat;
  font-size: 1rem;
}

.title,
.subtitle {
  color: WHITE;
}
</style>
