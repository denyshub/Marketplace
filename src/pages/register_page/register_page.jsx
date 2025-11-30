import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../login_page/login_page.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState(''); // Додано стан для email
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/users/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username,
          phone_number: phoneNumber, 
          email, // Додано email
          password, 
          confirm_password: confirmPassword 
        }),
      });

      if (!response.ok) {
        throw new Error('Помилка при реєстрації');
      }

      const data = await response.json();
      console.log('Користувач створено:', data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container__unique">
      <h2 className="login-title__unique">Register</h2>
      <form onSubmit={handleSubmit} className="login-form__unique">
        {error && <p className="error-message__unique">{error}</p>}
        
        <div className="form-group__unique">
          <label htmlFor="username" className="form-label__unique">Username:</label>
          <input
            type="text"
            id="username"
            className="form-input__unique"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group__unique">
          <label htmlFor="phone_number" className="form-label__unique">Phone Number:</label>
          <input
            type="text"
            id="phone_number"
            className="form-input__unique"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group__unique">
          <label htmlFor="email" className="form-label__unique">Email:</label> {/* Додано поле email */}
          <input
            type="email"
            id="email"
            className="form-input__unique"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        
        <div className="form-group__unique">
          <label htmlFor="confirm_password" className="form-label__unique">Confirm Password:</label>
          <input
            type="password"
            id="confirm_password"
            className="form-input__unique"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-button__unique">Register</button>
      </form>
    </div>
  );
};

export default Register;
