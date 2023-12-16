<template>
  <LoadingIndicator v-show="loading" />
  <div
    class="container"
    :class="{
      'has-background-danger-light': selectedBill.vehicleStatus.status != 'Ready to Deliver',
    }"
    id="print"
  >
    <div
      class="has-background-warning has-text-centered p-2"
      :class="{
        'has-background-danger has-text-white ': selectedBill.vehicleStatus.status != 'Ready to Deliver',
      }"
    >
      <p class="is-size-3">
        <i class="pi pi-ticket"></i>
        &nbsp;Close Bill
      </p>
    </div>
    <hr />
    <div class="columns">
      <div class="column">
        <table class="table">
          <tbody>
            <tr>
              <th>Estimate/Bill No :</th>
              <td class="is-uppercase has-text-weight-bold">
                {{ selectedBill.billNo }}
              </td>
            </tr>
            <tr>
              <th>Date of Initiation :</th>
              <td>
                {{ new Date(selectedBill.createdAt).toLocaleString() }}
              </td>
            </tr>
            <tr>
              <th>Expected Date of Delivery :</th>
              <td>
                {{ new Date(selectedBill.dateOfDelivery).toLocaleString() }}
              </td>
            </tr>
            <tr>
              <th>Date of Delivery :</th>
              <td>
                {{ new Date().toLocaleString() }}
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
                <th>Name</th>
                <td>{{ `${selectedBill.broughtIn?.name?.firstName} ${selectedBill.broughtIn?.name?.middleName} ${selectedBill.broughtIn?.name?.lastName}` }}</td>
              </tr>
              <tr>
                <th>Contact</th>
                <td>{{ `${selectedBill.broughtIn.phoneNumber}, ${selectedBill.broughtIn.email}` }}</td>
              </tr>
              <tr>
                <th>License Plate #</th>
                <td>
                  <div class="m-2 is-inline-block button is-warning is-uppercase is-light is-outlined is-static">
                    {{ selectedBill.vehicleID.vehicleDetails.licensePlateNumber }}
                  </div>
                </td>
              </tr>
              <tr>
                <th>Type</th>
                <td>{{ selectedBill.vehicleID.typeOfVehicle }}</td>
              </tr>
              <tr>
                <th>Description</th>
                <td>
                  <small>
                    {{ `  ${selectedBill.vehicleID.vehicleDetails.color} ${selectedBill.vehicleID.vehicleDetails.make} ${selectedBill.vehicleID.vehicleDetails.model} [${selectedBill.vehicleID.vehicleDetails.category}]` }}
                  </small>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="box columns has-background-danger-light" v-if="selectedBill.vehicleStatus.status != 'Ready to Deliver'" style="border: 0.3em solid red">
      <div class="column">
        <b>Add Service</b>
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
        <div class="box m-2 is-4">
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

    <div class="box">
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Code</th>
            <th>HSN</th>
            <th>Rate</th>
            <th>CGST</th>
            <th>SGST</th>
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <template v-if="serviceCart.length != 0 || additionalCharges.length != 0">
            <tr v-for="(item, i) in serviceCart" :key="item._id">
              <td>
                {{ i + 1 }}
              </td>
              <td>
                {{ item.package.packageName }}
              </td>
              <td>
                {{ item.package.packageCode }}
              </td>
              <td>
                {{ item.package.HSNCode || "000000" }}
              </td>
              <td>
                {{ item.rate }}
              </td>
              <td>
                {{ $filters.currency(item.tax / 2) }}
              </td>
              <td>
                {{ $filters.currency(item.tax / 2) }}
              </td>
              <td>
                <input class="input" type="number" v-model="item.rate" min="0" @change="updateServiceCart(i)" />
              </td>
              <td v-if="deletable">
                <li class="pi pi-exclamation-circle pr-1" style="color: red" v-if="this.selectedBill.billDetails.servicePackageFinal.length > i"></li>
                <li class="pi pi-trash" @click.stop="removeService(i)"></li>
              </td>
            </tr>
            <div style="width: 100%; height: 2px; background-color: red"></div>
            <tr v-for="(item, i) in additionalCharges" :key="item.id">
              <td>
                {{ i + 1 }}
              </td>
              <td>
                {{ item.name }}
              </td>
              <td>
                {{ item.code }}
              </td>
              <td>
                {{ item.HSNCode || "000000" }}
              </td>
              <td>
                {{ item.rate }}
              </td>
              <td>
                {{ $filters.currency(item.tax / 2) }}
              </td>
              <td>
                {{ $filters.currency(item.tax / 2) }}
              </td>
              <td>
                {{ item.amt }}
              </td>
              <td>
                <li class="pi pi-trash" @click.stop="removeAdditionalCharges(i)" :key="item._id"></li>
              </td>
            </tr>
            <tr>
              <td>
                <button class="button is-warning" @click.stop="addAdditionalCharges()">
                  <span class="icon is-small">
                    <i class="pi pi-plus"></i>
                  </span>
                </button>
              </td>
              <td>
                <input class="input" type="text" v-model="additionalChargesData.name" />
              </td>
              <td>
                <input class="input" type="text" v-model="additionalChargesData.type" />
              </td>
              <td>844399</td>
              <td>{{ additionalChargesData.rate }}</td>
              <td>{{ $filters.currency(additionalChargesData.tax / 2) }}</td>
              <td>{{ $filters.currency(additionalChargesData.tax / 2) }}</td>
              <td>
                <input class="input" type="number" v-model="additionalChargesData.amt" min="0" />
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
                      return Number(total) + Number(i.rate);
                    }, 0) +
                      additionalCharges.reduce(function (total, i) {
                        return Number(total) + Number(i.amt);
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
                      return Number(total) + Number(i.tax);
                    }, 0) +
                      additionalCharges.reduce(function (total, i) {
                        return Number(total) + Number(i.tax);
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
                      return Number(total) + Number(i.rate) + Number(i.tax);
                    }, 0) +
                      additionalCharges.reduce(function (total, i) {
                        return Number(total) + Number(i.amt) + Number(i.tax);
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
        <a class="button is-danger" @click.stop="updateBill()">Update</a>
      </p>
    </div>

    <div class="box" v-show="selectedBill.vehicleStatus.status == 'Ready to Deliver'">
      <div class="level">
        <div class="level-left">
          <div class="is-block">
            Payment methods
            <div class="p-field-radiobutton">
              <RadioButton id="payment1" name="payment" value="Card" v-model="payment.paymentMethod" class="m-1" />
              <label for="payment1">Card</label>
            </div>
            <div class="p-field-radiobutton">
              <RadioButton id="payment3" name="payment" value="UPI" v-model="payment.paymentMethod" class="m-1" />
              <label for="payment3">UPI</label>
            </div>
            <div class="p-field-radiobutton">
              <RadioButton id="payment2" name="payment" value="Cash" v-model="payment.paymentMethod" class="m-1" />
              <label for="payment2">Cash</label>
            </div>

            <div class="p-field-radiobutton">
              <RadioButton id="payment4" name="payment" value="FOC" v-model="payment.paymentMethod" class="m-1" />
              <label for="payment4">FOC</label>
            </div>
          </div>
        </div>
        <div class="is-centered">
          <form class="box">
            <div class="field">
              <figure class="image is-64x64 mx-auto">
                <img src="../../assets/img/cash.png" v-if="payment.paymentMethod == 'Cash'" alt="Image" />
                <img src="../../assets/img/upi.png" v-if="payment.paymentMethod == 'UPI'" alt="Image" />
                <img src="../../assets/img/credit-card.png" v-if="payment.paymentMethod == 'Card'" alt="Image" />
                <img src="../../assets/img/free.png" v-if="payment.paymentMethod == 'FOC'" alt="Image" />
              </figure>
              <hr />
              <div v-show="payment.paymentMethod == 'Card'">
                <label class="label">Last 4 Digits</label>
                <div class="control">
                  <InputMask v-model="payment.data" mask="9999" slotChar="XXXX" :unmask="true" required />
                </div>
              </div>
              <div v-show="payment.paymentMethod == 'UPI'">
                <label class="label">UPID</label>
                <div class="control">
                  <input class="input" type="text" placeholder="e.g. company@some.com" required v-model="payment.data" />
                </div>
              </div>
              <div v-show="payment.paymentMethod == 'Cash'">
                <div class="m-2 is-inline-block button is-success is-light is-outlined is-static">CASH</div>
              </div>
              <div v-show="payment.paymentMethod == 'FOC'">
                <div class="m-2 is-inline-block button is-success is-light is-outlined is-static">FREE-OF-COST</div>
              </div>
            </div>
          </form>
        </div>
        <div class="level-right is-block">
          <div class="level-item is-block m-1">
            <label>
              GST :
              <input type="checkbox" v-model="customerGST.include" />
            </label>

            <div v-visible="customerGST.include">
              <hr />
              <div class="p-float-label block">
                <InputText id="gstin" type="text" v-model="customerGST.gstin" />
                <label for="gstin">GSTIN</label>
              </div>
              <div class="p-float-label block">
                <InputText id="bname" type="text" v-model="customerGST.bname" />
                <label for="bname">Business name</label>
              </div>
              <div class="p-float-label block">
                <InputText id="place" type="text" v-model="customerGST.place" />
                <label for="place">Place</label>
              </div>
            </div>
          </div>
          <div class="level-item is-block">
            <div class="field is-grouped is-grouped-centered">
              <p class="control">
                <a class="button is-warning" @click.stop="confirmBillClose($event)">Close Bill</a>
              </p>

              <p class="control">
                <a class="button is-danger" @click.stop="$router.push({ path: '/bill' })">Exit</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ConfirmPopup></ConfirmPopup>
</template>
<script>
import { ipcRenderer, remote } from "electron";
export default {
  name: "service-edit",
  props: ["selectedBill", "deletable"],
  data() {
    return {
      servicePackages: [],
      selectedService: null,
      loading: false,
      type: null,
      payment: {
        paymentMethod: "Card",
        data: null,
      },
      customerGST: {
        include: false,
        gstin: "",
        bname: "",
        place: "",
      },
      serviceCart: [],
      additionalCharges: [],
      additionalChargesData: {
        type: "",
        tax: 0,
        rate: 0,
        amt: 0,
        name: "",
      },
    };
  },
  watch: {
    serviceCart: {
      deep: true,
      immediate: false,
      handler() {},
    },
    additionalChargesData: {
      deep: true,
      immediate: true,
      handler(val) {
        this.additionalChargesData.tax = val.amt * 0.18;
        this.additionalChargesData.rate = val.amt;
      },
    },
    selectedBill: {
      deep: true,
      immediate: false,
      handler() {
        this.startup();
      },
    },
  },
  mounted() {
    this.startup();
  },
  computed: {},
  methods: {
    scrollToTop() {
      window.scrollTo(0, 0);
    },
    updateServiceCart(index) {
      this.serviceCart[index].tax = this.serviceCart[index].rate * this.serviceCart[index].package.tax * 0.01;
    },
    startup() {
      this.fetchServices();

      this.serviceCart = [...this.selectedBill.billDetails.servicePackageFinal];
      this.additionalCharges = [...this.selectedBill.billDetails.additionalCharges];
    },
    async fetchServices() {
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

    updateBill() {
      this.serviceCart = this.serviceCart.map(function (i) {
        delete i._id;
        return i;
      });
      let data = {
        id: this.selectedBill._id,
        additionalCharges: this.additionalCharges,
        serviceCart: this.serviceCart,
      };
      let res = ipcRenderer.sendSync("update-bill", JSON.parse(JSON.stringify(data)));
      if (res.status) {
        alert("updated");
        this.$router.go();
      } else alert("error");
      let win = remote.getCurrentWindow();
    win.blur();
    win.focus();
    },

    removeAdditionalCharges(index) {
      this.additionalCharges.splice(index, 1);
    },
    removeService(index) {
      this.serviceCart.splice(index, 1);
    },

    addToServiceCart() {
      function transformForCart(data) {
        return {
          package: { ...data },
          rate: data.rate.toFixed(2),
          amt: data.rate.toFixed(2),
          tax: (data.rate * data.tax * 0.01).toFixed(2),
          qty: 1,
        };
      }
      if (!this.selectedService) return;
      let that = this;
      if (
        !this.serviceCart.find(function (el) {
          return that.selectedService.packageCode == el.package.packageCode;
        })
      ) {
        this.selectedService.amount = this.selectedService.rate;

        this.serviceCart.push(transformForCart(this.selectedService));

        this.selectedService = null;
      }
    },
    addAdditionalCharges() {
      try {
        if (this.additionalChargesData.name.trim().length <= 0 || this.additionalChargesData.type.trim().length <= 0 || +this.additionalChargesData.amt <= 0) throw new Error();
      } catch (err) {
        alert("Could not add data");let win = remote.getCurrentWindow();
    win.blur();
    win.focus();
        return;
      }
      this.additionalCharges.push({
        name: this.additionalChargesData.name,
        code: this.additionalChargesData.type,
        HSNCode: "844399",
        rate: Number(this.additionalChargesData.rate).toFixed(2),
        tax: Number(this.additionalChargesData.tax).toFixed(2),
        amt: Number(this.additionalChargesData.amt).toFixed(2),
      });
      this.additionalChargesData = {
        type: "",
        tax: 0,
        rate: 0,
        amt: 0,
        name: "",
      };
    },
    async confirmBillClose(event) {
      let that = this;
      this.$confirm.require({
        target: event.currentTarget,
        message: "Are you sure you want to proceed?",
        icon: "pi pi-exclamation-triangle",
        accept: async () => {
          this.scrollToTop();
          that.loading = true;
          if ((["Card", "UPI"].includes(this.payment.paymentMethod) && this.payment.data == "") || (this.customerGST.include && (this.customerGST.gstin == "" || this.customerGST.bname == "" || this.customerGST.place == ""))) {
            alert("Fill payment/GST details");let win = remote.getCurrentWindow();
    win.blur();
    win.focus();
            return;
          }

          let data = {
            id: this.selectedBill._id,
            payment: this.payment,
            gst: this.customerGST,
            bill: this.selectedBill,
          };
          setTimeout(async function () {
            let res = await ipcRenderer.sendSync("close-bill", JSON.parse(JSON.stringify(data)));
            if (res.billStatus) {
              alert("Bill closed & Invoice generated successfully");
              if (res.PDFstatus) alert(res.message);
              else alert(res.message);
              that.$router.go();
            } else alert("Error : ", res.message, res.code);
            let win = remote.getCurrentWindow();
            win.blur();
            win.focus();
          }, 1000);
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
