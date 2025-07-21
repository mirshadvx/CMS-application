import React, { useState } from "react";
import { Heart, MessageCircle, Calendar, User, Tag } from "lucide-react";
import BlogDetailModal from "./BlogDetailModal";

const BlogCard = ({ blog }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleCardClick = () => {
        setIsModalOpen(true);
    };

    const handleReadMoreClick = (e) => {
        e.stopPropagation();
        setIsModalOpen(true);
    };

    return (
        <>
            <article
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group border border-gray-100 transform hover:-translate-y-1 cursor-pointer"
                onClick={handleCardClick}
            >
                <div className="relative overflow-hidden">
                    <img
                        src={blog.thumbnail}
                        alt={blog.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                        <span
                            className="px-3 py-1 text-xs font-medium rounded-full text-white"
                            style={{ backgroundColor: "#8B7355" }}
                        >
                            {blog.category.name}
                        </span>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                        <User className="w-4 h-4 mr-2" />
                        <span className="mr-4">{blog.author.username}</span>
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(blog.created_at)}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#8B7355] transition-colors">
                        {blog.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{blog.excerpt}</p>
                    {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {blog.tags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 text-xs rounded-md text-gray-700"
                                    style={{ backgroundColor: "#C4C9A3" }}
                                >
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                                <Heart className="w-4 h-4 mr-1 text-red-500" />
                                <span>{blog.likes_count}</span>
                            </div>
                            <div className="flex items-center">
                                <MessageCircle className="w-4 h-4 mr-1 text-blue-500" />
                                <span>{blog.comments_count}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleReadMoreClick}
                            className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                            style={{
                                color: "#8B7355",
                                backgroundColor: "rgba(139, 115, 85, 0.1)",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#8B7355";
                                e.target.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "rgba(139, 115, 85, 0.1)";
                                e.target.style.color = "#8B7355";
                            }}
                        >
                            Read More
                        </button>
                    </div>
                </div>
            </article>
            <BlogDetailModal blogId={blog.id} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default BlogCard;
