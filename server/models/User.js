const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
    },
    phone: {
      type: String,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    location: {
      village: String,
      taluk: String,
      district: String,
      state: String,
      addressLine: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    locationPoint: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [77.5946, 12.9716],
      },
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'available',
      index: true,
    },
    categories: [
      {
        type: String,
        enum: [
          // ── Core Farm Workers ──
          'farmer',
          'laborer',
          'machine_owner',
          'machine_operator',
          'pesticide_sprayer',
          'drone_operator',
          'irrigation_contractor',

          // ── Transport & Storage ──
          'transport_provider',
          'cold_storage_provider',
          'warehouse_owner',
          'packaging_supplier',

          // ── Trade & Commerce ──
          'crop_buyer',
          'mandi_agent',
          'wholesaler',
          'exporter',
          'organic_certifier',

          // ── Inputs & Supplies ──
          'fertilizer_supplier',
          'seed_supplier',
          'pesticide_supplier',
          'equipment_rental',
          'tool_supplier',

          // ── Advisory & Knowledge ──
          'agriculture_advisor',
          'soil_testing_agent',
          'weather_consultant',
          'govt_scheme_agent',
          'ngo_worker',

          // ── Livestock & Allied ──
          'veterinarian',
          'dairy_collector',
          'poultry_supplier',
          'fishery_worker',

          // ── Finance & Insurance ──
          'microfinance_agent',
          'crop_insurance_agent',
          'bank_representative',

          // ── Labour Management ──
          'labor_contractor',
          'labor_contractor_agent',

          // ── Technology & Services ──
          'soil_sensor_technician',
          'agri_drone_service',
          'precision_farming_consultant',
        ],
      },
    ],

    language: {
      type: String,
      enum: ['en', 'kn'],
      default: 'en',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    trustScore: {
      type: Number,
      default: 0,
    },
    totalJobsCompleted: {
      type: Number,
      default: 0,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    googleCalendarToken: {
      accessToken: String,
      refreshToken: String,
      expiryDate: Number,
    },
  },
  {
    timestamps: true, // This automatically handles `createdAt` and `updatedAt`
  }
);

userSchema.index({ locationPoint: '2dsphere' });
userSchema.index({ categories: 1, availabilityStatus: 1 });

userSchema.pre('save', function syncLocationPoint() {
  const lat = this?.location?.coordinates?.lat;
  const lng = this?.location?.coordinates?.lng;

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    this.locationPoint = {
      type: 'Point',
      coordinates: [lng, lat],
    };
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
 