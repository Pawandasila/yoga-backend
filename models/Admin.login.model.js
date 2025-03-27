import bcrypt from 'bcrypt'; 
import mongoose from 'mongoose';


const adminUserSchema = new mongoose.Schema({
    Fname: {
        type: String,
        required: true,
        trim: true,
    },
    Lname: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true 
    },
    password: {
        type: String,
        required: true,
        minlength: [6, "Password must be at least 6 characters"]
    },
    phone_Number: {
        type: String,
        required: true,
    },
    userPhoto: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        default: 'admin'
    },
    lastLogin: Date,
    joinedDate: Date,
}, {
    timestamps: true 
});

adminUserSchema.pre('save', async function (next) {
    
    if (!this.isModified('password')) return next();

    try {
    
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});


adminUserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model("Admin", adminUserSchema);
export default Admin;



