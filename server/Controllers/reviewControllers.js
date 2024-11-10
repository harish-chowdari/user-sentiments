
const fs = require('fs');
const csv = require('csv-parser');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();


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
            // Ensure required columns are present
            if (!data['ProductId'] || !data['Summary'] || !data['UserId']) {
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
            res.json({
                total_reviews: results.length,
                sentiment_counts: sentimentCounts,
                product_sentiment_counts: productSentimentCounts,
                reviews: results
            });
        })
        .on('error', (err) => {
            res.status(500).json({ error: 'Error reading the CSV file.' });
        });
};



module.exports = {
    analyzeReviews
};