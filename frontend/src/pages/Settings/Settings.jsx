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
          {['firstName', 'lastName', 'email', 'mobile'].map((field) => (
            <div className={styles.settingsWrapper} key={field}>
              <label>{field.charAt(0).toUpperCase() + field.slice(1).replace('Name', ' Name')}</label>
              {isEditing ? (
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  name={field}
                  value={updatedUserData[field]}
                  onChange={handleInputChange}
                  className={styles.inputField}
                />
              ) : (
                <p>{userData[field]}</p>
              )}
            </div>
          ))}

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