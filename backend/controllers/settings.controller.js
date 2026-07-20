const OrgSettings = require('../models/OrgSettings');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @route GET /api/v1/settings
 * @access any authenticated user (read-only for non-owners)
 */
const getSettings = asyncHandler(async (req, res) => {
  const settings = await OrgSettings.getSettings();
  return res.status(200).json(new ApiResponse(200, settings, 'সংগঠনের সেটিংস'));
});

/**
 * @route PATCH /api/v1/settings
 * @access owner only
 */
const updateSettings = asyncHandler(async (req, res) => {
  const { orgName, currency, monthlyChadaAmount } = req.body;

  const settings = await OrgSettings.getSettings();

  if (orgName !== undefined) settings.orgName = orgName;
  if (currency !== undefined) settings.currency = currency;
  if (monthlyChadaAmount !== undefined) settings.monthlyChadaAmount = monthlyChadaAmount;

  await settings.save();

  return res.status(200).json(new ApiResponse(200, settings, 'সেটিংস আপডেট করা হয়েছে'));
});

module.exports = { getSettings, updateSettings };
