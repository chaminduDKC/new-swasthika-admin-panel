import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { categoryService, imageService } from '../api/services';
import { CategoryModal } from '../components/CategoryModal';

export const BatchUpload = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Category State
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Event Details State
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');

  // Selected Images & Previews
  const [selectedImages, setSelectedImages] = useState([]);

  // Upload progress & feedback
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploadResult, setUploadResult] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      setCategoriesLoading(true);
      try {
        const res = await categoryService.getAll();
        if (res.success) {
          setCategories(res.categories || []);
          const queryCatId = searchParams.get('categoryId');
          if (queryCatId) {
            setSelectedCategoryId(queryCatId);
          } else if (res.categories && res.categories.length > 0) {
            setSelectedCategoryId(res.categories[0].id.toString());
          }
        }
      } catch (err) {
        setError('Failed to load categories list. Please refresh the page.');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCats();
  }, [searchParams]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      selectedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [selectedImages]);

  // Handle file input changes
  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9) + Date.now(),
      file,
      previewUrl: URL.createObjectURL(file),
      showOnSlider: false,
      sizeFormatted: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
    }));

    setSelectedImages((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  // Toggle slider flag for an individual image
  const toggleSliderForImage = (id) => {
    setSelectedImages((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, showOnSlider: !item.showOnSlider } : item
      )
    );
  };

  // Bulk slider toggles
  const setAllSliderFlags = (value) => {
    setSelectedImages((prev) =>
      prev.map((item) => ({ ...item, showOnSlider: value }))
    );
  };

  // Remove a single image from preview list
  const removeImage = (id) => {
    setSelectedImages((prev) => {
      const item = prev.find((img) => img.id === id);
      if (item && item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  // Clear all selected images
  const clearAllImages = () => {
    selectedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setSelectedImages([]);
  };

  // Submit Batch Upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUploadResult(null);

    if (!selectedCategoryId) {
      setError('Please select a category. There is no image without a category.');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a decoration title.');
      return;
    }

    if (!place.trim()) {
      setError('Please enter the venue/place.');
      return;
    }

    if (selectedImages.length === 0) {
      setError('Please select at least one image to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('categoryId', selectedCategoryId);
    formData.append('title', title.trim());
    formData.append('place', place.trim());

    const sliderFlags = selectedImages.map((img) => img.showOnSlider);
    formData.append('sliderFlags', JSON.stringify(sliderFlags));

    selectedImages.forEach((img) => {
      formData.append('images', img.file);
    });

    setUploading(true);
    setUploadProgress(0);

    try {
      const res = await imageService.uploadBatch(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      setUploadResult(res);
      clearAllImages();
      setTitle('');
      setPlace('');
    } catch (err) {
      console.error('Batch upload error:', err);
      setError(err.response?.data?.message || err.message || 'Error occurred during batch upload.');
    } finally {
      setUploading(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id.toString() === selectedCategoryId);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          Batch Image Upload
        </h2>
        <p className="text-sm text-stone-500 mt-0.5">
          Select category, event details, and upload multiple high-res images converted to WebP
        </p>
      </div>

      {/* Success Notification */}
      {uploadResult && (
        <div className="p-6 bg-gold-50 border border-gold-300 rounded-3xl shadow-xs space-y-3 animate-fadeIn">
          <div className="flex items-center gap-3 text-gold-950 font-semibold text-base">
            <CheckCircle2 className="w-6 h-6 text-gold-600 shrink-0" />
            <span>{uploadResult.message}</span>
          </div>
          <p className="text-xs text-gold-800">
            Uploaded {uploadResult.uploadedCount} images to category: <strong>{uploadResult.category?.name}</strong>.
            All images converted to WebP with preserved quality.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/gallery?categoryId=${uploadResult.category?.id}`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              <span>View Category Gallery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setUploadResult(null)}
              className="px-3 py-2 text-xs font-medium text-gold-900 hover:bg-gold-100 rounded-xl transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Category Selection */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-800 font-semibold text-sm border-b border-stone-100 pb-3">
            <span className="w-6 h-6 rounded-full bg-gold-100 text-gold-900 border border-gold-300 flex items-center justify-center text-xs font-bold">1</span>
            <span>Select Target Category Or Create One</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Category
              </label>
              {categoriesLoading ? (
                <div className="h-10 px-3 bg-stone-100 rounded-xl flex items-center gap-2 text-stone-400 text-xs animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading categories...</span>
                </div>
              ) : categories.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                  No categories found. Please click &quot;Create New Category&quot; first.
                </div>
              ) : (
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all font-medium text-stone-800"
                >
                  <option value="" disabled>-- Select a category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              )}
            </div>
            

            <div>
              
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gold-50 hover:bg-gold-100 text-gold-900 text-sm font-semibold rounded-xl border border-gold-300 transition-colors"
              >
                <Plus className="w-4 h-4 text-gold-600" />
                <span>Create New Category</span>
              </button>
            </div>
          </div>

          {selectedCategoryObj && (
            <div className="flex items-center gap-3 p-3 bg-gold-50/50 rounded-2xl border border-gold-200/60 text-xs text-stone-600">
              <img
                src={selectedCategoryObj.thumbnail_url}
                alt="thumb"
                className="w-10 h-10 rounded-lg object-cover border border-stone-200"
              />
              <div>
                <span className="font-semibold text-stone-800">{selectedCategoryObj.name}</span>
                <span className="text-stone-400 ml-2">Type: {selectedCategoryObj.type}</span>
                {selectedCategoryObj.subtitle && (
                  <p className="text-[11px] text-stone-500 line-clamp-1">{selectedCategoryObj.subtitle}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Event Details */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-800 font-semibold text-sm border-b border-stone-100 pb-3">
            <span className="w-6 h-6 rounded-full bg-gold-100 text-gold-900 border border-gold-300 flex items-center justify-center text-xs font-bold">2</span>
            <span>Decoration & Venue Details ( These details will apply to all images you upload this time )</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Decoration Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Grand Floral Arch & Crystal Table Centerpiece"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Place / Venue *
              </label>
              <input
                type="text"
                required
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="e.g. Shangri-La Ballroom, Colombo / Outdoor Beach Lawn"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Select Multiple Images */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-800 font-semibold text-sm border-b border-stone-100 pb-3">
            <span className="w-6 h-6 rounded-full bg-gold-100 text-gold-900 border border-gold-300 flex items-center justify-center text-xs font-bold">3</span>
            <span>Select Multiple Decoration Images</span>
          </div>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-gold-500 rounded-2xl p-8 cursor-pointer bg-stone-50/50 hover:bg-gold-50/20 transition-all text-center">
            <div className="p-4 bg-white rounded-2xl shadow-xs text-gold-600 mb-3 border border-gold-100">
              <UploadCloud className="w-8 h-8" />
            </div>
            <span className="text-sm font-semibold text-stone-800">
              Click to select or drag & drop multiple images
            </span>
            <span className="text-xs text-stone-500 mt-1">
              Supports JPEG, PNG, WEBP, AVIF (Batch WebP conversion enabled)
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelection}
              className="hidden"
            />
          </label>
        </div>

        {/* Step 4: Preview List with Show on Slider Checkboxes */}
        {selectedImages.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-stone-800 font-semibold text-sm">
                <span className="w-6 h-6 rounded-full bg-gold-100 text-gold-900 border border-gold-300 flex items-center justify-center text-xs font-bold">4</span>
                <span>Selected Images Preview ({selectedImages.length})</span>
              </div>

              {/* Bulk Slider Controls */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setAllSliderFlags(true)}
                  className="px-2.5 py-1 text-gold-900 bg-gold-100 hover:bg-gold-200 rounded-lg font-medium transition-colors border border-gold-300"
                >
                  Select all for slider
                </button>
                <button
                  type="button"
                  onClick={() => setAllSliderFlags(false)}
                  className="px-2.5 py-1 text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium transition-colors"
                >
                  Deselect all slider
                </button>
                <button
                  type="button"
                  onClick={clearAllImages}
                  className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Preview List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedImages.map((item, index) => (
                <div
                  key={item.id}
                  className={`relative rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                    item.showOnSlider
                      ? 'border-gold-400 bg-gold-50/20 ring-1 ring-gold-400'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-stone-100 overflow-hidden group">
                    <img
                      src={item.previewUrl}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(item.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-lg opacity-80 hover:opacity-100 transition-all shadow-md"
                      title="Remove image from selection"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                      #{index + 1} • {item.sizeFormatted}
                    </span>
                  </div>

                  {/* Card Content & Slider Checkbox */}
                  <div className="p-3 bg-white">
                    <p className="text-xs text-stone-700 font-medium truncate mb-2" title={item.file.name}>
                      {item.file.name}
                    </p>

                    <label
                      htmlFor={`slider-checkbox-${item.id}`}
                      className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer border select-none transition-all ${
                        item.showOnSlider
                          ? 'border-gold-300 bg-gold-50/80 text-gold-900'
                          : 'border-stone-200 bg-stone-50/50 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={`slider-checkbox-${item.id}`}
                        checked={item.showOnSlider}
                        onChange={() => toggleSliderForImage(item.id)}
                        className="w-4 h-4 text-gold-600 rounded border-stone-300 focus:ring-gold-500 cursor-pointer accent-[#9E7244]"
                      />
                      <span className="text-xs font-semibold cursor-pointer">
                        Show on Slider {item.showOnSlider ? '✓' : ''}
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Upload Progress & Submit */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-stone-700">
                <span>Converting to WebP & streaming to Cloudinary...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-500 to-gold-700 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-500">
              {selectedImages.length > 0 ? (
                <span>
                  Ready to process <strong>{selectedImages.length} images</strong> (
                  {selectedImages.filter((i) => i.showOnSlider).length} selected for slider)
                </span>
              ) : (
                <span>Select a category, enter details and choose images above</span>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading || selectedImages.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold-600 hover:bg-gold-700 active:bg-gold-800 text-white text-sm font-semibold rounded-2xl shadow-md shadow-gold-700/20 transition-all disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading & Processing...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload {selectedImages.length} Images</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Quick Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCreated={(newCat) => {
          setCategories((prev) => [newCat, ...prev]);
          setSelectedCategoryId(newCat.id.toString());
        }}
      />
    </div>
  );
};
