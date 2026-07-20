import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useGetAlbumByIdQuery } from '../../features/gallery/galleryApi';
import Lightbox from '../../components/gallery/Lightbox';
import Spinner from '../../components/ui/Spinner';

const GalleryAlbumPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetAlbumByIdQuery(id);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const album = data?.data;
  const images = album?.images || [];

  if (isLoading) {
    return (
      <div className="flex justify-center pt-20">
        <Spinner size={28} className="text-primary-600" />
      </div>
    );
  }

  if (!album) return null;

  return (
    <div className="max-w-6xl mx-auto pt-6 space-y-5">
      <Link
        to="/dashboard/gallery"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600"
      >
        <FiArrowLeft size={14} /> গ্যালারিতে ফিরে যান
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">{album.title}</h1>
        {album.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{album.description}</p>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <button
            key={img._id}
            onClick={() => setLightboxIndex(idx)}
            className="aspect-square rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800"
          >
            <img src={img.url} alt={img.caption || album.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
          </button>
        ))}
        {images.length === 0 && (
          <p className="col-span-full text-center text-slate-400 py-10">এই অ্যালবামে এখনো কোনো ছবি নেই</p>
        )}
      </div>

      {album.videos?.length > 0 && (
        <div>
          <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">ভিডিও</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {album.videos.map((v) => (
              <div key={v._id} className="glass-card p-4">
                <a href={v.url} target="_blank" rel="noreferrer" className="text-primary-600 dark:text-primary-400 text-sm hover:underline">
                  {v.title || v.url}
                </a>
              </div>
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
