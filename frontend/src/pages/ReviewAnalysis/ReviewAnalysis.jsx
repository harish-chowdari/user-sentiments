import React, { useState } from "react";
import axios from "axios";
import { FaSun, FaMoon } from "react-icons/fa";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import styles from "./ReviewAnalysis.module.css";

const ReviewAnalysis = () => {
    const [file, setFile] = useState(null);
    const [reviewData, setReviewData] = useState([]);
    const [pieChartData, setPieChartData] = useState(null);
    const [reviewsCount, setReviewsCount] = useState(0);
    const [theme, setTheme] = useState("light");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("reviews", file);

        try {
            const response = await axios.post(
                "http://localhost:4003/api/reviews/analyzeReviews",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response && response.data) {
                setReviewData(response.data.results.reviews);
                setPieChartData(response.data.results.sentiment_counts);
                setReviewsCount(response.data.results.total_reviews);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const pieData = pieChartData
        ? {
              labels: ["Positive", "Negative", "Neutral"],
              datasets: [
                  {
                      data: [
                          (pieChartData.Positive / reviewsCount) * 100,
                          (pieChartData.Negative / reviewsCount) * 100,
                          (pieChartData.Neutral / reviewsCount) * 100,
                      ],
                      backgroundColor: ["#66b3ff", "#ff6666", "#ffcc99"],
                      hoverBackgroundColor: ["#3399ff", "#ff4d4d", "#ffb366"],
                  },
              ],
          }
        : null;

    const positiveReviews = reviewData.filter(
        (review) => review.Sentiment_Label === "Positive"
    );
    const negativeReviews = reviewData.filter(
        (review) => review.Sentiment_Label === "Negative"
    );
    const neutralReviews = reviewData.filter(
        (review) => review.Sentiment_Label === "Neutral"
    );

    return (
        <div className={`${styles.reviewAnalysis} ${styles[`${theme}Mode`]}`}>
            {!reviewData.length && (
                <div className={`${styles.upload} ${styles[`${theme}Upload`]}`}>
                    <h3>Upload Review Data</h3>
                    <input
                        type="file"
                        name="reviews"
                        onChange={handleFileChange}
                    />
                    <button
                        className={`${styles.uploadButton} ${
                            styles[`${theme}Button`]
                        }`}
                        onClick={handleUpload}
                    >
                        Upload
                    </button>
                </div>
            )}

            {reviewData.length > 0 && (
                <>
                    <button
                        className={`${styles.button} ${
                            styles[`${theme}Button`]
                        }`}
                        onClick={() =>
                            setTheme(theme === "light" ? "dark" : "light")
                        }
                    >
                        {theme === "light" ? (
                            <FaMoon size={15} />
                        ) : (
                            <FaSun size={15} />
                        )}
                    </button>

                    <div className={styles.sentimentSections}>
                        <div
                            className={`${styles.positiveReviews} ${
                                styles[`${theme}Section`]
                            }`}
                        >
                            <h4 className={styles.heading}>Positive Reviews</h4>
                            {positiveReviews.map((review, index) => (
                                <div
                                    key={index}
                                    className={`${styles.review} ${
                                        styles[`${theme}Review`]
                                    }`}
                                >
                                    <p>
                                        <strong>Review:</strong>{" "}
                                        {review.Summary}
                                    </p>
                                    <p>
                                        <strong>User ID:</strong>{" "}
                                        {review.UserId}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div
                            className={`${styles.neutralReviews} ${
                                styles[`${theme}Section`]
                            }`}
                        >
                            <h4 className={styles.heading}>Neutral Reviews</h4>
                            {neutralReviews.map((review, index) => (
                                <div
                                    key={index}
                                    className={`${styles.review} ${
                                        styles[`${theme}Review`]
                                    }`}
                                >
                                    <p>
                                        <strong>Review:</strong>{" "}
                                        {review.Summary}
                                    </p>
                                    <p>
                                        <strong>User ID:</strong>{" "}
                                        {review.UserId}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div
                            className={`${styles.negativeReviews} ${
                                styles[`${theme}Section`]
                            }`}
                        >
                            <h4 className={styles.heading}>Negative Reviews</h4>
                            {negativeReviews.map((review, index) => (
                                <div
                                    key={index}
                                    className={`${styles.review} ${
                                        styles[`${theme}Review`]
                                    }`}
                                >
                                    <p>
                                        <strong>Review:</strong>{" "}
                                        {review.Summary}
                                    </p>
                                    <p>
                                        <strong>User ID:</strong>{" "}
                                        {review.UserId}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.pieChartSection}>
                        {pieData && (
                            <div className={styles.pieChart}>
                                <h4 className={styles.heading}>
                                    Sentiment Distribution
                                </h4>
                                <Pie data={pieData} width={300} height={300} />
                            </div>
                        )}

                        <div>
                            <h4 className={styles.heading}>
                                Bar Chart
                            </h4>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReviewAnalysis;
