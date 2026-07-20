const mongoose = require('mongoose');

/**
 * Singleton document holding organization-wide configurable settings.
 * Only one document should ever exist; use OrgSettings.getSettings() to fetch/create it.
 */
const OrgSettingsSchema = new mongoose.Schema(
  {
    orgName: { type: String, default: 'ISHAS Organization' },
    currency: { type: String, default: 'BDT' },
    monthlyChadaAmount: { type: Number, default: 100 },
    treasurerSignatureUrl: { type: String, default: '' },
    ownerSignatureUrl: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

OrgSettingsSchema.statics.getSettings = async function getSettings() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('OrgSettings', OrgSettingsSchema);
