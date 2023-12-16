/* eslint-disable */
/* */
import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import InputText from "primevue/inputtext";
import AutoComplete from "primevue/autocomplete";
import Divider from "primevue/divider";
import Dialog from "primevue/dialog";
import ConfirmationService from "primevue/confirmationservice";
import ConfirmPopup from "primevue/confirmpopup";
import InputMask from "primevue/inputmask";
import RadioButton from "primevue/radiobutton";
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";
import Chip from "primevue/chip";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import Timeline from "primevue/timeline";
import InputSwitch from "primevue/inputswitch";
import Chart from "primevue/chart";
import Calendar from "primevue/calendar";
import ContextMenu from "primevue/contextmenu";
import Toolbar from "primevue/toolbar";
import Knob from "primevue/knob";
import Message from "primevue/message";
import ToastService from "primevue/toastservice";
import Toast from "primevue/toast";

import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

import fs from "fs";
/* */
import router from "./router";
import store from "./store";
import LoadingIndicator from "./components/LoadingIndicator";
import Login from "./components/Login";
import Offline from "./components/OfflineScreen";

/*Views*/
import App from "./App.vue";

const app = createApp(App);

// Global properties & directives

app.config.globalProperties.$filters = {
  currency(value) {
    return "₹" + Number(value).toFixed(2);
  },
};
app.directive("visible", {
  beforeUpdate(el, binding) {
    el.style.visibility = binding.value ? "visible" : "hidden";
  },
});

const isDevelopment = process.env.NODE_ENV !== "production";
const basePath = isDevelopment ? "src/data/static" : "resources/static";

store.commit("setVersion", JSON.parse(fs.readFileSync(`${basePath}/meta.json`, "utf8"))["version"]);

app
  .use(PrimeVue, { ripple: true, inputStyle: "filled" })
  .use(store)
  .use(router)
  .use(ToastService)
  .use(ConfirmationService)
  .component("Accordion", Accordion)
  .component("AccordionTab", AccordionTab)
  .component("InputText", InputText)
  .component("AutoComplete", AutoComplete)
  .component("Divider", Divider)
  .component("Dialog", Dialog)
  .component("ConfirmPopup", ConfirmPopup)
  .component("InputMask", InputMask)
  .component("RadioButton", RadioButton)
  .component("Dropdown", Dropdown)
  .component("InputNumber", InputNumber)
  .component("Chip", Chip)
  .component("Splitter", Splitter)
  .component("Toast", Toast)
  .component("SplitterPanel", SplitterPanel)
  .component("Timeline", Timeline)
  .component("InputSwitch", InputSwitch)
  .component("Chart", Chart)
  .component("Calendar", Calendar)
  .component("ContextMenu", ContextMenu)
  .component("Message", Message)
  .component("Toolbar", Toolbar)
  .component("Knob", Knob)
  .component("LoadingIndicator", LoadingIndicator)
  .component("Login", Login)
  .component("Offline", Offline)
  .mount("#app");
