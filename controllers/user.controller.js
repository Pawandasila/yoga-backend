import User from "../models/user.Model.js";
import bcrypt from "bcrypt";


export const register = async (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            dateOfBirth,
            gender,

            height,
            weight,
            medicalConditions,
            injuries,

            experienceLevel,
            preferredStyle,
            flexibility,

            fitnessGoals,
            focusAreas,
            preferredTime,
            sessionDuration,

            occupation,
            stressLevel,
            sleepQuality,
            dietaryPreferences,
            activityLevel
        } = req.body;


        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }


        const user = new User({

            firstName,
            lastName,
            email,
            password,
            phone,
            dateOfBirth,
            gender,

            height,
            weight,
            medicalConditions,
            injuries,

            experienceLevel,
            preferredStyle,
            flexibility,

            fitnessGoals,
            focusAreas,
            preferredTime,
            sessionDuration,

            occupation,
            stressLevel,
            sleepQuality,
            dietaryPreferences,
            activityLevel
        });

        await user.save();

        req.session.userId = user._id;


        res.status(201).json({
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            },
            message: "User registered successfully"
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: error.message || "Something went wrong while registering user"
        });
    }
};

export const logout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error logging out' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'User logged out successfully' });
    });
};

export const getProfile = async (req, res) => {
    try {

        const userId = req.params.id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching profile",
            error: error.message
        });
    }
};

export const getAllUser = async (req,res) => {
    try {
        const user = await User.find().select('-password')
        
        if(user.length === 0){
            return res.status(404).json({
                success : false,
                message : "user not found"
            })
        }
        
        res.json({
            success: true,
            user
        });
        
    } catch (error) {
        console.log("Profile fetch error : " , error);
        res.status(500).json({
            success : false,
            message:"Error fetching profile",
            error : error.message
        });
    }
};


export const updateProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;

        const protectedFields = ['_id', 'email', 'password', 'role', 'joinedDate'];
        protectedFields.forEach(field => {
            delete updateData[field];
        });

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: updatedUser,
            message: "Profile updated successfully"
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: "Error updating profile",
            error: error.message
        });
    }
};

// export const changePassword = async (req, res) => {
//     try {
//         const { currentPassword, newPassword, userId } = req.body;

//         if (!userId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "User ID is required"
//             });
//         }

//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             });
//         }

//         const isMatch = await user.comparePassword(currentPassword);
//         if (!isMatch) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Current password is incorrect"
//             });
//         }

//         if (newPassword.length < 6) {
//             return res.status(400).json({
//                 success: false,
//                 message: "New password must be at least 6 characters long"
//             });
//         }

//         await User.findByIdAndUpdate(userId, { password: newPassword }, { 
//             runValidators: false 
//         });   

//         res.json({
//             success: true,
//             message: "Password changed successfully"
//         });
//     } catch (error) {
//         console.error('Password change error:', error);
//         res.status(500).json({
//             success: false,
//             message: "Error changing password",
//             error: error.message
//         });
//     }
// };

export const changePassword = async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Direct password comparison
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Current password incorrect" });
        }

        // Update password directly
        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserAnalytics = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const analytics = await User.aggregate([
            {
                $facet: {
                    totalUsers: [{ $count: 'count' }],
                    activeUsers: [
                        {
                            $match: {
                                lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                            }
                        },
                        { $count: 'count' }
                    ],
                    newUsersToday: [
                        {
                            $match: {
                                createdAt: {
                                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                                    $lt: new Date(new Date().setHours(23, 59, 59, 999))
                                }
                            }
                        },
                        { $count: 'count' }
                    ],
                    loginsToday: [
                        {
                            $match: {
                                lastLogin: {
                                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                                    $lt: new Date(new Date().setHours(23, 59, 59, 999))
                                }
                            }
                        },
                        { $count: 'count' }
                    ],
                    registrationTrends: [
                        {
                            $match: { createdAt: { $gte: thirtyDaysAgo } }
                        },
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                                registrations: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    activityDistribution: [
                        {
                            $group: {
                                _id: '$experienceLevel',
                                value: { $sum: 1 }
                            }
                        }
                    ],
                    loginTimeDistribution: [
                        {
                            $addFields: {
                                loginHour: {
                                    $hour: {
                                        $ifNull: ['$lastLogin', '$createdAt']
                                    }
                                }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    $switch: {
                                        branches: [
                                            { case: { $lt: ['$loginHour', 6] }, then: 'Early Morning' },
                                            { case: { $lt: ['$loginHour', 12] }, then: 'Morning' },
                                            { case: { $lt: ['$loginHour', 17] }, then: 'Afternoon' },
                                            { case: { $lt: ['$loginHour', 21] }, then: 'Evening' }
                                        ],
                                        default: 'Night'
                                    }
                                },
                                logins: { $sum: 1 }
                            }
                        }
                    ],
                    subscribers: [
                        {
                            $match: {
                                isSubscriber: true,
                                subscriptionStatus: 'active'
                            }
                        },
                        { $count: 'count' }
                    ]
                }
            }
        ]);

        const analyticsData = analytics[0];

        res.json({
            totalUsers: analyticsData.totalUsers[0]?.count || 0,
            activeUsers: analyticsData.activeUsers[0]?.count || 0,
            newUsersToday: analyticsData.newUsersToday[0]?.count || 0,
            loginsToday: analyticsData.loginsToday[0]?.count || 0,
            subscribers: analyticsData.subscribers[0]?.count || 0,
            registrationTrends: analyticsData.registrationTrends.map(trend => ({
                name: trend._id,
                registrations: trend.registrations
            })),
            activityDistribution: analyticsData.activityDistribution.map(activity => ({
                name: activity._id,
                value: activity.value
            })),
            loginTimeDistribution: analyticsData.loginTimeDistribution.map(login => ({
                name: login._id,
                logins: login.logins
            }))
        });
    } catch (error) {
        console.error('Analytics retrieval error:', error);
        res.status(500).json({
            message: 'Error retrieving user analytics',
            error: error.message
        });
    }
};

export const trackUserSession = async (req, res) => {
    try {
        const { userId, loginTime, logoutTime, ipAddress } = req.body;

        const duration = Math.round((new Date(logoutTime) - new Date(loginTime)) / 60000); 

        await User.findByIdAndUpdate(userId, {
            $push: {
                sessionDurations: {
                    loginTime: new Date(loginTime),
                    logoutTime: new Date(logoutTime),
                    duration
                },
                loginHistory: { timestamp: new Date(loginTime), ipAddress }
            },
            $set: { lastLogin: new Date(logoutTime) },
            $inc: { loginCount: 1 }
        });

        res.status(200).json({ message: 'Session tracked successfully', sessionDuration: `${duration} mins` });
    } catch (error) {
        console.error('Error tracking session:', error);
        res.status(500).json({ message: 'Error tracking session', error: error.message });
    }
};



export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const existingUser = await User.findOne({ email }).select('+password');
        if (!existingUser || !(await existingUser.comparePassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const loginEntry = { timestamp: new Date(), ipAddress: req.ip || req.connection.remoteAddress };
        const updatedUser = await User.findByIdAndUpdate(
            existingUser._id,
            {
                $set: { lastLogin: new Date(), lastActivity: new Date(), accountStatus: 'active' },
                $push: { loginHistory: { $each: [loginEntry], $slice: -10 } },
                $inc: { loginCount: 1 }
            },
            { new: true, runValidators: true }
        );

        req.session.userId = existingUser._id;
        req.session.userRole = existingUser.role;

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: existingUser._id,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                email: existingUser.email,
                role: existingUser.role,
                accountStatus: updatedUser.accountStatus
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


export const trackSessionDuration = async (req, res) => {
    try {
        const { userId, loginTime, logoutTime } = req.body;

        const duration = Math.round((new Date(logoutTime) - new Date(loginTime)) / 60000); 

        await User.findByIdAndUpdate(userId, {
            $push: {
                sessionDurations: {
                    loginTime: new Date(loginTime),
                    logoutTime: new Date(logoutTime),
                    duration: duration
                }
            }
        });

        res.status(200).json({ message: "Session tracked successfully" });
    } catch (error) {
        console.error('Session tracking error:', error);
        res.status(500).json({
            message: 'Error tracking session',
            error: error.message
        });
    }
};
