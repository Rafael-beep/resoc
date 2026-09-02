import React from 'react';
import { UploadCloud, X, Image as ImageIcon, Film, AlertTriangle } from 'lucide-react';

const MAX_MEDIA = 10;

export function MediaUploader({ files = [], setFiles }) {
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    if (files.length + selectedFiles.length > MAX_MEDIA) {
      alert(`Limite atteinte : Vous pouvez ajouter un maximum de ${MAX_MEDIA} éléments (photos/vidéos) par publication.`);
      const allowedCount = MAX_MEDIA - files.length;
      if (allowedCount > 0) {
        setFiles((prev) => [...prev, ...selectedFiles.slice(0, allowedCount)]);
      }
      return;
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div style={{ width: '100%' }}>
      <label className="uploader-dropzone">
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={files.length >= MAX_MEDIA}
        />
        <UploadCloud size={32} style={{ color: 'var(--accent-primary)', marginBottom: 8 }} />
        <div style={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.4 }}>
          Cliquez pour ajouter des photos ou vidéos
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
          Format : PNG, JPG, GIF, WEBP, MP4 (<strong>Max {MAX_MEDIA} médias</strong>)
        </div>

        <div style={{ marginTop: 12 }}>
          <span className="badge badge-media-count">
            {files.length} / {MAX_MEDIA} sélectionnés
          </span>
        </div>
      </label>

      {files.length >= MAX_MEDIA && (
        <div className="alert alert-warning" style={{ marginTop: 10 }}>
          <AlertTriangle size={16} /> Limite maximale de {MAX_MEDIA} éléments atteinte.
        </div>
      )}

      {files.length > 0 && (
        <div className="media-previews-grid">
          {files.map((file, idx) => {
            const isVideo = file.type.startsWith('video/');
            const objectUrl = URL.createObjectURL(file);

            return (
              <div key={idx} className="preview-thumb-wrapper">
                {isVideo ? (
                  <video src={objectUrl} className="preview-thumb" />
                ) : (
                  <img src={objectUrl} alt={`Aperçu ${idx + 1}`} className="preview-thumb" />
                )}

                <div
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    left: 4,
                    background: 'rgba(0,0,0,0.6)',
                    borderRadius: '4px',
                    padding: '2px 4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {isVideo ? <Film size={12} color="#fff" /> : <ImageIcon size={12} color="#fff" />}
                </div>

                <button
                  type="button"
                  className="preview-remove-btn"
                  onClick={() => removeFile(idx)}
                  title="Supprimer ce média"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
