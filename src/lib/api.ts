// src/lib/api.ts
import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import type {
  AuthResponse,
  Category,
  MeResponse,
  Paginated,
  Product,
  Shop,
} from "./types";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

/* =========================================================
   TOKEN STORAGE
   ========================================================= */
export const tokenStore = {
  get access() {
    return localStorage.getItem("mboa_access");
  },
  get refresh() {
    return localStorage.getItem("mboa_refresh");
  },
  set(access: string, refresh: string) {
    localStorage.setItem("mboa_access", access);
    localStorage.setItem("mboa_refresh", refresh);
  },
  clear() {
    localStorage.removeItem("mboa_access");
    localStorage.removeItem("mboa_refresh");
  },
};

/* =========================================================
   AXIOS INSTANCE
   ========================================================= */
export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.access;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      !original._retry &&
      tokenStore.refresh
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(http(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, {
          refresh: tokenStore.refresh,
        });
        tokenStore.set(data.access, data.refresh || tokenStore.refresh!);
        queue.forEach((cb) => cb(data.access));
        queue = [];
        original.headers.Authorization = `Bearer ${data.access}`;
        return http(original);
      } catch {
        tokenStore.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/* =========================================================
   AUTH
   ========================================================= */
export const authApi = {
  // src/lib/api.ts — remplace la fonction register
register: async (payload: {
  username: string;
  password: string;
  email?: string;
  shop_name: string;
  shop_username?: string;
  whatsapp_number: string;
  city?: string;
  tagline?: string;
  delivery_info?: string;
  free_delivery_from?: number | null;
  logo?: File | null;
  banner?: File | null;
}) => {
  const fd = new FormData();
  const put = (k: string, v: string | number | File | null | undefined) => {
    if (v === null || v === undefined || v === "") return;
    fd.append(k, v instanceof File ? v : String(v));
  };
  put("username", payload.username);
  put("password", payload.password);
  put("email", payload.email);
  put("shop_name", payload.shop_name);
  put("shop_username", payload.shop_username);
  put("whatsapp_number", payload.whatsapp_number);
  put("city", payload.city);
  put("tagline", payload.tagline);
  put("delivery_info", payload.delivery_info);
  if (payload.free_delivery_from != null) {
    fd.append("free_delivery_from", String(payload.free_delivery_from));
  }
  if (payload.logo) fd.append("logo", payload.logo);
  if (payload.banner) fd.append("banner", payload.banner);

  return (
    await http.post<AuthResponse>("/auth/register/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  ).data;
},

  login: async (payload: { username: string; password: string }) =>
    (await http.post<AuthResponse>("/auth/login/", payload)).data,

  logout: async () => {
    const refresh = tokenStore.refresh;
    if (refresh) await http.post("/auth/logout/", { refresh });
    tokenStore.clear();
  },

  me: async () => (await http.get<MeResponse>("/auth/me/")).data,

  updateMe: async (payload: { email?: string }) =>
    (await http.patch<MeResponse>("/auth/me/", payload)).data,

  changePassword: async (payload: { old_password: string; new_password: string }) =>
    (await http.post("/auth/change-password/", payload)).data,
};

/* =========================================================
   PUBLIC
   ========================================================= */
export const publicApi = {
  listShops: async (params?: { city?: string; search?: string; page?: number }) =>
    (await http.get<Paginated<Shop>>("/shops/", { params })).data,

  getShop: async (username: string) =>
    (await http.get<Shop>(`/shops/${username}/`)).data,

  listCategories: async (username: string) =>
    (await http.get<Category[]>(`/shops/${username}/categories/`)).data,

  listProducts: async (
    username: string,
    params?: {
      category?: string;
      search?: string;
      ordering?: string;
      min_price?: number;
      max_price?: number;
      page?: number;
    }
  ) =>
    (await http.get<Paginated<Product>>(`/shops/${username}/products/`, { params }))
      .data,

  getProduct: async (username: string, id: string) =>
    (await http.get<Product>(`/shops/${username}/products/${id}/`)).data,

  trackWhatsappClick: async (username: string, productId?: string) =>
    http
      .post(`/shops/${username}/track-whatsapp/`, {
        product_id: productId ?? null,
      })
      .catch(() => {}),
};

/* =========================================================
   OWNER
   ========================================================= */
export const ownerApi = {
  getShop: async () => (await http.get<Shop>("/me/shop/")).data,

  updateShop: async (formData: FormData) =>
    (
      await http.patch<Shop>("/me/shop/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data,

  listCategories: async () => (await http.get<Category[]>("/me/categories/")).data,
  createCategory: async (formData: FormData) =>
    (
      await http.post<Category>("/me/categories/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data,
  updateCategory: async (id: number, formData: FormData) =>
    (
      await http.patch<Category>(`/me/categories/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data,
  deleteCategory: async (id: number) => http.delete(`/me/categories/${id}/`),

  listProducts: async (params?: {
    category?: string;
    search?: string;
    is_active?: string;
    ordering?: string;
    page?: number;
  }) => (await http.get<Paginated<Product>>("/me/products/", { params })).data,

  getProduct: async (id: string) =>
    (await http.get<Product>(`/me/products/${id}/`)).data,

  createProduct: async (formData: FormData) =>
    (
      await http.post<Product>("/me/products/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data,

  updateProduct: async (id: string, formData: FormData) =>
    (
      await http.patch<Product>(`/me/products/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data,

  deleteProduct: async (id: string) => http.delete(`/me/products/${id}/`),
};

/* =========================================================
   HELPERS
   ========================================================= */
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as Record<string, unknown> | undefined;
    if (!data) return "Connexion impossible au serveur.";

    if (typeof data.detail === "string") return data.detail;

    // Prend la première erreur trouvée
    for (const value of Object.values(data)) {
      if (Array.isArray(value) && value.length) return String(value[0]);
      if (typeof value === "string") return value;
    }
    return "Une erreur est survenue.";
  }
  if (err instanceof Error) return err.message;
  return "Une erreur est survenue.";
}