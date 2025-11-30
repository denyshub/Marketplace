import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Modal from "react-modal";
import "./cart.css";
import axiosInstance from "../../api";
import { ReactComponent as CartIcon } from "../../icons/cart.svg";
import { ReactComponent as RemoveIcon } from "../../icons/remove.svg";
import LoadingSpinner from "../loading_spinner";
Modal.setAppElement("#root"); // Set the app root for accessibility

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [profile, setProfile] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Стан для завантаження
  const formatPrice = (price) => Math.round(price).toString();

  useEffect(() => {
    fetchProfileData();
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setIsLoading(true); // Починаємо завантаження
      const response = await axiosInstance.get("/cart/");
      if (Array.isArray(response.data)) {
        setCartItems(response.data[0].items);
      } else {
        setCartItems([]);
        console.error("Expected an array but received:", response.data);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setIsLoading(false); // Завантаження завершено
    }
  };

  const fetchProfileData = async () => {
    try {
      const response = await axiosInstance.get("/profile/");
      if (response) {
        setProfile(response.data[0]);
        setEmail(response.data[0].email);
        setPhone(response.data[0].phone_number);
      } else {
        setProfile("");
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const handleAddItem = async (productId) => {
    try {
      await axiosInstance.post("/cart/add-to-cart/", {
        product_id: productId,
        quantity: 1,
      });
      fetchCartItems();
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await axiosInstance.delete("/cart/remove_from_cart/", {
        data: { cart_item_id: cartItemId },
      });
      fetchCartItems();
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const handleUpdateQuantity = async (cartItemId, quantity) => {
    try {
      await axiosInstance.put("/cart/update_cart_item/", {
        cart_item_id: cartItemId,
        quantity,
      });
      fetchCartItems();
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setErrorMessage("");
  };
  const closeModal = () => setIsModalOpen(false);

  const handleOrder = async () => {
    try {
      const response = await axiosInstance.post("/orders/", {
        email,
        phone,
        cartItems,
      });
      closeModal();
      setCartItems([]);
      setIsOrderConfirmed(true);
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.detail || "Щось пішло не так.");
      } else {
        setErrorMessage("Помилка при оформленні замовлення.");
      }
    }
  };

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {isLoading ? ( // Якщо дані ще завантажуються, показуємо індикатор
          <LoadingSpinner/>
      ) : cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="code-image-container">
                <div className="code-container">
                  <p className="code-text">Код: {item.product_id}</p>
                </div>
                <Link to={`/product/${item.product.slug}`}>
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="good-image"
                  />
                </Link>
              </div>
              <div className="name-container">
                <Link
                  to={`/product/${item.product.slug}`}
                  className="good-name"
                >
                  {item.product.name}
                </Link>
                <div className="price-container">
                  {item.product.sale_percent > 0 ? (
                    <>
                      <span className="original-price">
                        {item.product.price} ₴
                      </span>
                      <span className="discounted-price">
                        {formatPrice(item.product.final_price)} ₴
                      </span>
                      <span className="sale-percent">
                        {" "}
                        -{item.product.sale_percent}%
                      </span>
                    </>
                  ) : (
                    <span className="price">{item.product.price} ₴</span>
                  )}
                </div>
                <div className="quantity-container">
                  <button
                    onClick={() =>
                      handleUpdateQuantity(
                        item.id,
                        Math.max(item.quantity - 1, 1)
                      )
                    }
                    className="quantity-button"
                    disabled={item.quantity === 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity + 1)
                    }
                    className="quantity-button"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                className="remove-button"
                onClick={() => handleRemoveItem(item.id)}
              >
                <RemoveIcon className="remove-icon" />
              </button>
            </div>
          ))}
          <div className="total">
            Total:{" "}
            {cartItems.reduce(
              (total, item) => total + item.product.final_price * item.quantity,
              0
            )}{" "}
            ₴
            <button className="order-btn" onClick={openModal}>
              Place order
            </button>
          </div>
        </div>
      )}

      {/* Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Place Order"
        className="order-modal"
        overlayClassName="order-modal-overlay"
      >
        <h2>Place Order</h2>
        <div className="order-details">
          <h3>Products:</h3>
          <ul className="goods-list">
            <li className="order-line-title">
              <div className="order-column">№</div>
              <div className="order-column">Name</div>
              <div className="order-column">Quantity</div>
              <div className="order-column">Price</div>
            </li>
            {cartItems.map((item, index) => (
              <li className="order-line" key={item.id}>
                <div className="order-column">{index + 1}</div>
                <div className="order-column">
                  <Link to={`/product/${item.product.slug}`}>
                    {item.product.name}
                  </Link>
                </div>
                <div className="order-column">{item.quantity}</div>
                <div className="order-column">
                  {formatPrice(item.product.final_price * item.quantity)} ₴
                </div>
              </li>
            ))}
          </ul>
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="inputs-container-order">
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="order-input"
            />
          </label>
          <label>
            Phone Number:
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="order-input"
            />
          </label>
        </div>

        <button onClick={handleOrder} className="confirm-order-btn">
          Confirm Order
        </button>
        <button onClick={closeModal} className="cancel-btn">
          Close
        </button>
      </Modal>

      {isOrderConfirmed && (
        <div className="order-confirmation">
          <h3>Order placed successfully!</h3>
        </div>
      )}
    </div>
  );
};

export default Cart;
