import React, { useState } from 'react';
import salesforceLogo from '../assets/Salesforce-Logo.jpg';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted:', { username, password, rememberMe });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-1/2 bg-white flex items-center justify-center -mt-50 border-gray-200 border">
      
        <div className="w-[400px] mx-auto p-3">
          <div className="mb-2 ml-20">
            <img
              className="h-45 w-auto"
              src={salesforceLogo}
              alt="Salesforce"
            />
          </div>
          <div className='border border-gray-300
          rounded-xl
          p-6'>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-normal text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                placeholder=""
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-normal text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black "
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0176D3] hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                Log In
              </button>
            </div>
            
          </form>
        </div>
      </div>
      </div>

      {/* Right side - Marketing Content */}
      <div className="w-1/2 bg-[#3765c2] flex items-center justify-center">
        <div className="max-w-md px-8">
          <h1 className="text-[#ecf1f7] text-4xl  mb-4">
          ⚡TaskForce  App
          </h1>
          <p className="text-gray-100 mb-8">
            Every task that is assigned to you, is an OPPORTUNITY
          </p>
          
        </div>
      </div>
    </div>
  );
};

export default Login;