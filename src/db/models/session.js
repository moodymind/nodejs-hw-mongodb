import { model, Schema } from 'mongoose';

const SessionSchema = new Schema({
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  accessTokenValidUntil: {
    type: Date,
    required: true,
  },
  refreshTokenValidUntil: {
    type: Date,
    required: true,
  },
  userId: { type: Schema.Types.ObjectId, ref: 'users' },
});

export const SessionCollection = model('sessions', SessionSchema);
