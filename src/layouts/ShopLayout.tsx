// src/layouts/ShopLayout.tsx
import { Outlet } from "react-router-dom";

/**
 * Layout "boutique indépendante" — AUCUNE navbar Mboa237, aucun footer.
 * La page /p/:username gère sa propre navigation (ShopPage a déjà
 * son propre header + footer + bouton WhatsApp flottant).
 */
export default function ShopLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Outlet />
    </div>
  );
}