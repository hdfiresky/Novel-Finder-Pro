

import React from 'react';
import { useUserData } from '../contexts/UserDataContext';
import Icon from './Icon';
import Switch from './ui/Switch';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings } = useUserData();

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="relative bg-gray-800 rounded-lg shadow-2xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Icon name="Cog" size={22} />
                Settings
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">
                <Icon name="X" size={24} />
            </button>
        </div>

        <div className="p-6 space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-3">Interface Settings</h3>
                <div className="space-y-4 p-4 bg-gray-900/50 rounded-lg">
                    <Switch
                        label="Show 'Favorite' buttons"
                        checked={settings.showFavoriteButton}
                        onChange={(checked) => updateSettings({ showFavoriteButton: checked })}
                        description="Display heart icons on novel cards and in details."
                    />
                    <Switch
                        label="Show 'Wishlist' buttons"
                        checked={settings.showWishlistButton}
                        onChange={(checked) => updateSettings({ showWishlistButton: checked })}
                        description="Display bookmark icons on novel cards and in details."
                    />
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-3">Content Settings</h3>
                <div className="space-y-4 p-4 bg-gray-900/50 rounded-lg">
                    <Switch
                        label="Show NSFW Content"
                        checked={settings.showNsfw}
                        onChange={(checked) => updateSettings({ showNsfw: checked })}
                        description="Display content that may be unsuitable for all audiences."
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;