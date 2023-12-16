import { createRouter, createWebHistory, createWebHashHistory } from "vue-router";

const routes = [{
        path: "/",
        name: "Home",
        component: () =>
            import ( /* webpackChunkName: "home" */ "../views/Home.vue"),
    },
    {
        path: "/bill",
        name: "Bill",
        component: () =>
            import ( /* webpackChunkName: "bill" */ "../views/bill/Bill.vue"),
        children: [],
    },
    {
        path: "/bill/create",
        name: "CreateBill",
        component: () =>
            import ( /* webpackChunkName: "bill" */ "../views/bill/BillCreate.vue"),
    },
    {
        path: "/bill/history",
        name: "HistoryBill",
        component: () =>
            import ( /* webpackChunkName: "bill" */ "../views/bill/BillHistory.vue"),
    },
    {
        path: "/bill/close",
        name: "CloseBill",
        component: () =>
            import ( /* webpackChunkName: "bill" */ "../views/bill/BillClose.vue"),
    },
    {
        path: "/bill/update",
        name: "UpdateBill",
        component: () =>
            import ( /* webpackChunkName: "bill" */ "../views/bill/BillUpdate.vue"),
        children: [{
            path: "status",
            name: "billStatus",
            component: () =>
                import ( /* webpackChunkName: "bill" */ "../components/bill/BillUpdateStatus.vue"),
        }, ],
    },
    {
        path: "/package",
        name: "Packages",
        component: () =>
            import ( /* webpackChunkName: "package" */ "../views/Package.vue"),
    },
];
console.log(process.env.IS_ELECTRON);
const router = createRouter({
    history: process.env.IS_ELECTRON ? createWebHashHistory() : createWebHistory(process.env.BASE_URL),
    routes,
    scrollBehavior() {
        return {
            behavior: "smooth",
            top: 0,
        };
    },
});

export default router;