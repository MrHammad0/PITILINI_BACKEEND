// controllers/kycController.js
const User = require('../Models/user.model');
const Collaborator = require('../Models/collaborator.model')
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer configuration for file upload
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only .pdf, .jpg, .jpeg, and .png files are allowed!'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
}).array('documents', 5);

// exports.uploadDocuments = (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       return res.status(400).json({ error: err.message });
//     }

//     try {
//       const user = await User.findById(req.params.userId);
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       }

//       const documents = req.files.map((file) => file.path);
//       user.kycDocuments.push(...documents);
//       await user.save();

//       res.status(200).json({ message: 'Documents uploaded successfully', documents: user.kycDocuments });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });
// };


exports.uploadDocuments = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const user = await User.findById(req.params.userId);
      if (user) {
        // User found, handle document upload
        const documents = req.files.map((file) => file.path);
        user.kycDocuments.push(...documents);
        await user.save();

        return res.status(200).json({ message: 'Documents uploaded successfully for user', documents: user.kycDocuments });
      } else {
        // User not found, search for collaborator
        const collaborator = await Collaborator.findById(req.params.userId);
        if (collaborator) {
          const documents = req.files.map((file) => file.path);
          collaborator.kycDocuments.push(...documents);
          await collaborator.save();

          return res.status(200).json({ message: 'Documents uploaded successfully for collaborator', documents: collaborator.kycDocuments });
        } else {
          return res.status(404).json({ error: 'User and collaborator not found' });
        }
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

