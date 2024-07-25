import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Car, Users, Briefcase, Wind, Fuel, Settings } from 'lucide-react';
import { RouterWrapper } from './RouterWrapper';

function SearchResultsContent({ formData }) {
  const [cars, setCars] = useState([]);
  const [locations, setLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

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

  const formatDateTime = (date) => {
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true
    });
  };

  const getLocationName = (locationId) => {
    return locations[locationId] || 'Not specified';
  };

  const getImageUrl = (car) => {
    if (car.attributes.Image && car.attributes.Image.data && car.attributes.Image.data.length > 0) {
      const imageData = car.attributes.Image.data[0].attributes;
      return `${import.meta.env.PUBLIC_STRAPI_URL}${imageData.url}`;
    }
    return 'https://via.placeholder.com/300x200?text=No+Image+Available';
  };

  const handleBookNow = (carId) => {
    navigate(`/booking/extras/${carId}`, { state: { formData } });
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Search Results</h1>
      <div className="bg-gray-100 p-4 rounded-md mb-6 flex flex-wrap items-center text-sm">
        <div className="flex items-center mr-4">
          <MapPin className="text-blue-500 mr-1" size={16} />
          <span className="font-semibold mr-1">Pick-up/Drop-off:</span>
          <span className="mr-2">{getLocationName(formData.pickupLocation)}</span>
        </div>
        <div className="flex items-center mr-4">
          <Calendar className="text-green-500 mr-1" size={16} />
          <span className="font-semibold mr-1">Pick-up:</span>
          <span className="mr-2">{formatDateTime(formData.pickupDateTime)}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="text-red-500 mr-1" size={16} />
          <span className="font-semibold mr-1">Drop-off:</span>
          <span>{formatDateTime(formData.returnDateTime)}</span>
        </div>
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
                <p className="text-gray-600 mb-2"><Car className="inline-block mr-2" size={16} /> {car.attributes.Category}</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <p className="text-gray-600"><Users className="inline-block mr-2" size={16} /> {car.attributes.Seats}</p>
                  <p className="text-gray-600"><Fuel className="inline-block mr-2" size={16} /> {car.attributes.fuel_type}</p>
                  <p className="text-gray-600"><Settings className="inline-block mr-2" size={16} /> {car.attributes.Transmission}</p>
                  <p className="text-gray-600"><Briefcase className="inline-block mr-2" size={16} /> {car.attributes.Bags}</p>
                  <p className="text-gray-600">
                    <Wind className="inline-block mr-2" size={16} /> 
                    {car.attributes.air_conditioning ? 'A/C' : 'No A/C'}
                  </p>
                </div>
                <p className="text-2xl font-bold text-blue-600 mb-4">{car.attributes.Price_Per_Day} MAD / day</p>
                <p className="text-gray-600 mb-4">{car.attributes.Description}</p>
                <button 
                  onClick={() => handleBookNow(car.id)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                >
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
}

export default function SearchResults(props) {
  return (
    <RouterWrapper>
      <SearchResultsContent {...props} />
    </RouterWrapper>
  );
}