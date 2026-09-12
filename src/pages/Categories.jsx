import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  ArrowUpDown,
} from 'lucide-react';
import { categoryService } from '../api/services';
import { CategoryModal } from '../components/CategoryModal';
import { CategoryReorderModal } from '../components/CategoryReorderModal';
import { LazyImage } from '../components/LazyImage';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  const handleOrderUpdated = (type, updatedCollection) => {
    setCategories((prev) => {
      const updatedMap = new Map(updatedCollection.map((c) => [c.id, c.display_order]));
      const next = prev.map((c) => {
        if (updatedMap.has(c.id)) {
          return { ...c, display_order: updatedMap.get(c.id) };
        }
        return c;
      });
      return [...next].sort((a, b) => {
        const orderDiff = (a.display_order ?? 0) - (b.display_order ?? 0);
        if (orderDiff !== 0) return orderDiff;
        return new Date(b.created_at) - new Date(a.created_at);
      });
    });
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setIsCreateModalOpen(true);
  };

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await categoryService.getAll();
      if (res.success) {
        setCategories(res.categories || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"? This will also remove all associated decoration images!`)) {
      return;
    }

    setDeletingId(id);
    try {
      await categoryService.delete(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      (cat.subtitle && cat.subtitle.toLowerCase().includes(search.toLowerCase()));
    const matchesType = selectedType === 'all' || cat.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Categories Management
          </h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Organize floral decorations into primary, secondary, and featured slider groups
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsReorderModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 text-sm font-semibold rounded-xl border border-stone-200 shadow-xs transition-colors"
          >
            <ArrowUpDown className="w-4 h-4 text-gold-600" />
            <span>Reorder Categories</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gold-600 hover:bg-gold-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Category</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category by name..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500/20 focus:border-gold-600 outline-none text-stone-700"
          >
            <option value="all">All Types</option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="other">Other</option>
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

      {/* Loading state */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-gold-600 animate-spin" />
          <p className="text-sm text-stone-500">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-stone-800">No categories found</h3>
          <p className="text-xs text-stone-500 mt-1 mb-5">
            {search || selectedType !== 'all'
              ? 'Try adjusting your search filters.'
              : 'Create your first decoration category to get started.'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Category</span>
          </button>
        </div>
      ) : (
        /* Categories Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full bg-stone-100 overflow-hidden group">
                <LazyImage
                  src={cat.thumbnail_url}
                  alt={cat.name}
                  className="group-hover:scale-105"
                />

                {/* Type & Order Badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      cat.type === 'primary'
                        ? 'bg-[#825B34] text-white backdrop-blur-xs'
                        : cat.type === 'secondary'
                        ? 'bg-[#9E7244] text-white backdrop-blur-xs'
                        : 'bg-stone-700/90 text-white backdrop-blur-xs'
                    }`}
                  >
                    {cat.type}
                  </span>

                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/70 text-gold-300 border border-gold-500/30 backdrop-blur-xs shadow-xs">
                    #{cat.display_order ?? 1}
                  </span>
                </div>

                {/* Image Count Tag */}
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-black/60 text-white backdrop-blur-xs flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{cat.image_count || 0} images</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-stone-900 text-base leading-snug line-clamp-1">
                    {cat.name}
                  </h3>
                  {cat.subtitle && (
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      {cat.subtitle}
                    </p>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/upload?categoryId=${cat.id}`)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-900 hover:text-gold-950 bg-gold-100 hover:bg-gold-200 px-2.5 py-1.5 rounded-lg transition-colors border border-gold-200"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-gold-700" />
                    <span>Upload Images</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/gallery?categoryId=${cat.id}`)}
                      title="View category images"
                      className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      title="Edit category"
                      className="p-1.5 text-stone-500 hover:text-gold-700 hover:bg-gold-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      disabled={deletingId === cat.id}
                      title="Delete category"
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === cat.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Category Modal */}
      <CategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setEditingCategory(null); }}
        category={editingCategory}
        onCreated={(newCat) => {
          setCategories((prev) => [newCat, ...prev]);
        }}
        onUpdated={(updatedCat) => {
          setCategories((prev) =>
            prev.map((c) => (c.id === updatedCat.id ? { ...updatedCat, image_count: c.image_count } : c))
          );
        }}
      />

      {/* Category Reorder Modal */}
      <CategoryReorderModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        allCategories={categories}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
};
