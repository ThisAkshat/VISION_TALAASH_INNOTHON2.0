import React from 'react';
import { Link } from 'react-router-dom';

const FoundList = () => {
  const foundPersons = [
    {
      name: "Garry",
      phone: "8700866508",
      foundDate: "2022-05-26T19:58:24.253Z",
      region: "National Capital Territory of Delhi",
      latitude: "28.6542",
      longitude: "77.2373",
      country: "India",
      city: "Delhi"
    },
    {
      name: "Garvit Batra",
      phone: "962601999947",
      foundDate: "2022-05-27T08:48:56.245Z"
    },
    {
      name: "Garvit Batra",
      phone: "962601999947",
      foundDate: "2022-05-27T08:48:30.450Z",
      region: "National Capital Territory of Delhi",
      latitude: "28.6542",
      longitude: "77.2373",
      country: "India",
      city: "Delhi"
    },
    {
      name: "Garvit Batra",
      phone: "962601999947",
      foundDate: "2022-05-27T08:51:24.698Z"
    }
  ];

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-[oklch(0.82_0.06_195.06)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Talaash</h1>
          <p className="text-lg text-gray-800 mb-6">Found Persons Database</p>
          
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6 border-b pb-6">
            <Link 
              to="/" 
              className="px-3 py-1 text-gray-800 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/surveillance" 
              className="px-3 py-1 text-gray-800 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
            >
              Surveillance Area
            </Link>
            <Link 
              to="/cases" 
              className="px-3 py-1 text-gray-800 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
            >
              Missing List
            </Link>
            <Link 
              to="/location" 
              className="px-3 py-1 text-gray-800 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
            >
              Tracked Locations
            </Link>
          </nav>
        </header>

        {/* Found Persons List */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-300 p-4 font-medium text-gray-700">
            <div className="col-span-4 sm:col-span-3">Name</div>
            <div className="col-span-4 sm:col-span-3">Contact</div>
            <div className="col-span-4 sm:col-span-3">Found Date</div>
            <div className="hidden sm:col-span-3 sm:block">Location</div>
          </div>

          {foundPersons.map((person, index) => (
            <div
              key={index} 
              className={`grid grid-cols-12 p-4 items-center border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
            >
              <div className="col-span-4 sm:col-span-3 font-medium text-gray-900">
                {person.name}
              </div>
              <div className="col-span-4 sm:col-span-3 text-gray-600">
                {person.phone}
              </div>
              <div className="col-span-4 sm:col-span-3 text-sm text-gray-500">
                {formatDate(person.foundDate)}
              </div>
              <div className="hidden sm:col-span-3 sm:block">
                {person.city ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {person.city}, {person.country}
                  </span>
                ) : (
                  <span className="text-gray-700 text-sm">Location not available</span>
                )}
              </div>

              {/* Mobile view expandable details */}
              <div className="col-span-12 mt-3 sm:hidden">
                <div className="bg-gray-50 p-3 rounded-md">
                  {person.city && (
                    <div className="text-sm">
                      <span className="font-medium">Location:</span> {person.city}, {person.country}
                    </div>
                  )}
                  {person.latitude && person.longitude && (
                    <div className="text-sm mt-1">
                      <span className="font-medium">Coordinates:</span> {person.latitude}, {person.longitude}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats and Actions */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-700 mb-4 sm:mb-0">
            Showing {foundPersons.length} found persons
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoundList;