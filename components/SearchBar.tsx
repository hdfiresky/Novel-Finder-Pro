import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

type SearchField = 'title' | 'author' | 'description';

const searchFieldOptions: { key: SearchField; label: string }[] = [
    { key: 'title', label: 'Title' },
    { key: 'author', label: 'Author' },
    { key: 'description', label: 'Description' },
];

interface SearchBarProps {
  /** The current search term value. */
  searchTerm: string;
  /** Callback function to update the search term. */
  setSearchTerm: (term: string) => void;
  /** The currently selected fields to search in. */
  searchFields: SearchField[];
  /** Callback function to update the selected search fields. */
  onSearchFieldsChange: (fields: SearchField[]) => void;
}

/**
 * An advanced search bar component with a search icon and a settings dropdown.
 * The dropdown allows users to select which fields (title, author, description)
 * the search term should be applied to.
 * @param {SearchBarProps} props The props for the SearchBar component.
 * @returns {JSX.Element} An advanced input field for searching.
 */
const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm, searchFields, onSearchFieldsChange }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Effect to handle closing the dropdown when clicking outside of it.
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /** Toggles a search field, ensuring at least one field remains selected. */
    const handleFieldToggle = (field: SearchField) => {
        const newFields = searchFields.includes(field)
            ? searchFields.filter(f => f !== field)
            : [...searchFields, field];
        
        // Prevent unchecking the last remaining field.
        if (newFields.length > 0) {
            onSearchFieldsChange(newFields);
        }
    };
    
    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="Search" className="text-gray-400" size={20} />
            </div>
            <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                aria-label="Search novels"
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                <button
                    onClick={() => setIsDropdownOpen(prev => !prev)}
                    className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-indigo-500"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                    title="Search options"
                >
                    <Icon name="Settings2" size={20} />
                </button>
            </div>
            {isDropdownOpen && (
                <div className="absolute z-10 top-full right-0 mt-2 w-56 bg-gray-700 border border-gray-600 rounded-md shadow-lg py-2 animate-fade-in" role="menu">
                    <p className="px-4 pb-2 text-xs font-semibold text-gray-400 uppercase">Search In</p>
                    <div className="space-y-1">
                        {searchFieldOptions.map(({ key, label }) => (
                            <label key={key} className="flex items-center px-4 py-1.5 text-gray-300 text-sm cursor-pointer hover:bg-indigo-600 hover:text-white transition-colors" role="menuitemcheckbox" aria-checked={searchFields.includes(key)}>
                                <input
                                    type="checkbox"
                                    checked={searchFields.includes(key)}
                                    onChange={() => handleFieldToggle(key)}
                                    disabled={searchFields.length === 1 && searchFields.includes(key)}
                                    className="h-4 w-4 rounded border-gray-500 bg-gray-800 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <span className="ml-3">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;