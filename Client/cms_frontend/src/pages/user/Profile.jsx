import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../Components/user/Navbar/Navbar";
import { fetchUserDetails } from "../../services/userAction";

const Profile = () => {
    const dispatch = useDispatch();
    const { user, isAuthenticated, loading } = useSelector((state) => state.user);

    useEffect(() => {
        if (!user) {
            dispatch(fetchUserDetails());
        }
    }, [dispatch, user]);

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
                    <div className="flex flex-col items-center">
                        <h2 className="text-2xl font-bold text-gray-900">{user.first_name || "No name"}</h2>
                        <p className="text-gray-600">{user.email}</p>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Date of Birth</h3>
                            <p className="text-gray-600">{user.dateOfBirth || "Not provided"}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Interests</h3>
                            {user.interests && user.interests.length > 0 ? (
                                <ul className="flex flex-wrap gap-2 mt-2">
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
