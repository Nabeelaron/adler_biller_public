<template>
  <LoadingIndicator v-show="loading" />
  <section class="hero is-fullheight is-home">
    <div class="hero-body">
      <div class="container">
        <div class="columns m-0 mb-1 p-1" id="overview-banner">
          <div class="column m-2">
            <p class="is-size-5 is-secondary">Customers Registered</p>
            <p class="is-size-1 is-bold ml-6">{{ count }}</p>
          </div>

          <div class="column has-text-centered p-0">
            <Knob class="is-inline-block m-1" v-model="knobCount" :strokeWidth="16" :size="150" readonly textColor="white" valueColor="#f83600" :max="1200" />
            <p class="is-size-4 is-secondary">Milestone</p>
          </div>
        </div>

        <div class="tile is-ancestor m-0">
          <div class="tile is-parent">
            <div class="tile is-6">
              <router-link to="/bill" class="box" id="bill-box">
                <div class="columns is-vcentered">
                  <div class="column is-6 has-text-centered">
                    <p class="title">Bill</p>
                  </div>
                  <div class="column icon-info-container"></div>
                </div>
              </router-link>
            </div>
            <div class="tile is-6">
              <router-link to="/package" class="box" id="packages-box">
                <div class="columns is-vcentered">
                  <div class="column is-6 has-text-centered">
                    <p class="title">Packages</p>
                  </div>
                  <div class="column icon-info-container"></div>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <div v-if="count" class="tile is-ancestor m-0">
          <div class="tile is-parent">
            <div class="tile is-6">
              <div @click.stop="display = true" class="box" id="find-box">
                <div class="columns is-vcentered">
                  <div class="column is-6 has-text-centered">
                    <p class="title">Finder</p>
                  </div>
                  <div class="column icon-info-container"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <Dialog header="Find Vehicle/Customer" v-model:visible="display" modal="true" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '85vw' }">
    <div class="grid">
      <div>
        <div class="field col-6">
          <p class="control has-icons-left has-icons-left">
            <input class="input" type="text" v-model="licensePlateNumber" placeholder="License Plate Number (KL-13-AF-0000)" />
            <span class="icon is-small is-left">
              <i class="pi pi-caret-right"></i>
            </span>
          </p>
        </div>
        <div class="field">
          <p class="control">
            <button class="button is-warning" @click="searchVehicle()">Search Vehicle</button>
          </p>
        </div>
        <div class="search-container" v-if="data.length != 0 && type == 'vehicle'">
          <table class="table is-hoverable is-fullwidth is-striped">
            <tr>
              <th>Customer</th>
              <td>{{ data.broughtIn[0].fullName }}</td>
            </tr>
            <tr>
              <th>Vehicle Type</th>
              <td>{{ data.typeOfVehicle }}</td>
            </tr>
            <tr>
              <th>Vehicle</th>
              <td>{{ `${data.vehicleDetails.make} ${data.vehicleDetails.model}` }}</td>
            </tr>
            <tr>
              <th>Vehicle Category</th>
              <td>{{ data.vehicleDetails.category }}</td>
            </tr>
            <tr>
              <th>Created On</th>
              <td>{{ new Date(data.createdAt).toLocaleString() }}</td>
            </tr>
          </table>
        </div>
      </div>
      <div>
        <div class="field col-6">
          <div class="control">
            <span class="p-float-label">
              <AutoComplete v-model="selectedCustomer" :suggestions="filteredCustomer" field="fullName" @complete="findCustomer($event)" />
              <label for="username">
                <i class="pi pi-user"></i>
                Search
              </label>
            </span>
          </div>
        </div>
        <div class="field">
          <p class="control">
            <button class="button is-success" @click="searchCustomer()">View Customer</button>
          </p>
        </div>
        <div class="field">
          <div class="search-container" v-if="type == 'customer'">
            <i class="button pi pi-pencil p-2 is-danger-outlined" title="Edit" @click="isEdit = !isEdit"></i>
            <table class="table is-hoverable is-fullwidth is-striped">
              <tr>
                <th>Name</th>
                <td>
                  <input class="input is-warning my-1" type="text" placeholder="First Name" v-model="selectedCustomerLocal.name.firstName" :disabled="isEdit" />
                  <input class="input is-warning my-1" type="text" placeholder="Middle Name" v-model="selectedCustomerLocal.name.middleName" :disabled="isEdit" />
                  <input class="input is-warning my-1" type="text" placeholder="Last Name" v-model="selectedCustomerLocal.name.lastName" :disabled="isEdit" />
                </td>
              </tr>
              <tr>
                <th>Phone Number</th>
                <td>
                  <InputMask v-model="selectedCustomerLocal.phoneNumber" mask="999-99-99999" slotChar="XXX-XX-XXXXX" :unmask="true" required :disabled="isEdit" />
                  <!-- <input class="input is-warning" type="number" placeholder="Phone Number" v-model="selectedCustomerLocal.phoneNumber" :disabled="isEdit" /> -->
                </td>
              </tr>
              <tr>
                <th>Email</th>
                <td><input class="input is-warning" type="text" placeholder="Email" v-model="selectedCustomerLocal.email" :disabled="isEdit" /></td>
              </tr>
              <tr>
                <th>Address</th>
                <td>{{ `${selectedCustomerLocal.address.city}, ${selectedCustomerLocal.address.district}, ${selectedCustomerLocal.address.state}` }}</td>
              </tr>
              <tr>
                <th>Created On</th>
                <td>{{ new Date(selectedCustomerLocal.createdAt).toLocaleString() }}</td>
              </tr>
              <tr>
                <th>Last Updated On</th>
                <td>{{ new Date(selectedCustomerLocal.updatedAt).toLocaleString() }}</td>
              </tr>
              <tr v-show="!isEdit">
                <th></th>
                <td><button class="button is-danger m-2" @click="updateCustomer()">Update</button></td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
  <footer>Version - {{ $store.getters.getVersion }}</footer>
</template>

<script>
import { ipcRenderer, remote } from "electron";
export default {
  name: "Home",
  components: {},
  data() {
    return {
      licensePlateNumber: "",
      display: false,
      loading: true,
      count: 0,
      knobCount: 0,
      data: [],
      isEdit: true,
      type: null,
      filteredCustomer: null,
      selectedCustomer: null,
      selectedCustomerLocal: {},
      registeredCustomer: [],
    };
  },
  async mounted() {
    this.fetchData();
  },
  watch: {
    selectedCustomer() {
      this.type = null;
    },
  },
  methods: {
    async fetchData() {
      this.count = 0;
      this.data = [];
      let res = await ipcRenderer.sendSync("fetch", JSON.parse(JSON.stringify({ type: "customer" })));
      let that = this;
      setTimeout(function () {
        if (res.status) {
          that.registeredCustomer = res.message;
          that.count = res.message.length;
        } else that.count = 0;
        that.knobCount = that.count;
        that.loading = false;
      }, 1000);
    },
    findCustomer(event) {
      this.licensePlateNumber = "";
      this.data = [];
      if (event.query.length < 2) {
        this.filteredCustomer = [];
        return;
      }
      this.filteredCustomer = this.registeredCustomer.filter((customer) => {
        return customer.fullName.includes(event.query);
      });
    },

    async searchVehicle() {
      this.selectedCustomer = null;
      this.selectedCustomerLocal = null;
      this.loading = true;
      this.data = [];
      let res = await ipcRenderer.sendSync("find", JSON.parse(JSON.stringify({ licensePlateNumber: this.licensePlateNumber, type: "vehicle" })));
      let that = this;
      setTimeout(function () {
        if (res.status) {
          that.data = res.message;
          that.type = "vehicle";
        } else alert("No data found");
        let win = remote.getCurrentWindow();
        win.blur();
        win.focus();
        that.loading = false;
      }, 1000);
    },
    async searchCustomer() {
      if (
        this.registeredCustomer.findIndex((customer) => {
          return customer.fullName.includes(this.selectedCustomer);
        }) >= 0
      )
        return;
      this.selectedCustomerLocal = this.selectedCustomer;
      this.type = "customer";
      this.data = [];
    },
    async updateCustomer() {
      this.isEdit = true;
      this.loading = true;
      let updateData = {
        id: this.selectedCustomerLocal._id,
        name: {
          firstName: this.selectedCustomerLocal.name.firstName,
          middleName: this.selectedCustomerLocal.name.middleName,
          lastName: this.selectedCustomerLocal.name.lastName,
        },
        phoneNumber: this.selectedCustomerLocal.phoneNumber,
        email: this.selectedCustomerLocal.email,
      };
      let res = await ipcRenderer.sendSync("update-customer", JSON.parse(JSON.stringify(updateData)));
      let that = this;

      setTimeout(function () {
        if (res.status) {
          alert("Updated");

          that.fetchData();
        } else alert("Operation failed");
        let win = remote.getCurrentWindow();
        win.blur();
        win.focus();
        that.loading = false;
      }, 1000);
    },
  },
};
</script>
<style scoped>
.grid {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  animation: all 2s ease-in-out;
}
.grid > div {
  padding: 1rem;
  text-align: center;
}
.grid > div:last-child {
  border-left: 2px solid grey;
}
.title {
  font-size: 3rem;
  color: rgb(48, 32, 12);
}
#overview-banner {
  /* background-color: rgb(45, 45, 45); */

  background-image: radial-gradient(circle farthest-corner at 10% 20%, rgba(45, 45, 45, 1) 0%, rgb(160, 105, 34) 90%);

  color: WHITE;
  border-radius: 1rem;
  min-height: 5rem;
  margin-top: -1rem;
}
.is-home {
  background: linear-gradient(356deg, rgba(0, 0, 0, 1) 6%, rgb(45, 45, 45) 100%);
}
.box {
  width: 100%;
  min-height: 10rem;
  margin: auto 1rem;
  border-radius: var(--radius);
  transition-property: transform;
  transition-duration: var(--animation-time);
  transition-timing-function: var(--animation-curve);
  background-color: #fe8c00;
}

.box:hover {
  transform: scale(var(--scale));
  opacity: 0.8;
}

.box:hover .icon-info-container {
  transform: scale(1.3);
}

.columns {
  min-height: inherit;
}

.icon-info-container {
  background-image: url("../assets/img/packages.png");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: 50%;
  transition-property: transform;
  transition-duration: var(--animation-time);
  transition-timing-function: var(--animation-curve);
  min-height: inherit;
}

#bill-box .icon-info-container {
  background-image: url("../assets/img/invoice1.png");
}

#find-box .icon-info-container {
  background-image: url("../assets/img/search.png");
}
footer {
  display: block;
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  color: WHITE;
  text-align: end;
  padding-right: 2rem;
  background-color: orangered;
}

@media screen and (max-width: 1200px) {
  .title {
    font-size: 2.2rem;
  }
}
</style>
