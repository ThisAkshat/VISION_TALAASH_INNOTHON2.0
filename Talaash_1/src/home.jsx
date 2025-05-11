import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[oklch(0.82_0.06_195.06)]">
      {/* Navigation */}
      <nav className="bg-black shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <img src="src/image\Talaash.jpeg" alt="Talash Logo" className="h-20 w-40"/>
          <div className="hidden md:flex space-x-20 ml-8"> {/* Added ml-8 here */}
            <Link to="/" className="text-white text-2xl hover:text-blue-600">Home</Link>
            <Link to="/surveillance" className="text-white text-2xl hover:text-blue-600">Surveillance Area</Link>
            <Link to="/location" className="text-white text-2xl hover:text-blue-600">Tracked locations</Link>
          </div>
          <button className="md:hidden text-white"> {/* Changed text color to white */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Rest of your code remains the same */}
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="text-center">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
              MISSING
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">
            LET'S FIND YOUR CLOSE ONE'S WITH OUR RECOGNITION SYSTEMS
          </h1>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-[oklch(0.41_0.25_275.87)] mb-4">#Talaash</h2>
            <p className="text-lg text-black mb-8">
              Web App to help to find the missing persons by the use of face recognition technology
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/auth" 
                state={{ from: { pathname: '/register' } }}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Report Missing Person
              </Link>
              <Link 
                to="/cases" 
                className="px-6 py-3 bg-white text-blue-600 border border-blue-600 font-medium rounded-lg hover:bg-blue-50 transition duration-300"
              >
                View Missing List
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;