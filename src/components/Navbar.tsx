// src/components/Navbar.tsx
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Store,
  LayoutDashboard,
  LogIn,
  UserPlus,
  LogOut,
  User,
  ShoppingBag,
  Package,
  Tags,
  Settings,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Rocket,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/* =========================================================
   MAIN NAVBAR
   ========================================================= */
export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  /* Ferme la sidebar à chaque changement de route */
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  /* Bloque le scroll quand la sidebar est ouverte */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  /* Ferme avec Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/85 backdrop-blur-xl">
        {/* Ligne décorative dégradée en haut */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#16a34a] to-transparent opacity-70" />

        <div className="container-app flex h-16 items-center justify-between gap-4">
          {/* ---------------- Logo ---------------- */}
          <Link to="/" className="group flex items-center">
            <span className="relative flex h-15 w-20  ">
              <img src="logo.png" className="w-[80px] h-[60px]  object-cover" />
            </span>
            <span className="text-[16px] font-bold tracking-tight hidden sm:flex">Mboa</span>
          </Link>

          {/* ---------------- Nav desktop ---------------- */}
          <nav className="hidden items-center gap-1 md:flex">
            <NavItem to="/" icon={<Home className="h-4 w-4" />}>
              Accueil
            </NavItem>
            <NavItem to="/shops" icon={<Store className="h-4 w-4" />}>
              Boutiques
            </NavItem>
            {isAuthenticated && (
              <NavItem to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
                Dashboard
              </NavItem>
            )}
          </nav>

          {/* ---------------- Actions desktop ---------------- */}
          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="group flex items-center gap-2 rounded-full border border-black/[0.08] bg-white py-1.5 pl-1.5 pr-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-black/20 hover:shadow-md"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#16a34a] to-emerald-700 text-[10.5px] font-bold text-white">
                    {user?.username?.slice(0, 2).toUpperCase() ?? "U"}
                  </span>
                  <span className="text-[13px] font-semibold text-black">
                    @{user?.username}
                  </span>
                </Link>
                <button
                  onClick={() => void logout()}
                  className="group flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-black/60 transition-all duration-300 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
                  aria-label="Déconnexion"
                  title="Déconnexion"
                >
                  <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13.5px] font-medium text-black/70 transition hover:bg-black/5 hover:text-black"
                >
                  <LogIn className="h-4 w-4" />
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-black px-4 py-2 text-[13.5px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/85 hover:shadow-lg hover:shadow-black/20 active:scale-[0.98]"
                >
                  <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[420%]" />
                  <Sparkles className="relative h-3.5 w-3.5" />
                  <span className="relative">Créer ma boutique</span>
                </Link>
              </>
            )}
          </div>

          {/* ---------------- Burger mobile ---------------- */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white transition-all duration-300 hover:border-[#16a34a]/30 hover:bg-[#16a34a]/5 active:scale-95 md:hidden"
          >
            <Menu className="h-5 w-5 text-black transition-transform duration-300 group-hover:scale-110" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#16a34a]" />
          </button>
        </div>
      </header>

      {/* =========================================================
          SIDEBAR MOBILE
          ========================================================= */}
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

/* =========================================================
   NAV ITEM (desktop)
   ========================================================= */
function NavItem({
  to,
  icon,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `group relative flex items-center gap-2 rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-all duration-300 ${
          isActive
            ? "bg-[#16a34a]/10 text-[#16a34a]"
            : "text-black/60 hover:bg-black/[0.04] hover:text-black"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="transition-transform duration-300 group-hover:scale-110">
            {icon}
          </span>
          {children}
          {isActive && (
            <span className="absolute -bottom-px left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-[#16a34a]" />
          )}
        </>
      )}
    </NavLink>
  );
}

/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */
function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div
      className={`fixed inset-0 z-[60] md:hidden ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* -------- Overlay -------- */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* -------- Panneau -------- */}
      <aside
        className={`absolute right-0 top-0 flex h-full w-[88%] max-w-[380px] flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-[550ms] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* Décor d'arrière-plan */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -right-24 h-64 w-64 rounded-full bg-emerald-100/60 blur-[90px]" />
          <div className="absolute bottom-0 -left-24 h-64 w-64 rounded-full bg-teal-50 blur-[90px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.04)_1px,transparent_0)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_40%,#000_30%,transparent_100%)]" />
        </div>

        {/* -------- En-tête -------- */}
        <div className="flex items-center justify-between border-b border-black/[0.07] px-5 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#16a34a] to-emerald-700 text-[12.5px] font-bold text-white shadow-md shadow-emerald-600/25">
              M2
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-300 ring-2 ring-white" />
            </span>
            <span className="text-[15px] font-bold tracking-tight">Mboa237</span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="group flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white transition-all duration-300 hover:rotate-90 hover:border-black/25 hover:bg-black/[0.04]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* -------- Corps -------- */}
        <div className="flex flex-1 flex-col overflow-y-auto px-5 py-6">
          {/* -------- Carte utilisateur -------- */}
          {isAuthenticated && user && (
            <div
              className="mb-6 overflow-hidden rounded-2xl border border-black/[0.06] bg-gradient-to-br from-[#16a34a]/5 via-white to-white p-4"
              style={
                open
                  ? { animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both" }
                  : undefined
              }
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#16a34a] to-emerald-700 text-[14px] font-bold text-white shadow-md">
                    {user.username.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14.5px] font-bold">
                    @{user.username}
                  </div>
                  <div className="mt-0.5 text-[12px] text-black/50">
                    Propriétaire de boutique
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------- Navigation -------- */}
          <SidebarSection label="Navigation">
            <SidebarItem
              to="/"
              icon={<Home className="h-[18px] w-[18px]" />}
              onClick={onClose}
              open={open}
              index={0}
            >
              Accueil
            </SidebarItem>
            <SidebarItem
              to="/shops"
              icon={<Store className="h-[18px] w-[18px]" />}
              onClick={onClose}
              open={open}
              index={1}
            >
              Boutiques
            </SidebarItem>
          </SidebarSection>

          {/* -------- Espace vendeur -------- */}
          {isAuthenticated && (
            <SidebarSection label="Espace vendeur">
              <SidebarItem
                to="/dashboard"
                icon={<LayoutDashboard className="h-[18px] w-[18px]" />}
                onClick={onClose}
                open={open}
                index={2}
              >
                Tableau de bord
              </SidebarItem>
              <SidebarItem
                to="/dashboard/products"
                icon={<Package className="h-[18px] w-[18px]" />}
                onClick={onClose}
                open={open}
                index={3}
              >
                Mes produits
              </SidebarItem>
              <SidebarItem
                to="/dashboard/categories"
                icon={<Tags className="h-[18px] w-[18px]" />}
                onClick={onClose}
                open={open}
                index={4}
              >
                Catégories
              </SidebarItem>
              <SidebarItem
                to="/dashboard/shop"
                icon={<Settings className="h-[18px] w-[18px]" />}
                onClick={onClose}
                open={open}
                index={5}
              >
                Ma boutique
              </SidebarItem>
            </SidebarSection>
          )}

          {/* -------- Aide -------- */}
          <SidebarSection label="Aide">
            <SidebarItem
              to="/help"
              icon={<HelpCircle className="h-[18px] w-[18px]" />}
              onClick={onClose}
              open={open}
              index={6}
            >
              Centre d'aide
            </SidebarItem>
          </SidebarSection>

          {/* -------- Carte promo (visiteur non connecté) -------- */}
          {!isAuthenticated && (
            <div
              className="mt-6 overflow-hidden rounded-2xl border border-black/[0.06] bg-gradient-to-br from-[#16a34a]/8 via-white to-white p-4"
              style={
                open
                  ? { animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.4s both" }
                  : undefined
              }
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#16a34a] text-white shadow-md shadow-emerald-600/25">
                  <Rocket className="h-[18px] w-[18px]" />
                </span>
                <div className="leading-tight">
                  <div className="text-[13.5px] font-bold">Prêt à vendre ?</div>
                  <div className="text-[11.5px] text-black/55">
                    30 secondes pour démarrer
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[12.5px] leading-relaxed text-black/60">
                Crée ta boutique gratuite et encaisse via Mobile Money.
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#16a34a] to-emerald-400"
                  style={{
                    width: open ? "80%" : "0%",
                    transition: "width 1.4s cubic-bezier(0.16,1,0.3,1) 0.5s",
                  }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="font-medium text-black/50">80% des places prises</span>
                <span className="font-semibold text-[#16a34a]">Gratuit</span>
              </div>
            </div>
          )}
        </div>

        {/* -------- Pied : actions auth -------- */}
        <div className="relative border-t border-black/[0.07] bg-white/85 px-5 pb-5 pt-4 backdrop-blur">
          {isAuthenticated ? (
            <button
              onClick={() => {
                void logout();
                onClose();
              }}
              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/50 py-3 text-[14px] font-semibold text-rose-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 active:scale-[0.98]"
              style={
                open
                  ? { animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.55s both" }
                  : undefined
              }
            >
              <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              Déconnexion
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white py-3 text-[14px] font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:border-black/25 active:scale-[0.98]"
                style={
                  open
                    ? { animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.5s both" }
                    : undefined
                }
              >
                <LogIn className="h-4 w-4" />
                Connexion
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-black py-3 text-[14px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/85 hover:shadow-lg hover:shadow-black/20 active:scale-[0.98]"
                style={
                  open
                    ? { animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.6s both" }
                    : undefined
                }
              >
                <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[420%]" />
                <UserPlus className="relative h-4 w-4" />
                <span className="relative">Créer ma boutique</span>
              </Link>
            </div>
          )}
        </div>

        {/* Safe area iOS */}
        <div className="h-[env(safe-area-inset-bottom)] bg-white" />
      </aside>

      {/* -------- Styles locaux -------- */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   SIDEBAR SECTION
   ========================================================= */
function SidebarSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-black/35">
        {label}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

/* =========================================================
   SIDEBAR ITEM
   ========================================================= */
function SidebarItem({
  to,
  icon,
  children,
  onClick,
  open,
  index = 0,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  open?: boolean;
  index?: number;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      onClick={onClick}
      style={
        open
          ? {
              animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${
                0.15 + index * 0.05
              }s both`,
            }
          : undefined
      }
      className={({ isActive }) =>
        `group relative flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-[14.5px] font-medium transition-all duration-300 ${
          isActive
            ? "bg-[#16a34a]/10 text-[#16a34a]"
            : "text-black/70 hover:bg-black/[0.04] hover:text-black"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="flex items-center gap-3">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                isActive
                  ? "bg-[#16a34a] text-white shadow-md shadow-emerald-600/25"
                  : "bg-black/[0.05] text-black/60 group-hover:bg-[#16a34a]/10 group-hover:text-[#16a34a]"
              }`}
            >
              {icon}
            </span>
            <span className="truncate">{children}</span>
          </span>
          <ChevronRight
            className={`h-4 w-4 shrink-0 transition-all duration-300 ${
              isActive
                ? "text-[#16a34a]"
                : "text-black/20 group-hover:translate-x-0.5 group-hover:text-[#16a34a]"
            }`}
          />
        </>
      )}
    </NavLink>
  );
}