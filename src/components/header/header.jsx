import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./header.css";
import { ReactComponent as CartIcon } from "../../icons/cart-white.svg";
import { ReactComponent as LogoutIcon } from "../../icons/logout.svg";
import { ReactComponent as ContactIcon } from "../../icons/phone.svg";
import { ReactComponent as ProfileIcon } from "../../icons/profile.svg";
import { ReactComponent as SearchIcon } from "../../icons/search.svg";
import { AuthContext } from "../../context/AuthContext";

const GlobalSearch = ({ isVisible, onSearchToggle }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/search/?q=${searchQuery}`); // Перенаправлення на сторінку пошуку
    }
  };

  if (!isVisible) return null; // Do not render search if not visible

  return (
    <form className="search-container" onSubmit={handleSearch}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="search-input"
      />
      <button type="submit" className="search-button">Go</button>
      <button type="button" onClick={onSearchToggle} className="close-button">Close</button>
    </form>
  );
};

const Header = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const [isSearchVisible, setSearchVisible] = useState(false); // State to manage search visibility

  const toggleSearch = () => {
    setSearchVisible((prev) => !prev); // Toggle search input visibility
  };

  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/" className="logo">
          <h1>MyStore</h1>
        </Link>
      </div>
      <nav className="nav">
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/" className="header-link">
              Catalog
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/sales" className="header-link">
              Sales
            </Link>
          </li>
        </ul>
      </nav>
      <div className="auth-buttons">
     
        <div className="nav-item"> 
          <button onClick={toggleSearch} className="search-toggle-button-nav">
            <SearchIcon/>
          </button>
        </div>
        
        <GlobalSearch isVisible={isSearchVisible} onSearchToggle={toggleSearch} />
        
        {/* <div className="nav-item">
          <Link to="/contact" className="header-link">
            <ContactIcon />
          </Link>
        </div> */}
        <GlobalSearch isVisible={isSearchVisible} onSearchToggle={toggleSearch} />
       
        <div className="nav-item">
          <Link to="/cart" className="header-link">
            <CartIcon />
          </Link>
        </div>
        {isLoggedIn ? (<>
          <div className="nav-item">
           <Link to="/profile" className="header-link">
           <ProfileIcon/>
           </Link>
         </div>
          <button onClick={logout} className="auth-button">
            <LogoutIcon />
          </button>   
        </>
     
        ) : (
          <>
            <Link to="/login" className="auth-button">
              Login
            </Link>
            <Link to="/register" className="auth-button">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
