const bcrypt = require("bcryptjs");
const { transporter } = require("../utils/email");
const Administrator = require("../Models/administrator.model");
const administratorImageModel = require("../Models/administratorImage.model");


const createAdmin = async () => {
    const adminExists = await Administrator.findOne({ email: 'daltondorimon@gmail.com' });
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('adminpassword', 10);
        const newAdmin = new Administrator({
            email: 'daltondorimon@gmail.com ',
            password: hashedPassword,
            userType: 'Administrator'
        });
        await newAdmin.save();
        console.log('Administrator created successfully.');
    } else {
        console.log('Administrator already exists.');
    }
};

createAdmin();


// Get Administrator Info
exports.getAdministratorInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Administrator.findById(id);

        if (!user) {
            return res.status(404).json({ message: "Administrator not found" });
        }

        return res.status(200).json({
            success: true,
            message: "User found",
            user,
        });
    } catch (error) {
        console.error("Error fetching user info:", error);
        return res.status(500).json({
            message: "An error occurred while fetching user info",
            error: error.message,
        });
    }
};

// Update Administrator Info
exports.AdministratorInfo = async (req, res) => {
    const file = req.file;
    try {
        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            postalCode,
            zipCode,
            City,
            State,
            Country
        } = req.body;

        const image = new administratorImageModel({ ...file });
        await image.save();

        const info = {
            image: `http://localhost:5080/api/v3/administratorImageModel/${image._id}`,
            firstName,
            lastName,
            email,
            phoneNumber,
            postalCode,
            zipCode,
            City,
            State,
            Country,
        };

        const { id } = req.params;
        const findingUser = await Administrator.findById(id);

        if (!findingUser) {
            return res.status(404).json({ message: "Administrator not found" });
        }

        await Administrator.findByIdAndUpdate(id, info);

        return res.status(200).json({ success: true, message: "Administrator personal info successfully updated", info });
    } catch (error) {
        console.error("Error entering Administrator personal info:", error);
        return res.status(500).json({ success: false, message: "Failed to enter Administrator personal info", error });
    }
};

// Get Administrator Image
exports.getAdministratorImage = async (req, res) => {
    try {
        const { id } = req.params;
        const image = await administratorImageModel.findById(id);

        if (!image) {
            return res.status(404).json({ message: "Image not available" });
        }

        res.setHeader("Content-Type", "image/jpeg");
        res.send(image.buffer);
    } catch (error) {
        return res.status(500).json({
            message: "An error occurred while getting the user image",
            error: error.message,
        });
    }
};

// Change Administrator Password
exports.changeAdministratorPass = async (req, res) => {
    const { oldPassword, newPassword, confirmPassword, email } = req.body;

    try {
        // Validate input fields
        if (!oldPassword || !newPassword || !confirmPassword || !email) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Find user by ID
        const id = req.params.id; // Assuming you're passing id in req.params
        const existingUser = await Administrator.findById(id);

        // Check if user exists
        if (!existingUser) {
            return res.status(404).json({ message: "Administrator not found." });
        }

        // Check if email matches
        if (email !== existingUser.email) {
            return res.status(400).json({ message: "Incorrect email." });
        }

        // Compare old password
        const passwordMatch = await bcrypt.compare(oldPassword, existingUser.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Incorrect old password." });
        }

        // Check if new password matches confirm password
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New password and confirm password do not match." });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        await Administrator.findByIdAndUpdate(id, { password: hashedPassword });

        // Send email notification
        const mailOptions = {
            from: process.env.HOST_EMAIL,
            to: existingUser.email,
            subject: "Password Changed Successfully",
            html: `<b>Your password has been changed successfully by ${existingUser.firstName} ${existingUser.lastName}.</b>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error sending email:", error);
            } else {
                console.log("Email sent:", info.response);
            }
        });

        // Respond with success message
        return res.status(200).json({ message: "Password changed successfully." });

    } catch (error) {
        console.error("Password change error:", error);
        return res.status(500).json({ message: "Password change error.", error: error.message });
    }
};
