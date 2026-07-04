import React from "react";
import { Route } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import Home from "../../pages/admin/home";
import Users from "../../pages/admin/Users";
import Posts from "../../pages/admin/Posts";
import AdminProtectedRoute from "./AdminProtectedRoute";

const AdminRoutes = () => (
    <Route
        path="/admin"
        element={
            <AdminProtectedRoute>
                <AdminLayout />
            </AdminProtectedRoute>
        }
    >
        <Route index element={<Home />} />
        <Route path="users" element={<Users />} />
        <Route path="posts" element={<Posts />} />
    </Route>
);

export default AdminRoutes;
