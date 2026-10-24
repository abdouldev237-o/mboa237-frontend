// src/App.tsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/Toast";
import { FullPageSpinner } from "@/components/Spinner";
import ProductsListPage from "@/pages/dashboard/ProductsListPage";
import PublicLayout from "@/layouts/PublicLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import ShopLayout from "@/layouts/ShopLayout";


import HomePage from "@/pages/HomePage";
import ShopPage from "@/pages/ShopPage";
import ShopsListPage from "@/pages/ShopsListPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";
import AddProduct from "@/pages/AddProductPage";
import MySubscription from "@/pages/dashboard/MySubscription";
import PaymentCallbackPage from "@/pages/PaymentCallbackPage";

/* ---------- Garde d'authentification ---------- */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <FullPageSpinner label="Vérification de la session…" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
// src/pages/PaymentCallbackPage.tsx




export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* ============================================================
                LAYOUT PUBLIC — Navbar Mboa237 + Footer
                ============================================================ */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shops" element={<ShopsListPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/help" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/payment/callback" element={<PaymentCallbackPage />} />
              
            </Route>

            {/* ============================================================
                LAYOUT DASHBOARD — Navbar Mboa237, pas de Footer
                ============================================================ */}
            <Route element={<DashboardLayout />}>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
  path="/dashboard/products"
  element={
    <ProtectedRoute>
      <ProductsListPage />
    </ProtectedRoute>
  }
/>
              <Route
                path="/dashboard/add/product"
                element={
                  <ProtectedRoute>
                    <AddProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/my-subscription"
                element={
                  <ProtectedRoute>
                    <MySubscription />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/subscription"
                element={
                  <ProtectedRoute>
                    <MySubscription />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route
  path="/dashboard/edit/product/:id"
  element={
    <ProtectedRoute>
      <AddProduct />
    </ProtectedRoute>
  }
/>

            {/* ============================================================
                LAYOUT SHOP — AUCUNE navbar Mboa237
                La page /p/:username a son propre header + footer
                ============================================================ */}
            <Route element={<ShopLayout />}>
              <Route path="/p/:username" element={<ShopPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}