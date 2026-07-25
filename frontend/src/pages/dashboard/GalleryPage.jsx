import { Link } from 'react-router-dom';
import { FiImage, FiCamera, FiFilm } from 'react-icons/fi';
import { useGetAlbumsQuery } from '../../features/gallery/galleryApi';
import Spinner from '../../components/ui/Spinner';
import { toBanglaDigits } from '../../utils/banglaDigits';

const GalleryPage = () => {
  const { data, isLoading } = useGetAlbumsQuery({ limit: 24 });
  const albums = data?.data?.albums || [];

  return (
    <div className="max-w-6xl mx-auto pt-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">গ্যালারি</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          সংগঠনের অনুষ্ঠান ও কার্যক্রমের ছবি অ্যালবাম
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center pt-16">
          <Spinner size={28} className="text-primary-600" />
        </div>
      )}

      {!isLoading && albums.length === 0 && (
        <div className="glass-card p-12 text-center text-slate-400">
          <FiImage size={32} className="mx-auto mb-3 opacity-50" />
          কোনো অ্যালবাম নেই
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {albums.map((album) => (
          <Link
            key={album._id}
            to={`/dashboard/gallery/${album._id}`}
            className="group block rounded-xl2 overflow-hidden shadow-glass dark:shadow-glass-dark bg-white dark:bg-slate-900 transition-transform duration-300 ease-out hover:-translate-y-1"
          >
            <div className="aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-800">
              {album.coverImage?.url ? (
                <img
                  src={album.coverImage.url}
                  alt={album.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <FiImage size={28} />
                </div>
              )}

              {/* Always-visible image-count pill */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-1 rounded-full">
                <FiCamera size={11} />
                {toBanglaDigits(album.imageCount ?? 0)}
              </div>

              {album.videos?.length > 0 && (
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-1 rounded-full">
                  <FiFilm size={11} />
                  {toBanglaDigits(album.videos.length)}
                </div>
              )}

              {/* Subtle darken-on-hover for polish */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 ease-out" />
            </div>

            <div className="p-3">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {album.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GalleryPage;
