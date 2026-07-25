import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiEye, FiMessageCircle, FiHeart } from 'react-icons/fi';
import { useGetBlogsQuery } from '../../features/blog/blogApi';
import PublicLayout from '../../components/layout/PublicLayout';
import Spinner from '../../components/ui/Spinner';
import { BLOG_CATEGORIES, BLOG_CATEGORY_LABELS } from '../../utils/blogCategories';
import { toBanglaDigits } from '../../utils/banglaDigits';

const PostMeta = ({ blog }) => (
  <div className="flex items-center gap-3 text-xs text-slate-400">
    <span className="flex items-center gap-1">
      <FiEye size={12} /> {toBanglaDigits(blog.views || 0)}
    </span>
    <span className="flex items-center gap-1">
      <FiHeart size={12} /> {toBanglaDigits(blog.likeCount ?? 0)}
    </span>
    <span className="flex items-center gap-1">
      <FiMessageCircle size={12} /> {toBanglaDigits(blog.commentCount ?? 0)}
    </span>
  </div>
);

const BlogListPage = () => {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading } = useGetBlogsQuery({ category: category || undefined, search: search || undefined, limit: 13 });
  const blogs = data?.data?.blogs || [];
  const [featured, ...rest] = blogs;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-800 dark:text-white">ব্লগ ও সংবাদ</h1>
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="খুঁজুন..."
              className="input-field !pl-9"
            />
          </form>
        </div>

        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          <button
            onClick={() => setCategory('')}
            className={`shrink-0 text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${
              !category
                ? 'bg-gradient-brand text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            সব
          </button>
          {BLOG_CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`shrink-0 text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${
                category === c.value
                  ? 'bg-gradient-brand text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-center pt-16">
            <Spinner size={28} className="text-primary-600" />
          </div>
        )}

        {!isLoading && blogs.length === 0 && (
          <div className="glass-card p-12 text-center text-slate-400">কোনো ব্লগ পোস্ট পাওয়া যায়নি</div>
        )}

        {!isLoading && featured && (
          <Link
            to={`/blog/${featured.slug}`}
            className="group block glass-card overflow-hidden mb-8 sm:flex sm:items-stretch"
          >
            {featured.coverImage?.url && (
              <div className="sm:w-1/2 aspect-video sm:aspect-auto overflow-hidden">
                <img
                  src={featured.coverImage.url}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-6 sm:w-1/2 flex flex-col justify-center">
              <span className="inline-block w-fit text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-600 mb-3">
                {BLOG_CATEGORY_LABELS[featured.category] || featured.category}
              </span>
              <h2 className="text-xl font-display font-bold text-slate-800 dark:text-white leading-snug group-hover:text-primary-600 transition-colors">
                {featured.title}
              </h2>
              {featured.excerpt && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{featured.excerpt}</p>
              )}
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-slate-400">
                  {featured.author?.fullName} · {new Date(featured.publishedAt || featured.createdAt).toLocaleDateString('bn-BD')}
                </span>
                <PostMeta blog={featured} />
              </div>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {rest.map((blog) => (
            <Link
              key={blog._id}
              to={`/blog/${blog.slug}`}
              className="group glass-card overflow-hidden flex flex-col"
            >
              {blog.coverImage?.url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={blog.coverImage.url}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col">
                <span className="inline-block w-fit text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-600 mb-2">
                  {BLOG_CATEGORY_LABELS[blog.category] || blog.category}
                </span>
                <p className="font-semibold text-slate-800 dark:text-white leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {blog.title}
                </p>
                {blog.excerpt && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">{blog.excerpt}</p>
                )}
                <div className="flex items-center justify-between mt-auto pt-3">
                  <span className="text-xs text-slate-400">{blog.author?.fullName}</span>
                  <PostMeta blog={blog} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};

export default BlogListPage;
