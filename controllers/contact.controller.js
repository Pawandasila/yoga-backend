import ContactForm from "../models/contact.modal.js";
import User from "../models/user.Model.js";

export const submitForm = async (req, res) => {
    try {
        const { name, email, subject, message , id } = req.body;

        if (!name || !email || !subject || !message || !id) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const finduser = await User.findById(id);
        if(!finduser){
            console.log("no user")
        }

        const newContactForm = new ContactForm({
            name,
            email,
            subject,
            message,
        });

        await newContactForm.save();

        res.status(200).json({
            success:true,
            message: 'Your message has been submitted successfully!',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while submitting your message.' });
    }
}

export const getContactForm = async (req, res) => {
    try {
        const submissions = await ContactForm.find().sort({ createdAt: -1 });
        console.log(submissions);

        res.status(200).json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch submissions.' });
    }
}