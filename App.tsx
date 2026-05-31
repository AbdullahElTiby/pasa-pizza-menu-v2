import React, { useState, useEffect } from 'react';
import { MenuState, MenuItem, Language, Category } from './types';
import { fetchMenu, fetchCategories, saveMenuItem, deleteMenuItem, saveCategory, deleteCategory } from './services/dataService';
import { checkAuth, logout } from './services/authService';
import { MenuCard } from './components/MenuCard';
import { AdminEditor } from './components/AdminEditor';
import { LoginModal } from './components/LoginModal';
import { CategoryModal } from './components/CategoryModal';
import { CartDrawer } from './components/CartDrawer';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { BranchSelector } from './components/BranchSelector';
import { BRANCHES } from './config/branches';
import { Edit3, Eye, Plus, Trash2, LogOut, XCircle, Search, ShoppingBag, Moon, Sun, MapPin, ArrowUp, MoreHorizontal, Loader2, RefreshCw, Lock } from 'lucide-react';
import { CartItem } from './types';
import { startKeepAlive, stopKeepAlive } from './services/keepAliveService';

const BRANCH_STORAGE_KEY = 'pasa_branch';

const App: React.FC = () => {
  const [menu, setMenu] = useState<MenuState>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null | 'new'>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<Language>('ar');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{ isOpen: boolean; type: 'item' | 'category'; id: string | null; }>({ isOpen: false, type: 'item', id: null });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [activeBranch, setActiveBranch] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const match = hash.match(/^#\/(syria|turkey)$/);
      if (match) {
        const branchId = match[1];
        localStorage.setItem(BRANCH_STORAGE_KEY, branchId);
        return branchId;
      }
      return null;
    }
    return null;
  });
  const [showBranchSelector, setShowBranchSelector] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(false);

  const isSyria = activeBranch === 'syria';

  useEffect(() => {
    if (isSyria && language === 'tr') {
      setLanguage('ar');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBranch]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Start keep-alive service to prevent Supabase from pausing due to inactivity
  useEffect(() => {
    startKeepAlive();
    return () => stopKeepAlive();
  }, []);

  // Load data when branch is selected
  useEffect(() => {
    if (!activeBranch) {
      setShowBranchSelector(true);
      return;
    }

    setShowBranchSelector(false);
    setIsLoading(true);
    setLoadError(false);

    const loadData = async () => {
      try {
        const [loadedMenu, loadedCategories] = await Promise.all([
          fetchMenu(activeBranch),
          fetchCategories(activeBranch)
        ]);
        setMenu(loadedMenu);
        setCategories(loadedCategories);
      } catch (err) {
        console.error('Failed to load menu data:', err);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    const initAuth = async () => {
      setIsAuthChecking(true);
      const isAuth = await checkAuth(activeBranch);
      setIsAuthenticated(isAuth);
      setIsAuthChecking(false);
      if (isAuth) {
        setIsAdminMode(true);
        setLanguage('ar');
      }
    };
    initAuth();
  }, [activeBranch]);

  const handleSelectBranch = (branchId: 'syria' | 'turkey') => {
    window.location.hash = `/${branchId}`;
    localStorage.setItem(BRANCH_STORAGE_KEY, branchId);
    setActiveBranch(branchId);
    setShowBranchSelector(false);
    // Reset state for new branch
    setMenu([]);
    setCategories([]);
    setCart([]);
    setIsAdminMode(false);
    setIsAuthenticated(false);
    setEditingItem(null);
    setActiveCategory('All');
  };

  const handleSwitchBranch = () => {
    window.location.hash = '';
    setShowBranchSelector(true);
  };

  const handleRetry = () => {
    setLoadError(false);
    setIsLoading(true);
    if (!activeBranch) return;

    const retryLoad = async () => {
      try {
        const [loadedMenu, loadedCategories] = await Promise.all([
          fetchMenu(activeBranch),
          fetchCategories(activeBranch)
        ]);
        setMenu(loadedMenu);
        setCategories(loadedCategories);
      } catch (err) {
        console.error('Retry failed:', err);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };
    retryLoad();
  };

  const handleSaveItem = async (item: MenuItem, newCategory?: Category) => {
    if (!activeBranch) return;
    try {
      if (newCategory) {
        const exists = categories.some(c => c.id === newCategory.id);
        if (!exists) {
          await saveCategory(activeBranch, newCategory);
          const updatedCategories = [...categories, newCategory];
          setCategories(updatedCategories);
          setActiveCategory(newCategory.id);
        }
      }

      await saveMenuItem(activeBranch, item);

      let newMenu: MenuState;
      if (editingItem === 'new') {
        newMenu = [...menu, item];
      } else {
        newMenu = menu.map((m) => (m.id === item.id ? item : m));
      }
      setMenu(newMenu);
      setEditingItem(null);
    } catch (error: any) {
      console.error('Save error details:', error);
      const msg = error?.message || error?.error_description || 'Unknown error';
      alert(`Error saving item:\n${msg}\n\nCheck browser console (F12) for full details.`);
    }
  };

  const triggerDeleteItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteConfig({ isOpen: true, type: 'item', id });
  };

  const confirmDelete = async () => {
    if (!deleteConfig.id || !activeBranch) return;

    try {
      if (deleteConfig.type === 'item') {
        await deleteMenuItem(activeBranch, deleteConfig.id);
        const newMenu = menu.filter((m) => m.id !== deleteConfig.id);
        setMenu(newMenu);
      } else {
        await deleteCategory(activeBranch, deleteConfig.id);
        const updatedCategories = categories.filter(c => c.id !== deleteConfig.id);
        setCategories(updatedCategories);
        if (activeCategory === deleteConfig.id) setActiveCategory('All');
      }
    } catch (error) {
      alert('Error deleting');
    }
  };

  const handleDeleteCategory = async (e: React.MouseEvent, categoryIdToDelete: string) => {
    e.stopPropagation();
    e.preventDefault();
    setDeleteConfig({ isOpen: true, type: 'category', id: categoryIdToDelete });
  };

  const handleSaveCategory = async (newCategory: Category) => {
    if (!activeBranch) return;
    try {
      await saveCategory(activeBranch, newCategory);
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      setActiveCategory(newCategory.id);
    } catch (error: any) {
      console.error('Category save error:', error);
      const msg = error?.message || error?.error_description || 'Unknown error';
      alert(`Error saving category:\n${msg}`);
    }
  };

  const handleLogout = async () => {
    if (!activeBranch) return;
    await logout(activeBranch);
    setIsAuthenticated(false);
    setIsAdminMode(false);
    setEditingItem(null);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setIsAdminMode(true);
    setLanguage('ar');
  };

  const addToCart = (item: MenuItem, variantName?: string, variantPrice?: number) => {
    const price = variantPrice || (item.discountPrice || item.price);
    const existingItem = cart.find(i => i.menuItemId === item.id && i.variantName === variantName);
    const variant = variantName ? item.variants?.find(v => v.name === variantName) : undefined;

    if (existingItem) {
      setCart(cart.map(i => i.id === existingItem.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, {
        id: crypto.randomUUID(),
        menuItemId: item.id,
        name: item.name,
        nameAr: item.nameAr,
        nameTr: item.nameTr,
        price: price,
        quantity: 1,
        variantName: variantName,
        variantNameAr: variant?.nameAr,
        variantNameTr: variant?.nameTr,
        imageUrl: item.imageUrl
      }]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const getCategoryName = (cat: Category | undefined) => {
    if (!cat) return '';
    if (language === 'ar' && cat.nameAr) return cat.nameAr;
    if (language === 'tr' && cat.nameTr) return cat.nameTr;
    return cat.name;
  };

  const filteredMenu = menu.filter(item => {
    if (activeCategory !== 'All' && item.category !== activeCategory) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.nameAr?.includes(query) ||
      item.nameTr?.toLowerCase().includes(query)
    );
  });

  const isRTL = language === 'ar';
  const currentBranch = activeBranch ? BRANCHES[activeBranch] : null;
  const currency = currentBranch?.currency || 'TL';
  const t3 = (ar: string, tr: string, en: string) => {
    if (language === 'ar') return ar;
    if (language === 'tr') return tr;
    return en;
  };

  if (showBranchSelector || !activeBranch) {
    return <BranchSelector onSelect={handleSelectBranch} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} language={language} setLanguage={setLanguage} />;
  }

  // Syria branch: show Coming Soon to non-authenticated users
  if (isSyria && !isAuthenticated) {
    if (isAuthChecking || isLoading) {
      return (
        <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-charcoal-950' : 'bg-cream-100'}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <Loader2 size={40} className="animate-spin text-brand-500 mb-4" />
          <p className={`text-base font-medium ${isDarkMode ? 'text-cream-400' : 'text-charcoal-500'}`}>
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      );
    }

    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    return (
      <div className={`min-h-screen flex flex-col items-center justify-center px-4 ${isDarkMode ? 'bg-charcoal-950 text-cream-100' : 'bg-cream-100 text-charcoal-900'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={handleLoginSuccess} branchId={activeBranch} />

        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative z-10 text-center max-w-lg">
          <div className="w-28 sm:w-36 mx-auto mb-6 sm:mb-8">
            <img src="/logo1.png?v=2" alt="Pasa Pizzeria" className="w-full h-auto object-contain" />
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 tracking-tight">
            {t('قريباً', 'Coming Soon')}
          </h1>

          <div className={`w-16 h-1 mx-auto rounded-full mb-4 sm:mb-6 ${isDarkMode ? 'bg-brand-500' : 'bg-brand-600'}`} />

          <p className={`text-sm sm:text-base md:text-lg font-light leading-relaxed mb-8 sm:mb-10 ${isDarkMode ? 'text-cream-400' : 'text-charcoal-500'}`}>
            {t(
              'فرع سوريا قيد التجهيز. نعمل على تقديم أفضل تجربة لكم.',
              'Our Syria branch is being prepared. We\'re working to bring you the best experience.'
            )}
          </p>

          <button
            onClick={() => setIsLoginModalOpen(true)}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all shadow-lg btn-press ${
              isDarkMode
                ? 'bg-charcoal-800 text-cream-200 hover:bg-charcoal-700 border border-charcoal-700'
                : 'bg-charcoal-900 text-white hover:bg-charcoal-800'
            }`}
          >
            <Lock size={16} />
            {t('تسجيل دخول الإدارة', 'Admin Login')}
          </button>

          <button
            onClick={handleSwitchBranch}
            className={`block mx-auto mt-4 text-xs font-medium underline underline-offset-4 transition-colors ${
              isDarkMode ? 'text-cream-600 hover:text-cream-400' : 'text-charcoal-400 hover:text-charcoal-600'
            }`}
          >
            {t('العودة لاختيار الفرع', 'Back to branch selection')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-cream-100 dark:bg-charcoal-950 text-charcoal-900 dark:text-cream-100 pb-20 font-sans transition-colors duration-300 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={handleLoginSuccess} branchId={activeBranch} />

      {/* Header Bar */}
      <header className="bg-white/90 dark:bg-charcoal-900/90 backdrop-blur-md py-2 sm:py-3 md:py-4 shadow-[0_4px_24px_rgba(60,30,20,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)] sticky top-0 z-50 border-b border-cream-200/60 dark:border-charcoal-800 transition-shadow duration-300">
        <div className="max-w-7xl mx-auto px-2 md:px-4 flex justify-between items-center gap-1 md:gap-2">
          <div className="flex-shrink-0">
            <div className="flex items-center">
              <img src="/logo1.png?v=2" alt="Pasa Pizzeria" className="h-10 sm:h-12 md:h-16 w-auto object-contain" />
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-6">
            {/* Branch Badge */}
            {currentBranch && (
              <button
                onClick={handleSwitchBranch}
                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-400 text-[10px] sm:text-xs font-bold hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors"
                title="Switch branch"
              >
                <MapPin size={12} className="sm:hidden" />
                <MapPin size={14} className="hidden sm:block" />
                <span className="inline">{currentBranch.name}</span>
              </button>
            )}

            {/* Language + Dark Mode — visible only on sm+ */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex bg-cream-200 dark:bg-charcoal-800 rounded-full p-0.5 md:p-1 text-[10px] font-bold text-charcoal-500 dark:text-cream-500 uppercase">
                <button onClick={() => setLanguage('en')} className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded-full transition-colors ${language === 'en' ? 'bg-white dark:bg-charcoal-700 text-charcoal-900 dark:text-cream-100 shadow-sm' : 'hover:text-charcoal-700 dark:hover:text-cream-200'}`}>EN</button>
                <button onClick={() => setLanguage('ar')} className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded-full transition-colors ${language === 'ar' ? 'bg-brand-600 text-white shadow-sm' : 'hover:text-charcoal-700 dark:hover:text-cream-200'}`}>AR</button>
                {!isSyria && <button onClick={() => setLanguage('tr')} className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded-full transition-colors ${language === 'tr' ? 'bg-white dark:bg-charcoal-700 text-charcoal-900 dark:text-cream-100 shadow-sm' : 'hover:text-charcoal-700 dark:hover:text-cream-200'}`}>TR</button>}
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="relative p-1.5 md:p-2 text-charcoal-400 hover:text-brand-600 transition-colors dark:text-cream-400 dark:hover:text-brand-400"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
              </button>
            </div>

            {/* Mobile More Button — visible only below sm */}
            <div className="relative sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-charcoal-400 dark:text-cream-400 hover:text-brand-600 dark:hover:text-brand-400 active:bg-cream-200 dark:active:bg-charcoal-800 rounded-full transition-colors"
                aria-label="Open menu"
              >
                <MoreHorizontal size={20} />
              </button>
              {isMobileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMobileMenuOpen(false)} />
                  <div className={`absolute top-full mt-2 bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-cream-200 dark:border-charcoal-700 p-3 z-50 min-w-[150px] flex flex-col gap-3 ${isRTL ? 'left-0' : 'right-0'}`}>
                    <div className="flex bg-cream-200 dark:bg-charcoal-800 rounded-full p-0.5 text-[11px] font-bold uppercase text-charcoal-500 dark:text-cream-500">
                      <button onClick={() => { setLanguage('en'); setIsMobileMenuOpen(false); }} className={`flex-1 px-2 py-1 rounded-full transition-colors ${language === 'en' ? 'bg-white dark:bg-charcoal-700 text-charcoal-900 dark:text-cream-100 shadow-sm' : ''}`}>EN</button>
                      <button onClick={() => { setLanguage('ar'); setIsMobileMenuOpen(false); }} className={`flex-1 px-2 py-1 rounded-full transition-colors ${language === 'ar' ? 'bg-brand-600 text-white shadow-sm' : ''}`}>AR</button>
                      {!isSyria && <button onClick={() => { setLanguage('tr'); setIsMobileMenuOpen(false); }} className={`flex-1 px-2 py-1 rounded-full transition-colors ${language === 'tr' ? 'bg-white dark:bg-charcoal-700 text-charcoal-900 dark:text-cream-100 shadow-sm' : ''}`}>TR</button>}
                    </div>
                    <button
                      onClick={() => { setIsDarkMode(!isDarkMode); setIsMobileMenuOpen(false); }}
                      className="flex items-center justify-between w-full px-2 py-2 rounded-xl text-sm font-medium text-charcoal-700 dark:text-cream-300 hover:bg-cream-100 dark:hover:bg-charcoal-800 active:bg-cream-200 dark:active:bg-charcoal-700 transition-colors"
                    >
                      <span>
                        {isDarkMode
                          ? t3('الوضع الفاتح', 'Aydınlık Mod', 'Light Mode')
                          : t3('الوضع الداكن', 'Karanlık Mod', 'Dark Mode')}
                      </span>
                      {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Cart Button */}
            {!isAdminMode && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-charcoal-400 hover:text-brand-600 transition-colors dark:text-cream-400 dark:hover:text-brand-400"
              >
                <ShoppingBag size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                    {cart.length}
                  </span>
                )}
              </button>
            )}

            {/* Mode Toggle Button */}
            <button
              onClick={() => isAuthenticated ? setIsAdminMode(!isAdminMode) : setIsLoginModalOpen(true)}
              className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 p-1.5 sm:px-3 md:px-5 sm:py-1.5 md:py-2 rounded-full bg-charcoal-900 dark:bg-brand-600 text-white text-[10px] sm:text-xs font-semibold hover:bg-brand-600 dark:hover:bg-brand-700 transition-all shadow-lg"
            >
              {isAdminMode ? <Eye size={14} className="sm:hidden" /> : <Edit3 size={14} className="sm:hidden" />}
              {isAdminMode ? <Eye size={16} className="hidden sm:block" /> : <Edit3 size={16} className="hidden sm:block" />}
              <span className="hidden md:inline">
                {isAdminMode
                  ? t3('عرض كزبون', 'Müşteri olarak görüntüle', 'View as Customer')
                  : t3('إدارة القائمة', 'Menüyü Yönet', 'Manage Menu')}
              </span>
            </button>

            {isAuthenticated && (
              <button onClick={handleLogout} className="text-charcoal-400 dark:text-cream-500 hover:text-red-600 p-1 transition-colors">
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[300px] sm:min-h-[380px] flex flex-col items-center justify-center overflow-hidden py-8">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center opacity-40 blur-[1px]"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?q=80&w=2070&auto=format&fit=crop")' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/80 via-charcoal-900/50 to-cream-100 dark:to-charcoal-950"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl px-4 mt-4 sm:mt-8">
          <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl font-black mb-3 sm:mb-5 tracking-tight leading-[1.1] anim-fade-up px-2" style={{animationDelay:'0.1s'}}>
            {isAdminMode ? t3('إدارة قائمتك', 'Menünüzü Yönetin', 'Manage Your Menu') : (language === 'ar' ? 'قائمة الطعام' : (language === 'tr' ? 'Menümüz' : 'Our Menu'))}
          </h1>
          <p className="text-cream-300/80 text-sm sm:text-base md:text-lg font-light mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed anim-fade-up px-4" style={{animationDelay:'0.25s'}}>
            {isAdminMode
              ? t3(
                'أنشئ فئات جديدة واستخدم الذكاء الاصطناعي لكتابة الأوصاف والترجمات بسهولة لأطباقك المميزة.',
                'Yeni kategoriler oluşturun ve yemekleriniz için açıklamaları ve çevirileri kolayca hazırlayın.',
                'Create new categories and use AI to effortlessly craft descriptions and translations for your culinary masterpieces.'
              )
              : (language === 'ar' ? 'استمتع بمجموعة مختارة من الأطباق المحضرة بشغف وأجود المكونات.' : (language === 'tr' ? 'Tutku ve taze malzemelerle hazırlanan özel yemeklerimizi keşfedin.' : 'Authentic recipes crafted with passion, tradition, and the finest ingredients.'))}
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto group anim-fade-up" style={{animationDelay:'0.4s'}}>
            <div className={`absolute inset-y-0 ${isRTL ? 'right-5' : 'left-5'} flex items-center pointer-events-none transition-transform group-focus-within:scale-110`}>
              <Search className="h-5 w-5 text-charcoal-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-4 ${isRTL ? 'pr-14 pl-6' : 'pl-14 pr-6'} rounded-full bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-cream-100 shadow-[0_8px_32px_rgba(60,30,20,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] focus:outline-none search-glow transition-all duration-300 text-base border border-cream-300 dark:border-charcoal-700 placeholder:text-charcoal-400 dark:placeholder:text-cream-600`}
              placeholder={language === 'ar' ? "ابحث عن طبق..." : (language === 'tr' ? "Yemek ara..." : "Search for a dish...")}
            />
          </div>
        </div>
      </section>

      {/* Categories & Items Container */}
      <main className="max-w-7xl mx-auto px-4 mt-8 relative z-20">

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-charcoal-400 dark:text-cream-600">
            <Loader2 size={40} className="animate-spin mb-4 text-brand-500" />
            <p className="text-base font-medium">{language === 'ar' ? 'جاري تحميل القائمة...' : (language === 'tr' ? 'Menü yükleniyor...' : 'Loading menu...')}</p>
          </div>
        )}

        {/* Error State */}
        {loadError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-charcoal-400 dark:text-cream-600">
            <RefreshCw size={40} className="mb-4 text-brand-500 opacity-50" />
            <p className="text-base font-medium mb-2">{language === 'ar' ? 'حدث خطأ أثناء تحميل القائمة' : (language === 'tr' ? 'Menü yüklenirken hata oluştu' : 'Failed to load menu')}</p>
            <p className="text-sm mb-6 opacity-60">{language === 'ar' ? 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى' : (language === 'tr' ? 'Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin' : 'Please check your connection and try again')}</p>
            <button onClick={handleRetry} className="px-6 py-2.5 bg-brand-600 text-white rounded-full font-bold shadow-md hover:bg-brand-700 transition-colors btn-press flex items-center gap-2">
              <RefreshCw size={16} />
              {language === 'ar' ? 'إعادة المحاولة' : (language === 'tr' ? 'Tekrar Dene' : 'Retry')}
            </button>
          </div>
        )}

        {/* Categories & Menu Grid - only shown when loaded and no error */}
        {!isLoading && !loadError && (
        <>

        {/* Categories Chip List */}
        <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-4xl mx-auto">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all shadow-sm ${activeCategory === 'All'
              ? 'bg-brand-600 text-white'
              : 'bg-white dark:bg-charcoal-900 text-charcoal-700 dark:text-cream-200 hover:bg-cream-50 dark:hover:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700'
              }`}
          >
            {language === 'ar' ? 'الكل' : (language === 'tr' ? 'Tümü' : 'All')}
          </button>

          {categories.map((cat) => (
            <div key={cat.id} className="relative flex items-center">
              <div
                onClick={() => setActiveCategory(cat.id)}
                className={`cursor-pointer px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all shadow-sm border flex items-center space-x-2 rtl:space-x-reverse ${activeCategory === cat.id
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white dark:bg-charcoal-900 text-charcoal-700 dark:text-cream-200 hover:bg-cream-50 dark:hover:bg-charcoal-800 border-cream-300 dark:border-charcoal-700'
                  }`}
              >
                {isAdminMode && (
                  <button
                    onClick={(e) => handleDeleteCategory(e, cat.id)}
                    className="hover:text-red-300 transition-colors"
                  >
                    <XCircle size={14} />
                  </button>
                )}
                <span>{getCategoryName(cat)}</span>
              </div>
            </div>
          ))}

          {isAdminMode && (
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="w-10 h-10 rounded-full bg-white dark:bg-charcoal-900 flex items-center justify-center text-charcoal-600 dark:text-cream-400 border border-cream-300 dark:border-charcoal-700 hover:bg-cream-50 dark:hover:bg-charcoal-800 hover:text-brand-600 transition-all shadow-sm"
            >
              <Plus size={18} />
            </button>
          )}
        </div>

        {/* Add New Dish Button */}
        {isAdminMode && (
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setEditingItem('new')}
              className="flex items-center space-x-2 rtl:space-x-reverse bg-brand-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-all transform hover:-translate-y-0.5 btn-press"
            >
              <Plus size={20} />
              <span>{language === 'ar' ? 'إضافة طبق جديد' : (language === 'tr' ? 'Yeni Yemek Ekle' : 'Add New Dish')}</span>
            </button>
          </div>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-grid">
          {filteredMenu.length > 0 ? (
            filteredMenu.map((item) => {
              const categoryObj = categories.find(c => c.id === item.category);
              const categoryLabel = getCategoryName(categoryObj) || item.category;

              return (
                <div key={item.id} className="relative group">
                  <MenuCard
                    item={item}
                    language={language}
                    categoryLabel={categoryLabel}
                    currency={currency}
                    onAddToCart={addToCart}
                  />

                  {isAdminMode && (
                    <>
                      {/* Mobile: always-visible admin buttons */}
                      <div className={`absolute top-3 z-30 flex gap-1 md:hidden ${isRTL ? 'left-3' : 'right-3'}`}>
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-2 bg-white/95 dark:bg-charcoal-800/95 text-brand-600 rounded-full shadow-lg border border-cream-200 dark:border-charcoal-600 active:scale-95 transition-transform"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerDeleteItem(item.id);
                          }}
                          className="p-2 bg-white/95 dark:bg-charcoal-800/95 text-red-600 rounded-full shadow-lg border border-cream-200 dark:border-charcoal-600 active:scale-95 transition-transform"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      {/* Desktop: hover overlay */}
                      <div className="hidden md:flex absolute inset-0 bg-charcoal-950/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl items-center justify-center space-x-6 rtl:space-x-reverse z-30 backdrop-blur-sm">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-4 bg-white text-brand-600 rounded-full hover:scale-110 transition-all shadow-xl border border-cream-200"
                        >
                          <Edit3 size={28} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerDeleteItem(item.id);
                          }}
                          className="p-4 bg-white text-red-600 rounded-full hover:scale-110 transition-all shadow-xl border border-cream-200"
                        >
                          <Trash2 size={28} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 sm:py-20 text-center text-charcoal-400 dark:text-cream-600 bg-white dark:bg-charcoal-900 rounded-3xl border border-cream-200 dark:border-charcoal-800 shadow-sm">
              <Search size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-base sm:text-lg font-medium">{language === 'ar' ? 'لا توجد أطباق مطابقة للبحث' : (language === 'tr' ? 'Aramayla eşleşen yemek bulunamadı' : 'No dishes match your search')}</p>
            </div>
          )}
        </div>
        </>
        )}
      </main>

      {/* Editor Modal */}
      {editingItem && isAdminMode && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-charcoal-950/95 dark:bg-black/80 backdrop-blur-xl flex items-start justify-center py-10 px-4 modal-backdrop">
          <AdminEditor
            existingItem={editingItem === 'new' ? null : editingItem}
            availableCategories={categories}
            onSave={handleSaveItem}
            onCancel={() => setEditingItem(null)}
            branchId={activeBranch}
            language={language}
            currency={currency}
          />
        </div>
      )}

      {/* Simple Footer */}
      <footer className="mt-20 sm:mt-32 py-8 sm:py-12 text-center text-charcoal-400 dark:text-cream-600 border-t border-cream-300 dark:border-charcoal-800">
        <p className="text-xs sm:text-sm font-medium tracking-wide">© {new Date().getFullYear()} Pasa Pizzeria. {currentBranch ? `${currentBranch.name} Branch` : ''}. All rights reserved.</p>
      </footer>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        existingCategories={categories}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        currency={currency}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        language={language}
      />

      <DeleteConfirmationModal
        isOpen={deleteConfig.isOpen}
        onClose={() => setDeleteConfig({ ...deleteConfig, isOpen: false })}
        onConfirm={confirmDelete}
        title={deleteConfig.type === 'item'
          ? (language === 'ar' ? 'حذف الطبق' : language === 'tr' ? 'Yemeği Sil' : 'Delete Dish')
          : (language === 'ar' ? 'حذف الفئة' : language === 'tr' ? 'Kategoriyi Sil' : 'Delete Category')
        }
        message={deleteConfig.type === 'item'
          ? (language === 'ar' ? 'هل أنت متأكد من رغبتك في حذف هذا الطبق نهائياً؟' : language === 'tr' ? 'Bu yemeği kalıcı olarak silmek istediğinize emin misiniz?' : 'Are you sure you want to permanently delete this dish?')
          : (language === 'ar' ? 'سيتم حذف الفئة وجميع الأطباق المرتبطة بها.' : language === 'tr' ? 'Kategori ve bağlı tüm yemekler silinecektir.' : 'The category and all associated dishes will be deleted.')
        }
        language={language}
      />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-brand-600 text-white shadow-lg shadow-brand-500/30 flex items-center justify-center hover:bg-brand-700 transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default App;
