import React, { useEffect, useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./good_detail.css";
import ProductSlider from "../slider";
import renderStars from "../../render_stars";
import { AuthContext } from "../../context/AuthContext"; // Import the AuthContext
import axiosInstance from "../../api";
import LoadingSpinner from "../loading_spinner";
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [newReview, setNewReview] = useState({ rating: "", text: "" });
  const { isLoggedIn } = useContext(AuthContext); // Get the logged-in status from context
  const navigate = useNavigate(); // Initialize navigate function

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate("/login"); // Redirect to login if not authenticated
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Token not found");
      return;
    }

    const productId = product.id;

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/cart/add_to_cart/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ product_id: productId, quantity: 1 }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      console.log("Item added to cart successfully");
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    // Перевірка, чи користувач авторизований
    if (!isLoggedIn) {
      navigate("/login"); // Перехід до сторінки логіну
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Token not found");
      return;
    }

    try {
      const response = await axiosInstance.post(
        "reviews/", // Вказуємо тільки частину URL, базовий URL вже вказаний у axiosInstance
        {
          ...newReview, // Розгортаємо стан поточного відгуку
          product: product.id, // Додаємо ID продукту
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Додаємо токен для авторизації
          },
        }
      );

      console.log("Review submitted successfully");
      // Скидаємо поля форми після успішної відправки
      setNewReview({ rating: "", text: "" });
      // Оновлюємо відгуки, запитавши деталі продукту
      fetchProductDetails();
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };
  console.log("xdxd", product);
  const groupAttributesByGroup = (attributes) => {
    const grouped = {};

    attributes.forEach((attribute) => {
      // Перевіряємо, чи є у атрибута група
      const groupName =
        attribute.group && attribute.group.name
          ? attribute.group.name
          : "Other";

      // Ініціалізація групи, якщо вона ще не існує
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }

      // Додаємо атрибут до відповідної групи
      grouped[groupName].push(attribute);
    });

    return grouped;
  };

  const fetchProductDetails = () => {
    fetch(`http://127.0.0.1:8000/api/v1/good/${slug}/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => setProduct(data))
      .catch((error) => console.error("Error fetching product:", error));
  };

  useEffect(() => {
    fetchProductDetails();
  }, [slug]);

  if (!product) {
   return (<LoadingSpinner/>);
  }
  const groupedAttributes = groupAttributesByGroup(product.attribute_values);

  console.log(product);
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

    return <div>{formatDate(dateString)}</div>;
  };

  console.log(product.images);
  return (
    <>
      <div className="product-detail">
        <div className="product-image">
          {product.images && product.images.length > 0 ? (
            <ProductSlider product={product} />
          ) : (
            <img src={product.image} alt={product.name} />
          )}
        </div>

        <div className="product-info">
          <div>
            {`${capitalizeFirstLetter(product.group)} > `}
            <Link to={`/category/${product.category_name}`}>
              {capitalizeFirstLetter(product.category_name)}
            </Link>
            {` > `}
            <Link
              to={`/category/${product.category_name}/${product.brand_name}`}
            >
              {capitalizeFirstLetter(product.brand_name)}{" "}
              {capitalizeFirstLetter(product.category_name)}
            </Link>
            {` > `}
            {capitalizeFirstLetter(product.name)}
          </div>
          <hr className="section-divider" />{" "}
          {/* Divider between breadcrumb and product name */}
          <h1 className="product-name">{product.name}</h1>
          <hr className="section-divider" />{" "}
          {/* Divider between product name and price */}
          <div className="price-info">
            <div>
              {product.price > 0 && product.quantity > 0 ? (
                <>
                  {product.price > 0 && (
                    <>
                      <span
                        className="original-price"
                        style={{
                          textDecoration: "line-through",
                          marginRight: "10px",
                        }}
                      >
                        {product.price}₴
                      </span>
                      <span className="sale-percent">{`${product.sale_percent}% off`}</span>
                    </>
                  )}

                  <span
                    className="discounted-price"
                    style={{ marginLeft: "10px", fontWeight: "bold" }}
                  >
                    {product.final_price}₴
                  </span>
                </>
              ): <p className="out-of-stock-detail">Out of stock</p>}
            </div>

            <button className="add-to-cart" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>

        {/* Reviews Section */}
      </div>
      <div className="attributes-description">
  <div className="attribute-values">
  
    <ul>  <h3>Specifications</h3>
      {Object.entries(groupedAttributes).map(
        ([groupName, attributes]) => {
          // Логування для перевірки значень
          console.log(`Group Name: ${groupName}`);

          return (
            <li key={groupName} className="attribute-group">
              <h2 className="group-attr">
                {capitalizeFirstLetter(groupName)}:
              </h2>
              <ul>
                {attributes.map((attribute, index) => (
                  <li key={index} className="attribute-item">
                    <span className="attribute-name">
                      {capitalizeFirstLetter(attribute.attribute.name)}:
                    </span>
                    <span className="attribute-value">
                      {attribute.value}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          );
        }
      )}
    </ul>
  </div>
  <div className="section-divider"></div> {/* Розділювач */}
  <div className="description">
    <h3>Description</h3>
    <p className="product-description">
      {product.description || "No description available."}
    </p>
  </div>
</div>

      <div className="reviews-container">
        <div className="reviews-section">
          <h2>Customer Reviews</h2>
          <form onSubmit={handleSubmitReview} className="review-form">
            <h3>Submit a Review</h3>
            <div>
              <label>
                <div className="rating-container">
                  <label>Rating:</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${
                          newReview.rating >= star ? "filled" : ""
                        }`}
                        onClick={() =>
                          handleReviewChange({
                            target: { name: "rating", value: star },
                          })
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </label>
            </div>
            <div>
              <label>
                Review:
                <textarea
                  name="text"
                  value={newReview.text}
                  onChange={handleReviewChange}
                  required
                />
              </label>
            </div>
            <button type="submit" className="submit-review">
              Submit Review
            </button>
          </form>
          {product.reviews.length > 0 ? (
            product.reviews.map((review) => (
              <div key={review.id} className="review-card">
                <h4 className="review-author">{review.author}</h4>
                <p className="review-date">
                  {<DateFormatComponent dateString={review.created_at} />}
                </p>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>

                <p className="review-text">{review.text}</p>
              </div>
            ))
          ) : (
            <p>No reviews available for this product.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default ProductDetail;
