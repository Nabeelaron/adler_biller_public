<template>
  <section class="hero is-link my-2">
    <div class="hero-body">
      <p class="title">Update</p>
      <p class="subtitle">Change the status or details of open bills.</p>
    </div>
  </section>
  <section class="section">
    <div id="open-bill-container" class="card p-5 has-text-centered">
      <template v-if="openBills">
        <div>Select an Open Bill</div>
        <div class="buttons">
          <template v-for="bill in openBills" :key="bill._id" class="is-inline-block">
            <div
              class="m-2 is-inline-block button is-info is-light is-outlined"
              :class="{
                'is-warning': isActive == bill.vehicleID.vehicleDetails.licensePlateNumber,
              }"
              @click="selectVehicle(bill)"
            >
              {{ bill.vehicleID.vehicleDetails.licensePlateNumber.toUpperCase() }}
            </div>
          </template>
        </div>
        <div class="tabs is-centered is-boxed is-toggle is-toggle-rounded is-block">
          <ul>
            <li ref="status">
              <router-link to="/bill/update/status">
                <span class="icon is-small"><i class="pi pi-list" aria-hidden="true"></i></span>
                Status
              </router-link>
            </li>
          </ul>
        </div>
      </template>
      <template v-else>No Open Bills...</template>
    </div>
  </section>

  <hr />
  <div class="container" v-if="selectedVehicle">
    <router-view :vehicle="selectedVehicle" @update-vehicle-status="updateStatus"></router-view>
  </div>
</template>
<script>
import { ipcRenderer,remote } from "electron";
export default {
  data() {
    return {
      openBills: null,
      selectedVehicle: null,
      isActive: false,
    };
  },
  async beforeMount() {
    let res = await ipcRenderer.sendSync("fetch", {
      type: "bill-by-open",
    });
    if (res.status) this.openBills = res.message;
    else alert(res.message);
    let win = remote.getCurrentWindow();
    win.blur();
    win.focus();
  },
  methods: {
    updateStatus(data) {
      this.selectedVehicle.vehicleStatus = data;
    },
    selectVehicle(data) {
      this.selectedVehicle = data;
      this.isActive = data.vehicleID.vehicleDetails.licensePlateNumber;
    },
  },
};
</script>
<style scoped>
.router-link-exact-active {
  background-color: orange;
}
</style>
