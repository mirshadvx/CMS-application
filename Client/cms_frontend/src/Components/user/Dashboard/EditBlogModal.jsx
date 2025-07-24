import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Save, Globe, RotateCcw, RotateCw, Upload, Image as ImageIcon } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import DOMPurify from "dompurify";
import debounce from "lodash.debounce";
import uploadToCloudinary from "../../../services/cloudinaryService";
import contentApi from "../../../services/content/content";
import { useToast } from "../../../hooks/useToast";

const EditBlogModal = ({ showEditModal, setShowEditModal, blogToEdit, setBlogToEdit, handleUpdateBlog }) => {
    const quillRef = useRef(null);
    const thumbnailInputRef = useRef(null);
    const [tagInput, setTagInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [categories, setCategories] = useState([]);
    const [editedBlog, setEditedBlog] = useState({
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
        if (showEditModal && blogToEdit) {
            const initialBlog = {
                title: blogToEdit.title || "",
                excerpt: blogToEdit.excerpt || "",
                content: blogToEdit.content || "",
                category: blogToEdit.category?.id || blogToEdit.category || "",
                tags: blogToEdit.tags || [],
                thumbnail: blogToEdit.thumbnail || "",
                status: blogToEdit.status || "draft",
            };
            setEditedBlog(initialBlog);
            setTagInput(blogToEdit.tags?.map((tag) => `#${tag}`).join(" ") || "");
        }
    }, [showEditModal, blogToEdit]);

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
        if (showEditModal) {
            fetchCategories();
        }
    }, [showEditModal]);

    const undoChange = () => {
        const editor = quillRef.current?.getEditor();
        if (editor) editor.history.undo();
    };

    const redoChange = () => {
        const editor = quillRef.current?.getEditor();
        if (editor) editor.history.redo();
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
                console.error("Error uploading image:", error);
                showError("Failed to upload image. Please try again.");
            } finally {
                setIsUploading(false);
            }
        };
    };

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showError("Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showError("Image size should be less than 5MB");
            return;
        }

        setIsUploading(true);
        try {
            const cloudinaryUrl = await uploadToCloudinary(file);
            if (cloudinaryUrl) {
                setEditedBlog((prev) => ({ ...prev, thumbnail: cloudinaryUrl }));
            } else {
                showError("Failed to upload thumbnail. Please try again.");
            }
        } catch (error) {
            console.error("Error uploading thumbnail:", error);
            showError("Failed to upload thumbnail. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const removeThumbnail = () => {
        setEditedBlog((prev) => ({ ...prev, thumbnail: "" }));
        if (thumbnailInputRef.current) {
            thumbnailInputRef.current.value = "";
        }
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
            handlers: {
                image: handleImageUpload,
            },
        },
        history: {
            delay: 1000,
            maxStack: 100,
            userOnly: true,
        },
    };

    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "color",
        "background",
        "script",
        "blockquote",
        "list",
        "indent",
        "align",
        "link",
        "image",
    ];

    const handleContentChange = useCallback(
        debounce((content) => {
            const cleanContent = DOMPurify.sanitize(content, { USE_PROFILES: { html: true } });
            if (cleanContent !== editedBlog.content) {
                setEditedBlog((prev) => ({ ...prev, content: cleanContent }));
            }
        }, 300),
        [editedBlog.content]
    );

    const handleTagsChange = (e) => {
        const input = e.target.value;
        setTagInput(input);
        const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
        const matches = [...input.matchAll(hashtagRegex)];
        const extractedTags = matches
            .map((match) => match[1])
            .filter((tag) => tag && tag.trim().length > 0)
            .filter((tag, index, arr) => arr.indexOf(tag) === index)
            .slice(0, 10);
        setEditedBlog((prev) => ({ ...prev, tags: extractedTags }));
    };

    const handleTagRemove = (indexToRemove) => {
        const updatedTags = editedBlog.tags.filter((_, i) => i !== indexToRemove);
        setEditedBlog((prev) => ({ ...prev, tags: updatedTags }));
        const newInput = updatedTags.map((tag) => `#${tag}`).join(" ");
        setTagInput(newInput);
    };

    const validateBlog = (isDraft = true) => {
        if (!editedBlog.title.trim()) {
            showError("Please enter a blog title.");
            return false;
        }
        if (!editedBlog.content.trim() || editedBlog.content === "<p><br></p>") {
            showError("Please add some content to your blog post.");
            return false;
        }
        if (!isDraft) {
            if (!editedBlog.excerpt.trim()) {
                showError("Please add an excerpt for your blog post.");
                return false;
            }
            if (!editedBlog.category) {
                showError("Please select a category.");
                return false;
            }
            if (editedBlog.tags.length < 3) {
                showError("Please add at least 3 tags before publishing.");
                return false;
            }
            if (!editedBlog.thumbnail) {
                showError("Please add a thumbnail image before publishing.");
                return false;
            }
        }
        return true;
    };

    const handleSaveDraft = async () => {
        if (!validateBlog(true)) return;
        setIsSaving(true);
        try {
            await handleUpdateBlog(blogToEdit.id, {
                ...editedBlog,
                status: "draft",
                category: parseInt(editedBlog.category) || null,
            });
            showSuccess("Draft updated successfully!");
        } catch (error) {
            showError("Failed to update draft. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!validateBlog(false)) return;
        setIsPublishing(true);
        try {
            await handleUpdateBlog(blogToEdit.id, {
                ...editedBlog,
                status: "published",
                category: parseInt(editedBlog.category) || null,
            });
            showSuccess("Blog post published successfully!");
        } catch (error) {
            showError("Failed to publish blog post. Please try again.");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleCloseModal = () => {
        const hasUnsavedChanges =
            editedBlog.title !== (blogToEdit?.title || "") ||
            editedBlog.excerpt !== (blogToEdit?.excerpt || "") ||
            editedBlog.content !== (blogToEdit?.content || "") ||
            editedBlog.category !== (blogToEdit?.category?.id || blogToEdit?.category || "") ||
            JSON.stringify(editedBlog.tags) !== JSON.stringify(blogToEdit?.tags || []) ||
            editedBlog.thumbnail !== (blogToEdit?.thumbnail || "");
        if (hasUnsavedChanges) {
            const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to close without saving?");
            if (!confirmClose) return;
        }
        setEditedBlog({
            title: "",
            excerpt: "",
            content: "",
            category: "",
            tags: [],
            thumbnail: "",
            status: "draft",
        });
        setTagInput("");
        setShowEditModal(false);
        setBlogToEdit(null);
    };

    return showEditModal ? (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[99vh] overflow-y-auto animate-in fade-in-0 zoom-in-95">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-3 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">Edit Blog Post</h2>
                        <button
                            onClick={handleCloseModal}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                            disabled={isSaving || isPublishing}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Blog Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={editedBlog.title}
                                onChange={(e) => setEditedBlog((prev) => ({ ...prev, title: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
                                placeholder="Enter an engaging title..."
                                disabled={isSaving || isPublishing}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Excerpt <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={editedBlog.excerpt}
                                onChange={(e) => setEditedBlog((prev) => ({ ...prev, excerpt: e.target.value }))}
                                rows="2"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="Write a compelling excerpt (recommended: 150-160 characters)..."
                                disabled={isSaving || isPublishing}
                                maxLength="200"
                            />
                            <p className="text-xs text-gray-500 mt-1">{editedBlog.excerpt.length}/200 characters</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={editedBlog.category || ""}
                                    onChange={(e) => setEditedBlog((prev) => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    disabled={isSaving || isPublishing}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tags <span className="text-red-500">*</span> (min 3 for publishing)
                                </label>
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={handleTagsChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="#react #webdev #javascript"
                                    disabled={isSaving || isPublishing}
                                />
                                {editedBlog.tags.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {editedBlog.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                            >
                                                {tag}
                                                <button
                                                    onClick={() => handleTagRemove(index)}
                                                    className="ml-1 text-indigo-600 hover:text-indigo-900"
                                                    disabled={isSaving || isPublishing}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    {editedBlog.tags.length}/10 tags • Use # prefix to add tags
                                </p>
                                {editedBlog.tags.length >= 10 && (
                                    <p className="text-xs text-red-500 mt-1">Maximum 10 tags allowed.</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Thumbnail Image <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-3">
                                {!editedBlog.thumbnail ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                                        <input
                                            ref={thumbnailInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleThumbnailUpload}
                                            className="hidden"
                                            disabled={isUploading || isSaving || isPublishing}
                                        />
                                        <div className="space-y-2">
                                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => thumbnailInputRef.current?.click()}
                                                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                                                    disabled={isUploading || isSaving || isPublishing}
                                                >
                                                    {isUploading ? "Uploading..." : "Click to upload"}
                                                </button>
                                                <span className="text-gray-500"> or drag and drop</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <img
                                            src={editedBlog.thumbnail}
                                            alt="Thumbnail preview"
                                            className="w-full h-48 object-cover rounded-xl border border-gray-200"
                                        />
                                        <button
                                            onClick={removeThumbnail}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            disabled={isSaving || isPublishing}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Content <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2 mb-2">
                            <button
                                onClick={undoChange}
                                className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-all"
                                disabled={isSaving || isPublishing}
                            >
                                <RotateCcw size={16} className="mr-1" />
                                Undo
                            </button>
                            <button
                                onClick={redoChange}
                                className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-all"
                                disabled={isSaving || isPublishing}
                            >
                                <RotateCw size={16} className="mr-1" />
                                Redo
                            </button>
                            {isUploading && (
                                <span className="flex items-center px-3 py-1 text-sm text-indigo-600">
                                    <Upload size={16} className="mr-1 animate-pulse" />
                                    Uploading image...
                                </span>
                            )}
                        </div>
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={editedBlog.content}
                                onChange={handleContentChange}
                                modules={modules}
                                formats={formats}
                                placeholder="Edit your blog content here..."
                                style={{ height: "500px", marginBottom: "42px" }}
                                readOnly={isSaving || isPublishing}
                            />
                        </div>
                    </div>
                </div>
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-b-3xl">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            {editedBlog.content && (
                                <span>
                                    {Math.ceil(
                                        editedBlog.content
                                            .replace(/<[^>]*>/g, "")
                                            .split(" ")
                                            .filter((word) => word.length > 0).length / 200
                                    )}{" "}
                                    min read •{" "}
                                    {
                                        editedBlog.content
                                            .replace(/<[^>]*>/g, "")
                                            .split(" ")
                                            .filter((word) => word.length > 0).length
                                    }{" "}
                                    words
                                </span>
                            )}
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleSaveDraft}
                                disabled={isSaving || isPublishing}
                                className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={18} className="mr-2" />
                                {isSaving ? "Saving..." : "Save Draft"}
                            </button>
                            <button
                                onClick={handlePublish}
                                disabled={isSaving || isPublishing}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <Globe size={18} className="mr-2" />
                                {isPublishing ? "Publishing..." : "Publish Now"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : null;
};

export default EditBlogModal;
