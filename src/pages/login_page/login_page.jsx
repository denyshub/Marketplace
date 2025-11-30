import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './login_page.css';
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState(''); // Зберігає номер телефону
  const [password, setPassword] = useState(''); // Зберігає пароль
  const [error, setError] = useState(''); // Зберігає повідомлення про помилку
  const { login } = useContext(AuthContext); // Отримує функцію login з AuthContext
  const navigate = useNavigate(); // Хук для навігації

  const handleSubmit = async (e) => {
    e.preventDefault(); // Запобігає перезавантаженню сторінки
    setError(''); // Очищує попередні помилки

    try {
      // Відправляє запит на авторизацію
      const response = await fetch('http://127.0.0.1:8000/api/v1/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phoneNumber, password }), // Відправляє номер телефону та пароль
      });

      // Перевіряє статус відповіді
      if (!response.ok) {
        const errorData = await response.json(); // Парсить помилку
        const errorMessage = errorData.detail || 'Incorrect login or password'; // Відображає конкретну помилку
        throw new Error(errorMessage);
      }

      const data = await response.json(); // Парсить токени
      console.log('Tokens:', data);

      // Зберігає токени у локальному сховищі
      localStorage.setItem('accessToken', data.access); 
      localStorage.setItem('refreshToken', data.refresh); 

      // Викликає функцію login з контексту для оновлення стану авторизації
      login();

      // Переходить на головну сторінку
      navigate('/'); 
    } catch (err) {
      setError(err.message); // Встановлює повідомлення про помилку
    }
  };

  return (
    <div className="login-container__unique">
      <h2 className="login-title__unique">Login</h2>
      <form onSubmit={handleSubmit} className="login-form__unique">
        {error && <p className="error-message__unique">{error}</p>}
        
        <div className="form-group__unique">
          <label htmlFor="phoneNumber" className="form-label__unique">Phone Number:</label>
          <input
            type="text"
            id="phoneNumber"
            className="form-input__unique"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>

        <div className="form-group__unique">
          <label htmlFor="password" className="form-label__unique">Password:</label>
          <input
            type="password"
            id="password"
            className="form-input__unique"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-button__unique">Login</button>
      </form>
    </div>
  );
};

export default Login;
