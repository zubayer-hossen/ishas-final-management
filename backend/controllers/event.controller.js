const crypto = require('crypto');
const QRCode = require('qrcode');
const Event = require('../models/Event');
const OrgSettings = require('../models/OrgSettings');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const generateCertificatePDF = require('../utils/generateCertificatePDF');

const STAFF_ROLES = ['owner', 'super_admin', 'admin', 'committee_member'];

/**
 * @route POST /api/v1/events
 * @access owner, super_admin, admin, committee_member
 */
const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    location,
    startDate,
    endDate,
    registrationRequired,
    registrationDeadline,
    maxParticipants,
  } = req.body;

  let coverImage = { url: '', publicId: '' };
  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, 'ishas/events');
    coverImage = { url: result.secure_url, publicId: result.public_id };
  }

  const event = await Event.create({
    title,
    description,
    category,
    location,
    startDate,
    endDate,
    registrationRequired: registrationRequired ?? true,
    registrationDeadline: registrationDeadline || null,
    maxParticipants: maxParticipants || null,
    coverImage,
    createdBy: req.user._id,
  });

  return res.status(201).json(new ApiResponse(201, event, 'ইভেন্ট তৈরি করা হয়েছে'));
});

/**
 * @route GET /api/v1/events
 */
const getAllEvents = asyncHandler(async (req, res) => {
  const { category, upcoming } = req.query;
  const { page, limit, skip } = getPagination(req.query, 12);

  const filter = { isActive: true };
  if (category) filter.category = category;
  if (upcoming === 'true') filter.startDate = { $gte: new Date() };

  const [events, total] = await Promise.all([
    Event.find(filter)
      .populate('createdBy', 'fullName')
      .select('-registrations')
      .sort({ startDate: upcoming === 'true' ? 1 : -1 })
      .skip(skip)
      .limit(limit),
    Event.countDocuments(filter),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, { events, pagination: buildPaginationMeta(total, page, limit) }, 'ইভেন্টের তালিকা'));
});

/**
 * @route GET /api/v1/events/:id
 */
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('createdBy', 'fullName')
    .populate('registrations.user', 'fullName memberId profilePicture');
  if (!event || !event.isActive) throw ApiError.notFound('ইভেন্ট পাওয়া যায়নি');

  // Non-staff users should not see the full registration list of others in detail view
  const responseEvent = event.toObject();
  if (!STAFF_ROLES.includes(req.user.role)) {
    responseEvent.participantCount = event.registrations.length;
    responseEvent.myRegistration =
      event.registrations.find((r) => r.user._id.toString() === req.user._id.toString()) || null;
    delete responseEvent.registrations;
  }

  return res.status(200).json(new ApiResponse(200, responseEvent, 'ইভেন্টের বিস্তারিত'));
});

/**
 * @route PATCH /api/v1/events/:id
 * @access owner, super_admin, admin, committee_member
 */
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw ApiError.notFound('ইভেন্ট পাওয়া যায়নি');

  const fields = [
    'title',
    'description',
    'category',
    'location',
    'startDate',
    'endDate',
    'registrationRequired',
    'registrationDeadline',
    'maxParticipants',
    'isActive',
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) event[f] = req.body[f];
  });

  if (req.file) {
    if (event.coverImage?.publicId) await deleteFromCloudinary(event.coverImage.publicId);
    const result = await uploadBufferToCloudinary(req.file.buffer, 'ishas/events');
    event.coverImage = { url: result.secure_url, publicId: result.public_id };
  }

  await event.save();

  return res.status(200).json(new ApiResponse(200, event, 'ইভেন্ট আপডেট হয়েছে'));
});

/**
 * @route DELETE /api/v1/events/:id
 */
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw ApiError.notFound('ইভেন্ট পাওয়া যায়নি');

  if (event.coverImage?.publicId) await deleteFromCloudinary(event.coverImage.publicId);
  event.isActive = false;
  await event.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, null, 'ইভেন্ট মুছে ফেলা হয়েছে'));
});

/**
 * @route POST /api/v1/events/:id/register
 * @access any authenticated active member
 */
const registerForEvent = asyncHandler(async (req, res) => {
  const { isVolunteer } = req.body;
  const event = await Event.findById(req.params.id);
  if (!event || !event.isActive) throw ApiError.notFound('ইভেন্ট পাওয়া যায়নি');

  if (!event.registrationRequired) {
    throw ApiError.badRequest('এই ইভেন্টের জন্য রেজিস্ট্রেশনের প্রয়োজন নেই');
  }
  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    throw ApiError.badRequest('রেজিস্ট্রেশনের সময়সীমা শেষ হয়ে গেছে');
  }
  if (event.maxParticipants && event.registrations.length >= event.maxParticipants) {
    throw ApiError.badRequest('সর্বোচ্চ সংখ্যক অংশগ্রহণকারীর সীমা পূর্ণ হয়ে গেছে');
  }

  const alreadyRegistered = event.registrations.some((r) => r.user.toString() === req.user._id.toString());
  if (alreadyRegistered) throw ApiError.conflict('আপনি ইতিমধ্যে এই ইভেন্টের জন্য রেজিস্ট্রেশন করেছেন');

  const qrCode = crypto.randomBytes(16).toString('hex');

  event.registrations.push({ user: req.user._id, isVolunteer: !!isVolunteer, qrCode });
  await event.save();

  return res.status(201).json(new ApiResponse(201, { qrCode }, 'রেজিস্ট্রেশন সফল হয়েছে'));
});

/**
 * @route DELETE /api/v1/events/:id/register
 * @access self
 */
const unregisterFromEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw ApiError.notFound('ইভেন্ট পাওয়া যায়নি');

  const registration = event.registrations.find((r) => r.user.toString() === req.user._id.toString());
  if (!registration) throw ApiError.notFound('আপনি এই ইভেন্টের জন্য রেজিস্ট্রেশন করেননি');

  if (registration.attended) {
    throw ApiError.badRequest('উপস্থিতি রেকর্ড হয়ে যাওয়ার পর রেজিস্ট্রেশন বাতিল করা যাবে না');
  }

  registration.deleteOne();
  await event.save();

  return res.status(200).json(new ApiResponse(200, null, 'রেজিস্ট্রেশন বাতিল করা হয়েছে'));
});

/**
 * @route GET /api/v1/events/:id/ticket
 * @access self (returns a scannable QR code image for the logged-in user's registration)
 */
const getMyTicketQr = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw ApiError.notFound('ইভেন্ট পাওয়া যায়নি');

  const registration = event.registrations.find((r) => r.user.toString() === req.user._id.toString());
  if (!registration) throw ApiError.notFound('আপনি এই ইভেন্টের জন্য রেজিস্ট্রেশন করেননি');

  const qrBuffer = await QRCode.toBuffer(registration.qrCode, { width: 300, margin: 1 });

  res.setHeader('Content-Type', 'image/png');
  return res.status(200).send(qrBuffer);
});

/**
 * @route POST /api/v1/events/:id/attendance
 * @access owner, super_admin, admin, committee_member
 * body: { qrCode }
 */
const markAttendance = asyncHandler(async (req, res) => {
  const { qrCode } = req.body;
  if (!qrCode) throw ApiError.badRequest('QR কোড আবশ্যক');

  const event = await Event.findById(req.params.id).populate('registrations.user', 'fullName memberId');
  if (!event) throw ApiError.notFound('ইভেন্ট পাওয়া যায়নি');

  const registration = event.registrations.find((r) => r.qrCode === qrCode);
  if (!registration) throw ApiError.notFound('অবৈধ QR কোড, রেজিস্ট্রেশন খুঁজে পাওয়া যায়নি');

  if (registration.attended) {
    throw ApiError.conflict(`${registration.user.fullName} এর উপস্থিতি ইতিমধ্যে রেকর্ড করা হয়েছে`);
  }

  registration.attended = true;
  registration.attendedAt = new Date();
  await event.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { name: registration.user.fullName }, 'উপস্থিতি সফলভাবে রেকর্ড হয়েছে'));
});

/**
 * @route GET /api/v1/events/:id/attendance
 * @access owner, super_admin, admin, committee_member
 */
const getAttendanceList = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate(
    'registrations.user',
    'fullName memberId phone profilePicture'
  );
  if (!event) throw ApiError.notFound('ইভেন্ট পাওয়া যায়নি');

  const attended = event.registrations.filter((r) => r.attended);
  const notAttended = event.registrations.filter((r) => !r.attended);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalRegistered: event.registrations.length,
        totalAttended: attended.length,
        attended,
        notAttended,
      },
      'উপস্থিতির তালিকা'
    )
  );
});

/**
 * @route GET /api/v1/events/:id/certificate
 * @access self (must have attended)
 */
const downloadCertificate = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw ApiError.notFound('ইভেন্ট পাওয়া যায়নি');

  const registration = event.registrations.find((r) => r.user.toString() === req.user._id.toString());
  if (!registration || !registration.attended) {
    throw ApiError.forbidden('উপস্থিতি রেকর্ড না থাকলে সনদপত্র পাওয়া যাবে না');
  }

  if (new Date() < event.endDate) {
    throw ApiError.badRequest('ইভেন্ট শেষ হওয়ার আগে সনদপত্র ডাউনলোড করা যাবে না');
  }

  const settings = await OrgSettings.getSettings();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=certificate-${event._id}.pdf`);

  const doc = generateCertificatePDF({ user: req.user, event, orgSettings: settings });
  doc.pipe(res);
});

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getMyTicketQr,
  markAttendance,
  getAttendanceList,
  downloadCertificate,
};
