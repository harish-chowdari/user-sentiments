
const fs = require('fs');
const csv = require('csv-parser');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();


function analyzeReviews(req, res) {
    const reviewsFilePath = req?.files?.reviews;
    let results = [];

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

            // Append the result to the list
            results.push({
                UserId: data['UserId'],
                ProductId: data['ProductId'],
                Summary: data['Summary'],
                Sentiment_Label: sentimentLabel
            });
        })
        .on('end', () => {
            res.json(results); // Send the final results after processing all rows
        })
        .on('error', (err) => {
            res.status(500).json({ error: 'Error reading the CSV file.' });
        });
};


module.exports = {
    analyzeReviews
};