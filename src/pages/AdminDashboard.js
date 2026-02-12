import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">لوحة التحكم - الإدارة</h1>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl text-gray-600">لوحة تحكم المسؤول - قيد التطوير</p>
          <p className="text-gray-500 mt-4">سيتم إضافة إدارة الحجوزات والفنادق والعروض</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
