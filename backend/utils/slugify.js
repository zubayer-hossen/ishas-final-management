const Blog = require('../models/Blog');

/**
 * Converts a title into a URL-friendly slug. Supports Bangla and Latin
 * scripts by only stripping characters that are unsafe in a URL, rather
 * than forcing ASCII-only transliteration.
 */
const slugify = (text) =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\u0980-\u09FFa-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Generates a unique slug for a blog post, appending -2, -3, etc.
 * if the base slug is already taken.
 */
const generateUniqueSlug = async (title) => {
  const baseSlug = slugify(title) || 'post';
  let slug = baseSlug;
  let counter = 2;

  // eslint-disable-next-line no-await-in-loop
  while (await Blog.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};

module.exports = { slugify, generateUniqueSlug };
