const mongoose = require('mongoose');

const communityMessageSchema = new mongoose.Schema(
  {
    community: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderAvatar: {
      type: String,
    },
    senderCategory: {
      type: String,
    },
    type: {
      type: String,
      enum: ['text', 'image'],
      default: 'text',
    },
    text: {
      type: String,
      maxlength: 2000,
    },
    imageUrl: {
      type: String,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

communityMessageSchema.index({ community: 1, createdAt: -1 });

const CommunityMessage = mongoose.model('CommunityMessage', communityMessageSchema);

module.exports = CommunityMessage;
