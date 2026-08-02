const express = require('express');
const bannerController = require('../controllers/banner.controller');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadImage } = require('../middleware/upload.middleware');
const { mongoIdParam, createBannerValidator, updateBannerValidator } = require('../validators/banner.validator');

const router = express.Router();

router.get('/', bannerController.getPublicBanners);

router.get('/admin', protect, authorize('owner'), bannerController.getAllBannersAdmin);
router.post(
  '/',
  protect,
  authorize('owner'),
  uploadImage.single('image'),
  createBannerValidator,
  validate,
  bannerController.createBanner
);
router.patch(
  '/:id',
  protect,
  authorize('owner'),
  uploadImage.single('image'),
  updateBannerValidator,
  validate,
  bannerController.updateBanner
);
router.delete('/:id', protect, authorize('owner'), mongoIdParam, validate, bannerController.deleteBanner);

module.exports = router;
