
import mongoose from 'mongoose';
import { ClassAttendance } from '../models/Yoga.model.js';

export const registerForClass = async (req, res) => {
    try {
        const { userId, classId } = req.body;

        const existingRegistration = await ClassAttendance.findOne({
            yogaClass: classId,
            user: userId
        });

        if (existingRegistration) {
            return res.status(400).json({
                success: false,
                message: 'User already registered for this class'
            });
        }

        const attendance = new ClassAttendance({
            yogaClass: classId,
            user: userId,
            status: 'registered'
        });

        const savedAttendance = await attendance.save();
        res.status(201).json({ success: true, data: savedAttendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markAttendance = async (req, res) => {
    try {
        const { classId, userId } = req.body;
       
        const attendance = await ClassAttendance.findOneAndUpdate(
            { yogaClass: classId, user: userId },
            { status: 'attended', checkinTime: new Date() },
            { new: true, upsert: true }
        );

        if (!attendance.totalSessions) {
            attendance.totalSessions = 10;
        }

        attendance.completedSessions += 1;
        attendance.progress = (attendance.completedSessions / attendance.totalSessions) * 100;

        if (attendance.progress >= 50 && !attendance.achievements.includes('Halfway There')) {
            attendance.achievements.push('Halfway There');
        }

        await attendance.save();

        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getClassAttendanceStats = async (req, res) => {
    try {
        const { classId, userId } = req.body;

        const attendance = await ClassAttendance.findOne({
            user: userId,
            yogaClass: classId
        })
            .populate('yogaClass', 'title') 
            .populate('user', 'email');

        if (!attendance) {
            return res.status(404).json({ success: false, message: 'No attendance found for this user and class.' });
        }

        // Ensure the required fields are being returned
        const attendanceStats = [
            { _id: 'attended', count: attendance.completedSessions || 0 },
            { _id: 'totalSessions', count: attendance.totalSessions || 0 },
            { _id: 'attendancePercentage', count: attendance.attendancePercentage || 0 },
            { _id: 'progress', count: attendance.progress || 0 },
        ];

        const yogaClassTitle = attendance.yogaClass?.title || 'Yoga Class Title Not Found';
        const username = attendance.user?.email || 'Username Not Found';

        res.status(200).json({
            success: true,
            data: {
                attendanceStats,
                yogaClassTitle,
                username,
            },
        });


    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserEnrolledClasses = async (req, res) => {
    try {
        const { userId } = req.params;

        const enrolledClasses = await ClassAttendance.find({ user: userId })
            .populate({
                path: 'yogaClass',
                populate: {
                    path: 'instructor',
                    model: 'Instructor'
                }
            });

        if (!enrolledClasses.length) {
            return res.status(200).json({ success: true, message: 'No classes found for this user.' });
        }

        const classesWithDetails = enrolledClasses.map(record => {
            const yogaClass = record.yogaClass;

            if (!yogaClass) {
                console.error(`Yoga class not found for record: ${record._id}`);
                return null;
            }

            return {
                _id: record._id,
                yogaClass: {
                    _id: yogaClass._id,
                    title: yogaClass.className,
                    style: yogaClass.style,
                    description: yogaClass.description,
                    duration: yogaClass.duration,
                    difficulty: yogaClass.difficulty,
                    maxParticipants: yogaClass.maxParticipants,
                    currentParticipants: yogaClass.currentParticipants,
                    startTime: yogaClass.schedule.startTime,
                    endTime: yogaClass.schedule.endTime,
                    timeSlot: yogaClass.timeSlot,
                    classType: yogaClass.classType,
                    location: yogaClass.location,
                    price: yogaClass.price,
                    status: yogaClass.status,
                    instructor: {
                        _id: yogaClass.instructor._id,
                        firstName: yogaClass.instructor.firstName,
                        lastName: yogaClass.instructor.lastName,
                        email: yogaClass.instructor.email,
                        phone: yogaClass.instructor.phone,
                        bio: yogaClass.instructor.bio,
                        certifications: yogaClass.instructor.certifications
                    }
                },
                user: record.user,
                attendancePercentage: record.attendancePercentage,
                status: record.status,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt
            };
        }).filter(classDetails => classDetails !== null);

        res.status(200).json({
            success: true,
            data: classesWithDetails
        });
    } catch (error) {
        console.error('Error in getUserEnrolledClasses:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
