import { useEffect, useState } from "react";
import { crearEjercicio, getEjercicios, actualizarEjercicio, eliminarEjercicio } from "../../services/ejerciciosService";
import { uploadMedia } from "../../services/uploadService";
import "../../App.css";
import "./EntrenadorEjercicios.css";
import BackButton from "../../components/BackButton.jsx";

export default function EntrenadorEjercicios() {
  const [ejercicios, setEjercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", descripcion: "", videoUrl: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: "", descripcion: "", videoUrl: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [error, setError] = useState("");
  const [previewMedia, setPreviewMedia] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getEjercicios();
        if (alive) {
          setEjercicios(data);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error cargando ejercicios", error);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.nombre.trim()) return;
    try {
      const nuevo = await crearEjercicio({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        videoUrl: form.videoUrl.trim(),
      });
      setEjercicios((prev) => [nuevo, ...prev]);
      setForm({ nombre: "", descripcion: "", videoUrl: "" });
      setShowForm(false);
    } catch (error) {
      setError(error?.response?.data?.message || "No se pudo crear el ejercicio");
      if (import.meta.env.DEV) console.error("No se pudo crear el ejercicio", error);
    }
  };

  const handleFileChange = async (e, target = "create") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const url = await uploadMedia(file);
      if (target === "edit") {
        setEditForm((prev) => ({ ...prev, videoUrl: url }));
      } else {
        setForm((prev) => ({ ...prev, videoUrl: url }));
      }
    } catch (err) {
      setUploadError(err?.response?.data?.message || "No pudimos subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  const handleEditClick = (ej) => {
    setEditingId(ej.id);
    setEditForm({ nombre: ej.nombre || "", descripcion: ej.descripcion || "", videoUrl: ej.videoUrl || "" });
    setError("");
    setUploadError("");
  };

  const handleUpdate = async (id) => {
    setError("");
    if (!editForm.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    try {
      const updated = await actualizarEjercicio(id, {
        nombre: editForm.nombre.trim(),
        descripcion: editForm.descripcion.trim(),
        videoUrl: editForm.videoUrl?.trim() || null,
      });
      setEjercicios((prev) => prev.map((e) => (e.id === id ? updated : e)));
      setEditingId(null);
      setEditForm({ nombre: "", descripcion: "", videoUrl: "" });
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo actualizar el ejercicio");
      if (import.meta.env.DEV) console.error("No se pudo actualizar", err);
    }
  };

  const handleDelete = async (id) => {
    const confirmar = window.confirm("¿Eliminar este ejercicio?");
    if (!confirmar) return;
    try {
      await eliminarEjercicio(id);
      setEjercicios((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo eliminar el ejercicio");
      if (import.meta.env.DEV) console.error("No se pudo eliminar", err);
    }
  };

  const resolveMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const base = import.meta.env.VITE_API_BASE_URL;
    if (base && base.startsWith("http")) {
      const cleanBase = base.replace(/\/api\/?$/i, "").replace(/\/+$/, "");
      return `${cleanBase}${url.startsWith("/") ? "" : "/"}${url}`;
    }
    return `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const renderMedia = (url, nombre, size = "thumb") => {
    const src = resolveMediaUrl(url);
    if (!src) return "Sin media";
    const lower = src.toLowerCase();
    const isVideo = /\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(lower) || lower.includes("video");
    const className = size === "preview" ? "ej-preview" : "ej-thumb";

    if (isVideo) {
      return (
        <video
          src={src}
          controls
          preload="metadata"
          playsInline
          className={className}
          onDoubleClick={() => setPreviewMedia({ src, nombre, isVideo: true })}
        />
      );
    }
    return (
      <img
        src={src}
        alt={nombre}
        className={className}
        onError={(e) => { e.target.onerror = null; e.target.src = src; }}
        onDoubleClick={() => setPreviewMedia({ src, nombre, isVideo: false })}
      />
    );
  };

  return (
    <div className="home-container ejercicios-page">
      <main className="home-main">
        <div className="ej-content">
          <div className="ej-header">
            <BackButton />
            <div className="ej-title-block">
              <h2 className="welcome">Ejercicios</h2>
              <p className="subtitle">Listado de ejercicios disponibles para tus rutinas.</p>
            </div>
            <button
              type="button"
              className={`add-ej-btn ${showForm ? "is-open" : ""}`}
              onClick={() => setShowForm((v) => !v)}
            >
              <span className="rutina-row-title">{showForm ? "Cerrar formulario" : "Agregar ejercicio"}</span>
              <div className="rutina-row-chips">
                <span className="rutina-row-item">{form.nombre || "Nombre"}</span>
                <span className="rutina-row-item">{form.descripcion ? "Con descripción" : "Descripción"}</span>
                <span className={`rutina-estado ${form.videoUrl ? "activa" : "pausada"}`}>
                  {form.videoUrl ? "Con media" : "Media"}
                </span>
              </div>
            </button>
          </div>

          {showForm && (
            <div className="form-card">
              <div className="form-card-header" />
              <div className="form-card-body">
                <h3 className="form-card-title">Nuevo ejercicio</h3>
                <form className="google-form" onSubmit={handleSubmit}>
                  <label>
                    Nombre
                    <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Sentadilla goblet" required />
                  </label>
                  <label>
                    Descripción
                    <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Indicaciones breves" rows={3} />
                  </label>
                  <label>
                    URL de foto/video/GIF (opcional)
                    <input name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="https://..." />
                  </label>
                  <label>
                    Subir foto/video/GIF
                    <input type="file" accept="video/*,image/*" onChange={(e) => handleFileChange(e, "create")} disabled={uploading} />
                    {uploading && <small>Subiendo archivo...</small>}
                    {uploadError && <small style={{ color: "#b00020" }}>{uploadError}</small>}
                  </label>
                  {form.videoUrl && (
                    <div className="media-preview">
                      <p className="media-preview-label">Vista previa</p>
                      {renderMedia(form.videoUrl, form.nombre || "Media", "preview")}
                    </div>
                  )}
                  <div className="form-actions">
                    <button type="submit" className="primary-btn">Guardar</button>
                    <button type="button" onClick={() => setShowForm(false)} className="secondary-btn">Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loading ? (
            <p>Cargando ejercicios...</p>
          ) : (
            <div className="ej-table-card">
              <div className="form-card-header" />
              <div className="ej-table-wrap">
                {error && <p style={{ color: "#b00020", margin: "0.5rem 0" }}>{error}</p>}
                <table className="ej-table">
                  <thead>
                    <tr>
                      <th>Ejercicio</th>
                      <th>Descripción</th>
                      <th>Video</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ejercicios.map((ej) => (
                      <tr key={ej.id}>
                        <td>
                          {editingId === ej.id ? (
                            <input value={editForm.nombre} onChange={(e) => setEditForm((p) => ({ ...p, nombre: e.target.value }))} />
                          ) : (
                            ej.nombre
                          )}
                        </td>
                        <td>
                          {editingId === ej.id ? (
                            <textarea value={editForm.descripcion} onChange={(e) => setEditForm((p) => ({ ...p, descripcion: e.target.value }))} rows={2} />
                          ) : (
                            ej.descripcion || "-"
                          )}
                        </td>
                        <td>
                          {editingId === ej.id ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <input value={editForm.videoUrl} onChange={(e) => setEditForm((p) => ({ ...p, videoUrl: e.target.value }))} placeholder="https://..." />
                              <input type="file" accept="video/*,image/*" onChange={(e) => handleFileChange(e, "edit")} disabled={uploading} />
                              {uploadError && <small style={{ color: "#b00020" }}>{uploadError}</small>}
                              {editForm.videoUrl && (
                                <div className="media-preview">
                                  <p className="media-preview-label">Vista previa</p>
                                  {renderMedia(editForm.videoUrl, editForm.nombre || ej.nombre || "Media", "preview")}
                                </div>
                              )}
                            </div>
                          ) : (
                            renderMedia(ej.videoUrl, ej.nombre)
                          )}
                        </td>
                        <td>
                          {editingId === ej.id ? (
                            <div className="ej-actions">
                              <button type="button" className="primary-btn" onClick={() => handleUpdate(ej.id)}>Guardar</button>
                              <button type="button" className="secondary-btn" onClick={() => { setEditingId(null); setEditForm({ nombre: "", descripcion: "", videoUrl: "" }); }}>Cancelar</button>
                            </div>
                          ) : (
                            <div className="ej-actions">
                              <button type="button" className="secondary-btn" onClick={() => handleEditClick(ej)}>Editar</button>
                              <button type="button" className="danger-btn" onClick={() => handleDelete(ej.id)}>Eliminar</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!ejercicios.length && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center" }}>Aún no hay ejercicios cargados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {previewMedia && (
        <div className="modal-overlay" onClick={() => setPreviewMedia(null)}>
          <div className="media-modal" onClick={(e) => e.stopPropagation()}>
            <div className="media-modal-header">
              <h4>{previewMedia.nombre || "Vista previa"}</h4>
              <button type="button" className="secondary-btn" onClick={() => setPreviewMedia(null)}>Cerrar</button>
            </div>
            {previewMedia.isVideo ? (
              <video src={previewMedia.src} controls autoPlay playsInline className="media-modal-player" />
            ) : (
              <img src={previewMedia.src} alt={previewMedia.nombre} className="media-modal-player" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
