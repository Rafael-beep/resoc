import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Maximize2, X } from 'lucide-react';

export function MediaCarousel({ mediaList = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!mediaList || mediaList.length === 0) return null;

  const currentMedia = mediaList[currentIndex];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="media-carousel">
        <div className="media-stage" onClick={() => setLightboxOpen(true)}>
          {currentMedia.media_type === 'video' ? (
            <video
              src={currentMedia.file_path}
              controls
              className="media-item"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={currentMedia.file_path}
              alt={`Médias ${currentIndex + 1}`}
              className="media-item"
              style={{ cursor: 'zoom-in' }}
            />
          )}

          {/* Badge du nombre de médias s'il y en a plusieurs */}
          {mediaList.length > 1 && (
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#fff',
                zIndex: 5
              }}
            >
              {currentIndex + 1} / {mediaList.length} (Max 10)
            </div>
          )}
        </div>

        {/* Boutons de navigation du carrousel */}
        {mediaList.length > 1 && (
          <>
            <button className="carousel-btn carousel-btn-prev" onClick={handlePrev} title="Précédent">
              <ChevronLeft size={22} />
            </button>
            <button className="carousel-btn carousel-btn-next" onClick={handleNext} title="Suivant">
              <ChevronRight size={22} />
            </button>

            <div className="carousel-dots">
              {mediaList.map((_, idx) => (
                <div
                  key={idx}
                  className={`dot ${idx === currentIndex ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox Modal pour voir en grand format */}
      {lightboxOpen && currentMedia.media_type === 'photo' && (
        <div className="modal-overlay" onClick={() => setLightboxOpen(false)}>
          <div style={{ position: 'relative', maxWidth: '95vw', maxHeight: '95vh' }}>
            <button
              onClick={() => setLightboxOpen(false)}
              style={{
                position: 'absolute',
                top: -40,
                right: 0,
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <X size={28} />
            </button>
            <img
              src={currentMedia.file_path}
              alt="Vue agrandie"
              style={{ maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px' }}
            />
          </div>
        </div>
      )}
    </>
  );
}
