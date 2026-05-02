export interface Category {
  id: string;
  name: string; // English / Default
  nameAr?: string;
  nameTr?: string;
}

export type Language = 'en' | 'ar' | 'tr';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string; // References Category.id (English name)
  imageUrl?: string;
  isPopular?: boolean;

  // Localization (Optional)
  nameAr?: string;
  descriptionAr?: string;
  nameTr?: string;
  descriptionTr?: string;

  variants?: Variant[];
}

export interface Variant {
  id: string;
  name: string; // English
  nameAr: string;
  nameTr: string;
  price: number;
}

export type MenuState = MenuItem[];

export interface CartItem {
  id: string; // Unique cart item ID (e.g. timestamp)
  menuItemId: string;
  name: string;
  nameAr?: string;
  nameTr?: string;
  price: number;
  quantity: number;
  variantName?: string;
  variantNameAr?: string;
  variantNameTr?: string;
  imageUrl?: string;
}

export type CartState = CartItem[];