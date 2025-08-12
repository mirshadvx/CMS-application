import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutReducer } from "../store/userSlice"; // adjust path if different
import { authAPI } from "../services/api"; // using your api.js with withCredentials

// Admin Layout Component
const AdminLayout = () => {
    const navItems = [
        { to: "/admin", label: "Dashboard", exact: true },
        { to: "/admin/users", label: "Users"},
        { to: "/admin/posts", label: "Posts"},
    ];

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await authAPI.logout(); // call backend to clear cookies
        } catch (err) {
            console.error("Logout request failed", err);
        }
        dispatch(logoutReducer()); // clear Redux state
        navigate("/admin/login", { replace: true }); // go back to login page
    };

    return (
        <div
            className="min-h-screen flex flex-col md:flex-row"
            style={{ backgroundColor: "#f0f0e8" }}
        >
            {/* Sidebar */}
            <aside
                className="md:w-64 w-full md:h-screen border-r shadow-lg flex flex-col"
                style={{ backgroundColor: "#d4d3a7" }}
            >
                <div className="p-6 flex justify-between items-center border-b border-gray-300">
                    <h1 className="font-bold text-xl text-gray-800">Admin Panel</h1>
                </div>
                <nav className="px-3 flex-1 overflow-y-auto">
                    <ul className="space-y-2 mt-4">
                        {navItems.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    end={item.exact}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                                            isActive
                                                ? "bg-white text-gray-800 shadow-md"
                                                : "text-gray-700 hover:bg-white hover:bg-opacity-50"
                                        }`
                                    }
                                >
                                    <span className="hidden md:inline">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="p-4 border-t border-gray-300">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
