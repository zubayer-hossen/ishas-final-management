export const BLOG_CATEGORIES = [
  { value: 'news', label: 'সংবাদ' },
  { value: 'announcement', label: 'ঘোষণা' },
  { value: 'story', label: 'গল্প' },
  { value: 'opinion', label: 'মতামত' },
  { value: 'guide', label: 'গাইড' },
  { value: 'other', label: 'অন্যান্য' },
];

export const BLOG_CATEGORY_LABELS = Object.fromEntries(BLOG_CATEGORIES.map((c) => [c.value, c.label]));
