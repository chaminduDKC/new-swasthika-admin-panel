import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, AlertCircle, CheckCircle, Edit3, Image as ImageIcon } from 'lucide-react';
import { categoryService } from '../api/services';

export const CategoryModal = ({ isOpen, onClose, onCreated, onUpdated, category = null }) => {
  const isEditMode = Boolean(category);

  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [type, setType] = useState('primary');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sync state when category changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name || '');
        setSubtitle(category.subtitle || '');
        setType(category.type || 'primary');
        setThumbnailFile(null);
        setThumbnailPreview(category.thumbnail_url || null);
      } else {
        setName('');
        setSubtitle('');
        setType('primary');
        setThumbnailFile(null);
        setThumbnailPreview(null);
      }
      setError('');
      setSuccess('');
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    // If in edit mode, reset to original thumbnail or empty
    setThumbnailPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    if (!isEditMode && !thumbnailFile) {
      setError('Please select a thumbnail image.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('subtitle', subtitle.trim());
    formData.append('type', type);

    // Only attach thumbnail if a new file was selected
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    setLoading(true);
    try {
      if (isEditMode) {
        const res = await categoryService.update(category.id, formData);
        setSuccess('Category updated successfully!');
        if (onUpdated) {
          onUpdated(res.category);
        }
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 800);
      } else {
        const res = await categoryService.create(formData);
        setSuccess('Category created successfully!');
        if (onCreated) {
          onCreated(res.category);
        }
        setTimeout(() => {
          onClose();
          setName('');
          setSubtitle('');
          setType('primary');
          removeThumbnail();
          setSuccess('');
        }, 800);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Failed to ${isEditMode ? 'update' : 'create'} category.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#FCFBF9]">
          <div className="flex items-center gap-2 text-stone-800 font-semibold text-lg">
            {isEditMode ? (
              <>
                <Edit3 className="w-5 h-5 text-gold-600" />
                <span>Edit Category</span>
              </>
            ) : (
              <>
                <span>Create New Category</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 text-sm text-gold-900 bg-gold-50 border border-gold-300 rounded-xl">
              <CheckCircle className="w-4 h-4 shrink-0 text-gold-600" />
              <span>{success}</span>
            </div>
          )}
        
             <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <span>#1 Priority-Primary Categories</span>
              <span>#2 Priority-Secondary Categories</span>
              <span>#3 Priority-Other Categories</span>
            </div>
          

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wedding Floral Arches, Poruwa Decor"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Subtitle / Description
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Elegant romantic floral arrangements for wedding ceremonies"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Category Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all"
            >
              <option value="primary">Primary Category - Show On Top</option>
              <option value="secondary">Secondary Category - After Primary</option>
              <option value="other">Other Decoration - After Secondary</option>
            </select>
          </div>

          {/* Thumbnail File Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Thumbnail Image {isEditMode ? '(Leave unchanged or upload new)' : '*'}
              </label>
              {isEditMode && thumbnailFile && (
                <span className="text-[11px] font-semibold text-gold-700 bg-gold-50 px-2 py-0.5 rounded-md border border-gold-200">
                  New image selected
                </span>
              )}
            </div>

            {thumbnailPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-stone-200 group aspect-video max-h-48 bg-stone-100 flex items-center justify-center">
                <img
                  src={thumbnailPreview}
                  alt="Category preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="px-3 py-1.5 bg-white text-stone-800 text-xs font-semibold rounded-lg shadow-md cursor-pointer hover:bg-stone-50 transition-colors">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-gold-500 rounded-xl p-6 cursor-pointer bg-stone-50/50 hover:bg-gold-50/20 transition-all">
                <div className="p-3 bg-white rounded-full shadow-sm text-gold-600 mb-2 border border-gold-100">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-stone-700">
                  {isEditMode ? 'Click to select a new thumbnail' : 'Click to upload thumbnail'}
                </span>
                <span className="text-xs text-stone-400 mt-1">PNG, JPG, WEBP up to 20MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gold-600 hover:bg-gold-700 active:bg-gold-800 rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isEditMode ? 'Saving Changes...' : 'Creating & Uploading...'}</span>
                </>
              ) : (
                <span>{isEditMode ? 'Save Changes' : 'Save Category'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
