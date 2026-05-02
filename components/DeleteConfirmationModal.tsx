import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Language } from '../types';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    language: Language;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    language
}) => {
    if (!isOpen) return null;

    const isRTL = language === 'ar';
    const t = (ar: string, tr: string, en: string) => {
        if (language === 'ar') return ar;
        if (language === 'tr') return tr;
        return en;
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-charcoal-950/70 dark:bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative bg-cream-50 dark:bg-charcoal-900 rounded-3xl shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <Trash2 size={32} />
                    </div>

                    <h3 className="text-xl font-bold text-charcoal-900 dark:text-cream-100 mb-2">{title}</h3>
                    <p className="text-charcoal-500 dark:text-cream-500 text-sm leading-relaxed mb-8">
                        {message}
                    </p>

                    <div className={`flex gap-3 w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-cream-100 dark:bg-charcoal-800 hover:bg-cream-200 dark:hover:bg-charcoal-700 text-charcoal-700 dark:text-cream-200 font-bold rounded-xl transition-colors"
                        >
                            {t('إلغاء', 'İptal', 'Cancel')}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 dark:shadow-red-900/30 transition-colors"
                        >
                            {t('حذف', 'Sil', 'Delete')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
