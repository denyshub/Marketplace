import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api';
import './profile.css';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/loading_spinner';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [editMode, setEditMode] = useState(false);  // Статус редагування
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  // Функція для отримання даних профілю
  const fetchUserData = async () => {
    try {
      // Отримуємо дані профілю за допомогою axiosInstance
      const userResponse = await axiosInstance.get('/profile/');
      const user = userResponse.data;
      setUserData(user[0]);
      setUsername(user[0].username);
      setPhoneNumber(user[0].phone_number);
      setEmail(user[0].email);

      // Отримуємо список замовлень
      const sortedOrders = user[0].orders?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || [];
      setOrders(sortedOrders);  // Важливо переконатися, що дані замовлень є
    } catch (error) {
      console.error("Error fetching user data or orders:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    // Повертаємось до початкових значень
    setUsername(userData?.username || '');
    setPhoneNumber(userData?.phone_number || '');
    setEmail(userData?.email || '');
  };

  const handleSave = async () => {
    try {
      const updatedData = { username, phone_number: phoneNumber, email };
      // Надсилаємо оновлені дані на сервер
      await axiosInstance.put('/profile/me/', updatedData);
      setUserData({ ...userData, ...updatedData });
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const DateFormatComponent = ({ dateString }) => {
    const formatDate = (dateStr) => {
      if (!dateStr) {
        return "Invalid date";
      }

      const dateObj = new Date(dateStr);

      if (isNaN(dateObj)) {
        return "Invalid date";
      }

      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();

      return `${day}.${month}.${year}`;
    };

    return (
      <div>
        {formatDate(dateString)}
      </div>
    );
  };

  if (!userData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="profile">
      <h2>Profile</h2>
      {editMode ? (
        <div>
          <label>Username:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
          <br />
          <label>Phone Number:</label>
          <input 
            type="text" 
            value={phoneNumber} 
            onChange={(e) => setPhoneNumber(e.target.value)} 
          />
          <br />
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <br />
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      ) : (
        <div>
          <div><strong>Username:</strong> {userData.username}</div>
          <div><strong>Phone Number:</strong> {userData.phone_number}</div>
          <div><strong>Email:</strong> {userData.email}</div>
          <button onClick={handleEdit}>Edit Profile</button>
        </div>
      )}

      <h3>Orders:</h3>
      <ul>
        {orders.length > 0 ? (
          orders.map((order) => (
            <li key={order.id}>
              <span>Order ID: {order.id}</span>
              <span> Date: <DateFormatComponent dateString={order.created_at} /></span>
              <span> Status: <p className="status-span">{order.status}</p></span>

              {/* Display products in the order */}
              <div>
                <strong>Products:</strong>
                <ul>
                  {order.order_items && order.order_items.length > 0 ? (
                    order.order_items.map((product, index) => (
                      <li key={product.id}>
                        <span>{index + 1}. <Link to={`/product/${product.product.slug}`}>{product.product.name}</Link></span>
                        <span> Quantity: {product.quantity}</span>
                        <span> Price: {product.product.final_price}</span>
                      </li>
                    ))
                  ) : (
                    <p>No products in this order.</p>
                  )}
                </ul>
              </div>
            </li>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </ul>
    </div>
  );
};

export default Profile;
