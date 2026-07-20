const express = require('express');
const { param } = require('express-validator');
const galleryController = require('../controllers/gallery.controller');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadImage } = require('../middleware/upload.middleware');
const { mongoIdParam, createAlbumValidator, addVideoValidator } = require('../validators/gallery.validator');

const router = express.Router();

const STAFF_ROLES = ['owner', 'super_admin', 'admin', 'committee_member'];

router.use(protect);

router.get('/albums', galleryController.getAllAlbums);
router.get('/albums/:id', mongoIdParam, validate, galleryController.getAlbumById);

router.post(
  '/albums',
  authorize(...STAFF_ROLES),
  uploadImage.array('images', 20),
  createAlbumValidator,
  validate,
  galleryController.createAlbum
);
router.patch('/albums/:id', authorize(...STAFF_ROLES), mongoIdParam, validate, galleryController.updateAlbum);
router.delete('/albums/:id', authorize(...STAFF_ROLES), mongoIdParam, validate, galleryController.deleteAlbum);

router.post(
  '/albums/:id/images',
  authorize(...STAFF_ROLES),
  uploadImage.array('images', 20),
  mongoIdParam,
  validate,
  galleryController.addImagesToAlbum
);
router.delete(
  '/albums/:id/images/:imageId',
  authorize(...STAFF_ROLES),
  mongoIdParam,
  param('imageId').isMongoId().withMessage('অবৈধ ছবি ID'),
  validate,
  galleryController.deleteImage
);

router.post('/albums/:id/videos', authorize(...STAFF_ROLES), addVideoValidator, validate, galleryController.addVideo);
router.delete(
  '/albums/:id/videos/:videoId',
  authorize(...STAFF_ROLES),
  mongoIdParam,
  param('videoId').isMongoId().withMessage('অবৈধ ভিডিও ID'),
  validate,
  galleryController.deleteVideo
);

module.exports = router;
