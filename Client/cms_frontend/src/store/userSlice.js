import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        isAuthenticated: false,
        role: {
            user: false,
            admin: false,
        },
        loading: false,
        error: null,
    },
    reducers: {
        setAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload;
        },
        setUser(state, action) {
            state.user = action.payload;
        },
        setIsUser: (state) => {
            state.role.user = true;
        },
        setNotUser: (state) => {
            state.role.user = false;
        },
        setIsAdmin: (state) => {
            state.role.admin = true;
        },
        setNotAdmin: (state) => {
            state.role.admin = false;
        },
        logoutReducer: (state) => {
            state.isAuthenticated = false;
            state.role = { admin: false, user: false };
            state.user = null;
            state.error = null;
        },
    },
});

export const { setAuthenticated, setIsUser, setUser, setNotUser, setIsAdmin, setNotAdmin, logoutReducer, setRole } =
    userSlice.actions;
export default userSlice.reducer;
