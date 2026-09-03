// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  UserCircle,
  Camera,
  Edit,
  Trash2,
  X,
  Image as ImageIcon,
  Video,
  Send,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import Layout from "../components/Layout";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}

const PLAN_IMAGES = {
  basico: "/Basico.png",
  pro: "/Pro.png",
  premium: "/Premium.png",
  platino: "/Platino.png",
};

const PLAN_NAMES = {
  basico: "BÁSICO",
  pro: "PRO",
  premium: "PREMIUM",
  platino: "PLATINO",
};

const PLAN_NAMES_EN = {
  basico: "BASIC",
  pro: "PRO",
  premium: "PREMIUM",
  platino: "PLATINUM",
};

export default function Profile() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [user, setUser] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [profileBanner, setProfileBanner] = useState(null);

  const [editando, setEditando] = useState(false);
  const [formEmpresa, setFormEmpresa] = useState(null);

  const [publicaciones, setPublicaciones] = useState([]);
  const [nuevoTexto, setNuevoTexto] = useState("");
  const [imagenFile, setImagenFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const [editandoId, setEditandoId] = useState(null);
  const [textoEditado, setTextoEditado] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      if (parsedUser?.id) {
        cargarUsuarioYPublicaciones(parsedUser.id);
        cargarEmpresa();
      }
    } catch (e) {
      console.error("Usuario inválido:", e);
      setUser(null);
    }
  }, []);

  const cargarEmpresa = async () => {
    try {
      const res = await fetch(`${API_URL}/empresas/mi-empresa`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setEmpresa(data);
        setFormEmpresa({ ...data });
      } else if (res.status === 404) {
        setEmpresa(null);
        setFormEmpresa(null);
      }
    } catch (error) {
      console.error("Error al cargar empresa:", error);
    }
  };

  const cargarUsuarioYPublicaciones = async (idUsuario) => {
    try {
      const resUser = await fetch(`${API_URL}/users/${idUsuario}`, {
        headers: getAuthHeaders(),
      });
      if (!resUser.ok) throw new Error("No se pudo cargar el usuario");
      const dataUser = await resUser.json();

      setProfilePic(getImageUrl(dataUser?.profile_image));
      setProfileBanner(getImageUrl(dataUser?.banner_image));

      const resPosts = await fetch(`${API_URL}/posts/user/${idUsuario}`);
      if (!resPosts.ok) throw new Error("No se pudieron cargar los posts");
      const dataPosts = await resPosts.json();

      setPublicaciones(Array.isArray(dataPosts) ? dataPosts : []);
    } catch (error) {
      console.error("Error al cargar datos del perfil:", error);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !empresa?.id) {
      toast.error(t("publicProfile.needCompany"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const loadingToast = toast.loading(t("publicProfile.uploadingLogo"));

    try {
      const response = await fetch(
        `${API_URL}/empresas/${empresa.id}/logo`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: formData,
        }
      );
      const data = await response.json();
      if (data?.success) {
        setEmpresa((prev) => ({ ...prev, logo: data.logo }));
        toast.success(t("publicProfile.logoUpdated"), { id: loadingToast });
      } else {
        toast.error(t("publicProfile.logoError"), { id: loadingToast });
      }
    } catch (error) {
      console.error("Error al subir logo:", error);
      toast.error(t("common.connectionError"), { id: loadingToast });
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !empresa?.id) {
      toast.error(t("publicProfile.needCompany"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const loadingToast = toast.loading(t("publicProfile.uploadingBanner"));

    try {
      const response = await fetch(
        `${API_URL}/empresas/${empresa.id}/banner`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: formData,
        }
      );
      const data = await response.json();
      if (data?.success) {
        setEmpresa((prev) => ({ ...prev, banner: data.banner }));
        toast.success(t("publicProfile.bannerUpdated"), { id: loadingToast });
      } else {
        toast.error(t("publicProfile.bannerError"), { id: loadingToast });
      }
    } catch (error) {
      console.error("Error al subir banner:", error);
      toast.error(t("common.connectionError"), { id: loadingToast });
    }
  };

  const guardarCambios = async () => {
    const loadingToast = toast.loading(t("common.saving"));

    const camposValidos = {
      razonSocial: formEmpresa.razonSocial,
      rfc: formEmpresa.rfc,
      paginaWeb: formEmpresa.paginaWeb,
    };

    try {
      const resp = await fetch(`${API_URL}/empresas/${empresa.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(camposValidos),
      });

      if (!resp.ok) throw new Error("Error al actualizar empresa");

      const updated = await resp.json();
      setEmpresa(updated);
      setFormEmpresa({ ...updated });
      setEditando(false);
      toast.success(t("publicProfile.savedOk"), { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error(t("publicProfile.saveError"), { id: loadingToast });
    }
  };

  const cancelarEdicion = () => {
    setFormEmpresa({ ...empresa });
    setEditando(false);
  };

  const publicar = async () => {
    if (!nuevoTexto && !imagenFile && !videoFile) {
      toast.error(t("publicProfile.addContent"));
      return;
    }
    if (!user?.id) return;

    setSubiendo(true);
    const loadingToast = toast.loading(t("common.publishing"));

    const formData = new FormData();
    formData.append("userId", user.id.toString());
    formData.append("content", nuevoTexto || "");

    if (imagenFile) formData.append("files", imagenFile);
    if (videoFile) formData.append("files", videoFile);

    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      const responseData = await res.json().catch(() => ({}));

      if (res.ok) {
        setNuevoTexto("");
        setImagenFile(null);
        setVideoFile(null);
        setImagenPreview(null);
        setVideoPreview(null);
        toast.success(t("publicProfile.postCreated"), { id: loadingToast });
        await cargarUsuarioYPublicaciones(user.id);
      } else {
        toast.error(t("publicProfile.postError"), { id: loadingToast });
      }
    } catch (error) {
      console.error("Error al publicar:", error);
      toast.error(t("common.connectionError"), { id: loadingToast });
    } finally {
      setSubiendo(false);
    }
  };

  const eliminarPublicacion = async (id) => {
    toast(t("publicProfile.deletePostConfirm"), {
      description: t("common.cannotUndo"),
      action: {
        label: t("common.delete"),
        onClick: async () => {
          try {
            const res = await fetch(`${API_URL}/posts/${id}`, {
              method: "DELETE",
              headers: getAuthHeaders(),
            });
            if (res.ok) {
              toast.success(t("publicProfile.postDeleted"));
              await cargarUsuarioYPublicaciones(user.id);
            } else {
              toast.error(t("publicProfile.deletePostError"));
            }
          } catch (error) {
            console.error("Error al eliminar:", error);
            toast.error(t("common.connectionError"));
          }
        },
      },
      cancel: {
        label: t("common.cancel"),
      },
    });
  };

  const iniciarEdicion = (pub) => {
    setEditandoId(pub.id);
    setTextoEditado(pub.content || "");
  };

  const cancelarEdicionPost = () => {
    setEditandoId(null);
    setTextoEditado("");
  };

  const guardarEdicion = async (id) => {
    if (!textoEditado.trim()) {
      toast.error(t("publicProfile.emptyContent"));
      return;
    }
    try {
      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ content: textoEditado }),
      });

      if (res.ok) {
        setEditandoId(null);
        setTextoEditado("");
        toast.success(t("publicProfile.postUpdated"));
        await cargarUsuarioYPublicaciones(user.id);
      } else {
        toast.error(t("publicProfile.editPostError"));
      }
    } catch (error) {
      console.error("Error al editar:", error);
      toast.error(t("common.connectionError"));
    }
  };

  const handleImagenSeleccionada = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("publicProfile.invalidImage"));
      return;
    }
    setImagenFile(file);
    setVideoFile(null);
    setVideoPreview(null);

    const reader = new FileReader();
    reader.onloadend = () => setImagenPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleVideoSeleccionado = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error(t("publicProfile.invalidVideo"));
      return;
    }
    setVideoFile(file);
    setImagenFile(null);
    setImagenPreview(null);

    const reader = new FileReader();
    reader.onloadend = () => setVideoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">
        {t("publicProfile.noUser")}
      </div>
    );
  }

  const planActual = (empresa?.paquete || "basico").toLowerCase();
  const planImagen = PLAN_IMAGES[planActual] || PLAN_IMAGES.basico;
  const planNombre = lang === "en"
    ? (PLAN_NAMES_EN[planActual] || "BASIC")
    : (PLAN_NAMES[planActual] || "BÁSICO");

  const localeFmt = lang === "en" ? "en-US" : "es-ES";

  return (
    <Layout>
      {/* ===== Banner ===== */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface/70 backdrop-blur-xl shadow-pro">
        <div className="relative h-56 md:h-64">
          {empresa?.banner ? (
            <img
              src={getImageUrl(empresa.banner)}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-bg/40 flex items-center justify-center text-muted">
              {t("publicProfile.noBanner")}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-black/10" />

          <label className="absolute top-4 right-4 cursor-pointer z-20">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerUpload}
            />
            <div className="h-11 w-11 rounded-2xl border border-border bg-surface/50 hover:bg-surface/70 transition flex items-center justify-center shadow-pro backdrop-blur-md">
              <Camera className="w-5 h-5 text-text" />
            </div>
          </label>
        </div>

        <div className="relative px-5 md:px-7 pb-6">
          <div className="-mt-14 md:-mt-16 flex flex-col md:flex-row md:items-end gap-4">
            <div className="relative w-fit z-20">
              {empresa?.logo ? (
                <img
                  src={getImageUrl(empresa.logo)}
                  alt="Logo"
                  className="w-28 h-28 md:w-32 md:h-32 rounded-3xl border border-border shadow-pro object-cover bg-white"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                    setEmpresa((prev) => ({ ...prev, logo: null }));
                  }}
                />
              ) : (
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl border border-border bg-bg/40 flex items-center justify-center shadow-pro">
                  <Building2 className="w-16 h-16 text-muted" />
                </div>
              )}

              <label className="absolute -bottom-2 -right-2 cursor-pointer z-30">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onClick={(e) => { e.target.value = null; }}
                  onChange={handleProfilePicUpload}
                />
                <div className="h-10 w-10 rounded-2xl bg-accent hover:brightness-95 active:scale-95 transition shadow-pro flex items-center justify-center">
                  <Camera className="w-5 h-5 text-slate-900" />
                </div>
              </label>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-text drop-shadow">
                {empresa?.razonSocial || user.name}
              </h1>
              <p className="text-sm text-accent font-medium mt-1">
                {t("publicProfile.representative")}{" "}
                <span className="text-muted">{user.name}</span>
              </p>
              <p className="text-muted mt-1 max-w-3xl text-sm">
                {empresa?.descripcion || t("publicProfile.noDescription")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Grid ===== */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          {/* Datos empresa */}
          {empresa && formEmpresa && (
            <div className="rounded-3xl border border-border bg-surface/70 backdrop-blur-xl shadow-pro p-5 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-text">
                  {t("publicProfile.generalData")}
                </h3>
                <div className="flex gap-2">
                  {editando && (
                    <button
                      onClick={cancelarEdicion}
                      className="px-4 py-2 rounded-xl font-medium border border-border bg-surface/50 hover:bg-surface/70 text-text transition"
                    >
                      {t("common.cancel")}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (editando) {
                        guardarCambios();
                      } else {
                        setEditando(true);
                      }
                    }}
                    className="bg-accent text-slate-900 px-4 py-2 rounded-xl font-medium hover:brightness-95 transition"
                  >
                    {editando ? t("publicProfile.saveChanges") : t("publicProfile.editProfile")}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                    {t("publicProfile.companyName")}
                  </label>
                  {editando ? (
                    <input
                      type="text"
                      value={formEmpresa.razonSocial || ""}
                      onChange={(e) =>
                        setFormEmpresa({ ...formEmpresa, razonSocial: e.target.value })
                      }
                      className="w-full mt-1 bg-surface/60 text-text p-2 rounded-lg border border-border outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  ) : (
                    <p className="font-semibold text-text mt-1">
                      {empresa?.razonSocial || (
                        <span className="text-muted">{t("publicProfile.notRegistered")}</span>
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                    {t("publicProfile.rfc")}
                  </label>
                  {editando ? (
                    <input
                      type="text"
                      value={formEmpresa.rfc || ""}
                      onChange={(e) =>
                        setFormEmpresa({ ...formEmpresa, rfc: e.target.value })
                      }
                      className="w-full mt-1 bg-surface/60 text-text p-2 rounded-lg border border-border outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  ) : (
                    <p className="font-semibold text-text mt-1">
                      {empresa?.rfc || (
                        <span className="text-muted">{t("publicProfile.notRegistered")}</span>
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                    {t("publicProfile.website")}
                  </label>
                  {editando ? (
                    <input
                      type="text"
                      value={formEmpresa.paginaWeb || ""}
                      onChange={(e) =>
                        setFormEmpresa({ ...formEmpresa, paginaWeb: e.target.value })
                      }
                      className="w-full mt-1 bg-surface/60 text-text p-2 rounded-lg border border-border outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  ) : (
                    <p className="font-semibold text-text mt-1">
                      {empresa?.paginaWeb ? (
                        <a
                          href={
                            empresa.paginaWeb.startsWith("http")
                              ? empresa.paginaWeb
                              : `https://${empresa.paginaWeb}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline"
                        >
                          {empresa.paginaWeb}
                        </a>
                      ) : (
                        <span className="text-muted">{t("publicProfile.webNotRegistered")}</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mis publicaciones */}
          <h2 className="text-xl md:text-2xl font-extrabold text-text">
            {t("publicProfile.myPosts")}
          </h2>

          {/* Nueva publicación */}
          <div className="rounded-3xl border border-border bg-surface/70 backdrop-blur-xl shadow-pro p-5 md:p-6">
            <textarea
              value={nuevoTexto}
              onChange={(e) => setNuevoTexto(e.target.value)}
              placeholder={t("publicProfile.whatToShare")}
              className="w-full rounded-2xl border border-border bg-surface/60 text-text placeholder:text-muted/70 p-4 outline-none focus:ring-2 focus:ring-ring/40 resize-none"
              rows={4}
            />

            {imagenPreview && (
              <div className="relative mt-4 overflow-hidden rounded-2xl border border-border bg-bg/40">
                <img
                  src={imagenPreview}
                  alt="Preview"
                  className="w-full max-h-[420px] object-contain"
                />
                <button
                  onClick={() => {
                    setImagenFile(null);
                    setImagenPreview(null);
                  }}
                  className="absolute top-3 right-3 h-10 w-10 rounded-2xl bg-surface/80 hover:bg-surface transition flex items-center justify-center border border-border"
                >
                  <X className="w-5 h-5 text-text" />
                </button>
              </div>
            )}

            {videoPreview && (
              <div className="relative mt-4 overflow-hidden rounded-2xl border border-border bg-bg/40">
                <video controls className="w-full max-h-[420px] object-contain">
                  <source src={videoPreview} />
                </video>
                <button
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreview(null);
                  }}
                  className="absolute top-3 right-3 h-10 w-10 rounded-2xl bg-surface/80 hover:bg-surface transition flex items-center justify-center border border-border"
                >
                  <X className="w-5 h-5 text-text" />
                </button>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer" title={t("publicProfile.myPosts")}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagenSeleccionada}
                    className="hidden"
                  />
                  <div className="h-10 w-10 rounded-xl border border-border bg-surface/50 hover:bg-surface/90 transition flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-text" />
                  </div>
                </label>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSeleccionado}
                    className="hidden"
                  />
                  <div className="h-10 w-10 rounded-xl border border-border bg-surface/50 hover:bg-surface/90 transition flex items-center justify-center">
                    <Video className="w-5 h-5 text-text" />
                  </div>
                </label>

                <span className="text-xs text-muted ml-2">
                  {nuevoTexto ? `${nuevoTexto.length} ${t("publicProfile.chars")}` : ""}
                </span>
              </div>

              <button
                onClick={publicar}
                disabled={(!nuevoTexto && !imagenFile && !videoFile) || subiendo}
                className="h-11 px-5 rounded-2xl bg-accent hover:brightness-95 transition text-slate-900 font-semibold shadow-pro disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {subiendo ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    {t("common.publishing")}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {t("common.publish")}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feed */}
          <div className="space-y-5">
            {publicaciones.length === 0 ? (
              <div className="rounded-3xl border border-border bg-surface/70 backdrop-blur-xl shadow-pro p-10 text-center">
                <div className="text-4xl mb-3">🚀</div>
                <div className="text-lg font-semibold text-text">
                  {t("publicProfile.noPostsTitle")}
                </div>
              </div>
            ) : (
              publicaciones.map((pub) => {
                const img = pub?.image;
                const vid = pub?.video;
                const createdAt = pub?.createdAt ? new Date(pub.createdAt) : null;

                return (
                  <article
                    key={pub.id}
                    className="rounded-3xl border border-border bg-surface/70 backdrop-blur-xl shadow-pro p-5 md:p-6"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        {empresa?.logo ? (
                          <img
                            src={getImageUrl(empresa.logo)}
                            alt="logo"
                            className="w-10 h-10 rounded-2xl object-cover border border-border bg-white"
                          />
                        ) : profilePic ? (
                          <img
                            src={profilePic}
                            alt="avatar"
                            className="w-10 h-10 rounded-2xl object-cover border border-border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-2xl bg-bg/40 border border-border flex items-center justify-center">
                            <UserCircle className="w-6 h-6 text-muted" />
                          </div>
                        )}

                        <div>
                          <div className="font-semibold text-text">
                            {empresa?.razonSocial || user.name}
                          </div>
                          <div className="text-xs text-muted">
                            {createdAt && !isNaN(createdAt.getTime())
                              ? createdAt.toLocaleString(localeFmt, {
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

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => iniciarEdicion(pub)}
                          className="h-9 w-9 rounded-xl border border-border bg-surface/50 hover:bg-surface/70 transition flex items-center justify-center"
                          title={t("common.edit")}
                        >
                          <Edit className="w-4 h-4 text-text" />
                        </button>
                        <button
                          onClick={() => eliminarPublicacion(pub.id)}
                          className="h-9 w-9 rounded-xl border border-border bg-surface/50 hover:bg-red-500/10 transition flex items-center justify-center"
                          title={t("common.delete")}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {editandoId === pub.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={textoEditado}
                          onChange={(e) => setTextoEditado(e.target.value)}
                          className="w-full rounded-2xl border border-border bg-surface/60 text-text p-4 outline-none focus:ring-2 focus:ring-ring/40 resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => guardarEdicion(pub.id)}
                            className="h-10 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 transition text-slate-900 font-semibold shadow-pro inline-flex items-center gap-2"
                          >
                            {t("publicProfile.save")}
                          </button>
                          <button
                            onClick={cancelarEdicionPost}
                            className="h-10 px-4 rounded-xl border border-border bg-surface/50 hover:bg-surface/70 transition text-text font-semibold"
                          >
                            {t("common.cancel")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {!!pub.content && (
                          <p className="text-text/90 leading-relaxed text-[15px] mb-4 whitespace-pre-wrap">
                            {pub.content}
                          </p>
                        )}
                        {img && (
                          <div className="overflow-hidden rounded-2xl border border-border bg-bg/40">
                            <img
                              src={getImageUrl(img)}
                              alt="Post"
                              className="w-full max-h-[620px] object-contain"
                              loading="lazy"
                            />
                          </div>
                        )}
                        {vid && (
                          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-bg/40">
                            <video
                              controls
                              src={getImageUrl(vid)}
                              className="w-full max-h-[520px] object-contain"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* Sidebar derecha */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-surface/70 backdrop-blur-xl shadow-pro p-5">
            <h3 className="font-extrabold text-text text-lg mb-3">
              {t("publicProfile.info")}
            </h3>
            <ul className="text-text/80 space-y-2 text-sm">
              <li>
                <b className="text-text">{t("publicProfile.statsMessages")}</b> 0
              </li>
              <li>
                <b className="text-text">{t("publicProfile.statsPosts")}</b>{" "}
                {publicaciones.length}
              </li>
              <li>
                <b className="text-text">{t("publicProfile.statsFriends")}</b> 0
              </li>
              <li>
                <b className="text-text">{t("publicProfile.statsWeb")}</b>{" "}
                {empresa?.paginaWeb ? (
                  <a
                    href={
                      empresa.paginaWeb.startsWith("http")
                        ? empresa.paginaWeb
                        : `https://${empresa.paginaWeb}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    {empresa.paginaWeb}
                  </a>
                ) : (
                  <span className="text-muted">{t("publicProfile.webNotRegistered")}</span>
                )}
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-accent/10 backdrop-blur-xl shadow-pro p-5">
            <h3 className="font-extrabold text-text text-lg mb-4 text-center">
              {t("publicProfile.membership")} {planNombre}
            </h3>
            <div className="flex justify-center">
              <img
                src={planImagen}
                alt={`${t("publicProfile.membership")} ${planNombre}`}
                className="w-40 h-44 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/Basico.png";
                }}
              />
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
}