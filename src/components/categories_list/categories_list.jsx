

  import React, { useEffect, useState } from "react";
  import "./categories_list.css"; // Import styles
  import { Link } from "react-router-dom";
  import LoadingSpinner from "../loading_spinner";
  const CategoriesList = ({ onSelectCategory }) => {
    const [groups, setGroups] = useState([]); // Initialize as empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const response = await fetch("http://127.0.0.1:8000/api/v1/group/");
          const data = await response.json();
          console.log("Received groups with categories:", data);
          if (Array.isArray(data)) {
            setGroups(data);
          } else {
            throw new Error("Data is not in array format.");
          }
          setLoading(false);
        } catch (error) {
          console.error("Error fetching categories:", error);
          setError("Failed to load categories.");
          setLoading(false);
        }
      };
  
      fetchCategories();
    }, []);
  
    if (loading) return (<LoadingSpinner/>);
    if (error) return <p>{error}</p>;
  
    return (
      <div className="categories-container">
        <h2>Groups</h2>
        <div className="group-section">
          {groups.map((group) => (
            <div key={group.id} className="group-name">
              <h3>{group.name}</h3>
              <ul className="categories-list">
                {group.categories.map((category) => (
                  <Link className="category-link" to={`/category/${category.name}`} key={category.id}>
                    <li onClick={() => onSelectCategory(category.id)}>
                      <div className="category-block">
                        <div
                          className="category-icon"
                          dangerouslySetInnerHTML={{ __html: category.icon_svg }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </li>
                  </Link>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default CategoriesList;
  


