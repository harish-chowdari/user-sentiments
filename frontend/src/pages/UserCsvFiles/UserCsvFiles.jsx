import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./UserCsvFiles.module.css";

const UserCsvFiles = () => {
    const [files, setFiles] = useState([]);
    const [userId] = useState(localStorage.getItem("userId")); // Assuming userId is stored in localStorage

    // Fetch the list of files from the backend
    const getData = async () => {
        try{
            const res = await axios.get(`http://localhost:4003/api/user/${userId}`)
            setFiles(res.data.user.reviews);
            console.log(res.data.user.reviews);
        }
        
        catch(error){
            console.log(error);
        }
        
    }
    useEffect(() => {
        getData();  
              
    }, []);

    return (
        <div className={styles.container}>
            <h2>Your Uploaded Files History</h2>
            {files.length === 0 && <p>No CSV files found.</p>}
            
            <div className={styles.files}>
            {
                files.map((file, index) => (
                    <div className={styles.file} key={index}>
                        <a href={file}>{file}</a>
                        <button onClick={() => window.open(file)}>Download</button>
                    </div>
                ))
            }
            </div>
        </div>
    );
};

export default UserCsvFiles;
