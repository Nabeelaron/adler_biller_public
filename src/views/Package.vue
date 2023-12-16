<template>
  <LoadingIndicator v-show="loading" />
  <section class="hero is-fullheight is-home">
    <div class="hero-body is-block">
      <div class="columns p-1" id="overview-banner">
        <div class="column">
          <p class="is-size-5 is-secondary">Total Package</p>
          <p class="is-size-1 ml-6 p -1">{{ packageCount }}</p>
        </div>
        <div class="column">
          <p class="is-size-5 is-secondary">Total Value</p>
          <p class="is-size-1 ml-2">{{ $filters.currency(value) }}</p>
        </div>
      </div>
      <div class="container" id="main-container">
        <div class="level">
          <div class="level-left">
            <div class="level-item"></div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <button class="button mx-2" @click="displayAdd()"><i class="pi pi-plus-circle"></i></button>
              <button class="button is-danger" @click="fetch()"><i class="pi pi-refresh"></i></button>
            </div>
          </div>
        </div>
        <hr />
        <div class="columns is-multiline is-5 m-2">
          <template v-for="(service, index) in packages" :key="service">
            <div class="column is-3 card" @click="populate(index)">
              <p class="title">{{ service.packageName }}</p>
              <p class="subtitle">{{ service.packageDetails }}</p>
              <p class="button is-info is-outlined is-static is-warning is-small subtitle">
                <small>{{ service.packageCode }}</small>
              </p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
  <Dialog header="Package Details" v-model:visible="displayDetails" closable="true" modal="true" dismissableMask="true" closeOnEscape="true">
    <i class="button pi pi-pencil p-2" title="Edit package" @click="isEdit = !isEdit"></i>
    <table class="table" v-if="displayDetails">
      <tbody>
        <tr>
          <th>Name</th>
          <td><input class="input is-warning" type="text" placeholder="unique name" v-model="selectedPackage.packageName" :disabled="!isEdit" /></td>
        </tr>
        <tr>
          <th>Code</th>
          <td><input class="input is-warning" type="text" placeholder="unique code" v-model="selectedPackage.packageCode" :disabled="!isEdit" /></td>
        </tr>
        <tr>
          <th>Description</th>
          <td><input class="input is-warning" type="text" placeholder="" v-model="selectedPackage.packageDetails" :disabled="!isEdit" /></td>
        </tr>
        <tr>
          <th>HSN Code</th>
          <td><input class="input is-warning" type="text" placeholder="" v-model="selectedPackage.HSNCode" :disabled="!isEdit" /></td>
        </tr>
        <tr>
          <th>Accessories</th>
          <td><input class="input is-warning" type="text" placeholder="" v-model="selectedPackage.accessory" :disabled="!isEdit" /></td>
        </tr>
        <tr>
          <th>Tax</th>
          <td><input class="input is-warning" type="Number" placeholder="" v-model="selectedPackage.tax" :disabled="!isEdit" /></td>
        </tr>
        <tr>
          <th>Rate</th>
          <td><input class="input is-warning" type="number" min="0" placeholder="" v-model="selectedPackage.rate" :disabled="!isEdit" /></td>
        </tr>
        <tr>
          <th>Created On</th>
          <td>{{ new Date(selectedPackage.createdAt).toLocaleString() }}</td>
        </tr>
        <tr>
          <th>Updated On</th>
          <td>{{ new Date(selectedPackage.updatedAt).toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>
    <div class="button-group" v-show="isEdit">
      <div v-if="isEdit && !isAdd" class="button is-outlined is-danger" @click="UpdatePackage">Update</div>
      <div v-if="isAdd" class="button is-outlined is-success" @click="createPackage">Add</div>
    </div>
  </Dialog>
</template>
<script>
import { ipcRenderer, remote } from "electron";
export default {
  data() {
    return {
      packages: [],
      displayDetails: false,
      selectedPackage: null,
      packageCount: 0,
      isEdit: false,
      isAdd: false,
      value: 0,
      loading: true,
    };
  },
  methods: {
    async UpdatePackage() {
      this.loading = true;
      let res = {};
      res = await ipcRenderer.sendSync("package", JSON.parse(JSON.stringify({ type: "update", id: this.selectedPackage._id, data: this.selectedPackage })));
      let that = this;
      setImmediate(function () {
        if (res.status) {
          alert("Updated");
        } else alert(res.message);
        let win = remote.getCurrentWindow();
        win.blur();
        win.focus();
        that.loading = false;
      });
    },

    displayAdd() {
      this.selectedPackage = { packageName: "", packageCode: "", packageDetails: "", rate: 0, HSNCode: "", tax: 18, createdAt: new Date(), updatedAt: new Date() };
      this.isEdit = true;
      this.isAdd = true;
      this.displayDetails = true;
    },
    async createPackage() {
      this.loading = true;
      this.isAdd = false;
      this.isEdit = false;

      delete this.selectedPackage.createdAt;
      delete this.selectedPackage.updatedAt;
      let res = await ipcRenderer.sendSync("package", JSON.parse(JSON.stringify({ type: "save", data: this.selectedPackage })));
      if (res.status) {
        alert("Updated");
        this.displayDetails = false;
        this.fetch();
      } else {
        alert(res.message);
        this.isEdit = true;
        this.isAdd = true;
        this.selectedPackage.createdAt = new Date();
        this.selectedPackage.updatedAt = new Date();
      }
      let win = remote.getCurrentWindow();
      win.blur();
      win.focus();
      this.loading = false;
    },
    populate(index) {
      this.loading = true;
      this.isEdit = false;
      this.displayDetails = true;
      this.selectedPackage = this.packages[index];
      this.loading = false;
    },
    async fetch() {
      this.loading = true;
      this.value = 0;
      this.selectedPackage = { packageName: "", packageCode: "", packageDetails: "", rate: 0, createdAt: "", updatedAt: "", HSNCode: "", tax: 18 };
      this.packages = (await ipcRenderer.sendSync("fetch", { type: "service" })).message;
      this.packageCount = this.packages.length;
      this.packages.every((element) => (this.value += element.rate));
      let that = this;
      setTimeout(function () {
        that.loading = false;
      }, 1000);
    },
  },
  async mounted() {
    this.fetch();
  },
};
</script>
<style scoped>
.card {
  cursor: pointer;
  margin: 0.5rem;
  padding: 2rem;
  background: rgba(255, 68, 0, 0.952);
  color: WHITE;
  font-weight: bold;
  font-size: 1.5rem;
  border-radius: var(--radius);
  box-shadow: 0px 10px 15px black;
  transition-property: transform;
  transition-duration: var(--animation-time);
  transition-timing-function: var(--animation-curve);
}
.card:hover {
  transform: scale(1.1);
}
.icon {
  transition-property: transform;
  transition-duration: var(--animation-time);
  transition-timing-function: var(--animation-curve);
  visibility: hidden;
}
.card:hover .icon {
  visibility: visible;
  transform: scale(1.3);
}
.card > * {
  color: inherit;
}
#main-container,
#overview-banner {
  background-color: rgb(45, 45, 45);
  color: WHITE;
  border-radius: 1rem;
  min-height: 5rem;
  margin-top: 2rem;
  padding: 1rem;
}
#overview-banner {
  background-image: radial-gradient(circle farthest-corner at 10% 20%, rgba(45, 45, 45, 1) 0%, rgb(208, 78, 30) 90%);
}
.is-home {
  background: rgba(0, 0, 0, 1);
  background: -webkit-linear-gradient(top left, rgba(0, 0, 0, 1), rgba(69, 44, 32, 1));
  background: -moz-linear-gradient(top left, rgba(0, 0, 0, 1), rgba(69, 44, 32, 1));
  background: linear-gradient(to bottom right, rgba(0, 0, 0, 1), rgba(69, 44, 32, 1));
}
</style>
