import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Dna, AlertCircle, Loader2 } from 'lucide-react';
import type { Genotype } from '../types/database';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [genotype, setGenotype] = useState<Genotype>('AA');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
          setError('Password must be at least 8 characters long, containing at least one uppercase letter, one lowercase letter, and one number.');
          setLoading(false);
          return;
        }
        const { error: signUpError } = await signUp(email, password, name, genotype);
        if (signUpError) {
          const msg = signUpError.message;
          if (msg.toLowerCase().includes('error sending confirmation email')) {
            setError('Unable to send confirmation email (Supabase rate limit reached). To allow instant sign-ups, toggle off "Confirm email" in Supabase Dashboard > Authentication > Providers > Email.');
          } else if (
            msg.toLowerCase().includes('abcdefghijklmnopqrstuvwxyz') ||
            msg.toLowerCase().includes('password should contain') ||
            msg.toLowerCase().includes('password should be at least')
          ) {
            setError('Password must contain at least 8 characters, an uppercase letter, a lowercase letter, and a number.');
          } else {
            setError(msg);
          }
        } else {
          onClose();
        }
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError.message);
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <div className="modal-icon">
            <Dna size={28} className="text-crimson" />
          </div>
          <h3>{isSignUp ? 'Create your Account' : 'Welcome Back'}</h3>
          <p className="modal-sub">
            {isSignUp
              ? 'Join the Sickle Cell Care community and track your health and quiz results.'
              : 'Sign in to access your profile and quiz score history.'}
          </p>
        </div>

        {error && (
          <div className="error-box">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="modal-tabs">
          <button
            className={`tab-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(true)}
            type="button"
          >
            Register
          </button>
          <button
            className={`tab-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(false)}
            type="button"
          >
            Sign In
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          {isSignUp && (
            <div className="form-group">
              <label>Hemoglobin Genotype</label>
              <div className="input-wrapper">
                <Dna size={18} className="input-icon" />
                <select
                  value={genotype}
                  onChange={(e) => setGenotype(e.target.value as Genotype)}
                  className="select-input"
                >
                  <option value="AA">AA (Normal Hemoglobin)</option>
                  <option value="AS">AS (Sickle Cell Trait Carrier)</option>
                  <option value="SS">SS (Sickle Cell Disease)</option>
                  <option value="AC">AC (Hemoglobin C Trait)</option>
                  <option value="SC">SC (Hemoglobin SC Disease)</option>
                  <option value="Unknown">I don't know my genotype yet</option>
                  <option value="Other">Other variant</option>
                </select>
              </div>
              <small className="form-help">
                Stored securely in the <code>Users</code> table with Supabase Row Level Security.
              </small>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spinner" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{isSignUp ? 'Complete Registration' : 'Sign In'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
