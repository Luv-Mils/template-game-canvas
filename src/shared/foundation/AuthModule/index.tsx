/**
 * AuthModule — Foundation Component (FND-05)
 *
 * Auth UI shells for ALL templates:
 * - LoginForm: email + password
 * - SignupForm: name + email + password + confirm
 * - ForgotPasswordForm: email only
 * - AuthCard: wrapper with brand, view switching
 *
 * These are UI shells only — no auth backend logic.
 * Templates wire onLogin/onSignup/onForgotPassword to their auth provider.
 *
 * Usage:
 *   <AuthCard config={{ brandName: 'MyApp', onLogin: handleLogin }} />
 */

import React, { useState } from 'react';
import type { AuthView, AuthConfig } from './types';

// ── Individual Forms ─────────────────────────────────────────────────────────

function LoginForm({
  onSubmit,
  loading,
}: {
  onSubmit: (email: string, password: string) => void;
  loading: boolean;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(email, password);
      }}
      className="space-y-5"
    >
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-2">Email</label>
        <input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-foreground mb-2">Password</label>
        <input
          id="login-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}

function SignupForm({
  onSubmit,
  loading,
  termsUrl,
  privacyUrl,
}: {
  onSubmit: (email: string, password: string, name: string) => void;
  loading: boolean;
  termsUrl?: string;
  privacyUrl?: string;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (password !== confirm) {
          setError('Passwords do not match');
          return;
        }
        setError('');
        onSubmit(email, password, name);
      }}
      className="space-y-5"
    >
      <div>
        <label htmlFor="signup-name" className="block text-sm font-medium text-foreground mb-2">Full Name</label>
        <input
          id="signup-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="John Doe"
        />
      </div>
      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium text-foreground mb-2">Email</label>
        <input
          id="signup-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium text-foreground mb-2">Password</label>
        <input
          id="signup-password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="••••••••"
        />
      </div>
      <div>
        <label htmlFor="signup-confirm" className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
        <input
          id="signup-confirm"
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="••••••••"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {(termsUrl || privacyUrl) && (
        <p className="text-xs text-muted">
          By signing up you agree to our{' '}
          {termsUrl && <a href={termsUrl} className="text-primary hover:underline">Terms</a>}
          {termsUrl && privacyUrl && ' and '}
          {privacyUrl && <a href={privacyUrl} className="text-primary hover:underline">Privacy Policy</a>}
          .
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors disabled:opacity-50"
      >
        {loading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}

function ForgotPasswordForm({
  onSubmit,
  loading,
}: {
  onSubmit: (email: string) => void;
  loading: boolean;
}) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-foreground font-medium">Check your email</p>
        <p className="text-sm text-muted mt-1">We sent a password reset link to {email}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(email);
        setSent(true);
      }}
      className="space-y-5"
    >
      <p className="text-sm text-muted">Enter your email and we'll send you a reset link.</p>
      <div>
        <label htmlFor="forgot-email" className="block text-sm font-medium text-foreground mb-2">Email</label>
        <input
          id="forgot-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="you@example.com"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send reset link'}
      </button>
    </form>
  );
}

// ── AuthCard (main export) ───────────────────────────────────────────────────

interface AuthCardProps {
  config: AuthConfig;
  /** Initial view (default: 'login') */
  initialView?: AuthView;
}

export default function AuthCard({ config, initialView = 'login' }: AuthCardProps) {
  const [view, setView] = useState<AuthView>(initialView);
  const [loading, setLoading] = useState(false);

  const wrap = (fn?: (...args: any[]) => void | Promise<void>) => async (...args: any[]) => {
    if (!fn) return;
    setLoading(true);
    try {
      await fn(...args);
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<AuthView, string> = {
    login: 'Welcome back',
    signup: 'Create your account',
    'forgot-password': 'Reset password',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          {config.brandIcon && (
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              {config.brandIcon}
            </div>
          )}
          <h1 className="text-2xl font-heading font-bold text-foreground">{titles[view]}</h1>
        </div>

        {/* Form card */}
        <div className="bg-surface rounded-2xl border border-border p-8">
          {view === 'login' && (
            <LoginForm onSubmit={wrap(config.onLogin)} loading={loading} />
          )}
          {view === 'signup' && (
            <SignupForm
              onSubmit={wrap(config.onSignup)}
              loading={loading}
              termsUrl={config.termsUrl}
              privacyUrl={config.privacyUrl}
            />
          )}
          {view === 'forgot-password' && (
            <ForgotPasswordForm onSubmit={wrap(config.onForgotPassword)} loading={loading} />
          )}
        </div>

        {/* View switching links */}
        <div className="mt-6 text-center text-sm text-muted space-y-2">
          {view === 'login' && (
            <>
              {config.showForgotPasswordLink !== false && (
                <button onClick={() => setView('forgot-password')} className="text-primary hover:underline block mx-auto">
                  Forgot your password?
                </button>
              )}
              {config.showSignupLink !== false && (
                <p>
                  Don't have an account?{' '}
                  <button onClick={() => setView('signup')} className="text-primary hover:underline">
                    Sign up
                  </button>
                </p>
              )}
            </>
          )}
          {view === 'signup' && (
            <p>
              Already have an account?{' '}
              <button onClick={() => setView('login')} className="text-primary hover:underline">
                Sign in
              </button>
            </p>
          )}
          {view === 'forgot-password' && (
            <button onClick={() => setView('login')} className="text-primary hover:underline">
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export type { AuthConfig, AuthView } from './types';
