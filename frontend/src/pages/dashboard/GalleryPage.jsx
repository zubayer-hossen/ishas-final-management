import { Link } from 'react-router-dom';
import { FiImage } from 'react-icons/fi';
import { useGetAlbumsQuery } from '../../features/gallery/galleryApi';
import Spinner from '../../components/ui/Spinner';

const GalleryPage = () => {
  const { data, isLoading } = useGetAlbumsQuery({ limit: 24 });
  const albums = data?.data?.albums || [];

  return (
    <div className="max-w-6xl mx-auto pt-6 space-y-5">
      <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">গ্যালারি</h1>

      {isLoading && (
        <div className="flex justify-center pt-16">
          <Spinner size={28} className="text-primary-600" />
        </div>
      )}

      {!isLoading && albums.length === 0 && (
        <div className="glass-card p-10 text-center text-slate-400">কোনো অ্যালবাম নেই</div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {albums.map((album) => (
          <Link key={album._id} to={`/dashboard/gallery/${album._id}`} className="glass-card overflow-hidden group">
            <div className="aspect-square bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
              {album.coverImage?.url ? (
                <img
                  src={album.coverImage.url}
                  alt={album.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <FiImage size={28} />
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{album.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{album.imageCount ?? 0} টি ছবি</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GalleryPage;
