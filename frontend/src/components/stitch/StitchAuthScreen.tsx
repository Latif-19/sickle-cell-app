import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Icon } from '../ui/Icon';
import type { Genotype, UserRole } from '../../types/database';

interface StitchAuthScreenProps {
  onSuccess?: () => void;
}

export const StitchAuthScreen: React.FC<StitchAuthScreenProps> = ({ onSuccess }) => {
  const { user, profile, signIn, signUp, signOut, updateProfile, switchRole, resendConfirmationEmail, verifyOtp } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>('user');
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [usePartnerCode, setUsePartnerCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [genotype, setGenotype] = useState<Genotype>(profile?.genotype || 'AS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email Confirmation & 6-Digit OTP States
  const [emailVerificationPending, setEmailVerificationPending] = useState<string | null>(null);
  const [otpToken, setOtpToken] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccessMsg, setResendSuccessMsg] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);

  // Password Complexity Validation Criteria (Live Real-Time Checklist matching Supabase)
  const hasMinLength = password.length >= 8;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasLowercase && hasUppercase && hasNumber && hasSymbol;

  const handleResendEmail = async (targetEmail: string) => {
    setResendingEmail(true);
    setResendSuccessMsg(null);
    setError(null);
    try {
      const { error: resendError } = await resendConfirmationEmail(targetEmail);
      if (resendError) {
        setError(`Failed to resend confirmation email: ${resendError.message}`);
      } else {
        setResendSuccessMsg(`Confirmation email successfully resent to ${targetEmail}! Please check your inbox and spam folder.`);
      }
    } catch (err: any) {
      setError(err?.message || 'Error resending verification email');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = emailVerificationPending || unconfirmedEmail;
    if (!targetEmail || !otpToken.trim()) return;
    setVerifyingOtp(true);
    setError(null);
    setResendSuccessMsg(null);
    try {
      const { error: otpError } = await verifyOtp(targetEmail, otpToken.trim());
      if (otpError) {
        setError(`Invalid or expired verification code: ${otpError.message}`);
      } else {
        setSuccessMsg('Email successfully verified! Entering your workspace...');
        setEmailVerificationPending(null);
        setUnconfirmedEmail(null);
        if (onSuccess) setTimeout(onSuccess, 600);
      }
    } catch (err: any) {
      setError(err?.message || 'Error verifying code');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleCheckConfirmed = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSuccessMsg('Email confirmation verified! Entering your workspace...');
        setEmailVerificationPending(null);
        if (onSuccess) setTimeout(onSuccess, 500);
        return;
      }
    } catch (e) {
      // fallback
    }
    setEmailVerificationPending(null);
    setActiveTab('signin');
    if (emailVerificationPending) setEmail(emailVerificationPending);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setResendSuccessMsg(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (activeTab === 'signup') {
        if (!name.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        if (!hasMinLength || !hasLowercase || !hasUppercase || !hasNumber || !hasSymbol) {
          setError('Please ensure your password meets all criteria in the checklist below.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please ensure both password fields are identical.');
          setLoading(false);
          return;
        }
        const { error: signUpError, needsEmailConfirmation } = await signUp(cleanEmail, password, name, genotype, role);
        if (signUpError) {
          const msg = signUpError.message;
          if (msg.toLowerCase().includes('error sending confirmation email')) {
            setError('Unable to send confirmation email (Supabase rate limit reached). To allow users to register instantly without email confirmation, toggle off "Confirm email" in Supabase Dashboard > Authentication > Providers > Email.');
          } else if (
            msg.toLowerCase().includes('abcdefghijklmnopqrstuvwxyz') ||
            msg.toLowerCase().includes('password should contain') ||
            msg.toLowerCase().includes('password should be at least')
          ) {
            setError('Password does not meet the security criteria. Please follow the checklist below.');
          } else {
            setError(msg);
          }
        } else if (needsEmailConfirmation) {
          setEmailVerificationPending(cleanEmail);
          setSuccessMsg(null);
        } else {
          setSuccessMsg('Account registered successfully! Redirecting...');
          if (onSuccess) setTimeout(onSuccess, 800);
        }
      } else {
        const { error: signInError } = await signIn(cleanEmail, password);
        if (signInError) {
          const msg = signInError.message.toLowerCase();
          if (msg.includes('email not confirmed')) {
            setError('Your email has not been confirmed yet. Please verify your email via the confirmation link sent to your inbox before signing in.');
            setUnconfirmedEmail(cleanEmail);
          } else if (msg.includes('invalid login credentials')) {
            setError('Invalid login credentials. Please check your email and password, or verify your email if confirmation is still pending. You can also resend verification below.');
            setUnconfirmedEmail(cleanEmail);
          } else {
            setError(signInError.message);
            setUnconfirmedEmail(null);
          }
        } else {
          setSuccessMsg('Signed in successfully!');
          setUnconfirmedEmail(null);
          if (onSuccess) setTimeout(onSuccess, 800);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGenotype = async (newGenotype: Genotype) => {
    setGenotype(newGenotype);
    if (profile) {
      await updateProfile({ genotype: newGenotype });
      setSuccessMsg(`Genotype updated to ${newGenotype} successfully!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Educational & Clinical Trust Section with Subtle DNA Strand Watermark (6 Columns on Desktop) */}
        <div className="lg:col-span-6 isolate relative overflow-hidden rounded-3xl bg-surface-container-lowest p-6 sm:p-10 border border-surface-variant/40 shadow-sm flex flex-col gap-6">
          {/* Subtle DNA Strand Background Watermark Layer strictly clipped to this container */}
          <div
            className="absolute inset-0 -z-10 bg-[url('/dna-helix-bg.svg')] bg-no-repeat bg-cover bg-center opacity-[0.07] pointer-events-none select-none"
            style={{ backgroundImage: "url('/dna-helix-bg.svg')" }}
            aria-hidden="true"
          />

          <h1 className="font-headline-xl text-3xl sm:text-5xl text-on-surface font-black tracking-tight leading-tight">
            Knowledge is empowerment for future generations.
          </h1>

          <p className="font-body-lg text-base sm:text-lg text-on-surface-variant leading-relaxed">
            By recording your hemoglobin genotype, our decision support platform provides accurate, personalized inheritance calculations while preserving complete medical privacy and confidentiality.
          </p>

          {/* Value Props Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-surface-container-low/70 backdrop-blur-xs p-5 rounded-3xl border border-surface-variant/40 shadow-xs flex flex-col gap-2">
              <div className="w-10 h-10 rounded-2xl bg-primary-container text-on-surface flex items-center justify-center font-bold">
                <Icon name="calculate" className="w-6 h-6 text-on-surface" size={24} />
              </div>
              <h4 className="font-headline-sm text-sm font-bold text-on-surface">Exact Mendelian Ratios</h4>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Calculates precise 25%, 50%, and 100% reproductive risks for any parental combination.
              </p>
            </div>

            <div className="bg-surface-container-low/70 backdrop-blur-xs p-5 rounded-3xl border border-surface-variant/40 shadow-xs flex flex-col gap-2">
              <div className="w-10 h-10 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center font-bold">
                <Icon name="lock" className="w-6 h-6 text-secondary" size={24} />
              </div>
              <h4 className="font-headline-sm text-sm font-bold text-on-surface">Private & Confidential</h4>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Your personal health genotype data and family planning decisions are strictly protected.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2 text-on-surface-variant font-label-sm text-xs">
            <div className="flex items-center gap-1.5">
              <Icon name="verified_user" className="w-4 h-4 text-secondary" size={18} />
              <span>Ghana Data Protection Act (Act 843) Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon name="shield" className="w-4 h-4 text-secondary" size={18} />
              <span>256-Bit SSL Encryption</span>
            </div>
          </div>
        </div>

        {/* Right Column: Radiant Floating Card (6 Columns on Desktop) */}
        <div className="lg:col-span-6 w-full max-w-xl mx-auto lg:mx-0">
          <div className="relative bg-primary-container text-on-primary-fixed rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_-12px_rgba(116,91,0,0.25),0_8px_24px_-4px_rgba(28,27,27,0.08)] overflow-hidden">
            {/* Decorative Patterns */}
            <div className="absolute -right-10 -top-10 w-44 h-44 opacity-10 pointer-events-none">
              <svg fill="currentColor" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="40" stroke="currentColor" strokeWidth="8" />
                <path d="M50 20 A30 30 0 0 1 80 50" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="8" />
              </svg>
            </div>

            <div className="flex flex-col gap-2 mb-6">
              <h2 className="font-headline-xl text-2xl sm:text-3xl text-inverse-surface font-black tracking-tight leading-snug">
                {user ? `Welcome, ${profile?.name || 'Member'}` : 'Make informed choices together.'}
              </h2>
              <p className="font-body-md text-xs sm:text-sm text-on-primary-fixed-variant leading-relaxed">
                {user
                  ? `Signed in as ${profile?.email}. Hemoglobin genotype is registered as ${profile?.genotype}.`
                  : 'Access personalized inheritance probabilities and verified counseling tools.'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-inverse-surface text-surface rounded-2xl text-xs sm:text-sm flex flex-col gap-2.5 shadow-md border border-outline/30 font-medium animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <Icon name="info" className="w-5 h-5 text-primary-container shrink-0 mt-0.5" size={20} />
                  <div className="flex flex-col gap-1 leading-snug">
                    <span className="font-bold text-surface">
                      {error.toLowerCase().includes('rate limit')
                        ? 'Email Rate Limit Exceeded'
                        : error.toLowerCase().includes('504')
                        ? 'SMTP Server Connection Timeout (HTTP 504)'
                        : error.toLowerCase().includes('abcdefghijklmnopqrstuvwxyz') || error.toLowerCase().includes('password should contain')
                        ? 'Password Requirements Not Met'
                        : error}
                    </span>
                    {error.toLowerCase().includes('abcdefghijklmnopqrstuvwxyz') || error.toLowerCase().includes('password should contain') ? (
                      <p className="text-surface/80 text-xs font-normal leading-relaxed">
                        Please ensure your password has at least 8 characters, with uppercase, lowercase, and numbers as shown in the checklist below.
                      </p>
                    ) : error.toLowerCase().includes('rate limit') ? (
                      <p className="text-surface/80 text-xs font-normal leading-relaxed">
                        Supabase free projects limit built-in emails to ~3-4 per hour. To sign in immediately without waiting, turn <strong>OFF &quot;Confirm email&quot;</strong> in your Supabase Dashboard under <strong>Authentication &rarr; Sign In / Providers &rarr; Email</strong>.
                      </p>
                    ) : error.toLowerCase().includes('504') ? (
                      <p className="text-surface/80 text-xs font-normal leading-relaxed">
                        Supabase timed out while attempting to connect to your SMTP mail server. This means the <strong>Host</strong>, <strong>Port</strong> (switch between <strong>587</strong> and <strong>465</strong>), or <strong>Password/API Key</strong> in your Supabase <strong>SMTP Settings</strong> could not be reached.
                      </p>
                    ) : null}
                  </div>
                </div>
                {unconfirmedEmail && !error.toLowerCase().includes('rate limit') && (
                  <button
                    type="button"
                    disabled={resendingEmail}
                    onClick={() => handleResendEmail(unconfirmedEmail)}
                    className="self-start mt-1 px-4 py-2 rounded-full bg-primary-container text-on-surface text-xs font-bold hover:brightness-105 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Icon name="forward_to_inbox" className="w-4 h-4" size={15} />
                    <span>{resendingEmail ? 'Resending...' : `Resend Confirmation to ${unconfirmedEmail}`}</span>
                  </button>
                )}
              </div>
            )}

            {resendSuccessMsg && (
              <div className="mb-4 p-3.5 bg-secondary text-on-secondary rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-sm font-semibold">
                <Icon name="mark_email_read" className="w-4 h-4 text-on-secondary" size={18} />
                <span>{resendSuccessMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3.5 bg-secondary text-on-secondary rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-sm font-semibold">
                <Icon name="check_circle" className="w-4 h-4 text-on-secondary" size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            {user && profile ? (
              /* Authenticated User View */
              <div className="flex flex-col gap-4">
                <div className="bg-surface-container-lowest text-on-surface rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-surface-variant/30 pb-3">
                    <div className="flex flex-col">
                      <span className="font-label-sm uppercase tracking-wider text-on-surface-variant font-bold text-xs">
                        Active Account
                      </span>
                      <span className="font-headline-sm text-sm font-bold text-on-surface">
                        {profile.name}
                      </span>
                    </div>

                    <span className={`px-3 py-1 rounded-full font-label-md font-bold text-xs flex items-center gap-1 ${
                      profile.role === 'professional'
                        ? 'bg-secondary-container text-secondary'
                        : 'bg-primary-container text-on-surface'
                    }`}>
                      <Icon
                        name={profile.role === 'professional' ? 'verified' : 'genetics'}
                        className="w-3.5 h-3.5"
                        size={14}
                      />
                      <span>{profile.role === 'professional' ? 'Clinician' : `Hb ${profile.genotype}`}</span>
                    </span>
                  </div>

                  {/* Account Access Card */}
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-variant/50 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-xs font-bold text-on-surface">
                        Account Access Level
                      </span>
                      <span className="font-label-sm text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full bg-primary-container text-on-surface">
                        {profile.role === 'professional' ? 'Clinician Role' : 'Patient Account'}
                      </span>
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                      {profile.role === 'professional'
                        ? 'You have clinical access. You can switch to Patient view to use the calculator and educational tools.'
                        : 'You are viewing as a patient with access to personal inheritance calculations and quiz tracking.'}
                    </p>
                    {profile.role === 'professional' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => switchRole('user')}
                          className="px-3.5 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold border border-surface-variant transition-all cursor-pointer flex items-center gap-1.5"
                          type="button"
                        >
                          <Icon name="swap_horiz" className="w-3.5 h-3.5" size={15} />
                          <span>Switch to Patient Role</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {profile.role === 'user' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-xs font-bold text-on-surface">Update Hemoglobin Genotype</label>
                      <select
                        value={genotype}
                        onChange={(e) => handleUpdateGenotype(e.target.value as Genotype)}
                        className="w-full h-12 px-3 rounded-xl bg-surface-container-low border border-surface-variant font-body-md text-xs sm:text-sm text-on-surface focus:outline-none"
                      >
                        <option value="AA">Hb AA — Normal Hemoglobin</option>
                        <option value="AS">Hb AS — Sickle Cell Trait Carrier</option>
                        <option value="SS">Hb SS — Sickle Cell Disease</option>
                        <option value="AC">Hb AC — Hemoglobin C Trait</option>
                        <option value="SC">Hb SC — Hemoglobin SC Disease</option>
                        <option value="Unknown">Unknown / Pending Test</option>
                        <option value="Other">Other Variant</option>
                      </select>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => signOut()}
                  className="w-full h-13 rounded-full bg-inverse-surface text-surface font-headline-sm text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer shadow-md font-bold"
                  type="button"
                >
                  <Icon name="logout" className="w-5 h-5 text-surface" size={20} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : emailVerificationPending ? (
              /* Dedicated Email Verification Pending View */
              <div className="bg-surface-container-lowest text-on-surface p-6 sm:p-8 rounded-3xl border border-surface-variant/40 shadow-sm flex flex-col gap-5 text-center items-center animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-secondary-container text-secondary flex items-center justify-center shadow-sm ring-8 ring-secondary-container/40">
                  <Icon name="mark_email_read" className="w-8 h-8 text-secondary" size={32} />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="inline-flex items-center gap-1.5 font-label-sm text-[11px] bg-secondary-container text-secondary px-3.5 py-1 rounded-full uppercase tracking-wider font-extrabold self-center">
                    Strong Security Verification
                  </span>
                  <h3 className="font-headline-lg text-2xl font-black text-on-surface">
                    Two-Factor Email Verification
                  </h3>
                  <p className="font-body-md text-sm text-on-surface-variant max-w-sm leading-relaxed">
                    A security verification code was dispatched to:
                  </p>
                  <div className="bg-surface-container-low px-4 py-2 rounded-xl font-headline-sm text-sm font-bold text-on-surface select-all border border-surface-variant/60">
                    {emailVerificationPending}
                  </div>
                </div>

                {/* Primary: Security OTP Input Form */}
                <form onSubmit={handleVerifyOtp} className="w-full flex flex-col gap-3 pt-2">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="font-label-md text-xs font-bold text-on-surface flex items-center justify-between">
                      <span>Enter Security Verification Code</span>
                      <span className="text-[11px] text-secondary font-bold">from your inbox</span>
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="• • • • • • • •"
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value.replace(/\s+/g, ''))}
                      className="w-full h-14 px-4 text-center tracking-[0.35em] font-headline-xl text-2xl font-black bg-surface-container-low border border-surface-variant rounded-2xl text-on-surface focus:outline-none focus:border-secondary shadow-sm"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={verifyingOtp || !otpToken.trim()}
                    className="w-full h-12 rounded-full bg-secondary text-on-secondary font-label-lg text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Icon name="verified_user" className="w-5 h-5 text-on-secondary" size={18} />
                    <span>{verifyingOtp ? 'Verifying Code...' : 'Submit Verification Code & Sign In'}</span>
                  </button>
                </form>

                {/* Secondary Actions */}
                <div className="flex flex-col w-full gap-2 pt-2 border-t border-surface-variant/40">
                  <button
                    type="button"
                    disabled={resendingEmail}
                    onClick={() => handleResendEmail(emailVerificationPending)}
                    className="w-full h-11 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-xs font-bold flex items-center justify-center gap-2 border border-surface-variant transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Icon name="forward_to_inbox" className="w-4 h-4" size={16} />
                    <span>{resendingEmail ? 'Resending Code...' : 'Resend Verification Code'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCheckConfirmed}
                    className="text-xs text-on-surface-variant hover:text-on-surface font-semibold py-1 cursor-pointer"
                  >
                    Received a confirmation link instead? Click here to continue
                  </button>
                </div>
              </div>
            ) : (
              /* Sign In / Sign Up Form */
              <>
                <div className="bg-inverse-surface/10 p-1 rounded-full flex items-center mb-5">
                  <button
                    className={`flex-1 py-2.5 rounded-full font-label-md text-xs sm:text-sm text-center transition-all cursor-pointer ${
                      activeTab === 'signin'
                        ? 'bg-inverse-surface text-surface shadow-sm font-bold'
                        : 'text-inverse-surface font-medium hover:text-on-primary-fixed'
                    }`}
                    onClick={() => setActiveTab('signin')}
                    type="button"
                  >
                    Sign In
                  </button>
                  <button
                    className={`flex-1 py-2.5 rounded-full font-label-md text-xs sm:text-sm text-center transition-all cursor-pointer ${
                      activeTab === 'signup'
                        ? 'bg-inverse-surface text-surface shadow-sm font-bold'
                        : 'text-inverse-surface font-medium hover:text-on-primary-fixed'
                    }`}
                    onClick={() => setActiveTab('signup')}
                    type="button"
                  >
                    Create Account
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {activeTab === 'signup' && (
                    <div className="flex flex-col gap-3">
                      {/* Account Role Selector */}
                      <div className="grid grid-cols-2 gap-2 bg-surface-container-lowest p-1.5 rounded-2xl shadow-sm border border-surface-variant/30">
                        <button
                          type="button"
                          onClick={() => setRole('user')}
                          className={`py-2 px-3 rounded-xl font-label-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            role === 'user'
                              ? 'bg-primary-container text-on-surface shadow-sm'
                              : 'text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          <Icon name="person" className="w-4 h-4" size={16} />
                          <span>Patient / User</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('professional')}
                          className={`py-2 px-3 rounded-xl font-label-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            role === 'professional'
                              ? 'bg-inverse-surface text-surface shadow-sm'
                              : 'text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          <Icon name="medical_services" className="w-4 h-4" size={16} />
                          <span>Clinician</span>
                        </button>
                      </div>

                      {role === 'professional' ? (
                        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-variant/50 shadow-sm flex flex-col gap-3 text-left animate-in fade-in duration-150">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-primary-container text-on-surface flex items-center justify-center shrink-0">
                              <Icon name="stethoscope" className="w-5 h-5 text-on-surface" size={18} />
                            </div>
                            <div>
                              <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                                Clinician Registration Notice
                              </h4>
                              <p className="text-[11px] text-on-surface-variant font-medium">Ghana Medical Service</p>
                            </div>
                          </div>

                          <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                            We are currently verifying with the Ghana Medical Service to strictly verify healthcare personnel before allowing clinical registration.
                          </p>

                          <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                            To explore all clinical inheritance calculators and patient genetics tools right now, please sign up with a standard account.
                          </p>

                          <button
                            type="button"
                            onClick={() => setRole('user')}
                            className="mt-1 py-2 px-4 rounded-xl bg-primary-container text-on-surface font-label-md text-xs font-bold self-start flex items-center gap-2 hover:brightness-95 active:scale-95 transition-all shadow-sm cursor-pointer"
                          >
                            <Icon name="person" className="w-4 h-4 text-on-surface" size={16} />
                            <span>Continue as Patient / User</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="font-label-md text-xs font-bold text-inverse-surface flex items-center justify-between">
                              <span>Full Legal Name</span>
                              <span className="font-body-sm text-[11px] text-on-primary-fixed-variant">
                                Medical record match
                              </span>
                            </label>
                            <div className="relative flex items-center">
                              <Icon name="person" className="absolute left-4 text-outline" size={20} />
                              <input
                                className="w-full h-13 pl-11 pr-4 py-3 bg-surface-container-lowest text-on-surface rounded-2xl font-body-md text-xs sm:text-sm placeholder:text-outline/70 focus:outline-none shadow-sm"
                                placeholder="e.g. Alex Morgan"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="font-label-md text-xs font-bold text-inverse-surface flex items-center justify-between">
                              <span>Hemoglobin Genotype</span>
                              <span className="font-body-sm text-[11px] text-on-primary-fixed-variant">
                                For personalized risk analysis
                              </span>
                            </label>
                            <div className="relative flex items-center">
                              <Icon name="genetics" className="absolute left-4 text-outline" size={20} />
                              <select
                                className="w-full h-13 pl-11 pr-4 py-3 bg-surface-container-lowest text-on-surface rounded-2xl font-body-md text-xs sm:text-sm focus:outline-none shadow-sm appearance-none"
                                value={genotype}
                                onChange={(e) => setGenotype(e.target.value as Genotype)}
                              >
                                <option value="AA">Hb AA — Normal Hemoglobin</option>
                                <option value="AS">Hb AS — Sickle Cell Trait Carrier</option>
                                <option value="SS">Hb SS — Sickle Cell Disease</option>
                                <option value="AC">Hb AC — Hemoglobin C Trait</option>
                                <option value="SC">Hb SC — Hemoglobin SC Disease</option>
                                <option value="Unknown">I don't know my genotype</option>
                                <option value="Other">Other Variant</option>
                              </select>
                              <Icon name="expand_more" className="absolute right-4 text-outline pointer-events-none" size={20} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Standard Sign-In or Active Patient Sign-Up Fields */}
                  {!(activeTab === 'signup' && role === 'professional') && (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-xs font-bold text-inverse-surface">
                          Email Address
                        </label>
                        <div className="relative flex items-center">
                          <Icon name="mail" className="absolute left-4 text-outline" size={20} />
                          <input
                            className="w-full h-13 pl-11 pr-4 py-3 bg-surface-container-lowest text-on-surface rounded-2xl font-body-md text-xs sm:text-sm placeholder:text-outline/70 focus:outline-none shadow-sm"
                            placeholder="name@example.com"
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="font-label-md text-xs font-bold text-inverse-surface">
                            {usePartnerCode ? 'Partner Access Code' : 'Password'}
                          </label>
                          <button
                            className="font-label-sm text-[11px] uppercase tracking-wider text-inverse-surface underline underline-offset-2 hover:opacity-80 cursor-pointer font-bold"
                            onClick={() => setUsePartnerCode(!usePartnerCode)}
                            type="button"
                          >
                            {usePartnerCode ? 'Use Password' : 'Use Partner Code'}
                          </button>
                        </div>
                        <div className="relative flex items-center">
                          <Icon name={usePartnerCode ? 'pin' : 'key'} className="absolute left-4 text-outline" size={20} />
                          <input
                            className="w-full h-13 pl-11 pr-11 py-3 bg-surface-container-lowest text-on-surface rounded-2xl font-body-md text-xs sm:text-sm placeholder:text-outline/70 focus:outline-none shadow-sm"
                            placeholder={usePartnerCode ? 'e.g. SCT-742-PAIR' : '••••••••••••'}
                            required
                            type={showPassword || usePartnerCode ? 'text' : 'password'}
                            value={usePartnerCode ? partnerCode : password}
                            onChange={(e) =>
                              usePartnerCode ? setPartnerCode(e.target.value) : setPassword(e.target.value)
                            }
                          />
                          {!usePartnerCode && (
                            <button
                              aria-label="Toggle password visibility"
                              className="absolute right-3.5 text-outline hover:text-on-surface flex items-center justify-center p-1 cursor-pointer"
                              onClick={() => setShowPassword(!showPassword)}
                              type="button"
                            >
                              <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Live Password Requirements Checklist */}
                      {activeTab === 'signup' && !usePartnerCode && (
                        <div className="p-3.5 bg-surface-container-lowest/85 backdrop-blur-sm rounded-2xl border border-outline/25 shadow-xs flex flex-col gap-2.5 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between">
                            <span className="font-label-sm text-[11px] font-extrabold text-inverse-surface uppercase tracking-wider">
                              Password Requirements
                            </span>
                            <span className={`text-[11px] font-bold ${
                              isPasswordValid ? 'text-secondary font-black' : 'text-on-surface-variant'
                            }`}>
                              {isPasswordValid ? 'All criteria met ✓' : 'Incomplete'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className={`flex items-center gap-2 transition-colors ${
                              hasMinLength ? 'text-secondary font-bold' : 'text-on-surface-variant'
                            }`}>
                              <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 font-bold transition-all ${
                                hasMinLength
                                  ? 'bg-secondary text-on-secondary shadow-xs ring-1 ring-secondary'
                                  : 'border border-outline/40 bg-surface-container-lowest text-transparent'
                              }`}>
                                ✓
                              </span>
                              <span>At least 8 characters</span>
                            </div>

                            <div className={`flex items-center gap-2 transition-colors ${
                              hasUppercase ? 'text-secondary font-bold' : 'text-on-surface-variant'
                            }`}>
                              <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 font-bold transition-all ${
                                hasUppercase
                                  ? 'bg-secondary text-on-secondary shadow-xs ring-1 ring-secondary'
                                  : 'border border-outline/40 bg-surface-container-lowest text-transparent'
                              }`}>
                                ✓
                              </span>
                              <span>One uppercase letter (A-Z)</span>
                            </div>

                            <div className={`flex items-center gap-2 transition-colors ${
                              hasLowercase ? 'text-secondary font-bold' : 'text-on-surface-variant'
                            }`}>
                              <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 font-bold transition-all ${
                                hasLowercase
                                  ? 'bg-secondary text-on-secondary shadow-xs ring-1 ring-secondary'
                                  : 'border border-outline/40 bg-surface-container-lowest text-transparent'
                              }`}>
                                ✓
                              </span>
                              <span>One lowercase letter (a-z)</span>
                            </div>

                            <div className={`flex items-center gap-2 transition-colors ${
                              hasNumber ? 'text-secondary font-bold' : 'text-on-surface-variant'
                            }`}>
                              <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 font-bold transition-all ${
                                hasNumber
                                  ? 'bg-secondary text-on-secondary shadow-xs ring-1 ring-secondary'
                                  : 'border border-outline/40 bg-surface-container-lowest text-transparent'
                              }`}>
                                ✓
                              </span>
                              <span>One number (0-9)</span>
                            </div>

                            <div className={`sm:col-span-2 flex items-center gap-2 transition-colors ${
                              hasSymbol ? 'text-secondary font-bold' : 'text-on-surface-variant'
                            }`}>
                              <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 font-bold transition-all ${
                                hasSymbol
                                  ? 'bg-secondary text-on-secondary shadow-xs ring-1 ring-secondary'
                                  : 'border border-outline/40 bg-surface-container-lowest text-transparent'
                              }`}>
                                ✓
                              </span>
                              <span>One special symbol (!@#$%^&*...)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'signup' && (
                        <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between">
                            <label className="font-label-md text-xs font-bold text-inverse-surface">
                              Confirm Password
                            </label>
                            {confirmPassword && (
                              <span className={`font-label-sm text-[11px] font-bold ${
                                password === confirmPassword ? 'text-secondary' : 'text-amber-800'
                              }`}>
                                {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                              </span>
                            )}
                          </div>
                          <div className="relative flex items-center">
                            <Icon name="lock" className="absolute left-4 text-outline" size={20} />
                            <input
                              className="w-full h-13 pl-11 pr-11 py-3 bg-surface-container-lowest text-on-surface rounded-2xl font-body-md text-xs sm:text-sm placeholder:text-outline/70 focus:outline-none shadow-sm"
                              placeholder="Re-enter your password"
                              required
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                              aria-label="Toggle confirm password visibility"
                              className="absolute right-3.5 text-outline hover:text-on-surface flex items-center justify-center p-1 cursor-pointer"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              type="button"
                            >
                              <Icon name={showConfirmPassword ? 'visibility_off' : 'visibility'} size={20} />
                            </button>
                          </div>
                        </div>
                      )}

                      <button
                        className="w-full h-13 rounded-full bg-inverse-surface text-surface font-headline-sm text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform cursor-pointer font-bold mt-2"
                        disabled={loading}
                        type="submit"
                      >
                        <Icon name={activeTab === 'signup' ? 'verified' : 'login'} size={20} />
                        <span>
                          {loading
                            ? 'Authenticating...'
                            : activeTab === 'signup'
                            ? 'Register Account'
                            : 'Enter Secure Workspace'}
                        </span>
                      </button>
                    </>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
