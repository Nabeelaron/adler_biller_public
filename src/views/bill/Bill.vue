<template>
  <LoadingIndicator v-show="loading" />
  <section class="hero is-medium is-link">
    <div class="hero-head has-text-centered pt-6"><p class="title py-2">Bill</p></div>
    <div class="hero-body p-1 m-1">
      <div class="columns is-desktop is-vcentered is-centered">
        <div class="column" :class="{ 'is-5': !todaysChartAvailable }">
          <div class="px-6">
            <div class="card has-text-centered has-background-link-light has-text-link-dark">
              <p class="is-size-4">Total Bills</p>
              <hr />
              <p class="is-size-1 is-bold">{{ total }}</p>
              <small>(Closed + Open)</small>
            </div>
            <div class="has-text-centered">
              <span class="m-2 is-inline-block button is-info is-light is-outlined my-0 is-static">PENDING</span>
              <Chart type="pie" :data="pie" :options="options" :styles="chartStyle" />
              <small>Showing pending closed & open bills</small>
            </div>
          </div>
        </div>
        <div class="column has-text-centered" v-show="todaysChartAvailable">
          <span class="m-2 is-inline-block button is-info is-light is-outlined my-0 is-static">TODAY</span>
          <Chart type="doughnut" :data="todaysChartData" :options="options" :styles="chartStyle" />
          <small>Showing todays closed & open bills</small>
        </div>
      </div>
    </div>
  </section>
  <section class="section">
    <Splitter stateKey="layoutKey" stateStorage="local">
      <SplitterPanel :size="80" :minSize="50" class="p-5">
        <div class="tile is-ancestor">
          <div class="tile is-parent">
            <div class="tile is-6">
              <router-link to="/bill/create" class="box has-background-link-light">
                <div class="title">Create</div>
                <div class="subtitle">
                  <small class="info has-text-left has-text-grey-light">Create Customer,Vehicle or Open-Bill</small>
                </div>
              </router-link>
            </div>
            <div class="tile is-6">
              <router-link to="/bill/update" class="box has-background-link-light">
                <div class="title">Update</div>
                <div class="subtitle">
                  <small class="info has-text-left has-text-grey-light">Update Open-Bill for tracking</small>
                </div>
              </router-link>
            </div>
          </div>
        </div>
        <div class="tile is-ancestor">
          <div class="tile is-parent">
            <div class="tile is-6">
              <router-link to="/bill/close" class="box has-background-link-light">
                <div class="title">Close</div>
                <div class="subtitle">
                  <small class="info has-text-left has-text-grey-light">Edit or Close Open-Bills</small>
                </div>
              </router-link>
            </div>
            <div class="tile is-6">
              <router-link to="/bill/history" class="box has-background-link-light">
                <div class="title">History</div>
                <div class="subtitle">
                  <small class="info has-text-left has-text-grey-light">View, Send or Generate bills</small>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </SplitterPanel>
      <SplitterPanel :size="20" :minSize="20">
        <div class="container">
          <div class="level p-1 has-background-link has-text-white-ter">
            <span class="level-item">
              <p class="">Open Bills</p>
            </span>
            <span class="level-right">
              <span class="level-item">
                <template v-if="openBills.length">
                  <i class="pi pi-circle-on has-text-danger"></i>
                </template>
                <template v-else>
                  <i class="pi pi-circle-off has-text-success"></i>
                </template>
              </span>
            </span>
          </div>
          <div class="container p-2">
            <template v-for="bill in openBills" :key="bill._id">
              <span class="m-2 is-inline-block button is-info is-light is-outlined my-0 is-static is-uppercase">
                {{ bill.vehicleID.vehicleDetails.licensePlateNumber }}
              </span>
            </template>
          </div>
        </div>
      </SplitterPanel>
    </Splitter>
  </section>
</template>
<script>
import { ipcRenderer,remote } from "electron";
export default {
  data() {
    return {
      loading: true,
      chartStyle: {
        height: "30vh",
        width: "100%",
        position: "relative",
      },
      openBills: [],
      options: {
        borderWidth: 0,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              color: "white",
            },
          },
        },
      },
      total: 0,
      pie: {
        labels: ["Open", "Close"],
        datasets: [
          {
            data: [0, 0],
            backgroundColor: ["#FF6384", "#66BB6A"],
            hoverBackgroundColor: ["#FF6399", "#81C784"],
          },
        ],
      },
      todaysChartData: {
        labels: ["Open", "Closed"],
        datasets: [
          {
            data: [0, 0],
            borderColor: "white",
            backgroundColor: ["#FF6384", "#3273dc"],
            hoverBackgroundColor: ["#FF6384", "#36A2EB"],
          },
        ],
      },
    };
  },
  computed: {
    todaysChartAvailable() {
      return this.todaysChartData.datasets[0].data[0] != 0 || this.todaysChartData.datasets[0].data[1] != 0;
    },
  },
  async beforeMount() {
    this.loading = true;
    let res = await ipcRenderer.sendSync("bill-stats");
    if (res.status) {
      this.todaysChartData.datasets[0].data = [res.message.today.open, res.message.today.close];
      this.pie.datasets[0].data = [res.message.pending.open, res.message.pending.close];
      this.total = res.message.total;
    }

    res = await ipcRenderer.sendSync("fetch", {
      type: "bill-by-open",
    });
    let that = this;
    setTimeout(function () {
      if (res.status) that.openBills = res.message;
      else alert(res.message);
      let win = remote.getCurrentWindow();
      win.blur();
      win.focus();
      that.loading = false;
    }, 1000);
  },
};
</script>
<style scoped>
.box {
  width: 100%;
  min-height: 10rem;
  margin: auto 1rem;
  border-radius: var(--radius);
  transition-property: transform;
  transition-duration: var(--animation-time);
  transition-timing-function: var(--animation-curve);

  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-around;
  flex-direction: column;
}
.box .title {
  color: hsl(217, 71%, 45%);
}
a.box:active {
  transform: scale(1);
  background-color: hsl(217, 71%, 53%) !important;
}
.box:active .title {
  color: WHITE !important;
}
.info {
  visibility: hidden;
  font-size: 1rem;
  font-kerning: 1rem;
}
.box:hover .info {
  visibility: visible;
}
ul > li {
  display: inline;
  padding: 0.25em;
}
.box:hover {
  transform: scale(var(--scale));
}
</style>
