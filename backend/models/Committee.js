const mongoose = require('mongoose');

const POSITIONS = [
  'president',
  'vice_president',
  'general_secretary',
  'joint_secretary',
  'treasurer',
  'organizing_secretary',
  'office_secretary',
  'publicity_secretary',
  'executive_member',
];

const CommitteeMemberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    position: { type: String, enum: POSITIONS, required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const CommitteeSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'কমিটির নাম আবশ্যক'], trim: true },
    termYear: { type: String, required: [true, 'মেয়াদকাল আবশ্যক'], trim: true }, // e.g. "2025-2027"
    description: { type: String, default: '' },
    members: { type: [CommitteeMemberSchema], default: [] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

CommitteeSchema.index({ termYear: 1, isActive: 1 });

CommitteeSchema.statics.POSITIONS = POSITIONS;

module.exports = mongoose.model('Committee', CommitteeSchema);
