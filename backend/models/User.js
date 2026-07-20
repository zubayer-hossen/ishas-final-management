const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = [
  'owner',
  'super_admin',
  'admin',
  'treasurer',
  'committee_member',
  'general_member',
  'guest',
];

const MEMBERSHIP_STATUS = ['pending', 'active', 'suspended', 'rejected', 'inactive'];

const SessionSchema = new mongoose.Schema(
  {
    refreshTokenHash: { type: String, required: true },
    userAgent: { type: String, default: '' },
    ip: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { _id: true }
);

const UserSchema = new mongoose.Schema(
  {
    // -------- Identity --------
    fullName: { type: String, required: [true, 'নাম আবশ্যক'], trim: true, maxlength: 100 },
    email: {
      type: String,
      required: [true, 'ইমেইল আবশ্যক'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'সঠিক ইমেইল দিন'],
    },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },

    // -------- Membership --------
    memberId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ROLES, default: 'general_member' },
    membershipStatus: { type: String, enum: MEMBERSHIP_STATUS, default: 'pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },

    // -------- Profile --------
    profilePicture: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    bloodGroup: { type: String, default: '' },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
    address: {
      present: { type: String, default: '' },
      permanent: { type: String, default: '' },
    },
    occupation: { type: String, default: '' },
    education: { type: String, default: '' },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relation: { type: String, default: '' },
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      website: { type: String, default: '' },
    },

    // -------- Auth / Security --------
    isEmailVerified: { type: Boolean, default: false },
    emailOtpHash: { type: String, select: false },
    emailOtpExpires: { type: Date, select: false },

    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    tokenVersion: { type: Number, default: 0 }, // bump to invalidate all refresh tokens
    sessions: { type: [SessionSchema], default: [] },

    loginHistory: [
      {
        ip: String,
        userAgent: String,
        loggedInAt: { type: Date, default: Date.now },
        success: Boolean,
      },
    ],

    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },

    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// -------- Indexes --------
UserSchema.index({ email: 1 });
UserSchema.index({ memberId: 1 });
UserSchema.index({ role: 1, membershipStatus: 1 });

// -------- Virtuals --------
UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// -------- Hooks --------
UserSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// -------- Instance Methods --------
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailOtpHash;
  delete obj.emailOtpExpires;
  delete obj.passwordResetTokenHash;
  delete obj.passwordResetExpires;
  delete obj.sessions;
  delete obj.loginHistory;
  return obj;
};

UserSchema.statics.ROLES = ROLES;
UserSchema.statics.MEMBERSHIP_STATUS = MEMBERSHIP_STATUS;

module.exports = mongoose.model('User', UserSchema);
