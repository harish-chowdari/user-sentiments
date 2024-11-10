
const fs = require('fs');
const csv = require('csv-parser');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
const userDetails = require('../Models/AuthenticationModel');
const S3  = require("../s3");

function analyzeReviews(req, res){
    const reviewsFilePath = req?.files?.reviews[0]?.path; // Path to the uploaded reviews file
    let results = [];
    let sentimentCounts = {
        Positive: 0,
        Negative: 0,
        Neutral: 0
    };

    fs.createReadStream(reviewsFilePath)
        .pipe(csv())
        .on('data', (data) => {
            // Ensure required columns are present
            if (!data['ProductId'] || !data['Summary'] || !data['UserId']) {
                res.status(400).json({ error: "Dataset is missing required columns ('ProductId', 'Summary', or 'UserId')." });
                return;
            }

            // Analyze sentiment using the Sentiment package
            const analysis = sentiment.analyze(data['Summary']);
            const sentimentLabel = analysis.score > 0 ? 'Positive' : analysis.score < 0 ? 'Negative' : 'Neutral';

            // Update the counts for each sentiment type
            sentimentCounts[sentimentLabel]++;

            // Append the result to the list
            results.push({
                UserId: data['UserId'],
                ProductId: data['ProductId'],
                Summary: data['Summary'],
                Sentiment_Label: sentimentLabel
            });
        })
        .on('end', () => {
            // Include sentiment counts in the response
            res.json({
                results: {total_reviews: results.length,
                sentiment_counts: sentimentCounts,
                reviews: results}
            });
        })
        .on('error', (err) => {
            res.status(500).json({ error: 'Error reading the CSV file.' });
        });
};


async function addFile(req, res) {
    try {
        // Check if files are uploaded
        if (!req.files || !req.files.reviews) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload the file to S3
        const response = await S3.uploadFile(
            process.env.AWS_BUCKET_NAME,
            req.files.reviews[0]
        );

        // Extract userId from the request params
        const { userId } = req.params;

        // Find the user by userId
        const user = await userDetails.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User does not exist" });
        }

        // Push the new file URL to the reviews array
        user.reviews.push(response.Location); // Add new file URL to reviews array

        // Save the updated user document
        await user.save();

        // Return a success response
        return res.status(200).json({
            message: "File uploaded and review URL added successfully",
            fileUrl: response.Location
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