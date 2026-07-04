import React, { useState, useEffect, useCallback } from "react";
import { X, Eye, Search, Filter, MessageCircle, Trash2, Calendar, Heart, AlertTriangle, User } from "lucide-react";
import api from "../../services/api";
import BlogDetailModal from "./BlogDetailModal";
import Modal from "./Modal";

const Posts = () => {
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [blogDetail, setBlogDetail] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchPosts = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page };
            if (searchTerm.trim()) {
                params.search = searchTerm.trim();
            }
            if (filterStatus !== "All") {
                if (filterStatus === "deleted") {
                    params.show = false;
                } else {
                    params.status = filterStatus;
                    params.show = true;
                }
            }
            const res = await api.get("admin/posts/", { params });
            setPosts(res.data.results || []);
            setPagination({
                page,
                totalPages: Math.ceil((res.data.count || 0) / 10),
                total: res.data.count || 0,
            });
        } catch (error) {
            console.error("Error fetching posts:", error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchBlogDetail = useCallback(async (postId) => {
        if (!postId) return null;
        setDetailLoading(true);
        try {
            const res = await api.get(`admin/blog/${postId}/`);
            setBlogDetail(res.data);
            return res.data;
        } catch (error) {
            console.error("Error fetching blog detail:", error);
            setBlogDetail(null);
            return null;
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const handleDeleteComment = async (commentId, blogId) => {
        try {
            await api.delete(`admin/blog/${blogId}/`, {
                params: { comment_id: commentId },
            });
            await fetchBlogDetail(blogId);
            setPosts(
                posts.map((post) =>
                    post.id === blogId ? { ...post, comments_count: Math.max(0, (post.comments_count || 0) - 1) } : post
                )
            );
            if (selectedPost && selectedPost.id === blogId) {
                setSelectedPost({
                    ...selectedPost,
                    comments_count: Math.max(0, (selectedPost.comments_count || 0) - 1),
                });
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
            // alert("Failed to delete comment. Please try again.");
        }
    };

    const handleSoftDeletePost = async (postId) => {
        try {
            await api.patch(`admin/posts/${postId}/delete/`);
            await fetchPosts(pagination.page);
            setModalType(null);
            setSelectedPost(null);
        } catch (error) {
            console.error("Error soft deleting post:", error);
        }
    };

    const handleRestorePost = async (postId) => {
        try {
            await api.patch(`admin/posts/${postId}/restore/`);
            await fetchPosts(pagination.page);
        } catch (error) {
            console.error("Error restoring post:", error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not published";
        return new Date(dateString).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusColor = (status, show = true) => {
        if (!show) {
            return "bg-red-100 text-red-700 border-red-200";
        }
        switch (status) {
            case "published":
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "draft":
                return "bg-amber-100 text-amber-700 border-amber-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const handleCloseModal = () => {
        setModalType(null);
        setSelectedPost(null);
        setBlogDetail(null);
    };

    useEffect(() => {
        fetchPosts(1);
    }, [searchTerm, filterStatus]);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Posts Management</h2>
                    <p className="text-gray-600">Manage and moderate blog posts and comments</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search posts by title or author..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[140px]"
                        >
                            <option value="All">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="deleted">Hidden</option>
                        </select>
                    </div>
                </div>
                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading posts...</p>
                    </div>
                )}
                {!loading && (
                    <div className="grid gap-4">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className={`border rounded-lg p-5 hover:shadow-md transition-all duration-200 hover:border-gray-300 ${
                                    !post.show ? "border-red-200 bg-red-50" : "border-gray-200"
                                }`}
                            >
                                <div className="flex gap-4">
                                    <img
                                        src={post.thumbnail}
                                        alt={post.title}
                                        className={`w-20 h-20 object-cover rounded-lg flex-shrink-0 ${
                                            !post.show ? "opacity-50 grayscale" : ""
                                        }`}
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/80x80?text=No+Image";
                                        }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3
                                                        className={`text-lg font-semibold truncate ${
                                                            !post.show ? "text-gray-500 line-through" : "text-gray-900"
                                                        }`}
                                                    >
                                                        {post.title}
                                                    </h3>
                                                    <span
                                                        className={`px-2 py-1 text-xs font-medium rounded-full border flex-shrink-0 ${getStatusColor(
                                                            post.status,
                                                            post.show
                                                        )}`}
                                                    >
                                                        {!post.show
                                                            ? "Hidden"
                                                            : post.status?.charAt(0).toUpperCase() + post.status?.slice(1)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
                                            <div className="flex items-center gap-2">
                                                {post.author.profile_picture ? (
                                                    <img
                                                        src={post.author.profile_picture}
                                                        alt={post.author.first_name}
                                                        className="w-5 h-5 rounded-full"
                                                        onError={(e) => {
                                                            e.target.src = "https://via.placeholder.com/20x20?text=U";
                                                        }}
                                                    />
                                                ) : (
                                                    <User size={12} className="text-gray-400" />
                                                )}
                                                <span>by {post.author.first_name}</span>
                                            </div>
                                            {post.category && <span>Category: {post.category.name}</span>}
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {formatDate(post.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Heart size={12} />
                                                    {post.likes_count || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageCircle size={12} />
                                                    {post.comments_count || 0}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPost(post);
                                                        setModalType("view");
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                                                >
                                                    <Eye size={16} />
                                                    View Details
                                                </button>
                                                {!post.show ? (
                                                    <button
                                                        onClick={() => handleRestorePost(post.id)}
                                                        className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm font-medium"
                                                        title="Restore Post"
                                                    >
                                                        <AlertTriangle size={16} />
                                                        Restore
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPost(post);
                                                            setModalType("delete");
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                                                        title="Hide Post"
                                                    >
                                                        <Trash2 size={16} />
                                                        Hide
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {!loading && posts.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Search size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                    </div>
                )}
                {!loading && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                        <button
                            onClick={() => fetchPosts(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, Math.min(pagination.page - 2, pagination.totalPages - 4)) + i;
                            if (pageNum > pagination.totalPages) return null;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => fetchPosts(pageNum)}
                                    className={`px-3 py-2 border rounded-lg text-sm transition-colors ${
                                        pagination.page === pageNum
                                            ? "bg-blue-500 text-white border-blue-500"
                                            : "border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => fetchPosts(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                )}
                {!loading && posts.length > 0 && (
                    <div className="text-center text-sm text-gray-500 mt-4">
                        Showing {Math.min(10 * (pagination.page - 1) + 1, pagination.total)} to{" "}
                        {Math.min(10 * pagination.page, pagination.total)} of {pagination.total} posts
                    </div>
                )}
            </div>

            {/* Blog Detail Modal */}
            <BlogDetailModal
                selectedPost={selectedPost}
                blogDetail={blogDetail}
                modalType={modalType}
                detailLoading={detailLoading}
                onClose={handleCloseModal}
                onFetchBlogDetail={fetchBlogDetail}
                onDeleteComment={handleDeleteComment}
            />

            {/* Delete Confirmation Modal */}
            {modalType === "delete" && selectedPost && (
                <Modal
                    isOpen={true}
                    onClose={() => {
                        setModalType(null);
                        setSelectedPost(null);
                    }}
                    title="Confirm Hide Post"
                >
                    <div className="text-center">
                        <div className="text-red-600 mb-4">
                            <Trash2 size={48} className="mx-auto" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Hide Post?</h4>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to hide the post{" "}
                            <span className="font-medium">"{selectedPost.title}"</span>? This will make the post invisible
                            to users but retain it in the system for potential recovery.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleSoftDeletePost(selectedPost.id)}
                                className="flex-1 bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Hide Post
                            </button>
                            <button
                                onClick={() => {
                                    setModalType(null);
                                    setSelectedPost(null);
                                }}
                                className="flex-1 bg-gray-300 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Posts;
