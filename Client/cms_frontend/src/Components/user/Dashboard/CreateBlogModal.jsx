import React from "react";
import {
  X,
  Upload,
  Bold,
  Italic,
  Link,
  List,
  Code,
  ImageIcon,
  Save,
  Globe,
} from "lucide-react";

const CreateBlogModal = ({ newBlog, setNewBlog, showCreateModal, setShowCreateModal, handleSaveDraft, handleCreateBlog }) => {
  return showCreateModal ? (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create New Blog Post</h2>
            <button
              onClick={() => setShowCreateModal(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Blog Title</label>
              <input
                type="text"
                value={newBlog.title}
                onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
                placeholder="Enter an engaging title..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Excerpt</label>
              <textarea
                value={newBlog.excerpt}
                onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                rows="2"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Write a compelling excerpt..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={newBlog.category}
                  onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">Select category</option>
                  <option value="Technology">Technology</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Backend">Backend</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Design">Design</option>
                  <option value="Tutorial">Tutorial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                <input
                  type="text"
                  value={newBlog.tags.join(", ")}
                  onChange={(e) =>
                    setNewBlog({
                      ...newBlog,
                      tags: e.target.value.split(", ").filter((tag) => tag.trim()),
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="React, JavaScript, Tutorial"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Featured Image</label>
              <div className="flex items-center space-x-4">
                <input
                  type="url"
                  value={newBlog.thumbnail}
                  onChange={(e) => setNewBlog({ ...newBlog, thumbnail: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/image.jpg"
                />
                <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center">
                  <Upload size={16} className="mr-2" />
                  Upload
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-all">
                  <Bold size={16} />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-all">
                  <Italic size={16} />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-all">
                  <Link size={16} />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-all">
                  <List size={16} />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-all">
                  <Code size={16} />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-all">
                  <ImageIcon size={16} />
                </button>
              </div>
              <textarea
                value={newBlog.content}
                onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                rows="12"
                className="w-full px-4 py-3 border-none focus:ring-0 resize-none"
                placeholder="Write your amazing blog content here..."
              />
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Auto-saved 2 min ago</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSaveDraft}
                className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
              >
                <Save size={18} className="mr-2" />
                Save Draft
              </button>
              <button
                onClick={handleCreateBlog}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-105 font-medium"
              >
                <Globe size={18} className="mr-2" />
                Publish Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default CreateBlogModal;
