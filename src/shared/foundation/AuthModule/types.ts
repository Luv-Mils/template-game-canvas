export type AuthView = 'login' | 'signup' | 'forgot-password';

export interface AuthConfig {
  /** Brand name shown in auth forms */
  brandName: string;
  /** Optional brand icon as JSX */
  brandIcon?: React.ReactNode;
  /** Called on login form submit */
  onLogin?: (email: string, password: string) => void | Promise<void>;
  /** Called on signup form submit */
  onSignup?: (email: string, password: string, name: string) => void | Promise<void>;
  /** Called on forgot password form submit */
  onForgotPassword?: (email: string) => void | Promise<void>;
  /** Show signup link on login page (default: true) */
  showSignupLink?: boolean;
  /** Show forgot password link on login page (default: true) */
  showForgotPasswordLink?: boolean;
  /** Terms of service URL (shown on signup) */
  termsUrl?: string;
  /** Privacy policy URL (shown on signup) */
  privacyUrl?: string;
}
