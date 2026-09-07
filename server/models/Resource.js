import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: 'text' },
    description: String,
    categoryId: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    orgType: { type: String, default: 'NGO', index: true },
    state: { type: String, required: true, index: true },
    district: { type: String, index: true },
    city: { type: String, required: true, index: true },
    addr: { type: String, required: true },
    pincode: { type: String, index: true },
    phone: String,
    email: String,
    website: String,
    hours: String,
    eligibility: String,
    availableServices: [String],
    emergency: { type: Boolean, default: false },
    lat: Number,
    lng: Number,
    rating: { type: Number, default: 4.0 },
    reviews: { type: Number, default: 50 },
    verificationStatus: { type: String, default: 'Verified', enum: ['Verified', 'Unverified', 'Pending'], index: true },
    active: { type: Boolean, default: true },
    lastUpdatedDate: String,
    icon: String
  },
  { timestamps: true }
);

export const Resource = mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);
