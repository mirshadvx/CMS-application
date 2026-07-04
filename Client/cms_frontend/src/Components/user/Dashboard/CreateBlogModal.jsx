import React, { useRef, useState, useEffect } from "react";
import { X, Save, Globe, RotateCcw, RotateCw, Image as ImageIcon } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import DOMPurify from "dompurify";
import uploadToCloudinary from "../../../services/cloudinaryService";
import contentApi from "../../../services/content/content";
import api from "../../../services/api";
import { useToast } from "../../../hooks/useToast";

const CreateBlogModal = ({ showCreateModal, setShowCreateModal, onBlogCreated }) => {
    const quillRef = useRef(null);
    const thumbnailInputRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const [tagInput, setTagInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [categories, setCategories] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [newBlog, setNewBlog] = useState({
        title: "",
        excerpt: "",
        content: "",
        category: "",
        tags: [],
        thumbnail: "",
        status: "draft",
    });
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await contentApi.getCategories();
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
                showError("Failed to fetch categories");
            }
        };
        fetchCategories();
    }, []);

    const handleEditorFocus = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.style.overflowY = "hidden";
        }
    };

    const handleEditorBlur = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.style.overflowY = "auto";
        }
    };

    const resetForm = () => {
        setNewBlog({
            title: "",
            excerpt: "",
            content: "",
            category: "",
            tags: [],
            thumbnail: "",
            status: "draft",
        });
        setTagInput("");
    };

    const undoChange = () => {
        quillRef.current?.getEditor()?.history.undo();
    };

    const redoChange = () => {
        quillRef.current?.getEditor()?.history.redo();
    };

    const handleImageUpload = async () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;
            setIsUploading(true);
            try {
                const cloudinaryUrl = await uploadToCloudinary(file);
                if (cloudinaryUrl) {
                    const editor = quillRef.current.getEditor();
                    const range = editor.getSelection() || { index: 0 };
                    editor.insertEmbed(range.index, "image", cloudinaryUrl);
                }
            } catch (error) {
                showError("Failed to upload image");
            } finally {
                setIsUploading(false);
            }
        };
    };

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) return showError("Please select an image file");
        if (file.size > 5 * 1024 * 1024) return showError("Image size should be less than 5MB");

        setIsUploading(true);
        try {
            const cloudinaryUrl = await uploadToCloudinary(file);
            if (cloudinaryUrl) {
                setNewBlog(prev => ({ ...prev, thumbnail: cloudinaryUrl }));
            }
        } catch (error) {
            showError("Failed to upload thumbnail");
        } finally {
            setIsUploading(false);
        }
    };

    const removeThumbnail = () => {
        setNewBlog(prev => ({ ...prev, thumbnail: "" }));
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    };

    const modules = {
        toolbar: {
            container: [
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ color: [] }, { background: [] }],
                [{ script: "sub" }, { script: "super" }],
                ["blockquote"],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ indent: "-1" }, { indent: "+1" }],
                [{ align: [] }],
                ["link", "image"],
                ["clean"],
            ],
            handlers: { image: handleImageUpload },
        },
        history: { delay: 1000, maxStack: 100, userOnly: true },
    };

    const formats = [
        "header", "bold", "italic", "underline", "strike", "color", "background",
        "script", "blockquote", "list", "indent", "align", "link", "image"
    ];

    const handleContentChange = (content) => {
        const cleanContent = DOMPurify.sanitize(content);
        setNewBlog(prev => ({ ...prev, content: cleanContent }));
    };

    const handleTagsChange = (e) => {
        const input = e.target.value;
        setTagInput(input);
        const matches = [...input.matchAll(/#([a-zA-Z0-9_]+)/g)];
        const extractedTags = matches
            .map(match => match[1])
            .filter(tag => tag?.trim())
            .filter((tag, i, arr) => arr.indexOf(tag) === i)
            .slice(0, 10);
        setNewBlog(prev => ({ ...prev, tags: extractedTags }));
    };

    const handleTagRemove = (indexToRemove) => {
        const updatedTags = newBlog.tags.filter((_, i) => i !== indexToRemove);
        setNewBlog(prev => ({ ...prev, tags: updatedTags }));
        setTagInput(updatedTags.map(tag => `#${tag}`).join(" "));
    };

    const validateBlog = (isDraft = false) => {
        if (!newBlog.title.trim()) return showError("Please enter a blog title.");
        if (!newBlog.content || newBlog.content === "<p><br></p>") return showError("Please add some content.");
        if (!isDraft) {
            if (!newBlog.excerpt.trim()) return showError("Please add an excerpt.");
            if (!newBlog.category) return showError("Please select a category.");
            if (newBlog.tags.length < 3) return showError("Please add at least 3 tags.");
            if (!newBlog.thumbnail) return showError("Please add a thumbnail image.");
        }
        return true;
    };

    const saveBlogPost = async (status = "draft") => {
        try {
            const selectedCategory = categories.find(cat => cat.name === newBlog.category);
            if (!selectedCategory) throw new Error("Category not found");

            const blogData = {
                ...newBlog,
                category: selectedCategory.id,
                status,
                wordCount: newBlog.content.replace(/<[^>]*>/g, "").split(" ").filter(Boolean).length,
                readTime: Math.ceil(newBlog.content.replace(/<[^>]*>/g, "").split(" ").length / 200),
            };

            const response = await api.post("user/blogs/create/", blogData);
            return response.data;
        } catch (error) {
            console.error("Error saving blog post:", error);
            throw error;
        }
    };

    const handleSaveDraft = async () => {
        if (!validateBlog(true)) return;
        setIsSaving(true);
        try {
            await saveBlogPost("draft");
            showSuccess("Draft saved successfully!");
            resetForm();
            onBlogCreated();
        } catch (error) {
            showError("Failed to save draft.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!validateBlog(false)) return;
        setIsPublishing(true);
        try {
            await saveBlogPost("published");
            showSuccess("Blog published successfully!");
            resetForm();
            onBlogCreated();
        } catch (error) {
            showError("Failed to publish blog.");
        } finally {
            setIsPublishing(false);
        }
    };

    const hasUnsavedChanges = () => {
        return (
            newBlog.title.trim() ||
            newBlog.excerpt.trim() ||
            (newBlog.content && newBlog.content !== "<p><br></p>") ||
            newBlog.tags.length > 0 ||
            newBlog.thumbnail
        );
    };

    const handleCloseModal = () => {
        if (hasUnsavedChanges()) {
            setShowConfirmModal(true);
        } else {
            closeModal();
        }
    };

    const closeModal = () => {
        resetForm();
        setShowConfirmModal(false);
        setShowCreateModal(false);
    };

    return showCreateModal ? (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-4 rounded-t-3xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Create New Blog Post</h2>
                        <button
                            onClick={handleCloseModal}
                            className="p-2 hover:bg-gray-100 rounded-xl"
                            disabled={isSaving || isPublishing}
                        >
                            <X size={22} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Blog Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={newBlog.title}
                                onChange={(e) => setNewBlog(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter an engaging title..."
                                disabled={isSaving || isPublishing}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Excerpt <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={newBlog.excerpt}
                                onChange={(e) => setNewBlog(prev => ({ ...prev, excerpt: e.target.value }))}
                                rows={3}
                                maxLength={200}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                placeholder="Write a compelling excerpt..."
                                disabled={isSaving || isPublishing}
                            />
                            <p className="text-xs text-gray-500 mt-1">{newBlog.excerpt.length}/200</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={newBlog.category}
                                    onChange={(e) => setNewBlog(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    disabled={isSaving || isPublishing}
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tags (min 3 for publish)
                                </label>
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={handleTagsChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    placeholder="#react #javascript"
                                    disabled={isSaving || isPublishing}
                                />
                                {newBlog.tags.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {newBlog.tags.map((tag, i) => (
                                            <span key={i} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center">
                                                #{tag}
                                                <button onClick={() => handleTagRemove(i)} className="ml-2 text-red-500">×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Thumbnail Image <span className="text-red-500">*</span>
                            </label>
                            {!newBlog.thumbnail ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                                    <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <button type="button" onClick={() => thumbnailInputRef.current?.click()} className="mt-3 text-indigo-600 font-medium">
                                        {isUploading ? "Uploading..." : "Upload Thumbnail"}
                                    </button>
                                </div>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden">
                                    <img src={newBlog.thumbnail} alt="thumbnail" className="w-full h-48 object-cover" />
                                    <button onClick={removeThumbnail} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full">
                                        <X size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Content <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-3 mb-3">
                            <button onClick={undoChange} className="flex items-center gap-1 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200" disabled={isSaving || isPublishing}>
                                <RotateCcw size={16} /> Undo
                            </button>
                            <button onClick={redoChange} className="flex items-center gap-1 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200" disabled={isSaving || isPublishing}>
                                <RotateCw size={16} /> Redo
                            </button>
                        </div>
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={newBlog.content}
                                onChange={handleContentChange}
                                onFocus={handleEditorFocus}
                                onBlur={handleEditorBlur}
                                modules={modules}
                                formats={formats}
                                placeholder="Write your amazing blog content here..."
                                style={{ height: "480px" }}
                                className="quill-editor"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-3xl">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            {newBlog.content && (
                                <span>
                                    {Math.ceil(newBlog.content.replace(/<[^>]*>/g, "").split(" ").filter(Boolean).length / 200)} min read •{" "}
                                    {newBlog.content.replace(/<[^>]*>/g, "").split(" ").filter(Boolean).length} words
                                </span>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveDraft}
                                disabled={isSaving || isPublishing}
                                className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium disabled:opacity-50"
                            >
                                <Save size={18} className="mr-2" />
                                {isSaving ? "Saving..." : "Save Draft"}
                            </button>
                            <button
                                onClick={handlePublish}
                                disabled={isSaving || isPublishing}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 font-medium disabled:opacity-50"
                            >
                                <Globe size={18} className="mr-2" />
                                {isPublishing ? "Publishing..." : "Publish Now"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Unsaved Changes</h3>
                        <p className="text-gray-600 mb-6">
                            You have unsaved changes. Are you sure you want to close without saving?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={closeModal}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium"
                            >
                                Discard Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    ) : null;
};

export default CreateBlogModal;