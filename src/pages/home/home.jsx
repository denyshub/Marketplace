import React from "react";
import CategoriesList from "../../components/categories_list/categories_list";
import "../home/home.css"; // Імпорт стилів
import GoodsList from "../../components/goods_list/goods_list";
import { useState } from "react";
import { useEffect } from "react";


  

const Home = () => {

    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    const handleSelectCategory = (categoryId) => {
        console.log("Selected Category ID:", categoryId);
        setSelectedCategoryId(categoryId); // Оновіть стан з ID категорії
        localStorage.setItem('selectedCategoryId', categoryId); // Зберігаємо categoryId, а не selectedCategoryId
    };

    const [id, setId] = useState(null); // Стан для зберігання id
     

    return (
        <div className="home-container">
         
            <main>
                <CategoriesList onSelectCategory={handleSelectCategory} id={id}/>
            </main>
            <div>
                <GoodsList title="TVs"  filters={{ category: "TVs" }} limit={4}/>
            </div>
            <div>
                <GoodsList title="Smartphones" filters={{ category: "Smartphones" }} limit={4} />
            </div>
            <div>
                <GoodsList title="Fridges" filters={{ category: "Fridges" }} limit={4} />
            </div>  

            
  
        </div>
    );
};

export default Home;