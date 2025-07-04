import React from "react";
import { Route } from "react-router-dom";
import AuthPage from "../../pages/user/AuthPage";
const auth = () => {
    return (
        <>
            <Route path="/login" element={<AuthPage />} />
        </>
    );
};

export default auth;
