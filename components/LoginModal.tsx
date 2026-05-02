import React, { useState } from 'react';
import { Lock, X, ChevronRight, Loader2 } from 'lucide-react';
import { login } from '../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  branchId: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess, branchId }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(branchId, email, password);
      if (success) {
        setPassword('');
        setEmail('');
        onLoginSuccess();
        onClose();
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-charcoal-950/70 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-cream-50 dark:bg-charcoal-900 rounded-2xl shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 sm:p-8">
          <div className="flex justify-between items-center mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-charcoal-800 dark:text-cream-100 flex items-center">
              <div className="bg-brand-100 dark:bg-brand-900/30 p-2 rounded-lg mr-2 sm:mr-3 text-brand-600">
                <Lock size={18} className="sm:hidden" />
                <Lock size={20} className="hidden sm:block" />
              </div>
              Owner Login
            </h2>
            <button
              onClick={onClose}
              className="text-charcoal-400 dark:text-cream-500 hover:text-charcoal-600 dark:hover:text-cream-300 transition-colors p-1.5 hover:bg-cream-100 dark:hover:bg-charcoal-800 rounded-full"
            >
              <X size={22} className="sm:hidden" />
              <X size={24} className="hidden sm:block" />
            </button>
          </div>

          <p className="text-charcoal-500 dark:text-cream-500 mb-5 sm:mb-6 text-sm sm:text-base">
            Please enter your Supabase email and password to manage the menu.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-cream-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={`w-full px-4 py-3 sm:py-3 rounded-xl border bg-cream-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-base ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-cream-300 dark:border-charcoal-700 focus:border-brand-500 focus:ring-brand-100 dark:focus:ring-brand-900/30'} focus:ring-4 outline-none transition-all`}
                placeholder="Enter email..."
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-cream-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className={`w-full px-4 py-3 sm:py-3 rounded-xl border bg-cream-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 text-base ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-cream-300 dark:border-charcoal-700 focus:border-brand-500 focus:ring-brand-100 dark:focus:ring-brand-900/30'} focus:ring-4 outline-none transition-all`}
                placeholder="Enter password..."
                required
              />
              {error && (
                <p className="text-red-500 text-sm mt-2 flex items-center animate-in slide-in-from-top-1">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !password || !email}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3.5 sm:py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center text-sm sm:text-base btn-press"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Access Dashboard <ChevronRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
        <div className="bg-cream-100 dark:bg-charcoal-800 px-5 sm:px-8 py-3 sm:py-4 border-t border-cream-200/60 dark:border-charcoal-700 text-center">
          <p className="text-xs text-charcoal-400 dark:text-cream-600">Protected Area &bull; Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
};