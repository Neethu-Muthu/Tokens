import React from "react";
import { useNavigate } from "react-router-dom";
import { FaStore, FaShoppingCart } from "react-icons/fa"; // Importing icons for Seller and Buyer

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center text-white py-10"
      style={{
        background: "linear-gradient(135deg, #1e3a8a, #1e40af, #1e3a8a)", // Gradient background
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-5xl font-extrabold mb-4">NFT Marketplace</h1>
        <p className="text-lg mb-12 max-w-lg text-center">
          A modern platform to buy and sell NFTs. Join the revolution of digital
          assets.
        </p>
        <div className="bg-white text-gray-900 rounded-3xl shadow-lg p-8 w-full max-w-md relative z-10">
          <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600">
            Choose Your Role
          </h2>
          <div className="space-y-6">
            {/* NFT Seller Button */}
            <button
              onClick={() => navigate("/nft-seller")}
              className="w-full flex items-center justify-between px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none transition transform hover:scale-105"
            >
              <span className="flex items-center">
                <FaStore className="mr-3" />
                NFT Seller
              </span>
              <span className="text-sm">Create and List NFTs</span>
            </button>

            {/* NFT Buyer Button */}
            <button
              onClick={() => navigate("/nft-buyer")}
              className="w-full flex items-center justify-between px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none transition transform hover:scale-105"
            >
              <span className="flex items-center">
                <FaShoppingCart className="mr-3" />
                NFT Buyer
              </span>
              <span className="text-sm">Browse and Buy NFTs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
