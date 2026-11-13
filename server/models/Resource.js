import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 5000 },
  category: { type: String, required: true, enum: ['notice', 'placement', 'event', 'faculty', 'academic'] },
  resourceType: { type: String, trim: true },
  department: { type: String, trim: true },
  semester: { type: Number, min: 1, max: 12 },
  academicYear: { type: String, trim: true },
  tags: { type: [String], default: [] },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  publishedAt: { type: Date, default: Date.now },
  expiresAt: Date,
  status: { type: String, enum: ['draft', 'published', 'expired'], default: 'published' },
  version: { type: Number, default: 1 },
  indexingStatus: { type: String, enum: ['pending', 'indexed', 'failed'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

resourceSchema.index({ category: 1, department: 1, publishedAt: -1 });
resourceSchema.index({ status: 1, expiresAt: 1 });

export const Resource = mongoose.model('Resource', resourceSchema);
