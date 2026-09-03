// src/pages/Inicio.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../components/Layout";
import { Loader2, RefreshCcw, ExternalLink } from "lucide-react";
import { SkeletonPostList } from "../components/SkeletonPost";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

// Helper universal para URLs de imágenes
function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

export default function Inicio() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarFeed = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/posts`);
      if (!res.ok) throw new Error("No se pudo cargar el feed");
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error cargando feed:", e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFeed();
  }, []);

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-5">
        {/* Header feed */}
        <div className="flex items-center justify-between gap-3">
          <div className="rounded-3xl border border-border bg-surface/70 backdrop-blur-xl shadow-pro px-5 py-3">
            <h1 className="text-text font-extrabold text-lg md:text-xl">
              {t("nav.home")}
              <span className="text-muted font-semibold"> • {t("home.feedSubtitle")}</span>
            </h1>
            <p className="text-muted text-sm mt-1">
              {t("home.feedDesc")}
            </p>
          </div>

          <button
            type="button"
            onClick={cargarFeed}
            className="hidden md:inline-flex items-center gap-2 rounded-2xl border border-border bg-surface/50 hover:bg-surface/70 transition px-4 py-3 text-text shadow-pro"
            title={t("home.refresh")}
          >
            <RefreshCcw className="w-4 h-4" />
            {t("home.refresh")}
          </button>
        </div>

        {loading ? (
          <SkeletonPostList count={3} />
        ) : posts.length === 0 ? (
          <div className="rounded-3xl border border-border bg-surface/70 backdrop-blur-xl shadow-pro p-12 text-center">
            <div className="text-4xl mb-3">📰</div>
            <p className="text-text font-semibold">{t("home.emptyTitle")}</p>
            <p className="text-muted text-sm mt-1">
              {t("home.emptyDesc")}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function PostCard({ post }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const userName =
    post?.user?.empresa?.razonSocial
    ?? post?.user?.name
    ?? t("home.defaultCompany");

  const avatarUrl =
    post?.user?.empresa?.logo
    ?? post?.user?.profile_image
    ?? null;

  const empresaId = post?.user?.empresa?.id;
  const puedeVerPerfil = !!empresaId;

  const createdAt = useMemo(() => {
    if (!post?.createdAt) return null;
    const d = new Date(post.createdAt);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [post?.createdAt]);

  const irAPerfilEmpresa = (e) => {
    e.stopPropagation();
    if (puedeVerPerfil) {
      navigate(`/empresa/${empresaId}`);
    }
  };

  return (
    <article className="rounded-3xl border border-border bg-surface/70 backdrop-blur-xl shadow-pro p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={irAPerfilEmpresa}
            disabled={!puedeVerPerfil}
            className={`h-11 w-11 rounded-2xl overflow-hidden border border-border bg-surface/50 flex items-center justify-center relative transition
              ${puedeVerPerfil ? "cursor-pointer hover:scale-105 hover:border-yellow-400" : "cursor-default"}
            `}
            title={puedeVerPerfil ? `${t("home.viewProfile")} ${userName}` : ""}
          >
            {avatarUrl ? (
              <>
                <img
                  src={getImageUrl(avatarUrl)}
                  alt={`Avatar ${userName}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <span
                  className="text-text font-extrabold absolute inset-0 flex items-center justify-center"
                  style={{ display: "none" }}
                >
                  {userName?.[0]?.toUpperCase() || "E"}
                </span>
              </>
            ) : (
              <span className="text-text font-extrabold">
                {userName?.[0]?.toUpperCase() || "E"}
              </span>
            )}
          </button>

          <div>
            <button
              type="button"
              onClick={irAPerfilEmpresa}
              disabled={!puedeVerPerfil}
              className={`font-semibold text-text inline-flex items-center gap-1 transition
                ${puedeVerPerfil ? "hover:text-yellow-400 cursor-pointer" : "cursor-default"}
              `}
              title={puedeVerPerfil ? `${t("home.viewProfile")} ${userName}` : ""}
            >
              {userName}
              {puedeVerPerfil && <ExternalLink className="w-3 h-3 opacity-60" />}
            </button>
            <div className="text-xs text-muted">
              {createdAt
                ? createdAt.toLocaleString(lang === "en" ? "en-US" : "es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </div>
          </div>
        </div>
      </div>

      {post?.content && (
        <p className="text-text/90 mt-4 whitespace-pre-wrap leading-relaxed text-[15px]">
          {post.content}
        </p>
      )}

      {(post?.image || post?.video) && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-bg/40">
          {post.image && (
            <img
              src={getImageUrl(post.image)}
              alt="publicación"
              className="w-full max-h-[620px] object-contain block"
              loading="lazy"
            />
          )}

          {post.video && (
            <video
              src={getImageUrl(post.video)}
              className="w-full max-h-[520px] object-contain block"
              controls
            />
          )}
        </div>
      )}
    </article>
  );
}