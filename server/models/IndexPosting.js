import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  keyword: { type: String, required: true, unique: true, lowercase: true, index: true },
  resourceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  updatedAt: { type: Date, default: Date.now }
});

schema.index({ keyword: 1 }, { unique: true });
export const IndexPosting = mongoose.model('IndexPosting', schema);
