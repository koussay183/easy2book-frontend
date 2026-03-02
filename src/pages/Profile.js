import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, Save, RefreshCw,
  Shield, LogOut, BookOpen
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const T = {
  fr: {
    title: 'Mon Profil',
    subtitle: 'Gérez vos informations personnelles',
    tabProfile: 'Informations',
    tabSecurity: 'Sécurité',
    firstNameLabel: 'Prénom', firstNamePh: 'Votre prénom',
    lastNameLabel: 'Nom', lastNamePh: 'Votre nom',
    emailLabel: 'Email', emailPh: 'votre@email.com',
    phoneLabel: 'Téléphone', phonePh: '+216 XX XXX XXX',
    saveProfile: 'Enregistrer',
    saving: 'Enregistrement...',
    profileSaved: 'Profil mis à jour avec succès',
    currentPwLabel: 'Mot de passe actuel', currentPwPh: '••••••••',
    newPwLabel: 'Nouveau mot de passe', newPwPh: '••••••••',
    confirmPwLabel: 'Confirmer le nouveau mot de passe', confirmPwPh: '••••••••',
    changePw: 'Changer le mot de passe',
    changingPw: 'Changement...',
    pwChanged: 'Mot de passe modifié avec succès',
    pwNoMatch: 'Les mots de passe ne correspondent pas',
    pwTooShort: 'Minimum 8 caractères',
    fieldRequired: 'Ce champ est requis',
    loginRequired: 'Connexion requise',
    loginRequiredDesc: 'Vous devez être connecté pour accéder à votre profil.',
    login: 'Se connecter',
    myBookings: 'Mes Réservations',
    logout: 'Déconnexion',
  },
  ar: {
    title: 'ملفي الشخصي',
    subtitle: 'إدارة معلوماتك الشخصية',
    tabProfile: 'المعلومات',
    tabSecurity: 'الأمان',
    firstNameLabel: 'الاسم الأول', firstNamePh: 'اسمك الأول',
    lastNameLabel: 'اسم العائلة', lastNamePh: 'اسم عائلتك',
    emailLabel: 'البريد الإلكتروني', emailPh: 'بريدك@الإلكتروني.com',
    phoneLabel: 'الهاتف', phonePh: '+216 XX XXX XXX',
    saveProfile: 'حفظ',
    saving: 'جاري الحفظ...',
    profileSaved: 'تم تحديث الملف الشخصي بنجاح',
    currentPwLabel: 'كلمة المرور الحالية', currentPwPh: '••••••••',
    newPwLabel: 'كلمة المرور الجديدة', newPwPh: '••••••••',
    confirmPwLabel: 'تأكيد كلمة المرور الجديدة', confirmPwPh: '••••••••',
    changePw: 'تغيير كلمة المرور',
    changingPw: 'جاري التغيير...',
    pwChanged: 'تم تغيير كلمة المرور بنجاح',
    pwNoMatch: 'كلمات المرور غير متطابقة',
    pwTooShort: '8 أحرف كحد أدنى',
    fieldRequired: 'هذا الحقل مطلوب',
    loginRequired: 'يجب تسجيل الدخول',
    loginRequiredDesc: 'يجب أن تكون مسجلاً للوصول إلى ملفك الشخصي.',
    login: 'تسجيل الدخول',
    myBookings: 'حجوزاتي',
    logout: 'تسجيل الخروج',
  },
  en: {
    title: 'My Profile',
    subtitle: 'Manage your personal information',
    tabProfile: 'Information',
    tabSecurity: 'Security',
    firstNameLabel: 'First Name', firstNamePh: 'Your first name',
    lastNameLabel: 'Last Name', lastNamePh: 'Your last name',
    emailLabel: 'Email', emailPh: 'your@email.com',
    phoneLabel: 'Phone', phonePh: '+216 XX XXX XXX',
    saveProfile: 'Save',
    saving: 'Saving...',
    profileSaved: 'Profile updated successfully',
    currentPwLabel: 'Current Password', currentPwPh: '••••••••',
    newPwLabel: 'New Password', newPwPh: '••••••••',
    confirmPwLabel: 'Confirm New Password', confirmPwPh: '••••••••',
    changePw: 'Change Password',
    changingPw: 'Changing...',
    pwChanged: 'Password changed successfully',
    pwNoMatch: 'Passwords do not match',
    pwTooShort: 'Minimum 8 characters',
    fieldRequired: 'This field is required',
    loginRequired: 'Login required',
    loginRequiredDesc: 'You must be logged in to access your profile.',
    login: 'Sign In',
    myBookings: 'My Bookings',
    logout: 'Sign Out',
  }
};

const Profile = () => {
  const navigate    = useNavigate();
  const { language } = useLanguage();
  const t           = T[language] || T.fr;
  const isRTL       = language === 'ar';
  const { user, isAuthenticated, loading: authLoading, updateProfile, updatePassword, logout } = useAuth();

  const [tab,       setTab]       = useState('profile');
  const [profForm,  setProfForm]  = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [pwForm,    setPwForm]    = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profErr,   setProfErr]   = useState({});
  const [pwErr,     setPwErr]     = useState({});
  const [profSaving, setProfSaving] = useState(false);
  const [pwSaving,  setPwSaving]  = useState(false);
  const [profMsg,   setProfMsg]   = useState(null); // { type: 'success'|'error', text }
  const [pwMsg,     setPwMsg]     = useState(null);
  const [showPw,    setShowPw]    = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    if (user) {
      setProfForm({
        firstName: user.firstName || '',
        lastName:  user.lastName  || '',
        email:     user.email     || '',
        phone:     user.phone     || '',
      });
    }
  }, [user]);

  // Dismiss messages after 4 s
  useEffect(() => {
    if (!profMsg) return;
    const t = setTimeout(() => setProfMsg(null), 4000);
    return () => clearTimeout(t);
  }, [profMsg]);

  useEffect(() => {
    if (!pwMsg) return;
    const t = setTimeout(() => setPwMsg(null), 4000);
    return () => clearTimeout(t);
  }, [pwMsg]);

  // Redirect if not authenticated (once auth has loaded)
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm max-w-sm w-full p-8 text-center">
          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User size={24} className="text-primary-400" />
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-1">{t.loginRequired}</h2>
          <p className="text-sm text-gray-500 mb-6">{t.loginRequiredDesc}</p>
          <button onClick={() => navigate('/login')}
            className="w-full py-3 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-bold transition-colors">
            {t.login}
          </button>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw size={26} className="animate-spin text-primary-600" />
      </div>
    );
  }

  /* ── Profile submit ── */
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!profForm.firstName.trim()) errs.firstName = t.fieldRequired;
    if (!profForm.lastName.trim())  errs.lastName  = t.fieldRequired;
    if (!profForm.email.trim())     errs.email     = t.fieldRequired;
    if (Object.keys(errs).length) { setProfErr(errs); return; }
    setProfErr({});
    setProfSaving(true);
    const result = await updateProfile(profForm);
    setProfSaving(false);
    if (result.success) setProfMsg({ type: 'success', text: t.profileSaved });
    else setProfMsg({ type: 'error', text: result.message });
  };

  /* ── Password submit ── */
  const handlePwSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = t.fieldRequired;
    if (!pwForm.newPassword)     errs.newPassword     = t.fieldRequired;
    else if (pwForm.newPassword.length < 8) errs.newPassword = t.pwTooShort;
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = t.pwNoMatch;
    if (Object.keys(errs).length) { setPwErr(errs); return; }
    setPwErr({});
    setPwSaving(true);
    const result = await updatePassword(pwForm.currentPassword, pwForm.newPassword);
    setPwSaving(false);
    if (result.success) {
      setPwMsg({ type: 'success', text: t.pwChanged });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPwMsg({ type: 'error', text: result.message });
    }
  };

  const chProf = (field) => (e) => {
    setProfForm((p) => ({ ...p, [field]: e.target.value }));
    if (profErr[field]) setProfErr((p) => ({ ...p, [field]: undefined }));
  };

  const chPw = (field) => (e) => {
    setPwForm((p) => ({ ...p, [field]: e.target.value }));
    if (pwErr[field]) setPwErr((p) => ({ ...p, [field]: undefined }));
  };

  const inputCls = (err) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 ${
      err ? 'border-red-300 bg-red-50' : 'border-gray-200'
    }`;

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-8 max-w-2xl">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t.subtitle}</p>
        </div>

        {/* User card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-700 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-lg font-bold">
            {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
          </div>
          <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
            <p className="text-base font-bold text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          </div>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button onClick={() => navigate('/bookings')}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-primary-700 border border-gray-200 rounded-xl hover:border-primary-300 transition-all">
              <BookOpen size={13} />
              <span className="hidden sm:inline">{t.myBookings}</span>
            </button>
            <button onClick={async () => { await logout(); navigate('/'); }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-100 rounded-xl transition-all">
              <LogOut size={13} />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {[
            { id: 'profile',  icon: User,   label: t.tabProfile },
            { id: 'security', icon: Shield, label: t.tabSecurity },
          ].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Profile tab ── */}
        {tab === 'profile' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            {profMsg && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm border ${
                profMsg.type === 'success'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-600 border-red-200'
              } ${isRTL ? 'flex-row-reverse' : ''}`}>
                {profMsg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                {profMsg.text}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First name */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                    {t.firstNameLabel} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input type="text" value={profForm.firstName} onChange={chProf('firstName')}
                      placeholder={t.firstNamePh}
                      className={`${inputCls(profErr.firstName)} ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} />
                    <User size={14} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-gray-400`} />
                  </div>
                  {profErr.firstName && <p className={`text-sm text-red-500 mt-1 ${isRTL ? 'text-right' : ''}`}>{profErr.firstName}</p>}
                </div>

                {/* Last name */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                    {t.lastNameLabel} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input type="text" value={profForm.lastName} onChange={chProf('lastName')}
                      placeholder={t.lastNamePh}
                      className={`${inputCls(profErr.lastName)} ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} />
                    <User size={14} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-gray-400`} />
                  </div>
                  {profErr.lastName && <p className={`text-sm text-red-500 mt-1 ${isRTL ? 'text-right' : ''}`}>{profErr.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                  {t.emailLabel} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input type="email" value={profForm.email} onChange={chProf('email')}
                    placeholder={t.emailPh}
                    className={`${inputCls(profErr.email)} ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} />
                  <Mail size={14} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-gray-400`} />
                </div>
                {profErr.email && <p className={`text-sm text-red-500 mt-1 ${isRTL ? 'text-right' : ''}`}>{profErr.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                  {t.phoneLabel}
                </label>
                <div className="relative">
                  <input type="tel" value={profForm.phone} onChange={chProf('phone')}
                    placeholder={t.phonePh}
                    className={`${inputCls(false)} ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} />
                  <Phone size={14} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-gray-400`} />
                </div>
              </div>

              <button type="submit" disabled={profSaving}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60">
                {profSaving
                  ? <><RefreshCw size={14} className="animate-spin" /> {t.saving}</>
                  : <><Save size={14} /> {t.saveProfile}</>}
              </button>
            </form>
          </div>
        )}

        {/* ── Security tab ── */}
        {tab === 'security' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            {pwMsg && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm border ${
                pwMsg.type === 'success'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-600 border-red-200'
              } ${isRTL ? 'flex-row-reverse' : ''}`}>
                {pwMsg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                {pwMsg.text}
              </div>
            )}

            <form onSubmit={handlePwSubmit} className="space-y-4">
              {/* Current password */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                  {t.currentPwLabel} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input type={showPw.current ? 'text' : 'password'}
                    value={pwForm.currentPassword} onChange={chPw('currentPassword')}
                    placeholder={t.currentPwPh}
                    className={`${inputCls(pwErr.currentPassword)} ${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}`} />
                  <Lock size={14} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-gray-400`} />
                  <button type="button"
                    onClick={() => setShowPw((p) => ({ ...p, current: !p.current }))}
                    className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-3 text-gray-400 hover:text-gray-600`}>
                    {showPw.current ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {pwErr.currentPassword && <p className={`text-sm text-red-500 mt-1 ${isRTL ? 'text-right' : ''}`}>{pwErr.currentPassword}</p>}
              </div>

              {/* New password */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                  {t.newPwLabel} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input type={showPw.new ? 'text' : 'password'}
                    value={pwForm.newPassword} onChange={chPw('newPassword')}
                    placeholder={t.newPwPh}
                    className={`${inputCls(pwErr.newPassword)} ${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}`} />
                  <Lock size={14} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-gray-400`} />
                  <button type="button"
                    onClick={() => setShowPw((p) => ({ ...p, new: !p.new }))}
                    className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-3 text-gray-400 hover:text-gray-600`}>
                    {showPw.new ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {pwErr.newPassword && <p className={`text-sm text-red-500 mt-1 ${isRTL ? 'text-right' : ''}`}>{pwErr.newPassword}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                  {t.confirmPwLabel} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input type={showPw.confirm ? 'text' : 'password'}
                    value={pwForm.confirmPassword} onChange={chPw('confirmPassword')}
                    placeholder={t.confirmPwPh}
                    className={`${inputCls(pwErr.confirmPassword)} ${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}`} />
                  <Lock size={14} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-gray-400`} />
                  <button type="button"
                    onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}
                    className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-3 text-gray-400 hover:text-gray-600`}>
                    {showPw.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {pwErr.confirmPassword && <p className={`text-sm text-red-500 mt-1 ${isRTL ? 'text-right' : ''}`}>{pwErr.confirmPassword}</p>}
              </div>

              <button type="submit" disabled={pwSaving}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60">
                {pwSaving
                  ? <><RefreshCw size={14} className="animate-spin" /> {t.changingPw}</>
                  : <><Shield size={14} /> {t.changePw}</>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
