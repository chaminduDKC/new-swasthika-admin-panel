import React from 'react';
import { Menu, UploadCloud, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTour } from '../context/TourContext';

export const Navbar = ({ onOpenSidebar, onOpenPasswordModal }) => {
  const { user } = useAuth();
  const { startTour } = useTour();

  return (
    <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-stone-200/90 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-1 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl md:hidden transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-serif font-bold text-stone-900 tracking-tight">
            ස්වස්තික Floral Decor CMS
          </h1>
          <p className="hidden sm:block text-[11px] text-stone-500">
            Manage decoration categories, homepage sliders, and high-resolution galleries
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Guided Tour Trigger Button */}
        <button
          onClick={startTour}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-semibold text-gold-900 bg-gold-50 hover:bg-gold-100/80 active:bg-gold-200 border border-gold-300 rounded-xl transition-all shadow-2xs"
          title="Start interactive guided walkthrough"
        >
          <span className="hidden sm:inline">Guide Tour</span>
        </button>

        <Link
          to="/upload"
          className="flex items-center gap-2 px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-gold-600 hover:bg-gold-700 active:bg-gold-800 rounded-xl shadow-xs transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          <span className="hidden sm:inline">Upload Images</span>
          <span className="sm:hidden">Upload</span>
        </Link>

        <button
          id="tour-admin-profile"
          onClick={onOpenPasswordModal}
          title="Admin Account Settings"
          className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 text-stone-700 hover:text-stone-900 hover:bg-gold-50 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-gold-100 text-gold-900 flex items-center justify-center font-bold text-xs border border-gold-300">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <span className="hidden md:inline">{user?.username || 'Admin'}</span>
        </button>
      </div>
    </header>
  );
};
