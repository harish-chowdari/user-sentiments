import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Settings.module.css';

const Settings = () => {
  const userId = localStorage.getItem('userId');
  const [userData, setUserData] = useState(null);
  const [updatedUserData, setUpdatedUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    negativeReviewsLimit: 0,
    mailSent: false,

  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axios.get(`http://localhost:4003/api/user/${userId}`);
        setUserData(res.data.user);
        setUpdatedUserData(res.data.user);
      } catch (error) {
        setError('Error fetching user data');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      getData();
    } else {
      setError('User not found');
      setIsLoading(false);
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(
        `http://localhost:4003/api/edit-user/${userId}`,
        updatedUserData
      );
      
      if (res.data.AlreadyExist) {
        alert(res.data.AlreadyExist); 
      } else {
        setUserData(res.data.user); 
        setIsEditing(false);
      }
      console.log(res.data);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
    if (isEditing) {
      // Reset updatedUserData to userData when editing is canceled
      setUpdatedUserData(userData);
    }
  };

  // Handle loading and error states
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.settings}>
      <div className={styles.settingsHeader}>
        <h2>Account Settings</h2>
        <p>Manage your account information below.</p>
      </div>

      {userData && (
        <>
        <div className={styles.settingsContainer}>
        <div className={styles.settingsContainer1}>
          <div className={styles.settingsWrapper}>
            <label>First Name</label>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={updatedUserData.firstName}
                onChange={handleInputChange}
                className={styles.inputField}
              />
            ) : (
              <input
                type="text"
                name="firstName"
                value={updatedUserData.firstName}
                onChange={handleInputChange}
                className={styles.inputField}
                disabled
                style={{ cursor: 'not-allowed' }}
              />
            )}
          </div>

          <div className={styles.settingsWrapper}>
            <label>Last Name</label>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={updatedUserData.lastName}
                onChange={handleInputChange}
                className={styles.inputField}
              />
            ) : (
              <input
                type="text"
                name="lastName"
                value={updatedUserData.lastName}
                onChange={handleInputChange}
                className={styles.inputField}
                disabled
                style={{ cursor: 'not-allowed' }}
              />
            )}
          </div>

          <div className={styles.settingsWrapper}>
            <label>Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={updatedUserData.email}
                onChange={handleInputChange}
                className={styles.inputField}
              />
            ) : (
              <input
                type="email"
                name="email"
                value={updatedUserData.email}
                onChange={handleInputChange}
                className={styles.inputField}
                disabled
                style={{ cursor: 'not-allowed' }}
              />
            )}
          </div>

          </div>
          
          <div className={styles.settingsContainer2}>
          <div className={styles.settingsWrapper}>
            <label>Mobile</label>
            {isEditing ? (
              <input
                type="text"
                name="mobile"
                value={updatedUserData.mobile}
                onChange={handleInputChange}
                className={styles.inputField}
              />
            ) : (
              <input
                type="text"
                name="mobile"
                value={updatedUserData.mobile}
                onChange={handleInputChange}
                className={styles.inputField}
                disabled
                style={{ cursor: 'not-allowed' }}
              />
            )}
          </div>

          <div className={styles.settingsWrapper}>
            <label>Negative Reviews Limit</label>
            {isEditing ? (
              <input
                type="number"
                min={1}
                name="negativeReviewsLimit"
                value={updatedUserData.negativeReviewsLimit}
                onChange={handleInputChange}
                className={styles.inputField}
              />
            ) : (
              <input
                type="number"
                name="negativeReviewsLimit"
                
                value={updatedUserData.negativeReviewsLimit}
                onChange={handleInputChange}
                className={styles.inputField}
                disabled
                style={{ cursor: 'not-allowed' }}
              />
            )}
          </div>

          <div className={styles.settingsWrapper}>
            <label>Negative Reviews Count</label>
            {isEditing ? (
              <input
                type="number"
                name=" negativeReviewsCount"
                value={updatedUserData.negativeReviewsCount}
                onChange={handleInputChange}
                className={styles.inputField}
                disabled
                style={{ cursor: 'not-allowed' }}
              />
            ) : (
              <input
                type="number"
                name=" negativeReviewsCount"
                value={updatedUserData.negativeReviewsCount}
                onChange={handleInputChange}
                className={styles.inputField}
                disabled
                style={{ cursor: 'not-allowed' }}
              />
            )}
          </div>

          </div>
          </div>

          <div className={styles.buttons}>
            <button onClick={isEditing ? handleSave : handleEditToggle} className={isEditing ? styles.saveButton : styles.editButton}>
              {isEditing ? 'Save Changes' : 'Edit'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Settings;
