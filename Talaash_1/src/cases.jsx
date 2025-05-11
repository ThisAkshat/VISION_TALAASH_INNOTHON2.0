import React from 'react';

const Cases = () => {
  const cases = [
    {
      date: "2022-05-15",
      missingFrom: "New Delhi, India",
      height: "5'7\" (170 cm)",
      identification: "Mole on left cheek, tattoo on right forearm",
      person: {
        name: "Garvit Batra",
        gender: "Male",
        phone: "+91 8626099947",
        address: "E-159 Karam Pura, New Delhi",
        email: "gbatral45@gmail.com",
        image: "https://via.placeholder.com/150" // Add placeholder or actual image URL
      }
    },
    {
      date: "2022-05-05",
      missingFrom: "Gurugram, Haryana",
      height: "5'2\" (157 cm)",
      identification: "Birthmark on neck, wears glasses",
      person: {
        name: "Kashish Batra",
        gender: "Female",
        phone: "+91 8686002345",
        address: "E-159 Karam Pura, New Delhi",
        email: "kashbatra02@gmail.com",
        image: "https://via.placeholder.com/150" // Add placeholder or actual image URL
      }
    }
  ];

  return (
    <div className="min-h-screen bg-[oklch(0.82_0.06_195.06)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-black">Missing Persons Cases</h1>
          <p className="mt-2 text-lg text-black">
            Recent reported missing persons in our database
          </p>
        </div>

        <div className="space-y-6">
          {cases.map((caseItem, index) => (
            <div key={index} className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase font-semibold tracking-wide">
                      Case #{index + 1}
                    </span>
                    <h2 className="mt-1 text-xl font-bold text-gray-900">{caseItem.person.name}</h2>
                  </div>
                  <span className="text-sm text-gray-700">{caseItem.date}</span>
                </div>
                <p className="mt-1 text-sm text-gray-700">Missing from: {caseItem.missingFrom}</p>
              </div>

              <div className="px-6 py-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4">
                    <img 
                      src={caseItem.person.image} 
                      alt={caseItem.person.name} 
                      className="w-full h-auto rounded-lg object-cover"
                    />
                  </div>
                  <div className="md:w-3/4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Height</h3>
                        <p className="mt-1 text-sm text-gray-900">{caseItem.height}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Gender</h3>
                        <p className="mt-1 text-sm text-gray-900">{caseItem.person.gender}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Phone</h3>
                        <p className="mt-1 text-sm text-gray-900">{caseItem.person.phone}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Email</h3>
                        <p className="mt-1 text-sm text-gray-900">{caseItem.person.email}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700">Identification Marks</h3>
                      <p className="mt-1 text-sm text-gray-900">{caseItem.identification}</p>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700">Address</h3>
                      <p className="mt-1 text-sm text-gray-900">{caseItem.person.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3 ">
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                  View Details
                </button>
                <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer">
                  Delete Case
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button className=" cursor-pointer px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Report New Missing Person
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cases;