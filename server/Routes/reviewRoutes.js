const express = require("express");
const router = express.Router();

const { reviewsUpload } = require("../multer");

const { analyzeReviews, addFile } = require("../Controllers/reviewControllers");
const { pdfUpload } = require("../pdfMulter"); 

router.post("/analyzeReviews",
    reviewsUpload,
    analyzeReviews 
);

router.post("/addFile/:userId", pdfUpload, addFile); 
 
module.exports = router;