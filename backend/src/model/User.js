import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

export const userSchema = mongoose.Schema(
    {
        name: String,
        email: { type: String, required: true, unique: true },
        password: { type: String },
        provider: { type: String, default: "local"},
        providerId: { type: String, default: "null" },
        avatarUrl: String,
    }
);



userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

userSchema.methods.comparePassword = async function (password) {
	return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;