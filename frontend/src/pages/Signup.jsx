import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    skillLevel: 'Beginner',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        college: form.college,
        skillLevel: form.skillLevel,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-hero"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h1>Start your coding journey</h1>
        <p>
          Join thousands of students improving with AI-powered reviews tailored
          to your skill level.
        </p>
      </motion.div>
      <div className="auth-form-wrap">
        <motion.div
          className="auth-form-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>Create Account</h2>
          <p className="subtitle">Free for students — learn smarter</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}
            <div>
              <label className="label">Full Name</label>
              <input className="input-field" value={form.name} onChange={update('name')} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" value={form.email} onChange={update('email')} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input-field" value={form.password} onChange={update('password')} required minLength={6} />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" className="input-field" value={form.confirmPassword} onChange={update('confirmPassword')} required />
            </div>
            <div>
              <label className="label">College Name</label>
              <input className="input-field" value={form.college} onChange={update('college')} />
            </div>
            <div>
              <label className="label">Programming Level</label>
              <select className="input-field" value={form.skillLevel} onChange={update('skillLevel')}>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <div className="auth-links">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
