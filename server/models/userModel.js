import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    stream: { type: String },
    year: { type: String },
    bio: { type: String },
    profilePic: { type: String },

    // ✅ WhatsApp Number (clean, no spaces)
    whatsappNumber: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (v) {
          // Valid: +919876543210 (no spaces)
          return /^(\+91)?\d{10}$/.test(v) || v === "";
        },
        message: "Invalid WhatsApp number format (+919876543210)",
      },
    },

    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🔒 Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🔑 Hash before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);
export default User;