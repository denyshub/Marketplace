import React, { useState, useEffect, useRef } from "react";
import "./filter.css";

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}



const Filter = ({ attributes, category, onFilter, brand }) => {
  const [attributeValues, setAttributeValues] = useState({});
  const [brands, setBrands] = useState([]);
  const [filterValues, setFilterValues] = useState({
    category: category,
    min_price: "",
    max_price: "",
    brand: brand || ''
  });
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [selectedBrands, setSelectedBrands] = useState(brand ? [brand] : []);
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filterContainerRef = useRef(null);

  const scrollToTop = () => {
    if (filterContainerRef.current) {
      filterContainerRef.current.scrollTop = 0;
    }
  };

  // Функція для парсингу URL параметрів при завантаженні
  const parseUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    const newSelectedAttributes = {};
    const newSelectedBrands = [];
    let newSortOption = "";
    let newFilterValues = {
      category: category,
      min_price: "",
      max_price: "",
      brand: brand || ''
    };

    // Парсимо параметри
    params.forEach((value, key) => {
      if (key === 'sort') {
        newSortOption = value;
      } else if (key === 'brand') {
        newSelectedBrands.push(...value.split(','));
      } else if (key === 'min_price' || key === 'max_price') {
        newFilterValues[key] = value;
      } else {
        // Шукаємо відповідний атрибут
        const attribute = attributes.find(attr => 
          attr.name.replace(/\s+/g, "_").toLowerCase() === key
        );
        if (attribute) {
          newSelectedAttributes[attribute.id] = value.split(',');
        }
      }
    });

    // Встановлюємо стани
    setSelectedAttributes(newSelectedAttributes);
    setSelectedBrands(newSelectedBrands);
    setSortOption(newSortOption);
    setFilterValues(newFilterValues);
  };

  useEffect(() => {
    const fetchFilterData = async () => {
      setLoading(true);
      setError(null);
      try {
        const valuesResponse = await fetch(
          `http://127.0.0.1:8000/api/v1/attribute-values/?category=${category}`
        );
        if (!valuesResponse.ok) throw new Error("Failed to fetch attribute values");
        const valuesData = await valuesResponse.json();

        const grouped = groupAttributesByGroup(valuesData);
        setAttributeValues(grouped);

        const brandsResponse = await fetch(
          `http://127.0.0.1:8000/api/v1/brand/?category=${category}`
        );
        if (!brandsResponse.ok) throw new Error("Failed to fetch brands");
        const brandsData = await brandsResponse.json();
        setBrands(brandsData);

        // Парсимо URL параметри після отримання даних
        parseUrlParams();
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterData();
  }, [category]);

  const groupAttributesByGroup = (attributes) => {
    const grouped = {};
    attributes.forEach((attribute) => {
      const groupName = attribute.group?.name || "Other";
      if (!grouped[groupName]) {
        grouped[groupName] = {};
      }
      const uniqueKey = attribute.attribute.name;
      if (!grouped[groupName][uniqueKey]) {
        grouped[groupName][uniqueKey] = {
          id: attribute.attribute.id,
          name: attribute.attribute.name,
          values: new Set(),
        };
      }
      grouped[groupName][uniqueKey].values.add(attribute.value);
    });

    const result = {};
    Object.keys(grouped).forEach((group) => {
      result[group] = Object.values(grouped[group]).map((attr) => ({
        ...attr,
        values: Array.from(attr.values).sort(),
      }));
    });
    return result;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilterValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (attributeId, value) => {
    setSelectedAttributes((prev) => {
      const currentValues = prev[attributeId] || [];
      const newValues = currentValues.includes(value.toString())
        ? currentValues.filter((v) => v !== value.toString())
        : [...currentValues, value.toString()];
      
      const updatedAttributes = { 
        ...prev, 
        [attributeId]: newValues 
      };

      // Якщо масив порожній, видаляємо ключ
      if (newValues.length === 0) {
        delete updatedAttributes[attributeId];
      }

      return updatedAttributes;
    });
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) => {
      if (prev.includes(brand)) {
        return prev.filter((b) => b !== brand);
      } else {
        return [...prev, brand];
      }
    });
  };

  const attributeNameMap = {};
  attributes.forEach((attribute) => {
    attributeNameMap[attribute.id] = attribute.name;
  });

  const handleApplyFilter = () => {
    const filters = { ...filterValues };
    const queryParams = new URLSearchParams();

    // Додаємо базові фільтри
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });

    // Додаємо атрибути
    Object.entries(selectedAttributes).forEach(([attributeId, values]) => {
      if (values && values.length > 0) {
        const attributeName = attributeNameMap[attributeId];
        if (attributeName) {
          const formattedAttributeName = attributeName
            .replace(/\s+/g, "_")
            .toLowerCase();
          const valueString = values.join(",");
          queryParams.append(formattedAttributeName, valueString);
        }
      }
    });

    // Додаємо бренди
    if (selectedBrands.length > 0) {
      queryParams.append("brand", selectedBrands.join(","));
    }

    // Додаємо сортування
    if (sortOption) {
      queryParams.append("sort", sortOption);
    }

    // Оновлюємо URL
    const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
    window.history.pushState({}, '', newUrl);

    // Викликаємо функцію фільтрації
    onFilter(queryParams.toString());
  };

  const handleReset = () => {
    setFilterValues({
      category: category,
      min_price: "",
      max_price: "",
    });
    setSelectedAttributes({});
    setSelectedBrands([]);
    setSortOption("");
    
    // Очищаємо URL параметри
    window.history.pushState({}, '', `${window.location.pathname}?category=${category}`);
    
    onFilter(`category=${category}`);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  return (
    <div className="filter-container" ref={filterContainerRef}>
      <h2 className="filter-title">Filters</h2>
      <div className="flex justify-between mt-4">
        <button onClick={handleApplyFilter} className="filter-button">
          Apply Filters
        </button>
        <button onClick={handleReset} className="filter-button">
          Reset
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      <div className="space-y-4">
        {/* Brand Filter */}
        <div className="filter-group">
          <label className="filter-label">Brand</label>
          <div className="mt-2 space-y-1">
            {brands.map((brand) => (
              <div key={brand.id} className="attribute-item-filter">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.name)}
                  onChange={() => handleBrandChange(brand.name)}
                />
                <span className="attribute-name">
                  {capitalizeFirstLetter(brand.name)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="filter-label">Sort By</label>
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="filter-input"
            >
              <option value="">None</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popularity">By Popularity</option>
            </select>
          </div>
        </div>
        {/* Price Range Filters */}
        <div className="filter-group">
          <label className="filter-label">Price Range</label>
          <div className="flex">
            <input
              type="number"
              name="min_price"
              value={filterValues.min_price}
              onChange={handleInputChange}
              placeholder="Min"
              className="filter-input"
            />
            <span>-</span>
            <input
              type="number"
              name="max_price"
              value={filterValues.max_price}
              onChange={handleInputChange}
              placeholder="Max"
              className="filter-input"
            />
          </div>
        </div>

        {/* Attribute Filters */}
        {Object.entries(attributeValues).map(([groupName, attrs]) => (
          <div key={groupName} className="filter-attribute">
            <h4 className="filter-label">{capitalizeFirstLetter(groupName)}</h4>
            <div className="mt-2 space-y-1">
              {attrs.length > 0 ? (
                attrs.map((attribute) => (
                  <div className="attr-cont" key={attribute.id}>
                    <label className="filter-sublabel">
                      {capitalizeFirstLetter(attribute.name)}
                    </label>
                    <div className="mt-2 space-y-1">
                      {attribute.values.map((value) => (
                        <div className="attribute-item-filter" key={value}>
                          <input
                            type="checkbox"
                            onChange={() =>
                              handleCheckboxChange(attribute.id, value)
                            }
                            checked={selectedAttributes[attribute.id]?.includes(
                              value.toString()
                            )}
                          />
                          <span className="attribute-name">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p>No attributes found</p>
              )}
            </div>
          </div>
        ))}
    <button className="filter-button" onClick={scrollToTop}>To top ↑</button>
      </div>
    </div>
  );
};

export default Filter;
