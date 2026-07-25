import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiHeart, FiEye, FiArrowLeft, FiSend, FiTrash2 } from 'react-icons/fi';
import {
  useGetBlogBySlugQuery,
  useToggleBlogLikeMutation,
  useAddBlogCommentMutation,
  useDeleteBlogCommentMutation,
} from '../../features/blog/blogApi';
import { useAppSelector } from '../../app/hooks';
import PublicLayout from '../../components/layout/PublicLayout';
import ShareButtons from '../../components/blog/ShareButtons';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { BLOG_CATEGORY_LABELS } from '../../utils/blogCategories';
import { toBanglaDigits } from '../../utils/banglaDigits';
import { timeAgoBn } from '../../utils/timeAgo';
import { MANAGE_ROLES } from '../../utils/roles';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const { data, isLoading, isError } = useGetBlogBySlugQuery(slug);
  const [toggleLike, { isLoading: isLiking }] = useToggleBlogLikeMutation();
  const [addComment, { isLoading: isCommenting }] = useAddBlogCommentMutation();
  const [deleteComment] = useDeleteBlogCommentMutation();
  const currentUser = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [commentText, setCommentText] = useState('');

  const blog = data?.data;

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex justify-center pt-24">
          <Spinner size={30} className="text-primary-600" />
        </div>
      </PublicLayout>
    );
  }

  if (isError || !blog) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">এই ব্লগ পোস্টটি পাওয়া যায়নি।</p>
          <Link to="/blog" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            ব্লগ তালিকায় ফিরে যান
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const isLiked = isAuthenticated && blog.likes?.some((id) => id === currentUser?._id);
  const shareUrl = `${window.location.origin}/blog/${blog.slug}`;

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error('লাইক দিতে অনুগ্রহ করে লগইন করুন');
      return;
    }
    toggleLike({ id: blog._id, slug: blog.slug });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('মন্তব্য করতে অনুগ্রহ করে লগইন করুন');
      return;
    }
    if (!commentText.trim()) return;
    try {
      await addComment({ id: blog._id, slug: blog.slug, text: commentText.trim() }).unwrap();
      setCommentText('');
    } catch (err) {
      toast.error(err?.data?.message || 'মন্তব্য যুক্ত করা ব্যর্থ হয়েছে');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment({ id: blog._id, slug: blog.slug, commentId }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || 'মুছে ফেলা ব্যর্থ হয়েছে');
    }
  };

  return (
    <PublicLayout>
      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 mb-6"
        >
          <FiArrowLeft size={14} /> ব্লগ তালিকায় ফিরে যান
        </Link>

        <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-600 mb-3">
          {BLOG_CATEGORY_LABELS[blog.category] || blog.category}
        </span>

        <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-800 dark:text-white leading-snug mb-4">
          {blog.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <img
              src={
                blog.author?.profilePicture?.url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author?.fullName || 'A')}&background=4f46e5&color=fff`
              }
              alt={blog.author?.fullName}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{blog.author?.fullName}</p>
              <p className="text-xs text-slate-400">
                {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('bn-BD', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <ShareButtons url={shareUrl} title={blog.title} />
        </div>

        {blog.coverImage?.url && (
          <img
            src={blog.coverImage.url}
            alt={blog.title}
            className="w-full aspect-video object-cover rounded-xl2 my-6"
          />
        )}

        <div
          className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-display prose-img:rounded-xl leading-relaxed whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-8 py-4 border-y border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isLiked ? 'text-danger' : 'text-slate-500 dark:text-slate-400 hover:text-danger'
            }`}
          >
            <FiHeart size={18} className={isLiked ? 'fill-current' : ''} />
            {toBanglaDigits(blog.likeCount ?? blog.likes?.length ?? 0)} লাইক
          </button>
          <span className="flex items-center gap-1.5 text-sm text-slate-400">
            <FiEye size={16} /> {toBanglaDigits(blog.views || 0)} বার দেখা হয়েছে
          </span>
        </div>

        {/* -------- Comments -------- */}
        <section className="mt-8">
          <h2 className="font-display font-bold text-lg text-slate-800 dark:text-white mb-4">
            মন্তব্য ({toBanglaDigits(blog.comments?.length || 0)})
          </h2>

          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="flex items-start gap-3 mb-6">
              <img
                src={
                  currentUser?.profilePicture?.url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.fullName || 'U')}&background=4f46e5&color=fff`
                }
                alt=""
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="একটি মন্তব্য লিখুন..."
                  className="input-field flex-1"
                />
                <Button type="submit" isLoading={isCommenting} className="!px-4">
                  <FiSend size={15} />
                </Button>
              </div>
            </form>
          ) : (
            <div className="glass-card p-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
              মন্তব্য করতে{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                লগইন করুন
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {blog.comments
              ?.slice()
              .reverse()
              .map((comment) => {
                const canDelete =
                  currentUser &&
                  (comment.user?._id === currentUser._id || MANAGE_ROLES.includes(currentUser.role));
                return (
                  <div key={comment._id} className="flex items-start gap-3">
                    <img
                      src={
                        comment.user?.profilePicture?.url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.fullName || 'U')}&background=6366f1&color=fff`
                      }
                      alt=""
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 glass-card !shadow-none p-3.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {comment.user?.fullName || 'সদস্য'}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">{timeAgoBn(comment.createdAt)}</span>
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-slate-300 hover:text-danger"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            {(!blog.comments || blog.comments.length === 0) && (
              <p className="text-center text-sm text-slate-400 py-6">প্রথম মন্তব্যটি আপনিই করুন</p>
            )}
          </div>
        </section>
      </article>
    </PublicLayout>
  );
};

export default BlogDetailPage;
