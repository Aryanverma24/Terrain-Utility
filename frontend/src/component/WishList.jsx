import React, { useState } from "react";

const WishList = () => {
  const [items, setItems] = useState([]); // State to hold wishlist items
  const [inputValue, setInputValue] = useState(""); // State to hold input value

  const handleAddItem = (e) => {
    e.preventDefault(); // Prevent default form submission
    if (inputValue.trim()) {
      // Check if input is not empty
      setItems([...items, inputValue.trim()]); // Add new item to wishlist
      setInputValue(""); // Clear the input
    }
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index); // Remove item at index
    setItems(newItems); // Update the state
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">My Wish List</h1>
      <form onSubmit={handleAddItem} className="flex mb-4">
        <input
          type="text"
          placeholder="Add a new wish item..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-800"
        >
          Add
        </button>
      </form>
      {items.length === 0 ? (
        <p className="text-gray-500">Your wish list is empty.</p>
      ) : (
        <ul className="list-disc pl-5">
          {items.map((item, index) => (
            <li key={index} className="flex justify-between items-center mb-2">
              <span>{item}</span>
              <button
                onClick={() => handleRemoveItem(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WishList;
