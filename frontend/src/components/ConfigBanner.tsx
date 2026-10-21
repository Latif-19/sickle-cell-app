import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export const ConfigBanner: React.FC = () => {
  const { isConfigured } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const envSample = `VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-public-key`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isConfigured) {
    return (
      <div className="banner banner-success">
        <div className="banner-content">
          <CheckCircle2 size={18} className="banner-icon-success" />
          <span>
            <strong>Supabase Connected:</strong> Live PostgreSQL authentication and database sync active.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="banner banner-warning">
      <div className="banner-top">
        <div className="banner-content">
          <AlertTriangle size={18} className="banner-icon-warning" />
          <span>
            <strong>Demo / Local Mode:</strong> Supabase API credentials are not yet configured in <code>frontend/.env</code>. The app is currently using interactive local storage.
          </span>
        </div>
        <div className="banner-buttons">
          <button className="banner-toggle-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Hide Setup Guide' : 'How to Connect Supabase'}
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="banner-details">
          <div className="setup-steps">
            <h4>Quick 3-Step Setup for Supabase:</h4>
            <ol>
              <li>
                <strong>Create Supabase Project:</strong> Go to{' '}
                <a href="https://supabase.com" target="_blank" rel="noreferrer">supabase.com</a> and create a new project.
              </li>
              <li>
                <strong>Execute Schema:</strong> Go to the <em>SQL Editor</em> in your Supabase dashboard and run the script found in{' '}
                <code>supabase/schema.sql</code>. This creates the <code>Users</code> and <code>Quiz_Scores</code> tables, triggers, and RLS policies.
              </li>
              <li>
                <strong>Update Environment Variables:</strong> Copy your project URL & anon public key into <code>frontend/.env</code>:
                <div className="code-box">
                  <pre>{envSample}</pre>
                  <button className="copy-btn" onClick={copyToClipboard}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
