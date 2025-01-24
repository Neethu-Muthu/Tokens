import React from 'react'
import SideBar from '../components/SideBar';
import HomePage from '../components/HomePage';

const Indexpage = () => {
  return (
    <div>
      <div className="flex min-h-screen bg-gray-900 text-white">
        <SideBar />
        <HomePage />
      </div>
    </div>
  );
}

export default Indexpage