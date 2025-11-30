import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./good.css";
import { ReactComponent as CartIcon } from "../../icons/cart.svg";
import renderStars from "../../render_stars";
import axiosInstance from "../../api";

const Good = ({ id, slug, name, image, price, sale_percent, final_price, quantity, final_rating, reviews_count }) => {
  const [showPopup, setShowPopup] = useState(false); // Додаємо стан для спливаючого вікна

  // Форматування ціни
  const formatPrice = (price) => Math.round(price).toString();

  const handleAddToCart = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Token not found");
      return;
    }
  
    try {
      const response = await axiosInstance.post(
        "/cart/add_to_cart/",
        { product_id: id, quantity: 1 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        console.log("Item added to cart successfully");
        setShowPopup(true); // Відобразити спливаюче вікно після додавання
        setTimeout(() => setShowPopup(false), 3000); // Автоматично сховати через 3 секунди
      } else {
        throw new Error("Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };
  return (
    <div className="good-container" style={{ opacity: quantity > 0 ? 1 : 0.5 }}>
      <div className="code-image-container">
        <div className="code-container">
          <p className="code-text">Код: {id}</p>
        </div>
        <Link to={`/product/${slug}`}>
          <img src={image} alt={name} className="good-image" />
        </Link>
      </div>
      <div className="name-container">
        <Link to={`/product/${slug}`} className="good-name">
          {name}
        </Link>
        <div className="price-container">
          {sale_percent > 0 ? (
            <>
              <span className="original-price">{price} ₴</span>
              <span className="discounted-price">{formatPrice(final_price)} ₴</span>
              <span className="sale-percent"> -{sale_percent}%</span>
            </>
          ) : (
            <span className="price">{price} ₴</span>
          )}
        </div>
        {quantity === 0 && <div className="out-of-stock">Out of stock</div>}
        <div className="rating-container">
          <div className="stars">{renderStars(final_rating)}</div>
          <span className="reviews-count">({reviews_count})</span>
        </div>
      </div>
      <div className="good-cart-container">
        {quantity > 0 ? (
          <button className="add-to-cart-button" onClick={handleAddToCart}>
            <CartIcon />
          </button>
        ) : (
          <button className="add-to-cart-button" disabled>
            <CartIcon />
          </button>
        )}
      </div>

      {/* Спливаюче вікно після додавання продукту */}
      {showPopup && (
        <div className="popup">
          Товар успішно додано до кошика!
        </div>
      )}
    </div>
  );
};

export default Good;
