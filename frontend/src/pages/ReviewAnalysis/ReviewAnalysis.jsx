import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaSun, FaMoon } from "react-icons/fa";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import styles from "./ReviewAnalysis.module.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';




const ReviewAnalysis = () => {


const [sentimentData, setSentimentData] = useState({});
    const [copiedLink, setCopiedLink] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [file, setFile] = useState(null);
    const [reviewData, setReviewData] = useState([]);
    const [negativeReviewsCount, setNegativeReviewsCount] = useState(0);
    const [pieChartData, setPieChartData] = useState(null);
    const [barChartData, setBarChartData] = useState(null);
    const [reviewsCount, setReviewsCount] = useState(0);
    const [theme, setTheme] = useState("light");
    const [postiveSearchTerm, setPostiveSearchTerm] = useState("");
    const [positiveSearchResult, setPostiveSearchResult] = useState([]);
    const [negativeSearchTerm, setNegativeSearchTerm] = useState("");
    const [negativeSearchResult, setNegativeSearchResult] = useState([]);
    const [neutralSearchTerm, setNeutralSearchTerm] = useState("");
    const [neutralSearchResult, setNeutralSearchResult] = useState([]);
    const chartRef = useRef(null);


    
        
        // Add other products as needed...
      
      
      const processData = (data) => {
        return Object.keys(data).map((productId) => ({
          productId,
          Positive: data[productId].Positive,
          Negative: data[productId].Negative,
          Neutral: data[productId].Neutral,
        }));
      };
      const chartData = processData(sentimentData);


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
                console.log(response.data.reviews);
                console.log(response.data.reviews.product_sentiment_counts);
                setSentimentData(response.data.reviews.product_sentiment_counts);
                setReviewData(response.data.reviews.reviews);
                setPieChartData(response.data.reviews.sentiment_counts);
                setReviewsCount(response.data.reviews.total_reviews);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    

    useEffect(() => {
        if (pieChartData) {
            setBarChartData({
                labels: reviewData.map((_, index) => `Review ${index + 1}`),
                datasets: [
                    {
                        label: 'Positive Reviews',
                        backgroundColor: '#66b3ff',
                        data: reviewData.map(review => review.Sentiment_Label === 'Positive' ? 1 : 0),
                    },
                    {
                        label: 'Negative Reviews',
                        backgroundColor: '#ff6666',
                        data: reviewData.map(review => review.Sentiment_Label === 'Negative' ? 1 : 0),
                    },
                    {
                        label: 'Neutral Reviews',
                        backgroundColor: '#ffcc99',
                        data: reviewData.map(review => review.Sentiment_Label === 'Neutral' ? 1 : 0),
                    },
                ],
            });
        }
    }, [reviewData, pieChartData]);

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

    useEffect(() => {
        const positiveReviews = reviewData.filter(
            (review) => review.Sentiment_Label === "Positive"
        );

        const negativeReviews = reviewData.filter(
            (review) => review.Sentiment_Label === "Negative"
        );

        const neutralReviews = reviewData.filter(
            (review) => review.Sentiment_Label === "Neutral"
        );

        setPostiveSearchResult(
            positiveReviews.filter((review) =>
                review.Summary.toLowerCase().includes(postiveSearchTerm.toLowerCase())
            )
        );
        
        setNegativeSearchResult(
            negativeReviews.filter((review) =>
                review.Summary.toLowerCase().includes(negativeSearchTerm.toLowerCase())
            )
        );
        
        setNeutralSearchResult(
            neutralReviews.filter((review) =>
                review.Summary.toLowerCase().includes(neutralSearchTerm.toLowerCase())
            )
        );
    }, [postiveSearchTerm, negativeSearchTerm, neutralSearchTerm, reviewData]);

    const negativeReviews = reviewData.filter(
        (review) => review.Sentiment_Label === "Negative"
    );
    
    const generatePdf = () => {
        const doc = new jsPDF();
        
        // Capture the Pie chart
        html2canvas(chartRef.current).then((canvas) => {
            const pieChartImgData = canvas.toDataURL("image/png");
            doc.addImage(pieChartImgData, 'PNG', 10, 10, 190, 90); // Adjust dimensions as needed
    
            if (pieChartData) {
                const positivePercentage = ((pieChartData.Positive / reviewsCount) * 100).toFixed(2);
                const negativePercentage = ((pieChartData.Negative / reviewsCount) * 100).toFixed(2);
                const neutralPercentage = ((pieChartData.Neutral / reviewsCount) * 100).toFixed(2);
    
                doc.setFontSize(12);
                doc.text(`Positive: ${positivePercentage}%`, 10, 100);
                doc.text(`Negative: ${negativePercentage}%`, 10, 110);
                doc.text(`Neutral: ${neutralPercentage}%`, 10, 120);
            }
    
            // Capture the Bar chart from the ResponsiveContainer
            html2canvas(document.querySelector('.recharts-responsive-container')).then((canvas) => {
                const barChartImgData = canvas.toDataURL("image/png");
                doc.addImage(barChartImgData, 'PNG', 10, 130, 190, 90); // Adjust dimensions as needed
    
                // Add sentiment data (positive, negative, neutral) in the PDF
                doc.setFontSize(12);
                doc.text("", 10, 220);
    
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
    
                addReviewsToPdf("Positive Reviews", positiveSearchResult);
                addReviewsToPdf("Negative Reviews", negativeSearchResult);
                addReviewsToPdf("Neutral Reviews", neutralSearchResult);
    
                const pdfBlob = doc.output('blob');
                const pdfUrl = URL.createObjectURL(pdfBlob);
                
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
                .then((res) => {
                    alert("Backup successful");
                    setCopiedLink(res.data.fileUrl);
                    
                setIsCopied(true);
                })
                .catch((error) => {
                    console.error("Error uploading PDF:", error);
                });
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
                        {isCopied && <button onClick={handleCopy} className={`${styles.shareButton} ${styles[`${theme}Button`]}`}>Share </button>}
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

                <div className={styles.pieChartSection}>
                    <div className={styles.pieChart} ref={chartRef}>
                    <h3>Sentiment Distribution</h3>
                        {pieData && <Pie data={pieData} />}
                    </div>
                    {console.log(chartData)}
                   
                    <ResponsiveContainer width="30%" height={400}>
                    <h3>Product Sentiment Distribution</h3>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="productId" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Positive" stackId="a" fill="#82ca9d" />
                        <Bar dataKey="Negative" stackId="a" fill="#ff7f7f" />
                        <Bar dataKey="Neutral" stackId="a" fill="#d0d0d0" />
                    </BarChart>
                    </ResponsiveContainer>

                    </div>
                </>
            )}
        </div>
    );
};

export default ReviewAnalysis;