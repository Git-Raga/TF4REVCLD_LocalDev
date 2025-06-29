import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import salesforceLogo from "../assets/Salesforce-Logo.jpg";
import { databases, DATABASE_ID, COLLECTIONS } from "../appwrite/config";
import { Query } from "appwrite";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USER_DETAILS,
        [Query.equal("useremail", username), Query.equal("password", password)]
      );

      if (response.documents.length > 0) {
        try {
          const userData = response.documents[0];
          localStorage.setItem("user", JSON.stringify(userData));
          
          // Check if there's already a theme preference in localStorage
          const currentTheme = localStorage.getItem("theme");

          // Only set theme from user data if no theme is currently set
          if (!currentTheme) {
            const userThemePreference = userData.theme || "dark";
            localStorage.setItem("theme", userThemePreference);
          }
          
          // Add a small delay to ensure storage is complete
          setTimeout(() => {
            window.location.href = "/landing";
            console.log("Navigation attempted");
          }, 500);
        } catch (storageError) {
          console.error("Storage error:", storageError);
          setError("Failed to save session data");
        }
      } else {
        setError("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error details:", error);
      setError(`Authentication failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-1/2 bg-white flex items-start justify-center" style={{paddingTop: '150px'}}>
        <div className="w-[400px] mx-auto p-3">
          <div className="mb-1 ml-25">
            <img
              className="h-45 w-auto"
              src={salesforceLogo}
              alt="Salesforce"
              loading="eager"
            />
          </div>
          <div className="border border-gray-300 rounded-xl p-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-normal text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="username"
                  name="username"
                  type="email"
                  required
                  autoComplete="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-normal text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0176D3] hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Signing in..." : "Log In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Marketing Content */}
      <div className="w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url('/assets/boat.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-[#1a2a49] opacity-90"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="max-w-md text-center">
            <h1 className="text-[#ecf1f7] text-6xl mb-4 font-bold">TaskForce ⚡</h1>
            <p className="text-gray-100 text-lg">
              Every task that is assigned to you,..... is an <b>OPPORTUNITY</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;