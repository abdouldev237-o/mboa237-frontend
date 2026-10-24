// src/pages/AddProduct.tsx
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  Coins,
  Eye,
  FileText,
  ImagePlus,
  Info,
  Loader2,
  MessageCircle,
  Package,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { getErrorMessage, ownerApi } from "@/lib/api";
import type { Category} from "@/lib/types";
import { useToast } from "@/components/Toast";
import { Field } from "@/components/Field";

/* =========================================================
   HELPERS
   ========================================================= */
function fmtFcfa(n: number) {
  return n.toLocaleString("fr-FR").replace(/\u202f/g, " ").replace(/\u00a0/g, " ") + " F";
}

type ProductBadge = "" | "NEW" | "PROMO" | "HOT";

type FormState = {
  name: string;
  description: string;
  price: string;
  was_price: string;
  category: string;
  stock: string;
  badge: ProductBadge;
  is_active: boolean;
  position: string;
  image: File | null;
  second_image: File | null;
  third_image: File | null;
};

type ExistingImages = {
  image: string | null;
  second: string | null;
  third: string | null;
};

const EMPTY: FormState = {
  name: "",
  description: "",
  price: "",
  was_price: "",
  category: "",
  stock: "",
  badge: "",
  is_active: true,
  position: "0",
  image: null,
  second_image: null,
  third_image: null,
};

const EMPTY_EXISTING: ExistingImages = { image: null, second: null, third: null };

/* =========================================================
   MAIN
   ========================================================= */
export default function AddProduct() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImages>(EMPTY_EXISTING);

  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Modal catégorie */
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catEditing, setCatEditing] = useState<Category | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  /* ---------- Chargement initial ---------- */
  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      setCategories(await ownerApi.listCategories());
    } catch {
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    (async () => {
      await loadCategories();

      if (isEdit && id) {
        setLoadingInitial(true);
        try {
          const p = await ownerApi.getProduct(id);
          setForm({
            name: p.name,
            description: p.description || "",
            price: String(p.price),
            was_price: p.was_price ? String(p.was_price) : "",
            category: p.category ? String(p.category) : "",
            stock: p.stock !== null && p.stock !== undefined ? String(p.stock) : "",
            badge: (p.badge as ProductBadge) || "",
            is_active: p.is_active,
            position: String(p.position || 0),
            image: null,
            second_image: null,
            third_image: null,
          });
          setExistingImages({
            image: p.image || p.images?.[0] || null,
            second: p.second_image || null,
            third: p.third_image || null,
          });
        } catch (e) {
          setError(getErrorMessage(e));
        } finally {
          setLoadingInitial(false);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  /* ---------- Derived ---------- */
  const priceNum = Number(form.price) || 0;
  const wasNum = Number(form.was_price) || 0;
  const discount =
    wasNum > priceNum && wasNum > 0 ? Math.round(((wasNum - priceNum) / wasNum) * 100) : 0;

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.id) === form.category) || null,
    [categories, form.category]
  );

  /* ---------- Submit ---------- */
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.name.trim().length < 2) {
      setError("Le nom du produit doit faire au moins 2 caractères.");
      return;
    }
    if (!form.price || priceNum < 0) {
      setError("Le prix est obligatoire.");
      return;
    }
    if (wasNum > 0 && wasNum <= priceNum) {
      setError("Le prix barré doit être supérieur au prix actuel.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("description", form.description.trim());
      fd.append("price", String(priceNum));
      fd.append("was_price", wasNum > 0 ? String(wasNum) : "");
      fd.append("category", form.category || "");
      fd.append("stock", form.stock !== "" ? form.stock : "");
      fd.append("badge", form.badge);
      fd.append("is_active", String(form.is_active));
      fd.append("position", form.position || "0");

      /* Images nouvelles */
      if (form.image) fd.append("image", form.image);
      if (form.second_image) fd.append("second_image", form.second_image);
      if (form.third_image) fd.append("third_image", form.third_image);

      /* Images existantes retirées → envoyer une chaîne vide pour effacer */
      if (isEdit) {
        if (!form.image && !existingImages.image) fd.append("image", "");
        if (!form.second_image && !existingImages.second) fd.append("second_image", "");
        if (!form.third_image && !existingImages.third) fd.append("third_image", "");
      }

      if (isEdit && id) {
        await ownerApi.updateProduct(id, fd);
        toast.success("Produit mis à jour");
      } else {
        await ownerApi.createProduct(fd);
        toast.success("Produit publié 🎉");
      }
      navigate("/dashboard/products");
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Delete product ---------- */
  const onDelete = async () => {
    if (!id) return;
    if (!window.confirm("Supprimer définitivement ce produit ?")) return;
    setDeleting(true);
    try {
      await ownerApi.deleteProduct(id);
      toast.success("Produit supprimé");
      navigate("/dashboard/products");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  /* ---------- Catégorie : création / édition ---------- */
  const openCreateCategory = () => {
    setCatEditing(null);
    setCatModalOpen(true);
  };

  const openEditCategory = () => {
    if (!selectedCategory) return;
    setCatEditing(selectedCategory);
    setCatModalOpen(true);
  };

  const onCategorySaved = async (saved: Category, isNew: boolean) => {
    await loadCategories();
    set("category", String(saved.id));
    if (isNew) toast.success(`Catégorie « ${saved.name} » créée`);
    else toast.success("Catégorie mise à jour");
  };

  /* ---------- Loading initial (edit) ---------- */
  if (loadingInitial) {
    return (
      <main className="container-app py-10">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
          <p className="text-sm text-slate-500">Chargement du produit…</p>
        </div>
      </main>
    );
  }

  /* =========================================================
     RENDER
     ========================================================= */
  return (
    <main className="container-app min-h-screen py-6 pb-24 sm:py-9">
      <style>{`
        @keyframes add-in { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes modal-in { from { opacity:0; transform: translateY(16px) scale(.97) } to { opacity:1; transform: translateY(0) scale(1) } }
        @keyframes backdrop-in { from { opacity:0 } to { opacity:1 } }
        .add-in { animation:add-in .55s cubic-bezier(.2,.7,.2,1) both }
        .add-in-1 { animation-delay:.08s } .add-in-2 { animation-delay:.16s } .add-in-3 { animation-delay:.24s }
        .modal-in { animation: modal-in .35s cubic-bezier(.16,1,.3,1) both }
        .backdrop-in { animation: backdrop-in .25s ease both }
        @media(prefers-reduced-motion:reduce){ .add-in, .modal-in, .backdrop-in{animation:none!important} }
      `}</style>

      {/* ============================================================
          HEADER
          ============================================================ */}
      <header className="add-in flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/products"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:-translate-x-0.5 hover:border-emerald-300 hover:text-emerald-700"
            aria-label="Retour"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-800">
              {isEdit ? <FileText size={13} /> : <Plus size={13} />}
              {isEdit ? "Modifier le produit" : "Ajouter un produit"}
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-3xl">
              {isEdit ? "Modifie les détails" : "Crée un nouvel article"}
            </h1>
            <p className="mt-1 text-[13.5px] text-slate-500">
              {isEdit
                ? "Ajuste les infos, les prix ou remplace les images."
                : "Remplis les champs ci-dessous et publie ton article en un clic."}
            </p>
          </div>
        </div>

        <Link
          to="/dashboard/products"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13.5px] font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700"
        >
          <Package size={15} />
          Tous mes produits
        </Link>
      </header>

      {/* ============================================================
          ERREUR
          ============================================================ */}
      {error && (
        <div className="add-in add-in-1 mt-6 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-[13.5px] font-medium text-rose-700">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ============================================================
          GRID : formulaire + aperçu
          ============================================================ */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
        {/* ============================================================
            FORMULAIRE
            ============================================================ */}
        <form onSubmit={onSubmit} className="space-y-6">
          {/* ---------- SECTION 1 : Infos de base ---------- */}
          <Section
            step={1}
            title="Informations"
            subtitle="Nom et description de ton article"
            icon={<Package size={16} />}
          >
            <Field
              label="Nom du produit"
              value={form.name}
              onChange={(v) => set("name", v)}
              placeholder="Ex : Gas Cooker 4 brûleurs"
              icon={<Package size={18} />}
              required
            />
            <FieldText
              label="Description"
              value={form.description}
              onChange={(v) => set("description", v)}
              placeholder="Ex : Cuisinière à gaz inox, allumage automatique, 4 foyers…"
              icon={<FileText size={18} />}
              required={false}
            />
          </Section>

          {/* ---------- SECTION 2 : Prix ---------- */}
          <Section
            step={2}
            title="Prix"
            subtitle="Le prix et la promotion éventuelle"
            icon={<Coins size={16} />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Prix actuel"
                type="number"
                value={form.price}
                onChange={(v) => set("price", v.replace(/[^\d]/g, ""))}
                placeholder="45000"
                icon={<Coins size={18} />}
                hint="FCFA"
                required
              />
              <Field
                label="Prix barré"
                type="number"
                value={form.was_price}
                onChange={(v) => set("was_price", v.replace(/[^\d]/g, ""))}
                placeholder="55000"
                icon={<Coins size={18} />}
                hint="Optionnel"
                required={false}
              />
            </div>

            {discount > 0 && (
              <div className="anim-pop-in flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 px-3.5 py-2.5">
                <Sparkles size={15} className="text-rose-600" />
                <span className="text-[13px] font-bold text-rose-700">
                  Remise affichée : -{discount}%
                </span>
              </div>
            )}
          </Section>

          {/* ---------- SECTION 3 : Images ---------- */}
          <Section
            step={3}
            title="Images"
            subtitle="Jusqu'à 3 photos — la 1re est l'image principale"
            icon={<ImagePlus size={16} />}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <FileUpload
                label="Image principale"
                hint="Carré conseillé"
                value={form.image}
                existingUrl={existingImages.image}
                onChange={(f) => set("image", f)}
                onRemoveExisting={() =>
                  setExistingImages((prev) => ({ ...prev, image: null }))
                }
                aspect="square"
              />
              <FileUpload
                label="Image 2"
                hint="Optionnel"
                value={form.second_image}
                existingUrl={existingImages.second}
                onChange={(f) => set("second_image", f)}
                onRemoveExisting={() =>
                  setExistingImages((prev) => ({ ...prev, second: null }))
                }
                aspect="square"
              />
              <FileUpload
                label="Image 3"
                hint="Optionnel"
                value={form.third_image}
                existingUrl={existingImages.third}
                onChange={(f) => set("third_image", f)}
                onRemoveExisting={() =>
                  setExistingImages((prev) => ({ ...prev, third: null }))
                }
                aspect="square"
              />
            </div>
          </Section>

          {/* ---------- SECTION 4 : Organisation ---------- */}
          <Section
            step={4}
            title="Organisation"
            subtitle="Catégorie, stock et position d'affichage"
            icon={<Tag size={16} />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {/* CATÉGORIE avec bouton + et crayon */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[12.5px] font-bold text-slate-700">
                    Catégorie <span className="font-normal text-slate-400">(optionnel)</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {selectedCategory && (
                      <button
                        type="button"
                        onClick={openEditCategory}
                        className="inline-flex h-7 items-center gap-1 rounded-lg bg-slate-100 px-2 text-[11px] font-bold text-slate-600 transition hover:bg-slate-200"
                        title="Modifier cette catégorie"
                      >
                        <Pencil size={11} /> Modifier
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="relative flex min-h-14 flex-1 items-center rounded-2xl border border-slate-200 bg-white transition duration-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Tag size={18} />
                    </span>
                    <select
                      value={form.category}
                      onChange={(e) => set("category", e.target.value)}
                      className="w-full appearance-none rounded-2xl bg-transparent py-3 pl-12 pr-10 text-sm text-slate-900 outline-none"
                    >
                      <option value="">
                        {loadingCategories
                          ? "Chargement…"
                          : categories.length === 0
                            ? "Aucune catégorie — clique sur +"
                            : "Sans catégorie"}
                      </option>
                      {categories.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <ChevronDown size={16} />
                    </span>
                  </span>

                  {/* Bouton + : ouvrir le modal de création */}
                  <button
                    type="button"
                    onClick={openCreateCategory}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-lg active:scale-95"
                    title="Créer une nouvelle catégorie"
                  >
                    <Plus size={20} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Helper si aucune catégorie */}
                {!loadingCategories && categories.length === 0 && (
                  <p className="mt-2 flex items-center gap-1.5 text-[12px] text-emerald-700">
                    <Info size={12} />
                    Crée ta première catégorie pour mieux organiser ton catalogue.
                  </p>
                )}
              </div>

              <Field
                label="Stock"
                type="number"
                value={form.stock}
                onChange={(v) => set("stock", v.replace(/[^\d]/g, ""))}
                placeholder="Laisser vide = illimité"
                icon={<Package size={18} />}
                hint="Optionnel"
                required={false}
              />
            </div>

            <Field
              label="Position d'affichage"
              type="number"
              value={form.position}
              onChange={(v) => set("position", v.replace(/[^\d]/g, ""))}
              placeholder="0"
              icon={<TrendingUp size={18} />}
              hint="0 = affiché en premier"
              required={false}
            />
          </Section>

          {/* ---------- SECTION 5 : Visibilité ---------- */}
          <Section
            step={5}
            title="Visibilité"
            subtitle="Badge et état de publication"
            icon={<Zap size={16} />}
          >
            {/* Badges */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[12.5px] font-bold text-slate-700">Badge</span>
                <span className="text-[11.5px] font-medium text-slate-400">(optionnel)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "" as const, label: "Aucun", cls: "bg-slate-100 text-slate-600" },
                  { id: "NEW" as const, label: "Nouveau", cls: "bg-sky-100 text-sky-700" },
                  { id: "PROMO" as const, label: "Promo", cls: "bg-rose-100 text-rose-700" },
                  { id: "HOT" as const, label: "Populaire", cls: "bg-orange-100 text-orange-700" },
                ].map((b) => (
                  <button
                    key={b.id || "none"}
                    type="button"
                    onClick={() => set("badge", b.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] font-bold transition-all duration-200 ${
                      form.badge === b.id
                        ? "border-slate-900 bg-slate-900 text-white shadow-md"
                        : `border-transparent ${b.cls} hover:scale-105`
                    }`}
                  >
                    {form.badge === b.id && <Check size={12} strokeWidth={3} />}
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle is_active */}
            <button
              type="button"
              onClick={() => set("is_active", !form.is_active)}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                form.is_active
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    form.is_active ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Eye size={17} />
                </span>
                <span>
                  <span className="block text-[14px] font-extrabold text-slate-900">
                    {form.is_active ? "Visible publiquement" : "Masqué"}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-slate-500">
                    {form.is_active
                      ? "Le produit apparaît dans ta boutique"
                      : "Personne ne peut le voir pour l'instant"}
                  </span>
                </span>
              </span>
              <span
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
                  form.is_active ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${
                    form.is_active ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          </Section>

          {/* ---------- SUBMIT + DELETE ---------- */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading || deleting}
              className="group relative flex min-h-14 flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-emerald-700 px-6 py-4 text-[14.5px] font-extrabold text-white shadow-lg shadow-emerald-700/25 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[420%]" />
              {loading ? (
                <>
                  <Loader2 className="relative h-4 w-4 animate-spin" />
                  <span className="relative">{isEdit ? "Enregistrement…" : "Publication…"}</span>
                </>
              ) : (
                <>
                  {isEdit ? <Save className="relative h-4 w-4" /> : <Upload className="relative h-4 w-4" />}
                  <span className="relative">
                    {isEdit ? "Enregistrer les modifications" : "Publier le produit"}
                  </span>
                </>
              )}
            </button>

            {isEdit && (
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting || loading}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-5 py-4 text-[14.5px] font-bold text-rose-600 transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Suppression…
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Supprimer
                  </>
                )}
              </button>
            )}

            <Link
              to="/dashboard/products"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-[14.5px] font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              Annuler
            </Link>
          </div>
        </form>

        {/* ============================================================
            APERÇU STICKY
            ============================================================ */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-5">
            <ProductPreview
              form={form}
              existing={existingImages}
              discount={discount}
              priceNum={priceNum}
              wasNum={wasNum}
            />
            <WhatsappMessagePreview name={form.name} price={priceNum} />
            <div className="flex items-start gap-2.5 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 text-[12.5px] leading-5 text-sky-900">
              <Info size={15} className="mt-0.5 shrink-0 text-sky-700" />
              <div>
                <span className="font-bold">Astuce :</span> les articles avec 3 belles photos sont
                4× plus commandés. Prends tes photos en lumière naturelle.
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ============================================================
          MODAL CATÉGORIE
          ============================================================ */}
      <CategoryModal
        open={catModalOpen}
        category={catEditing}
        onClose={() => setCatModalOpen(false)}
        onSaved={onCategorySaved}
        onDeleted={async () => {
          await loadCategories();
          set("category", "");
        }}
      />
    </main>
  );
}

/* =========================================================
   SECTION
   ========================================================= */
function Section({
  step,
  title,
  subtitle,
  icon,
  children,
}: {
  step: number;
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_6px_24px_-18px_rgba(19,49,31,0.12)]">
      <header className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-[12.5px] font-black text-white shadow-sm">
          {step}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-extrabold tracking-[-0.01em] text-slate-900">{title}</h2>
          <p className="mt-0.5 text-[12.5px] text-slate-500">{subtitle}</p>
        </div>
        <span className="hidden shrink-0 text-slate-300 sm:block">{icon}</span>
      </header>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

/* =========================================================
   FIELD TEXT
   ========================================================= */
function FieldText({
  label,
  value,
  onChange,
  placeholder,
  icon,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-[12.5px] font-bold text-slate-700">
        <span>
          {label}
          {!required && <span className="ml-1 font-normal text-slate-400">(optionnel)</span>}
        </span>
      </span>
      <span className="flex min-h-[110px] items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
        {icon && <span className="mt-1 shrink-0 text-slate-400">{icon}</span>}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="min-w-0 flex-1 resize-none bg-transparent py-1 text-sm text-slate-900 outline-none placeholder:text-slate-300"
        />
      </span>
    </label>
  );
}

/* =========================================================
   FILE UPLOAD (fix retrait d'image existante)
   ========================================================= */
function FileUpload({
  label,
  hint,
  value,
  existingUrl,
  onChange,
  onRemoveExisting,
  aspect = "square",
}: {
  label: string;
  hint?: string;
  value: File | null;
  existingUrl?: string | null;
  onChange: (f: File | null) => void;
  onRemoveExisting: () => void;
  aspect?: "square" | "wide";
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const pick = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;
    onChange(file);
  };

  const onInput = (e: ChangeEvent<HTMLInputElement>) => pick(e.target.files?.[0] ?? null);
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files?.[0] ?? null);
  };

  const ratio = aspect === "wide" ? "aspect-[3/1]" : "aspect-square";
  const src = preview || existingUrl || null;

  const handleRemove = () => {
    if (value) onChange(null); // retire le fichier nouveau
    if (existingUrl) onRemoveExisting(); // marque l'image existante comme supprimée
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[12.5px] font-bold text-slate-700">{label}</span>
        {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
      </div>

      {src ? (
        <div className={`group relative overflow-hidden rounded-2xl border border-slate-200 ${ratio}`}>
          <img src={src} alt={label} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 backdrop-blur-sm transition group-hover:bg-black/45 group-hover:opacity-100">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[12px] font-bold text-slate-700 transition hover:bg-slate-100"
              >
                <Upload size={13} />
                Remplacer
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[12px] font-bold text-rose-600 transition hover:bg-rose-50"
              >
                <Trash2 size={13} />
                Retirer
              </button>
            </div>
          </div>
          {value && (
            <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
              {value.name.slice(0, 20)}
            </span>
          )}
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed px-3 text-center transition-all duration-300 ${ratio} ${
            dragging
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-200 bg-slate-50/60 hover:border-emerald-400 hover:bg-emerald-50/40"
          }`}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <ImagePlus size={19} />
          </span>
          <div>
            <div className="text-[12px] font-bold text-slate-700">Clique ou dépose</div>
            <div className="mt-0.5 text-[10.5px] text-slate-400">PNG, JPG · max 5 Mo</div>
          </div>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={onInput} className="hidden" />
    </div>
  );
}

/* =========================================================
   PRODUCT PREVIEW
   ========================================================= */
function ProductPreview({
  form,
  existing,
  discount,
  priceNum,
  wasNum,
}: {
  form: FormState;
  existing: ExistingImages;
  discount: number;
  priceNum: number;
  wasNum: number;
}) {
  const [imgPreview, setImgPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!form.image) {
      setImgPreview(null);
      return;
    }
    const url = URL.createObjectURL(form.image);
    setImgPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.image]);

  const cover = imgPreview || existing.image || null;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_50px_-25px_rgba(0,0,0,0.15)]">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <Eye size={12} /> Aperçu live
        </span>
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <div className="p-3.5">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-stone-100">
          {cover ? (
            <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
              <Package size={44} strokeWidth={1.2} />
            </div>
          )}
          {form.badge && (
            <span
              className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10.5px] font-black uppercase tracking-wider shadow ${
                form.badge === "PROMO"
                  ? "bg-rose-500 text-white"
                  : form.badge === "NEW"
                    ? "bg-sky-500 text-white"
                    : "bg-orange-500 text-white"
              }`}
            >
              {form.badge === "PROMO" ? "Promo" : form.badge === "NEW" ? "Nouveau" : "Populaire"}
            </span>
          )}
          {discount > 0 && (
            <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2 py-0.5 text-[10.5px] font-black text-rose-600 shadow">
              -{discount}%
            </span>
          )}
          {!form.is_active && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-slate-900">
                Masqué
              </span>
            </div>
          )}
        </div>

        <div className="mt-3.5">
          <h4 className="line-clamp-2 text-[14.5px] font-extrabold leading-tight text-slate-900">
            {form.name || "Nom du produit"}
          </h4>
          {form.description && (
            <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-slate-500">
              {form.description}
            </p>
          )}
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-[16px] font-black text-slate-900 tabular-nums">
              {priceNum > 0 ? fmtFcfa(priceNum) : "0 F"}
            </span>
            {wasNum > priceNum && wasNum > 0 && (
              <span className="text-[12px] font-medium text-slate-400 line-through tabular-nums">
                {fmtFcfa(wasNum)}
              </span>
            )}
          </div>

          <button
            type="button"
            tabIndex={-1}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-[12.5px] font-bold text-white"
          >
            <MessageCircle size={13} />
            Commander
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   WHATSAPP PREVIEW
   ========================================================= */
function WhatsappMessagePreview({ name, price }: { name: string; price: number }) {
  const msg = `Bonjour Mboa237 👋

Je souhaite commander :

• ${name || "Nom du produit"}
  ${price > 0 ? fmtFcfa(price) : "0 F"}

Merci de me confirmer la disponibilité.`;

  return (
    <div className="rounded-3xl border border-emerald-100 bg-emerald-50/40 p-4">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#16a34a] text-white">
          <MessageCircle size={13} />
        </span>
        <span className="text-[11.5px] font-bold uppercase tracking-wider text-emerald-800">
          Message WhatsApp généré
        </span>
      </div>
      <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-emerald-100 bg-white p-3 font-sans text-[11.5px] leading-5 text-slate-700">
        {msg}
      </pre>
    </div>
  );
}

/* =========================================================
   MODAL CATÉGORIE  (créer + éditer + supprimer)
   ========================================================= */
function CategoryModal({
  open,
  category,
  onClose,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSaved: (c: Category, isNew: boolean) => void;
  onDeleted: () => void;
}) {
  const isEdit = Boolean(category);
  const [name, setName] = useState("");
  const [emojiFile, setEmojiFile] = useState<File | null>(null);
  const [emojiPreview, setEmojiPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Hydrate à l'ouverture */
  useEffect(() => {
    if (!open) return;
    setName(category?.name || "");
    setEmojiFile(null);
    setEmojiPreview(null);
    setError(null);
  }, [open, category]);

  /* Cleanup preview URL */
  useEffect(() => {
    if (!emojiFile) {
      setEmojiPreview(null);
      return;
    }
    const url = URL.createObjectURL(emojiFile);
    setEmojiPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [emojiFile]);

  /* Escape pour fermer */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading && !deleting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, loading, deleting]);

  /* Lock scroll */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Le nom doit faire au moins 2 caractères.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", trimmed);
      if (emojiFile) fd.append("emoji", emojiFile);

      let saved: Category;
      if (isEdit && category) {
        saved = await ownerApi.updateCategory(category.id, fd);
      } else {
        saved = await ownerApi.createCategory(fd);
      }
      onSaved(saved, !isEdit);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!category) return;
    if (
      !window.confirm(
        `Supprimer la catégorie « ${category.name} » ? Les produits liés ne seront pas supprimés mais n'auront plus de catégorie.`
      )
    )
      return;
    setDeleting(true);
    try {
      await ownerApi.deleteCategory(category.id);
      onDeleted();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const currentEmoji = emojiPreview || category?.emoji_url || null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 sm:px-6">
      {/* Backdrop */}
      <div
        onClick={() => !loading && !deleting && onClose()}
        className="backdrop-in absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="modal-in relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-[0_35px_90px_-25px_rgba(0,0,0,0.4)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/60 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-700/25">
              {isEdit ? <Pencil size={18} /> : <Plus size={18} strokeWidth={2.5} />}
            </span>
            <div>
              <h2 className="text-[16px] font-extrabold tracking-[-0.015em] text-slate-950">
                {isEdit ? "Modifier la catégorie" : "Nouvelle catégorie"}
              </h2>
              <p className="mt-0.5 text-[12.5px] text-slate-500">
                {isEdit ? "Renomme ou change l'image" : "Regroupe tes produits par thème"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading || deleting}
            aria-label="Fermer"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:rotate-90 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} className="flex flex-col gap-4 px-5 py-5 sm:px-6">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[12.5px] font-medium text-rose-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nom */}
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-bold text-slate-700">
              Nom de la catégorie
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Électronique, Chaussures…"
              autoFocus
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-900 outline-none transition duration-200 placeholder:text-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </label>

          {/* Image */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[12.5px] font-bold text-slate-700">
                Image <span className="font-normal text-slate-400">(optionnel)</span>
              </span>
              <span className="text-[11px] text-slate-400">Carrée conseillée</span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700">
                {currentEmoji ? (
                  <img src={currentEmoji} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Tag size={22} />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-[12px] font-bold text-white transition hover:bg-slate-800"
                >
                  <Upload size={12} />
                  {currentEmoji ? "Changer" : "Choisir une image"}
                </button>
                {currentEmoji && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmojiFile(null);
                      setEmojiPreview(null);
                      // Note : l'API ne supporte pas encore l'effacement côté serveur
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-[12px] font-bold text-slate-600 transition hover:bg-slate-200"
                  >
                    <Trash2 size={12} />
                    Retirer
                  </button>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setEmojiFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </div>

          {/* Actions */}
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={loading || deleting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3.5 text-[14px] font-extrabold text-white shadow-md shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Enregistrement…
                </>
              ) : (
                <>
                  <Check size={15} />
                  {isEdit ? "Enregistrer" : "Créer la catégorie"}
                </>
              )}
            </button>

            {isEdit && (
              <button
                type="button"
                onClick={onDelete}
                disabled={loading || deleting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-3.5 text-[14px] font-bold text-rose-600 transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                Supprimer
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}