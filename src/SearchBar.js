// src/SearchBar.js
import React, { useState, useEffect } from "react";
import "./App.css"; 
import axios from "axios";
import { getImageUrl, getUrl } from "./Helper";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
  };    
  
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(`Searching for: ${searchTerm}`);
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search Here..."
          value={searchTerm}
          onChange={handleSearchChange}
        />

        <button type="submit">
          {!isLoading ? "Search" : <div>Loading...</div>}
          {error && <div>{error}</div>}
        </button>
      </form>

        {/* <div className="suggestions-dropdown">
          Show Search Results here...
        </div> */}

    </div>
  );
};

export default SearchBar;
