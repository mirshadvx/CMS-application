import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import userReducer from "./userSlice";
import storage from "redux-persist/lib/storage";
import { setApiDispatch } from "../services/api";

const persistConfig = {
    key: "user",
    storage,
    whitelist: ["role", "isAuthenticated"],
};

export const store = configureStore({
    reducer: {
        user: persistReducer(persistConfig, userReducer),
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
            },
        }),
});

export const persistor = persistStore(store);

setApiDispatch(store.dispatch);
