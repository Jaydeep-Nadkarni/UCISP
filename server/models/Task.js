import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  taskType: { type: String, enum: ['CREATE_INDEX', 'UPDATE_INDEX', 'DELETE_INDEX', 'REBUILD_INDEX'], required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  resourceVersion: { type: Number, required: true },
  priority: { type: Number, default: 10 },
  arrivalTime: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' },
  retryCount: { type: Number, default: 0 },
  workerId: String,
  leaseExpiresAt: Date,
  errorMessage: String,
  startedAt: Date,
  completedAt: Date
}, { timestamps: true });

schema.index({ status: 1, priority: -1, arrivalTime: 1 });
export const Task = mongoose.model('Task', schema);
