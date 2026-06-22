/**
 * SearchBar.jsx
 * Debounced search input for filtering employees.
 */

import { useState, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";

const SearchBar = ({ onSearch, placeholder = "Search employees...", initialValue = "" }) => {
  const [value, setValue] = useState(initialValue);

  // Debounce search — trigger after 400ms pause in typing
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 400);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <div className="search-bar">
      <FiSearch className="search-bar__icon" size={18} />
      <input
        type="text"
        className="search-bar__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        id="employee-search"
        aria-label="Search employees"
      />
      {value && (
        <button
          className="search-bar__clear"
          onClick={handleClear}
          aria-label="Clear search"
          title="Clear search"
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
