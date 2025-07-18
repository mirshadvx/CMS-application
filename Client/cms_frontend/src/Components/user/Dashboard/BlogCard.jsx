import React from "react";
import { Edit3, Eye, MoreVertical, Calendar, Clock, Heart, MessageCircle } from "lucide-react";

const BlogCard = ({ blog, isDraft = false, onPublishDraft }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="flex">
                <div className="w-56 h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 relative overflow-hidden">
                    <img
                        src={blog.thumbnail}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                    {blog.category}
                                </span>
                                <div className="flex items-center space-x-1">
                                    {blog.tags?.slice(0, 2).map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                {blog.title}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{blog.excerpt || blog.content}</p>
                        </div>
                        <div className="flex items-center space-x-1 ml-4">
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center">
                                <Calendar size={12} className="mr-1" />
                                {new Date(blog.date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {!isDraft && (
                                <div className="flex items-center space-x-3 text-xs text-gray-500">
                                    <div className="flex items-center">
                                        <Heart size={12} className="mr-1" />
                                        {blog.likes}
                                    </div>
                                    <div className="flex items-center">
                                        <MessageCircle size={12} className="mr-1" />
                                        {blog.comments}
                                    </div>
                                </div>
                            )}
                            {isDraft && (
                                <button
                                    onClick={() => onPublishDraft(blog.id)}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-105 text-sm font-medium"
                                >
                                    Publish
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
