import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaSun, FaMoon } from "react-icons/fa";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import styles from "./ReviewAnalysis.module.css";

const ReviewAnalysis = () => {
    const [copiedLink, setCopiedLink] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [file, setFile] = useState(null);
    const [reviewData, setReviewData] = useState([]);
    const [pieChartData, setPieChartData] = useState(null);
    const [reviewsCount, setReviewsCount] = useState(0);
    const [theme, setTheme] = useState("light");
    const [postiveSearchTerm, setPostiveSearchTerm] = useState("");
    const [positiveSearchResult, setPostiveSearchResult] = useState([]);
    const [negativeSearchTerm, setNegativeSearchTerm] = useState("");
    const [negativeSearchResult, setNegativeSearchResult] = useState([]);
    const [neutralSearchTerm, setNeutralSearchTerm] = useState("");
    const [neutralSearchResult, setNeutralSearchResult] = useState([]);
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

            if (response && response.data && response.data.reviews) {
                setReviewData(response.data.reviews.reviews);
                setPieChartData(response.data.reviews.sentiment_counts);
                setReviewsCount(response.data.reviews.total_reviews);
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

    useEffect(() => {
        setPostiveSearchResult(
            positiveReviews.filter((review) =>
                review.Summary.toLowerCase().includes(postiveSearchTerm.toLowerCase())
            )
        );
    }, [postiveSearchTerm, positiveReviews]);

    useEffect(() => {
        setNegativeSearchResult(
            negativeReviews.filter((review) =>
                review.Summary.toLowerCase().trim().includes(negativeSearchTerm.toLowerCase())
            )
        );
    }, [negativeSearchTerm, negativeReviews]);

    useEffect(() => {
        setNeutralSearchResult(
            neutralReviews.filter((review) =>
                review.Summary.toLowerCase().includes(neutralSearchTerm.toLowerCase())
            )
        );
    }, [ neutralSearchTerm, neutralReviews]);

    const generatePdf = () => {
        const doc = new jsPDF();
        html2canvas(chartRef.current).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            doc.addImage(imgData, 'PNG', 10, 10, 190, 90);

            if (pieChartData) {
                const positivePercentage = ((pieChartData.Positive / reviewsCount) * 100).toFixed(2);
                const negativePercentage = ((pieChartData.Negative / reviewsCount) * 100).toFixed(2);
                const neutralPercentage = ((pieChartData.Neutral / reviewsCount) * 100).toFixed(2);

                doc.setFontSize(12);
                doc.text(`Positive: ${positivePercentage}%`, 10, 100);
                doc.text(`Negative: ${negativePercentage}%`, 10, 110);
                doc.text(`Neutral: ${neutralPercentage}%`, 10, 120);
            }

            const addReviewsToPdf = (title, reviews) => {
                doc.addPage();
                doc.setFontSize(16);
                doc.text(title, 10, 10);
                doc.setFontSize(12);

                let yPosition = 20;
                reviews.forEach((review) => {
                    if (yPosition > 270) {
                        doc.addPage();
                        yPosition = 10;
                    }
                    doc.text(`Review: ${review.Summary}`, 10, yPosition);
                    doc.text(`User ID: ${review.UserId}`, 10, yPosition + 5);
                    yPosition += 10;
                });
            };

            addReviewsToPdf("Positive Reviews", positiveReviews);
            addReviewsToPdf("Negative Reviews", negativeReviews);
            addReviewsToPdf("Neutral Reviews", neutralReviews);

            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            setCopiedLink(pdfUrl);
            setIsCopied(true);
            window.open(pdfUrl);

            const formData = new FormData();
            formData.append("reviews", pdfBlob, "reviews.pdf");
            formData.append("negativeReviewsCount", negativeReviews.length);

            axios.post(
                `http://localhost:4003/api/reviews/addFile/${localStorage.getItem("userId")}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            )
            .then(() => {
                alert("Backup successful");
            })
            .catch((error) => {
                console.error("Error uploading PDF:", error);
            });
        });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(copiedLink);
        alert("Link copied to clipboard");
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
{ reviewData.length > 0 && (
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
                    { isCopied && <button onClick={handleCopy} className={`${styles.shareButton} ${styles[`${theme}Button`]}`}>Share </button>}


                    
                </div>

                <div className={styles.sentimentSections}>
                    <div className={`${styles.positiveReviews} ${styles[`${theme}Section`]}`}>
                        <h4 className={styles.heading}>Positive Reviews</h4>
                        <input
                            type="text"
                            value={postiveSearchTerm}
                            onChange={(e) => setPostiveSearchTerm(e.target.value)}
                            placeholder="Search reviews..."
                        />
                        <div className={styles.searchResults}>
                            {positiveSearchResult.map((review, index) => (
                                <div key={index} className={styles.searchResult}>
                                    <p><strong>Review:</strong> {review.Summary}</p>
                                    <p><strong>User ID:</strong> {review.UserId}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${styles.neutralReviews} ${styles[`${theme}Section`]}`}>
                        <h4 className={styles.heading}>Neutral Reviews</h4>
                        <input
                            type="text"
                            value={neutralSearchTerm}
                            onChange={(e) => setNeutralSearchTerm(e.target.value)}
                            placeholder="Search reviews..."
                        />
                        {neutralSearchResult.map((review, index) => (
                            <div key={index} className={`${styles.review} ${styles[`${theme}Review`]}`}>
                                <p><strong>Review:</strong> {review.Summary}</p>
                                <p><strong>User ID:</strong> {review.UserId}</p>
                            </div>
                        ))}
                    </div>
                    <div className={`${styles.negativeReviews} ${styles[`${theme}Section`]}`}>
                        <h4 className={styles.heading}>Negative Reviews</h4>
                        <input
                            type="text"
                            value={negativeSearchTerm}
                            onChange={(e) => setNegativeSearchTerm(e.target.value)}
                            placeholder="Search reviews..."
                        />
                        <div className={styles.searchResults}>
                            {negativeSearchResult.map((review, index) => (
                                <div key={index} className={styles.searchResult}>
                                    <p><strong>Review:</strong> {review.Summary}</p>
                                    <p><strong>User ID:</strong> {review.UserId}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.pieChart} ref={chartRef}>
                    {pieData && <Pie data={pieData} />}
                </div>

            </>
)}
        </div>
    );
};

export default ReviewAnalysis;
