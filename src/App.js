import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import GoodsList from './components/goods_list/goods_list';
import Header from './components/header/header';
import Home from './pages/home/home';
import Login from './pages/login_page/login_page';
import Register from './pages/register_page/register_page';
import ProductDetail from './components/good_detail/good_detail';
import Sales from './pages/sales/sales';
import Cart from './components/cart/cart';
import { useNavigate } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import { useEffect, useState } from 'react';
import './App.css'
import CategoryBrandPage from './pages/category_brand_page/category_brand_page';
import Profile from './pages/profile/profile';
import SearchResults from './components/search_results/search_results';
const CategoryPage = () => {
  const { slug } = useParams(); // Отримуємо slug з URL
  const [id, setId] = useState(null); // Стан для зберігання id
   
  useEffect(() => {
      // Отримуємо slug з Local Storage
      const storedId = localStorage.getItem('selectedCategoryId');
      setId(storedId); // Перетворюємо на число, якщо не null
  }, [slug]); // Виконуємо цей ефект при зміні slug

  return (<>  {id && <GoodsList title={slug} filters={{ category: slug }} limit={25} all='1' isFilter='1' id={id} pagination='1'/>}
  </>
  
     
  );
};





function App() {
  return (
    <Router>
       <AuthProvider>

      
        <Header/>
 
        <Routes>
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/search" element={<SearchResults />} />
          <Route path="/" element={<Home />} />          
         <Route path='/login' element={<Login />}/>
         <Route path='/register' element={<Register />}/>
         <Route path='/cart' element={<Cart />}/>
         <Route path='/sales' element={<Sales />}/>
         <Route 
          path="/category/:category_name/:brand_name" 
          element={<CategoryBrandPage />} 
        />
            <Route path='/profile' element={<Profile />}/>
        </Routes>
        </AuthProvider>
    </Router>
  );
}

export default App;
