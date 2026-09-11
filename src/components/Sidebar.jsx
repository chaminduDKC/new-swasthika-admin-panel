import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  UploadCloud,
  Image as ImageIcon,
  KeyRound,
  LogOut,
  User,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTour } from '../context/TourContext';
import { Logo } from './Logo';

export const Sidebar = ({ isOpen, onClose, onOpenPasswordModal }) => {
  const { user, logout } = useAuth();
  const { startTour } = useTour();

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard, id: 'tour-nav-overview' },
    { to: '/categories', label: 'Categories', icon: FolderKanban, id: 'tour-nav-categories' },
    { to: '/upload', label: 'Batch Upload', icon: UploadCloud, badge: 'New', id: 'tour-nav-upload' },
    { to: '/gallery', label: 'Decoration Gallery', icon: ImageIcon, id: 'tour-nav-gallery' },
    { to: '/settings', label: 'Profile & Settings', icon: User, id: 'tour-nav-settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-stone-200/90 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with Logo */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-stone-100 bg-[#FCFBF9]">
          <Logo className="h-11 w-11" showText={true} />
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-1 text-[11px] font-bold text-stone-400 uppercase tracking-widest">
            Management
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                id={item.id}
                to={item.to}
                onClick={onClose}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gold-100/70 text-gold-900 font-semibold shadow-xs border border-gold-200/60'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-gold-200/80 text-gold-900">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

               

         
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-stone-100 bg-[#FCFBF9]">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-semibold text-stone-900 truncate">
                {user?.username || 'Administrator'}
              </p>
              <p className="text-[11px] text-stone-500 truncate">
                {user?.email || 'admin@floristdecor.com'}
              </p>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
