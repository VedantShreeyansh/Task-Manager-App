import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // still required
      trim: true,
    },
    password: { type: String, required: true },
  },
  {
    collation: { locale: "en", strength: 2 }, // case-insensitive collation
  }
);

// Ensure unique index uses collation
UserSchema.index({ email: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

const User = mongoose.model("User", UserSchema);
export default User;

