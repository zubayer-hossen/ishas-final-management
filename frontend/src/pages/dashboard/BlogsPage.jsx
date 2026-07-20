import { useGetBlogsQuery } from '../../features/blog/blogApi';
import Spinner from '../../components/ui/Spinner';

const BlogsPage = () => {
  const { data, isLoading } = useGetBlogsQuery({ limit: 12 });
  const blogs = data?.data?.blogs || [];

  return (
    <div className="max-w-5xl mx-auto pt-6 space-y-4">
      <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">ব্লগ</h1>

      {isLoading && (
        <div className="flex justify-center pt-16">
          <Spinner size={28} className="text-primary-600" />
        </div>
      )}

      {!isLoading && blogs.length === 0 && (
        <div className="glass-card p-10 text-center text-slate-400">কোনো ব্লগ পোস্ট নেই</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {blogs.map((blog) => (
          <article key={blog._id} className="glass-card overflow-hidden">
            {blog.coverImage?.url && (
              <img src={blog.coverImage.url} alt={blog.title} className="h-36 w-full object-cover" />
            )}
            <div className="p-4">
              <p className="font-semibold text-slate-800 dark:text-white line-clamp-2">{blog.title}</p>
              {blog.excerpt && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">{blog.excerpt}</p>
              )}
              <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                <span>{blog.author?.fullName}</span>
                <span>{blog.likeCount ?? 0} লাইক</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogsPage;
