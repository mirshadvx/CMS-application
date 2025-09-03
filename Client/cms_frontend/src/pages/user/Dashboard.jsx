import React, { useState, useEffect } from "react";
import { Plus, Trash2, FileText, Search, Filter, BookOpen, ChevronDown, Globe } from "lucide-react";
import Navbar from "../../Components/user/Navbar/Navbar";
import BlogCard from "../../Components/user/Dashboard/BlogCard";
import CreateBlogModal from "../../Components/user/Dashboard/CreateBlogModal";
import EditBlogModal from "../../Components/user/Dashboard/EditBlogModal";
import api from "../../services/api";

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("published");
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);
    const [blogToEdit, setBlogToEdit] = useState(null);
    const [blogs, setBlogs] = useState([]);

    const fetchUserBlogs = async () => {
        try {
            const response = await api.get("user/blogs/user/", {
                params: { status: activeTab === "published" ? "published" : "draft" },
            });
            setBlogs(response.data);
        } catch (error) {
            console.error("Failed to fetch blogs:", error);
        }
    };

    useEffect(() => {
        fetchUserBlogs();
    }, [activeTab]);

    const fetchBlogDetails = async (id) => {
        try {
            const response = await api.get(`user/blogs/${id}/`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch blog details:", error);
            return null;
        }
    };

    const handleDeleteBlog = async (id) => {
        try {
            await api.delete(`user/blogs/${id}/`);
            setBlogs(blogs.filter((blog) => blog.id !== id));
            setShowDeleteModal(false);
            setBlogToDelete(null);
        } catch (error) {
            console.error("Failed to delete blog:", error);
        }
    };

    const handlePublishDraft = async (id) => {
        try {
            const response = await api.put(`user/blogs/${id}/`, { status: "published" });
            setBlogs(blogs.map((blog) => (blog.id === id ? response.data : blog)));
        } catch (error) {
            console.error("Failed to publish draft:", error);
        }
    };

    const handleUpdateBlog = async (id, updatedBlog) => {
        try {
            const blogData = {
                ...updatedBlog,
                category: updatedBlog.category ? parseInt(updatedBlog.category) : null,
                status: updatedBlog.status || "draft",
                wordCount: updatedBlog.content
                    .replace(/<[^>]*>/g, "")
                    .split(" ")
                    .filter((word) => word.length > 0).length,
                readTime: Math.ceil(updatedBlog.content.replace(/<[^>]*>/g, "").split(" ").length / 200),
            };
            const response = await api.put(`user/blogs/${id}/`, blogData);
            setBlogs(blogs.map((blog) => (blog.id === id ? response.data : blog)));
            setShowEditModal(false);
            setBlogToEdit(null);
        } catch (error) {
            console.error("Failed to update blog:", error);
            throw error;
        }
    };

    const handleEditBlog = async (blog) => {
        const blogDetails = await fetchBlogDetails(blog.id);
        if (blogDetails) {
            setBlogToEdit(blogDetails);
            setShowEditModal(true);
        }
    };

    const handleBlogCreated = () => {
        fetchUserBlogs();
        setShowCreateModal(false);
    };

    const publishedBlogs = blogs.filter((blog) => blog.status === "published");
    const draftBlogs = blogs.filter((blog) => blog.status === "draft");

    const DeleteModal = () =>
        showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-in fade-in-0 zoom-in-95">
                    <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">Delete Blog Post</h3>
                    <p className="text-gray-600 text-center mb-6">
                        Are you sure you want to delete "{blogToDelete?.title}"? This action cannot be undone.
                    </p>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleDeleteBlog(blogToDelete.id)}
                            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-[#f0f0e8]">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between flex-wrap bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: "published", label: `Published (${publishedBlogs.length})`, icon: Globe },
                                { key: "drafts", label: `Drafts (${draftBlogs.length})`, icon: FileText },
                            ].map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={`flex items-center px-4 py-3 rounded-xl transition-all font-medium ${
                                        activeTab === key
                                            ? "bg-gradient-to-r from-[#8A614F] to-[#5F4B3D] text-white shadow-md transform scale-105"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                                >
                                    <Icon size={18} className="mr-2" />
                                    {label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center px-6 py-3 bg-gradient-to-r from-[#8A614F] to-[#5F4B3D] text-white rounded-xl hover:from-[#7A5143] hover:to-[#4F3B2D] transition-all transform hover:scale-105 font-medium shadow-lg mt-2 sm:mt-0"
                        >
                            <Plus size={20} className="mr-2" />
                            Create New Post
                        </button>
                    </div>
                </div>
                {activeTab === "published" && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Published Posts</h2>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Search size={20} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search posts..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A614F] focus:border-transparent w-64"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                                        <Filter size={16} className="mr-2" />
                                        Filter
                                        <ChevronDown size={16} className="ml-1" />
                                    </button>
                                    <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200">
                                        {publishedBlogs.length} posts
                                    </div>
                                </div>
                            </div>
                        </div>
                        {publishedBlogs.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpen size={32} className="text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-lg font-medium mb-2">No published posts yet</p>
                                <p className="text-gray-400 mb-6">Share your thoughts with the world!</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-gradient-to-r from-[#8A614F] to-[#5F4B3D] text-white px-6 py-3 rounded-xl hover:from-[#7A5143] hover:to-[#4F3B2D] transition-all font-medium"
                                >
                                    Create Your First Post
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {publishedBlogs
                                    .filter((blog) => blog.title.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((blog) => (
                                        <BlogCard
                                            key={blog.id}
                                            blog={blog}
                                            onDelete={() => {
                                                setBlogToDelete(blog);
                                                setShowDeleteModal(true);
                                            }}
                                        />
                                    ))}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === "drafts" && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Draft Posts</h2>
                                <p className="text-gray-600">Continue working on your unpublished content</p>
                            </div>
                            <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200">
                                {draftBlogs.length} drafts
                            </div>
                        </div>
                        {draftBlogs.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText size={32} className="text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-lg font-medium mb-2">No drafts saved yet</p>
                                <p className="text-gray-400 mb-6">Save your work in progress as drafts!</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all font-medium"
                                >
                                    Start Writing
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {draftBlogs
                                    .filter((blog) => blog.title.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((blog) => (
                                        <BlogCard
                                            key={blog.id}
                                            blog={blog}
                                            isDraft={true}
                                            onPublishDraft={handlePublishDraft}
                                            onDelete={() => {
                                                setBlogToDelete(blog);
                                                setShowDeleteModal(true);
                                            }}
                                            onEdit={() => handleEditBlog(blog)}
                                        />
                                    ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <CreateBlogModal
                showCreateModal={showCreateModal}
                setShowCreateModal={setShowCreateModal}
                onBlogCreated={handleBlogCreated}
            />
            <EditBlogModal
                showEditModal={showEditModal}
                setShowEditModal={setShowEditModal}
                blogToEdit={blogToEdit}
                setBlogToEdit={setBlogToEdit}
                handleUpdateBlog={handleUpdateBlog}
            />
            <DeleteModal />
        </div>
    );
};

export default Dashboard;
