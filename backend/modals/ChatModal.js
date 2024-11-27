const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'LandOwner' }, // The land owner's ID
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The sender's user ID
    sender: { type: String, enum: ['user', 'owner'], required: true }, // Whether it's from the user or owner
    text: { type: String, required: true }, // The message text
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
