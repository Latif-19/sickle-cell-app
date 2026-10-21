import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Dna, Save, CheckCircle, Heart, ShieldAlert, Sparkles } from 'lucide-react';
import type { Genotype } from '../types/database';

export const UserProfileComponent: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [genotype, setGenotype] = useState<Genotype>(profile?.genotype || 'AS');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!profile) {
    return (
      <div className="empty-state">
        <User size={48} className="empty-icon" />
        <h3>No Active Profile</h3>
        <p>Please sign in or register to view and update your profile details.</p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const { error } = await updateProfile({ name, genotype, bio });
    setSaving(false);
    if (!error) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const getGenotypeAdvice = (gt: Genotype) => {
    switch (gt) {
      case 'AA':
        return {
          title: 'Genotype AA (Normal)',
          badgeColor: 'badge-green',
          summary: 'You do not have sickle cell trait or disease. You are genetically compatible with partners of any genotype (AA, AS, SS, AC, SC).',
          icon: <CheckCircle className="text-green-500" size={20} />
        };
      case 'AS':
        return {
          title: 'Genotype AS (Sickle Cell Trait Carrier)',
          badgeColor: 'badge-yellow',
          summary: 'You are healthy and generally unaffected by sickle cell symptoms. When choosing a partner, be aware that having children with another carrier (AS, AC, SS, SC) carries a chance of sickle cell disease.',
          icon: <Heart className="text-amber-500" size={20} />
        };
      case 'SS':
        return {
          title: 'Genotype SS (Sickle Cell Disease / Anemia)',
          badgeColor: 'badge-red',
          summary: 'Both hemoglobin genes carry the sickle mutation. Priority is hydration, regular medical follow-ups, avoiding sudden hypothermia or dehydration, and prompt crisis care.',
          icon: <ShieldAlert className="text-rose-500" size={20} />
        };
      case 'AC':
        return {
          title: 'Genotype AC (Hemoglobin C Trait)',
          badgeColor: 'badge-blue',
          summary: 'You carry the hemoglobin C gene. Like AS, you are typically asymptomatic, but can pass the trait or combine with S to produce SC disease.',
          icon: <Sparkles className="text-blue-500" size={20} />
        };
      case 'SC':
        return {
          title: 'Genotype SC (Hemoglobin SC Disease)',
          badgeColor: 'badge-purple',
          summary: 'A variant form of sickle cell disease. Similar considerations to SS regarding hydration and health vigilance apply.',
          icon: <ShieldAlert className="text-purple-500" size={20} />
        };
      default:
        return {
          title: 'Genotype Pending / Unknown',
          badgeColor: 'badge-gray',
          summary: 'Knowing your genotype empowers informed family planning and proactive health decisions. Consider doing a simple hemoglobin electrophoresis test.',
          icon: <Dna className="text-gray-500" size={20} />
        };
    }
  };

  const advice = getGenotypeAdvice(profile.genotype);

  return (
    <div className="profile-wrapper">
      <div className="profile-grid">
        {/* Profile Card */}
        <div className="card profile-card">
          <div className="card-header">
            <div className="avatar-circle">
              <span>{profile.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="profile-name">{profile.name}</h2>
              <p className="profile-email">
                <Mail size={14} className="inline-icon" /> {profile.email}
              </p>
            </div>
          </div>

          <div className="genotype-pill-container">
            <span className={`genotype-pill ${advice.badgeColor}`}>
              <Dna size={16} /> Genotype: <strong>{profile.genotype}</strong>
            </span>
            <span className="join-date">
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Hemoglobin Genotype</label>
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
                <option value="Unknown">Unknown</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Personal Health Notes / Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share any health notes or goals..."
              />
            </div>

            <div className="form-footer">
              <button type="submit" className="save-btn" disabled={saving}>
                <Save size={16} />
                <span>{saving ? 'Updating...' : 'Save Changes'}</span>
              </button>

              {savedSuccess && (
                <span className="save-success">
                  <CheckCircle size={16} /> Updated in Supabase Users table!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Personalized Medical Guidance Card */}
        <div className="card advice-card">
          <div className="card-header">
            {advice.icon}
            <h3 className="card-title">{advice.title}</h3>
          </div>
          <p className="advice-text">{advice.summary}</p>

          <div className="database-schema-preview">
            <h4>Supabase Schema Mapping</h4>
            <div className="schema-badge-list">
              <div className="schema-row">
                <code>id</code>
                <span>{profile.id}</span>
              </div>
              <div className="schema-row">
                <code>name</code>
                <span>{profile.name}</span>
              </div>
              <div className="schema-row">
                <code>email</code>
                <span>{profile.email}</span>
              </div>
              <div className="schema-row">
                <code>genotype</code>
                <span className="font-semibold text-crimson">{profile.genotype}</span>
              </div>
              <div className="schema-row">
                <code>created_at</code>
                <span>{profile.created_at}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
