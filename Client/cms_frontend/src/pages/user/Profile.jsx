import React, { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Pencil, Save, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../Components/user/Navbar/Navbar";
import { fetchUserDetails } from "../../services/userAction";
import api from "../../services/api";
import contentApi from "../../services/content/content";
import { setUser } from "../../store/userSlice";
import { useToast } from "../../hooks/useToast";

const Profile = () => {
    const dispatch = useDispatch();
    const { user, isAuthenticated, loading } = useSelector((state) => state.user);
    const [categories, setCategories] = useState([]);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [isEditingInterests, setIsEditingInterests] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [savingInterests, setSavingInterests] = useState(false);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        if (!user) {
            dispatch(fetchUserDetails());
        }
    }, [dispatch, user]);

    useEffect(() => {
        if (user?.interests) {
            setSelectedInterests(user.interests.map((interest) => interest.id));
        }
    }, [user]);

    useEffect(() => {
        const fetchCategories = async () => {
            setCategoriesLoading(true);
            try {
                const response = await contentApi.getCategories();
                setCategories(response.data.filter((category) => category.active));
            } catch (error) {
                console.error("Failed to fetch categories:", error);
                showError("Failed to load interest categories.");
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const selectedInterestNames = useMemo(() => {
        const categoryById = new Map(categories.map((category) => [category.id, category.name]));
        return selectedInterests.map((id) => categoryById.get(id)).filter(Boolean);
    }, [categories, selectedInterests]);

    const hasInterestChanges = useMemo(() => {
        const original = (user?.interests || []).map((interest) => interest.id).sort((a, b) => a - b);
        const current = [...selectedInterests].sort((a, b) => a - b);
        return JSON.stringify(original) !== JSON.stringify(current);
    }, [selectedInterests, user]);

    const handleInterestToggle = (categoryId) => {
        setSelectedInterests((prev) =>
            prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
        );
    };

    const handleCancelEdit = () => {
        setSelectedInterests((user?.interests || []).map((interest) => interest.id));
        setIsEditingInterests(false);
    };

    const handleSaveInterests = async () => {
        setSavingInterests(true);
        try {
            const response = await api.patch("auth/user-details/", {
                interest_ids: selectedInterests,
            });
            dispatch(setUser(response.data));
            setIsEditingInterests(false);
            showSuccess("Interests updated successfully!");
        } catch (error) {
            console.error("Failed to update interests:", error);
            showError("Failed to update interests.");
        } finally {
            setSavingInterests(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: "#F5F3ED" }}>
                <Navbar />
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: "#F5F3ED" }}>
                <Navbar />
                <div className="flex justify-center items-center h-64">
                    <p className="text-red-600">You must be logged in to view this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#F5F3ED" }}>
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white shadow rounded-lg p-8">
                    <div className="flex flex-col items-center text-center">
                        <h2 className="text-2xl font-bold text-gray-900">{user.first_name || "No name"}</h2>
                        <p className="text-gray-600">{user.email}</p>
                    </div>

                    <div className="mt-8 space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Date of Birth</h3>
                            <p className="text-gray-600">{user.dateOfBirth || "Not provided"}</p>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">Interests</h3>
                                    <p className="text-sm text-gray-500">Choose categories to personalize your explore feed.</p>
                                </div>
                                {isEditingInterests ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            disabled={savingInterests}
                                            className="flex items-center px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <X size={16} className="mr-2" />
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSaveInterests}
                                            disabled={savingInterests || !hasInterestChanges}
                                            className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {savingInterests ? (
                                                <Loader2 size={16} className="mr-2 animate-spin" />
                                            ) : (
                                                <Save size={16} className="mr-2" />
                                            )}
                                            Save
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingInterests(true)}
                                        className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                    >
                                        <Pencil size={16} className="mr-2" />
                                        Edit
                                    </button>
                                )}
                            </div>

                            {!isEditingInterests && (
                                <div className="mt-4">
                                    {user.interests && user.interests.length > 0 ? (
                                        <ul className="flex flex-wrap gap-2">
                                            {user.interests.map((interest) => (
                                                <li
                                                    key={interest.id}
                                                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
                                                >
                                                    {interest.name}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-600">No interests added</p>
                                    )}
                                </div>
                            )}

                            {isEditingInterests && (
                                <div className="mt-5">
                                    {categoriesLoading ? (
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Loader2 size={16} className="mr-2 animate-spin" />
                                            Loading interests...
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {categories.map((category) => {
                                                    const selected = selectedInterests.includes(category.id);
                                                    return (
                                                        <button
                                                            key={category.id}
                                                            type="button"
                                                            onClick={() => handleInterestToggle(category.id)}
                                                            className={`flex items-center justify-between text-left px-4 py-3 border rounded-lg transition-all ${
                                                                selected
                                                                    ? "border-black bg-gray-900 text-white"
                                                                    : "border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                                                            }`}
                                                        >
                                                            <span className="font-medium">{category.name}</span>
                                                            {selected && <Check size={18} />}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <div className="mt-4 min-h-8">
                                                {selectedInterestNames.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedInterestNames.map((name) => (
                                                            <span
                                                                key={name}
                                                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                                            >
                                                                {name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500">No interests selected.</p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
