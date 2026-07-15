// src/pages/Inicio.jsx
import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout"; // NUEVO
import { Loader2, RefreshCcw } from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

// Helper universal para URLs de imágenes
function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

export default function Inicio() {
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
              Inicio
              <span className="text-muted font-semibold"> • Feed de publicaciones</span>
            </h1>
            <p className="text-muted text-sm mt-1">
              Publicaciones tuyas y de otras empresas (ordenadas por fecha).
            </p>
          </div>

          <button
            type="button"
            onClick={cargarFeed}
            className="hidden md:inline-flex items-center gap-2 rounded-2xl border border-border bg-surface/50 hover:bg-surface/70 transition px-4 py-3 text-text shadow-pro"
            title="Actualizar feed"
          >
            <RefreshCcw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 rounded-3xl border border-border bg-surface/60 backdrop-blur-xl shadow-pro">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-text" />
            <div className="text-muted">Cargando publicaciones...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-3xl border border-border bg-surface/70 backdrop-blur-xl shadow-pro p-12 text-center">
            <div className="text-4xl mb-3">📰</div>
            <p className="text-text font-semibold">Aún no hay publicaciones</p>
            <p className="text-muted text-sm mt-1">
              Cuando las empresas publiquen, aparecerán aquí.
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
  const userName =
    post?.user?.name || post?.user?.nombre || post?.user?.empresa || "Empresa";

  const createdAt = useMemo(() => {
    if (!post?.createdAt) return null;
    const d = new Date(post.createdAt);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [post?.createdAt]);

  return (
    <article className="rounded-3xl border border-border bg-surface/70 backdrop-blur-xl shadow-pro p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl overflow-hidden border border-border bg-surface/50 flex items-center justify-center">
            {post?.user?.profile_image ? (
              <img
                src={getImageUrl(post.user.profile_image)}
                alt={`Avatar ${userName}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-text font-extrabold">
                {userName?.[0]?.toUpperCase() || "E"}
              </span>
            )}
          </div>

          <div>
            <div className="font-semibold text-text">{userName}</div>
            <div className="text-xs text-muted">
              {createdAt
                ? createdAt.toLocaleString("es-ES", {
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