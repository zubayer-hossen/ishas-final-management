const mongoose = require('mongoose');

const EVENT_CATEGORIES = ['seminar', 'workshop', 'fundraiser', 'social', 'religious', 'sports', 'other'];

const RegistrationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    registeredAt: { type: Date, default: Date.now },
    isVolunteer: { type: Boolean, default: false },
    attended: { type: Boolean, default: false },
    attendedAt: { type: Date, default: null },
    qrCode: { type: String, required: true, unique: true, sparse: true }, // unique code for this registration's QR
  },
  { _id: true }
);

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'শিরোনাম আবশ্যক'], trim: true, maxlength: 200 },
    description: { type: String, required: [true, 'বিবরণ আবশ্যক'] },
    category: { type: String, enum: EVENT_CATEGORIES, default: 'other' },

    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },

    location: { type: String, default: '' },
    startDate: { type: Date, required: [true, 'শুরুর তারিখ আবশ্যক'] },
    endDate: { type: Date, required: [true, 'শেষের তারিখ আবশ্যক'] },

    registrationRequired: { type: Boolean, default: true },
    registrationDeadline: { type: Date, default: null },
    maxParticipants: { type: Number, default: null },

    registrations: { type: [RegistrationSchema], default: [] },

    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

EventSchema.index({ startDate: 1 });
EventSchema.index({ category: 1 });

EventSchema.virtual('participantCount').get(function () {
  return this.registrations.length;
});

EventSchema.set('toJSON', { virtuals: true });
EventSchema.set('toObject', { virtuals: true });

EventSchema.statics.CATEGORIES = EVENT_CATEGORIES;

module.exports = mongoose.model('Event', EventSchema);
