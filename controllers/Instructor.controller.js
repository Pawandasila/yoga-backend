import { Instructor, Assistant } from '../models/instructor.model.js';
import cloudinary from '../config/cloudinary.js';


export const getAllInstructors = async (req, res) => {
    try {
        const instructors = await Instructor.find();
        res.status(200).json(instructors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInstructorData = async (req, res) => {
    try {
        const instructorId = req.params.id;

        const instructor = await Instructor.findById(instructorId);

        if (!instructor) {
            return res.status(404).json({ message: "Instructor not found" });
        }

        const currentCoursesCount = await YogaClass.countDocuments({ instructor: instructorId });

        res.status(200).json({
            ...instructor.toObject(),
            currentCoursesCount,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getInstructorById = async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id);
        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.status(200).json(instructor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const uploadToCloudinary = async (file, folder) => {
    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: `instructors/${folder}`,
            use_filename: true,
            unique_filename: true
        });
        return result.secure_url;
    } catch (error) {
        throw new Error(`Error uploading to Cloudinary: ${error.message}`);
    }
};

export const createInstructor = async (req, res) => {
    try {
        const instructorData = { ...req.body };

        if (req.files && req.files.main_photo) {
            const mainPhoto = req.files.main_photo[0];
            const mainPhotoResult = await cloudinary.uploader.upload(mainPhoto.path, {
                folder: 'instructors/main_photos',
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
                transformation: [
                    { width: 1000, height: 750, crop: 'fill' },
                    { quality: 'auto' }
                ],
                public_id: `instructor-main-${Date.now()}`
            });
            instructorData.main_photo = mainPhotoResult.secure_url;
        }

        if (req.files && req.files.cover_photo) {
            const coverPhoto = req.files.cover_photo[0];
            const coverPhotoResult = await cloudinary.uploader.upload(coverPhoto.path, {
                folder: 'instructors/cover_photos',
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
                transformation: [
                    { width: 1000, height: 750, crop: 'fill' },
                    { quality: 'auto' }
                ],
                public_id: `instructor-cover-${Date.now()}`
            });
            instructorData.cover_photo = coverPhotoResult.secure_url;
        }

        const instructor = new Instructor(instructorData);
        const newInstructor = await instructor.save();

        res.status(201).json({
            success: true,
            data: newInstructor
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const deleteFromCloudinary = async (imageUrl) => {
    try {
        if (!imageUrl) return;

        const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(`instructors/${publicId}`);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
    }
};

export const updateInstructor = async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id);
        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }

        const updateData = { ...req.body };

        if (req.files && req.files.main_photo) {
            await deleteFromCloudinary(instructor.main_photo);

            const mainPhotoUrl = await uploadToCloudinary(
                req.files.main_photo[0],
                'main_photos'
            );
            updateData.main_photo = mainPhotoUrl;
        }

        if (req.files && req.files.cover_photo) {
            await deleteFromCloudinary(instructor.cover_photo);

            const coverPhotoUrl = await uploadToCloudinary(
                req.files.cover_photo[0],
                'cover_photos'
            );
            updateData.cover_photo = coverPhotoUrl;
        }

        updateData.updatedAt = Date.now();

        const updatedInstructor = await Instructor.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updatedInstructor
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


export const deleteInstructor = async (req, res) => {
    try {
      const instructorId = req.params.id;
      
      const deletedInstructor = await Instructor.findByIdAndDelete(instructorId);
  
      if (!deletedInstructor) {
        return res.status(404).json({ message: 'Instructor not found' });
      }
  
      res.status(200).json({ message: 'Instructor successfully deleted' });
    } catch (error) {
      console.error('Error deleting instructor:', error);  // Log the error for debugging
      res.status(500).json({ message: 'Server error, please try again later' });
    }
  };
  


export const createAssistant = async (req, res) => {
    const assistant = new Assistant(req.body);


    try {
        const newAssistant = await assistant.save();
        res.status(201).json(newAssistant);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};