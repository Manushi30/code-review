import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Auth.css';

export default function ForgotPassword() {
  return (
    <div className="auth-page">
      <div className="auth-hero">
        <h1>Reset password</h1>
        <p>Password reset via email can be enabled when SMTP is configured on GCP.</p>
      </div>
      <div className="auth-form-wrap">
        <motion.div className="auth-form-card glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2>Forgot Password</h2>
          <p className="subtitle">
            For hackathon demo, contact your administrator or use account settings after login.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
            Back to Login
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
