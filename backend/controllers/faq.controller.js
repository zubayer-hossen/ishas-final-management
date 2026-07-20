const Faq = require('../models/Faq');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @route POST /api/v1/support/faqs
 * @access owner, super_admin, admin
 */
const createFaq = asyncHandler(async (req, res) => {
  const { question, answer, category, order } = req.body;

  const faq = await Faq.create({ question, answer, category, order, createdBy: req.user._id });

  return res.status(201).json(new ApiResponse(201, faq, 'FAQ তৈরি করা হয়েছে'));
});

/**
 * @route GET /api/v1/support/faqs
 */
const getAllFaqs = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;

  const faqs = await Faq.find(filter).sort({ category: 1, order: 1 });

  return res.status(200).json(new ApiResponse(200, faqs, 'FAQ তালিকা'));
});

/**
 * @route PATCH /api/v1/support/faqs/:id
 */
const updateFaq = asyncHandler(async (req, res) => {
  const { question, answer, category, order, isActive } = req.body;
  const faq = await Faq.findById(req.params.id);
  if (!faq) throw ApiError.notFound('FAQ পাওয়া যায়নি');

  if (question !== undefined) faq.question = question;
  if (answer !== undefined) faq.answer = answer;
  if (category !== undefined) faq.category = category;
  if (order !== undefined) faq.order = order;
  if (isActive !== undefined) faq.isActive = isActive;

  await faq.save();

  return res.status(200).json(new ApiResponse(200, faq, 'FAQ আপডেট হয়েছে'));
});

/**
 * @route DELETE /api/v1/support/faqs/:id
 */
const deleteFaq = asyncHandler(async (req, res) => {
  const faq = await Faq.findByIdAndDelete(req.params.id);
  if (!faq) throw ApiError.notFound('FAQ পাওয়া যায়নি');

  return res.status(200).json(new ApiResponse(200, null, 'FAQ মুছে ফেলা হয়েছে'));
});

module.exports = { createFaq, getAllFaqs, updateFaq, deleteFaq };
