import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Plus,
  Layers,
} from 'lucide-react';
import { categoryService, imageService } from '../api/services';
import { CategoryModal } from '../components/CategoryModal';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalImages: 0,
    sliderImages: 0,
  });
  const [recentImages, setRecentImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [catRes, imgRes, sliderImgRes] = await Promise.all([
          categoryService.getAll(),
          imageService.getAll({ limit: 8 }),
          imageService.getAll({ sliderOnly: 'true' }),
        ]);

        const cats = catRes.categories || [];
        const imgs = imgRes.images || [];

        setCategories(cats);
        setRecentImages(imgs);

        setStats({
          totalCategories: cats.length,
          totalImages: imgRes.total || imgs.length,
          sliderImages: sliderImgRes.total || (sliderImgRes.images ? sliderImgRes.images.length : 0),
        });
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-[#392817] to-[#251A0E] p-6 sm:p-8 text-white shadow-lg border border-gold-900/30">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/30 backdrop-blur-md text-xs font-semibold text-gold-300">
            <span>Floral & Event Decor CMS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            ස්වස්තික Floral Decor
          </h2>
          

          <div className="flex flex-wrap gap-3 pt-3">
            <button
              id="tour-btn-batch-upload"
              onClick={() => navigate('/upload')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-stone-950 text-xs font-bold rounded-xl transition-all shadow-md"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Batch Upload Images</span>
            </button>
            <button
              id="tour-btn-new-category"
              onClick={() => setIsCategoryModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-xs transition-all border border-white/10"
            >
              <Plus className="w-4 h-4" />
              <span>New Category</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-gold-600/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div id="tour-kpi-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Categories</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-1">{stats.totalCategories}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gold-50 text-gold-700 flex items-center justify-center border border-gold-200">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Decoration Photos</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-1">{stats.totalImages}</h3>
            <p className="text-[11px] text-gold-700 mt-0.5 font-medium">WebP Optimized & Cloudinary</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gold-50 text-gold-700 flex items-center justify-center border border-gold-200">
            <ImageIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Slider Photos</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-1">{stats.sliderImages}</h3>
            <p className="text-[11px] text-stone-400 mt-0.5">Individual photos on slider</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Categories Showcase */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">Decoration Categories</h3>
            <p className="text-xs text-stone-500">Overview of primary, secondary and slider categories</p>
          </div>
          <button
            onClick={() => navigate('/categories')}
            className="text-xs font-semibold text-gold-800 hover:text-gold-900 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-xs">
            No categories created yet. Click "+ New Category" to create one.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.slice(0, 4).map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/gallery?categoryId=${c.id}`)}
                className="group relative rounded-2xl overflow-hidden aspect-video bg-stone-100 border border-stone-200 cursor-pointer shadow-2xs hover:shadow-md transition-all"
              >
                <img
                  src={c.thumbnail_url}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 flex flex-col justify-end">
                  <h4 className="text-white text-xs font-bold leading-tight line-clamp-1">{c.name}</h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-300 mt-0.5">
                    <span className="capitalize">{c.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Uploads Grid */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">Recently Uploaded Decoration Photos</h3>
            <p className="text-xs text-stone-500">Latest wedding & event decoration images</p>
          </div>
          <button
            onClick={() => navigate('/gallery')}
            className="text-xs font-semibold text-gold-800 hover:text-gold-900 flex items-center gap-1"
          >
            <span>Full Gallery</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentImages.length === 0 ? (
          <div className="text-center py-10 text-stone-400 text-xs">
            No decoration photos uploaded yet. Use the Batch Uploader to add your first photos!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentImages.map((img) => (
              <div
                key={img.id}
                onClick={() => navigate(`/gallery?categoryId=${img.category_id}`)}
                className="group relative rounded-2xl overflow-hidden aspect-square bg-stone-100 border border-stone-200 cursor-pointer"
              >
                <img
                  src={img.image_url}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-2.5 flex flex-col justify-end opacity-90 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-semibold truncate">{img.title}</span>
                  <span className="text-stone-300 text-[10px] truncate">{img.place}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Creation Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCreated={(newCat) => {
          setCategories((prev) => [newCat, ...prev]);
          setStats((prev) => ({
            ...prev,
            totalCategories: prev.totalCategories + 1,
          }));
        }}
      />
    </div>
  );
};
