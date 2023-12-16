<template>
  <section class="section p-0">
    <div class="card p-5">
      <p class="title has-text-centered has-background-warning p-1">Status</p>
      <Timeline :value="phase" layout="horizontal" align="left">
        <template #content="slotProps">
          {{ slotProps.item.status }}
        </template>
        <template #marker="slotProps">
          <i v-if="slotProps.item.active" class="pi pi-circle-on"></i>
          <i v-else class="pi pi-circle-off"></i>
        </template>
        <template #connector>
          <div class="p-timeline-event-connector"></div>
        </template>
      </Timeline>
      <div class="columns">
        <div id="bill-info-card" class="column card">
          <table class="table">
            <tbody>
              <tr>
                <th>Bill #</th>
                <td>{{ vehicle.billNo }}</td>
              </tr>
              <tr>
                <th>License Plate #</th>
                <td>
                  {{ vehicle.vehicleID.vehicleDetails.licensePlateNumber }}
                </td>
              </tr>
              <tr>
                <th>Type</th>
                <td>{{ vehicle.vehicleID.typeOfVehicle }}</td>
              </tr>
              <tr>
                <th>Service</th>
                <td>
                  <ol>
                    <li v-for="service in vehicle.billDetails.servicePackageFinal" :key="service">
                      {{ service.package.packageName }}
                    </li>
                    <li v-for="service in vehicle.billDetails.additionalCharges" :key="service">
                      {{ service.name }}
                    </li>
                  </ol>
                </td>
              </tr>

              <tr>
                <th>Description</th>
                <td>
                  <small>
                    {{ `  ${vehicle.vehicleID.vehicleDetails.color} ${vehicle.vehicleID.vehicleDetails.make} ${vehicle.vehicleID.vehicleDetails.model} [${vehicle.vehicleID.vehicleDetails.category}]` }}
                  </small>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div id="progress-update-card" class="column card" v-if="phase.length != 0">
          <header class="card-header">
            <p class="card-header-title">Progress Update</p>
          </header>
          <div class="card-content">
            <div class="content is-block">
              <article class="message is-warning">
                <div class="message-body is-inline-block">
                  <div class="pi pi-info-circle"></div>
                  <div>
                    <small>Change of progress is reflected for customer to track their vehicle status.</small>
                  </div>
                </div>
              </article>
            </div>
            <div v-if="phase.length != nextStatus" class="content has-text-centered">
              <span class="is-underlined has-text-weight-bold">{{ phase[currentStatus].status }}</span>
              &nbsp;
              <i class="pi pi-arrow-right"></i>
              &nbsp;
              <span class="is-underlined has-text-weight-bold">{{ phase[nextStatus].status }}</span>
              <br />

              <p class="has-text-weight-semibold pt-2">Record Time : {{ new Date().toLocaleString() }}</p>
            </div>
          </div>
          <footer class="card-footer">
            <a v-if="currentStatus" @click="previousPhase($event)" class="card-footer-item">
              <i class="pi pi-arrow-left"></i>
              Back
            </a>

            <a v-if="nextStatus != phase.length" @click="nextPhase($event)" class="card-footer-item">
              Go
              <i class="pi pi-arrow-right"></i>
            </a>
          </footer>
        </div>
      </div>
    </div>
  </section>
  <ConfirmPopup></ConfirmPopup>
</template>
<script>
import { ipcRenderer, remote } from "electron";
export default {
  name: "BillUpdateStatus",
  props: {
    vehicle: Object,
  },
  data() {
    return {
      currentStatus: "0",
      nextStatus: "0",
      phase: [],
    };
  },
  mounted() {
    console.log(this.vehicle);
    this.updateProgress();
  },
  beforeUpdate() {
    this.updateProgress();
  },
  methods: {
    change() {
      this.phase[2].active = true;
    },
    updateProgress() {
      this.phase = [
        { status: "Registered", active: true },
        { status: "Initial Inspection", active: false },
        { status: "Exterior Washing", active: false },
        { status: "Interior Washing", active: false },
        { status: "Ceramic Coating ", active: false },
        { status: "Baking", active: false },
        { status: "Final Inspection", active: false },
        { status: "Ready to Deliver", active: false },
      ];
      let that = this;
      this.currentStatus = this.phase.findIndex(function (status) {
        return status.status.toLowerCase() == that.vehicle.vehicleStatus.status.toLowerCase();
      });
      this.nextStatus = this.currentStatus + 1;
      for (let i = 0; i < this.nextStatus; ++i) this.phase[i].active = true;
    },
    nextPhase(event) {
      this.$confirm.require({
        target: event.currentTarget,
        message: "Are you sure you want to proceed?",
        icon: "pi pi-exclamation-triangle",
        accept: async () => {
          let res = await ipcRenderer.sendSync(
            "update-vehicle-status",
            JSON.parse(
              JSON.stringify({
                id: this.vehicle._id,
                status: this.phase[this.nextStatus].status,
                licensePlateNumber: this.vehicle.vehicleID.vehicleDetails.licensePlateNumber,
                email: this.vehicle.broughtIn.email,
              })
            )
          );
          if (res.status) {
            this.$emit("update-vehicle-status", {
              status: this.phase[this.nextStatus].status,
              time: new Date(),
            });
            this.updateProgress();
            alert("updated");
            if (this.phase[this.currentStatus].status == "Ready to Deliver") alert("Email Sent : ", res.emailStatus);
          } else alert(res.message);
          let win = remote.getCurrentWindow();
          win.blur();
          win.focus();
        },
        reject: () => {
          //callback to execute when user rejects the action
        },
      });
    },
    previousPhase(event) {
      this.$confirm.require({
        target: event.currentTarget,
        message: "Are you sure you want to proceed?",
        icon: "pi pi-exclamation-triangle",
        accept: async () => {
          let res = await ipcRenderer.sendSync(
            "update-vehicle-status",
            JSON.parse(
              JSON.stringify({
                id: this.vehicle._id,
                status: this.phase[this.currentStatus - 1].status,
              })
            )
          );
          if (res.status) {
            this.$emit("update-vehicle-status", {
              status: this.phase[this.currentStatus - 1].status,
              time: new Date(),
            });
            this.updateProgress();
            alert("done");
          } else alert(res.message);
          let win = remote.getCurrentWindow();
          win.blur();
          win.focus();
        },
        reject: () => {},
      });
    },
  },
};
</script>
<style scoped>
.card {
  min-height: 5rem;
}

.p-timeline-event-connector {
  background-color: grey;
}
</style>
