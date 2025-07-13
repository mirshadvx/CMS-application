import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { authAPI } from "../../../services/api";
import { useDispatch } from "react-redux";
import { setAuthenticated, setIsUser } from "../../../store/userSlice";

const SignIn = ({ onClose, onSwitchToSignUp }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const dispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const response = await authAPI.login({
                email: data.email,
                password: data.password,
            });
            
            if (response.data.success) {
                dispatch(setAuthenticated(true));
                dispatch(setIsUser(true));
            } else {
                dispatch(setAuthenticated(false));
                dispatch(setIsUser(false));
            }
            onClose();
            alert("login success")
        } catch (error) {
            console.error("Login error:", error);
            const msg = error.response?.data?.message || error.response?.data?.detail || "Login failed. Please try again.";
            setErrorMessage(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h1>
                        <p className="text-gray-600">Sign in to your account to continue.</p>
                    </div>

                    {errorMessage && (
                        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{errorMessage}</div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^\S+@\S+$/i,
                                            message: "Enter a valid email",
                                        },
                                    })}
                                    placeholder="Enter your email"
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                        errors.email ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                                    }`}
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: { value: 6, message: "Minimum 6 characters" },
                                    })}
                                    placeholder="Enter your password"
                                    className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                        errors.password
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                    Signing In...
                                </div>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600 text-sm">
                            Don't have an account?{" "}
                            <button
                                onClick={onSwitchToSignUp}
                                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                            >
                                Create an account
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
