import mongoose, { Schema } from 'mongoose';

export const VerificationSessionSchema = new Schema({
  guildId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: true },
  createdAt: { type: Date, default: () => new Date() },
});
VerificationSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL if Mongo supports it

export const VerificationSession =
  mongoose.models.VerificationSession ||
  mongoose.model('VerificationSession', VerificationSessionSchema);
