const express = require("express");
const router = express.Router();

const { reviewsUpload } = require("../multer");

const { analyzeReviews, addFile } = require("../Controllers/reviewControllers");

router.post("/analyzeReviews",
    reviewsUpload,
    analyzeReviews 
);

router.post("/addFile/:userId", reviewsUpload, addFile);
 
module.exports = router;