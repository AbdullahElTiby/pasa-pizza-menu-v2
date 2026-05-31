import React from 'react';
import { MapPin, Moon, Sun } from 'lucide-react';
import { BRANCHES } from '../config/branches';
import { Language } from '../types';

interface BranchSelectorProps {
  onSelect: (branchId: 'syria' | 'turkey') => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const SyriaFlag = () => (
  <div className="relative">
    <div className="absolute inset-0 bg-brand-500/20 rounded-2xl blur-xl scale-110" />
    <img src="/syria.jpg" alt="Syria Flag" className="relative w-20 h-12 md:w-24 md:h-14 rounded-xl shadow-lg ring-2 ring-white/20 object-cover" />
  </div>
);

const TurkeyFlag = () => (
  <div className="relative">
    <div className="absolute inset-0 bg-brand-500/20 rounded-2xl blur-xl scale-110" />
    <img src="/turkey.jpg" alt="Turkey Flag" className="relative w-20 h-12 md:w-24 md:h-14 rounded-xl shadow-lg ring-2 ring-white/20 object-cover" />
  </div>
);

export const BranchSelector: React.FC<BranchSelectorProps> = ({ onSelect, isDarkMode, setIsDarkMode, language, setLanguage }) => {
  const branches = Object.values(BRANCHES);

  const t = (ar: string, tr: string, en: string) => {
    if (language === 'ar') return ar;
    if (language === 'tr') return tr;
    return en;
  };

  return (
    <div className={`fixed inset-0 z-[200] flex items-start sm:items-center justify-center p-3 sm:p-4 pt-6 sm:pt-4 overflow-y-auto ${isDarkMode ? 'bg-charcoal-950' : 'bg-cream-100'}`}>
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="relative w-full max-w-4xl pb-3 sm:pb-0">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-10">
          <div className="flex flex-col items-center gap-1 sm:gap-3">
            <div className="w-20 sm:w-32 md:w-40 flex items-center justify-center">
              <img src="/logo1.png?v=2" alt="Pasa Pizzeria" className="w-full h-auto object-contain" />
            </div>
          </div>
          <p className={`text-xs sm:text-base md:text-lg font-light mt-2 sm:mt-5 ${isDarkMode ? 'text-cream-400' : 'text-charcoal-500'}`}>
            {t('اختر الفرع', 'Şube seçin', 'Choose your branch')}
          </p>

          {/* Language Selector & Dark Mode Toggle */}
          <div className="flex items-center justify-center gap-2 mt-2.5 sm:mt-4">
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${isDarkMode ? 'bg-charcoal-800' : 'bg-cream-200/60'} text-xs font-bold`}>
              <button onClick={() => setLanguage('en')} className={`px-2.5 py-1 rounded-full transition-all ${language === 'en' ? (isDarkMode ? 'bg-charcoal-700 text-cream-100 shadow-sm' : 'bg-white text-charcoal-900 shadow-sm') : (isDarkMode ? 'text-cream-500 hover:text-cream-300' : 'text-charcoal-500 hover:text-charcoal-700')}`}>EN</button>
              <button onClick={() => setLanguage('ar')} className={`px-2.5 py-1 rounded-full transition-all ${language === 'ar' ? 'bg-brand-600 text-white shadow-sm' : (isDarkMode ? 'text-cream-500 hover:text-cream-300' : 'text-charcoal-500 hover:text-charcoal-700')}`}>AR</button>
              <button onClick={() => setLanguage('tr')} className={`px-2.5 py-1 rounded-full transition-all ${language === 'tr' ? (isDarkMode ? 'bg-charcoal-700 text-cream-100 shadow-sm' : 'bg-white text-charcoal-900 shadow-sm') : (isDarkMode ? 'text-cream-500 hover:text-cream-300' : 'text-charcoal-500 hover:text-charcoal-700')}`}>TR</button>
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'bg-charcoal-800 text-cream-300 hover:bg-charcoal-700' : 'bg-cream-200/60 text-charcoal-600 hover:bg-cream-300'}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Branch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-5 md:gap-8">
          {branches.map((branch) => (
            <button
              key={branch.id}
              onClick={() => onSelect(branch.id)}
              className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 text-center transition-all duration-300 card-lift border ${
                isDarkMode
                  ? 'bg-charcoal-900 border-charcoal-700 hover:border-brand-500/50'
                  : 'bg-white border-cream-200 hover:border-brand-300'
              }`}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-brand-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <div className="flex justify-center mb-2.5 sm:mb-5 transform group-hover:scale-110 transition-transform duration-300">
                  {branch.id === 'syria' ? <SyriaFlag /> : <TurkeyFlag />}
                </div>

                <h2 className={`font-serif text-2xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 ${isDarkMode ? 'text-cream-100' : 'text-charcoal-900'}`}>
                  {language === 'ar' && branch.nameAr ? branch.nameAr : (language === 'tr' && branch.nameTr ? branch.nameTr : branch.name)}
                </h2>

                <div className={`mt-3 sm:mt-6 inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-base sm:text-sm font-bold transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-brand-600 text-white group-hover:bg-brand-500'
                    : 'bg-brand-600 text-white group-hover:bg-brand-700'
                }`}>
                  <span>{t('دخول الفرع', 'Şubeye Gir', 'Enter Branch')}</span>
                  <span className="opacity-60">←</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <p className={`text-center mt-4 sm:mt-10 text-[11px] sm:text-xs font-medium ${isDarkMode ? 'text-cream-600' : 'text-charcoal-400'}`}>
          {t('يمكنك تبديل الفروع في أي وقت من القائمة الرئيسية', 'Şubeleri istediğiniz zaman üst menüden değiştirebilirsiniz', 'You can switch branches anytime from the header menu')}
        </p>
      </div>
    </div>
  );
};
