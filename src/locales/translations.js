export const translations = {
  fr: {
    // Header
    header: {
      language: 'Français',
      myBookings: 'Mes Réservations',
      login: 'Connexion',
      register: 'S\'inscrire',
      logout: 'Déconnexion',
      profile: 'Profil',
      welcome: 'Bienvenue',
    },
    
    // Authentication
    auth: {
      // Login
      loginTitle: 'Connexion',
      loginSubtitle: 'Connectez-vous à votre compte',
      email: 'Adresse email',
      emailPlaceholder: 'votre@email.com',
      password: 'Mot de passe',
      passwordPlaceholder: 'Votre mot de passe',
      rememberMe: 'Se souvenir de moi',
      forgotPassword: 'Mot de passe oublié?',
      loginButton: 'Se connecter',
      noAccount: 'Pas encore de compte?',
      createAccount: 'Créer un compte',
      
      // Register
      registerTitle: 'Inscription',
      registerSubtitle: 'Créez votre compte gratuitement',
      firstName: 'Prénom',
      firstNamePlaceholder: 'Votre prénom',
      lastName: 'Nom',
      lastNamePlaceholder: 'Votre nom',
      phone: 'Téléphone',
      phonePlaceholder: '+216 XX XXX XXX',
      confirmPassword: 'Confirmer le mot de passe',
      confirmPasswordPlaceholder: 'Confirmez votre mot de passe',
      registerButton: 'S\'inscrire',
      haveAccount: 'Vous avez déjà un compte?',
      loginNow: 'Se connecter',
      
      // Forgot Password
      forgotPasswordTitle: 'Mot de passe oublié',
      forgotPasswordSubtitle: 'Entrez votre email pour réinitialiser votre mot de passe',
      sendResetLink: 'Envoyer le lien',
      backToLogin: 'Retour à la connexion',
      
      // Reset Password
      resetPasswordTitle: 'Réinitialiser le mot de passe',
      resetPasswordSubtitle: 'Entrez votre nouveau mot de passe',
      newPassword: 'Nouveau mot de passe',
      resetButton: 'Réinitialiser',
      
      // Validation & Errors
      emailRequired: 'L\'email est requis',
      emailInvalid: 'Email invalide',
      passwordRequired: 'Le mot de passe est requis',
      passwordMinLength: 'Le mot de passe doit contenir au moins 8 caractères',
      passwordRequirements: 'Doit contenir majuscule, minuscule et chiffre',
      passwordsNoMatch: 'Les mots de passe ne correspondent pas',
      firstNameRequired: 'Le prénom est requis',
      lastNameRequired: 'Le nom est requis',
      phoneInvalid: 'Numéro de téléphone invalide',
      
      // Success Messages
      loginSuccess: 'Connexion réussie!',
      registerSuccess: 'Inscription réussie! Vérifiez votre email.',
      logoutSuccess: 'Déconnexion réussie',
      passwordResetSent: 'Email de réinitialisation envoyé',
      passwordResetSuccess: 'Mot de passe réinitialisé avec succès',
      
      // Error Messages
      loginError: 'Email ou mot de passe incorrect',
      registerError: 'Erreur lors de l\'inscription',
      serverError: 'Erreur du serveur. Réessayez plus tard.',
      networkError: 'Erreur de connexion',
    },
    
    // Hero Section
    hero: {
      title: 'Votre voyage commence',
      titleHighlight: 'ici',
      subtitle: 'Réservez hôtels, vols et voyages en Tunisie en toute simplicité',
      trustBadge1: 'Paiement sécurisé',
      trustBadge2: 'Support 24/7',
      feature1: 'Milliers d\'hôtels',
      feature2: 'Meilleurs prix',
      feature3: 'Réservation rapide',
    },
    
    // Search Box
    search: {
      services: {
        hotels: 'Hôtels',
        flights: 'Vols',
        omra: 'Omra',
        trains: 'Trains',
        cars: 'Locations de voitures',
        houses: 'Maisons',
        attractions: 'Attractions',
      },
      destination: 'Destination',
      destinationPlaceholder: 'Où voulez-vous aller?',
      checkIn: 'Date d\'arrivée',
      checkOut: 'Date de départ',
      guests: 'Voyageurs et Chambres',
      searchButton: 'Rechercher',
      comingSoon: 'Bientôt disponible',
      comingSoonText: 'Nous travaillons sur cette fonctionnalité',
    },
    
    // Guest Selector
    guestSelector: {
      adults: 'Adultes',
      children: 'Enfants',
      rooms: 'Chambres',
      childAge: 'Âge de l\'enfant',
      done: 'Terminé',
    },
    
    // Exclusive Offers Section
    offers: {
      title: 'Offres exclusives nouveaux clients',
      new: 'Nouveau',
      limited: 'Limité',
      hotel5Stars: 'Hôtels 5 étoiles',
      travelHotels: 'Vols & Hôtels',
      omraPackages: 'Forfaits Omra',
      discount: 'réduction',
      validUntil: 'Valide jusqu\'au',
      getNow: 'Réserver maintenant',
    },
    
    // Popular Hotels Section
    popularHotels: {
      title: 'Hôtels populaires',
      viewAll: 'Voir tout',
      night: 'nuit',
      rating: 'Note',
      reviews: 'avis',
    },
    
    // Get Inspired Section
    getInspired: {
      title: 'Inspirez-vous pour votre prochain voyage',
      destinations: {
        anywhere: 'Partout',
        tunis: 'Tunis',
        sousse: 'Sousse',
        hammamet: 'Hammamet',
        djerba: 'Djerba',
      },
    },
    
    // Handpicked Hotels Section
    handpickedHotels: {
      title: 'Séjournez dans nos hôtels sélectionnés',
      more: 'Plus',
      excellent: 'Excellent',
      from: 'de',
      fromCenter: 'du centre',
      perNight: '/nuit',
    },

    // Travel Packages Section
    travelPackages: {
      flightHotel: 'Vol + Hôtel',
      quickTrip: 'Voyage rapide',
      culturalTrip: 'Voyage culturel',
      from: 'à partir de',
      perPerson: '/pers',
      days: 'jours à',
    },

    // Experience Section
    experiences: {
      title: 'Moments de voyage magiques qui durent longtemps',
      more: 'Plus',
      cards: {
        omra: {
          location: 'La Mecque',
          title: 'Voyage Omra béni qui reste dans votre cœur pour toujours',
        },
        desert: {
          location: 'Désert du Sahara',
          title: 'Aventure dans le désert sous un ciel étoilé',
        },
        medina: {
          location: 'Médina de Tunis',
          title: 'Explorez les marchés authentiques et le patrimoine',
        },
        beach: {
          location: 'Hammamet',
          title: 'Détente au bord de la mer méditerranéenne',
        },
      },
    },
    
    // Footer
    footer: {
      description: 'La première plateforme de réservation en Tunisie - Réservez des hôtels, omra et voyages facilement et en toute sécurité',
      quickLinks: {
        title: 'Liens Rapides',
        home: 'Accueil',
        hotels: 'Hôtels Tunisiens',
        omra: 'Voyages Omra',
        partners: 'Programme Partenaires',
      },
      contact: {
        title: 'Contactez-nous',
        location: 'Tunis, Tunisie',
      },
      social: {
        title: 'Suivez-nous',
      },
      newsletter: {
        title: 'Abonnez-vous à notre newsletter',
        placeholder: 'Votre email',
        button: 'S\'abonner',
      },
      copyright: 'Tous droits réservés',
    },
    agencyLogin: {
      title: 'Portail Agences',
      subtitle: 'Easy2Book B2B — Connectez-vous à votre espace agence',
      emailLabel: 'Adresse email',
      passwordLabel: 'Mot de passe',
      submit: 'Se connecter',
      loading: 'Connexion...',
      noAccount: 'Pas encore partenaire ?',
      contactUs: 'Contactez-nous',
      backToSite: 'Retour au site client',
      fillAll: 'Veuillez remplir tous les champs',
      accessDenied: 'Ce portail est réservé aux utilisateurs agence. Accès non autorisé.',
      wrongCredentials: 'Email ou mot de passe incorrect',
    },
  },

  ar: {
    // Header
    header: {
      language: 'العربية',
      myBookings: 'حجوزاتي',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      logout: 'تسجيل الخروج',
      profile: 'الملف الشخصي',
      welcome: 'مرحبا',
    },
    
    // Authentication
    auth: {
      // Login
      loginTitle: 'تسجيل الدخول',
      loginSubtitle: 'سجل الدخول إلى حسابك',
      email: 'البريد الإلكتروني',
      emailPlaceholder: 'بريدك@الإلكتروني.com',
      password: 'كلمة المرور',
      passwordPlaceholder: 'كلمة المرور الخاصة بك',
      rememberMe: 'تذكرني',
      forgotPassword: 'نسيت كلمة المرور؟',
      loginButton: 'تسجيل الدخول',
      noAccount: 'لا تملك حساباً؟',
      createAccount: 'إنشاء حساب',
      
      // Register
      registerTitle: 'إنشاء حساب',
      registerSubtitle: 'أنشئ حسابك المجاني',
      firstName: 'الاسم الأول',
      firstNamePlaceholder: 'الاسم الأول',
      lastName: 'اسم العائلة',
      lastNamePlaceholder: 'اسم العائلة',
      phone: 'رقم الهاتف',
      phonePlaceholder: '+216 XX XXX XXX',
      confirmPassword: 'تأكيد كلمة المرور',
      confirmPasswordPlaceholder: 'أكد كلمة المرور',
      registerButton: 'إنشاء حساب',
      haveAccount: 'لديك حساب بالفعل؟',
      loginNow: 'سجل الدخول',
      
      // Forgot Password
      forgotPasswordTitle: 'نسيت كلمة المرور',
      forgotPasswordSubtitle: 'أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور',
      sendResetLink: 'إرسال الرابط',
      backToLogin: 'العودة لتسجيل الدخول',
      
      // Reset Password
      resetPasswordTitle: 'إعادة تعيين كلمة المرور',
      resetPasswordSubtitle: 'أدخل كلمة المرور الجديدة',
      newPassword: 'كلمة المرور الجديدة',
      resetButton: 'إعادة تعيين',
      
      // Validation & Errors
      emailRequired: 'البريد الإلكتروني مطلوب',
      emailInvalid: 'البريد الإلكتروني غير صالح',
      passwordRequired: 'كلمة المرور مطلوبة',
      passwordMinLength: 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل',
      passwordRequirements: 'يجب أن تحتوي على حرف كبير وصغير ورقم',
      passwordsNoMatch: 'كلمات المرور غير متطابقة',
      firstNameRequired: 'الاسم الأول مطلوب',
      lastNameRequired: 'اسم العائلة مطلوب',
      phoneInvalid: 'رقم الهاتف غير صالح',
      
      // Success Messages
      loginSuccess: 'تم تسجيل الدخول بنجاح!',
      registerSuccess: 'تم التسجيل بنجاح! تحقق من بريدك الإلكتروني.',
      logoutSuccess: 'تم تسجيل الخروج بنجاح',
      passwordResetSent: 'تم إرسال رابط إعادة التعيين',
      passwordResetSuccess: 'تم إعادة تعيين كلمة المرور بنجاح',
      
      // Error Messages
      loginError: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      registerError: 'خطأ في التسجيل',
      serverError: 'خطأ في الخادم. حاول مرة أخرى لاحقاً.',
      networkError: 'خطأ في الاتصال',
    },
    
    // Hero Section
    hero: {
      title: 'رحلتك تبدأ',
      titleHighlight: 'من هنا',
      subtitle: 'احجز فنادق ورحلات وعمرة في تونس بكل سهولة',
      trustBadge1: 'دفع آمن',
      trustBadge2: 'دعم 24/7',
      feature1: 'آلاف الفنادق',
      feature2: 'أفضل الأسعار',
      feature3: 'حجز سريع',
    },
    
    // Search Box
    search: {
      services: {
        hotels: 'الفنادق',
        flights: 'الرحلات',
        omra: 'العمرة',
        trains: 'القطارات',
        cars: 'السيارات',
        houses: 'المنازل',
        attractions: 'المعالم',
      },
      destination: 'الوجهة',
      destinationPlaceholder: 'أين تريد الذهاب؟',
      checkIn: 'تسجيل الوصول',
      checkOut: 'تسجيل المغادرة',
      guests: 'الغرف والضيوف',
      searchButton: 'بحث',
      comingSoon: 'قريباً جداً',
      comingSoonText: 'نعمل على إضافة هذه الخدمة قريباً',
    },
    
    // Guest Selector
    guestSelector: {
      adults: 'البالغين',
      children: 'الأطفال',
      rooms: 'الغرف',
      childAge: 'عمر الطفل',
      done: 'تم',
    },
    
    // Exclusive Offers Section
    offers: {
      title: 'عروض حصرية للمستخدمين الجدد',
      new: 'جديد',
      limited: 'محدود',
      hotel5Stars: 'فنادق 5 نجوم',
      travelHotels: 'رحلات و فنادق',
      omraPackages: 'باقات العمرة',
    },
    
    // Popular Hotels Section
    popularHotels: {
      title: 'فنادق شائعة',
      viewAll: 'عرض الكل',
      night: 'ليلة',
      rating: 'التقييم',
      reviews: 'تقييم',
    },
    
    // Get Inspired Section
    getInspired: {
      title: 'احصل على إلهام لرحلتك القادمة',
      destinations: {
        anywhere: 'في أي مكان',
        tunis: 'تونس',
        sousse: 'سوسة',
        hammamet: 'الحمامات',
        djerba: 'جربة',
      },
    },
    
    // Handpicked Hotels Section
    handpickedHotels: {
      title: 'أقم بشكل مريح في فنادقنا المختارة',
      more: 'المزيد',
      excellent: 'ممتاز',
      from: 'من',
      fromCenter: 'من المركز',
      perNight: '/ليلة',
    },

    // Travel Packages Section
    travelPackages: {
      flightHotel: 'طيران + فندق',
      quickTrip: 'رحلة سريعة',
      culturalTrip: 'رحلة ثقافية',
      from: 'من',
      perPerson: '/شخص',
      days: 'أيام في',
    },

    // Experience Section
    experiences: {
      title: 'لحظات رحلة سحرية تدوم طويلاً',
      more: 'المزيد',
      cards: {
        omra: {
          location: 'مكة المكرمة',
          title: 'رحلة عمرة مباركة تبقى في قلبك للأبد',
        },
        desert: {
          location: 'الصحراء الكبرى',
          title: 'مغامرة في الصحراء تحت سماء مرصعة بالنجوم',
        },
        medina: {
          location: 'مدينة تونس',
          title: 'استكشف الأسواق الأصيلة والتراث',
        },
        beach: {
          location: 'الحمامات',
          title: 'استرخاء على شاطئ البحر الأبيض المتوسط',
        },
      },
    },
    
    // Footer
    footer: {
      description: 'منصة الحجز الأولى في تونس - احجز فنادق، عمرة، ورحلات بسهولة وأمان',
      quickLinks: {
        title: 'روابط سريعة',
        home: 'الرئيسية',
        hotels: 'الفنادق التونسية',
        omra: 'رحلات العمرة',
        partners: 'برنامج الشركاء',
      },
      contact: {
        title: 'تواصل معنا',
        location: 'تونس العاصمة، تونس',
      },
      social: {
        title: 'تابعنا',
      },
      newsletter: {
        title: 'اشترك في نشرتنا الإخبارية',
        placeholder: 'بريدك الإلكتروني',
        button: 'اشترك',
      },
      copyright: 'جميع الحقوق محفوظة',
    },
    agencyLogin: {
      title: 'بوابة الوكالات',
      subtitle: 'Easy2Book B2B — سجّل الدخول إلى فضاء وكالتك',
      emailLabel: 'البريد الإلكتروني',
      passwordLabel: 'كلمة المرور',
      submit: 'تسجيل الدخول',
      loading: 'جارٍ الاتصال...',
      noAccount: 'لستَ شريكًا بعد؟',
      contactUs: 'تواصل معنا',
      backToSite: 'العودة إلى الموقع',
      fillAll: 'يرجى ملء جميع الحقول',
      accessDenied: 'هذه البوابة مخصصة لمستخدمي الوكالة. وصول مرفوض.',
      wrongCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    },
  },

  en: {
    // Header
    header: {
      language: 'English',
      myBookings: 'My Bookings',
      login: 'Sign In',
      register: 'Sign Up',
      logout: 'Sign Out',
      profile: 'Profile',
      welcome: 'Welcome',
    },
    
    // Authentication
    auth: {
      // Login
      loginTitle: 'Sign In',
      loginSubtitle: 'Sign in to your account',
      email: 'Email Address',
      emailPlaceholder: 'your@email.com',
      password: 'Password',
      passwordPlaceholder: 'Your password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      loginButton: 'Sign In',
      noAccount: 'Don\'t have an account?',
      createAccount: 'Create account',
      
      // Register
      registerTitle: 'Sign Up',
      registerSubtitle: 'Create your free account',
      firstName: 'First Name',
      firstNamePlaceholder: 'Your first name',
      lastName: 'Last Name',
      lastNamePlaceholder: 'Your last name',
      phone: 'Phone Number',
      phonePlaceholder: '+216 XX XXX XXX',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Confirm your password',
      registerButton: 'Sign Up',
      haveAccount: 'Already have an account?',
      loginNow: 'Sign in',
      
      // Forgot Password
      forgotPasswordTitle: 'Forgot Password',
      forgotPasswordSubtitle: 'Enter your email to reset your password',
      sendResetLink: 'Send Reset Link',
      backToLogin: 'Back to Sign In',
      
      // Reset Password
      resetPasswordTitle: 'Reset Password',
      resetPasswordSubtitle: 'Enter your new password',
      newPassword: 'New Password',
      resetButton: 'Reset Password',
      
      // Validation & Errors
      emailRequired: 'Email is required',
      emailInvalid: 'Invalid email',
      passwordRequired: 'Password is required',
      passwordMinLength: 'Password must be at least 8 characters',
      passwordRequirements: 'Must contain uppercase, lowercase and number',
      passwordsNoMatch: 'Passwords do not match',
      firstNameRequired: 'First name is required',
      lastNameRequired: 'Last name is required',
      phoneInvalid: 'Invalid phone number',
      
      // Success Messages
      loginSuccess: 'Logged in successfully!',
      registerSuccess: 'Registered successfully! Check your email.',
      logoutSuccess: 'Logged out successfully',
      passwordResetSent: 'Reset link sent to your email',
      passwordResetSuccess: 'Password reset successfully',
      
      // Error Messages
      loginError: 'Invalid email or password',
      registerError: 'Registration failed',
      serverError: 'Server error. Please try again later.',
      networkError: 'Network error',
    },
    
    // Hero Section
    hero: {
      title: 'Your journey starts',
      titleHighlight: 'here',
      subtitle: 'Book hotels, flights and trips in Tunisia easily',
      trustBadge1: 'Secure Payment',
      trustBadge2: '24/7 Support',
      feature1: 'Thousands of hotels',
      feature2: 'Best prices',
      feature3: 'Quick booking',
    },
    
    // Search Box
    search: {
      services: {
        hotels: 'Hotels',
        flights: 'Flights',
        omra: 'Omra',
        trains: 'Trains',
        cars: 'Car Rentals',
        houses: 'Homes',
        attractions: 'Attractions',
      },
      destination: 'Destination',
      destinationPlaceholder: 'Where do you want to go?',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      guests: 'Guests & Rooms',
      searchButton: 'Search',
      comingSoon: 'Coming Soon',
      comingSoonText: 'We are working on adding this service',
    },
    
    // Guest Selector
    guestSelector: {
      adults: 'Adults',
      children: 'Children',
      rooms: 'Rooms',
      childAge: 'Child Age',
      done: 'Done',
    },
    
    // Exclusive Offers Section
    offers: {
      title: 'Exclusive offers for new users',
      new: 'New',
      limited: 'Limited',
      hotel5Stars: '5-Star Hotels',
      travelHotels: 'Flights & Hotels',
      omraPackages: 'Omra Packages',
    },
    
    // Popular Hotels Section
    popularHotels: {
      title: 'Popular Hotels',
      viewAll: 'View All',
      night: 'night',
      rating: 'Rating',
      reviews: 'reviews',
    },
    
    // Get Inspired Section
    getInspired: {
      title: 'Get inspired for your next trip',
      destinations: {
        anywhere: 'Anywhere',
        tunis: 'Tunis',
        sousse: 'Sousse',
        hammamet: 'Hammamet',
        djerba: 'Djerba',
      },
    },
    
    // Handpicked Hotels Section
    handpickedHotels: {
      title: 'Stay comfortably in our handpicked hotels',
      more: 'More',
      excellent: 'Excellent',
      from: 'from',
      fromCenter: 'from center',
      perNight: '/night',
    },

    // Travel Packages Section
    travelPackages: {
      flightHotel: 'Flight + Hotel',
      quickTrip: 'Quick trip',
      culturalTrip: 'Cultural trip',
      from: 'from',
      perPerson: '/person',
      days: 'days in',
    },

    // Experience Section
    experiences: {
      title: 'Magical trip moments that last long',
      more: 'More',
      cards: {
        omra: {
          location: 'Mecca',
          title: 'Blessed Omra journey that stays in your heart forever',
        },
        desert: {
          location: 'Sahara Desert',
          title: 'Adventure in the desert under a starry sky',
        },
        medina: {
          location: 'Tunis Medina',
          title: 'Explore authentic markets and heritage',
        },
        beach: {
          location: 'Hammamet',
          title: 'Relaxation by the Mediterranean Sea',
        },
      },
    },
    
    // Footer
    footer: {
      description: 'Tunisia\'s premier booking platform - Book hotels, omra, and trips easily and securely',
      quickLinks: {
        title: 'Quick Links',
        home: 'Home',
        hotels: 'Tunisian Hotels',
        omra: 'Omra Trips',
        partners: 'Partner Program',
      },
      contact: {
        title: 'Contact Us',
        location: 'Tunis, Tunisia',
      },
      social: {
        title: 'Follow Us',
      },
      newsletter: {
        title: 'Subscribe to our newsletter',
        placeholder: 'Your email',
        button: 'Subscribe',
      },
      copyright: 'All rights reserved',
    },
    agencyLogin: {
      title: 'Agency Portal',
      subtitle: 'Easy2Book B2B — Sign in to your agency space',
      emailLabel: 'Email address',
      passwordLabel: 'Password',
      submit: 'Sign in',
      loading: 'Signing in...',
      noAccount: 'Not a partner yet?',
      contactUs: 'Contact us',
      backToSite: 'Back to main site',
      fillAll: 'Please fill in all fields',
      accessDenied: 'This portal is for agency users only. Access denied.',
      wrongCredentials: 'Incorrect email or password',
    },
  },
};
