import { useState } from "react";
import { useDispatch } from "react-redux";
import { setAuthenticated, setUser, setIsAdmin } from "../../store/userSlice";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const { data } = await api.post("/admin/login/", { email, password });
            if (data.success && data.role === "admin") {
                dispatch(setAuthenticated(true));
                dispatch(setIsAdmin());
                dispatch(setUser(data.user));
                navigate("/admin");
            } else {
                setError("Invalid credentials or permission denied.");
            }
        } catch {
            setError("Invalid credentials or permission denied.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
            <form
                className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full"
                onSubmit={handleSubmit}
                autoComplete="off"
                style={{ boxShadow: "0 10px 32px rgba(191,191,131,0.12)" }}
            >
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Admin Login</h2>
                {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</div>}
                <div className="mb-4">
                    <label className="block text-gray-600 font-medium mb-2">Email</label>
                    <input
                        type="email"
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-600 font-medium mb-2">Password</label>
                    <input
                        type="password"
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;
