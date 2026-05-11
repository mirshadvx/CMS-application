import React, { useState, useEffect } from "react";
import { X, Heart, MessageCircle, Calendar, Tag, Share2, Clock, Send, Edit2, Trash2 } from "lucide-react";
import api from "../../../services/api";
import { useToast } from "../../../hooks/useToast";

const BlogDetailModal = ({ blogId, isOpen, onClose }) => {
    const [blog, setBlog] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [editingComment, setEditingComment] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [commentToDelete, setCommentToDelete] = useState(null);
    const [isDeletingComment, setIsDeletingComment] = useState(false);
 
    const { showSuccess, showError, showInfo } = useToast();

    useEffect(() => {
        if (isOpen && blogId) {
            const fetchBlogDetails = async () => {
                try {
                    const response = await api.get(`explore/blogs/${blogId}/`);
                    setBlog(response.data);
                    setLikesCount(response.data.likes_count);
                    setIsLiked(response.data.is_liked || false);
                } catch (error) {
                    console.error("Error fetching blog details:", error);
                    showError("Failed to fetch blog details.");
                }
            };
            fetchBlogDetails();
        }
    }, [isOpen, blogId]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            const fetchComments = async () => {
                try {
                    const response = await api.get(`explore/blogs/${blogId}/comments/`);
                    setComments(response.data);
                } catch (error) {
                    console.error("Error fetching comments:", error);
                    showError("Failed to fetch comments.");
                }
            };
            fetchComments();
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen, blogId]);

    const getDisplayName = (user) => {
        return user?.display_name || [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "User";
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getRelativeTime = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const estimateReadingTime = (content) => {
        const wordsPerMinute = 200;
        const words = content?.split(" ").length || 0;
        return Math.ceil(words / wordsPerMinute);
    };

    const handleLike = async () => {
        try {
            const response = await api.post(`explore/blogs/${blogId}/like/`);
            if (response.data.action === "liked") {
                setIsLiked(true);
                setLikesCount(response.data.likes_count);
                showSuccess("Liked the blog post!");
            } else {
                setIsLiked(false);
                setLikesCount(response.data.likes_count);
                showInfo("Unliked the blog post.");
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            showError("Failed to toggle like.");
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: blog.title,
                text: blog.excerpt,
                url: window.location.href,
            });
            showSuccess("Shared successfully!");
        } else {
            navigator.clipboard.writeText(window.location.href);
            showInfo("Link copied to clipboard!");
        }
    };

    const handleAddComment = async () => {
        if (newComment.trim()) {
            try {
                const response = await api.post(`explore/blogs/${blogId}/comments/`, {
                    content: newComment,
                });
                setComments([response.data, ...comments]);
                setBlog((prev) =>
                    prev ? { ...prev, comments_count: (prev.comments_count || comments.length) + 1 } : prev
                );
                setNewComment("");
                showSuccess("Comment added successfully!");
            } catch (error) {
                console.error("Error adding comment:", error);
                showError("Failed to add comment.");
            }
        }
    };

    const openDeleteCommentModal = (comment) => {
        setCommentToDelete(comment);
    };

    const closeDeleteCommentModal = () => {
        if (!isDeletingComment) {
            setCommentToDelete(null);
        }
    };

    const handleDeleteComment = async () => {
        if (!commentToDelete) return;

        setIsDeletingComment(true);
        try {
            await api.delete(`explore/blogs/comments/${commentToDelete.id}/`);
            setComments(comments.filter((comment) => comment.id !== commentToDelete.id));
            setBlog((prev) =>
                prev ? { ...prev, comments_count: Math.max(0, (prev.comments_count || comments.length) - 1) } : prev
            );
            setCommentToDelete(null);
            showSuccess("Comment deleted successfully!");
        } catch (error) {
            console.error("Error deleting comment:", error);
            showError("Failed to delete comment.");
        } finally {
            setIsDeletingComment(false);
        }
    };

    const handleEditComment = (comment) => {
        setEditingComment(comment.id);
        setEditingText(comment.content);
    };

    const handleSaveEdit = async (commentId) => {
        try {
            const response = await api.put(`explore/blogs/comments/${commentId}/`, {
                content: editingText,
            });
            setComments(
                comments.map((comment) => (comment.id === commentId ? response.data : comment))
            );
            setEditingComment(null);
            setEditingText("");
            showSuccess("Comment updated successfully!");
        } catch (error) {
            console.error("Error updating comment:", error);
            showError("Failed to update comment.");
        }
    };

    const handleCancelEdit = () => {
        setEditingComment(null);
        setEditingText("");
    };

    if (!isOpen || !blog) return null;

    const blogContent = blog.content;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <div className="relative w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
                        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <span
                                        className="px-3 py-1 text-sm font-medium rounded-full text-white"
                                        style={{ backgroundColor: "#8B7355" }}
                                    >
                                        {blog.category.name}
                                    </span>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>{estimateReadingTime(blogContent)} min read</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handleLike}
                                        className={`flex items-center space-x-1 px-3 py-2 rounded-full transition-colors ${
                                            isLiked ? "bg-red-50 text-red-600" : "hover:bg-gray-100"
                                        }`}
                                    >
                                        <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                                        <span className="text-sm font-medium">{likesCount}</span>
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-full hover:bg-gray-100 transition-colors ml-2"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                            <div className="relative h-64 md:h-80 overflow-hidden">
                                <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            </div>
                            <div className="px-6 py-8">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                    {blog.title}
                                </h1>
                                <div className="flex flex-wrap items-center justify-between mb-8 pb-6 border-b border-gray-200">
                                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                {getDisplayName(blog.author)?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{getDisplayName(blog.author)}</p>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    <span>{formatDate(blog.created_at)}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{formatTime(blog.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <MessageCircle className="w-4 h-4 mr-1 text-blue-500" />
                                            <span>{blog.comments_count}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-8">
                                    <p
                                        className="text-lg text-gray-600 leading-relaxed italic border-l-4 pl-4 py-2"
                                        style={{ borderColor: "#C4C9A3" }}
                                    >
                                        {blog.excerpt}
                                    </p>
                                </div>
                                {blog.tags && blog.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {blog.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 text-sm rounded-full text-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                                                style={{ backgroundColor: "#C4C9A3" }}
                                            >
                                                <Tag className="w-3 h-3 mr-1" />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div
                                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700"
                                    dangerouslySetInnerHTML={{ __html: blogContent }}
                                />
                                <div className="mt-12 pt-8 border-t border-gray-200">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-semibold text-gray-900">
                                            Comments ({comments.length})
                                        </h3>
                                    </div>
                                    <div className="mb-8">
                                        <div className="flex space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                                                U
                                            </div>
                                            <div className="flex-1">
                                                <textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Write a comment..."
                                                    className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-opacity-20 focus:border-transparent outline-none"
                                                    style={{ "--tw-ring-color": "rgba(139, 115, 85, 0.2)" }}
                                                    rows="3"
                                                />
                                                <div className="flex justify-end mt-3">
                                                    <button
                                                        onClick={handleAddComment}
                                                        disabled={!newComment.trim()}
                                                        className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                        style={{
                                                            backgroundColor: newComment.trim() ? "#8B7355" : "#d1d5db",
                                                            color: "white",
                                                        }}
                                                    >
                                                        <Send className="w-4 h-4" />
                                                        <span>Comment</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        {comments.map((comment) => (
                                            <div key={comment.id} className="flex space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                    {getDisplayName(comment.user)?.charAt(0).toUpperCase() || "U"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-medium text-gray-900">
                                                                    {getDisplayName(comment.user)}
                                                                </span>
                                                                <span className="text-sm text-gray-500">
                                                                    {getRelativeTime(comment.created_at)}
                                                                </span>
                                                            </div>
                                                            {(comment.can_edit || comment.can_delete) && (
                                                                <div className="flex items-center space-x-1">
                                                                    {comment.can_edit && (
                                                                        <button
                                                                            onClick={() => handleEditComment(comment)}
                                                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                                            title="Edit comment"
                                                                        >
                                                                            <Edit2 className="w-4 h-4 text-gray-500" />
                                                                        </button>
                                                                    )}
                                                                    {comment.can_delete && (
                                                                        <button
                                                                            onClick={() => openDeleteCommentModal(comment)}
                                                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                                            title="Delete comment"
                                                                        >
                                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {editingComment === comment.id ? (
                                                            <div className="space-y-3">
                                                                <textarea
                                                                    value={editingText}
                                                                    onChange={(e) => setEditingText(e.target.value)}
                                                                    className="w-full p-2 border border-gray-200 rounded resize-none focus:ring-2 focus:ring-opacity-20 focus:border-transparent outline-none"
                                                                    style={{ "--tw-ring-color": "rgba(139, 115, 85, 0.2)" }}
                                                                    rows="3"
                                                                />
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => handleSaveEdit(comment.id)}
                                                                        className="px-3 py-1 text-sm rounded text-white"
                                                                        style={{ backgroundColor: "#8B7355" }}
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        onClick={handleCancelEdit}
                                                                        className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-700">{comment.content}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {commentToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/40" onClick={closeDeleteCommentModal} />
                    <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                            <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="mb-2 text-center text-lg font-semibold text-gray-900">Delete comment?</h3>
                        <p className="mb-6 text-center text-sm text-gray-600">
                            This comment will be permanently removed. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={closeDeleteCommentModal}
                                disabled={isDeletingComment}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteComment}
                                disabled={isDeletingComment}
                                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isDeletingComment ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogDetailModal;
