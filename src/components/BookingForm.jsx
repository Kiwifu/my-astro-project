import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Search } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import SearchResults from './SearchResults';

const BookingForm = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    pickupLocation: '',
    pickupDateTime: new Date(),
    returnDateTime: new Date(new Date().setDate(new Date().getDate() + 1)),
    differentDropoff: false,
    dropoffLocation: '',
  });
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.PUBLIC_STRAPI_URL}/api/locations`);
        setLocations(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setError('Failed to fetch locations. Please try again later.');
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFormData(prev => ({
      ...prev,
      pickupDateTime: start,
      returnDateTime: end
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Search submitted:', formData);
    setShowSearchResults(true);
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  if (showSearchResults) {
    return <SearchResults formData={formData} />;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="inline-block mr-1" size={16} /> Pickup Location
          </label>
          <select
            id="pickupLocation"
            name="pickupLocation"
            value={formData.pickupLocation}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select a location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>{location.attributes.Name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pickup and Return Date/Time
          </label>
          <DatePicker
            selected={formData.pickupDateTime}
            onChange={handleDateChange}
            startDate={formData.pickupDateTime}
            endDate={formData.returnDateTime}
            selectsRange
            showTimeSelect
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <Search size={24} />
        </button>
      </div>
      <div className="mt-4">
        <label className="flex items-center text-sm text-blue-600 cursor-pointer">
          <input
            type="checkbox"
            name="differentDropoff"
            checked={formData.differentDropoff}
            onChange={handleChange}
            className="mr-2"
          />
          I want to deliver in a different place
        </label>
      </div>
      {formData.differentDropoff && (
        <div className="mt-4">
          <label htmlFor="dropoffLocation" className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="inline-block mr-1" size={16} /> Dropoff Location
          </label>
          <select
            id="dropoffLocation"
            name="dropoffLocation"
            value={formData.dropoffLocation}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select a location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>{location.attributes.Name}</option>
            ))}
          </select>
        </div>
      )}
    </form>
  );
};

export default BookingForm;