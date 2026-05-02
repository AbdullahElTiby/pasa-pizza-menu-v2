
import React, { useState, useEffect, useRef } from 'react';
import { MenuItem, Language, Category, Variant } from '../types';
import { Loader2, Image as ImageIcon, Save, X, Plus, Trash2, Upload } from 'lucide-react';
import { uploadMenuImage } from '../services/dataService';

interface AdminEditorProps {
  existingItem?: MenuItem | null;
  availableCategories: Category[];
  onSave: (item: MenuItem, newCategory?: Category) => void;
  onCancel: () => void;
  branchId: string;
  language: Language;
  currency: string;
}

export const AdminEditor: React.FC<AdminEditorProps> = ({ existingItem, availableCategories, onSave, onCancel, branchId, language, currency }) => {
  const [name, setName] = useState(existingItem?.name || '');
  const [description, setDescription] = useState(existingItem?.description || '');
  const [nameAr, setNameAr] = useState(existingItem?.nameAr || '');
  const [descriptionAr, setDescriptionAr] = useState(existingItem?.descriptionAr || '');
  const [nameTr, setNameTr] = useState(existingItem?.nameTr || '');
  const [descriptionTr, setDescriptionTr] = useState(existingItem?.descriptionTr || '');
  const [price, setPrice] = useState<string>(existingItem?.price.toString() || '');
  const [discountPrice, setDiscountPrice] = useState<string>(existingItem?.discountPrice?.toString() || '');
  const [categoryId, setCategoryId] = useState<string>(availableCategories[0]?.id || '');
  const [imageUrl, setImageUrl] = useState(existingItem?.imageUrl || '');
  const [isPopular, setIsPopular] = useState(existingItem?.isPopular || false);
  const [variants, setVariants] = useState<Variant[]>(existingItem?.variants || []);
  const [activeTab, setActiveTab] = useState<Language>(language === 'ar' ? 'ar' : language === 'tr' ? 'tr' : 'en');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRTL = language === 'ar';

  const t = (ar: string, tr: string, en: string) => {
    if (language === 'ar') return ar;
    if (language === 'tr') return tr;
    return en;
  };

  useEffect(() => {
    if (existingItem) {
      setName(existingItem.name);
      setDescription(existingItem.description);
      setNameAr(existingItem.nameAr || '');
      setDescriptionAr(existingItem.descriptionAr || '');
      setNameTr(existingItem.nameTr || '');
      setDescriptionTr(existingItem.descriptionTr || '');
      setPrice(existingItem.price.toString());
      setDiscountPrice(existingItem.discountPrice?.toString() || '');
      setCategoryId(existingItem.category);

      setIsPopular(existingItem.isPopular || false);
      setVariants(existingItem.variants || []);
    }
  }, [existingItem]);





  const handleAddVariant = () => {
    setVariants([...variants, {
      id: Date.now().toString(),
      name: '',
      nameAr: '',
      nameTr: '',
      price: 0
    }]);
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const handleUpdateVariant = (id: string, field: keyof Variant, value: any) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const publicUrl = await uploadMenuImage(branchId, file);
      setImageUrl(publicUrl);
    } catch (error) {
      alert(t('حدث خطأ أثناء رفع الصورة. حاول مرة أخرى.', 'Görsel yüklenirken hata oluştu. Lütfen tekrar deneyin.', 'Error uploading image. Please try again.'));
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!name.trim()) {
      alert(t('يرجى إدخال اسم الطبق', 'Lütfen bir yemek adı girin', 'Please enter a dish name'));
      return;
    }
    if (!categoryId) {
      alert(t('يرجى اختيار فئة. أنشئ واحدة أولاً إذا لم تكن موجودة.', 'Lütfen bir kategori seçin. Yoksa önce bir tane oluşturun.', 'Please select a category. Create one first if none exist.'));
      return;
    }

    onSave({
      id: existingItem?.id || crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price) || 0,
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      category: categoryId,
      imageUrl: imageUrl || undefined,
      isPopular,
      nameAr: nameAr || undefined,
      descriptionAr: descriptionAr || undefined,
      nameTr: nameTr || undefined,
      descriptionTr: descriptionTr || undefined,
      variants: variants.length > 0 ? variants : undefined
    });
  };

  return (
    <div className={`bg-cream-50 dark:bg-charcoal-900 rounded-3xl overflow-hidden shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-5xl animate-in fade-in zoom-in-95 duration-300 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex justify-between items-center p-4 sm:p-6 border-b border-cream-200/60 dark:border-charcoal-700">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-charcoal-900 dark:text-cream-100">
            {existingItem ? t('تعديل الطبق', 'Yemeği Düzenle', 'Edit Dish') : t('إضافة طبق جديد', 'Yeni Yemek Ekle', 'Add New Dish')}
          </h2>
          <p className="text-xs text-charcoal-400 dark:text-cream-600 mt-1">
            {t('قم بتعبئة تفاصيل الطبق والخيارات المتاحة', 'Yemek detaylarını ve mevcut seçenekleri doldurun', 'Fill in the dish details and available options')}
          </p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-cream-100 dark:hover:bg-charcoal-800 rounded-full transition-colors text-charcoal-400 dark:text-cream-500">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row h-full">
        {/* Left Side: Media & Settings */}
        <div className={`w-full md:w-2/5 p-4 sm:p-8 bg-cream-100 dark:bg-charcoal-800 ${isRTL ? 'border-r' : 'border-l'} border-cream-200/60 dark:border-charcoal-700 space-y-4 sm:space-y-8 overflow-y-auto max-h-[45vh] md:max-h-[70vh]`}>
          {/* Image Section */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-charcoal-700 dark:text-cream-400 block">{t('صورة الطبق', 'Yemek Görseli', 'Dish Image')}</label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div
              onClick={() => !imageUrl && !isUploading && fileInputRef.current?.click()}
              className={`group relative aspect-video bg-cream-50 dark:bg-charcoal-900 rounded-2xl border-2 border-dashed border-cream-300 dark:border-charcoal-700 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-brand-300 ${!imageUrl && !isUploading ? 'cursor-pointer' : ''}`}
            >
              {isUploading ? (
                <div className="text-center space-y-2">
                  <Loader2 className="animate-spin text-brand-600 mx-auto" size={32} />
                  <p className="text-xs text-charcoal-400 dark:text-cream-600">{t('جاري رفع الصورة...', 'Görsel yükleniyor...', 'Uploading image...')}</p>
                </div>
              ) : imageUrl ? (
                <>
                  <img src={imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute inset-0 bg-charcoal-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="bg-cream-50 dark:bg-charcoal-800 text-brand-600 p-2 rounded-full shadow-lg"><Upload size={20} /></button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setImageUrl(''); }} className="bg-cream-50 dark:bg-charcoal-800 text-red-600 p-2 rounded-full shadow-lg"><Trash2 size={20} /></button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-2">
                  <div className="bg-cream-200 dark:bg-charcoal-700 p-4 rounded-full mx-auto group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 transition-colors"><Upload className="text-cream-400 dark:text-cream-600 group-hover:text-brand-600" size={32} /></div>
                  <p className="text-xs text-charcoal-400 dark:text-cream-600">{t('اضغط لرفع صورة', 'Görsel yüklemek için tıklayın', 'Click to upload image')}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder={t('...أو ألصق رابط الصورة هنا', 'veya görsel bağlantısını buraya yapıştırın', 'or paste image URL here')}
                className="flex-grow px-4 py-2 text-xs rounded-xl border border-cream-300 dark:border-charcoal-700 focus:ring-2 focus:ring-brand-100 outline-none text-charcoal-900 dark:text-cream-100 bg-cream-50 dark:bg-charcoal-800"
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-charcoal-700 dark:text-cream-400 block">{t('الفئة', 'Kategori', 'Category')}</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-cream-300 dark:border-charcoal-700 bg-cream-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 focus:ring-2 focus:ring-brand-100 outline-none text-sm font-medium"
            >
              {availableCategories.map(cat => (
                <option key={cat.id} value={cat.id} className="text-charcoal-900 dark:text-cream-100 bg-cream-50 dark:bg-charcoal-800">
                  {language === 'ar' && cat.nameAr ? cat.nameAr : (language === 'tr' && cat.nameTr ? cat.nameTr : cat.name)}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Section */}
          <div className="p-6 bg-cream-50 dark:bg-charcoal-900 rounded-2xl border border-cream-200/60 dark:border-charcoal-700 space-y-6">
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
              <div className="w-1 h-5 bg-brand-400 rounded-full"></div>
              <span className="text-sm font-bold text-charcoal-800 dark:text-cream-200">{t('التسعير', 'Fiyatlandırma', 'Pricing')}</span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-charcoal-400 dark:text-cream-500 uppercase tracking-wider">{t(`السعر الأساسي (${currency})`, `Temel Fiyat (${currency})`, `Base Price (${currency})`)}</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-cream-100 dark:bg-charcoal-800 rounded-xl border border-cream-200/60 dark:border-charcoal-700 focus:border-brand-300 focus:ring-4 focus:ring-brand-50 outline-none transition-all text-lg font-bold text-charcoal-900 dark:text-cream-100"
              />
              <p className="text-[10px] text-brand-500 mt-1">{t('سيتم احتساب السعر بناءً على الخيارات', 'Fiyat seçeneklere göre hesaplanacaktır', 'Price will be calculated based on options')}</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-charcoal-400 dark:text-cream-500 uppercase tracking-wider">{t(`سعر الخصم (${currency})`, `İndirimli Fiyat (${currency})`, `Discount Price (${currency})`)}</label>
              <input
                type="number"
                value={discountPrice}
                onChange={e => setDiscountPrice(e.target.value)}
                placeholder={t('اختياري', 'İsteğe bağlı', 'Optional')}
                className="w-full px-4 py-3 bg-cream-100 dark:bg-charcoal-800 rounded-xl border border-cream-200/60 dark:border-charcoal-700 focus:border-brand-300 focus:ring-4 focus:ring-brand-50 outline-none transition-all text-lg font-bold text-charcoal-900 dark:text-cream-100"
              />
            </div>

            <label className={`flex items-center gap-3 cursor-pointer group ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${isPopular ? 'bg-brand-600 border-brand-600' : 'border-cream-400 dark:border-charcoal-600 bg-cream-50 dark:bg-charcoal-800'}`}>
                {isPopular && <Save size={12} className="text-cream-50" />}
                <input type="checkbox" checked={isPopular} onChange={e => setIsPopular(e.target.checked)} className="hidden" />
              </div>
              <span className="text-sm font-bold text-charcoal-600 dark:text-cream-400 group-hover:text-charcoal-900 dark:group-hover:text-cream-200 transition-colors">{t('تمييز كطبق مشهور', 'Popüler yemek olarak işaretle', 'Mark as Popular Dish')}</span>
            </label>
          </div>
        </div>

        {/* Right Side: Content Tabs */}
        <div className="w-full md:w-3/5 p-4 sm:p-8 space-y-4 sm:space-y-8 md:overflow-y-auto md:max-h-[70vh]">
          {/* Language Selection Tabs */}
          <div className={`flex flex-wrap items-center gap-1 bg-cream-100 dark:bg-charcoal-800 p-1.5 rounded-2xl ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button type="button" onClick={() => setActiveTab('en')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'en' ? 'bg-cream-50 dark:bg-charcoal-700 text-charcoal-900 dark:text-cream-100 shadow-md' : 'text-charcoal-400 dark:text-cream-500 hover:text-charcoal-600 dark:hover:text-cream-300'}`}>{t('الإنجليزية', 'İngilizce', 'English')}</button>
            <button type="button" onClick={() => setActiveTab('ar')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'ar' ? 'bg-brand-600 text-cream-50 shadow-md' : 'text-charcoal-400 dark:text-cream-500 hover:text-charcoal-600 dark:hover:text-cream-300'}`}>{t('العربية (الافتراضي)', 'Arapça (Varsayılan)', 'Arabic (Default)')}</button>
            <button type="button" onClick={() => setActiveTab('tr')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'tr' ? 'bg-cream-50 dark:bg-charcoal-700 text-charcoal-900 dark:text-cream-100 shadow-md' : 'text-charcoal-400 dark:text-cream-500 hover:text-charcoal-600 dark:hover:text-cream-300'}`}>{t('التركية', 'Türkçe', 'Turkish')}</button>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div className="flex-grow space-y-2">
                <label className="text-sm font-bold text-charcoal-700 dark:text-cream-400 block">{t('اسم الطبق', 'Yemek Adı', 'Dish Name')} ({activeTab === 'en' ? t('بالإنجليزية', 'İngilizce', 'English') : activeTab === 'ar' ? t('بالعربية', 'Arapça', 'Arabic') : t('بالتركية', 'Türkçe', 'Turkish')})</label>
                <input
                  type="text"
                  value={activeTab === 'en' ? name : activeTab === 'ar' ? nameAr : nameTr}
                  onChange={e => {
                    if (activeTab === 'en') setName(e.target.value);
                    else if (activeTab === 'ar') setNameAr(e.target.value);
                    else setNameTr(e.target.value);
                  }}
                  placeholder={t('مثال: برجر كلاسيك', 'Örn: Klasik Burger', 'e.g. Classic Burger')}
                  className="w-full px-6 py-4 bg-cream-100 dark:bg-charcoal-800 rounded-2xl border border-cream-200/60 dark:border-charcoal-700 focus:ring-4 focus:ring-brand-50 focus:border-brand-300 outline-none transition-all text-lg font-medium text-charcoal-900 dark:text-cream-100"
                />
              </div>

            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-bold text-charcoal-700 dark:text-cream-400">{t('الوصف', 'Açıklama', 'Description')}</label>
              </div>
              <textarea
                value={activeTab === 'en' ? description : activeTab === 'ar' ? descriptionAr : descriptionTr}
                onChange={e => {
                  if (activeTab === 'en') setDescription(e.target.value);
                  else if (activeTab === 'ar') setDescriptionAr(e.target.value);
                  else setDescriptionTr(e.target.value);
                }}
                rows={4}
                placeholder={t('وصف الطبق...', 'Yemek açıklaması...', 'Dish description...')}
                className="w-full px-6 py-4 bg-cream-100 dark:bg-charcoal-800 rounded-2xl border border-cream-200/60 dark:border-charcoal-700 focus:ring-4 focus:ring-brand-50 focus:border-brand-300 outline-none transition-all resize-none font-medium text-charcoal-900 dark:text-cream-100"
              />
            </div>

            {/* Variants / Options Section */}
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-cream-100">{t('الخيارات / الأنواع (Variants)', 'Seçenekler / Çeşitler (Variants)', 'Options / Variants')}</h3>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="flex items-center gap-1 text-xs font-bold text-charcoal-500 dark:text-cream-500 bg-cream-100 dark:bg-charcoal-800 px-3 py-1.5 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-700 transition-colors"
                >
                  <Plus size={14} /> {t('إضافة نوع', 'Çeşit Ekle', 'Add Variant')}
                </button>
              </div>

              {variants.length > 0 ? (
                <div className="space-y-3">
                  {variants.map((variant, index) => (
                    <div key={variant.id} className="flex flex-col md:flex-row gap-3 p-4 border border-cream-200/60 dark:border-charcoal-700 rounded-xl bg-cream-100 dark:bg-charcoal-800 relative group">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(variant.id)}
                        className={`absolute -top-2 bg-cream-50 dark:bg-charcoal-900 text-red-500 rounded-full p-1 shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 ${isRTL ? '-right-2' : '-left-2'}`}
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] text-charcoal-400 dark:text-cream-500">{t('الاسم (إنجليزي)', 'İsim (İngilizce)', 'Name (English)')}</label>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => handleUpdateVariant(variant.id, 'name', e.target.value)}
                          placeholder="Name"
                          className="w-full px-3 py-2 bg-cream-50 dark:bg-charcoal-900 rounded-lg border border-cream-200/60 dark:border-charcoal-700 text-sm text-charcoal-900 dark:text-cream-100"
                        />
                      </div>

                      <div className="w-24 space-y-1">
                        <label className="text-[10px] text-charcoal-400 dark:text-cream-500">{t(`السعر (${currency})`, `Fiyat (${currency})`, `Price (${currency})`)}</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-charcoal-400 dark:text-cream-600 text-xs">{currency}</span>
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(e) => handleUpdateVariant(variant.id, 'price', parseFloat(e.target.value))}
                            className="w-full pl-6 pr-3 py-2 bg-cream-50 dark:bg-charcoal-900 rounded-lg border border-cream-200/60 dark:border-charcoal-700 text-sm font-bold text-charcoal-700 dark:text-cream-200"
                          />
                        </div>
                      </div>

                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] text-charcoal-400 dark:text-cream-500">{t('عربي', 'Arapça', 'Arabic')}</label>
                        <input
                          type="text"
                          value={variant.nameAr}
                          onChange={(e) => handleUpdateVariant(variant.id, 'nameAr', e.target.value)}
                          placeholder={t('الاسم', 'İsim', 'Name')}
                          className="w-full px-3 py-2 bg-cream-50 dark:bg-charcoal-900 rounded-lg border border-cream-200/60 dark:border-charcoal-700 text-sm text-charcoal-900 dark:text-cream-100"
                        />
                      </div>

                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] text-charcoal-400 dark:text-cream-500">{t('تركي', 'Türkçe', 'Turkish')}</label>
                        <input
                          type="text"
                          value={variant.nameTr}
                          onChange={(e) => handleUpdateVariant(variant.id, 'nameTr', e.target.value)}
                          placeholder={t('İsim', 'İsim', 'Name')}
                          className="w-full px-3 py-2 bg-cream-50 dark:bg-charcoal-900 rounded-lg border border-cream-200/60 dark:border-charcoal-700 text-sm text-charcoal-900 dark:text-cream-100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-cream-200/60 dark:border-charcoal-700 rounded-2xl text-center">
                  <p className="text-xs text-charcoal-400 dark:text-cream-600">{t('يجب إضافة خيارات (مثل: صغير، كبير) لأن السعر الأساسي فارغ', 'Temel fiyat boş olduğu için seçenek eklemelisiniz (örn: küçük, büyük)', 'You must add options (e.g. small, large) because the base price is empty')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center p-4 sm:p-8 border-t border-cream-200/60 dark:border-charcoal-700 gap-3 sm:gap-4 bg-cream-50 dark:bg-charcoal-900">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto order-2 sm:order-1 px-6 sm:px-10 py-3 rounded-2xl border border-cream-300 dark:border-charcoal-700 text-charcoal-600 dark:text-cream-400 font-bold hover:bg-cream-100 dark:hover:bg-charcoal-800 transition-all"
        >
          {t('إلغاء', 'İptal', 'Cancel')}
        </button>
        <button
          onClick={handleSubmit}
          className="w-full sm:w-auto order-1 sm:order-2 px-8 sm:px-12 py-3 rounded-2xl bg-brand-600 text-white font-bold hover:bg-brand-700 shadow-xl shadow-brand-100 dark:shadow-brand-900/20 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1 btn-press"
        >
          <Save size={20} />
          {t('حفظ التغييرات', 'Değişiklikleri Kaydet', 'Save Changes')}
        </button>
      </div>
    </div>
  );
};
