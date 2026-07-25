import { FiLink, FiShare2 } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * A row of share actions for a blog post. Uses the native Web Share API
 * on devices that support it (mostly mobile), and always shows explicit
 * copy-link / WhatsApp / Facebook buttons as a reliable fallback.
 */
const ShareButtons = ({ url, title }) => {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('লিংক কপি করা হয়েছে');
    } catch {
      toast.error('লিংক কপি করা যায়নি');
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      // user cancelled the share sheet — no need to show an error
    }
  };

  return (
    <div className="flex items-center gap-2">
      {typeof navigator !== 'undefined' && navigator.share && (
        <button
          onClick={handleNativeShare}
          className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-slate-600 dark:text-slate-300"
          title="শেয়ার করুন"
          aria-label="শেয়ার করুন"
        >
          <FiShare2 size={15} />
        </button>
      )}

      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`}
        target="_blank"
        rel="noreferrer"
        className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-[#25D366]"
        title="WhatsApp-এ শেয়ার করুন"
      >
        <FaWhatsapp size={16} />
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noreferrer"
        className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-[#1877F2]"
        title="Facebook-এ শেয়ার করুন"
      >
        <FaFacebook size={16} />
      </a>

      <button
        onClick={handleCopyLink}
        className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-slate-600 dark:text-slate-300"
        title="লিংক কপি করুন"
        aria-label="লিংক কপি করুন"
      >
        <FiLink size={15} />
      </button>
    </div>
  );
};

export default ShareButtons;
