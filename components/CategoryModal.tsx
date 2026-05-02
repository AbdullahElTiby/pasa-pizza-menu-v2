import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Category } from '../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  existingCategories: Category[];
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, existingCategories }) => {
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nameTr, setNameTr] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (existingCategories.some(c => c.id.toLowerCase() === name.trim().toLowerCase())) {
      alert("Category already exists!");
      return;
    }

    onSave({
      id: crypto.randomUUID(),
      name: name.trim(),
      nameAr: nameAr.trim() || undefined,
      nameTr: nameTr.trim() || undefined
    });

    // Reset fields
    setName('');
    setNameAr('');
    setNameTr('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-charcoal-950/70 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-cream-50 dark:bg-charcoal-900 rounded-2xl shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden modal-panel">
        <div className="p-5 sm:p-6">
          <div className="flex justify-between items-center mb-5 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-charcoal-800 dark:text-cream-100">New Category</h2>
            <button onClick={onClose} className="text-charcoal-400 dark:text-cream-500 hover:text-charcoal-600 dark:hover:text-cream-300 transition-colors p-1.5 hover:bg-cream-100 dark:hover:bg-charcoal-800 rounded-full">
              <X size={22} className="sm:hidden" />
              <X size={24} className="hidden sm:block" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-cream-400 mb-1.5">Name (English/ID)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-cream-300 dark:border-charcoal-700 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-base bg-cream-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100"
                placeholder="e.g. Seafood"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-cream-400 mb-1.5">Arabic Name</label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-cream-300 dark:border-charcoal-700 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-right text-base bg-cream-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100"
                placeholder="e.g. مأكولات بحرية"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-cream-400 mb-1.5">Turkish Name</label>
              <input
                type="text"
                value={nameTr}
                onChange={(e) => setNameTr(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-cream-300 dark:border-charcoal-700 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-base bg-cream-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100"
                placeholder="e.g. Deniz Ürünleri"
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium py-3.5 sm:py-3 px-6 rounded-xl shadow-lg mt-4 transition-all text-sm sm:text-base btn-press"
            >
              Create Category
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};