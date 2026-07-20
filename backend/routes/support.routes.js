const express = require('express');
const ticketController = require('../controllers/ticket.controller');
const faqController = require('../controllers/faq.controller');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  mongoIdParam,
  createTicketValidator,
  addReplyValidator,
  updateStatusValidator,
  assignTicketValidator,
  createFaqValidator,
} = require('../validators/support.validator');

const router = express.Router();

const STAFF_ROLES = ['owner', 'super_admin', 'admin'];

router.use(protect);

router.get('/faqs', faqController.getAllFaqs);
router.post('/faqs', authorize(...STAFF_ROLES), createFaqValidator, validate, faqController.createFaq);
router.patch('/faqs/:id', authorize(...STAFF_ROLES), mongoIdParam, validate, faqController.updateFaq);
router.delete('/faqs/:id', authorize(...STAFF_ROLES), mongoIdParam, validate, faqController.deleteFaq);

router.get('/tickets/my', ticketController.getMyTickets);
router.get('/tickets', authorize(...STAFF_ROLES), ticketController.getAllTickets);
router.post('/tickets', createTicketValidator, validate, ticketController.createTicket);
router.get('/tickets/:id', mongoIdParam, validate, ticketController.getTicketById);
router.post('/tickets/:id/replies', addReplyValidator, validate, ticketController.addReply);
router.patch(
  '/tickets/:id/status',
  authorize(...STAFF_ROLES),
  updateStatusValidator,
  validate,
  ticketController.updateTicketStatus
);
router.patch(
  '/tickets/:id/assign',
  authorize(...STAFF_ROLES),
  assignTicketValidator,
  validate,
  ticketController.assignTicket
);

module.exports = router;
