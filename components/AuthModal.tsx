import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Icon from './Icon';
import Button from './ui/Button';
import Input from './ui/Input';

interface AuthModalProps {
  /** Callback function to close the modal. */
  onClose: () => void;
  /** The initial view to display ('login' or 'register'). Defaults to 'login'. */
  initialView?: 'login' | 'register';
}

/**
 * A modal component for user authentication.
 * It provides a tabbed interface for switching between login and registration forms.
 * Handles form submission, loading states, and displays authentication errors.
 * @param {AuthModalProps} props The props for the AuthModal component.
 * @returns {JSX.Element} The authentication modal.
 */
const AuthModal: React.FC<AuthModalProps> = ({ onClose, initialView = 'login' }) => {
  const [view, setView] = useState(initialView);
  const { login, register } = useAuth();
  
  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Clears all form fields and resets the error state. */
  const clearForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setError(null);
  }

  /** Handles the registration form submission. */
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

  /** Handles the login form submission. */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      onClose();
    // FIX: Added curly braces to the catch block and removed an extra brace before finally.
    // This resolves a major syntax error that was causing multiple cascading type errors in the component.
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /** A reusable button component for switching between login and register tabs. */
  const TabButton: React.FC<{ tabName: 'login' | 'register'; children: React.ReactNode }> = ({ tabName, children }) => (
    <button
      onClick={() => { setView(tabName); clearForm(); }}
      className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
        view === tabName ? 'text-white border-indigo-500' : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'
      }`}
      role="tab"
      aria-selected={view === tabName}
    >
      {children}
    </button>
  );

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
    >
      <div 
        className="relative bg-gray-800 rounded-lg shadow-2xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white" aria-label="Close modal">
          <Icon name="X" size={24} />
        </button>

        <div className="flex border-b border-gray-700" role="tablist" id="auth-modal-title">
          <TabButton tabName="login">Login</TabButton>
          <TabButton tabName="register">Sign Up</TabButton>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-sm rounded-md p-3 mb-4 flex items-center gap-2" role="alert">
              {/* FIX: Replaced invalid icon name "AlertTriangle" with "AlertCircle". */}
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4" role="tabpanel">
              <Input id="login-email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"/>
              <Input id="login-password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"/>
              <Button type="submit" variant="primary" className="w-full !mt-6" disabled={isLoading}>
                {/* FIX: Replaced "Loader2" with "Loader" as suggested by the error message. */}
                {isLoading ? <Icon name="Loader" className="animate-spin mx-auto" /> : 'Login'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4" role="tabpanel">
              <Input id="register-username" label="Username" type="text" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="username"/>
              <Input id="register-email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"/>
              <Input id="register-password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} autoComplete="new-password"/>
              <Button type="submit" variant="primary" className="w-full !mt-6" disabled={isLoading}>
                {/* FIX: Replaced "Loader2" with "Loader" as suggested by the error message. */}
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