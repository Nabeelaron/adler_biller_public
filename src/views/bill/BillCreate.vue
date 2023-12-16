<template>
  <div class="page-body">
    <LoadingIndicator v-show="loading" />
    <div class="container">
      <div class="title">Bill create</div>
      <Accordion v-model:activeIndex="activeIndex">
        <AccordionTab v-model:disabled="disabled.customer">
          <template #header>
            <i class="pi pi-user-plus"></i>
            &nbsp;
            <span>Customer</span>
            <template v-if="selectedCustomer != null && selectedCustomer.fullName != undefined">
              :
              <span class="mx-2 tag is-danger is-light">
                <b>{{ selectedCustomer.fullName.toUpperCase() }}</b>
                &nbsp;
              </span>
              <button class="button is-warning is-rounded" @click.stop="selectConfirmCustomer" v-if="proceed.customer">
                Proceed
                <i class="pl-1 pi pi-arrow-circle-right"></i>
              </button>
            </template>
          </template>

          <div class="container">
            <label class="label pb-2">Select a customer</label>
            <div class="columns">
              <div class="column">
                <div class="field has-addons">
                  <div class="control">
                    <span class="p-float-label">
                      <AutoComplete v-model="selectedCustomer" :suggestions="filteredCustomer" field="fullName" @complete="searchCustomer($event)" />
                      <label for="username">
                        <i class="pi pi-user"></i>
                        Search
                      </label>
                    </span>
                  </div>
                </div>
                <p class="help">Start typing to get suggestions</p>
              </div>
              <div class="column">
                <div class="card p-2" v-if="selectedCustomer">
                  <table>
                    <tbody>
                      <tr>
                        <th>Name :</th>
                        <td>{{ selectedCustomer.fullName }}</td>
                      </tr>
                      <tr>
                        <th>Email :</th>
                        <td>{{ selectedCustomer.email }}</td>
                      </tr>
                      <tr>
                        <th>Phone :</th>
                        <td>{{ selectedCustomer.phoneNumber }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <Divider align="center">OR</Divider>

            <label class="label">Create new customer</label>
            <div class="field is-horizontal p-2">
              <div class="field-label">
                <label class="label">
                  <i class="pi pi-user"></i>
                  &nbsp; Name
                </label>
              </div>
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <input class="input" type="text" placeholder="First Name [Optional]" v-model="customer.name.firstName" required />
                  </p>
                </div>
                <div class="field">
                  <p class="control is-expanded">
                    <input class="input" type="text" placeholder="Middle Name [Optional]" v-model="customer.name.middleName" required />
                  </p>
                </div>
                <div class="field">
                  <p class="control is-expanded">
                    <input class="input" type="text" placeholder="Last Name" v-model="customer.name.lastName" required />
                  </p>
                </div>
              </div>
            </div>

            <div class="field is-horizontal p-2">
              <div class="field-label">
                <label class="label">
                  <i class="pi pi-phone"></i>
                  &nbsp; Phone
                </label>
              </div>
              <div class="field-body">
                <div class="field">
                  <div class="field has-addons">
                    <p class="control">
                      <a class="button is-static">+91</a>
                    </p>
                    <p class="control">
                      <InputMask v-model="customer.phoneNumber" mask="999-99-99999" slotChar="XXX-XX-XXXXX" :unmask="true" required />
                    </p>
                  </div>
                  <p class="help">This number is used to communicate( incl. bill) with the customer</p>
                </div>
              </div>
            </div>

            <div class="field is-horizontal p-2">
              <div class="field-label">
                <label class="label">
                  <i class="pi pi-envelope"></i>
                  &nbsp; Email
                </label>
              </div>
              <div class="field-body">
                <div class="field">
                  <p class="control">
                    <input class="input" type="text" placeholder="someone@domain.com" v-model="customer.email" required />
                  </p>
                </div>
              </div>
            </div>

            <div class="field is-horizontal p-2">
              <div class="field-label is-normal">
                <label class="label">
                  <i class="pi pi-map-marker"></i>
                  &nbsp; Locate
                </label>
              </div>

              <div class="field-body">
                <div class="field is-grouped">
                  <p class="control">
                    <Dropdown v-model="customer.address.state" :options="locateOptions.states" placeholder="Select State" required />
                  </p>
                  <p class="control">
                    <Dropdown v-model="customer.address.district" :options="locateOptions.districts" placeholder="Select District" required />
                  </p>
                  <p class="control">
                    <input class="input" type="text" placeholder="City" v-model="customer.address.city" required />
                  </p>
                </div>
              </div>
            </div>

            <div class="field is-grouped is-grouped-centered">
              <p class="control">
                <a class="button is-warning" @click.stop="validateCustomerDetails">Create</a>
              </p>
              <p class="control">
                <a class="button is-danger" @click="customer = { name: {}, address: {} }">Reset</a>
              </p>
            </div>
          </div>
        </AccordionTab>

        <AccordionTab v-model:disabled="disabled.vehicle">
          <template #header>
            <i class="pi pi-heart"></i>
            &nbsp;
            <span>Vehicle</span>
            <template v-if="selectedVehicle != null && selectedVehicle.vehicleDetails != undefined">
              :
              <span class="mx-2 tag is-danger is-light">
                <b>{{ selectedVehicle.vehicleDetails.licensePlateNumber.toUpperCase() }}</b>
              </span>
              &nbsp;
              <button class="button is-warning is-rounded" @click.stop="selectConfirmVehicle" v-if="proceed.vehicle">
                Proceed
                <i class="pl-1 pi pi-arrow-circle-right"></i>
              </button>
            </template>
          </template>
          <div class="container">
            <Message severity="warn">Duplicate bill for same vehicle is not allowed</Message>
            <label class="label pb-2">Select a vehicle</label>

            <div class="field has-addons">
              <div class="control">
                <span class="p-float-label">
                  <AutoComplete v-model="selectedVehicle" :suggestions="filteredVehicle" field="vehicleDetails.licensePlateNumber" dropdown="true" @complete="searchCustomerVehicles($event)" />
                  <label for="username">
                    <i class="pi pi-heart"></i>
                    Search
                  </label>
                </span>
              </div>
            </div>

            <Divider align="center">OR</Divider>

            <label class="label">Create new vehicle</label>
            <div class="field is-horizontal p-2">
              <div class="field-label">
                <label class="label">
                  <i class="pi pi-heart"></i>
                  &nbsp; Type
                </label>
              </div>
              <div class="field-body">
                <div class="field">
                  <div class="control">
                    <div class="p-field-radiobutton">
                      <RadioButton id="car" name="typeOfVehicle" value="car" v-model="vehicle.typeOfVehicle" />
                      <label for="car">Car</label>
                    </div>
                    <div class="p-field-radiobutton">
                      <RadioButton id="bike" name="typeOfVehicle" value="motorcycle" v-model="vehicle.typeOfVehicle" />
                      <label for="bike">Bike</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="field is-horizontal p-2">
              <div class="field-label">
                <label class="label">
                  <i class="pi pi-user"></i>
                  &nbsp; Details
                </label>
              </div>
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <input class="input" type="text" placeholder="Brand" v-model="vehicle.vehicleDetails.make" required />
                  </p>
                </div>
                <div class="field">
                  <p class="control is-expanded">
                    <input class="input" type="text" placeholder="Model" v-model="vehicle.vehicleDetails.model" required />
                  </p>
                </div>
                <div class="field">
                  <p class="control">
                    <Dropdown v-model="vehicle.vehicleDetails.category" :options="vehicle.typeOfVehicle == 'car' ? vehicleTypes.cars : vehicleTypes.bikes" placeholder="Select Type" required />
                  </p>
                </div>
              </div>
            </div>

            <div class="field is-horizontal p-2">
              <div class="field-label">
                <label class="label"></label>
              </div>
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <input class="input" type="text" placeholder="Color" v-model="vehicle.vehicleDetails.color" />
                  </p>
                </div>
                <div class="field">
                  <p class="control">
                    <InputNumber
                      id="horizontal"
                      v-model="vehicle.vehicleDetails.year"
                      showButtons
                      buttonLayout="horizontal"
                      :step="1"
                      :min="1947"
                      :max="new Date().getFullYear()"
                      :useGrouping="false"
                      decrementButtonClass="p-button-secondary"
                      incrementButtonClass="p-button-secondary"
                      incrementButtonIcon="pi pi-plus"
                      decrementButtonIcon="pi pi-minus"
                    />
                  </p>
                </div>
              </div>
            </div>

            <div class="field is-horizontal p-2">
              <div class="field-label">
                <label class="label">
                  <i class="pi pi-rectangle"></i>
                  &nbsp; License No
                </label>
              </div>
              <div class="field-body">
                <div class="field is-narrow">
                  <p class="control">
                    <input class="input" type="text" placeholder="KL-13-AR-9999" v-model="vehicle.vehicleDetails.licensePlateNumber" required pattern="([A-Za-z]{2}-[0-9]{2}-[A-Za-z]{1,}-[0-9]+)" />
                  </p>
                </div>
              </div>
            </div>

            <div class="field is-grouped is-grouped-centered">
              <p class="control">
                <a class="button is-warning" @click.stop="createVehicle()">Create</a>
              </p>
              <p class="control">
                <a class="button is-danger" @click="vehicle = { typeOfVehicle: 'car', vehicleDetails: {} }">Reset</a>
              </p>
            </div>
          </div>
        </AccordionTab>

        <AccordionTab v-model:disabled="disabled.service">
          <template #header>
            <i class="pi pi-shopping-cart"></i>
            &nbsp;
            <span>Service</span>
          </template>

          <div class="container">
            <div class="has-background-warning has-text-centered">
              <p class="is-size-3">
                <i class="pi pi-ticket"></i>
                &nbsp;Open Bill
              </p>
            </div>
            <div class="columns">
              <div class="column">
                <div class="field pt-5 has-addons">
                  <div class="control">
                    <Dropdown v-model="selectedService" :options="servicePackages" optionLabel="name" :filter="true" placeholder="Select Service" :showClear="true">
                      <template #value="slotProps">
                        <div class="country-item country-item-value" v-if="slotProps.value">
                          <div>{{ slotProps.value.name }}</div>
                        </div>
                        <span v-else>
                          {{ slotProps.placeholder }}
                        </span>
                      </template>
                      <template #option="slotProps">
                        <div class="country-item">
                          <div>{{ slotProps.option.name }}</div>
                        </div>
                      </template>
                    </Dropdown>
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="box is-4">
                  <p class="subtitle">Selected Package</p>
                  <hr />
                  <template v-if="selectedService">
                    <table class="table is-fullwidth">
                      <tbody>
                        <tr>
                          <th>Package Name</th>
                          <td>
                            {{ selectedService.packageName }}
                          </td>
                        </tr>
                        <tr>
                          <th>Code</th>
                          <td>
                            {{ selectedService.packageCode }}
                          </td>
                        </tr>
                        <tr>
                          <th>Details</th>
                          <td>
                            {{ selectedService.packageDetails }}
                          </td>
                        </tr>
                        <tr>
                          <th>Rate</th>
                          <td>
                            &#8377;
                            {{ selectedService.rate }}
                          </td>
                        </tr>
                        <tr>
                          <th>Accessory</th>
                          <td>
                            {{ selectedService.accessory }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div class="control pl-3">
                      <a class="button is-warning" @click="addToServiceCart()">
                        Add&nbsp;
                        <li class="pi pi-plus"></li>
                      </a>
                    </div>
                  </template>
                  <template v-else>
                    <p class="is-5 has-text-centered">Please select a Service package</p>
                  </template>
                </div>
              </div>
            </div>
            <hr />
            <div class="columns">
              <div class="column">
                <table class="table">
                  <tbody>
                    <tr>
                      <th>Estimate/Bill No :</th>
                      <td>
                        {{ billNo }}
                      </td>
                    </tr>
                    <tr>
                      <th>Date of Initiation :</th>
                      <td>
                        {{ new Date().toLocaleDateString() }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="column">
                <div class="is-pulled-right">
                  <table class="table is-borderless">
                    <tbody>
                      <tr>
                        <th>Expected Date of Delivery :</th>
                        <td>
                          {{ new Date().toLocaleDateString() }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="box">
              <table class="table is-fullwidth is-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Package Name</th>
                    <th>Code</th>
                    <th>HSN</th>
                    <th>Rate</th>
                    <th>CGST</th>
                    <th>SGST</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="serviceCart.length != 0">
                    <tr v-for="(item, i) in serviceCart" :key="item._id">
                      <td>
                        {{ i + 1 }}
                      </td>
                      <td>
                        {{ item.packageName }}
                      </td>
                      <td>
                        {{ item.packageCode }}
                      </td>
                      <td>
                        {{ item.HSNCode || "000000" }}
                      </td>
                      <td>
                        {{ $filters.currency(item.rate) }}
                      </td>
                      <td>
                        {{ $filters.currency(item.rate * (0.01 * (item.tax / 2))) }}
                      </td>
                      <td>
                        {{ $filters.currency(item.rate * (item.tax / 2) * 0.01) }}
                      </td>
                      <td>
                        {{ $filters.currency(item.rate) }}
                      </td>
                      <td>
                        <li class="pi pi-trash" @click.stop="removeService(i)"></li>
                      </td>
                    </tr>
                  </template>
                  <template v-else>
                    <tr>
                      <td colspan="9" class="has-text-centered">
                        Huh, the Cart seems to be empty...
                        <li class="pi pi-shopping-cart"></li>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
            <div class="columns">
              <div class="column box is-4 is-offset-8">
                <p class="subtitle">Total</p>
                <hr />
                <table class="is-fullwidth">
                  <tbody>
                    <tr>
                      <th>Taxable Amount :</th>
                      <td>
                        {{
                          $filters.currency(
                            serviceCart.reduce(function (total, i) {
                              return total + i.rate;
                            }, 0)
                          )
                        }}
                      </td>
                    </tr>
                    <tr>
                      <th>Tax :</th>
                      <td>
                        {{
                          $filters.currency(
                            serviceCart.reduce(function (total, i) {
                              return total + i.rate * i.tax * 0.01;
                            }, 0)
                          )
                        }}
                      </td>
                    </tr>
                    <tr>
                      <th>Total :</th>
                      <td>
                        {{
                          $filters.currency(
                            serviceCart.reduce(function (total, i) {
                              return total + i.rate + i.rate * i.tax * 0.01;
                            }, 0)
                          )
                        }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="field is-grouped is-grouped-centered">
              <p class="control">
                <a class="button is-warning" @click.stop="confirmOpenBill($event)">Open Bill</a>
              </p>
              <p class="control">
                <a class="button is-danger" @click.stop="$router.push({ path: '/bill' })">Exit</a>
              </p>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </div>
    <Dialog v-model:visible="display.customerModal" :style="{ width: '50vw' }" :modal="true" :dismissableMask="true" :keepInViewport="true" :draggable="true">
      <template #header>
        <h3><b>Customer Creation</b></h3>
      </template>
      <progress v-if="loading" class="progress is-small is-warning" max="100" style="height: 0.25rem">20%</progress>
      <div class="content">
        <table class="">
          <tbody>
            <tr>
              <td>Name :</td>
              <td>
                {{ `${customer.name.firstName} ${customer.name.middleName} ${customer.name.lastName}` }}
              </td>
            </tr>
            <tr>
              <td>Phone :</td>
              <td>+91 {{ customer.phoneNumber }}</td>
            </tr>
            <tr>
              <td>Email :</td>
              <td>{{ customer.email }}</td>
            </tr>
            <tr>
              <td>Location :</td>
              <td>
                {{ `${customer.address.state} ${customer.address.district} ${customer.address.city}` }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <template #footer>
        <button @click="createCustomer()" class="button is-black">Yes</button>
      </template>
    </Dialog>
    <ConfirmPopup></ConfirmPopup>
    <Toast />
  </div>
</template>
<script>
import { ipcRenderer, remote } from "electron";
import fs from "fs";
import validator from "validator";
import { generateBillNo } from "../../modules/billNumberGenerator";

export default {
  data() {
    return {
      loading: true,
      disabled: {
        customer: false,
        vehicle: true,
        service: true,
      },
      proceed: {
        customer: true,
        vehicle: true,
      },
      activeIndex: -1,
      display: {
        customerModal: false,
      },
      value: null,
      customer: { name: {}, address: {} },
      customerVehicles: null,
      vehicle: { typeOfVehicle: "car", vehicleDetails: { year: new Date().getFullYear() } },
      vehicleTypes: {
        cars: ["Sedan", "Coupe", "Muscle", "Sports", "Station Wagon", "Hatchback", "Covertible", "SUV", "Minivan", "Pickup Truck"],
        bikes: ["Cruiser", "Adventure", "Off-Road", "Naked", "Retro", "Bobber", "Cafe Racer", "Tourer", "Sports", "Scooter"],
      },
      selectedVehicle: null,
      selectedCustomer: null,
      filteredCustomer: null,
      filteredVehicle: null,
      locateOptions: { states: [], districts: [] },
      servicePackages: null,
      selectedService: null,
      serviceCart: [],
      billNo: null,
    };
  },
  registeredCustomer: null,
  states: null,
  watch: {
    customer: {
      deep: true,
      immediate: true,
      handler(newVal) {
        if (newVal.address.state != null) this.locateOptions.districts = Object.values(this.states).find((el) => el.state == newVal.address.state).districts;
      },
    },
    selectedCustomer: {
      handler(newVal, oldVal) {
        if (newVal != oldVal) {
          this.selectedService = null;
          this.selectedVehicle = null;
          this.activeIndex = 0;
          this.disabled.vehicle = true;
          this.disabled.service = true;
          this.proceed = {
            customer: true,
            vehicle: true,
          };
        }
      },
    },
    selectedVehicle: {
      handler(newVal, oldVal) {
        if (newVal != oldVal) {
          this.disabled.service = true;
          this.selectedService = null;
          this.proceed.vehicle = true;
        }
      },
    },
  },

  async created() {
    this.loading = true;
    const isDevelopment = process.env.NODE_ENV !== "production";
    const basePath = isDevelopment ? "src/data" : "resources";
    this.states = JSON.parse(fs.readFileSync(basePath + "\\static\\states.json")).states;

    await this.fetchCustomers();
    await this.fetchServices();
    this.locateOptions.states = Object.values(this.states).map((el) => el.state);
    let that = this;

    setTimeout(function () {
      that.loading = false;
    }, 1000);
  },
  mounted() {
    this.activeIndex = 0;
  },
  methods: {
    removeService(index) {
      this.serviceCart.splice(index, 1);
    },
    async fetchCustomers() {
      let res = await ipcRenderer.sendSync("fetch", {
        type: "customer",
      });
      console.log(res);
      if (res.status && res.length != 0) {
        this.registeredCustomer = res.message;
      } else alert("error");
      let win = remote.getCurrentWindow();
      win.blur();
      win.focus();
    },

    searchCustomer(event) {
      if (event.query.length < 2) {
        this.filteredCustomer = [];
        return;
      }
      this.filteredCustomer = this.registeredCustomer.filter((customer) => {
        return customer.fullName.includes(event.query);
      });
    },
    validateCustomerDetails() {
      this.loading = true;
      try {
        this.customer.name.firstName = (this.customer.name.firstName || " ").trim();
        this.customer.name.middleName = (this.customer.name.middleName || " ").trim();
        this.customer.name.lastName = (this.customer.name.lastName || " ").trim();

        this.customer.address.state = this.customer.address.state.trim();
        this.customer.address.city = this.customer.address.city.trim();
        this.customer.address.district = this.customer.address.district.trim();

        this.customer.email = this.customer.email.trim();
        this.customer.phoneNumber = this.customer.phoneNumber.trim();

        if (
          !validator.isEmail(this.customer.email) ||
          this.customer.name.lastName == "" ||
          this.customer.email == "" ||
          this.customer.phoneNumber.length < 10 ||
          this.customer.address.state == "" ||
          this.customer.address.city == "" ||
          this.customer.address.district == ""
        ) {
          throw new Error();
        }
        this.display.customerModal = true;
      } catch (error) {
        console.log(error);
        alert("Empty/Invalid Data");
      }
      let win = remote.getCurrentWindow();
      win.blur();
      win.focus();
      this.loading = false;
    },
    async createCustomer() {
      this.loading = true;
      let data = await ipcRenderer.sendSync("create-customer", JSON.parse(JSON.stringify(this.customer)));
      console.log(data);
      if (data.status) {
        alert(`Customer Created  :  ${data.message} ${data.code}`);
        alert("Email Sent : " + data.emailStatus);
        await this.fetchCustomers();
        this.customer = { name: {}, address: {} };
      } else {
        alert("Something went wrong  : " + data.message + data.code);
      }
      let win = remote.getCurrentWindow();
      win.blur();
      win.focus();
      this.loading = false;
      this.display.customerModal = false;
    },
    selectConfirmCustomer() {
      this.disabled.vehicle = false;
      this.proceed.customer = false;
      this.activeIndex = 1;
      this.fetchVehicles();
    },
    async selectConfirmVehicle() {
      // check if vehicle bill exists or not.
      let res = await ipcRenderer.sendSync("fetch", {
        type: "bill-by-open-vehicle",
        licensePlateNumber: this.selectedVehicle.vehicleDetails.licensePlateNumber,
      });
      if (res.status && res.message) this.$toast.add({ severity: "error", summary: "Duplicate bill", detail: "Vehicle has an Open-Bill;\n Choose another vehicle", life: 3000 });
      else {
        this.disabled.service = false;
        this.proceed.vehicle = false;
        this.activeIndex = 2;
      }
    },
    async fetchVehicles() {
      let res = await ipcRenderer.sendSync(
        "fetch",
        JSON.parse(
          JSON.stringify({
            type: "vehicle",
            customerId: this.selectedCustomer._id,
          })
        )
      );
      if (res.status && res.length != 0) {
        this.customerVehicles = res.message;
      } else alert("error");
      let win = remote.getCurrentWindow();
      win.blur();
      win.focus();
    },

    searchCustomerVehicles(event) {
      this.filteredVehicle = this.customerVehicles.filter((vehicle) => {
        return Object.values(vehicle.vehicleDetails).some((el) => el.includes(event.query));
      });
    },
    validateVehicleData() {
      try {
        this.vehicle.vehicleDetails.make = this.vehicle.vehicleDetails.make.trim();
        this.vehicle.vehicleDetails.model = this.vehicle.vehicleDetails.model.trim();
        this.vehicle.vehicleDetails.color = this.vehicle.vehicleDetails.color.trim();
        this.vehicle.vehicleDetails.licensePlateNumber = this.vehicle.vehicleDetails.licensePlateNumber.trim();
        if (
          this.vehicle.vehicleDetails.make.length < 2 ||
          this.vehicle.vehicleDetails.model.length < 2 ||
          this.vehicle.vehicleDetails.color.length < 3 ||
          this.vehicle.vehicleDetails.licensePlateNumber.length < 6 ||
          this.vehicle.vehicleDetails.year == "" ||
          this.vehicle.vehicleDetails.category == ""
        )
          throw new Error();
      } catch (err) {
        alert("Empty/Invalid Data");
        let win = remote.getCurrentWindow();
        win.blur();
        win.focus();
        return false;
      }
      return true;
    },
    async createVehicle() {
      if (!this.validateVehicleData()) return;

      this.loading = true;
      this.vehicle.owner = this.selectedCustomer._id;
      let data = await ipcRenderer.sendSync("create-vehicle", JSON.parse(JSON.stringify(this.vehicle)));
      if (data.status) {
        alert(`Vehicle Created  :  ${data.message} ${data.code}`);
        await this.fetchVehicles();
        this.vehicle = { vehicleDetails: { year: new Date().getFullYear() } };
      } else {
        alert("Something went wrong  : " + data.message + data.code);
      }
      let win = remote.getCurrentWindow();
      win.blur();
      win.focus();
      this.loading = false;
    },

    async fetchServices() {
      if (!this.billNo) this.billNo = generateBillNo();
      let res = await ipcRenderer.sendSync("fetch", {
        type: "service",
      });
      res.message.forEach((element) => {
        element.name = element.packageName;
      });
      if (res.status && res.length != 0) {
        this.servicePackages = res.message || [];
      } else alert("ERROR : fetching service packages");
      let win = remote.getCurrentWindow();
      win.blur();
      win.focus();
    },
    addToServiceCart() {
      if (!this.selectedService) return;
      let that = this;
      if (
        !this.serviceCart.find(function (el) {
          return that.selectedService.packageCode == el.packageCode;
        })
      ) {
        this.selectedService.amount = this.selectedService.rate;
        this.serviceCart.push(this.selectedService);
        this.selectedService = null;
      }
    },

    confirmOpenBill(event) {
      this.$confirm.require({
        target: event.currentTarget,
        message: "Are you sure you want to proceed?",
        icon: "pi pi-exclamation-triangle",
        accept: async () => {
          //callback to execute when user confirms the action
          // writes to DB
          let data = {
            vehicleName: this.selectedVehicle.vehicleDetails.make + " " + this.selectedVehicle.vehicleDetails.model,
            email: this.selectedCustomer.email,
            broughtIn: this.selectedCustomer._id,
            billNo: this.billNo,
            vehicleID: this.selectedVehicle._id,
            dateOfDelivery: new Date(),
            billDetails: {
              additionalCharges: [],
              servicePackageFinal: [],
            },
          };
          for (let service of this.serviceCart)
            data.billDetails.servicePackageFinal.push({
              package: service._id,
              warrantyExpiryDate: new Date(),
              qty: 1,
              rate: service.rate.toFixed(2),
              tax: (service.rate * 0.01 * service.tax).toFixed(2),
              amt: service.rate.toFixed(2),
            });
          let res = await ipcRenderer.sendSync("create-bill", JSON.parse(JSON.stringify(data)));
          if (res.status) {
            alert("Bill has been created.Please Update the status for customer to track");
            alert("Email Sent for Tracking", res.emailStatus);
            this.$router.push({ path: "/bill" });
          } else alert("error");
          let win = remote.getCurrentWindow();
          win.blur();
          win.focus();
        },
        reject: () => {
          //callback to execute when user rejects the action
          //do nothing
        },
      });
    },
  },
};
</script>
<style scoped>
.p-divider-solid.p-divider-horizontal:before {
  border-top-style: solid !important;
}
</style>
