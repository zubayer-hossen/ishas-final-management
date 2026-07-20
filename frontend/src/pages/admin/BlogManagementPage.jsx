import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiTrash2, FiEdit2 } from 'react-icons/fi';
import {
  useGetBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} from '../../features/blog/blogApi';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import Spinner from '../../components/ui/Spinner';

const CATEGORY_OPTIONS = [
  { value: 'news', label: 'সংবাদ' },
  { value: 'announcement', label: 'ঘোষণা' },
  { value: 'story', label: 'গল্প' },
  { value: 'opinion', label: 'মতামত' },
  { value: 'guide', label: 'গাইড' },
  { value: 'other', label: 'অন্যান্য' },
];

const BlogForm = ({ blog, onClose }) => {
  const isEdit = !!blog;
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: blog
      ? { title: blog.title, excerpt: blog.excerpt, content: blog.content, category: blog.category, status: blog.status, tags: blog.tags?.join(', ') }
      : { category: 'other', status: 'draft' },
  });
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();

  const onSubmit = async (formData) => {
    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'coverImage') {
        if (value?.[0]) fd.append('coverImage', value[0]);
      } else if (value !== '' && value !== undefined) {
        fd.append(key, value);
      }
    });

    try {
      if (isEdit) {
        await updateBlog({ id: blog._id, formData: fd }).unwrap();
        toast.success('ব্লগ আপডেট হয়েছে');
      } else {
        await createBlog(fd).unwrap();
        toast.success('ব্লগ তৈরি করা হয়েছে');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        onClick={(e) => e.stopPropagation()}
        className="glass-card p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">{isEdit ? 'ব্লগ সম্পাদনা' : 'নতুন ব্লগ পোস্ট'}</h3>
          <button type="button" onClick={onClose} className="text-slate-400">
            <FiX size={18} />
          </button>
        </div>

        <TextInput label="শিরোনাম" error={errors.title?.message} {...register('title', { required: 'শিরোনাম আবশ্যক' })} />
        <TextInput label="সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)" {...register('excerpt')} />

        <div>
          <label className="field-label">কন্টেন্ট</label>
          <textarea className="input-field min-h-40" {...register('content', { required: true })} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">ক্যাটাগরি</label>
            <select className="input-field" {...register('category')}>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">স্ট্যাটাস</label>
            <select className="input-field" {...register('status')}>
              <option value="draft">ড্রাফট</option>
              <option value="published">প্রকাশিত</option>
            </select>
          </div>
        </div>

        <TextInput label="ট্যাগ (কমা দিয়ে আলাদা করুন)" {...register('tags')} />

        <div>
          <label className="field-label">কভার ছবি (ঐচ্ছিক)</label>
          <input type="file" accept="image/*" className="input-field" {...register('coverImage')} />
        </div>

        <Button type="submit" isLoading={isCreating || isUpdating} className="w-full">
          সংরক্ষণ করুন
        </Button>
      </form>
    </div>
  );
};

const BlogManagementPage = () => {
  const { data, isLoading } = useGetBlogsQuery({ limit: 50, status: 'draft' });
  const { data: publishedData } = useGetBlogsQuery({ limit: 50, status: 'published' });
  const [deleteBlog] = useDeleteBlogMutation();
  const [formBlog, setFormBlog] = useState(undefined);

  const blogs = [...(data?.data?.blogs || []), ...(publishedData?.data?.blogs || [])];

  const handleDelete = async (id) => {
    try {
      await deleteBlog(id).unwrap();
      toast.success('ব্লগ মুছে ফেলা হয়েছে');
    } catch (err) {
      toast.error(err?.data?.message || 'মুছে ফেলা ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="max-w-5xl mx-auto pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">ব্লগ পরিচালনা</h1>
        <Button className="!py-2 text-sm" onClick={() => setFormBlog(null)}>
          <FiPlus size={15} /> নতুন পোস্ট
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center pt-16">
          <Spinner size={28} className="text-primary-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {blogs.map((blog) => (
            <div key={blog._id} className="glass-card p-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      blog.status === 'published' ? 'bg-success/15 text-success' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {blog.status === 'published' ? 'প্রকাশিত' : 'ড্রাফট'}
                  </span>
                </div>
                <p className="font-semibold text-slate-800 dark:text-white truncate">{blog.title}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => setFormBlog(blog)} className="text-slate-500 hover:text-primary-600" title="সম্পাদনা">
                  <FiEdit2 size={15} />
                </button>
                <button onClick={() => handleDelete(blog._id)} className="text-danger/70 hover:text-danger" title="মুছুন">
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}
          {blogs.length === 0 && <div className="glass-card p-10 text-center text-slate-400">কোনো ব্লগ পোস্ট নেই</div>}
        </div>
      )}

      {formBlog !== undefined && <BlogForm blog={formBlog} onClose={() => setFormBlog(undefined)} />}
    </div>
  );
};

export default BlogManagementPage;
