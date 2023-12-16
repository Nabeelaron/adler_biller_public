import { createStore } from "vuex";

export default createStore({
    state: {
        user: "",
        admin: "",
        version: "0.0.0",
    },
    getters: {
        getUserProfile(state) {
            return { user: state.user, admin: state.admin };
        },
        getVersion(state) {
            return state.version;
        },
    },
    mutations: {
        setUserProfile(state, data) {
            state.user = data.username;
            state.admin = data.admin;
        },
        setVersion(state, data) {
            state.version = data;
        },
    },
});