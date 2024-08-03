const bcrypt = require("bcryptjs");
const user = require("../Models/user.model");
const collaborator = require("../Models/collaborator.model")
const { transporter } = require("../utils/email");
const jwt = require("jsonwebtoken");
const schedule = require('node-schedule');
const collaboratorImageModel = require("../Models/collaboratorImage.model");
const crypto = require('crypto');
const Administrator = require("../Models/administrator.model");

// exports.registerCollaborator = async (req, res) => {
//     try {
//         const { firstName, lastName, email, password } = req.body;
//         if (!firstName || !lastName || !email || !password) {
//             return res.status(400).json({ message: "All fields are required" });
//         }
//         const findCollaborator = await collaborator.findOne({email});
//         if(findCollaborator)
//         {
//             return res.status(400).json({ message: "Collaborator already exsist with this email" });
//         }
//         const find = await user.findOne({email});
//         if(find)
//         {
//             return res.status(400).json({ message: "User already exsist with this email" });
//         }
//         const hashPass = await bcrypt.hash(password, 10);

//         const userData = {
//             firstName,
//             lastName,
//             email,
//             password: hashPass  
//             };


//         const userid = await user.create(userData);

//         let mail = {
//             from: process.env.HOST_EMAIL,
//             to: userData.email,
//             subject: "PITIKLINI",
//             html: `<b align="center">Welcome to Pitiklini</b>
//             <br/>
//                    <b> ${userData.firstName} ${userData.lastName}</b>
//                    <p>Pitiklini is an upgrade to the existing Pitiklini iBanking system with upgraded functionalities. You can instantly self-register to the application using Internet without the hassle of contacting the call center customer service. You can benefit from the convenient Netbanking / Mobile Banking and can manage finances with ease and security.</p>`
//         };

//         transporter.sendMail(mail, function (error, info) {
//             if (error) console.log(error);
//             else console.log(info);
//         });

//         return res.status(201).json({ success: true, message: "Collaborator created successfully but before payment collaborator account is client account", userData: userData ,id:userid._id});

//     } catch (error) {
//         return res.status(400).json({ success: false, message: error.message, cusmsg: "Collaborator not created" });
//     }
// };

// const generateReferralCode = async () => {
//     const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
//     return referralCode;
// };

// exports.registerCollaborator = async (req, res) => {
//     try {
//         const { firstName, lastName, email, password, referralCode } = req.body;
//         if (!firstName || !lastName || !email || !password) {
//             return res.status(400).json({ message: "All fields are required" });
//         }
        
//         const findCollaborator = await collaborator.findOne({ email });
//         if (findCollaborator) {
//             return res.status(400).json({ message: "Collaborator already exists with this email" });
//         }
        
//         const findUser = await user.findOne({ email });
//         if (findUser) {
//             return res.status(400).json({ message: "User already exists with this email" });
//         }
        
//         const hashPass = await bcrypt.hash(password, 10);

//         const newReferralCode = await generateReferralCode();

//         const collaboratorData = {
//             firstName,
//             lastName,
//             email,
//             password: hashPass,
//             referralCode: newReferralCode // Assign generated referral code
//         };

//         // Check if there's a referral code and associate the new collaborator with the referrer
//         if (referralCode) {
//             const referringUser = await user.findOne({ referralCode }) || await collaborator.findOne({ referralCode });
//             if (referringUser) {
//                 collaboratorData.referredBy = referringUser._id;
//             }
//         }

//         const createdCollaborator = await collaborator.create(collaboratorData);

//         // Send welcome email
//         let mail = {
//             from: process.env.HOST_EMAIL,
//             to: collaboratorData.email,
//             subject: "PITIKLINI",
//             html: `<b align="center">Welcome to Pitiklini</b>
//             <br/>
//                    <b> ${collaboratorData.firstName} ${collaboratorData.lastName}</b>
//                    <p>Pitiklini is an upgrade to the existing Pitiklini iBanking system with upgraded functionalities. You can instantly self-register to the application using Internet without the hassle of contacting the call center customer service. You can benefit from the convenient Netbanking / Mobile Banking and can manage finances with ease and security.</p>`
//         };

//         transporter.sendMail(mail, function (error, info) {
//             if (error) console.log(error);
//             else console.log(info);
//         });

//         return res.status(201).json({ success: true, message: "Collaborator created successfully but before payment collaborator account is a client account", collaboratorData: collaboratorData, id: createdCollaborator._id });

//     } catch (error) {
//         return res.status(400).json({ success: false, message: error.message, cusmsg: "Collaborator not created" });
//     }
// };
const generateReferralCode = async () => {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// exports.registerCollaborator = async (req, res) => {
//     try {
//         const { firstName, lastName, email, password, referralCode } = req.body;

//         // Validate request body
//         if (!firstName || !lastName || !email || !password) {
//             return res.status(400).json({ message: "All fields are required" });
//         }

//         // Check if a collaborator, user, or administrator with the same email already exists
//         const existingCollaborator = await collaborator.findOne({ email });
//         const existingUser = await user.findOne({ email });
//         const existingAdministrator = await Administrator.findOne({ email });

//         if (existingCollaborator || existingUser || existingAdministrator) {
//             return res.status(400).json({ message: "A user with this email already exists" });
//         }

//         // Hash the password
//         const hashPass = await bcrypt.hash(password, 10);

//         // Create new referral code
//         const newReferralCode = await generateReferralCode();

//         // Prepare collaborator data
//         const collaboratorData = {
//             firstName,
//             lastName,
//             email,
//             password: hashPass,
//             referralCode: newReferralCode
//         };

//         // Handle referral code
//         if (referralCode) {
//             const referringUser = await user.findOne({ referralCode: referralCode.toUpperCase() })
//                 || await collaborator.findOne({ referralCode: referralCode.toUpperCase() });

//             if (referringUser) {
//                 collaboratorData.referredBy = referringUser._id;
//             }
//         }

//         // Create collaborator
//         const createdCollaborator = await user.create(collaboratorData);

//         // Prepare welcome email for the new collaborator
//         const collaboratorMail = {
//             from: process.env.HOST_EMAIL,
//             to: collaboratorData.email,
//             subject: "Welcome to Pitiklini",
//             html: `<b align="center">Welcome to Pitiklini</b>
//                    <br/>
//                    <b>${collaboratorData.firstName} ${collaboratorData.lastName}</b>
//                    <p>Pitiklini is an upgrade to the existing Pitiklini iBanking system with upgraded functionalities...</p>`
//         };

//         const emailPromises = [transporter.sendMail(collaboratorMail)];

//         // Prepare referral notification email for the referring user, if any
//         if (collaboratorData.referredBy) {
//             const referringUser = await user.findById(collaboratorData.referredBy) 
//                 || await collaborator.findById(collaboratorData.referredBy);

//             const referringUserMail = {
//                 from: process.env.HOST_EMAIL,
//                 to: referringUser.email,
//                 subject: "Referral Notification",
//                 html: `<b align="center">Referral Notification</b>
//                        <br/>
//                        <p>Your referral code (${referringUser.referralCode}) was used by ${collaboratorData.firstName} ${collaboratorData.lastName} to register on Pitiklini.</p>
//                        <p>Thank you for referring new users to our platform!</p>`
//             };
//             emailPromises.push(transporter.sendMail(referringUserMail));
//         }

//         // Prepare notification email for the administrator
//         const adminEmails = await Administrator.findOne({email:'daltondorimon@gmail.com'});
//         const adminMail = {
//             from: process.env.HOST_EMAIL,
//             to: adminEmails.email,
//             subject: "New Collaborator Registration",
//             html: `<b align="center">New Collaborator Registration</b>
//                    <br/>
//                    <p>New collaborator registered with the email: ${collaboratorData.email}</p>
//                    <p>Referring User ID: ${collaboratorData.referredBy || 'N/A'}</p>
//                    <p>New Collaborator ID: ${createdCollaborator._id}</p>
//                    <p>Referral Code: ${newReferralCode}</p>`
//         };
//         emailPromises.push(transporter.sendMail(adminMail));

//         // Send all emails
//         await Promise.all(emailPromises);

//         // Respond with success
//         return res.status(201).json({ 
//             success: true, 
//             message: "Collaborator created successfully. Note: Before payment, the collaborator account is treated as a client account.", 
//             collaboratorData: { 
//                 _id: createdCollaborator._id, 
//                 email: collaboratorData.email, 
//                 firstName: collaboratorData.firstName, 
//                 lastName: collaboratorData.lastName 
//             } 
//         });

//     } catch (error) {
//         console.error(error); // Log the error
//         return res.status(500).json({ success: false, message: "Internal server error", cusmsg: "Collaborator not created" });
//     }
// };

exports.registerCollaborator = async (req, res) => {
    try {
        const { firstName, lastName, email, password, referralCode } = req.body;

        // Validate request body
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const findCollaborator = await collaborator.findOne({email});
                if(findCollaborator)
                {
                    return res.status(400).json({ message: "Collaborator already exsist with this email" });
                }
                const find = await user.findOne({email});
                if(find)
                {
                    return res.status(400).json({ message: "User already exsist with this email" });
                }
                const admin = await Administrator.findOne({email});
                if(admin)
                {
                    return res.status(400).json({ message: "Administrator already exsist with this email" });
                }
        // Check if a collaborator, user, or administrator with the same email already exists
       

        // Hash the password
        const hashPass = await bcrypt.hash(password, 10);

        // Create new referral code
        const newReferralCode = await generateReferralCode();

        // Prepare collaborator data
        const collaboratorData = {
            firstName,
            lastName,
            email,
            password: hashPass,
            referralCode: newReferralCode
        };

        // Handle referral code
        if (referralCode) {
            const referringUser = await user.findOne({ referralCode: referralCode.toUpperCase() })
                || await collaborator.findOne({ referralCode: referralCode.toUpperCase() });

            if (referringUser) {
                collaboratorData.referredBy = referringUser._id;
            }
        }

        // Create collaborator
        const createdCollaborator = await user.create(collaboratorData);

        // Prepare welcome email for the new collaborator
        const collaboratorMail = {
            from: process.env.HOST_EMAIL,
            to: collaboratorData.email,
            subject: "Welcome to Pitiklini",
            html: `<b align="center">Welcome to Pitiklini</b>
                   <br/>
                   <b>${collaboratorData.firstName} ${collaboratorData.lastName}</b>
                   <p>Pitiklini is an upgrade to the existing Pitiklini iBanking system with upgraded functionalities...</p>`
        };

        const emailPromises = [transporter.sendMail(collaboratorMail)];

        // Prepare referral notification email for the referring user, if any
        if (collaboratorData.referredBy) {
            const referringUser = await user.findById(collaboratorData.referredBy) 
                || await collaborator.findById(collaboratorData.referredBy);

            const referringUserMail = {
                from: process.env.HOST_EMAIL,
                to: referringUser.email,
                subject: "Referral Notification",
                html: `<b align="center">Referral Notification</b>
                       <br/>
                       <p>Your referral code (${referringUser.referralCode}) was used by ${collaboratorData.firstName} ${collaboratorData.lastName} to register on Pitiklini.</p>
                       <p>Thank you for referring new users to our platform!</p>`
            };
            emailPromises.push(transporter.sendMail(referringUserMail));
        }

        // Prepare notification email for the administrator
        const adminEmails = await Administrator.findOne({ email: 'daltondorimon@gmail.com' });
        const adminMail = {
            from: process.env.HOST_EMAIL,
            to: adminEmails.email,
            subject: "New Collaborator Registration",
            html: `<b align="center">New Collaborator Registration</b>
                   <br/>
                   <p>New collaborator registered with the email: ${collaboratorData.email}</p>
                   <p>Referring User ID: ${collaboratorData.referredBy || 'N/A'}</p>
                   <p>New Collaborator ID: ${createdCollaborator._id}</p>
                   <p>Referral Code: ${newReferralCode}</p>`
        };
        emailPromises.push(transporter.sendMail(adminMail));

        // Send all emails
        await Promise.all(emailPromises);

        // Respond with success
        return res.status(201).json({ 
            success: true, 
            message: "Collaborator created successfully. Note: Before payment, the collaborator account is treated as a client account.", 
            collaboratorData: { 
                _id: createdCollaborator._id, 
                email: collaboratorData.email, 
                firstName: collaboratorData.firstName, 
                lastName: collaboratorData.lastName 
            } 
        });

    } catch (error) {
        console.error(error); // Log the error
        return res.status(500).json({ success: false, message: "Internal server error", cusmsg: "Collaborator not created" });
    }
};

exports.convertClientToCollaborator = async (req,res)=>{
const {id} = req.params;
const findUser = await user.findById(id);
if(!findUser)
{
    return res.status(404).json({message:"User not found with this id"});
}
try {
    const collaboratorData = {
       firstName:findUser.firstName,
       lastName:findUser.lastName,
       email:findUser.email,
       password:findUser.password,
       kycStatus:findUser.kycStatus,
       kycDocuments:findUser.kycDocuments,
       referralCode:findUser.referralCode
    }
    await user.findByIdAndDelete(id);
    const coId = await collaborator.create(collaboratorData);
    return res.status(202).json({message:"Transaction Done Successfully and collaborator account created Successfully",collaboratorId:coId._id})
} catch (error) {
    return res.status(500).json({message:"Internal Server Error",error:error.message});
}
};
exports.scheduleConversion = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the collaborator by ID
        const collaboratorr = await collaborator.findById(id);
        if (!collaboratorr) {
            return res.status(404).json({ message: "Collaborator not found with this id" });
        }

        // Schedule the conversion task for one month later (adjust duration as needed)
        schedule.scheduleJob(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), async () => {
            await convertCollaboratorToUser(id);
        });

        return res.status(202).json({
            success: true,
            message: "Conversion scheduled successfully",
        });

    } catch (error) {
        console.error("Error in scheduleConversion:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const convertCollaboratorToUser = async (id) => {
    try {
        const collaboratorr = await collaborator.findById(id);
        if (!collaboratorr) {
            console.log(`Collaborator with id ${id} not found`);
            return;
        }

        // Create new user from collaborator data
        const userData = {
            firstName: collaboratorr.firstName,
            lastName: collaboratorr.lastName,
            email: collaboratorr.email,
            password: collaboratorr.password,
            kycStatus: collaboratorr.kycStatus,
            kycDocuments: collaboratorr.kycDocuments
        };

        await collaborator.findByIdAndDelete(id);
        await user.create(userData);

        // Send email notification about subscription expiration
        const mailOptions = {
            from: process.env.HOST_EMAIL,
            to: userData.email,
            subject: "PITIKLINI Subscription Expired",
            html: `
                <b align="center">Subscription Expired</b>
                <br/>
                <b>${userData.firstName} ${userData.lastName}</b>
                <p>Your collaborator account has been converted back to a user account due to the expiration of your subscription. 
                Please pay £17 to convert back to a collaborator account.</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
            } else {
                console.log("Email sent:", info);
            }
        });

        console.log(`Collaborator with id ${id} has been converted back to a user`);

    } catch (error) {
        console.error(`Error converting collaborator to user: ${error.message}`);
    }
};


exports.collaboratorInfo = async (req, res) => {
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

        const image = new collaboratorImageModel({ ...file });
        await image.save();

        const info = {
            image: `http://localhost:5080/api/v3/collaboratorImageModel/${image._id}`,
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
        const findingUser = await collaborator.findById(id);

        if (!findingUser) {
            return res.status(404).json({ message: "Collaborator not found" });
        }

        await collaborator.findByIdAndUpdate(id, info);

        return res.status(200).json({ success: true, message: "Collaborator personal info successfully updated",info });
    } catch (error) {
        console.error("Error entering Collaborator personal info:", error);
        return res.status(500).json({ success: false, message: "Failed to enter Collaborator personal info", error });
    }
};

exports.getCollaboratorImage = async (req, res) => {
    try {
        const { id } = req.params;
        const image = await collaboratorImageModel.findById(id);

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

exports.getCollaboratorInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await collaborator.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
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

exports.changeCollaboratorPass = async (req, res) => {
    const { oldPassword, newPassword, confirmPassword, email } = req.body;

    try {
        // Validate input fields
        if (!oldPassword || !newPassword || !confirmPassword || !email) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Find user by ID
        const id = req.params.id; // Assuming you're passing id in req.params
        const existingUser = await collaborator.findById(id);

        // Check if user exists
        if (!existingUser) {
            return res.status(404).json({ message: "User not found." });
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
        await collaborator.findByIdAndUpdate(id, { password: hashedPassword });

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


exports.getCollaborators = async (req, res) => {
    try {
        const User = await collaborator.find({});
        const users = User.map((merch) => ({
            firstName: merch.firstName,
            lastName: merch.lastName,
            id:merch._id,
            email: merch.email,
            role:merch.userType
        }))
        res.send( users );
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Internal Server Error' });
    }
};