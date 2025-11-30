import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GoodsList from "../../components/goods_list/goods_list";

const CategoryBrandPage = () => {
  const { category_name, brand_name } = useParams(); // Extract the parameters from the URL




  return (
    <div>
      <GoodsList title={brand_name + " " +  category_name} filters={{category: category_name, brand:brand_name}} brand={brand_name} limit={25}   pagination='1'/>
    </div>
  );
};

export default CategoryBrandPage;
