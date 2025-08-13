
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Icon from './Icon';
import Button from './ui/Button';
import Input from './ui/Input';

interface AuthModalProps {
  onClose: () => void;
  initialView?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, initialView = 'login' }) => {
  const [view, setView] = useState(initialView);
  const { login, register } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setError(null);
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await register(username, email, password);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const TabButton: React.FC<{ tabName: 'login' | 'register'; children: React.ReactNode }> = ({ tabName, children }) => (
    <button
      onClick={() => { setView(tabName); clearForm(); }}
      className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
        view === tabName ? 'text-white border-indigo-500' : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="relative bg-gray-800 rounded-lg shadow-2xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white" aria-label="Close modal">
          <Icon name="X" size={24} />
        </button>

        <div className="flex border-b border-gray-700">
          <TabButton tabName="login">Login</TabButton>
          <TabButton tabName="register">Sign Up</TabButton>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-sm rounded-md p-3 mb-4 flex items-center gap-2">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input id="login-email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"/>
              <Input id="login-password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"/>
              <Button type="submit" variant="primary" className="w-full !mt-6" disabled={isLoading}>
                {isLoading ? <Icon name="Loader" className="animate-spin mx-auto" /> : 'Login'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input id="register-username" label="Username" type="text" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="username"/>
              <Input id="register-email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"/>
              <Input id="register-password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} autoComplete="new-password"/>
              <Button type="submit" variant="primary" className="w-full !mt-6" disabled={isLoading}>
                {isLoading ? <Icon name="Loader" className="animate-spin mx-auto" /> : 'Create Account'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
