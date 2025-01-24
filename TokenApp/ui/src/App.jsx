// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  // useNavigate,
} from "react-router-dom";
import HomePage from "./components/HomePage";
import NftSeller from "./components/NftSeller";
import NFTBuyerPage from "./components/NftBuyer";

;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/nft-seller" element={<NftSeller />} />

        <Route path="/nft-buyer" element={<NFTBuyerPage />} />
      </Routes>
    </Router>
  );
}

export default App;
