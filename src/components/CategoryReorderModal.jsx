import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { categoryService } from '../api/services';

export const CategoryReorderModal = ({ isOpen, onClose, allCategories, onOrderUpdated }) => {
  const [activeTab, setActiveTab] = useState('secondary'); // default to secondary as requested
  const [itemsByTab, setItemsByTab] = useState({
    primary: [],
    secondary: [],
    other: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Group categories whenever allCategories or isOpen changes
  useEffect(() => {
    if (isOpen) {
      const primary = allCategories
        .filter((c) => c.type === 'primary')
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
      const secondary = allCategories
        .filter((c) => c.type === 'secondary')
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
      const other = allCategories
        .filter((c) => c.type === 'other')
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

      setItemsByTab({ primary, secondary, other });
      setHasChanges(false);
      setSaveSuccess(false);
    }
  }, [isOpen, allCategories]);

  if (!isOpen) return null;

  const currentList = itemsByTab[activeTab] || [];

  // Move item up or down
  const moveItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;

    const newList = [...currentList];
    const [moved] = newList.splice(index, 1);
    newList.splice(targetIndex, 0, moved);

    setItemsByTab((prev) => ({
      ...prev,
      [activeTab]: newList,
    }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newList = [...currentList];
    const [moved] = newList.splice(draggedIndex, 1);
    newList.splice(targetIndex, 0, moved);

    setItemsByTab((prev) => ({
      ...prev,
      [activeTab]: newList,
    }));
    setDraggedIndex(null);
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Save current order
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Collect IDs for the active tab in their new sequence
      const categoryIds = currentList.map((c) => c.id);
      await categoryService.reorder(categoryIds);

      // Update local parent categories with updated display_order
      const updatedListWithOrders = currentList.map((c, i) => ({
        ...c,
        display_order: i + 1,
      }));

      onOrderUpdated(activeTab, updatedListWithOrders);
      setSaveSuccess(true);
      setHasChanges(false);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save category order.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { key: 'secondary', label: 'Secondary Decorations', count: itemsByTab.secondary.length },
    { key: 'primary', label: 'Primary Collections', count: itemsByTab.primary.length },
    { key: 'other', label: 'Other Specialities', count: itemsByTab.other.length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-100/70 text-gold-700 flex items-center justify-center">
              <ArrowUpDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                Customize Category Order
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Set the exact sequence in which categories appear on your website
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collection Type Tabs */}
        <div className="px-6 pt-4 border-b border-stone-100 flex items-center gap-2 overflow-x-auto scrollbar-none bg-stone-50/30">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSaveSuccess(false);
                }}
                className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-gold-600 text-gold-800'
                    : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-gold-100 text-gold-800' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content / Reorder List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-2.5">
          {currentList.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <p className="text-sm">No categories found in this collection.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-1 pb-1 flex justify-between">
                <span>Display Order on Website</span>
                <span>Actions</span>
              </div>

              {currentList.map((cat, index) => {
                const isFirst = index === 0;
                const isLast = index === currentList.length - 1;
                const isDragging = draggedIndex === index;

                return (
                  <div
                    key={cat.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all select-none ${
                      isDragging
                        ? 'opacity-40 border-dashed border-gold-400 bg-gold-50/50'
                        : 'bg-white border-stone-200/90 hover:border-gold-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Left: Drag Handle & Rank Badge & Thumbnail & Title */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Drag grip */}
                      <div className="cursor-grab active:cursor-grabbing text-stone-400 hover:text-stone-700 p-1">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Rank Position Badge */}
                      <div className="w-7 h-7 shrink-0 rounded-xl bg-gold-50 border border-gold-200 text-gold-800 font-bold text-xs flex items-center justify-center">
                        #{index + 1}
                      </div>

                      {/* Thumbnail */}
                      <img
                        src={cat.thumbnail_url}
                        alt={cat.name}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200/80 shrink-0 bg-stone-100"
                      />

                      {/* Info */}
                      <div className="min-w-0">
                        <h4 className="font-semibold text-stone-900 text-sm truncate">
                          {cat.name}
                        </h4>
                        {cat.subtitle && (
                          <p className="text-xs text-stone-400 truncate mt-0.5">
                            {cat.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Up / Down arrow buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <button
                        type="button"
                        onClick={() => moveItem(index, -1)}
                        disabled={isFirst}
                        title="Move Up"
                        className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-gold-50 hover:text-gold-700 hover:border-gold-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveItem(index, 1)}
                        disabled={isLast}
                        title="Move Down"
                        className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-gold-50 hover:text-gold-700 hover:border-gold-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <div className="text-xs">
            {saveSuccess ? (
              <span className="text-emerald-700 font-semibold inline-flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Order saved & live on website!
              </span>
            ) : hasChanges ? (
              <span className="text-amber-700 font-medium inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Unsaved changes in {activeTab} collection
              </span>
            ) : (
              <span className="text-stone-400">Drag items or use arrow buttons to arrange</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-gold-600 hover:bg-gold-700 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-xs transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Order...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
