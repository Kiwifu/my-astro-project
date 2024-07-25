import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Car } from 'lucide-react';

const SearchResults = () => {
  const [cars, setCars] = useState([]);
  const [locations, setLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const urlParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlParams.entries());
        setSearchParams(params);

        // Fetch locations
        const locationsResponse = await fetch(`${import.meta.env.PUBLIC_STRAPI_URL}/api/locations`);
        const locationsData = await locationsResponse.json();
        const locationsMap = {};
        locationsData.data.forEach(location => {
          locationsMap[location.id] = location.attributes.Name;
        });
        setLocations(locationsMap);

        // Fetch cars with all related data
        const carsResponse = await fetch(`${import.meta.env.PUBLIC_STRAPI_URL}/api/cars?populate=*`);
        const carsData = await carsResponse.json();

        console.log('Full cars data:', JSON.stringify(carsData, null, 2));

        if (carsData.data && Array.isArray(carsData.data)) {
          setCars(carsData.data);
        } else {
          setError('Unexpected data format received from API');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getLocationName = (locationId) => {
    return locations[locationId] || 'Not specified';
  };

  const getImageUrl = (car) => {
    console.log('Car data:', JSON.stringify(car, null, 2));
    if (car.attributes.image && car.attributes.image.data && car.attributes.image.data.attributes) {
      const imageUrl = car.attributes.image.data.attributes.url;
      console.log('Constructed image URL:', imageUrl);
      return imageUrl.startsWith('http') ? imageUrl : `${import.meta.env.PUBLIC_STRAPI_URL}${imageUrl}`;
    }
    console.log('Image data structure:', JSON.stringify(car.attributes.image, null, 2));
    return 'https://via.placeholder.com/300x200?text=No+Image+Available';
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Search Results</h1>
      <div className="bg-gray-100 p-4 rounded-md mb-6">
        <p className="mb-2">
          <MapPin className="inline-block mr-2" size={16} /> 
          Pickup Location: {getLocationName(searchParams.pickupLocation)}
        </p>
        <p className="mb-2">
          <Calendar className="inline-block mr-2" size={16} /> 
          Pickup: {formatDateTime(searchParams.pickupDateTime)}
        </p>
        <p>
          <Calendar className="inline-block mr-2" size={16} /> 
          Return: {formatDateTime(searchParams.returnDateTime)}
        </p>
        {searchParams.differentDropoff === 'true' && (
          <p className="mt-2">
            <MapPin className="inline-block mr-2" size={16} /> 
            Dropoff Location: {getLocationName(searchParams.dropoffLocation)}
          </p>
        )}
      </div>
      {cars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div key={car.id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <img 
                src={getImageUrl(car)} 
                alt={`${car.attributes.Brand} ${car.attributes.Model}`}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{car.attributes.Brand} {car.attributes.Model}</h2>
                <p className="text-gray-600 mb-2"><Car className="inline-block mr-2" size={16} /> {car.attributes.Year}</p>
                <p className="text-gray-600 mb-2">Category: {car.attributes.Category || 'Not specified'}</p>
                <p className="text-2xl font-bold text-blue-600 mb-4">${car.attributes.Price_Per_Day} / day</p>
                <p className="text-gray-600 mb-4">{car.attributes.Description}</p>
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 mt-8">
          <p>No cars available. Please try again later.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;