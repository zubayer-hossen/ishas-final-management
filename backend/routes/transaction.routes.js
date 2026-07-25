const express = require('express');
const transactionController = require('../controllers/transaction.controller');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createTransactionValidator,
  voidTransactionValidator,
  mongoIdParam,
  memberIdParam,
} = require('../validators/transaction.validator');

const router = express.Router();

const FINANCE_ROLES = ['owner', 'super_admin', 'admin', 'treasurer'];

// -------- Public route (QR verification) --------
router.get('/verify/:transactionId', transactionController.verifyReceipt);

router.use(protect);

// -------- Self-service --------
router.get('/dues/me', transactionController.getMyDues);

// -------- Finance staff routes --------
router.post(
  '/',
  authorize(...FINANCE_ROLES),
  createTransactionValidator,
  validate,
  transactionController.createTransaction
);
router.get('/', authorize(...FINANCE_ROLES), transactionController.getAllTransactions);
router.get(
  '/dues/:memberId',
  authorize(...FINANCE_ROLES),
  memberIdParam,
  validate,
  transactionController.getMemberDues
);
router.patch(
  '/:id/void',
  authorize('owner', 'treasurer'),
  voidTransactionValidator,
  validate,
  transactionController.voidTransaction
);

// -------- Shared (staff or the member who owns the transaction) --------
router.get('/:id', mongoIdParam, validate, transactionController.getTransactionById);
router.get('/:id/receipt', mongoIdParam, validate, transactionController.downloadReceipt);

module.exports = router;
