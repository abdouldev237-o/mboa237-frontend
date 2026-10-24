// src/lib/types.ts
export type ShopPlan = "FREE" | "PRO";
export type ShopStatus = "ACTIVE" | "SUSPENDED" | "BANNED";
export type ProductBadge = "NEW" | "PROMO" | "HOT" | "";

export interface Shop {
  username: string;
  shop_name: string;
  tagline: string;
  description: string;
  city: string;
  country: string;
  whatsapp_number: string;
  whatsapp_link: string;
  phone_number: string;
  email: string;
  logo: string | null;
  banner: string | null;
  plan: ShopPlan;
  plan_label: string;
  is_pro: boolean;
  status: ShopStatus;
  status_label: string;
  is_verified: boolean;
  delivery_info: string;
  free_delivery_from: number | null;
  views_count: number;
  days_left: number;
  whatsapp_clicks: number;
  products_count: number;
  rating: string;
  max_products: number;
  can_add_product: boolean;
  owner_username: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  emoji: string | null;
  emoji_url: string | null;
  position: number;
  products_count: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  was_price: number | null;
  discount_percent: number;
  image: string | null;
  second_image: string | null;
  third_image: string | null;
  images: string[];
  category: number | null;
  category_name: string | null;
  category_slug: string | null;
  is_active: boolean;
  in_stock: boolean;
  stock: number | null;
  badge: ProductBadge;
  badge_label: string;
  rating: string;
  views_count: number;
  position: number;
  whatsapp_link: string;
  created_at: string;
  updated_at: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string | null;
  };
  shop: {
    username: string;
    shop_name: string;
    city?: string;
    whatsapp_number?: string;
    url: string;
  } | null;
}

export interface MeResponse {
  id: number;
  username: string;
  email: string | null;
  date_joined: string;
  last_login: string | null;
  shop: {
    username: string;
    shop_name: string;
    url: string;
  } | null;
}