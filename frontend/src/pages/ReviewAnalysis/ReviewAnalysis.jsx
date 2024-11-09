import React, { useState } from 'react';
import axios from 'axios';
import styles from './ReviewAnalysis.module.css';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const ReviewAnalysis = () => {
  const [file, setFile] = useState(null);
  const [reviewData, setReviewData] = useState([]);
  const [pieChartdata, setPieChartData] = useState(null)
  const [reviewsCount, setReviewsCount] = useState(0);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('reviews', file);

    try {
      const response = await axios.post('http://localhost:4003/api/reviews/analyzeReviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response && response.data) {
        setReviewData(response.data.results.reviews); 
        setPieChartData(response.data.results.sentiment_counts)
        setReviewsCount(response.data.results.total_reviews)
        console.log(response.data.results.reviews);
        console.log(response.data.results.sentiment_counts);
        console.log(response.data.results.total_reviews);
        console.log(response.data.results);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const pieData = pieChartdata ? {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [{
      data: [
        (pieChartdata.Positive / reviewsCount) * 100, 
        (pieChartdata.Negative / reviewsCount) * 100, 
        (pieChartdata.Neutral / reviewsCount) * 100
      ],
      backgroundColor: ['#66b3ff', '#ff6666', '#ffcc99'],
      hoverBackgroundColor: ['#3399ff', '#ff4d4d', '#ffb366'],
    }]
  } : null;
  

  
  const positiveReviews = reviewData.filter(review => review.Sentiment_Label === 'Positive');
  const negativeReviews = reviewData.filter(review => review.Sentiment_Label === 'Negative');
  const neutralReviews = reviewData.filter(review => review.Sentiment_Label === 'Neutral');


  return (
    <div className={styles.reviewAnalysis}>
      <div className={styles.upload}>
        <h3>Upload Review Data</h3>
        <input type="file" name="reviews" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
      </div>

      <div className={styles.sentimentSections}>
        <div className={styles.positiveReviews}>
          <h4 className={styles.heading}>Positive Reviews</h4>
          {positiveReviews.map((review, index) => (
            <div key={index} className={styles.review}>
              <p><strong>Review:</strong> {review.Summary}</p>
              <p><strong>User ID:</strong> {review.UserId}</p>
            </div>
          ))}
        </div>

        <div className={styles.neutralReviews}>
          <h4 className={styles.heading}>Neutral Reviews</h4>
          {neutralReviews.map((review, index) => (
            <div key={index} className={styles.review}>
              <p><strong>Review:</strong> {review.Summary}</p>
              <p><strong>User ID:</strong> {review.UserId}</p>
            </div>
          ))}
        </div>

        <div className={styles.negativeReviews}>
          <h4 className={styles.heading}>Negative Reviews</h4>
          {negativeReviews.map((review, index) => (
            <div key={index} className={styles.review}>
              <p><strong>Review:</strong> {review.Summary}</p>
              <p><strong>User ID:</strong> {review.UserId}</p>
            </div>
          ))}
        </div>
      </div>

      {pieData && (
        <div className={styles.pieChart}>
          <h4 className={styles.heading}>Sentiment Distribution</h4>
          <Pie data={pieData} />
        </div>
      )}
    </div>
  );
};

export default ReviewAnalysis;
