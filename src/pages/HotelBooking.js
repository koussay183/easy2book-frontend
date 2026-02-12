import React from 'react';
import { useParams } from 'react-router-dom';

const HotelBooking = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">حجز الفندق</h1>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-xl text-gray-600">نموذج حجز الفندق رقم: {id}</p>
          <p className="text-gray-500 mt-4">قيد التطوير</p>
        </div>
      </div>
    </div>
  );
};

export default HotelBooking;
