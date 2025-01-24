import React, { useState } from "react";

const MintTokens = () => {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);
 

  const handleMint = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:5000/mintTokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred while minting tokens.",
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "http://localhost:5000/clientAccountBalance",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch balance");
      }

      const data = await response.json();
      setBalance(data.data); // Assuming `data` contains the balance
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">Token Balance</h1>
        <div className="mb-6">
          {loading && <p className="text-blue-500">Fetching balance...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {balance !== null && (
            <p className="text-green-500">Your balance: {balance}</p>
          )}
        </div>
        <button
          onClick={fetchBalance}
          className="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
        >
          Fetch Balance
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Mint Tokens</h2>
        <form onSubmit={handleMint}>
          <div className="mb-4">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Token Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter token amount"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Minting..." : "Mint Tokens"}
          </button>
        </form>
        {message && (
          <div
            className={`mt-4 p-3 rounded-md text-center ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default MintTokens;
