
const fs = require('fs');
const csv = require('csv-parser');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
const userDetails = require('../Models/AuthenticationModel');
const S3  = require("../s3");

// function analyzeReviews(req, res){
//     const reviewsFilePath = req?.files?.reviews[0]?.path; // Path to the uploaded reviews file
//     let results = [];
//     let sentimentCounts = {
//         Positive: 0,
//         Negative: 0,
//         Neutral: 0
//     };

//     fs.createReadStream(reviewsFilePath)
//         .pipe(csv())
//         .on('data', (data) => {
//             // Ensure required columns are present
//             if (!data['ProductId'] || !data['Summary'] || !data['UserId']) {
//                 res.status(400).json({ error: "Dataset is missing required columns ('ProductId', 'Summary', or 'UserId')." });
//                 return;
//             }

//             // Analyze sentiment using the Sentiment package
//             const analysis = sentiment.analyze(data['Summary']);
//             const sentimentLabel = analysis.score > 0 ? 'Positive' : analysis.score < 0 ? 'Negative' : 'Neutral';

//             // Update the counts for each sentiment type
//             sentimentCounts[sentimentLabel]++;

//             // Append the result to the list
//             results.push({
//                 UserId: data['UserId'],
//                 ProductId: data['ProductId'],
//                 Summary: data['Summary'],
//                 Sentiment_Label: sentimentLabel
//             });
//         })
//         .on('end', () => {
//             // Include sentiment counts in the response
//             res.json({
//                 results: {total_reviews: results.length,
//                 sentiment_counts: sentimentCounts,
//                 reviews: results}
//             });
//         })
//         .on('error', (err) => {
//             res.status(500).json({ error: 'Error reading the CSV file.' });
//         });
// };



function analyzeReviews(req, res){
    const reviewsFilePath = req?.files?.reviews[0]?.path; // Path to the uploaded reviews file
    let results = [];
    let sentimentCounts = { Positive: 0, Negative: 0, Neutral: 0 };
    let productSentimentCounts = {};

    fs.createReadStream(reviewsFilePath)
        .pipe(csv())
        .on('data', (data) => {
            console.log(data);
            // Ensure required columns are present
            if (!data['ProductId'] || !data['Summary'] || !data['UserId']) {
                console.log("Missing required columns");
                res.status(400).json({ error: "Dataset is missing required columns ('ProductId', 'Summary', or 'UserId')." });
                return;
            }

            // Analyze sentiment using the Sentiment package
            const analysis = sentiment.analyze(data['Summary']);
            const sentimentLabel = analysis.score > 0 ? 'Positive' : analysis.score < 0 ? 'Negative' : 'Neutral';

            // Update overall sentiment counts
            sentimentCounts[sentimentLabel]++;

            // Update product-specific sentiment counts
            if (!productSentimentCounts[data['ProductId']]) {
                productSentimentCounts[data['ProductId']] = { Positive: 0, Negative: 0, Neutral: 0 };
            }
            productSentimentCounts[data['ProductId']][sentimentLabel]++;

            // Append the result to the list
            results.push({
                UserId: data['UserId'],
                ProductId: data['ProductId'],
                Summary: data['Summary'],
                Sentiment_Label: sentimentLabel 
            });
        })
        .on('end', () => {
            res.json({reviews:{
                total_reviews: results.length,
                sentiment_counts: sentimentCounts,
                product_sentiment_counts: productSentimentCounts,
                reviews: results 
            }});
        })
        .on('error', (err) => {
            res.status(500).json({ error: 'Error reading the CSV file.' });
        });
};



// utils/sendMail.js

const nodemailer = require('nodemailer');

const sendMail = async (email, message) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // sender's email address
            pass: process.env.EMAIL_PASSWORD // sender's email password
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Negative Review Count Limit Reached',
        text: message
    };

    await transporter.sendMail(mailOptions);
};



async function addFile(req, res) {
    try {
        if (!req.files || !req.files.reviews) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const response = await S3.uploadFile(
            process.env.AWS_BUCKET_NAME,
            req.files.reviews[0]
        );

        const { userId } = req.params;
        const additionalNegativeCount = parseInt(req.body.negativeReviewsCount, 10) || 0;

        const user = await userDetails.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User does not exist" });
        }

        // Update negative reviews count
        user.negativeReviewsCount += additionalNegativeCount;

        // Check if email should be sent based on count and limit, and if email hasn’t already been sent
        if (user.negativeReviewsCount >= user.negativeReviewsLimit && !user.mailSent) {
            const emailContent = `
                Dear ${user.firstName},
                Your negative review count has reached the limit of ${user.negativeReviewsLimit}.
                Please review your account accordingly.
            `;
            await sendMail(user.email, emailContent);
            console.log(`Email sent to ${user.email}`);

            // Set mailSent to true to avoid sending multiple emails
            user.mailSent = true;
        }

        user.reviews.push({
            url: response.Location,
            date: Date.now() // Adds the current date when the review is uploaded
        });
        await user.save();

        console.log({fileUrl: response.Location, updatedNegativeReviewsCount: user.negativeReviewsCount});
        return res.status(200).json({
            message: "File uploaded, negative reviews count updated, and review URL added successfully",
            fileUrl: response.Location,
            updatedNegativeReviewsCount: user.negativeReviewsCount
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}



module.exports = {
    analyzeReviews,
    addFile
};