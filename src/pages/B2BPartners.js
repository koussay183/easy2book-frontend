import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, DollarSign, BarChart2, Shield, Users, CheckCircle,
  ArrowRight, Globe, Zap, CreditCard, FileText, Search, TrendingUp,
} from 'lucide-react';

export default function B2BPartners() {
  const steps = [
    {
      num: '01',
      title: 'Contactez-nous',
      desc: "Envoyez-nous une demande de partenariat. Notre équipe valide votre agence et crée votre compte sous 24h.",
    },
    {
      num: '02',
      title: 'Configurez votre markup',
      desc: "Depuis votre portail, définissez votre marge (en % ou montant fixe). Tous vos prix clients sont calculés automatiquement.",
    },
    {
      num: '03',
      title: 'Recherchez et réservez',
      desc: "Accédez à l'inventaire complet dès l'activation. Chaque réservation déduit du crédit et génère une ligne de facturation.",
    },
  ];

  const benefits = [
    {
      icon: DollarSign,
      color: '#005096',
      bg: '#e6eef5',
      title: 'Prix nets exclusifs',
      desc: "Accédez aux tarifs fournisseur directs (myGo et futurs fournisseurs). Définissez librement votre marge sur chaque réservation.",
    },
    {
      icon: BarChart2,
      color: '#059669',
      bg: '#d1fae5',
      title: 'Portail de gestion complet',
      desc: "Tableau de bord, recherche hôtels, réservations, équipe, tarifs, factures — tout depuis un seul espace dédié.",
    },
    {
      icon: CreditCard,
      color: '#d97706',
      bg: '#fef3c7',
      title: 'Ligne de crédit dédiée',
      desc: "Crédit prépayé + limite négociable. Chaque réservation est débitée en temps réel. Factures PDF disponibles à tout moment.",
    },
    {
      icon: Users,
      color: '#7c3aed',
      bg: '#ede9fe',
      title: 'Gestion d\'équipe',
      desc: "Créez des comptes Staff pour vos collaborateurs. Ils peuvent réserver sans voir vos marges ni vos données financières.",
    },
    {
      icon: FileText,
      color: '#dc2626',
      bg: '#fee2e2',
      title: 'Facturation automatique',
      desc: "Générez une facture sur n'importe quelle période en un clic. Imprimable, avec le détail coût/markup/commission par réservation.",
    },
    {
      icon: Shield,
      color: '#0891b2',
      bg: '#e0f2fe',
      title: 'Sécurité & isolation totale',
      desc: "Vos données agence sont entièrement isolées du portail B2C. Vos clients particuliers et vos clients agences ne se mélangent jamais.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 pt-28 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Building2 size={12} />
            Programme Partenaire B2B — Easy2Book
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
            La plateforme hôtelière<br />
            <span className="text-secondary-400">dédiée aux agences de voyage.</span>
          </h1>

          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Accédez à des milliers d'hôtels aux tarifs nets, définissez votre propre marge,
            gérez votre équipe et vos factures depuis un portail professionnel dédié.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/agency/login"
              className="inline-flex items-center gap-2 bg-white text-primary-800 font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-primary-50 transition-colors shadow-xl"
            >
              <Building2 size={16} />
              Accéder au portail agence
              <ArrowRight size={15} />
            </Link>
            <a
              href="mailto:partenaires@easy2book.tn"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl text-sm hover:bg-white/15 transition-colors"
            >
              Demander un accès partenaire
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6 mt-16 border-t border-white/10 pt-10 max-w-2xl mx-auto">
            {[
              { val: '5 000+', label: 'Hôtels disponibles' },
              { val: '24h',    label: 'Délai d\'activation' },
              { val: '100%',   label: 'Isolation B2C/B2B' },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{val}</div>
                <div className="text-white/50 text-xs md:text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 md:py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Zap size={12} />
              Simple et rapide
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Comment ça fonctionne ?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Trois étapes pour démarrer vos réservations B2B avec Easy2Book.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-primary-100 z-0 -translate-x-4" />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-primary-700 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-5 shadow-lg">
                    {s.num}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits grid ── */}
      <section className="py-16 md:py-20 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Un portail conçu spécifiquement pour les agences de voyage professionnelles.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 flex-shrink-0" style={{ background: bg }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Admin vs Staff ── */}
      <section className="py-16 md:py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Deux niveaux d'accès</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Gérez les droits de vos collaborateurs avec précision.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agency Admin */}
            <div className="bg-white border-2 border-primary-200 rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center">
                  <Shield size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-0.5">Rôle</div>
                  <div className="text-lg font-bold text-gray-900">Administrateur agence</div>
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-5">
                Le responsable de l'agence. Il configure tout et a accès à toutes les données financières.
              </p>
              <ul className="space-y-2.5">
                {[
                  'Rechercher et réserver des hôtels',
                  'Configurer le markup (% ou fixe)',
                  'Voir les prix fournisseur, les marges et la commission plateforme',
                  'Gérer l\'équipe (ajouter/désactiver des Staff)',
                  'Modifier le profil et les coordonnées de l\'agence',
                  'Générer et imprimer les factures',
                  'Consulter le solde de crédit disponible',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle size={15} className="text-primary-600 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Agency Staff */}
            <div className="bg-white border border-gray-200 rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gray-600 rounded-xl flex items-center justify-center">
                  <Users size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Rôle</div>
                  <div className="text-lg font-bold text-gray-900">Staff (agent de réservation)</div>
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-5">
                Les collaborateurs opérationnels. Ils réservent au nom des clients sans accès aux données sensibles.
              </p>
              <ul className="space-y-2.5 mb-5">
                {[
                  'Rechercher des hôtels (voit uniquement le prix client final)',
                  'Créer des réservations pour les clients',
                  'Consulter ses propres réservations',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 font-medium mb-2">Accès restreint (réservé à l'Admin) :</p>
                <ul className="space-y-1.5">
                  {[
                    'Marges, commissions et bénéfice net',
                    'Configuration du markup',
                    'Gestion d\'équipe',
                    'Factures et données financières',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-gray-400">
                      <span className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Price calculation example ── */}
      <section className="py-16 md:py-20 px-4 bg-white">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Comment les prix sont calculés</h2>
            <p className="text-gray-500">Un exemple concret avec un markup de 20% et une commission plateforme de 10%.</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-primary-700 px-6 py-4">
              <div className="flex items-center gap-2 text-white">
                <TrendingUp size={16} />
                <span className="font-bold text-sm">Exemple de calcul de prix</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { label: 'Prix fournisseur (myGo)',        value: '100,000 TND', note: 'coût réel de la chambre',            color: '#374151', weight: 400 },
                { label: 'Markup agence (+20%)',           value: '+20,000 TND', note: 'votre marge sur le client',          color: '#059669', weight: 600 },
                { label: 'Prix facturé au client',         value: '120,000 TND', note: 'ce que paie votre client',           color: '#005096', weight: 700 },
                { label: 'Commission plateforme (10% de la marge)', value: '-2,000 TND',  note: 'prélevée par Easy2Book',   color: '#dc2626', weight: 500 },
                { label: 'Débit sur votre crédit',         value: '102,000 TND', note: 'prix fournisseur + commission',      color: '#374151', weight: 400 },
                { label: 'Bénéfice net pour l\'agence',   value: '18,000 TND',  note: 'markup − commission plateforme',     color: '#059669', weight: 700 },
              ].map(({ label, value, note, color, weight }) => (
                <div key={label} className="flex items-center justify-between px-6 py-3.5">
                  <div>
                    <span className="text-sm text-gray-700 font-medium">{label}</span>
                    <span className="text-xs text-gray-400 ml-2">({note})</span>
                  </div>
                  <span className="text-sm font-mono" style={{ color, fontWeight: weight }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary-800 to-primary-950">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à démarrer ?</h2>
          <p className="text-white/70 mb-8">
            Déjà partenaire ? Connectez-vous à votre portail.<br />
            Nouvelle agence ? Contactez-nous pour activer votre compte.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/agency/login"
              className="inline-flex items-center gap-2 bg-white text-primary-800 font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-primary-50 transition-colors shadow-lg"
            >
              <Building2 size={16} />
              Portail agence
              <ArrowRight size={14} />
            </Link>
            <a
              href="mailto:partenaires@easy2book.tn"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl text-sm hover:bg-white/15 transition-colors"
            >
              partenaires@easy2book.tn
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
