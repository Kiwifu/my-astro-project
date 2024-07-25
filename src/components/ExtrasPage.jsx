import React, { useState, useEffect } from 'react';
import * as ReactRouterDom from 'react-router-dom';

const { useParams, useLocation, useNavigate } = ReactRouterDom;

const ExtrasPage = () => {
  const { carId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [extras, setExtras] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const { searchParams } = location.state;

  useEffect(() => {
    const fetchCarAndExtras = async () => {
      try {
        // Fetch car details
        const carResponse = await fetch(`${import.meta.env.PUBLIC_STRAPI_URL}/api/cars/${carId}?populate=*`);
        const carData = await carResponse.json();
        setCar(carData.data);

        // Fetch available extras
        const extrasResponse = await fetch(`${import.meta.env.PUBLIC_STRAPI_URL}/api/extras`);
        const extrasData = await extrasResponse.json();
        setExtras(extrasData.data);
      } catch (error) {
        console.error('Error fetching car and extras:', error);
      }
    };

    fetchCarAndExtras();
  }, [carId]);

  const handleExtraToggle = (extraId) => {
    setSelectedExtras(prev => 
      prev.includes(extraId) 
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };

  const handleContinue = () => {
    navigate(`/booking/info/${carId}`, { 
      state: { searchParams, selectedExtras } 
    });
  };

  if (!car) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Select Extras</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Selected Car</h2>
        <p>{car.attributes.Brand} {car.attributes.Model}</p>
        <p>Price per day: {car.attributes.Price_Per_Day} MAD</p>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Available Extras</h2>
        {extras.map(extra => (
          <div key={extra.id} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={`extra-${extra.id}`}
              checked={selectedExtras.includes(extra.id)}
              onChange={() => handleExtraToggle(extra.id)}
              className="mr-2"
            />
            <label htmlFor={`extra-${extra.id}`}>{extra.attributes.name} - {extra.attributes.price} MAD</label>
          </div>
        ))}
      </div>
      <button
        onClick={handleContinue}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
      >
        Continue to Customer Information
      </button>
    </div>
  );
};

export default ExtrasPage;