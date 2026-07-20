/**
 * Hand-authored OpenAPI 3.0 specification.
 * Served at /api-docs via swagger-ui-express (see app.js).
 *
 * Covers every route group registered in the API. Request/response bodies
 * are documented at a summary level for every endpoint; full JSON Schemas
 * are provided for the core models (User, Transaction, Notice) as a
 * reference pattern — the same shapes apply across the other modules.
 */

const security = [{ bearerAuth: [] }];

const paginationParams = [
  { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
  { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
];

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string' },
  description: 'MongoDB ObjectId',
};

const op = (summary, tags, opts = {}) => ({
  summary,
  tags,
  security: opts.public ? [] : security,
  parameters: [...(opts.pagination ? paginationParams : []), ...(opts.params || [])],
  ...(opts.body ? { requestBody: { content: { 'application/json': { schema: opts.body } } } } : {}),
  responses: {
    200: { description: 'Success' },
    ...(opts.created ? { 201: { description: 'Created' } } : {}),
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not found' },
  },
});

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'ISHAS Organization Management System API',
    version: '1.0.0',
    description:
      'REST API for the ISHAS Organization Management System — authentication, membership, committees, ' +
      'fund management, notices, events, blogs, gallery, meetings (Socket.IO signaling), support tickets, ' +
      'notifications, and reports. All endpoints are JSON except file/PDF/Excel downloads and multipart uploads.',
    contact: { name: 'ISHAS Organization' },
  },
  servers: [{ url: '/api/v1', description: 'Current environment' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token from /auth/login or /auth/refresh-token. Also accepted as an httpOnly cookie.',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          fullName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          memberId: { type: 'string', example: 'ISHAS-2026-0001' },
          role: {
            type: 'string',
            enum: ['owner', 'super_admin', 'admin', 'treasurer', 'committee_member', 'general_member', 'guest'],
          },
          membershipStatus: {
            type: 'string',
            enum: ['pending', 'active', 'suspended', 'rejected', 'inactive'],
          },
          isEmailVerified: { type: 'boolean' },
          profilePicture: {
            type: 'object',
            properties: { url: { type: 'string' }, publicId: { type: 'string' } },
          },
        },
      },
      Transaction: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          transactionId: { type: 'string', example: 'TXN-2026-000001' },
          type: { type: 'string', enum: ['income', 'expense'] },
          category: {
            type: 'string',
            enum: ['monthly_chada', 'donation', 'emergency_fund', 'special_fund', 'other_income', 'expense'],
          },
          member: { type: 'string', description: 'User ObjectId' },
          amount: { type: 'number' },
          month: { type: 'string', example: '2026-07' },
          paymentMethod: { type: 'string', enum: ['cash', 'bkash', 'nagad', 'rocket', 'bank', 'other'] },
          isVoided: { type: 'boolean' },
        },
      },
      Notice: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          content: { type: 'string' },
          category: { type: 'string', enum: ['general', 'meeting', 'financial', 'event', 'urgent', 'other'] },
          isPinned: { type: 'boolean' },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Registration, login, OTP, password reset, sessions' },
    { name: 'Members', description: 'Profile, approval workflow, role/status management' },
    { name: 'Committees', description: 'Organizational committee structure' },
    { name: 'Transactions', description: 'Fund management — income, expense, dues, receipts' },
    { name: 'Settings', description: 'Organization-wide configuration' },
    { name: 'Notices', description: 'Announcements' },
    { name: 'Events', description: 'Event scheduling, registration, QR attendance, certificates' },
    { name: 'Blogs', description: 'Blog posts, likes, comments' },
    { name: 'Gallery', description: 'Photo/video albums' },
    { name: 'Meetings', description: 'Meeting scheduling and join verification (real-time signaling via Socket.IO /meeting namespace)' },
    { name: 'Support', description: 'Tickets and FAQs' },
    { name: 'Notifications', description: 'In-app real-time notifications' },
    { name: 'Reports', description: 'PDF/Excel report generation' },
  ],
  paths: {
    '/auth/register': { post: op('Register a new member', ['Auth'], { public: true, created: true }) },
    '/auth/verify-otp': { post: op('Verify email OTP', ['Auth'], { public: true }) },
    '/auth/resend-otp': { post: op('Resend email OTP', ['Auth'], { public: true }) },
    '/auth/login': { post: op('Login', ['Auth'], { public: true }) },
    '/auth/refresh-token': { post: op('Exchange refresh token for a new access token', ['Auth'], { public: true }) },
    '/auth/forgot-password': { post: op('Request password reset email', ['Auth'], { public: true }) },
    '/auth/reset-password': { post: op('Reset password using emailed token', ['Auth'], { public: true }) },
    '/auth/logout': { post: op('Logout current session', ['Auth']) },
    '/auth/logout-all': { post: op('Logout all devices', ['Auth']) },
    '/auth/change-password': { post: op('Change password (logged in)', ['Auth']) },
    '/auth/me': { get: op('Get current user profile', ['Auth']) },

    '/members': { get: op('List/search members', ['Members'], { pagination: true }) },
    '/members/{id}': { get: op('Get member by id', ['Members'], { params: [idParam] }) },
    '/members/{id}/approve': { patch: op('Approve pending member', ['Members'], { params: [idParam] }) },
    '/members/{id}/reject': { patch: op('Reject pending member', ['Members'], { params: [idParam] }) },
    '/members/{id}/role': { patch: op("Change a member's role", ['Members'], { params: [idParam] }) },
    '/members/{id}/status': { patch: op('Change membership status', ['Members'], { params: [idParam] }) },
    '/members/me': { patch: op('Update own profile', ['Members']) },
    '/members/me/profile-picture': {
      post: op('Upload own profile picture (multipart/form-data)', ['Members']),
    },

    '/committees': {
      get: op('List committees', ['Committees'], { pagination: true }),
      post: op('Create committee', ['Committees'], { created: true }),
    },
    '/committees/{id}': {
      get: op('Get committee by id', ['Committees'], { params: [idParam] }),
      patch: op('Update committee', ['Committees'], { params: [idParam] }),
      delete: op('Delete committee', ['Committees'], { params: [idParam] }),
    },
    '/committees/{id}/members': { post: op('Add member to committee', ['Committees'], { params: [idParam] }) },

    '/transactions': {
      get: op('List transactions', ['Transactions'], { pagination: true }),
      post: op('Record income/expense', ['Transactions'], { created: true, body: { $ref: '#/components/schemas/Transaction' } }),
    },
    '/transactions/{id}': { get: op('Get transaction by id', ['Transactions'], { params: [idParam] }) },
    '/transactions/{id}/void': { patch: op('Void a transaction', ['Transactions'], { params: [idParam] }) },
    '/transactions/dues/me': { get: op('Get own monthly-chada dues summary', ['Transactions']) },
    '/transactions/dues/{memberId}': { get: op("Get a member's dues summary", ['Transactions']) },
    '/transactions/{id}/receipt': { get: op('Download PDF receipt', ['Transactions'], { params: [idParam] }) },
    '/transactions/verify/{transactionId}': {
      get: op('Public QR verification of a receipt', ['Transactions'], { public: true }),
    },

    '/settings': {
      get: op('Get organization settings', ['Settings']),
      patch: op('Update organization settings (owner only)', ['Settings']),
    },

    '/notices': {
      get: op('List notices', ['Notices'], { pagination: true }),
      post: op('Publish notice (multipart for attachments)', ['Notices'], { created: true }),
    },
    '/notices/{id}': { get: op('Get notice by id', ['Notices'], { params: [idParam] }) },
    '/notices/{id}/pin': { patch: op('Toggle pin', ['Notices'], { params: [idParam] }) },

    '/events': {
      get: op('List events', ['Events'], { pagination: true }),
      post: op('Create event (multipart for cover image)', ['Events'], { created: true }),
    },
    '/events/{id}': {
      get: op('Get event by id', ['Events'], { params: [idParam] }),
      patch: op('Update event', ['Events'], { params: [idParam] }),
      delete: op('Delete event', ['Events'], { params: [idParam] }),
    },
    '/events/{id}/register': {
      post: op('Register for event', ['Events'], { params: [idParam], created: true }),
      delete: op('Cancel registration', ['Events'], { params: [idParam] }),
    },
    '/events/{id}/ticket': { get: op('Get QR ticket image (PNG)', ['Events'], { params: [idParam] }) },
    '/events/{id}/attendance': {
      get: op('Get attendance list', ['Events'], { params: [idParam] }),
      post: op('Mark attendance by QR code', ['Events'], { params: [idParam] }),
    },
    '/events/{id}/certificate': { get: op('Download participation certificate PDF', ['Events'], { params: [idParam] }) },

    '/blogs': {
      get: op('List blog posts', ['Blogs'], { pagination: true }),
      post: op('Create blog post (multipart for cover image)', ['Blogs'], { created: true }),
    },
    '/blogs/{slug}': { get: op('Get blog post by slug', ['Blogs']) },
    '/blogs/{id}': { patch: op('Update blog post', ['Blogs'], { params: [idParam] }), delete: op('Delete blog post', ['Blogs'], { params: [idParam] }) },
    '/blogs/{id}/like': { post: op('Toggle like', ['Blogs'], { params: [idParam] }) },
    '/blogs/{id}/comments': { post: op('Add comment', ['Blogs'], { params: [idParam], created: true }) },

    '/gallery/albums': {
      get: op('List albums', ['Gallery'], { pagination: true }),
      post: op('Create album (multipart, multiple images)', ['Gallery'], { created: true }),
    },
    '/gallery/albums/{id}': { get: op('Get album by id', ['Gallery'], { params: [idParam] }) },
    '/gallery/albums/{id}/images': { post: op('Add images to album', ['Gallery'], { params: [idParam] }) },
    '/gallery/albums/{id}/videos': { post: op('Add video link to album', ['Gallery'], { params: [idParam] }) },

    '/meetings': {
      get: op('List meetings', ['Meetings'], { pagination: true }),
      post: op('Schedule meeting', ['Meetings'], { created: true }),
    },
    '/meetings/{id}': { get: op('Get meeting by id', ['Meetings'], { params: [idParam] }) },
    '/meetings/{id}/verify-join': {
      post: op('Verify meeting password before connecting to Socket.IO', ['Meetings'], { params: [idParam] }),
    },
    '/meetings/{id}/attendance': { get: op('Get meeting attendance log', ['Meetings'], { params: [idParam] }) },

    '/support/tickets': {
      get: op('List all tickets (staff)', ['Support'], { pagination: true }),
      post: op('Create ticket', ['Support'], { created: true }),
    },
    '/support/tickets/my': { get: op('List own tickets', ['Support'], { pagination: true }) },
    '/support/tickets/{id}': { get: op('Get ticket by id', ['Support'], { params: [idParam] }) },
    '/support/tickets/{id}/replies': { post: op('Reply to ticket', ['Support'], { params: [idParam], created: true }) },
    '/support/tickets/{id}/status': { patch: op('Update ticket status', ['Support'], { params: [idParam] }) },
    '/support/faqs': {
      get: op('List FAQs', ['Support'], { public: false }),
      post: op('Create FAQ', ['Support'], { created: true }),
    },

    '/notifications': { get: op('List own notifications', ['Notifications'], { pagination: true }) },
    '/notifications/read-all': { patch: op('Mark all as read', ['Notifications']) },
    '/notifications/{id}/read': { patch: op('Mark one as read', ['Notifications'], { params: [idParam] }) },

    '/reports/financial': { get: op('Financial report (PDF/Excel)', ['Reports']) },
    '/reports/members': { get: op('Members report (PDF/Excel)', ['Reports']) },
    '/reports/dues': { get: op('Dues report (PDF/Excel)', ['Reports']) },
    '/reports/events/{id}/attendance': { get: op('Event attendance report', ['Reports'], { params: [idParam] }) },
    '/reports/meetings/{id}/attendance': { get: op('Meeting attendance report', ['Reports'], { params: [idParam] }) },
  },
};

module.exports = swaggerSpec;
