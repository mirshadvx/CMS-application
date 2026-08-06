import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Plus,
    FileText,
    Search,
    Filter,
    BookOpen,
    Globe,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Navbar from "../../Components/user/Navbar/Navbar";
import BlogCard from "../../Components/user/Dashboard/BlogCard";
import CreateBlogModal from "../../Components/user/Dashboard/CreateBlogModal";
import EditBlogModal from "../../Components/user/Dashboard/EditBlogModal";
import api from "../../services/api";
import contentApi from "../../services/content/content";
import { BounceLoader } from "react-spinners";

const PAGE_SIZE = 4;

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("published");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [pages, setPages] = useState({ published: 1, drafts: 1 });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);
    const [blogToEdit, setBlogToEdit] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [statusCounts, setStatusCounts] = useState({ published: 0, draft: 0 });
    const [totalBlogs, setTotalBlogs] = useState(0);
    const [loading, setLoading] = useState(false);

    const currentPage = pages[activeTab];
    const statusParam = activeTab === "published" ? "published" : "draft";
    const totalPages = Math.max(1, Math.ceil(totalBlogs / PAGE_SIZE));
    const isFiltered = Boolean(searchTerm || selectedCategory || sortBy !== "latest");

    const activeTitle = activeTab === "published" ? "Published Posts" : "Draft Posts";
    const activeEmptyTitle = activeTab === "published" ? "No published posts found" : "No drafts found";
    const activeEmptyText = isFiltered
        ? "Try adjusting your search or filter criteria."
        : activeTab === "published"
          ? "Share your thoughts with the world!"
          : "Save your work in progress as drafts!";

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await contentApi.getCategories();
                setCategories(response.data.filter((category) => category.active));
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };

        fetchCategories();
    }, []);

    const fetchUserBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get("user/blogs/user/", {
                params: {
                    status: statusParam,
                    search: searchTerm || undefined,
                    category: selectedCategory || undefined,
                    sort_by: sortBy,
                    page: currentPage,
                    page_size: PAGE_SIZE,
                },
            });

            const data = response.data;
            setBlogs(Array.isArray(data.results) ? data.results : data);
            setTotalBlogs(typeof data.count === "number" ? data.count : data.length);
            if (data.status_counts) {
                setStatusCounts(data.status_counts);
            }
        } catch (error) {
            console.error("Failed to fetch blogs:", error);
            setBlogs([]);
            setTotalBlogs(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, selectedCategory, sortBy, statusParam]);

    useEffect(() => {
        fetchUserBlogs();
    }, [fetchUserBlogs]);

    const resetPages = () => {
        setPages({ published: 1, drafts: 1 });
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        resetPages();
    };

    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        resetPages();
    };

    const handleSortChange = (value) => {
        setSortBy(value);
        resetPages();
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setSortBy("latest");
        resetPages();
    };

    const handlePageChange = (nextPage) => {
        setPages((prev) => ({
            ...prev,
            [activeTab]: Math.min(Math.max(nextPage, 1), totalPages),
        }));
    };

    const fetchBlogDetails = async (id) => {
        try {
            const response = await api.get(`user/blogs/${id}/`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch blog details:", error);
            return null;
        }
    };

    const refreshAfterListChange = () => {
        if (blogs.length === 1 && currentPage > 1) {
            handlePageChange(currentPage - 1);
        } else {
            fetchUserBlogs();
        }
    };

    const handleDeleteBlog = async (id) => {
        try {
            await api.delete(`user/blogs/${id}/`);
            setShowDeleteModal(false);
            setBlogToDelete(null);
            refreshAfterListChange();
        } catch (error) {
            console.error("Failed to delete blog:", error);
        }
    };

    const handlePublishDraft = async (id) => {
        try {
            await api.put(`user/blogs/${id}/`, { status: "published" });
            refreshAfterListChange();
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
            await api.put(`user/blogs/${id}/`, blogData);
            setShowEditModal(false);
            setBlogToEdit(null);
            refreshAfterListChange();
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
        resetPages();
        fetchUserBlogs();
        setShowCreateModal(false);
    };

    const pageNumbers = useMemo(() => {
        const start = Math.max(1, currentPage - 1);
        const end = Math.min(totalPages, start + 2);
        return Array.from({ length: end - start + 1 }, (_, index) => start + index);
    }, [currentPage, totalPages]);

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

    const Pagination = () =>
        totalBlogs > PAGE_SIZE && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-white border border-gray-200 rounded-xl px-4 py-3">
                <p className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Previous page"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    {pageNumbers.map((pageNumber) => (
                        <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            disabled={loading}
                            className={`min-w-10 h-10 rounded-lg border text-sm font-medium transition-all ${
                                currentPage === pageNumber
                                    ? "border-[#8A614F] bg-[#8A614F] text-white"
                                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {pageNumber}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Next page"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-[#f0f0e8]">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between flex-wrap bg-white rounded-2xl p-2 shadow-sm border border-gray-100 gap-2">
                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: "published", label: `Published (${statusCounts.published || 0})`, icon: Globe },
                                { key: "drafts", label: `Drafts (${statusCounts.draft || 0})`, icon: FileText },
                            ].map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={`flex items-center px-4 py-3 rounded-xl transition-all font-medium ${
                                        activeTab === key
                                            ? "bg-gradient-to-r from-[#8A614F] to-[#5F4B3D] text-white shadow-md"
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
                            className="flex items-center px-6 py-3 bg-gradient-to-r from-[#8A614F] to-[#5F4B3D] text-white rounded-xl hover:from-[#7A5143] hover:to-[#4F3B2D] transition-all font-medium shadow-lg"
                        >
                            <Plus size={20} className="mr-2" />
                            Create New Post
                        </button>
                    </div>
                </div>

                <div>
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{activeTitle}</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Showing {blogs.length} of {totalBlogs} {activeTab === "published" ? "posts" : "drafts"}
                                </p>
                            </div>
                            <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200">
                                {totalBlogs} total
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 bg-white border border-gray-100 rounded-2xl p-4">
                            <div className="relative">
                                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search posts..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A614F] focus:border-transparent outline-none"
                                />
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A614F] focus:border-transparent outline-none bg-white"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A614F] focus:border-transparent outline-none bg-white"
                            >
                                <option value="latest">Latest</option>
                                <option value="oldest">Oldest</option>
                                <option value="updated">Recently Updated</option>
                                <option value="popular">Most Liked</option>
                                <option value="most-commented">Most Commented</option>
                            </select>
                            <button
                                onClick={handleClearFilters}
                                disabled={!isFiltered}
                                className="flex items-center justify-center px-4 py-3 bg-[#f7f4ef] border border-gray-200 rounded-xl hover:bg-[#efe8df] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Filter size={16} className="mr-2" />
                                Clear
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <BounceLoader color="#8A614F" size={60} />
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen size={32} className="text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-lg font-medium mb-2">{activeEmptyTitle}</p>
                            <p className="text-gray-400 mb-6">{activeEmptyText}</p>
                            {!isFiltered && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-gradient-to-r from-[#8A614F] to-[#5F4B3D] text-white px-6 py-3 rounded-xl hover:from-[#7A5143] hover:to-[#4F3B2D] transition-all font-medium"
                                >
                                    {activeTab === "published" ? "Create Your First Post" : "Start Writing"}
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {blogs.map((blog) => (
                                    <BlogCard
                                        key={blog.id}
                                        blog={blog}
                                        isDraft={activeTab === "drafts"}
                                        onPublishDraft={handlePublishDraft}
                                        onEdit={() => handleEditBlog(blog)}
                                        onDelete={() => {
                                            setBlogToDelete(blog);
                                            setShowDeleteModal(true);
                                        }}
                                    />
                                ))}
                            </div>
                            <Pagination />
                        </>
                    )}
                </div>
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
