import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Navbar from "../../Components/user/Navbar/Navbar";
import BlogCard from "../../Components/user/Explore/BlogCard";
import api from "../../services/api";
import contentApi from "../../services/content/content";
import { BounceLoader } from "react-spinners";

const Explore = () => {
    const [blogs, setBlogs] = useState([]);
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [totalBlogs, setTotalBlogs] = useState(0);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await contentApi.getCategories();
                setCategories(response.data.filter((category) => category.active));
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    const fetchBlogs = async (pageNum = 1) => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                category: selectedCategory,
                sort_by: sortBy,
                page: pageNum,
            };
            const response = await api.get("explore/blogs/", { params });
            const { results, count, next } = response.data;
            setBlogs((prevBlogs) => (pageNum === 1 ? results : [...prevBlogs, ...results]));
            setFilteredBlogs((prevBlogs) => (pageNum === 1 ? results : [...prevBlogs, ...results]));
            setTotalBlogs(count);
            setHasNextPage(!!next);
        } catch (error) {
            console.error("Error fetching blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchBlogs(1);
    }, [searchTerm, selectedCategory, sortBy]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchBlogs(nextPage);
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#F5F3ED" }}>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-opacity-20 focus:border-transparent outline-none transition-all"
                            style={{
                                focusRingColor: "rgba(139, 115, 85, 0.2)",
                                "--tw-ring-color": "rgba(139, 115, 85, 0.2)",
                            }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex space-x-4">
                        <select
                            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-opacity-20 focus:border-transparent outline-none"
                            style={{
                                focusRingColor: "rgba(139, 115, 85, 0.2)",
                                "--tw-ring-color": "rgba(139, 115, 85, 0.2)",
                            }}
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <select
                            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-opacity-20 focus:border-transparent outline-none"
                            style={{
                                focusRingColor: "rgba(139, 115, 85, 0.2)",
                                "--tw-ring-color": "rgba(139, 115, 85, 0.2)",
                            }}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="latest">Latest</option>
                            <option value="popular">Most Popular</option>
                            <option value="most-commented">Most Commented</option>
                        </select>
                    </div>
                </div>
                <div className="mb-6">
                    <p className="text-gray-600">
                        Showing {filteredBlogs.length} of {totalBlogs} articles
                    </p>
                </div>

                {loading && page === 1 ? (
                    <div className="flex justify-center items-center h-64">
                        <BounceLoader color="#8B7355" size={60} />
                    </div>
                ) : filteredBlogs.length === 0 ? (
                    <div className="text-center py-16">
                        <div
                            className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "#C4C9A3" }}
                        >
                            <Search className="w-12 h-12 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No articles found</h3>
                        <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBlogs.map((blog) => (
                            <BlogCard key={blog.id} blog={blog} />
                        ))}
                    </div>
                )}

                {loading && page > 1 && (
                    <div className="flex justify-center items-center my-8">
                        <BounceLoader color="#8B7355" size={40} />
                    </div>
                )}

                {hasNextPage && filteredBlogs.length > 0 && (
                    <div className="text-center mt-12">
                        <button
                            className="px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                            style={{
                                backgroundColor: "#8B7355",
                                color: "white",
                            }}
                            onClick={handleLoadMore}
                            onMouseEnter={(e) => {
                                e.target.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                            }}
                        >
                            Load More Articles
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Explore;
