// src/SearchBar.js
import React, { useState, useEffect } from "react";
import "./App.css"; 
import axios from "axios";
import { getImageUrl, getUrl } from "./Helper";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [types, setTypes] = useState([]);
  const [BrandName, setBrandName] = useState([]);
  const [lastCallTime, setLastCallTime] = useState(Date.now());

  async function access() {
    console.log("Accessing database")
    console.log(searchTerm)
    const response = await axios.post('https://kcui5--partselectsearch-home-dev.modal.run', {
        query: searchTerm
    })
    const results = response.data;
    console.log(results);

    setSuggestions(results.parts);
    setTypes(results.types);
    setBrandName(results.brandName);
  }

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      if (Date.now() - lastCallTime >= 100 && searchTerm.length > 0) {
        access();
        setLastCallTime(Date.now());
      }
    }, 1000);

    return () => clearTimeout(handle);
  }, [searchTerm]);
  
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
      {
        suggestions.length > 0 &&
        <div className="suggestions-dropdown">
            <h3>Available Parts</h3>
            <table>
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Part Number</th>
                  <th>Model Number</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map((item, index) => {
                  const [partnum, modelnum, name, manufacturer] = item.split('END');
                  return (
                    <tr key={index}>
                      <td>{partnum}</td>
                      <td>{modelnum}</td>
                      <td>{name}</td>
                      <td>{manufacturer}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </div>
      }
      {
        types.length > 0 &&
        <div className="suggestions-dropdown">
          <h3>Part Types</h3>
          <table>
            <thead>
              <tr>
                <th>{BrandName} Part Types</th>
              </tr>
            </thead>
            <tbody>
              {types.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      }
    </div>
  );
};

export default SearchBar;
