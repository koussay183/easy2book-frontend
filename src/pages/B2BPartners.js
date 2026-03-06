import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, DollarSign, BarChart2, Shield, Users, CheckCircle,
  ArrowRight, ArrowLeft, Zap, CreditCard, FileText, Search, TrendingUp,
  Star, ChevronDown, ChevronUp, Globe, Lock, Receipt, Headphones,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// ─── Unsplash image URLs ──────────────────────────────────────────────────────
const IMG = {
  hero:      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1800&auto=format&fit=crop&q=85',
  portal:    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80',
  hotel:     'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop&q=80',
  team:      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&auto=format&fit=crop&q=80',
  booking:   'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&auto=format&fit=crop&q=80',
};

// ─── Static data ──────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: '01',
    title: 'Demandez votre accès',
    desc: "Envoyez-nous une demande de partenariat. Notre équipe valide votre agence et crée votre compte B2B sous 24h.",
    icon: FileText,
  },
  {
    num: '02',
    title: 'Configurez votre espace',
    desc: "Accédez à votre portail dédié. Easy2Book configure votre linha de crédit et votre marge. Prêt en quelques minutes.",
    icon: Zap,
  },
  {
    num: '03',
    title: 'Recherchez et réservez',
    desc: "Accès immédiat à +5 000 hôtels aux tarifs nets. Chaque réservation est traitée en temps réel.",
    icon: Search,
  },
];

const FEATURES = [
  {
    icon: DollarSign,
    title: 'Prix nets exclusifs',
    desc: "Accédez aux tarifs fournisseur directs via myGo. Votre marge est affichée clairement sur chaque réservation.",
  },
  {
    icon: BarChart2,
    title: 'Portail de gestion complet',
    desc: "Tableau de bord, recherche hôtels, réservations, équipe, factures — tout depuis un seul espace professionnel.",
  },
  {
    icon: CreditCard,
    title: 'Système de crédit dédié',
    desc: "Rechargez votre crédit via RIB ou en agence. Chaque réservation est débitée instantanément. Factures PDF automatiques.",
  },
  {
    icon: Users,
    title: 'Gestion d\'équipe',
    desc: "Créez des comptes Staff pour vos collaborateurs. Ils réservent sans accéder à vos données financières.",
  },
  {
    icon: Lock,
    title: 'Isolation B2C / B2B totale',
    desc: "Vos clients particuliers et vos clients agence ne se mélangent jamais. Portails 100% séparés.",
  },
  {
    icon: Receipt,
    title: 'Facturation automatique',
    desc: "Générez une facture sur n'importe quelle période en un clic — imprimable, avec le détail de chaque réservation.",
  },
];

const FAQS = [
  {
    q: "Comment fonctionne le système de crédit ?",
    a: "Vous rechargez votre crédit en TND via virement bancaire (RIB) ou directement en agence Easy2Book. Chaque réservation déduit automatiquement le montant correspondant (prix myGo + marge Easy2Book) de votre solde.",
  },
  {
    q: "Combien de temps pour activer mon compte ?",
    a: "Sous 24 heures ouvrées après validation de votre dossier. Notre équipe vous contacte par email avec vos identifiants et vous accompagne à la première connexion.",
  },
  {
    q: "Puis-je créer plusieurs comptes pour mon équipe ?",
    a: "Oui. L'administrateur de votre agence peut créer autant de comptes Staff que nécessaire. Le Staff voit uniquement les prix finaux, sans accès aux marges ni aux données financières.",
  },
  {
    q: "Comment sont calculés les prix affichés ?",
    a: "Le prix affiché dans votre portail correspond au prix fournisseur (myGo) plus la marge Easy2Book configurée pour votre agence. C'est ce montant exact qui est débité de votre crédit lors de la réservation.",
  },
  {
    q: "Est-ce que je peux voir les prix des hôtels avant de réserver ?",
    a: "Oui, vous accédez à l'inventaire complet avec les prix en temps réel. Vous pouvez comparer les options, chambres et régimes avant de confirmer.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({ val, label }) {
  return (
    <div className="text-center px-6 py-4">
      <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{val}</div>
      <div className="text-white/60 text-sm mt-1">{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-primary-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
        <Icon size={20} className="text-primary-700" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="font-semibold text-gray-900 text-sm pr-4">{q}</span>
        {open ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed pt-3">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function B2BPartners() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const Dir = isRTL ? 'rtl' : 'ltr';
  // Directional arrow (flips in RTL)
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-white" dir={Dir}>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden">
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${IMG.hero})` }}
        />
        {/* Multi-layer dark overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950/90 via-primary-900/80 to-primary-800/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950/60 via-transparent to-transparent" />

        <div className="relative z-10 container mx-auto max-w-6xl px-4 py-28">
          <div className={`max-w-3xl ${isRTL ? 'ms-auto' : ''}`}>
            {/* Badge */}
            <span className={`inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-bold px-3.5 py-1.5 rounded-full mb-8 tracking-wide uppercase ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Building2 size={11} />
              Programme Partenaire B2B — Easy2Book
            </span>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
              La plateforme<br />
              hôtelière{' '}
              <span className="text-secondary-400">dédiée</span>
              <br />
              aux agences.
            </h1>

            <p className="text-white/70 text-lg md:text-xl max-w-xl leading-relaxed mb-10">
              Accédez à +5 000 hôtels aux tarifs nets, gérez votre équipe,
              vos crédits et vos factures — depuis un portail professionnel dédié aux agences de voyage.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/agency/login"
                className="inline-flex items-center gap-2 bg-white text-primary-800 font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-primary-50 transition-colors shadow-lg shadow-black/20"
              >
                <Building2 size={15} />
                Accéder au portail agence
                <Arrow size={14} />
              </Link>
              <a
                href="mailto:partenaires@easy2book.tn"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/25 text-white font-semibold px-7 py-3.5 rounded-xl text-sm hover:bg-white/15 transition-colors backdrop-blur-sm"
              >
                Demander un accès
              </a>
            </div>
          </div>
        </div>

        {/* Stats strip pinned to bottom of hero */}
        <div className="relative z-10 border-t border-white/10 bg-primary-950/60 backdrop-blur-sm">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="grid grid-cols-3 divide-x divide-white/10">
              <StatPill val="5 000+" label="Hôtels disponibles" />
              <StatPill val="24h" label="Délai d'activation" />
              <StatPill val="100%" label="Isolation B2C / B2B" />
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────────────────────── */}
      <section className="py-8 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Certifié & sécurisé</span>
            {[
              { icon: Shield, label: 'Données isolées B2C/B2B' },
              { icon: Lock, label: 'HTTPS & JWT Auth' },
              { icon: Globe, label: 'Fournisseur myGo certifié' },
              { icon: Headphones, label: 'Support dédié agences' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Icon size={13} className="text-primary-700" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-bold px-3.5 py-1.5 rounded-full mb-4 tracking-wide uppercase">
              <Zap size={11} />
              Simple & rapide
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Démarrez en 3 étapes
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              De la demande à la première réservation, le processus est entièrement guidé par notre équipe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-9 left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-px bg-gradient-to-r from-primary-100 via-primary-200 to-primary-100 z-0" />
            {STEPS.map((s, i) => (
              <div key={s.num} className="relative z-10 flex flex-col items-start md:items-center md:text-center">
                <div className="w-18 h-18 mb-5 relative">
                  <div className="w-16 h-16 rounded-2xl bg-primary-700 flex items-center justify-center shadow-lg shadow-primary-700/25">
                    <s.icon size={24} className="text-white" />
                  </div>
                  <div className={`absolute -top-1.5 ${isRTL ? '-left-1.5' : '-right-1.5'} w-6 h-6 rounded-full bg-white border-2 border-primary-200 flex items-center justify-center`}>
                    <span className="text-[9px] font-extrabold text-primary-700">{s.num}</span>
                  </div>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPLIT: Who it's for + photo ───────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Photo */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3]">
              <img
                src={IMG.hotel}
                alt="Hôtels partenaires"
                className="w-full h-full object-cover"
              />
              {/* Floating stats card */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-lg flex items-center justify-between gap-4">
                <div className="text-center flex-1 border-r border-gray-100">
                  <div className="text-xl font-extrabold text-primary-700">5 000+</div>
                  <div className="text-xs text-gray-500 mt-0.5">Hôtels disponibles</div>
                </div>
                <div className="text-center flex-1 border-r border-gray-100">
                  <div className="text-xl font-extrabold text-primary-700">Temps réel</div>
                  <div className="text-xs text-gray-500 mt-0.5">Prix & disponibilité</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-xl font-extrabold text-primary-700">TND</div>
                  <div className="text-xs text-gray-500 mt-0.5">Facturation locale</div>
                </div>
              </div>
            </div>

            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-bold px-3.5 py-1.5 rounded-full mb-5 tracking-wide uppercase">
                Pour qui ?
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                Conçu pour les agences professionnelles
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Easy2Book B2B est réservé aux agences de voyage enregistrées. Votre espace est entièrement séparé du portail grand public — vos clients, vos données, vos prix.
              </p>
              <ul className="space-y-3.5">
                {[
                  'Accès aux tarifs nets myGo (non disponibles en B2C)',
                  'Portail de gestion complet : hôtels, réservations, équipe, factures',
                  'Système de crédit prépayé avec limite de confiance',
                  'Marge Easy2Book transparente et fixée à l\'avance',
                  'Isolation totale : vos clients agence ne voient jamais le portail B2C',
                  'Support dédié aux agences partenaires',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-primary-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle size={11} className="text-white" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Tout ce dont votre agence a besoin
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Un portail professionnel complet, pensé pour le quotidien des agences de voyage.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── PRICING EXAMPLE ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-bold px-3.5 py-1.5 rounded-full mb-4 tracking-wide uppercase">
              <TrendingUp size={11} />
              Transparence totale
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Comment fonctionne le calcul des prix
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Vous rechargez des crédits. Lors d'une réservation, le montant exact (prix fournisseur + marge Easy2Book) est débité de votre compte.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Calculation example */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-primary-700 px-5 py-4 flex items-center gap-2.5">
                <TrendingUp size={15} className="text-white/80" />
                <span className="text-white font-bold text-sm">Exemple — Hôtel 2 nuits</span>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { label: 'Prix fournisseur (myGo)',  value: '200,000 TND', sub: 'coût réel de la chambre',        highlight: false },
                  { label: 'Marge Easy2Book (+10%)',   value: '+20,000 TND',  sub: 'configurée par Easy2Book',       highlight: false },
                  { label: 'Débit sur votre crédit',   value: '220,000 TND', sub: 'prix fournisseur + marge',        highlight: true  },
                  { label: 'Prix facturé à votre client', value: 'Votre choix', sub: 'vous fixez librement votre marge client', highlight: false },
                  { label: 'Bénéfice Easy2Book',       value: '20,000 TND',  sub: 'déjà inclus dans vos crédits',   highlight: false },
                ].map(({ label, value, sub, highlight }) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between px-5 py-3.5 ${highlight ? 'bg-primary-50' : ''}`}
                  >
                    <div>
                      <div className="text-sm text-gray-700 font-medium">{label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
                    </div>
                    <span className={`text-sm font-mono font-bold ml-4 ${highlight ? 'text-primary-700 text-base' : 'text-gray-800'}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* How credits work */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CreditCard size={16} className="text-primary-700" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm mb-1">Recharge de crédit</div>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Rechargez votre solde en TND par virement bancaire (RIB Easy2Book) ou directement en agence. Le montant est crédité rapidement sur votre compte.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield size={16} className="text-primary-700" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm mb-1">Limite de crédit accordée</div>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Easy2Book peut accorder une limite de confiance à votre agence, permettant des réservations même quand le solde est temporairement insuffisant.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Receipt size={16} className="text-primary-700" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm mb-1">Facturation automatique</div>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Téléchargez et imprimez vos factures par période en un clic depuis votre portail. Chaque ligne détaille le coût, la marge et le total.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROLES: ADMIN vs STAFF ─────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Deux niveaux d'accès
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Contrôle total pour l'administrateur, accès ciblé pour le staff opérationnel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admin */}
            <div className="bg-white border-2 border-primary-200 rounded-2xl p-7 relative">
              <div className={`absolute -top-3 ${isRTL ? 'right-6' : 'left-6'}`}>
                <span className="bg-primary-700 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide uppercase">Administrateur</span>
              </div>
              <div className="flex items-center gap-3 mt-4 mb-5">
                <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center">
                  <Shield size={17} className="text-white" />
                </div>
                <div className="text-lg font-bold text-gray-900">Admin agence</div>
              </div>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                Le responsable de l'agence. Configure tout, voit toutes les données financières et gère l'équipe.
              </p>
              <ul className="space-y-2.5">
                {[
                  'Rechercher et réserver des hôtels',
                  'Voir les prix fournisseurs et la marge Easy2Book',
                  'Configurer le profil agence',
                  'Gérer les membres de l\'équipe',
                  'Consulter le crédit et l\'historique',
                  'Générer et imprimer les factures',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle size={14} className="text-primary-600 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Staff */}
            <div className="bg-white border border-gray-200 rounded-2xl p-7 relative">
              <div className={`absolute -top-3 ${isRTL ? 'right-6' : 'left-6'}`}>
                <span className="bg-gray-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide uppercase">Staff</span>
              </div>
              <div className="flex items-center gap-3 mt-4 mb-5">
                <div className="w-10 h-10 bg-gray-600 rounded-xl flex items-center justify-center">
                  <Users size={17} className="text-white" />
                </div>
                <div className="text-lg font-bold text-gray-900">Agent de réservation</div>
              </div>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                Collaborateurs opérationnels. Ils réservent pour les clients sans accéder aux données sensibles.
              </p>
              <ul className="space-y-2.5 mb-5">
                {[
                  'Rechercher des hôtels (prix client final uniquement)',
                  'Créer des réservations pour les clients',
                  'Consulter ses propres réservations',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Accès restreint (admin uniquement)</p>
                <ul className="space-y-1.5">
                  {['Marge et prix fournisseur', 'Gestion d\'équipe', 'Factures & crédit'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PORTAL SCREENSHOT ────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-bold px-3.5 py-1.5 rounded-full mb-5 tracking-wide uppercase">
                Le portail agence
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                Un espace pensé pour vos agents
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Recherchez, comparez et réservez des hôtels en quelques clics. Toutes les informations essentielles — prix, disponibilités, options — au même endroit.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { stat: 'Temps réel', desc: 'Prix & disponibilités myGo' },
                  { stat: 'Multi-room', desc: 'Gérez plusieurs chambres' },
                  { stat: 'Multi-régimes', desc: 'BB, HB, FB, All Inc.' },
                  { stat: 'PDF auto', desc: 'Factures en un clic' },
                ].map(({ stat, desc }) => (
                  <div key={stat} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="text-sm font-bold text-primary-700 mb-0.5">{stat}</div>
                    <div className="text-xs text-gray-500">{desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3]">
              <img
                src={IMG.portal}
                alt="Portail de gestion"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/30 to-transparent" />
              <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm`}>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-gray-700">Portail en direct</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 px-4 bg-white">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Questions fréquentes
            </h2>
            <p className="text-gray-500">Tout ce que vous devez savoir avant de rejoindre le programme.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq) => <FaqItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${IMG.team})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950/95 via-primary-900/90 to-primary-800/85" />

        <div className="relative z-10 container mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-1 mb-5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className="text-secondary-400 fill-secondary-400" />
            ))}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Prêt à rejoindre le réseau ?
          </h2>
          <p className="text-white/70 text-lg mb-10 leading-relaxed">
            Déjà partenaire ? Connectez-vous à votre portail.<br />
            Nouvelle agence ? Notre équipe vous répond sous 24h.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/agency/login"
              className="inline-flex items-center gap-2 bg-white text-primary-800 font-bold px-8 py-4 rounded-xl text-sm hover:bg-primary-50 transition-colors shadow-lg shadow-black/20"
            >
              <Building2 size={15} />
              Se connecter au portail
              <Arrow size={14} />
            </Link>
            <a
              href="mailto:partenaires@easy2book.tn"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/25 text-white font-semibold px-8 py-4 rounded-xl text-sm hover:bg-white/15 transition-colors"
            >
              partenaires@easy2book.tn
            </a>
          </div>
          <p className="text-white/40 text-xs mt-8">
            Tunisie · Hôtels · Agences de voyage professionnelles uniquement
          </p>
        </div>
      </section>

    </div>
  );
}
