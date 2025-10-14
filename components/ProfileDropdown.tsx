import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Icon from './Icon';

interface ProfileDropdownProps {
  /** Callback function to navigate to the user's library view. */
  onGoToLibrary: () => void;
  /** Callback function to open the settings modal. */
  onOpenSettings: () => void;
}

/**
 * A dropdown menu component for authenticated users.
 * It displays the user's name and provides links to their library, settings,
 * and a logout option. The dropdown closes automatically when clicking outside of it.
 * @param {ProfileDropdownProps} props The props for the component.
 * @returns {JSX.Element | null} The dropdown component or null if no user is logged in.
 */
const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onGoToLibrary, onOpenSettings }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect to handle closing the dropdown when a click occurs outside of it.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {/* FIX: Changed icon name from "UserCircle" to "User" to match available icons. */}
        <Icon name="User" size={24} className="text-indigo-400" />
        <span className="text-sm font-medium hidden sm:inline">{user.username}</span>
        <Icon name="ChevronDown" size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="animate-fade-in absolute right-0 mt-2 w-48 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-30 py-1" role="menu">
          <div className="px-4 py-2 border-b border-gray-600">
            <p className="text-sm font-semibold text-white truncate">{user.username}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={() => { onGoToLibrary(); setIsOpen(false); }}
            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-indigo-600 hover:text-white"
            role="menuitem"
          >
            <Icon name="Library" size={16} />
            My Library
          </button>
          <button
            onClick={() => { onOpenSettings(); setIsOpen(false); }}
            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-indigo-600 hover:text-white"
            role="menuitem"
          >
            <Icon name="Cog" size={16} />
            Settings
          </button>
          <button
            onClick={() => { logout(); setIsOpen(false); }}
            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-indigo-600 hover:text-white"
            role="menuitem"
          >
            <Icon name="LogOut" size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;