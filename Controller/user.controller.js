const bcrypt = require("bcryptjs");
const user = require("../Models/user.model");
const collaborator = require("../Models/collaborator.model")
const { transporter } = require("../utils/email");
const jwt = require("jsonwebtoken");
const imageModel = require("../Models/userImage.model");
const Administrator = require("../Models/administrator.model");
const crypto = require('crypto');
// exports.registerUser = async (req, res) => {
//     try {
//         const { firstName, lastName, email, password } = req.body;
//         if (!firstName || !lastName || !email || !password) {
//             return res.status(400).json({ message: "All fields are required" });
//         }
//         const find = await user.findOne({email});
//         if(find)
//         {
//             return res.status(400).json({ message: "User already exsist with this email" });
//         }
//         const findCollaborator = await collaborator.findOne({email});
//         if(findCollaborator)
//             {
//                 return res.status(400).json({ message: "Collaborator already exsist with this email" });
//             }
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

//         return res.status(201).json({ success: true, message: "User created successfully", userData: userData });

//     } catch (error) {
//         return res.status(400).json({ success: false, message: error.message, cusmsg: "User not created" });
//     }
// };

// const generateReferralCode = async () => {
//     const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
//     return referralCode;
// };

// exports.registerUser = async (req, res) => {
//     try {
//         const { firstName, lastName, email, password, referralCode } = req.body;
//         if (!firstName || !lastName || !email || !password) {
//             return res.status(400).json({ message: "All fields are required" });
//         }

//         const existingUser = await user.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ message: "User already exists with this email" });
//         }
//         const existingCollaborator = await collaborator.findOne({ email });
//         if (existingCollaborator) {
//             return res.status(400).json({ message: "Collaborator already exists with this email" });
//         }
//         const existingAdministrator = await Administrator.findOne({ email });
//         if (existingAdministrator ) {
//             return res.status(400).json({ message: "Administrator already exists with this email" });
//         }
//         const hashPass = await bcrypt.hash(password, 10);

//         const newUser = {
//             firstName,
//             lastName,
//             email,
//             password: hashPass,
//             referralCode: await generateReferralCode()
//         };

//         // Check if there's a referral code
//         let referringUser = null;
//         if (referralCode) {
//             referringUser = await user.findOne({ referralCode }) || await collaborator.findOne({ referralCode });
//             if (referringUser) {
//                 newUser.referredBy = referringUser._id;
//             }
//         }

//         const createdUser = await user.create(newUser);

//         // Email to the new user
//         let newUserMail = {
//             from: process.env.HOST_EMAIL,
//             to: createdUser.email,
//             subject: "Welcome to Pitiklini",
//             html: `<b align="center">Welcome to Pitiklini</b>
//             <br/>
//                    <b> ${createdUser.firstName} ${createdUser.lastName}</b>
//                    <p>Pitiklini is an upgrade to the existing Pitiklini iBanking system with upgraded functionalities. You can instantly self-register to the application using Internet without the hassle of contacting the call center customer service. You can benefit from the convenient Netbanking / Mobile Banking and can manage finances with ease and security.</p>`
//         };

//         transporter.sendMail(newUserMail, function (error, info) {
//             if (error) console.log(error);
//             else console.log(info);
//         });

//         // Email to the referring user, if exists
//         if (referringUser) {
//             let referringUserMail = {
//                 from: process.env.HOST_EMAIL,
//                 to: referringUser.email,
//                 subject: "Referral Notification",
//                 html: `<b align="center">Referral Notification</b>
//                 <br/>
//                        <p>Your referral code (${referringUser.referralCode}) was used by ${createdUser.firstName} ${createdUser.lastName} to register on Pitiklini.</p>
//                        <p>Thank you for referring new users to our platform!</p>`
//             };

//             transporter.sendMail(referringUserMail, function (error, info) {
//                 if (error) console.log(error);
//                 else console.log(info);
//             });
//         }

//         // Email to the administrator
//         const adminEmail = await Administrator.find(); // Ensure this environment variable is set
//         let adminMail = {
//             from: process.env.HOST_EMAIL,
//             to: adminEmail.map((e)=>e.email),
//             subject: "New User Registration",
//             html: `<b align="center">New User Registration</b>
//             <br/>
//                    <p>New user registered with the email: ${createdUser.email}</p>
//                    <p>Referring User ID: ${referringUser ? referringUser._id : 'N/A'}</p>
//                    <p>New User ID: ${createdUser._id}</p>
//                    <p>Referral Code: ${newUser.referralCode}</p>`
//         };

//         transporter.sendMail(adminMail, function (error, info) {
//             if (error) console.log(error);
//             else console.log(info);
//         });

//         return res.status(201).json({ success: true, message: "User created successfully", userData: createdUser });

//     } catch (error) {
//         return res.status(400).json({ success: false, message: error.message, cusmsg: "User not created" });
//     }
// };


const generateReferralCode = async () => {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
};

exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, referralCode } = req.body;

        // Validate request body
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the user, collaborator, or administrator already exists
        const existingUser = await user.findOne({ email });
        const existingCollaborator = await collaborator.findOne({ email });
        const existingAdministrator = await Administrator.findOne({ email });

        if (existingUser || existingCollaborator || existingAdministrator) {
            return res.status(400).json({ message: "A user with this email already exists" });
        }

        // Hash the password
        const hashPass = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            firstName,
            lastName,
            email,
            password: hashPass,
            referralCode: await generateReferralCode()
        };

        // Handle referral code
        if (referralCode) {
            const referringUser = await user.findOne({ referralCode: referralCode.toUpperCase() })
                || await collaborator.findOne({ referralCode: referralCode.toUpperCase() });

            if (referringUser) {
                newUser.referredBy = referringUser._id;
            }
        }

        const createdUser = await user.create(newUser);

        // Prepare emails
        const newUserMail = {
            from: process.env.HOST_EMAIL,
            to: createdUser.email,
            subject: "Welcome to Pitiklini",
            html: `<b align="center">Welcome to Pitiklini</b>
                   <br/>
                   <b>${createdUser.firstName} ${createdUser.lastName}</b>
                   <p>Pitiklini is an upgrade to the existing Pitiklini iBanking system with upgraded functionalities...</p>`
        };

        const emailPromises = [transporter.sendMail(newUserMail)];

        if (newUser.referredBy) {
            const referringUser = await user.findById(newUser.referredBy) || await collaborator.findById(newUser.referredBy);
            const referringUserMail = {
                from: process.env.HOST_EMAIL,
                to: referringUser.email,
                subject: "Referral Notification",
                html: `<b align="center">Referral Notification</b>
                       <br/>
                       <p>Your referral code (${referringUser.referralCode}) was used by ${createdUser.firstName} ${createdUser.lastName} to register on Pitiklini.</p>
                       <p>Thank you for referring new users to our platform!</p>`
            };
            emailPromises.push(transporter.sendMail(referringUserMail));
        }

        const adminEmails = await Administrator.find();
        const adminMail = {
            from: process.env.HOST_EMAIL,
            to: adminEmails.map(e => e.email),
            subject: "New User Registration",
            html: `<b align="center">New User Registration</b>
                   <br/>
                   <p>New user registered with the email: ${createdUser.email}</p>
                   <p>Referring User ID: ${newUser.referredBy || 'N/A'}</p>
                   <p>New User ID: ${createdUser._id}</p>
                   <p>Referral Code: ${newUser.referralCode}</p>`
        };
        emailPromises.push(transporter.sendMail(adminMail));

        // Send all emails
        await Promise.all(emailPromises);

        return res.status(201).json({ success: true, message: "User created successfully", userData: { _id: createdUser._id, email: createdUser.email, firstName: createdUser.firstName, lastName: createdUser.lastName } });

    } catch (error) {
        console.error(error); // Log the error
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        let foundUser = await user.findOne({ email });
        if (!foundUser) {
            foundUser = await collaborator.findOne({ email });
            if (!foundUser) {
                foundUser = await Administrator.findOne({ email });
            }
            if(!foundUser)
            {
                return res.status(404).json({message:"User not found"})
            }
        }

        const verifyPassword = await bcrypt.compare(password, foundUser.password);
        if (!verifyPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { user: foundUser.email, id: foundUser._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '12min' }
        );
        return res.status(201).json({ message: "Logged in Successfully", success: true, token, foundUser });


    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.changePass = async (req, res) => {
    const { oldPassword, newPassword, confirmPassword, email } = req.body;

    try {
        // Validate input fields
        if (!oldPassword || !newPassword || !confirmPassword || !email) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Find user by ID
        const id = req.params.id; // Assuming you're passing id in req.params
        const existingUser = await user.findById(id);

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
        await user.findByIdAndUpdate(id, { password: hashedPassword });

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

exports.forget = async (req, res) => {
    const { email } = req.body;
    const findEmail = await user.findOne({ email }) || await collaborator.findOne({ email }) || Administrator.findOne({ email });
    console.log("user", findEmail)
    if (!findEmail) return res.status(401).json({ message: "User not found" })
    try {
        const token = jwt.sign({ email: findEmail.email, id: findEmail._id }, process.env.JWT_SECRET_KEY)
        res.status(201).json({ message: "Token Generated", token })
        const message = `${process.env.FRD_URI}/forgetpass/${token}`
        const mail = {
            from: process.env.HOST_EMAIL,
            to: findEmail.email,
            subject: "PaySwift",
            html: ` 
            <h3 >Hello ${findEmail.firstName}!</h3>
            <p>Did you forget your Password? .Don't worry press the button bellow and change your Password.</p>
            
        <a href="${message}">
            <button style="background-color: black; color: white; padding: 10px 20px; border: none; cursor: pointer; font-size: 16px; border-radius: 5px;text-align:center; ">
                Forget
            </button>
        </a>
    `
        }
        transporter.sendMail(mail)

    } catch (error) {
        res.status(401).json({ message: "Token not Generated" })
    }

};

exports.forgetPassword = async (req, res) => {
    const forgettoken = req.params.token;
    console.log("token", forgettoken)
    const { newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
        return res.status(401).json({ message: "New and Confirm password must be same" })
    }

    if (newPassword == '' && confirmPassword == '') {
        return res.status(401).json({ message: "Empty Password is not Accepted" })
    }
    try {
        const verify = jwt.verify(forgettoken, process.env.JWT_SECRET_KEY);
        if (!verify) {
            return res.status(401).json({ message: "unauthorize user" })
        }
        console.log("verify", verify)
        const userId = verify.id;
        const find = await user.findById(userId) || await collaborator.findById(userId) || await Administrator.findById(userId);
        if (!find) {
            return res.status(401).json({ message: "User not Found" })
        }
        const hashPass = bcrypt.hashSync(newPassword, 10);
        find.password = hashPass;
        await find.save();
        res.status(201).json("user Password Changed Successfully")
    } catch (error) {
        res.status(401).json({ message: "Server Problem", error: error })
    }

};

exports.userInfo = async (req, res) => {
    const file = req.file
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

        const image = new imageModel({ ...file })
        await image.save()
        const info = {
            image: `http://localhost:5080/api/v3/userProfileImage/${image._id}`,
            firstName: firstName,
            lastName: lastName,
            email: email,
            phoneNumber: phoneNumber,
            postalCode: postalCode,
            zipCode: zipCode,
            City: City,
            State: State,
            Country: Country,
        };
        const { id } = req.params
        const findingUser = await user.findById(id)
        if (!findingUser) {
            res.status(401).json({ message: "Please Enter a valid email as you entered at the time of sign" })
        }

        await user.findByIdAndUpdate(id, info);

        res.status(200).json({ success: true, message: "User personal info successfully entered" });
    } catch (error) {
        console.error("Error entering user personal info:", error);
        res.status(500).json({ success: false, message: "Failed to enter user personal info", error });
    }
};

exports.getImage = async (req, res) => {
    try {
        const { id } = req.params;
        const image = await imageModel.findById(id)
        if (!image) {
            res.status(401).json({ message: "Image not Available" })
        }
        res.setHeader("content-type", "image/jpg")
        res.send(image.buffer)
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while getting the user image",
            error: error,
        })
    }
};

exports.getUserInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = await user.findById(id);
        if (!userId) {
            return res.status(404).json({ message: "User not Found" });
        }
        return res.status(200).json({
            success: true,
            message: "User found",
            user: userId,
        });
    } catch (error) {
        console.error("Error fetching user info:", error);
        return res.status(500).json({
            message: "An error occurred while fetching user info",
            error: error.message,
        });
    }
};

exports.queryController = (req, res) => {
    try {
        const { email, queries } = req.body;

        if (!email || !queries) {
            return res.status(400).json({ message: "Email and query are required" });
        }

        const message = queries;
        const mailOptions = {
            to: process.env.HOST_EMAIL,
            from: email,
            subject: "Query Received from User",
            html: `<h1>Query from ${email}</h1>
                   <p>${message}</p>
                   <p>Sender's email: ${email}</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return res.status(500).json({ message: "Error sending query email", error });
            }
            console.log("Email sent:", info);
            res.status(200).json({ message: "User query email sent successfully" });
        });
    } catch (error) {
        console.error("Error in queryController:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const User = await user.find({});
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