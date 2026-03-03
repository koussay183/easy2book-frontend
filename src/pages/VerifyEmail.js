import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { useLanguage } from '../context/LanguageContext';

const T = {
  fr: {
    title: 'Vérification de votre email',
    verifying: 'Vérification en cours...',
    success: 'Email vérifié avec succès !',
    successSub: 'Votre compte est maintenant activé. Vous pouvez vous connecter.',
    error: 'Lien invalide ou expiré',
    errorSub: 'Ce lien de vérification est invalide ou a expiré. Veuillez réessayer.',
    toLogin: 'Se connecter',
    toHome: 'Retour à l\'accueil',
  },
  ar: {
    title: 'تحقق من بريدك الإلكتروني',
    verifying: 'جاري التحقق...',
    success: 'تم التحقق بنجاح!',
    successSub: 'تم تفعيل حسابك. يمكنك الآن تسجيل الدخول.',
    error: 'الرابط غير صالح أو منتهي الصلاحية',
    errorSub: 'هذا الرابط غير صالح أو انتهت صلاحيته. يرجى المحاولة مجدداً.',
    toLogin: 'تسجيل الدخول',
    toHome: 'العودة للرئيسية',
  },
  en: {
    title: 'Email Verification',
    verifying: 'Verifying your email...',
    success: 'Email verified successfully!',
    successSub: 'Your account is now active. You can sign in.',
    error: 'Invalid or expired link',
    errorSub: 'This verification link is invalid or has expired. Please try again.',
    toLogin: 'Sign in',
    toHome: 'Back to home',
  },
};

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const t = T[language] || T.fr;

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const verify = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.AUTH_VERIFY_EMAIL}/${token}`);
        const data = await res.json();
        if (data.status === 'success') {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 max-w-md w-full p-8 text-center">

        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Loader2 size={30} className="text-primary-600 animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <p className="text-gray-500 text-sm">{t.verifying}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{t.success}</h1>
            <p className="text-gray-500 text-sm mb-6">{t.successSub}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-primary-700 hover:bg-primary-800 text-white py-3 px-6 rounded-xl font-bold transition-colors"
            >
              {t.toLogin}
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{t.error}</h1>
            <p className="text-gray-500 text-sm mb-6">{t.errorSub}</p>
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-2 mx-auto text-gray-500 hover:text-primary-600 transition-colors font-medium text-sm ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
              {t.toHome}
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;
