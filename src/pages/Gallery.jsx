import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Image as ImageIcon,
  Search,
  Sliders,
  Trash2,
  Edit2,
  MapPin,
  Loader2,
  AlertCircle,
  ExternalLink,
  X,
  UploadCloud,
} from 'lucide-react';
import { imageService, categoryService } from '../api/services';
import { LazyImage } from '../components/LazyImage';
import { Pagination } from '../components/Pagination';
import { ImageEditModal } from '../components/ImageEditModal';

export const Gallery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const galleryTopRef = useRef(null);

  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || 'all');
  const [sliderFilter, setSliderFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Lightbox & Actions State
  const [activeImage, setActiveImage] = useState(null);
  const [editingImage, setEditingImage] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch categories once on mount
  useEffect(() => {
    categoryService.getAll().then((res) => {
      if (res.success) setCategories(res.categories || []);
    }).catch(() => {});
  }, []);

  // Fetch images when page, limit, or filters change
  const fetchImages = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit,
      };
      if (selectedCategory !== 'all') params.categoryId = selectedCategory;
      if (sliderFilter === 'slider') params.sliderOnly = 'true';
      if (search.trim()) params.search = search.trim();

      const res = await imageService.getAll(params);
      if (res.success) {
        setImages(res.images || []);
        setTotalItems(res.total || 0);
        setTotalPages(res.totalPages || Math.ceil((res.total || 0) / limit) || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch images.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [page, limit, selectedCategory, sliderFilter, search]);

  // Handle filter changes (resets to page 1)
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setPage(1);
    if (catId === 'all') {
      searchParams.delete('categoryId');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ categoryId: catId });
    }
  };

  const handleSliderFilterChange = (filter) => {
    setSliderFilter(filter);
    setPage(1);
  };

  const handleSearchChange = (query) => {
    setSearch(query);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (galleryTopRef.current) {
      galleryTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  // Toggle slider status for single image
  const handleToggleSlider = async (id, e) => {
    e.stopPropagation();
    setTogglingId(id);
    try {
      const res = await imageService.toggleSlider(id);
      if (res.success && res.image) {
        setImages((prev) =>
          prev.map((img) => (img.id === id ? { ...img, show_on_slider: res.image.show_on_slider } : img))
        );
        if (activeImage && activeImage.id === id) {
          setActiveImage((prev) => ({ ...prev, show_on_slider: res.image.show_on_slider }));
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle slider status');
    } finally {
      setTogglingId(null);
    }
  };

  // Delete image
  const handleDeleteImage = async (id, title, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await imageService.delete(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
      setTotalItems((prev) => Math.max(0, prev - 1));
      if (activeImage && activeImage.id === id) {
        setActiveImage(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  // Update image metadata from edit modal
  const handleUpdateImage = (updatedImg) => {
    setImages((prev) =>
      prev.map((img) => (img.id === updatedImg.id ? { ...img, ...updatedImg } : img))
    );
    if (activeImage && activeImage.id === updatedImg.id) {
      setActiveImage((prev) => ({ ...prev, ...updatedImg }));
    }
  };

  return (
    <div ref={galleryTopRef} className="space-y-6 scroll-mt-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Decoration Gallery
          </h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Browse, manage slider showcases, and organize uploaded floral designs
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gold-600 hover:bg-gold-700 active:bg-gold-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Batch Upload Images</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by title or venue..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none text-stone-700"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={sliderFilter}
            onChange={(e) => handleSliderFilterChange(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none text-stone-700"
          >
            <option value="all">All Images</option>
            <option value="slider">Slider Only</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state indicator */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-gold-600 animate-spin" />
          <p className="text-sm text-stone-500">Loading decoration photos...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-stone-800">No images found</h3>
          <p className="text-xs text-stone-500 mt-1 mb-5">
            {search || selectedCategory !== 'all' || sliderFilter !== 'all'
              ? 'Try adjusting your search filters.'
              : 'Upload decoration images to your categories to populate the gallery.'}
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Images Now</span>
          </button>
        </div>
      ) : (
        /* Image Grid with Lazy Loading */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {images.map((img) => (
              <div
                key={img.id}
                onClick={() => setActiveImage(img)}
                className="group bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                {/* Lazy Loaded Image Container */}
                <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
                  <LazyImage
                    src={img.image_url}
                    alt={img.title}
                    className="group-hover:scale-105"
                  />

                  {/* Slider Badge / Quick Button */}
                  <button
                    onClick={(e) => handleToggleSlider(img.id, e)}
                    disabled={togglingId === img.id}
                    title="Toggle Slider Presence"
                    className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 backdrop-blur-xs ${
                      img.show_on_slider
                        ? 'bg-amber-500 text-white'
                        : 'bg-black/50 hover:bg-black/70 text-white/90'
                    }`}
                  >
                    {togglingId === img.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sliders className="w-3.5 h-3.5" />
                    )}
                    <span>{img.show_on_slider ? 'In Slider' : 'Add to Slider'}</span>
                  </button>

                  {/* Edit + Delete buttons (top-right, appear on hover) */}
                  <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingImage(img); }}
                      title="Edit image"
                      className="p-1.5 bg-black/50 hover:bg-gold-600 text-white rounded-lg shadow-xs transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteImage(img.id, img.title, e)}
                      disabled={deletingId === img.id}
                      title="Delete image"
                      className="p-1.5 bg-black/50 hover:bg-red-600 text-white rounded-lg shadow-xs transition-colors disabled:opacity-50"
                    >
                      {deletingId === img.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Meta */}
                <div className="p-3.5 space-y-1.5">
                  <h4 className="font-semibold text-stone-900 text-sm truncate" title={img.title}>
                    {img.title}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs text-stone-500 truncate" title={img.place}>
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                    <span className="truncate">{img.place}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] text-stone-400">
                    <span className="truncate font-medium text-gold-900 bg-gold-50 border border-gold-200 px-1.5 py-0.5 rounded">
                      {img.category_name}
                    </span>
                    <span>{new Date(img.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </div>
      )}

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Image Preview */}
            <div className="flex-1 bg-stone-900 flex items-center justify-center p-4 min-h-[300px]">
              <img
                src={activeImage.image_url}
                alt={activeImage.title}
                className="max-w-full max-h-[75vh] object-contain rounded-xl"
              />
            </div>

            {/* Sidebar Details */}
            <div className="w-full md:w-80 p-6 flex flex-col justify-between bg-white border-t md:border-t-0 md:border-l border-stone-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-900 bg-gold-100 border border-gold-300 px-2 py-1 rounded-md">
                    {activeImage.category_name}
                  </span>
                  <button
                    onClick={() => setActiveImage(null)}
                    className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-stone-900">{activeImage.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{activeImage.place}</span>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Slider Status:</span>
                    <strong className={activeImage.show_on_slider ? 'text-amber-600' : 'text-stone-500'}>
                      {activeImage.show_on_slider ? 'Active on Slider' : 'Not in Slider'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span>{new Date(activeImage.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 space-y-2">
                <button
                  onClick={(e) => handleToggleSlider(activeImage.id, e)}
                  disabled={togglingId === activeImage.id}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    activeImage.show_on_slider
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                      : 'bg-gold-600 hover:bg-gold-700 active:bg-gold-800 text-white'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>
                    {activeImage.show_on_slider ? 'Remove from Slider' : 'Feature in Slider'}
                  </span>
                </button>

                <button
                  onClick={() => { setEditingImage(activeImage); setActiveImage(null); }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-gold-800 hover:bg-gold-50 rounded-xl border border-gold-300 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                <a
                  href={activeImage.image_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Size WebP</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Edit Modal */}
      <ImageEditModal
        isOpen={Boolean(editingImage)}
        onClose={() => setEditingImage(null)}
        image={editingImage}
        onUpdated={handleUpdateImage}
      />
    </div>
  );
};
