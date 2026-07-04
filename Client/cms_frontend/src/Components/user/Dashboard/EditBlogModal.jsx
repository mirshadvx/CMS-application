import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Save, Globe, RotateCcw, RotateCw, Upload, Image as ImageIcon } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import DOMPurify from "dompurify";
import debounce from "lodash.debounce";
import uploadToCloudinary from "../../../services/cloudinaryService";
import contentApi from "../../../services/content/content";
import { useToast } from "../../../hooks/useToast";

const EditBlogModal = ({ 
    showEditModal, setShowEditModal, blogToEdit, setBlogToEdit, handleUpdateBlog }) => {
    const quillRef = useRef(null);
    const thumbnailInputRef = useRef(null);
    const [tagInput, setTagInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [editedBlog, setEditedBlog] = useState({
        title: "",
        excerpt: "",
        content: "",
        category: "",
        tags: [],
        thumbnail: "",
        status: "draft",
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const { showSuccess, showError } = useToast();

    useEffect(() => {
        if (showEditModal && blogToEdit) {
            const cat = blogToEdit.category?.id 
                ? String(blogToEdit.category.id) 
                : String(blogToEdit.category || "");

            const initialBlog = {
                title: blogToEdit.title || "",
                excerpt: blogToEdit.excerpt || "",
                content: blogToEdit.content || "",
                category: cat,
                tags: Array.isArray(blogToEdit.tags) ? [...blogToEdit.tags] : [],
                thumbnail: blogToEdit.thumbnail || "",
                status: blogToEdit.status || "draft",
            };

            setEditedBlog(initialBlog);
            setTagInput(initialBlog.tags.map(tag => `#${tag}`).join(" "));
            setIsInitialized(true);
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
        if (showEditModal) fetchCategories();
    }, [showEditModal]);

    const undoChange = () => quillRef.current?.getEditor()?.history.undo();
    const redoChange = () => quillRef.current?.getEditor()?.history.redo();

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
        if (!file.type.startsWith("image/")) return showError("Please select an image");
        if (file.size > 5 * 1024 * 1024) return showError("Image size should be < 5MB");

        setIsUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            if (url) setEditedBlog(prev => ({ ...prev, thumbnail: url }));
        } catch (error) {
            showError("Thumbnail upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const removeThumbnail = () => {
        setEditedBlog(prev => ({ ...prev, thumbnail: "" }));
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

    const formats = ["header", "bold", "italic", "underline", "strike", "color", "background", "script", "blockquote", "list", "indent", "align", "link", "image"];

    const handleContentChange = useCallback(
        debounce((content) => {
            setEditedBlog(prev => ({ ...prev, content: DOMPurify.sanitize(content) }));
        }, 300),
        []
    );

    const handleTagsChange = (e) => {
        const input = e.target.value;
        setTagInput(input);
        const matches = [...input.matchAll(/#([a-zA-Z0-9_]+)/g)];
        const tags = matches
            .map(m => m[1])
            .filter((tag, i, arr) => arr.indexOf(tag) === i)
            .slice(0, 10);
        setEditedBlog(prev => ({ ...prev, tags }));
    };

    const handleTagRemove = (index) => {
        const updatedTags = editedBlog.tags.filter((_, i) => i !== index);
        setEditedBlog(prev => ({ ...prev, tags: updatedTags }));
        setTagInput(updatedTags.map(t => `#${t}`).join(" "));
    };

    const validateBlog = () => {
        if (!editedBlog.title.trim()) return showError("Title is required");
        if (!editedBlog.content || editedBlog.content === "<p><br></p>") return showError("Content is required");
        return true;
    };

    const handleSave = async () => {
        if (!validateBlog()) return;
        setIsSaving(true);
        try {
            await handleUpdateBlog(blogToEdit.id, {
                ...editedBlog,
                category: parseInt(editedBlog.category) || null,
            });
            showSuccess("Blog updated successfully!");
        } catch (error) {
            showError("Failed to update blog");
        } finally {
            setIsSaving(false);
        }
    };

    const hasUnsavedChanges = () => {
        if (!blogToEdit || !isInitialized) return false;

        const originalCategory = blogToEdit.category?.id 
            ? String(blogToEdit.category.id) 
            : String(blogToEdit.category || "");

        const currentCategory = String(editedBlog.category || "");

        const normalize = (str) => str ? str.replace(/\s+/g, " ").trim() : "";

        return (
            editedBlog.title.trim() !== (blogToEdit.title || "").trim() ||
            editedBlog.excerpt.trim() !== (blogToEdit.excerpt || "").trim() ||
            normalize(editedBlog.content) !== normalize(blogToEdit.content) ||
            currentCategory !== originalCategory ||
            JSON.stringify([...editedBlog.tags].sort()) !== JSON.stringify([...(blogToEdit.tags || [])].sort()) ||
            editedBlog.thumbnail !== (blogToEdit.thumbnail || "") ||
            editedBlog.status !== (blogToEdit.status || "draft")
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
        setShowConfirmModal(false);
        setShowEditModal(false);
        setBlogToEdit(null);
        setTagInput("");
        setIsInitialized(false);
    };

    const isPublished = editedBlog.status === "published";

    return showEditModal ? (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[99vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-4 rounded-t-3xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Edit {isPublished ? "Published" : "Draft"} Post
                        </h2>
                        <button 
                            onClick={handleCloseModal} 
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <X size={22} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Status</label>
                        <select
                            value={editedBlog.status}
                            onChange={(e) => setEditedBlog(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Blog Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={editedBlog.title}
                                onChange={(e) => setEditedBlog(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter blog title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Excerpt <span className="text-red-500">*</span></label>
                            <textarea
                                value={editedBlog.excerpt}
                                onChange={(e) => setEditedBlog(prev => ({ ...prev, excerpt: e.target.value }))}
                                rows={3}
                                maxLength={200}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                placeholder="Write a short excerpt..."
                            />
                            <p className="text-xs text-gray-500 mt-1">{editedBlog.excerpt.length}/200</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
                                <select
                                    value={editedBlog.category}
                                    onChange={(e) => setEditedBlog(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (min 3 for publish)</label>
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={handleTagsChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    placeholder="#react #javascript"
                                />
                                {editedBlog.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {editedBlog.tags.map((tag, i) => (
                                            <span key={i} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center">
                                                #{tag}
                                                <button onClick={() => handleTagRemove(i)} className="ml-2 text-red-500">×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Thumbnail Image <span className="text-red-500">*</span></label>
                            {!editedBlog.thumbnail ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                                    <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <button
                                        type="button"
                                        onClick={() => thumbnailInputRef.current?.click()}
                                        className="mt-3 text-indigo-600 font-medium"
                                    >
                                        {isUploading ? "Uploading..." : "Upload Thumbnail"}
                                    </button>
                                </div>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden">
                                    <img src={editedBlog.thumbnail} alt="thumbnail" className="w-full h-48 object-cover" />
                                    <button onClick={removeThumbnail} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full">
                                        <X size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Content <span className="text-red-500">*</span></label>
                        <div className="flex gap-3 mb-3">
                            <button onClick={undoChange} className="flex items-center gap-1 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200">
                                <RotateCcw size={16} /> Undo
                            </button>
                            <button onClick={redoChange} className="flex items-center gap-1 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200">
                                <RotateCw size={16} /> Redo
                            </button>
                        </div>
                        <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            value={editedBlog.content}
                            onChange={handleContentChange}
                            modules={modules}
                            formats={formats}
                            style={{ height: "480px" }}
                        />
                    </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-3xl flex justify-end">
                    {isPublished ? (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium disabled:opacity-50"
                        >
                            <Globe size={18} className="mr-2" />
                            {isSaving ? "Updating..." : "Update Post"}
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
                            >
                                <Save size={18} className="mr-2" />
                                Save Draft
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 font-medium"
                            >
                                <Globe size={18} className="mr-2" />
                                Publish Now
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Unsaved Changes</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to close post edit?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={closeModal}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
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

export default EditBlogModal;