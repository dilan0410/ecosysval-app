// src/pages/Ajustes.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "../components/Layout";
import { useTheme } from "../components/ThemeProvider";
import {
  Shield,
  Bell,
  Palette,
  Globe,
  User,
  KeyRound,
  Download,
  Link2,
  Trash2,
  Save,
  Moon,
  Sun,
} from "lucide-react";

export default function Ajustes() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const [profile, setProfile] = useState({
    nombre: storedUser?.name || storedUser?.nombre || "",
    email: storedUser?.email || "",
    empresa: storedUser?.empresa || "",
    telefono: storedUser?.telefono || "",
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    sesiones: true,
    alertLogin: true,
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    mensajes: true,
    recompensas: false,
    comercio: true,
  });

  const [appearance, setAppearance] = useState({
    theme: theme || "dark",
    accent: "gold",
    density: "comfortable",
  });

  const [region, setRegion] = useState({
    idioma: i18n.language || "es",
    pais: "MX",
    zona: "America/Mexico_City",
    moneda: "MXN",
  });

  const [integrations, setIntegrations] = useState({
    quickbooks: false,
    stripe: false,
    paypal: false,
    shopify: false,
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setAppearance((a) => ({ ...a, theme: theme || a.theme }));
  }, [theme]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("settings_ecosysval") || "null");
      if (!saved) return;

      if (saved.profile) setProfile((p) => ({ ...p, ...saved.profile }));
      if (saved.security) setSecurity((s) => ({ ...s, ...saved.security }));
      if (saved.notifications) setNotifications((n) => ({ ...n, ...saved.notifications }));
      if (saved.appearance) setAppearance((a) => ({ ...a, ...saved.appearance }));
      if (saved.region) setRegion((r) => ({ ...r, ...saved.region }));
      if (saved.integrations) setIntegrations((i) => ({ ...i, ...saved.integrations }));

      if (saved.appearance?.theme === "dark" || saved.appearance?.theme === "light") {
        setTheme(saved.appearance.theme);
      }

      // Sincronizar idioma guardado
      if (saved.region?.idioma && saved.region.idioma !== i18n.language) {
        i18n.changeLanguage(saved.region.idioma);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { profile, security, notifications, appearance, region, integrations };
      localStorage.setItem("settings_ecosysval", JSON.stringify(payload));

      // Aplicar idioma inmediatamente
      if (region.idioma !== i18n.language) {
        i18n.changeLanguage(region.idioma);
      }

      showToast("✅ " + t("settings.savedOk"));
    } catch (e) {
      showToast("❌ " + t("settings.savedError"));
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const payload = { profile, security, notifications, appearance, region, integrations };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ecosysval-ajustes.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("⬇️ " + t("settings.exportReady"));
  };

  const handleDangerReset = () => {
    localStorage.removeItem("settings_ecosysval");
    localStorage.removeItem("ecosysval_theme");
    setTheme("dark");
    setAppearance((a) => ({ ...a, theme: "dark" }));
    showToast("🧹 " + t("settings.resetOk"));
  };

  return (
    <>
      <Layout>
        <div className="mx-auto max-w-6xl space-y-5">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="rounded-3xl border border-border bg-surface/70 backdrop-blur-xl shadow-pro px-5 py-4">
              <h1 className="text-text font-extrabold text-lg md:text-xl">
                {t("settings.title")}
                <span className="text-muted font-semibold"> • {t("settings.subtitle")}</span>
              </h1>
              <p className="text-muted text-sm mt-1 max-w-2xl">
                {t("settings.desc")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface/50 hover:bg-surface/70 transition px-4 py-3 text-text shadow-pro"
              >
                <Download className="w-4 h-4" />
                {t("common.export")}
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-accent hover:brightness-95 transition px-5 py-3 font-semibold text-slate-900 shadow-pro disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? t("common.saving") : t("common.saveChanges")}
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Columna izquierda */}
            <div className="lg:col-span-7 space-y-5">
              <GlassCard
                title={t("settings.account")}
                subtitle={t("settings.accountDesc")}
                icon={<User className="w-5 h-5" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label={t("settings.name")}
                    value={profile.nombre}
                    onChange={(v) => setProfile((p) => ({ ...p, nombre: v }))}
                    placeholder={t("settings.namePlaceholder")}
                  />
                  <Field
                    label={t("settings.company")}
                    value={profile.empresa}
                    onChange={(v) => setProfile((p) => ({ ...p, empresa: v }))}
                    placeholder={t("settings.companyPlaceholder")}
                  />
                  <Field
                    label={t("auth.email")}
                    type="email"
                    value={profile.email}
                    onChange={(v) => setProfile((p) => ({ ...p, email: v }))}
                    placeholder={t("settings.emailPlaceholder")}
                  />
                  <Field
                    label={t("settings.phone")}
                    value={profile.telefono}
                    onChange={(v) => setProfile((p) => ({ ...p, telefono: v }))}
                    placeholder={t("settings.phonePlaceholder")}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-bg/40 px-4 py-3">
                  <div className="text-sm text-text">
                    {t("settings.profilePicDesc")}
                    <div className="text-xs text-muted">
                      {t("settings.picHint")}
                    </div>
                  </div>
                  <span className="text-[11px] rounded-full bg-surface/60 px-3 py-1 text-muted border border-border">
                    {t("common.comingSoon")}
                  </span>
                </div>
              </GlassCard>

              <GlassCard
                title={t("settings.security")}
                subtitle={t("settings.securityDesc")}
                icon={<Shield className="w-5 h-5" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Toggle
                    label={t("settings.twoFA")}
                    desc={t("settings.twoFADesc")}
                    value={security.twoFactor}
                    onChange={(v) => setSecurity((s) => ({ ...s, twoFactor: v }))}
                  />
                  <Toggle
                    label={t("settings.loginAlerts")}
                    desc={t("settings.loginAlertsDesc")}
                    value={security.alertLogin}
                    onChange={(v) => setSecurity((s) => ({ ...s, alertLogin: v }))}
                  />
                  <Toggle
                    label={t("settings.sessions")}
                    desc={t("settings.sessionsDesc")}
                    value={security.sesiones}
                    onChange={(v) => setSecurity((s) => ({ ...s, sesiones: v }))}
                  />

                  <div className="rounded-2xl border border-border bg-bg/40 p-4 flex items-center justify-between">
                    <div>
                      <div className="text-text font-semibold text-sm flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-accent" />
                        {t("settings.changePwd")}
                      </div>
                      <div className="text-xs text-muted mt-1">
                        {t("settings.pwdHint")}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast("🔐 " + t("settings.pwdSoon"))}
                      className="rounded-xl bg-surface/50 hover:bg-surface/70 transition px-4 py-2 text-xs text-text border border-border"
                    >
                      {t("common.open")}
                    </button>
                  </div>
                </div>
              </GlassCard>

              <GlassCard
                title={t("settings.notifications")}
                subtitle={t("settings.notifDesc")}
                icon={<Bell className="w-5 h-5" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Toggle
                    label={t("settings.notifEmail")}
                    desc={t("settings.notifEmailDesc")}
                    value={notifications.email}
                    onChange={(v) => setNotifications((n) => ({ ...n, email: v }))}
                  />
                  <Toggle
                    label={t("settings.notifPush")}
                    desc={t("settings.notifPushDesc")}
                    value={notifications.push}
                    onChange={(v) => setNotifications((n) => ({ ...n, push: v }))}
                  />
                  <Toggle
                    label={t("settings.notifMessages")}
                    desc={t("settings.notifMessagesDesc")}
                    value={notifications.mensajes}
                    onChange={(v) => setNotifications((n) => ({ ...n, mensajes: v }))}
                  />
                  <Toggle
                    label={t("settings.notifCommerce")}
                    desc={t("settings.notifCommerceDesc")}
                    value={notifications.comercio}
                    onChange={(v) => setNotifications((n) => ({ ...n, comercio: v }))}
                  />
                  <Toggle
                    label={t("settings.notifRewards")}
                    desc={t("settings.notifRewardsDesc")}
                    value={notifications.recompensas}
                    onChange={(v) => setNotifications((n) => ({ ...n, recompensas: v }))}
                  />
                </div>
              </GlassCard>
            </div>

            {/* Columna derecha */}
            <div className="lg:col-span-5 space-y-5">
              <GlassCard
                title={t("settings.appearance")}
                subtitle={t("settings.appearanceDesc")}
                icon={<Palette className="w-5 h-5" />}
              >
                <div className="grid grid-cols-1 gap-4">
                  <Segmented
                    label={t("settings.theme")}
                    value={appearance.theme}
                    options={[
                      { value: "dark", label: t("settings.dark"), icon: <Moon className="w-4 h-4" /> },
                      { value: "light", label: t("settings.light"), icon: <Sun className="w-4 h-4" /> },
                    ]}
                    onChange={(v) => {
                      setAppearance((a) => ({ ...a, theme: v }));
                      setTheme(v);
                    }}
                  />

                  <Select
                    label={t("settings.accent")}
                    value={appearance.accent}
                    options={[
                      { value: "gold", label: t("settings.accentGold") },
                      { value: "blue", label: t("settings.accentBlue") },
                      { value: "emerald", label: t("settings.accentEmerald") },
                    ]}
                    onChange={(v) => setAppearance((a) => ({ ...a, accent: v }))}
                  />

                  <Select
                    label={t("settings.density")}
                    value={appearance.density}
                    options={[
                      { value: "compact", label: t("settings.compact") },
                      { value: "comfortable", label: t("settings.comfortable") },
                    ]}
                    onChange={(v) => setAppearance((a) => ({ ...a, density: v }))}
                  />

                  <div className="rounded-2xl border border-border bg-bg/40 p-4 text-xs text-muted">
                    {t("settings.themeHint")}
                  </div>
                </div>
              </GlassCard>

              <GlassCard
                title={t("settings.region")}
                subtitle={t("settings.regionDesc")}
                icon={<Globe className="w-5 h-5" />}
              >
                <div className="grid grid-cols-1 gap-4">
                  <Select
                    label={t("settings.language")}
                    value={region.idioma}
                    options={[
                      { value: "es", label: t("common.spanish") },
                      { value: "en", label: t("common.english") },
                    ]}
                    onChange={(v) => {
                      setRegion((r) => ({ ...r, idioma: v }));
                      i18n.changeLanguage(v); // Aplicar inmediatamente
                    }}
                  />

                  <Select
                    label={t("settings.country")}
                    value={region.pais}
                    options={[
                      { value: "MX", label: "México" },
                      { value: "US", label: "United States" },
                      { value: "CA", label: "Canada" },
                    ]}
                    onChange={(v) => setRegion((r) => ({ ...r, pais: v }))}
                  />

                  <Select
                    label={t("settings.timezone")}
                    value={region.zona}
                    options={[
                      { value: "America/Mexico_City", label: "America/Mexico_City" },
                      { value: "America/New_York", label: "America/New_York" },
                      { value: "America/Los_Angeles", label: "America/Los_Angeles" },
                      { value: "America/Toronto", label: "America/Toronto" },
                      { value: "America/Vancouver", label: "America/Vancouver" },
                    ]}
                    onChange={(v) => setRegion((r) => ({ ...r, zona: v }))}
                  />

                  <Select
                    label={t("settings.currency")}
                    value={region.moneda}
                    options={[
                      { value: "MXN", label: "MXN — Peso mexicano" },
                      { value: "USD", label: "USD — US Dollar" },
                      { value: "CAD", label: "CAD — Canadian Dollar" },
                    ]}
                    onChange={(v) => setRegion((r) => ({ ...r, moneda: v }))}
                  />
                </div>
              </GlassCard>

              <GlassCard
                title={t("settings.integrations")}
                subtitle={t("settings.integrationsDesc")}
                icon={<Link2 className="w-5 h-5" />}
              >
                <div className="grid grid-cols-1 gap-3">
                  <Toggle
                    label="QuickBooks"
                    desc={t("settings.quickbooksDesc")}
                    value={integrations.quickbooks}
                    onChange={(v) => setIntegrations((i) => ({ ...i, quickbooks: v }))}
                  />
                  <Toggle
                    label="Stripe"
                    desc={t("settings.stripeDesc")}
                    value={integrations.stripe}
                    onChange={(v) => setIntegrations((i) => ({ ...i, stripe: v }))}
                  />
                  <Toggle
                    label="PayPal"
                    desc={t("settings.paypalDesc")}
                    value={integrations.paypal}
                    onChange={(v) => setIntegrations((i) => ({ ...i, paypal: v }))}
                  />
                  <Toggle
                    label="Shopify"
                    desc={t("settings.shopifyDesc")}
                    value={integrations.shopify}
                    onChange={(v) => setIntegrations((i) => ({ ...i, shopify: v }))}
                  />
                </div>
              </GlassCard>

              <GlassCard
                title={t("settings.dangerZone")}
                subtitle={t("settings.dangerDesc")}
                icon={<Trash2 className="w-5 h-5" />}
              >
                <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4">
                  <div className="text-text font-semibold text-sm">{t("settings.reset")}</div>
                  <div className="text-xs text-muted mt-1">
                    {t("settings.resetHint")}
                  </div>
                  <button
                    type="button"
                    onClick={handleDangerReset}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-500/20 hover:bg-red-500/25 transition px-4 py-2 text-xs text-text border border-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("settings.resetButton")}
                  </button>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-bg/40 p-4">
                  <div className="text-text font-semibold text-sm">{t("settings.closeAccount")}</div>
                  <div className="text-xs text-muted mt-1">
                    {t("settings.closeHint")}
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast("⛔ " + t("settings.closeSoon"))}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-surface/50 hover:bg-surface/70 transition px-4 py-2 text-xs text-text border border-border"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("settings.request")}
                  </button>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </Layout>

      {toast && (
        <div className="fixed bottom-5 right-5 z-[9999] rounded-2xl border border-border bg-surface/70 backdrop-blur-xl px-4 py-3 text-text shadow-pro">
          <div className="text-sm">{toast}</div>
        </div>
      )}
    </>
  );
}

/* ---------------- UI Components ---------------- */

function GlassCard({ title, subtitle, icon, children }) {
  return (
    <section className="rounded-3xl border border-border bg-surface/70 backdrop-blur-xl shadow-pro p-5 md:p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-surface/60 border border-border flex items-center justify-center text-text">
              {icon}
            </div>
            <div>
              <h2 className="text-text font-bold">{title}</h2>
              <p className="text-muted text-xs mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-muted mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-surface/60 px-4 py-3 text-sm text-text placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/40 transition"
      />
    </label>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-muted mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-surface/60 px-4 py-3 text-sm text-text outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/40 transition"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, desc, value, onChange }) {
  return (
    <div className="rounded-2xl border border-border bg-bg/40 p-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-text font-semibold text-sm">{label}</div>
        <div className="text-muted text-xs mt-1">{desc}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={[
          "relative inline-flex h-7 w-12 items-center rounded-full transition border",
          value ? "bg-accent border-accent" : "bg-surface/50 border-border",
        ].join(" ")}
        aria-pressed={value}
      >
        <span
          className={[
            "inline-block h-5 w-5 transform rounded-full transition",
            value ? "translate-x-6 bg-slate-900" : "translate-x-1 bg-surface-2",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

function Segmented({ label, value, options, onChange }) {
  return (
    <div className="rounded-2xl border border-border bg-bg/40 p-4">
      <div className="text-xs font-semibold text-muted mb-2">{label}</div>
      <div className="flex gap-2">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={[
                "flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm transition border",
                active
                  ? "bg-surface/70 border-border text-text shadow-pro"
                  : "bg-transparent border-border/60 text-muted hover:bg-surface/40 hover:text-text",
              ].join(" ")}
            >
              {o.icon}
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}