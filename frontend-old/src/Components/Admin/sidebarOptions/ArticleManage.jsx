import React, { useState, useEffect } from "react";
import API from "../../../api/axios";

// Feedback Banner component
function FeedbackBanner({ type, message, onClose }) {
  useEffect(() => {
    if (type === "success" || type === "error") {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [type, onClose]);

  const baseClasses = "p-4 mb-4 rounded-lg flex items-center gap-3";
  const styles = {
    loading: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
  };

  const icons = {
    loading: <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>,
    success: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>,
    error: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>,
  };

  return (
    <div className={`${baseClasses} ${styles[type]}`}>
      {icons[type]}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg hover:bg-opacity-20 hover:bg-current">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </button>
    </div>
  );
}

export default function ArticleManage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ show: false, type: "", message: "" });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    content: "",
    image: null,
  });

  const [selectedArticle, setSelectedArticle] = useState(null);

  // Fetch all articles
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await API.get("/articles");
      setArticles(res.data.data || []);
    } catch (err) {
      console.error("Error fetching articles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files ? files[0] : null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Upload article
  const handleUpload = async () => {
    if (!formData.title || !formData.author || !formData.content) {
      alert("Please fill all required fields.");
      return;
    }
    setIsUploadModalOpen(false);
    setFeedback({ show: true, type: "loading", message: "Uploading article..." });
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("author", formData.author);
      data.append("content", formData.content);
      if (formData.image) data.append("image", formData.image);

      await API.post("/admin/articles", data);
      setFeedback({ show: true, type: "success", message: "Article uploaded successfully!" });
      fetchArticles();
    } catch (err) {
      console.error("Error uploading article:", err);
      setFeedback({ show: true, type: "error", message: "Upload failed. Please try again." });
    } finally {
      setFormData({ title: "", author: "", content: "", image: null });
    }
  };

  // Edit article
  const handleEdit = async () => {
    if (!formData.title || !formData.author || !formData.content) {
      alert("Please fill all required fields.");
      return;
    }
    setIsEditModalOpen(false);
    setFeedback({ show: true, type: "loading", message: "Updating article..." });
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("author", formData.author);
      data.append("content", formData.content);
      if (formData.image instanceof File) data.append("image", formData.image);

      await API.put(`/admin/articles/${selectedArticle._id}`, data);
      setFeedback({ show: true, type: "success", message: "Article updated successfully!" });
      fetchArticles();
    } catch (err) {
      console.error("Error editing article:", err);
      setFeedback({ show: true, type: "error", message: "Update failed. Please try again." });
    } finally {
      setSelectedArticle(null);
      setFormData({ title: "", author: "", content: "", image: null });
    }
  };

  // Delete article
  const handleDelete = async () => {
    if (!selectedArticle) return;
    setIsDeleteConfirmOpen(false);
    setFeedback({ show: true, type: "loading", message: "Deleting article..." });
    try {
      await API.delete(`/admin/articles/${selectedArticle._id}`);
      setFeedback({ show: true, type: "success", message: "Article deleted successfully!" });
      fetchArticles();
    } catch (err) {
      console.error("Error deleting article:", err);
      setFeedback({ show: true, type: "error", message: "Deletion failed. Please try again." });
    } finally {
      setSelectedArticle(null);
    }
  };

  // Open edit modal with article data
  const openEditModal = (article) => {
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      author: article.author,
      content: article.content,
      image: article.image,
    });
    setIsEditModalOpen(true);
  };

  // Card date format
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div>
      {/* Feedback Banner */}
      {feedback.show && (
        <FeedbackBanner
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback({ show: false, type: "", message: "" })}
        />
      )}

      {/* Title & Upload Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#35582a] underline">
          Manage Articles
        </h2>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-green-700 transition-colors"
        >
          Upload Article
        </button>
      </div>

      {/* Article Cards */}
      {loading ? (
        <p className="text-[#35582a]">Loading Articles...</p>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto"
          style={{ maxHeight: "70vh" }}
        >
          {articles.map((article) => (
            <div
              key={article._id}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
            >
              {article.image ? (
                <img
                  loading="lazy"
                  src={article.image}
                  alt={article.title}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-40 flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400 text-lg">No Image</span>
                </div>
              )}
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-1">
                  {formatDate(article.createdAt)}
                </p>
                <h3
                  className="text-lg font-semibold text-green-900 cursor-pointer hover:underline"
                  onClick={() => {
                    setSelectedArticle(article);
                    setIsFullViewOpen(true);
                  }}
                >
                  {article.title}
                </h3>
                <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded mt-1">
                  {article.author}
                </span>
                <p className="text-gray-700 mt-2">
                  {article.content ? article.content.slice(0, 100) : ""}...
                </p>
                <button
                  onClick={() => {
                    setSelectedArticle(article);
                    setIsFullViewOpen(true);
                  }}
                  className="text-green-600 mt-2 inline-block hover:underline"
                >
                  Read More »
                </button>
                <div className="flex gap-4 mt-4 border-t pt-3">
                  <button
                    onClick={() => openEditModal(article)}
                    className="font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedArticle(article);
                      setIsDeleteConfirmOpen(true);
                    }}
                    className="font-semibold text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <Modal
          title="Upload Article"
          onClose={() => {
            setIsUploadModalOpen(false);
            setFormData({ title: "", author: "", content: "", image: null });
          }}
          onSubmit={handleUpload}
        >
          <ArticleForm formData={formData} handleChange={handleChange} />
        </Modal>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <Modal
          title="Edit Article"
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedArticle(null);
            setFormData({ title: "", author: "", content: "", image: null });
          }}
          onSubmit={handleEdit}
        >
          <ArticleForm formData={formData} handleChange={handleChange} />
        </Modal>
      )}

      {/* Full View Modal */}
      {isFullViewOpen && selectedArticle && (
        <Modal
          title={selectedArticle.title}
          onClose={() => setIsFullViewOpen(false)}
          hideSubmit
        >
          <div className="max-h-[70vh] overflow-y-auto pr-4">
            <p className="text-sm text-gray-500 mb-2">
              {formatDate(selectedArticle.createdAt)}
            </p>
            <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded mb-4">
              {selectedArticle.author}
            </span>
            {selectedArticle.image ? (
              <img
                loading="lazy"
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-60 object-cover mb-4 rounded-lg shadow-md"
              />
            ) : (
              <div className="w-full h-60 flex items-center justify-center bg-gray-100 mb-4">
                <span className="text-gray-400 text-lg">No Image</span>
              </div>
            )}
            <p className="whitespace-pre-line text-black">
              {selectedArticle.content}
            </p>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {isDeleteConfirmOpen && (
        <Modal
          title="Confirm Delete"
          onClose={() => setIsDeleteConfirmOpen(false)}
          onSubmit={handleDelete}
        >
          <p className="text-black">
            Are you sure you want to delete this Article?
          </p>
        </Modal>
      )}
    </div>
  );
}

// Modal Component
function Modal({ title, children, onClose, onSubmit, hideSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl m-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{title}</h2>
        <div>{children}</div>
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
          >
            Cancel
          </button>
          {!hideSubmit && (
            <button
              onClick={onSubmit}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Article Form Component
function ArticleForm({ formData, handleChange }) {
  const removeImage = () => {
    handleChange({ target: { name: "image", files: [] } });
  };

  return (
    <form className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          name="title"
          placeholder="Enter article title"
          value={formData.title}
          onChange={handleChange}
          className="text-black bg-gray-200 w-full border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
        <input
          type="text"
          name="author"
          placeholder="Author's name"
          value={formData.author}
          onChange={handleChange}
          className="text-black bg-gray-200 w-full border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <textarea
          name="content"
          placeholder="Write your article content..."
          value={formData.content}
          onChange={handleChange}
          rows="8"
          className="text-black bg-gray-200 w-full border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500"
        ></textarea>
      </div>

      {/* File upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Article Image</label>
        {formData.image ? (
          <div className="flex items-center gap-3 mt-2">
            <p className="text-sm text-gray-700 bg-green-100 px-3 py-1 rounded-full">
              {typeof formData.image === "string" ? formData.image.split("/").pop() : formData.image.name}
            </p>
            <button
              type="button"
              onClick={removeImage}
              className="text-red-500 font-bold hover:text-red-700 text-xl"
              title="Remove image"
            >
              &times;
            </button>
          </div>
        ) : (
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
          />
        )}
      </div>
    </form>
  );
}
