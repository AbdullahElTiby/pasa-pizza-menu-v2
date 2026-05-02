import { MenuItem, Category } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'Starters', name: 'Starters', nameAr: 'مقبلات', nameTr: 'Başlangıçlar' },
  { id: 'Mains', name: 'Mains', nameAr: 'الأطباق الرئيسية', nameTr: 'Ana Yemekler' },
  { id: 'Desserts', name: 'Desserts', nameAr: 'حلويات', nameTr: 'Tatlılar' },
  { id: 'Drinks', name: 'Drinks', nameAr: 'مشروبات', nameTr: 'İçecekler' }
];

export const INITIAL_MENU: MenuItem[] = [
  {
    id: '1',
    name: 'Truffle Arancini',
    description: 'Crispy risotto balls infused with black truffle oil, served with a garlic aioli dipping sauce.',
    price: 12,
    category: 'Starters',
    imageUrl: 'https://picsum.photos/400/300?random=1',
    isPopular: true
  },
  {
    id: '2',
    name: 'Pan-Seared Scallops',
    description: 'Jumbo scallops seared to perfection, served on a bed of pea purée with crispy pancetta.',
    price: 18,
    category: 'Starters',
    imageUrl: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: '3',
    name: 'Wagyu Beef Burger',
    description: 'Premium Wagyu beef patty, brioche bun, aged cheddar, caramelized onions, and our signature truffle mayo.',
    price: 24,
    discountPrice: 19.50,
    category: 'Mains',
    imageUrl: 'https://picsum.photos/400/300?random=3',
    isPopular: true
  },
  {
    id: '4',
    name: 'Lobster Ravioli',
    description: 'Handmade pasta filled with fresh lobster meat, tossed in a creamy saffron and cherry tomato sauce.',
    price: 32,
    category: 'Mains',
    imageUrl: 'https://picsum.photos/400/300?random=4'
  },
  {
    id: '5',
    name: 'Tiramisu Classico',
    description: 'Traditional Italian dessert with layers of espresso-soaked ladyfingers and mascarpone cream.',
    price: 10,
    category: 'Desserts',
    imageUrl: 'https://picsum.photos/400/300?random=5'
  },
  {
    id: '6',
    name: 'Artisan Lemonade',
    description: 'Freshly squeezed lemons with a hint of mint and crushed ice.',
    price: 6,
    category: 'Drinks',
    imageUrl: 'https://picsum.photos/400/300?random=6'
  }
];