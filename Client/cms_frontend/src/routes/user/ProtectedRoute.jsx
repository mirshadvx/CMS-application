import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.user);
    console.log("user is authenticated ", isAuthenticated);
    

    return isAuthenticated ? children : <Navigate to={"/"} replace />;
};

export default ProtectedRoute;
