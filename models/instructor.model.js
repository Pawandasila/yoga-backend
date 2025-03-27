import mongoose from "mongoose";
const Schema = mongoose.Schema;

const instructorSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    bio: {
        type: String,
        trim: true
    },
    YOE: {
        type: Number,
        trim: true
    },
    main_photo:{
        type: String,
    },
    cover_photo:{
        type: String,
    },
    certifications: [{
        type: String,
        trim: true
    }],
    qualifications: [{
        type: String,
        trim: true
    }],
    location: [{
        type: String,
        trim: true
    }],
    specialties: [{
        type: String,
        trim: true
    }],
    tips: [{
        type: String,
    }],
    rating:{
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const assistantInstructorSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    bio: {
        type: String,
        trim: true
    },
    certifications: [{
        type: String,
        trim: true
    }],
    YOE: {
        type: Number,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

instructorSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

assistantInstructorSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export const Instructor = mongoose.model('Instructor', instructorSchema);
export const Assistant = mongoose.model('Assistant', assistantInstructorSchema);
