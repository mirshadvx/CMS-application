import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { authAPI } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import contentApi from "../../../services/content/content";
import { useToast } from "../../../hooks/useToast";

const SignUp = ({ onClose, onSwitchToSignIn }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [contentCategories, setContentCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const { showSuccess, showError } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        mode: "onChange",
    });

    const password = watch("password");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);
                const response = await contentApi.getCategories();
                setContentCategories(response.data);
            } catch (error) {
                console.log(error);
                const errorMsg =
                    error.response?.data?.error ||
                    "Failed to load preferences";
                showError(errorMsg);
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryToggle = (categoryId) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const onSubmit = async (data) => {
        setIsLoading(true);

        try {
            const registrationData = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phoneNumber: data.phoneNumber,
                dateOfBirth: data.dateOfBirth,
                password: data.password,
                interests: selectedCategories,
            };

            const response = await authAPI.register(registrationData);
            console.log("Signup Success:", response.data);
            showSuccess("Account created successfully!");
            onClose();
        } catch (error) {
            console.log(error);
            let errorMsg = "Registration failed. Please try again.";

            if (error.response?.data?.error) {
                const errors = error.response.data.error;
                const firstKey = Object.keys(errors)[0];
                if (firstKey && Array.isArray(errors[firstKey])) {
                    errorMsg = errors[firstKey][0];
                }
            }

            showError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="p-8">

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Create an Account
                        </h1>
                        <p className="text-gray-600">
                            Sign up to access personalized articles and more.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                    >

                        <div className="grid grid-cols-2 gap-4">

                            <div>

                                <label
                                    htmlFor="firstName"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    First Name
                                </label>

                                <input
                                    type="text"
                                    maxLength={30}
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(
                                            /[^A-Za-z]/g,
                                            ""
                                        );
                                    }}
                                    {...register("firstName", {
                                        required: "First name is required",
                                        minLength: {
                                            value: 2,
                                            message:
                                                "First name must be at least 2 characters",
                                        },
                                        maxLength: {
                                            value: 30,
                                            message:
                                                "First name cannot exceed 30 characters",
                                        },
                                        pattern: {
                                            value: /^[A-Za-z]+$/,
                                            message:
                                                "Only letters are allowed",
                                        },
                                    })}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                        errors.firstName
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`} />

                                {errors.firstName && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.firstName.message}
                                    </p>
                                )}
                            </div>

                         
                            <div>

                                <label
                                    htmlFor="lastName"
                                    className="block text-sm font-medium text-gray-700 mb-2" >
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    maxLength={30}
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(
                                            /[^A-Za-z]/g,
                                            ""
                                        );
                                    }}
                                    {...register("lastName", {
                                        required: "Last name is required",
                                        minLength: {
                                            value: 2,
                                            message:
                                                "Last name must be at least 2 characters",
                                        },
                                        maxLength: {
                                            value: 30,
                                            message:
                                                "Last name cannot exceed 30 characters",
                                        },
                                        pattern: {
                                            value: /^[A-Za-z]+$/,
                                            message:
                                                "Only letters are allowed",
                                        },
                                    })}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                        errors.lastName
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}/>
                                {errors.lastName && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.lastName.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">

                            <div>
                                <label
                                    htmlFor="phoneNumber"
                                    className="block text-sm font-medium text-gray-700 mb-2" >
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    maxLength={10}
                                    inputMode="numeric"
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(
                                            /\D/g,
                                            ""
                                        );
                                    }}
                                    {...register("phoneNumber", {
                                        required:
                                            "Phone number is required",
                                        pattern: {
                                            value: /^[6-9]\d{9}$/,
                                            message:
                                                "Enter a valid 10-digit mobile number",
                                        },
                                        minLength: {
                                            value: 10,
                                            message:
                                                "Mobile number must be 10 digits",
                                        },
                                        maxLength: {
                                            value: 10,
                                            message:
                                                "Mobile number must be 10 digits",
                                        },
                                    })}
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                        errors.phoneNumber
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`} />

                                {errors.phoneNumber && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.phoneNumber.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 mb-2" >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    autoComplete="email"
                                    {...register("email", {
                                        required: "Email is required",

                                        pattern: {
                                            value:
                                                /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                                            message:
                                                "Enter a valid email address",
                                        },
                                    })}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                        errors.email
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="dateOfBirth"
                                className="block text-sm font-medium text-gray-700 mb-2" >
                                Date of Birth
                            </label>

                            <input
                                type="date"
                                max={new Date().toISOString().split("T")[0]}
                                {...register("dateOfBirth", {
                                    required: "Date of birth is required",

                                    validate: (value) => {
                                        const today = new Date();
                                        const dob = new Date(value);

                                        let age =
                                            today.getFullYear() -
                                            dob.getFullYear();

                                        const month =
                                            today.getMonth() -
                                            dob.getMonth();

                                        if (
                                            month < 0 ||
                                            (month === 0 &&
                                                today.getDate() <
                                                    dob.getDate())
                                        ) {
                                            age--;
                                        }

                                        return (
                                            age >= 18 ||
                                            "You must be at least 18 years old"
                                        );
                                    },
                                })}
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                    errors.dateOfBirth
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            />
                            {errors.dateOfBirth && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.dateOfBirth.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    autoComplete="new-password"
                                    {...register("password", {
                                        required:
                                            "Password is required",

                                        minLength: {
                                            value: 8,
                                            message:
                                                "Password must be at least 8 characters",
                                        },
                                        pattern: {
                                            value:
                                                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                            message:
                                                "Password must contain one uppercase, one lowercase and one number",
                                        },
                                    })}
                                    className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                        errors.password
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>

                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Confirm Password
                            </label>

                            <div className="relative">
                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    autoComplete="new-password"
                                    onPaste={(e) => e.preventDefault()}
                                    {...register("confirmPassword", {
                                        required:
                                            "Please confirm your password",

                                        validate: (value) =>
                                            value === password ||
                                            "Passwords do not match",
                                    })}
                                    className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                        errors.confirmPassword
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Article Preferences (Optional)
                            </label>

                            {categoriesLoading ? (
                                <div className="flex items-center text-sm text-gray-500">
                                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                    Loading preferences...
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-3">

                                    {contentCategories.map((category) => (
                                        <label
                                            key={category.id}
                                            className="flex items-center space-x-2 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(
                                                    category.id
                                                )}
                                                onChange={() =>
                                                    handleCategoryToggle(
                                                        category.id
                                                    )
                                                }
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />

                                            <span className="text-sm text-gray-700">
                                                {category.name}
                                            </span>
                                        </label>
                                    ))}

                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                    Creating Account...
                                </div>
                            ) : (
                                "Sign Up"
                            )}
                        </button>
                    </form>
                    <div className="mt-8 text-center">
                        <p className="text-gray-600 text-sm">
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={onSwitchToSignIn}
                                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                            >
                                Sign In
                            </button>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SignUp;