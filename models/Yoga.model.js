import mongoose from 'mongoose';

// Yoga Class Schema
const yogaClassSchema = new mongoose.Schema({
    className: {
        type: String,
        required: true,
        trim: true
    },
    category :{
        type: String,
        required: true,
    },
    difficulty :{
        type: String,
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instructor',
        required: true
    }, image: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    assistant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assistant',
    },
    description: String,
    schedule: {
        startDate: Date,
        endDate: Date,
        daysOfWeek: [Number],
        startTime: String,
        endTime: String,
        timeZone: String
    },
    totalClasses: { 
        type: Number,
        required: true,
        min: 1
    },
    capacity: {
        type: Number,
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    status: {
        type: String,
        enum: ['Upcoming', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Upcoming'
    },
    equipmentNeeded: [String],
    videos: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        classNumber: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator: function (value) {
                    return value <= this.parent().parent().totalClasses;
                },
                message: "Class number cannot exceed total classes"
            }
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    remainingClasses: {
        type: Number,
        default: 0,
        min: 0,
        validate: {
            validator: function () {
                return this.remainingClasses <= this.totalClasses;
            },
            message: "Remaining classes cannot exceed total classes."
        }
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    renewal: {
        type: Boolean,
        default: false
    },
    feedback :{
        type: String,
        default: ''
    },
    type :{
        type: String,
        default: ''
    }
}, { timestamps: true });

// Class Attendance Schema
const classAttendanceSchema = new mongoose.Schema(
    {
        yogaClass: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'YogaClass',
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        attendancePercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        checkinTime: {
            type: Date
        },
        checkoutTime: {
            type: Date
        },
        progress: {
            type: Number,
            default: 0
        },
        achievements: {
            type: [String],
            default: []
        },
        enrollmentStatus: {
            type: String,
            enum: ['Registered', 'Enrolled', 'Dropped'],
            default: 'Registered'
        },
        totalSessions: {
            type: Number,
            default: 10
        },
        completedSessions: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);


// Subscription Schema
const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    duration: {
        type: String,
        required: true
    },
    features: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Room Schema
const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    facilities: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Export Models
const YogaClass = mongoose.model('YogaClass', yogaClassSchema);
const ClassAttendance = mongoose.model('ClassAttendance', classAttendanceSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);
const Room = mongoose.model('Room', roomSchema);

export {
    YogaClass,
    ClassAttendance,
    Subscription,
    Room
};