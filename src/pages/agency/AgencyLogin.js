import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../locales/translations';

export default function AgencyLogin() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].agencyLogin;
  const isRTL = language === 'ar';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError(t.fillAll); return; }

    setLoading(true);
    setError('');

    const result = await login(email, password);

    if (result.success) {
      const role = result.user?.role;
      if (role === 'agency_admin' || role === 'agency_staff') {
        navigate('/agency/dashboard');
      } else {
        setError(t.accessDenied);
        localStorage.removeItem('accessToken');
      }
    } else {
      setError(result.message || t.wrongCredentials);
    }

    setLoading(false);
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #003d78 0%, #005096 50%, #0077cc 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 440,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #005096, #0077cc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Building2 size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
            {t.title}
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            {t.subtitle}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
            padding: '12px 16px', marginBottom: 20,
            display: 'flex', alignItems: 'flex-start', gap: 10,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          }}>
            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13, color: '#b91c1c' }}>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6,
              textAlign: isRTL ? 'right' : 'left',
            }}>
              {t.emailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="contact@votreagence.tn"
              dir="ltr"
              style={{
                width: '100%', padding: '12px 14px', fontSize: 14, border: '1.5px solid #e5e7eb',
                borderRadius: 10, outline: 'none', boxSizing: 'border-box', color: '#111827',
                textAlign: isRTL ? 'right' : 'left',
              }}
            />
          </div>

          <div style={{ marginBottom: 24, position: 'relative' }}>
            <label style={{
              display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6,
              textAlign: isRTL ? 'right' : 'left',
            }}>
              {t.passwordLabel}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                style={{
                  width: '100%',
                  padding: isRTL ? '12px 14px 12px 44px' : '12px 44px 12px 14px',
                  fontSize: 14,
                  border: '1.5px solid #e5e7eb', borderRadius: 10, outline: 'none',
                  boxSizing: 'border-box', color: '#111827',
                  textAlign: isRTL ? 'right' : 'left',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(p => !p)}
                style={{
                  position: 'absolute',
                  right: isRTL ? 'auto' : 12,
                  left: isRTL ? 12 : 'auto',
                  top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
                }}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', fontSize: 15, fontWeight: 700,
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #005096, #0077cc)',
              color: '#fff', border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading
              ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t.loading}</>
              : t.submit
            }
          </button>
        </form>

        {/* Footer links */}
        <div style={{ textAlign: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 8px' }}>
            {t.noAccount}{' '}
            <a href="mailto:contact@easy2book.tn" style={{ color: '#005096', fontWeight: 600 }}>
              {t.contactUs}
            </a>
          </p>
          <Link to="/login" style={{ fontSize: 12, color: '#6b7280' }}>
            {isRTL ? `${t.backToSite} \u2192` : `\u2190 ${t.backToSite}`}
          </Link>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
