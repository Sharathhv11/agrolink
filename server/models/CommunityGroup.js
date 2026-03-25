const mongoose = require('mongoose');

const communityGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 200,
      default: '',
    },
    icon: {
      type: String,
      default: '🌱',
    },
    color: {
      type: String,
      enum: ['amber', 'emerald', 'green', 'rose', 'sky', 'lime', 'violet', 'orange', 'teal', 'indigo', 'pink', 'cyan'],
      default: 'emerald',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    creatorName: {
      type: String,
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    memberCount: {
      type: Number,
      default: 1,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

communityGroupSchema.index({ members: 1 });
communityGroupSchema.index({ memberCount: -1 });

const CommunityGroup = mongoose.model('CommunityGroup', communityGroupSchema);

module.exports = CommunityGroup;
