import { getSupabaseClient } from '../config/branches';
import { MenuItem, Category } from '../types';

// Data mapping helpers
const mapMenuItemFromSupabase = (item: any): MenuItem => ({
    id: item.id || '',
    name: item.name || '',
    description: item.description || '',
    price: item.price || 0,
    discountPrice: item.discount_price,
    category: item.category_id || '',
    imageUrl: item.image_url || '',
    isPopular: item.is_popular || false,
    nameAr: item.name_ar,
    descriptionAr: item.description_ar,
    nameTr: item.name_tr,
    descriptionTr: item.description_tr,
    variants: Array.isArray(item.sub_items) ? item.sub_items : [],
});

const mapMenuItemToSupabase = (item: MenuItem) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    discount_price: item.discountPrice ?? null,
    category_id: item.category || null,
    image_url: item.imageUrl || null,
    is_popular: item.isPopular ?? false,
    name_ar: item.nameAr || null,
    description_ar: item.descriptionAr || null,
    name_tr: item.nameTr || null,
    description_tr: item.descriptionTr || null,
    sub_items: item.variants || [],
});

const mapCategoryFromSupabase = (cat: any): Category => ({
    id: cat.id,
    name: cat.name,
    nameAr: cat.name_ar,
    nameTr: cat.name_tr,
});

const mapCategoryToSupabase = (cat: Category) => ({
    id: cat.id,
    name: cat.name,
    name_ar: cat.nameAr,
    name_tr: cat.nameTr,
});

// Service functions
export const fetchMenu = async (branchId: string): Promise<MenuItem[]> => {
    const supabase = getSupabaseClient(branchId);
    const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('branch_id', branchId);

    if (error) {
        console.error('Error fetching menu:', error);
        throw error;
    }

    return (data || []).map(mapMenuItemFromSupabase);
};

export const fetchCategories = async (branchId: string): Promise<Category[]> => {
    const supabase = getSupabaseClient(branchId);
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('branch_id', branchId);

    if (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }

    return (data || []).map(mapCategoryFromSupabase);
};

export const saveMenuItem = async (branchId: string, item: MenuItem): Promise<void> => {
    const supabase = getSupabaseClient(branchId);
    const payload = { ...mapMenuItemToSupabase(item), branch_id: branchId };
    const { error } = await supabase
        .from('menu_items')
        .upsert(payload);

    if (error) {
        console.error('Error saving menu item:', error);
        throw error;
    }
};

export const deleteMenuItem = async (branchId: string, id: string): Promise<void> => {
    const supabase = getSupabaseClient(branchId);
    const { error, count } = await supabase
        .from('menu_items')
        .delete({ count: 'exact' })
        .eq('id', id)
        .eq('branch_id', branchId);

    if (error) {
        console.error('Error deleting menu item:', error);
        throw error;
    }

    if (count === 0) {
        console.warn(`No menu item found with id ${id} to delete`);
    }
};

export const saveCategory = async (branchId: string, category: Category): Promise<void> => {
    const supabase = getSupabaseClient(branchId);
    const payload = { ...mapCategoryToSupabase(category), branch_id: branchId };
    const { error } = await supabase
        .from('categories')
        .upsert(payload);

    if (error) {
        console.error('Error saving category:', error);
        throw error;
    }
};

export const deleteCategory = async (branchId: string, id: string): Promise<void> => {
    const supabase = getSupabaseClient(branchId);
    const { error, count } = await supabase
        .from('categories')
        .delete({ count: 'exact' })
        .eq('id', id)
        .eq('branch_id', branchId);

    if (error) {
        console.error('Error deleting category:', error);
        throw error;
    }

    if (count === 0) {
        console.warn(`No category found with id ${id} to delete`);
    }
};

export const uploadMenuImage = async (branchId: string, file: File): Promise<string> => {
    const supabase = getSupabaseClient(branchId);
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${branchId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);

    return publicUrl;
};
