const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AttendanceEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: 0 },
  },
  { _id: true }
);

const MeetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'মিটিং শিরোনাম আবশ্যক'], trim: true, maxlength: 200 },
    description: { type: String, default: '' },

    roomId: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, default: null },

    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coHosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    scheduledStart: { type: Date, required: [true, 'শুরুর সময় আবশ্যক'] },
    scheduledEnd: { type: Date, required: [true, 'শেষের সময় আবশ্যক'] },
    actualStart: { type: Date, default: null },
    actualEnd: { type: Date, default: null },

    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended', 'cancelled'],
      default: 'scheduled',
    },

    settings: {
      waitingRoomEnabled: { type: Boolean, default: true },
      allowChat: { type: Boolean, default: true },
      allowScreenShare: { type: Boolean, default: true },
      muteOnEntry: { type: Boolean, default: true },
    },

    attendance: { type: [AttendanceEntrySchema], default: [] },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

MeetingSchema.index({ scheduledStart: 1 });
MeetingSchema.index({ status: 1 });

MeetingSchema.pre('save', async function hashMeetingPassword(next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  // passwordHash field is assigned the plain password by the controller;
  // we hash it here similar to how User hashes its password.
  if (this.passwordHash.length !== 60 || !this.passwordHash.startsWith('$2')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  }
  next();
});

MeetingSchema.methods.comparePassword = function (candidate) {
  if (!this.passwordHash) return true; // no password set => open room
  return bcrypt.compare(candidate || '', this.passwordHash);
};

module.exports = mongoose.model('Meeting', MeetingSchema);
