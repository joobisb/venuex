import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LayoutDashboard, Plus, Users, Settings, Bot, Sparkles } from 'lucide-react';

type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive: boolean;
  isCollapsed: boolean;
};

const NavItem = ({ icon, label, to, isActive, isCollapsed }: NavItemProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
        isActive
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
      } ${isCollapsed ? 'justify-center' : ''}`}
    >
      <div className="flex-shrink-0">{icon}</div>
      {!isCollapsed && <span className="font-medium">{label}</span>}
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: 'Dashboard',
      to: '/',
    },
    {
      icon: <Plus size={20} />,
      label: 'Create Agent',
      to: '/create',
    },
    {
      icon: <Bot size={20} />,
      label: 'My Agents',
      to: '/agents',
    },
    {
      icon: <Settings size={20} />,
      label: 'Settings',
      to: '/settings',
    },
  ];

  return (
    <div
      className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 h-screen transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-16' : 'w-64'
      } sticky top-0 left-0`}
    >
      {/* Header */}
      <div className={`p-4 flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center border-b border-gray-200 dark:border-gray-700`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AgentHub
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Assistant</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles size={18} className="text-white" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-6 space-y-2">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            icon={item.icon}
            label={item.label}
            to={item.to}
            isActive={location.pathname === item.to}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>

      {/* User Profile */}
      <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${isCollapsed ? 'text-center' : ''}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold shadow-lg">
              JS
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 dark:text-white">John Smith</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">john@example.com</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 mx-auto flex items-center justify-center text-white font-semibold shadow-lg">
            JS
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;