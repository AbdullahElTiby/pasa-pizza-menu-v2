
import React from 'react';
import { MenuItem, Language, Variant } from '../types';
import { Plus, ShoppingBag } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  language: Language;
  categoryLabel: string;
  currency: string;
  onAddToCart?: (item: MenuItem, variantName?: string, variantPrice?: number) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, language, categoryLabel, currency, onAddToCart }) => {
  const isRTL = language === 'ar';

  const getName = () => {
    if (language === 'ar' && item.nameAr) return item.nameAr;
    if (language === 'tr' && item.nameTr) return item.nameTr;
    return item.name;
  };

  const getDescription = () => {
    if (language === 'ar' && item.descriptionAr) return item.descriptionAr;
    if (language === 'tr' && item.descriptionTr) return item.descriptionTr;
    return item.description;
  };

  const getVariantName = (variant: Variant) => {
    if (language === 'ar' && variant.nameAr) return variant.nameAr;
    if (language === 'tr' && variant.nameTr) return variant.nameTr;
    return variant.name;
  };

  // Calculate display price: use discount if available, otherwise price. 
  // If price is 0 (variant-based item), find the lowest price from variants.
  let displayPrice = item.discountPrice || item.price;
  if (displayPrice === 0 && item.variants && item.variants.length > 0) {
    const prices = item.variants.map(v => v.price).filter(p => p > 0);
    if (prices.length > 0) {
      displayPrice = Math.min(...prices);
    }
  }

  return (
    <div className="bg-white dark:bg-charcoal-900 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(60,30,20,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] flex flex-col h-full border border-cream-200/50 dark:border-charcoal-800 card-lift">
      {/* Image Area */}
      <div className="h-48 sm:h-60 overflow-hidden relative">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={getName()}
            className="w-full h-full object-cover img-zoom"
          />
        ) : (
          <div className="w-full h-full bg-cream-100 dark:bg-charcoal-800 flex items-center justify-center text-cream-500 dark:text-cream-700">
            <span className="text-xs uppercase font-bold tracking-widest">Pasa Pizzeria</span>
          </div>
        )}
        {item.isPopular && (
          <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} bg-brand-600 text-cream-50 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg z-10 animate-pulse`}>
            {language === 'ar' ? 'مميز' : (language === 'tr' ? 'POPÜLER' : 'POPULAR')}
          </div>
        )}
        {item.discountPrice && (
          <div className={`absolute bottom-4 ${isRTL ? 'left-4' : 'right-4'} bg-olive-500 text-cream-50 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-md z-10`}>
            OFFER
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-grow text-charcoal-900 dark:text-cream-100" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-serif text-[22px] font-bold leading-tight flex-grow text-charcoal-900 dark:text-cream-50">{getName()}</h3>
          <div className={`${isRTL ? 'text-left mr-4' : 'text-right ml-4'} shrink-0`}>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-charcoal-400 dark:text-cream-600 uppercase leading-none mb-1 tracking-wider">
                {language === 'ar' ? 'يبدأ من' : (language === 'tr' ? 'Şu fiyattan' : 'Starting at')}
              </span>
              <div className="flex items-center">
                <span className="text-brand-600 font-bold text-2xl leading-none" dir="ltr">{displayPrice.toFixed(2)} {currency}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-charcoal-500 dark:text-cream-400 text-sm mb-6 font-normal leading-relaxed line-clamp-2">
          {getDescription()}
        </p>

        {/* Variants Area */}
        {item.variants && item.variants.length > 0 && (
          <div className="mt-auto pt-4 border-t border-cream-200/50 dark:border-charcoal-800">
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-bold text-charcoal-400 dark:text-cream-600 uppercase tracking-widest mb-2 sm:mb-3">
              <span>{language === 'ar' ? 'الخيارات' : (language === 'tr' ? 'Seçenekler' : 'Options')}</span>
            </div>

            <div className="space-y-2 sm:space-y-2">
              {item.variants.map((variant, idx) => (
                <div key={idx} className="p-3 sm:p-3 bg-cream-50 dark:bg-charcoal-800 rounded-xl border border-cream-200/40 dark:border-charcoal-700 flex items-center justify-between group">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-4 h-4 sm:w-4 sm:h-4 rounded-full border-2 border-brand-500 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                    </div>
                    <span className="text-xs sm:text-[11px] font-bold text-charcoal-700 dark:text-cream-300 uppercase truncate">{getVariantName(variant)}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <span className="text-xs sm:text-[11px] font-bold text-charcoal-500 dark:text-cream-500" dir="ltr">
                      {variant.price > 0 ? `${variant.price.toFixed(0)} ${currency}` : ''}
                    </span>
                    {onAddToCart && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(item, variant.name, variant.price);
                        }}
                        className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-white dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-700 text-charcoal-500 dark:text-cream-500 hover:text-brand-600 hover:border-brand-500 active:bg-brand-50 flex items-center justify-center transition-all shadow-sm"
                      >
                        <Plus size={16} className="sm:hidden" />
                        <Plus size={14} className="hidden sm:block" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart Button (No Variants) */}
        {(!item.variants || item.variants.length === 0) && onAddToCart && (
          <button
            onClick={() => onAddToCart(item)}
            className="mt-auto w-full py-3 bg-charcoal-900 dark:bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-600 dark:hover:bg-brand-700 transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-md btn-press"
          >
            <ShoppingBag size={16} />
            <span>
              {language === 'ar' ? 'أضف للسلة' : (language === 'tr' ? 'Sepete Ekle' : 'Add to Cart')}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
