import { model, Schema } from 'mongoose';

const UsersSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

UsersSchema.methods.toJSON = function () {
  const object = this.toObject();
  delete object.password;
  return object;
};

export const UsersCollection = model('user', UsersSchema);
