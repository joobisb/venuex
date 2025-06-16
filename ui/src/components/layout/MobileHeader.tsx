import React, { useState } from 'react';
import { Menu, X, Bot } from 'lucide-react';
import Sidebar from './Sidebar';

const MobileHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Bot size={24} className="text-primary-600" />
          <span className="font-bold text-xl">AgentHub</span>
        </div>
        <button
          onClick={toggleMenu}
          className="rounded-lg p-2 hover:bg-gray-100 text-gray-500"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 pt-16">
          <div className="absolute top-0 right-0 p-4">
            <button
              onClick={toggleMenu}
              className="rounded-lg p-2 hover:bg-gray-100 text-gray-500"
            >
              <X size={24} />
            </button>
          </div>
          <Sidebar />
        </div>
      )}
    </>
  );
};

export default MobileHeader;