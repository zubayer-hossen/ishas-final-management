import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const AUTOPLAY_MS = 6000;

/**
 * Full-width hero banner slider. Supports any number of banners (1 or many).
 * With a single banner, arrows/dots/autoplay are simply not rendered.
 */
const BannerSlider = ({ banners }) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

  const count = banners.length;

  const goTo = useCallback(
    (next) => {
      setDirection(next > index || (index === count - 1 && next === 0) ? 1 : -1);
      setIndex(((next % count) + count) % count);
    },
    [index, count]
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (count <= 1) return undefined;
    timerRef.current = setInterval(goNext, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [goNext, count]);

  if (!count) return null;

  const banner = banners[index];

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
  };

  return (
    <div
      className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[560px] overflow-hidden rounded-2xl sm:rounded-3xl shadow-glass dark:shadow-glass-dark"
      onMouseEnter={() => clearInterval(timerRef.current)}
      onMouseLeave={() => {
        if (count > 1) timerRef.current = setInterval(goNext, AUTOPLAY_MS);
      }}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={banner._id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img src={banner.image?.url} alt={banner.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-14">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-white font-display font-bold text-xl sm:text-3xl lg:text-4xl max-w-2xl leading-tight"
            >
              {banner.title}
            </motion.h2>
            {banner.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-white/85 mt-2 sm:mt-3 max-w-xl text-sm sm:text-base"
              >
                {banner.subtitle}
              </motion.p>
            )}
            {banner.buttonText && banner.linkUrl && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                <Link to={banner.linkUrl} className="btn-gradient inline-flex mt-5 sm:mt-6 !py-2.5 sm:!py-3">
                  {banner.buttonText}
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="আগের ব্যানার"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            onClick={goNext}
            aria-label="পরের ব্যানার"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
          >
            <FiChevronRight size={20} />
          </button>

          <div className="absolute bottom-3 sm:bottom-4 inset-x-0 flex items-center justify-center gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b._id}
                onClick={() => goTo(i)}
                aria-label={`ব্যানার ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerSlider;
