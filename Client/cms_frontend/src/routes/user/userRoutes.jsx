import React from "react";
import { Route } from "react-router-dom";
import Home from "../../pages/user/home/home";
import Dashboard from "../../pages/user/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import Explore from "../../pages/user/Explore";

const UserRoutes = () => {
    return (
        <>
            <Route path="/" element={<Home />} />
            <Route
                path="dashboard/"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route path='explore/' element={<Explore />} />
        </>
    );
};

export default UserRoutes;
