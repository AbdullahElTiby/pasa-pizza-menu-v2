import { MenuItem, Category } from '../types';
import { INITIAL_MENU, INITIAL_CATEGORIES } from '../constants';

const MENU_STORAGE_KEY = 'gourmet_ai_menu_v1';
const CATEGORIES_STORAGE_KEY = 'gourmet_ai_categories_v2'; // Bumped version

export const getMenuFromStorage = (): MenuItem[] => {
  try {
    const stored = localStorage.getItem(MENU_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to parse menu from storage", error);
  }
  return INITIAL_MENU;
};

export const saveMenuToStorage = (menu: MenuItem[]): void => {
  try {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menu));
  } catch (error) {
    console.error("Failed to save menu to storage", error);
  }
};

export const getCategoriesFromStorage = (): Category[] => {
  try {
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migration check: if the stored data is an array of strings (old format), convert to objects
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
         return parsed.map((name: string) => ({ id: name, name }));
      }
      return parsed;
    }
  } catch (error) {
    console.error("Failed to parse categories from storage", error);
  }
  return INITIAL_CATEGORIES;
};

export const saveCategoriesToStorage = (categories: Category[]): void => {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error("Failed to save categories to storage", error);
  }
};