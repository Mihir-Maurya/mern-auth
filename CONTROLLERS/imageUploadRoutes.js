const express = require("express");
require("dotenv").config(); //index.js file would identify .env file
const cloudinary = require("cloudinary").v2;
const multer = require("multer"); // multer converts each pixels to binary string array
const User = require("../Models/UserSchema");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/uploadprofilepic", upload.single("myimage"), async (req, res) => {
  const file = req.file;
  const { userid } = req.body;

  if (!file) {
    return res.status(400).json({ error: "No image file provided" });
  }
  const existingUser = await User.findById(userid);

  if (!existingUser) {
    return res.status(400).json({ error: "No user found" });
  }

  cloudinary.uploader
    .upload_stream(
      {
        resource_type: "auto",
      },
      async (error, result) => {
        if (error) {
          return res.status(400).json({ error: "No image file provided" });
        }

        existingUser.profilePic = result.secure_url;
        await existingUser.save();

        res.json({
          imageUrl: result.url,
          message: "Profile picture uploaded successfully",
        });
      }
    )
    .end(file.buffer);
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = router;
