import React, { useState } from "react";
import axios from "axios";

const NftSeller = () => {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [sellerAccountId, setSellerAccountId] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [balance, setBalance] = useState("");
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [nftPrice, setNftPrice] = useState("");
  const [nftList, setNftList] = useState([]);
  const [nftDetails, setNftDetails] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInitializeMarketplace = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const response = await axios.post("/api/initializeNFTMarketplace", {
        name,
        symbol,
      });
      setSuccessMessage(response.data.message);
      setName("");
      setSymbol("");
    } catch (error) {
      setError(
        error.response
          ? error.response.data.message
          : "Error initializing marketplace"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSellerAccount = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage("");

    const accountData = {
      sellerAccountId,
      sellerName,
      phoneNumber,
      balance: parseInt(balance),
    };

    try {
      const response = await axios.post(
        "/api/createSellerAccount",
        accountData
      );
      if (response.data.success) {
        setSuccessMessage("Seller account created successfully!");
        setSellerAccountId("");
        setSellerName("");
        setPhoneNumber("");
        setBalance("");
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError("Error creating the seller account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadSellerAccount = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `/api/getSellerAccount/${sellerAccountId}`
      );
      setSellerName(response.data.sellerName);
      setPhoneNumber(response.data.phoneNumber);
      setBalance(response.data.balance);
    } catch (error) {
      setError("Error fetching seller account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNft = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage("");

    const nftData = {
      name: nftName,
      description: nftDescription,
      price: nftPrice,
    };

    try {
      const response = await axios.post("/api/createNft", nftData);
      setSuccessMessage("NFT created successfully!");
      setNftName("");
      setNftDescription("");
      setNftPrice("");
    } catch (error) {
      setError("Error creating NFT");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadNft = async (nftId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/getNft/${nftId}`);
      setNftDetails(response.data.nft);
    } catch (error) {
      setError("Error fetching NFT details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAllNfts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/getAllNfts");
      setNftList(response.data.nfts);
    } catch (error) {
      setError("Error fetching NFTs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleListForSale = async (nftId) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`/api/listNftForSale/${nftId}`);
      setSuccessMessage("NFT listed for sale!");
    } catch (error) {
      setError("Error listing NFT for sale");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckBalance = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/getBalance/${sellerAccountId}`);
      setBalance(response.data.balance);
    } catch (error) {
      setError("Error fetching balance");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-semibold text-center">
          NFT Seller Dashboard
        </h1>

        {/* Initialize Marketplace */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl text-center mb-4">Initialize Marketplace</h2>
          <form onSubmit={handleInitializeMarketplace}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Marketplace Name"
              className="w-full p-3 mb-4 bg-gray-700 rounded-md text-white"
            />
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Marketplace Symbol"
              className="w-full p-3 mb-4 bg-gray-700 rounded-md text-white"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 py-3 rounded-md text-white hover:bg-indigo-700 transition duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Initializing..." : "Initialize Marketplace"}
            </button>
          </form>
        </div>

        {/* Create Seller Account */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl text-center mb-4">Create Seller Account</h2>
          <form onSubmit={handleCreateSellerAccount}>
            <input
              type="text"
              value={sellerAccountId}
              onChange={(e) => setSellerAccountId(e.target.value)}
              placeholder="Seller Account ID"
              className="w-full p-3 mb-4 bg-gray-700 rounded-md text-white"
            />
            <input
              type="text"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              placeholder="Seller Name"
              className="w-full p-3 mb-4 bg-gray-700 rounded-md text-white"
            />
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone Number"
              className="w-full p-3 mb-4 bg-gray-700 rounded-md text-white"
            />
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="Balance"
              className="w-full p-3 mb-4 bg-gray-700 rounded-md text-white"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 py-3 rounded-md text-white hover:bg-indigo-700 transition duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Seller Account"}
            </button>
          </form>
        </div>

        {/* Get Seller Account */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl text-center mb-4">Read Seller Account</h2>
          <button
            onClick={handleReadSellerAccount}
            className="w-full bg-indigo-600 py-3 rounded-md text-white hover:bg-indigo-700 transition duration-300"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Read Seller Account"}
          </button>
        </div>

        {/* Create NFT */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl text-center mb-4">Create NFT</h2>
          <form onSubmit={handleCreateNft}>
            <input
              type="text"
              value={nftName}
              onChange={(e) => setNftName(e.target.value)}
              placeholder="NFT Name"
              className="w-full p-3 mb-4 bg-gray-700 rounded-md text-white"
            />
            <textarea
              value={nftDescription}
              onChange={(e) => setNftDescription(e.target.value)}
              placeholder="NFT Description"
              className="w-full p-3 mb-4 bg-gray-700 rounded-md text-white"
            />
            <input
              type="number"
              value={nftPrice}
              onChange={(e) => setNftPrice(e.target.value)}
              placeholder="NFT Price"
              className="w-full p-3 mb-4 bg-gray-700 rounded-md text-white"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 py-3 rounded-md text-white hover:bg-indigo-700 transition duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create NFT"}
            </button>
          </form>
        </div>

        {/* Seller Balance */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl text-center mb-4">Seller Balance</h2>
          <button
            onClick={handleCheckBalance}
            className="w-full bg-indigo-600 py-3 rounded-md text-white hover:bg-indigo-700 transition duration-300"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Check Balance"}
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="text-green-500 text-center mt-4">
            {successMessage}
          </div>
        )}
        {error && <div className="text-red-500 mt-4">{error}</div>}
      </div>
    </div>
  );
};

export default NftSeller;
