import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem, Language } from '../types';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    currency: string;
    onUpdateQuantity: (id: string, delta: number) => void;
    onRemoveItem: (id: string) => void;
    language: Language;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
    isOpen,
    onClose,
    cartItems,
    currency,
    onUpdateQuantity,
    onRemoveItem,
    language
}) => {
    const isRTL = language === 'ar';

    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-charcoal-950/40 z-[100] backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer - Full width on mobile, max-w-md on larger screens */}
            <div className={`fixed inset-y-0 ${isRTL ? 'left-0' : 'right-0'} w-full sm:max-w-md bg-white dark:bg-charcoal-900 z-[101] shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : (isRTL ? '-translate-x-full' : 'translate-x-full')}`}>

                {/* Header - Better mobile padding */}
                <div className="p-4 sm:p-5 border-b border-cream-200/60 dark:border-charcoal-700 flex items-center justify-between bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-cream-100">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <ShoppingBag className="text-brand-600" size={22} />
                        <h2 className="text-lg sm:text-xl font-bold font-serif">
                            {language === 'ar' ? 'سلة المشتريات' : (language === 'tr' ? 'Sepetim' : 'Your Cart')}
                        </h2>
                        <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full text-xs font-bold">
                            {cartItems.length}
                        </span>
                    </div>
                    {/* Larger close button for mobile */}
                    <button onClick={onClose} className="p-2.5 sm:p-2 hover:bg-cream-100 rounded-full transition-colors text-charcoal-400 hover:text-charcoal-700 -mr-1">
                        <X size={24} />
                    </button>
                </div>

                {/* Items List - Better mobile spacing */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-charcoal-400 dark:text-cream-600 space-y-4 pb-20 px-4">
                            <ShoppingBag size={56} className="opacity-20" />
                            <p className="text-base sm:text-lg font-medium text-center">
                                {language === 'ar' ? 'السلة فارغة' : (language === 'tr' ? 'Sepetiniz boş' : 'Your cart is empty')}
                            </p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-cream-100 dark:bg-charcoal-800 hover:bg-cream-200 dark:hover:bg-charcoal-700 text-charcoal-600 dark:text-cream-300 rounded-full text-sm font-bold transition-colors"
                            >
                                {language === 'ar' ? 'تصفح القائمة' : (language === 'tr' ? 'Menüye Göz At' : 'Browse Menu')}
                            </button>
                        </div>
                    ) : (
                        cartItems.map((item) => {
                            // Get localized name based on language
                            const getItemName = () => {
                                if (language === 'ar' && item.nameAr) return item.nameAr;
                                if (language === 'tr' && item.nameTr) return item.nameTr;
                                return item.name;
                            };
                            const getVariantName = () => {
                                if (language === 'ar' && item.variantNameAr) return item.variantNameAr;
                                if (language === 'tr' && item.variantNameTr) return item.variantNameTr;
                                return item.variantName;
                            };

                            return (
                                <div key={item.id} className="p-3 sm:p-4 bg-cream-100 dark:bg-charcoal-800 rounded-xl border border-cream-200/60 dark:border-charcoal-700">
                                    {/* Cart Item - Row layout with image */}
                                    <div className="flex gap-3">
                                        {/* Item Image */}
                                        {item.imageUrl && (
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-cream-200 dark:bg-charcoal-700">
                                                <img
                                                    src={item.imageUrl}
                                                    alt={getItemName()}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        {/* Item Info */}
                                        <div className="flex-1 text-charcoal-900 dark:text-cream-100 min-w-0">
                                            <h3 className="font-bold text-sm sm:text-base text-charcoal-800 dark:text-cream-100 truncate">{getItemName()}</h3>
                                            {item.variantName && (
                                                <div className="text-xs sm:text-sm text-charcoal-500 dark:text-cream-500 font-medium mt-0.5">
                                                    {getVariantName()}
                                                </div>
                                            )}
                                            <div className="text-brand-600 font-bold text-sm sm:text-base mt-1" dir="ltr">
                                                {item.price.toFixed(2)} {currency}
                                            </div>
                                        </div>

                                        {/* Controls - Vertical layout */}
                                        <div className="flex flex-col items-end gap-2 text-charcoal-900">
                                            {/* Quantity Controls - Larger touch targets */}
                                            <div className="flex items-center bg-cream-50 dark:bg-charcoal-900 rounded-xl border border-cream-300 dark:border-charcoal-700 shadow-sm overflow-hidden">
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, -1)}
                                                    className="p-2.5 sm:p-2 px-3 sm:px-2.5 hover:bg-cream-100 dark:hover:bg-charcoal-800 text-charcoal-500 dark:text-cream-500 hover:text-red-500 transition-colors active:bg-cream-200"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-10 sm:w-8 text-center text-sm font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, 1)}
                                                    className="p-2.5 sm:p-2 px-3 sm:px-2.5 hover:bg-cream-100 dark:hover:bg-charcoal-800 text-charcoal-500 dark:text-cream-500 hover:text-green-600 transition-colors active:bg-cream-200"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            {/* Delete Button - Larger touch target */}
                                            <button
                                                onClick={() => onRemoveItem(item.id)}
                                                className="text-charcoal-400 hover:text-red-500 transition-colors bg-cream-50 dark:bg-charcoal-900 p-2.5 sm:p-2 rounded-lg border border-cream-300 dark:border-charcoal-700 hover:border-red-200 hover:shadow-sm active:bg-red-50"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer / Total - Safe area padding for mobile */}
                {cartItems.length > 0 && (
                    <div className="p-4 sm:p-5 pb-6 sm:pb-5 bg-white dark:bg-charcoal-900 border-t border-cream-200/60 dark:border-charcoal-700 shadow-[0_-4px_20px_rgba(60,30,20,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] z-10 text-charcoal-900 dark:text-cream-100">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-charcoal-500 dark:text-cream-500 font-medium text-sm sm:text-base">
                                {language === 'ar' ? 'المجموع' : (language === 'tr' ? 'Toplam' : 'Total')}
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-charcoal-900 dark:text-cream-50" dir="ltr">
                                {totalPrice.toFixed(2)} {currency}
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                const phoneNumber = '905398235422';

                                // Get localized labels
                                const orderTitle = language === 'ar' ? '*طلب جديد من القائمة:*' : (language === 'tr' ? '*Yeni Sipariş:*' : '*New Order:*');
                                const totalLabel = language === 'ar' ? 'المجموع' : (language === 'tr' ? 'Toplam' : 'Total');

                                let message = `${orderTitle}\n\n`;

                                cartItems.forEach(item => {
                                    // Get localized item name
                                    const itemName = language === 'ar' && item.nameAr ? item.nameAr :
                                        (language === 'tr' && item.nameTr ? item.nameTr : item.name);

                                    // Get localized variant name
                                    const variantName = language === 'ar' && item.variantNameAr ? item.variantNameAr :
                                        (language === 'tr' && item.variantNameTr ? item.variantNameTr : item.variantName);

                                    message += `• ${item.quantity}x ${itemName}`;
                                    if (variantName) message += ` (${variantName})`;
                                    message += ` - ${item.price.toFixed(2)} ${currency}\n`;
                                });

                                message += `\n*${totalLabel}: ${totalPrice.toFixed(2)} ${currency}*`;

                                const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                                window.open(url, '_blank');
                            }}
                            className="w-full py-3.5 sm:py-4 bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98] text-white rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            <span>
                                {language === 'ar' ? 'إرسال الطلب عبر واتساب' : (language === 'tr' ? 'WhatsApp\'tan Sipariş Ver' : 'Order via WhatsApp')}
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};
