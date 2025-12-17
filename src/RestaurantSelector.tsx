import React, { useState, useRef } from 'react';
import YelpStars from './YelpStars';

interface Restaurant {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  location: {
    address1: string;
    city: string;
    state?: string;
    zip_code?: string;
  };
  categories: Array<{ title: string }>;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  image_url?: string;
  url?: string;
}

interface AutocompleteSuggestion {
  text: string;
}

interface RestaurantSelectorProps {
  onRestaurantSelect: (restaurant: Restaurant) => void;
  onClose: () => void;
}

const RestaurantSelector: React.FC<RestaurantSelectorProps> = ({ onRestaurantSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);

  // Yelp API functions
  const yelpApiCall = async (endpoint: string, params: Record<string, string>) => {
    const YELP_API_KEY = import.meta.env.VITE_YELP_API_KEY;
    if (!YELP_API_KEY) {
      throw new Error('Yelp API key not found. Please set VITE_YELP_API_KEY as an environment variable.');
    }

    const url = new URL(`https://api.yelp.com/v3/${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    console.log('Making Yelp API call to:', url.toString());
    console.log('API Key present:', !!YELP_API_KEY);

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${YELP_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error response:', errorText);
      throw new Error(`Yelp API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    return data;
  };

  const getAutocompleteSuggestions = async (text: string) => {
    const params: Record<string, string> = { text };
    // Add location if specified
    if (locationTerm.trim()) {
      params.location = locationTerm.trim();
    }
    return yelpApiCall('autocomplete', params);
  };

  const searchBusinesses = async (term: string) => {
    const params: Record<string, string> = {
      term,
      limit: '10',
      sort_by: 'best_match'
    };

    // Use location term if provided, otherwise search broadly
    if (locationTerm.trim()) {
      params.location = locationTerm.trim();
    } else {
      // Default to a major city if no location specified
      params.location = 'New York';
    }

    return yelpApiCall('businesses/search', params);
  };

  // Debounced autocomplete search
  const handleSearchInput = (value: string) => {
    setSearchTerm(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length >= 2) {
      setShowSuggestions(true);
      // Debounce autocomplete requests
      searchTimeoutRef.current = window.setTimeout(async () => {
        try {
          const data = await getAutocompleteSuggestions(value);
          setSuggestions(data.terms || []);
        } catch (error) {
          console.error('Autocomplete error:', error);
          setSuggestions([]);
        }
      }, 300);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // Perform business search
  const searchRestaurants = async (term: string) => {
    if (!term.trim()) return;

    setLoading(true);
    setShowSuggestions(false);

    try {
      const data = await searchBusinesses(term);

      const formattedRestaurants: Restaurant[] = data.businesses.map((business: any) => ({
        id: business.id,
        name: business.name,
        rating: business.rating,
        review_count: business.review_count,
        location: {
          address1: business.location?.address1 || '',
          city: business.location?.city || '',
          state: business.location?.state,
          zip_code: business.location?.zip_code
        },
        categories: business.categories || [],
        coordinates: business.coordinates,
        image_url: business.image_url,
        url: business.url
      }));

      setRestaurants(formattedRestaurants);
    } catch (error) {
      console.error('Error searching restaurants:', error);
      // Fallback to mock data if API fails
      setRestaurants([
        {
          id: 'fallback-1',
          name: 'Search temporarily unavailable',
          rating: 0,
          review_count: 0,
          location: { address1: 'Please check your API key', city: '' },
          categories: [{ title: 'Error' }]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: AutocompleteSuggestion) => {
    setSearchTerm(suggestion.text);
    setShowSuggestions(false);
    searchRestaurants(suggestion.text);
  };



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchRestaurants(searchTerm);
  };

  const handleRestaurantSelect = async (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    // Vibes will be generated when "Start Journaling" is clicked
  };

  const handleConfirm = () => {
    if (selectedRestaurant) {
      onRestaurantSelect(selectedRestaurant);
    }
  };

  return (
    <div className="restaurant-selector-overlay">
      <div className="restaurant-selector">
        <div className="selector-header">
          <h2>Select a Place to Journal About</h2>
          <button onClick={onClose} className="close-selector-btn">×</button>
        </div>

        {!selectedRestaurant ? (
          <div className="search-section">
            <div className="search-container">
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    placeholder="Search for a place"
                    className="search-input"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="autocomplete-dropdown">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="autocomplete-item"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                  placeholder="City (optional)"
                  className="location-input"
                />
                <button type="submit" className="search-btn" disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </form>
            </div>

            <div className="restaurants-list">
              {restaurants.map(restaurant => (
                <div
                  key={restaurant.id}
                  className="restaurant-card"
                  onClick={() => handleRestaurantSelect(restaurant)}
                >
                  <div className="restaurant-info">
                    <h3>{restaurant.name}</h3>
                    <div className="restaurant-meta">
                      <span className="rating"><YelpStars rating={restaurant.rating} /></span>
                      <span className="reviews">({restaurant.review_count} reviews)</span>
                    </div>
                    <div className="restaurant-address">
                      {restaurant.location.address1}, {restaurant.location.city}
                    </div>
                    <div className="restaurant-categories">
                      {restaurant.categories.map(cat => cat.title).join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="confirmation-section">
            <div className="selected-restaurant">
              <h3>{selectedRestaurant.name}</h3>
              <p>{selectedRestaurant.location.address1}, {selectedRestaurant.location.city}</p>
              <div className="categories">
                {selectedRestaurant.categories.map(cat => cat.title).join(', ')}
              </div>
            </div>

            <div className="selector-actions">
              <button onClick={() => setSelectedRestaurant(null)} className="back-btn">
                Back to Search
              </button>
              <button onClick={handleConfirm} className="confirm-btn">
                Start Journaling
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantSelector;
