import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiImage, FiZoomIn, FiPlayCircle } from 'react-icons/fi';
import { useGetAlbumByIdQuery } from '../../features/gallery/galleryApi';
import Lightbox from '../../components/gallery/Lightbox';
import Spinner from '../../components/ui/Spinner';
import { toBanglaDigits } from '../../utils/banglaDigits';

const ImageTile = ({ img, index, onOpen }) => (
  <button
    onClick={() => onOpen(index)}
    className="group relative aspect-square rounded-xl2 overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-glass dark:shadow-glass-dark"
  >
    <img
      src={img.url}
      alt={img.caption || `ছবি ${index + 1}`}
      loading="lazy"
      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
    />

    {/* Smooth gradient overlay that fades in on hover, with a zoom cue */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out flex items-center justify-center">
      <FiZoomIn
        size={22}
        className="text-white opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 ease-out"
      />
    </div>

    {img.caption && (
      <p className="absolute bottom-0 inset-x-0 px-2.5 py-2 text-[11px] text-white/90 text-left truncate translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-black/70 to-transparent">
        {img.caption}
      </p>
    )}

    {/* Position badge - always visible, subtle */}
    <span className="absolute top-2 left-2 text-[10px] font-data font-medium text-white/80 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
      {toBanglaDigits(index + 1)}
    </span>
  </button>
);

const GalleryAlbumPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetAlbumByIdQuery(id);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const album = data?.data;
  const images = album?.images || [];
  const videos = album?.videos || [];

  if (isLoading) {
    return (
      <div className="flex justify-center pt-20">
        <Spinner size={28} className="text-primary-600" />
      </div>
    );
  }

  if (!album) return null;

  return (
    <div className="max-w-6xl mx-auto pt-6 space-y-6">
      <Link
        to="/dashboard/gallery"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-colors"
      >
        <FiArrowLeft size={14} /> গ্যালারিতে ফিরে যান
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">{album.title}</h1>
        {album.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl">{album.description}</p>
        )}

        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <FiImage size={13} /> {toBanglaDigits(images.length)} টি ছবি
          </span>
          {videos.length > 0 && (
            <span className="flex items-center gap-1.5">
              <FiPlayCircle size={13} /> {toBanglaDigits(videos.length)} টি ভিডিও
            </span>
          )}
        </div>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {images.map((img, idx) => (
            <ImageTile key={img._id} img={img} index={idx} onOpen={setLightboxIndex} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center text-slate-400">
          <FiImage size={28} className="mx-auto mb-3 opacity-50" />
          এই অ্যালবামে এখনো কোনো ছবি নেই
        </div>
      )}

      {videos.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-lg text-slate-700 dark:text-slate-200 mb-3">ভিডিও</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.map((v) => (
              <a
                key={v._id}
                href={v.url}
                target="_blank"
                rel="noreferrer"
                className="glass-card p-4 flex items-center gap-3 hover:shadow-glow transition-shadow duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-primary-500/10 text-primary-600 flex items-center justify-center shrink-0">
                  <FiPlayCircle size={18} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                  {v.title || v.url}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox images={images} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
      )}
    </div>
  );
};

export default GalleryAlbumPage;
