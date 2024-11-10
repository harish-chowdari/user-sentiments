import React, { useState, useRef } from "react";
import axios from "axios";
import { FaSun, FaMoon } from "react-icons/fa";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import styles from "./ReviewAnalysis.module.css";

const ReviewAnalysis = () => {
    const [file, setFile] = useState(null);
    const [reviewData, setReviewData] = useState([]);
    const [pieChartData, setPieChartData] = useState(null);
    const [reviewsCount, setReviewsCount] = useState(0);
    const [theme, setTheme] = useState("light");
    const chartRef = useRef(null);

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

    const pieData = pieChartData ? {
        labels: ["Positive", "Negative", "Neutral"],
        datasets: [{
            data: [
                (pieChartData.Positive / reviewsCount) * 100,
                (pieChartData.Negative / reviewsCount) * 100,
                (pieChartData.Neutral / reviewsCount) * 100,
            ],
            backgroundColor: ["#66b3ff", "#ff6666", "#ffcc99"],
            hoverBackgroundColor: ["#3399ff", "#ff4d4d", "#ffb366"],
        }],
    } : null;

    const positiveReviews = reviewData.filter(
        (review) => review.Sentiment_Label === "Positive"
    );
    const negativeReviews = reviewData.filter(
        (review) => review.Sentiment_Label === "Negative"
    );
    const neutralReviews = reviewData.filter(
        (review) => review.Sentiment_Label === "Neutral"
    );

    const generatePdf = () => {
        const doc = new jsPDF();
    
        html2canvas(chartRef.current).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            doc.addImage(imgData, 'PNG', 10, 10, 190, 90); // Adjust size and position
    
            // Add percentage text below the pie chart
            if (pieChartData) {
                const positivePercentage = ((pieChartData.Positive / reviewsCount) * 100).toFixed(2);
                const negativePercentage = ((pieChartData.Negative / reviewsCount) * 100).toFixed(2);
                const neutralPercentage = ((pieChartData.Neutral / reviewsCount) * 100).toFixed(2);
    
                doc.setFontSize(12);
                doc.text(`Positive: ${positivePercentage}%`, 10, 100);
                doc.text(`Negative: ${negativePercentage}%`, 10, 110);
                doc.text(`Neutral: ${neutralPercentage}%`, 10, 120);
            }
    
            // Function to add reviews to PDF, ensuring pagination
            const addReviewsToPdf = (title, reviews) => {
                doc.addPage();
                doc.setFontSize(16);
                doc.text(title, 10, 10);
                doc.setFontSize(12);
    
                let yPosition = 20;
                reviews.forEach((review, index) => {
                    if (yPosition > 270) {
                        doc.addPage();
                        yPosition = 10;
                    }
    
                    // Add review details
                    doc.text(`Review: ${review.Summary}`, 10, yPosition);
                    doc.text(`User ID: ${review.UserId}`, 10, yPosition + 5);
                    yPosition += 10;
                });
            };
    
            // Add Positive Reviews
            addReviewsToPdf("Positive Reviews", positiveReviews);
    
            // Add Negative Reviews
            addReviewsToPdf("Negative Reviews", negativeReviews);
    
            // Add Neutral Reviews
            addReviewsToPdf("Neutral Reviews", neutralReviews);
    
            // Convert the PDF to Blob and send it to the API
            const pdfBlob = doc.output('blob');
            const formData = new FormData();
            formData.append("reviews", pdfBlob, "reviews.pdf");
    
            // Send the PDF to your API
            axios.post(
                `http://localhost:4003/api/reviews/addFile/${localStorage.getItem("userId")}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            )
            .then((response) => {
                alert("Backeup successful");
            })
            .catch((error) => {
                console.error("Error uploading PDF:", error);
            });
        });
    };
    
    
    
    

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
                        className={`${styles.uploadButton} ${styles[`${theme}Button`]}`}
                        onClick={handleUpload}
                    >
                        Upload
                    </button>
                </div>
            )}

            {reviewData.length > 0 && (
                <>

                <div className={styles.buttons}>
                <button onClick={generatePdf} className={`${styles.genButton} ${styles[`${theme}Button`]}`}>
                            Generate PDF
                        </button>
                    <button
                        className={`${styles.button} ${styles[`${theme}Button`]}`}
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    >
                        {theme === "light" ? <FaMoon size={15} /> : <FaSun size={15} />}
                    </button>
                </div>


                    <div className={styles.sentimentSections}>
                        <div className={`${styles.positiveReviews} ${styles[`${theme}Section`]}`}>
                            <h4 className={styles.heading}>Positive Reviews</h4>
                            {positiveReviews.map((review, index) => (
                                <div key={index} className={`${styles.review} ${styles[`${theme}Review`]}`}>
                                    <p><strong>Review:</strong> {review.Summary}</p>
                                    <p><strong>User ID:</strong> {review.UserId}</p>
                                </div>
                            ))}
                        </div>

                        <div className={`${styles.neutralReviews} ${styles[`${theme}Section`]}`}>
                            <h4 className={styles.heading}>Neutral Reviews</h4>
                            {neutralReviews.map((review, index) => (
                                <div key={index} className={`${styles.review} ${styles[`${theme}Review`]}`}>
                                    <p><strong>Review:</strong> {review.Summary}</p>
                                    <p><strong>User ID:</strong> {review.UserId}</p>
                                </div>
                            ))}
                        </div>

                        <div className={`${styles.negativeReviews} ${styles[`${theme}Section`]}`}>
                            <h4 className={styles.heading}>Negative Reviews</h4>
                            {negativeReviews.map((review, index) => (
                                <div key={index} className={`${styles.review} ${styles[`${theme}Review`]}`}>
                                    <p><strong>Review:</strong> {review.Summary}</p>
                                    <p><strong>User ID:</strong> {review.UserId}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.pieChartSection}>
                        {pieData && (
                            <div className={styles.pieChart} ref={chartRef}>
                                <h4 className={styles.heading}>Sentiment Distribution</h4>
                                <Pie data={pieData} width={300} height={300} />
                            </div>
                        )}

                        <div>
                            <h4 className={styles.heading}>Bar Chart</h4>
                        </div>

                        
                    </div>
                </>
            )}
        </div>
    );
};

export default ReviewAnalysis;