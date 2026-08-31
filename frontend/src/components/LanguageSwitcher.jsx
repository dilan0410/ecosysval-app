// frontend/src/components/LanguageSwitcher.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export default function LanguageSwitcher({ variant = "header" }) {
  const { i18n, t } = useTranslation();
  const lang = (i18n.language || "es").startsWith("en") ? "en" : "es";

  function setLang(next) {
    i18n.changeLanguage(next);
  }

  if (variant === "admin") {
    return (
      <div className="flex items-center gap-1 rounded-lg border border-yellow-500/20 bg-black/30 p-1">
        <button
          type="button"
          onClick={() => setLang("es")}
          className={`px-2 py-1 text-[11px] font-bold rounded-md transition ${
            lang === "es"
              ? "bg-yellow-500/20 text-yellow-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          ES
        </button>
        <button
          type="button"
          onClick={() => setLang("en")}
          className={`px-2 py-1 text-[11px] font-bold rounded-md transition ${
            lang === "en"
              ? "bg-yellow-500/20 text-yellow-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          EN
        </button>
      </div>
    );
  }

  // Header principal (app pública logueada)
  return (
    <div
      className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1"
      title={t("common.language")}
    >
      <Globe className="w-3.5 h-3.5 text-white/60 ml-1.5" />
      <button
        type="button"
        onClick={() => setLang("es")}
        className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${
          lang === "es"
            ? "bg-yellow-400/20 text-yellow-300"
            : "text-white/50 hover:text-white"
        }`}
      >
        ES
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${
          lang === "en"
            ? "bg-yellow-400/20 text-yellow-300"
            : "text-white/50 hover:text-white"
        }`}
      >
        EN
      </button>
    </div>
  );
}