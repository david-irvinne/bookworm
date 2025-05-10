import mongoose, { mongo } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type:String,
    required: true,
    unique: true
  },
  password: {
    type:String,
    required: true,
    minlength: 6
  },
  profileImage: {
    type:String,
    default: ""
  }
}, 
  {timestamps: true} // opsi skema
);

// prehook to hash password
userSchema.pre("save", async function (next) {
  // jangan rehash password kalau tidak ada perubahan password (user udah pernah dibikin)
  if(!this.isModified("password")) return next();

  // di sini kasusnya kalau mau bikin user baru
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// compare password
userSchema.methods.comparePassword = async function (userPassword){
  return await bcrypt.compare(userPassword, this.password);
}

const User = mongoose.model("User", userSchema);
export default User;