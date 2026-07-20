import { useEffect, useCallback } from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Lightbox = ({ images, index, onClose, onNavigate }) => {
  const goNext = useCallback(() => onNavigate((index + 1) % images.length), [index, images.length, onNavigate]);
  const goPrev = useCallback(
    () => onNavigate((index - 1 + images.length) % images.length),
    [index, images.length, onNavigate]
  );

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, goNext, goPrev]);

  if (!images.length) return null;
  const current = images[index];

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-5 right-5 text-white/80 hover:text-white" aria-label="বন্ধ করুন">
        <FiX size={26} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        className="absolute left-3 sm:left-6 text-white/70 hover:text-white w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"
        aria-label="আগের ছবি"
      >
        <FiChevronLeft size={22} />
      </button>

      <img
        src={current.url}
        alt={current.caption || 'গ্যালারি ছবি'}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-[85vh] rounded-lg object-contain"
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        className="absolute right-3 sm:right-6 text-white/70 hover:text-white w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"
        aria-label="পরের ছবি"
      >
        <FiChevronRight size={22} />
      </button>

      {current.caption && (
        <p className="absolute bottom-6 left-0 right-0 text-center text-white/80 text-sm px-4">{current.caption}</p>
      )}
    </div>
  );
};

export default Lightbox;
