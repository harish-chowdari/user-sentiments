const express = require("express");
const router = express.Router();

const { reviewsUpload } = require("../multer");

const { analyzeReviews } = require("../Controllers/reviewControllers");

router.post("/analyzeReviews",
    reviewsUpload,
    analyzeReviews
);

module.exports = router;