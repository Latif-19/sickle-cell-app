import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, User as UserIcon, LogOut, LogIn, Award, BookOpen } from 'lucide-react';

interface NavbarProps {
  activeTab: 'quiz' | 'history' | 'genotypes' | 'profile';
  setActiveTab: (tab: 'quiz' | 'history' | 'genotypes' | 'profile') => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openAuthModal }) => {
  const { profile, signOut } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="logo-section" onClick={() => setActiveTab('quiz')}>
          <div className="logo-icon-wrapper">
            <Activity className="logo-icon" />
          </div>
          <div>
            <span className="logo-title">SickleCell Care</span>
            <span className="logo-subtitle">Awareness & Health Portal</span>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            <BookOpen size={18} />
            <span>Take Quiz</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Award size={18} />
            <span>Quiz History</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'genotypes' ? 'active' : ''}`}
            onClick={() => setActiveTab('genotypes')}
          >
            <Activity size={18} />
            <span>Genotype Guide</span>
          </button>

          {profile ? (
            <button
              className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <UserIcon size={18} />
              <span>{profile.name} ({profile.genotype})</span>
            </button>
          ) : null}
        </nav>

        <div className="nav-actions">
          {profile ? (
            <button className="auth-btn logout-btn" onClick={() => signOut()}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          ) : (
            <button className="auth-btn login-btn" onClick={openAuthModal}>
              <LogIn size={16} />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
