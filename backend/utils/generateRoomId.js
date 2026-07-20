const crypto = require('crypto');
const Meeting = require('../models/Meeting');

const randomSegment = (length) => crypto.randomBytes(length).toString('hex').slice(0, length);

/**
 * Generates a unique, human-typeable room ID like "abc-defgh-ijk".
 */
const generateRoomId = async () => {
  let roomId;
  let exists = true;

  // eslint-disable-next-line no-await-in-loop
  while (exists) {
    roomId = `${randomSegment(3)}-${randomSegment(4)}-${randomSegment(3)}`;
    // eslint-disable-next-line no-await-in-loop
    exists = await Meeting.exists({ roomId });
  }

  return roomId;
};

module.exports = generateRoomId;
