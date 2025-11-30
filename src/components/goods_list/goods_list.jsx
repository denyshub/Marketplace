import React, { useEffect, useState } from "react";
import Good from "../good/good";
import "./goods_list.css";
import Filter from "../filter/filter";
import { Link } from "react-router-dom";
import LoadingSpinner from "../loading_spinner";


const GoodsList = React.memo(
  ({
    title,
    filters: initialFilters,
    isFilter = false,
    limit,
    all,
    id,
    pagination,
    brand
    
  }) => {
    const [goods, setGoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState(initialFilters || {});
    const [gotFilters, setGotFilters] = useState(false);
    const [attributes, setAttributes] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
 

    useEffect(() => {
      fetchGoods();
      if (filters.category) {
        fetchAttributes(filters.category);
      }
    }, [filters, gotFilters, page]);

    const fetchGoods = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          ...filters,
          limit: Number(limit),
          page,
    
        }).toString();
        console.log('query:',query)
        const url = all
          ? `http://127.0.0.1:8000/api/v1/good/all/?${
              gotFilters ? gotFilters : query
            }`
          : `http://127.0.0.1:8000/api/v1/good/?${
              gotFilters ? gotFilters : query
            }`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setGoods(data.results);
        setTotalPages(Math.ceil(data.count / limit));
      } catch (error) {
        setError(error.message);
        console.error("Error fetching goods:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAttributes = async (categoryId) => {
      const isOnHomePage = window.location.pathname === "/";

      if (isOnHomePage) {
        return;
      }
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/v1/attribute/?category=${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch attributes");
        }

        const data = await response.json();
        setAttributes(data);
      } catch (error) {
        console.error("Error fetching attributes:", error);
      }
    };


    if (loading) return (<LoadingSpinner/>);
    if (error) return <p>Помилка: {error}</p>;

    return (
      <div className="full-goods-page">
        <div className="filters-title">
          {isFilter && (
            <Filter
              onFilter={(filters) => {
                setGotFilters(filters);
                setFilters(filters);
                setPage(1); // Reset to first page after filtering
              }}
              attributes={attributes}
              category={title}
              brand={brand}
            />
          )}
        </div>

        <div className="goods-aligner">
          <div className="list-title-container">
            <h2>{title}</h2>
            
           
          </div>
          <div className="goods-container">
            {goods.length > 0 ? (
              goods.map((good) => (
                <Good
                  key={good.id}
                  id={good.id}
                  slug={good.slug}
                  image={good.image}
                  name={good.name}
                  price={good.price}
                  sale_percent={good.sale_percent}
                  final_price={good.final_price}
                  quantity={good.quantity}
                  final_rating = {good.final_rating}
                  reviews_count = {good.reviews_count}
                />
              ))
            ) : (
              <p>Товари не знайдено.</p>
            )}
          </div>
          {pagination && totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="pagination-button"
              >
                &laquo;
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setPage(index + 1)}
                  className={`pagination-button ${
                    page === index + 1 ? "active" : ""
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="pagination-button"
              >
                &raquo;
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default GoodsList;
