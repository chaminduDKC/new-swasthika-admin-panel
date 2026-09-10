import React, { useState, useEffect } from "react";
import { X, Loader2, Save, ImageIcon } from "lucide-react";
import { imageService, categoryService } from "../api/services";

/**
 * Modal to edit a decoration image metadata.
 * Props: isOpen, onClose, image, onUpdated
 */
export const ImageEditModal = ({ isOpen, onClose, image, onUpdated }) => {
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showOnSlider, setShowOnSlider] = useState(false);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    categoryService.getAll().then((res) => {
      if (res.success) setCategories(res.categories || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (image) {
      setTitle(image.title || "");
      setPlace(image.place || "");
      setCategoryId(String(image.category_id || ""));
      setShowOnSlider(Boolean(image.show_on_slider));
      setError("");
    }
  }, [image, isOpen]);

  if (!isOpen || !image) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    if (!place.trim()) { setError("Place / venue is required."); return; }
    if (!categoryId)   { setError("Please select a category."); return; }

    setSaving(true);
    setError("");
    try {
      const res = await imageService.update(image.id, {
        title: title.trim(),
        place: place.trim(),
        categoryId,
        show_on_slider: showOnSlider,
      });
      if (res.success) {
        onUpdated(res.image);
        onClose();
      } else {
        setError(res.message || "Failed to update image.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update image.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 bg-gold-100 text-gold-700 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-stone-900">Edit Image</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thumbnail Preview */}
        <div className="px-6 pt-5 pb-1">
          <div className="w-full h-36 rounded-xl overflow-hidden bg-stone-100 mb-5">
            <img
              src={image.image_url}
              alt={image.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Elegant Bridal Table"
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all"
            />
          </div>

          {/* Place */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Place / Venue <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="e.g. Cinnamon Grand, Colombo"
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all"
            >
              <option value="">Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Show on Slider */}
          <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer hover:bg-gold-50 hover:border-gold-300 transition-colors">
            <input
              type="checkbox"
              checked={showOnSlider}
              onChange={(e) => setShowOnSlider(e.target.checked)}
              className="w-4 h-4 rounded accent-[#9E7244]"
            />
            <span className="text-sm font-medium text-stone-700">Show on Homepage Slider</span>
          </label>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-gold-600 hover:bg-gold-700 disabled:opacity-60 rounded-xl transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? "Saving…" : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
