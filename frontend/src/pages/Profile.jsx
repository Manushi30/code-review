import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    college: user?.college || '',
    skillLevel: user?.skillLevel || 'Beginner',
  });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [deletePwd, setDeletePwd] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      await api.updateProfile(profile);
      await refreshUser();
      setMsg('Profile updated');
    } catch (err) {
      setError(err.message);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match');
      return;
    }
    try {
      await api.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      setMsg('Password changed');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm('Delete your account permanently?')) return;
    try {
      await api.deleteAccount({ password: deletePwd });
      logout();
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dashboard-grid">
      <h1 className="page-title">User Profile</h1>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      {error && <div className="auth-error">{error}</div>}

      <div className="two-col">
        <form className="section-card glass-card auth-form" onSubmit={saveProfile}>
          <h3>Edit Profile</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email: {user?.email}</p>
          <div>
            <label className="label">Name</label>
            <input className="input-field" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <label className="label">College</label>
            <input className="input-field" value={profile.college} onChange={(e) => setProfile({ ...profile, college: e.target.value })} />
          </div>
          <div>
            <label className="label">Programming Level</label>
            <select className="input-field" value={profile.skillLevel} onChange={(e) => setProfile({ ...profile, skillLevel: e.target.value })}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Save Profile</button>
        </form>

        <form className="section-card glass-card auth-form" onSubmit={changePassword}>
          <h3>Change Password</h3>
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input-field" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input-field" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} required minLength={6} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input-field" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary">Update Password</button>
        </form>
      </div>

      <div className="section-card glass-card auth-form" style={{ maxWidth: 480 }}>
        <h3 style={{ color: '#991b1b' }}>Delete Account</h3>
        <input
          type="password"
          className="input-field"
          placeholder="Enter password to confirm"
          value={deletePwd}
          onChange={(e) => setDeletePwd(e.target.value)}
        />
        <button type="button" className="btn btn-outline" style={{ borderColor: '#991b1b', color: '#991b1b' }} onClick={deleteAccount}>
          Delete Account
        </button>
      </div>
    </div>
  );
}
