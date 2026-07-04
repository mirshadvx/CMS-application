import React, { useEffect } from "react";
import { X, Heart, Clock, Calendar, MessageCircle, Trash2, Tag } from "lucide-react";

const BlogDetailModal = ({
    selectedPost,
    blogDetail,
    modalType,
    detailLoading,
    onClose,
    onFetchBlogDetail,
    onDeleteComment,
}) => {
    useEffect(() => {
        if (modalType === "view" && selectedPost && !blogDetail) {
            onFetchBlogDetail(selectedPost.id);
        }
    }, [modalType, selectedPost, blogDetail, onFetchBlogDetail]);

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

    const estimateReadingTime = (content) => {
        if (!content) return 0;
        const wordsPerMinute = 200;
        const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    };

    const getRelativeTime = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const getCategoryName = (categoryId) => {
        return `Category ${categoryId}`;
    };

    if (!selectedPost || modalType !== "view") return null;

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
                                        className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                                            blogDetail?.status || selectedPost.status,
                                            blogDetail?.show !== undefined ? blogDetail.show : selectedPost.show
                                        )}`}
                                    >
                                        {!(blogDetail?.show !== undefined ? blogDetail.show : selectedPost.show)
                                            ? "Hidden"
                                            : (blogDetail?.status || selectedPost.status)?.charAt(0).toUpperCase() +
                                              (blogDetail?.status || selectedPost.status)?.slice(1)}
                                    </span>
                                    {(blogDetail?.category || selectedPost.category) && (
                                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700">
                                            {typeof (blogDetail?.category || selectedPost.category) === "object"
                                                ? (blogDetail?.category || selectedPost.category).name
                                                : getCategoryName(blogDetail?.category || selectedPost.category)}
                                        </span>
                                    )}
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>{estimateReadingTime(blogDetail?.content)} min read</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-1 px-3 py-2 rounded-full bg-gray-100">
                                        <Heart className="w-5 h-5 text-red-500" />
                                        <span className="text-sm font-medium">
                                            {blogDetail?.like_count || selectedPost.likes_count || 0}
                                        </span>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-full hover:bg-gray-200 transition-colors ml-2"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                            {detailLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="text-gray-500 mt-2">Loading blog details...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="relative h-64 md:h-80 overflow-hidden">
                                        <img
                                            src={blogDetail?.thumbnail || selectedPost.thumbnail}
                                            alt={blogDetail?.title || selectedPost.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/800x320?text=No+Image";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    </div>
                                    <div className="px-6 py-8">
                                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                            {blogDetail?.title || selectedPost.title}
                                        </h1>
                                        <div className="flex flex-wrap items-center justify-between mb-8 pb-6 border-b border-gray-200">
                                            <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                                <div className="flex items-center space-x-2">
                                                    {blogDetail?.author?.profile_picture ? (
                                                        <img
                                                            src={blogDetail.author.profile_picture}
                                                            alt={blogDetail.author.first_name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                            onError={(e) => {
                                                                e.target.src = "https://via.placeholder.com/40x40?text=U";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                            {(
                                                                blogDetail?.author?.first_name ||
                                                                selectedPost.author?.first_name ||
                                                                "U"
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {blogDetail?.author?.first_name ||
                                                                selectedPost.author?.first_name}
                                                        </p>
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <Calendar className="w-4 h-4 mr-1" />
                                                            <span>
                                                                {formatDate(
                                                                    blogDetail?.created_at || selectedPost.created_at
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <MessageCircle className="w-4 h-4 mr-1 text-blue-500" />
                                                    <span>
                                                        {blogDetail?.comments?.length || selectedPost.comments_count || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {(blogDetail?.excerpt || selectedPost.excerpt) && (
                                            <div className="mb-8">
                                                <p className="text-lg text-gray-600 leading-relaxed italic border-l-4 border-blue-500 pl-4 py-2">
                                                    {blogDetail?.excerpt || selectedPost.excerpt}
                                                </p>
                                            </div>
                                        )}
                                        {blogDetail?.tags && blogDetail.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-8">
                                                {blogDetail.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                                                    >
                                                        <Tag className="w-3 h-3 mr-1" />
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {blogDetail?.content ? (
                                            <div
                                                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-img:rounded-lg prose-img:shadow-md mb-12"
                                                dangerouslySetInnerHTML={{ __html: blogDetail.content }}
                                            />
                                        ) : (
                                            <div className="text-gray-500 mb-12 p-6 bg-gray-50 rounded-lg">
                                                <p>Full blog content not available.</p>
                                            </div>
                                        )}
                                        <div className="pt-8 border-t border-gray-200">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-2xl font-semibold text-gray-900">
                                                    Comments ({blogDetail?.comments?.length || 0})
                                                </h3>
                                            </div>
                                            {blogDetail?.comments && blogDetail.comments.length > 0 ? (
                                                <div className="space-y-6 max-h-96 overflow-y-auto">
                                                    {blogDetail.comments.map((comment) => (
                                                        <div key={comment.id} className="flex space-x-3">
                                                            {comment.user.profile_picture ? (
                                                                <img
                                                                    src={comment.user.profile_picture}
                                                                    alt={comment.user.first_name}
                                                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                                                    onError={(e) => {
                                                                        e.target.src =
                                                                            "https://via.placeholder.com/40x40?text=U";
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                                    {comment.user.first_name?.charAt(0).toUpperCase() ||
                                                                        "U"}
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="bg-gray-50 rounded-lg p-4">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div className="flex items-center space-x-2">
                                                                            <span className="font-medium text-gray-900">
                                                                                {comment.user.first_name}
                                                                            </span>
                                                                            <span className="text-sm text-gray-500">
                                                                                {getRelativeTime(comment.created_at)}
                                                                            </span>
                                                                        </div>
                                                                        <button
                                                                            onClick={() =>
                                                                                onDeleteComment(comment.id, blogDetail.id)
                                                                            }
                                                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                                            title="Delete Comment"
                                                                        >
                                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                                        </button>
                                                                    </div>
                                                                    <p className="text-gray-700">{comment.content}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
                                                    <p>No comments yet for this post.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetailModal;
