import { useState } from "react";

interface SearchBarProps {
  onResults?: (data: unknown) => void;
}

export default function SearchBar({ onResults }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      if (onResults) onResults([]);

      const response = await fetch(
        `http://localhost:3000/api/clinic/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      console.log("Search results:", data);

      if (onResults) onResults(data);
    } catch (err) {
      console.error("Search error:", err);
      // You might want to show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row w-full max-w-4xl mx-auto mt-8 gap-4 justify-center px-4">
      {/* Search Input Container */}
      <div className="relative w-full sm:flex-1">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 text-gray-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
            />
          </svg>
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for clinics, doctors, specialties..."
          className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 
                     bg-white shadow-sm focus:ring-2 focus:ring-blue-500 
                     focus:border-transparent outline-none transition-all 
                     duration-300 placeholder-gray-500 text-gray-900
                     hover:border-gray-300 hover:shadow-md
                     focus:shadow-lg font-medium"
          disabled={loading}
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-3 flex items-center 
                       text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={loading || !query.trim()}
        className={`h-12 px-8 rounded-xl font-semibold transition-all 
                   duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 
                   focus:ring-blue-500 min-w-[120px] flex items-center justify-center
                   ${
                     loading || !query.trim()
                       ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                       : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:scale-98 transform shadow-md"
                   }`}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Searching...
          </>
        ) : (
          "Search"
        )}
      </button>
    </div>
  );
}