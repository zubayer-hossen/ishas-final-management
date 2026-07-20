import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiTrash2, FiUpload } from 'react-icons/fi';
import {
  useGetAlbumsQuery,
  useCreateAlbumMutation,
  useAddImagesToAlbumMutation,
  useDeleteAlbumMutation,
} from '../../features/gallery/galleryApi';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import Spinner from '../../components/ui/Spinner';

const CreateAlbumForm = ({ onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [createAlbum, { isLoading }] = useCreateAlbumMutation();

  const onSubmit = async (formData) => {
    const fd = new FormData();
    fd.append('title', formData.title);
    if (formData.description) fd.append('description', formData.description);
    if (formData.images?.length) {
      Array.from(formData.images).forEach((file) => fd.append('images', file));
    }

    try {
      await createAlbum(fd).unwrap();
      toast.success('অ্যালবাম তৈরি করা হয়েছে');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'তৈরি ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        onClick={(e) => e.stopPropagation()}
        className="glass-card p-6 w-full max-w-md space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">নতুন অ্যালবাম</h3>
          <button type="button" onClick={onClose} className="text-slate-400">
            <FiX size={18} />
          </button>
        </div>

        <TextInput label="শিরোনাম" error={errors.title?.message} {...register('title', { required: 'শিরোনাম আবশ্যক' })} />
        <TextInput label="বিবরণ (ঐচ্ছিক)" {...register('description')} />

        <div>
          <label className="field-label">ছবি (একাধিক নির্বাচন করা যাবে)</label>
          <input type="file" accept="image/*" multiple className="input-field" {...register('images')} />
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full">
          তৈরি করুন
        </Button>
      </form>
    </div>
  );
};

const AddImagesButton = ({ albumId }) => {
  const [addImages, { isLoading }] = useAddImagesToAlbumMutation();

  const handleChange = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    const fd = new FormData();
    Array.from(files).forEach((file) => fd.append('images', file));

    try {
      await addImages({ id: albumId, formData: fd }).unwrap();
      toast.success('ছবি যুক্ত করা হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'আপলোড ব্যর্থ হয়েছে');
    }
  };

  return (
    <label className={`text-primary-600 dark:text-primary-400 cursor-pointer ${isLoading ? 'opacity-50' : ''}`} title="ছবি যুক্ত করুন">
      <FiUpload size={15} />
      <input type="file" accept="image/*" multiple hidden onChange={handleChange} disabled={isLoading} />
    </label>
  );
};

const GalleryManagementPage = () => {
  const { data, isLoading } = useGetAlbumsQuery({ limit: 30 });
  const [deleteAlbum] = useDeleteAlbumMutation();
  const [showCreate, setShowCreate] = useState(false);

  const albums = data?.data?.albums || [];

  const handleDelete = async (id) => {
    try {
      await deleteAlbum(id).unwrap();
      toast.success('অ্যালবাম মুছে ফেলা হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'মুছে ফেলা ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="max-w-5xl mx-auto pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">গ্যালারি পরিচালনা</h1>
        <Button className="!py-2 text-sm" onClick={() => setShowCreate(true)}>
          <FiPlus size={15} /> নতুন অ্যালবাম
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center pt-16">
          <Spinner size={28} className="text-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {albums.map((album) => (
            <div key={album._id} className="glass-card overflow-hidden">
              <div className="aspect-video bg-slate-200 dark:bg-slate-800">
                {album.coverImage?.url && (
                  <img src={album.coverImage.url} alt={album.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{album.title}</p>
                  <p className="text-xs text-slate-400">{album.imageCount ?? 0} টি ছবি</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <AddImagesButton albumId={album._id} />
                  <button onClick={() => handleDelete(album._id)} className="text-danger/70 hover:text-danger">
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {albums.length === 0 && (
            <div className="glass-card p-10 text-center text-slate-400 sm:col-span-2 lg:col-span-3">কোনো অ্যালবাম নেই</div>
          )}
        </div>
      )}

      {showCreate && <CreateAlbumForm onClose={() => setShowCreate(false)} />}
    </div>
  );
};

export default GalleryManagementPage;
