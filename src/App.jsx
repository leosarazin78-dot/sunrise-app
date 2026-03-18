import { useState, useEffect, useRef, useCallback } from "react";

// ━━━ THEMES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const THEMES = {
  aurore: { name: "Aurore", icon: "🌅", bg: "linear-gradient(165deg,#1a1023,#2d1b3d 30%,#4a2040 60%,#8b3a4a 85%,#d4845a)", card: "rgba(255,255,255,0.06)", cb: "rgba(255,255,255,0.08)", ac: "#f0a060", ac2: "#e07898", tx: "#f5ede6", mu: "rgba(245,237,230,0.5)", gw: "rgba(240,160,96,0.15)" },
  ocean: { name: "Océan", icon: "🌊", bg: "linear-gradient(165deg,#0a1628,#0d2137 30%,#10344e 60%,#1a5276 85%,#2e86ab)", card: "rgba(255,255,255,0.05)", cb: "rgba(255,255,255,0.07)", ac: "#5ec4d4", ac2: "#2e86ab", tx: "#e8f4f8", mu: "rgba(232,244,248,0.45)", gw: "rgba(94,196,212,0.12)" },
  foret: { name: "Forêt", icon: "🌿", bg: "linear-gradient(165deg,#0d1a0d,#142814 30%,#1a3a1a 60%,#2d5a2d 85%,#4a8a4a)", card: "rgba(255,255,255,0.05)", cb: "rgba(255,255,255,0.07)", ac: "#8bca6b", ac2: "#4a8a4a", tx: "#e8f2e8", mu: "rgba(232,242,232,0.45)", gw: "rgba(139,202,107,0.12)" },
  creme: { name: "Crème", icon: "☁️", bg: "linear-gradient(165deg,#f8f4ef,#f2ebe0 30%,#ede4d6 60%,#e8dcc8 85%,#ddd0b8)", card: "rgba(0,0,0,0.04)", cb: "rgba(0,0,0,0.07)", ac: "#b8860b", ac2: "#8b6914", tx: "#2c2418", mu: "rgba(44,36,24,0.45)", gw: "rgba(184,134,11,0.08)" },
  nuit: { name: "Nuit", icon: "🌙", bg: "linear-gradient(165deg,#08080c,#0e0e18 30%,#141428 60%,#1a1a3e 85%,#222260)", card: "rgba(255,255,255,0.04)", cb: "rgba(255,255,255,0.06)", ac: "#a78bfa", ac2: "#6d5acd", tx: "#e4e0f0", mu: "rgba(228,224,240,0.4)", gw: "rgba(167,139,250,0.1)" },
};

// ━━━ DATA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ALL_PLUGINS = [
  { id: "meteo", icon: "🌤️", name: "Météo", desc: "Conditions locales détaillées", cat: "info" },
  { id: "news", icon: "📰", name: "Actus", desc: "Titres selon vos sources", cat: "info" },
  { id: "agenda", icon: "📅", name: "Agenda", desc: "RDV importants uniquement", cat: "info" },
  { id: "radio", icon: "📻", name: "Radio", desc: "Station + durée au choix", cat: "media" },
  { id: "podcast", icon: "🎙️", name: "Podcast", desc: "Dernier épisode auto", cat: "media" },
  { id: "spotify", icon: "🎧", name: "Spotify", desc: "Playlist de réveil", cat: "media" },
  { id: "yoga", icon: "🧘", name: "Yoga", desc: "Chaîne YouTube au choix", cat: "well" },
  { id: "sport", icon: "💪", name: "Sport", desc: "App, YouTube ou podcast", cat: "well" },
  { id: "petitdej", icon: "🥐", name: "Petit-déj", desc: "Nutrition et énergie détaillées", cat: "well" },
  { id: "citation", icon: "💬", name: "Citation", desc: "Selon votre humeur", cat: "well" },
];

const RADIOS = [
  { name: "France Inter", url: "https://icecast.radiofrance.fr/franceinter-hifi.aac" },
  { name: "France Info", url: "https://icecast.radiofrance.fr/franceinfo-hifi.aac" },
  { name: "FIP", url: "https://icecast.radiofrance.fr/fip-hifi.aac" },
  { name: "NRJ", url: "https://scdn.nrjaudio.fm/adwz2/fr/30001/mp3_128.mp3" },
  { name: "RTL", url: "https://streamer-03.rtl.fr/rtl-1-44-128" },
  { name: "Chérie FM", url: "https://scdn.nrjaudio.fm/adwz2/fr/30201/mp3_128.mp3" },
];

const NEWS_APPS = [
  { id: "flipboard", name: "Flipboard", url: "https://flipboard.com", icon: "📕" },
  { id: "google", name: "Google News", url: "https://news.google.com/?hl=fr", icon: "🔍" },
  { id: "franceinfo", name: "France Info", url: "https://www.francetvinfo.fr", icon: "📺" },
  { id: "lemonde", name: "Le Monde", url: "https://www.lemonde.fr", icon: "📰" },
  { id: "lequipe", name: "L'Équipe", url: "https://www.lequipe.fr", icon: "⚽" },
  { id: "lesechos", name: "Les Échos", url: "https://www.lesechos.fr", icon: "📊" },
];

const NEWS_CATS = ["Général", "Tech", "Sport", "Économie", "Culture", "Local", "Monde", "Science"];

const MOCK_NEWS_BY_CAT = {
  "Général": [{ t: "Plan vélo : 200 km de pistes d'ici 2027", s: "Flipboard", u: "https://flipboard.com" }],
  "Tech": [{ t: "Startup IA lève 50M€ pour la santé", s: "Les Échos", u: "https://www.lesechos.fr" }],
  "Météo": [{ t: "Températures record attendues ce week-end", s: "France Info", u: "https://www.francetvinfo.fr" }],
  "Culture": [{ t: "Festival gratuit au parc samedi", s: "Google News", u: "https://news.google.com" }],
};

const AGENDA = [
  { time: "09:00", title: "Stand-up équipe", col: "#6366f1", prio: "normal" },
  { time: "10:30", title: "Appel client — Projet Alpha", col: "#e07898", prio: "high" },
  { time: "12:30", title: "Déjeuner avec Marie", col: "#f0a060", prio: "low" },
  { time: "14:00", title: "Review design Sprint 4", col: "#8bca6b", prio: "high" },
  { time: "18:30", title: "Yoga", col: "#5ec4d4", prio: "low" },
];

const SPORT_APPS = [
  { name: "Strava", url: "https://www.strava.com/dashboard", icon: "🏃" },
  { name: "Nike Training", url: "https://www.nike.com/ntc-app", icon: "✔️" },
  { name: "Freeletics", url: "https://www.freeletics.com", icon: "🔥" },
  { name: "Seven — 7 min", url: "https://seven.app", icon: "⏱️" },
];

const YT_YOGA = [
  { name: "Yoga With Adriene", ch: "https://www.youtube.com/@yogawithadriene", icon: "🧘" },
  { name: "Mady Morrison", ch: "https://www.youtube.com/@MadyMorrison", icon: "🌸" },
  { name: "Delphine Marie Yoga", ch: "https://www.youtube.com/@DelphineMarieYoga", icon: "🇫🇷" },
  { name: "Personnalisé…", ch: "", icon: "✏️" },
];

const YT_SPORT = [
  { name: "MajorMouv", ch: "https://www.youtube.com/@MajorMouv", icon: "💪" },
  { name: "Tibo InShape", ch: "https://www.youtube.com/@TiboInShape", icon: "🏋️" },
  { name: "Blogilates", ch: "https://www.youtube.com/@blogilates", icon: "🩷" },
  { name: "Personnalisé…", ch: "", icon: "✏️" },
];

const YT_PODCAST = [
  { name: "Génération DIY", ch: "https://www.youtube.com/@GenerationDIY", icon: "🚀" },
  { name: "Vlan!", ch: "https://www.youtube.com/@Vaborislab", icon: "💡" },
  { name: "Thinkerview", ch: "https://www.youtube.com/@thinkerview", icon: "🎤" },
  { name: "Personnalisé…", ch: "", icon: "✏️" },
];

const PODCAST_APPS = [
  { name: "Apple Podcasts", url: "https://podcasts.apple.com", icon: "🎧" },
  { name: "Spotify Podcasts", url: "https://open.spotify.com/genre/podcasts-page", icon: "🟢" },
  { name: "YouTube", url: "https://www.youtube.com/feed/podcasts", icon: "▶️" },
];

// ━━━ PETIT-DEJ ENRICHI ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PETITDEJ = [
  {
    name: "Bowl Protéiné", icon: "🥣", totalCal: 485, prepTime: "5 min",
    energy: { label: "Énergie soutenue", desc: "Libération lente jusqu'à 12h — idéal pour une matinée de travail intense", color: "#4ade80" },
    macros: { proteines: 28, glucides: 52, lipides: 18, fibres: 8 },
    ingredients: [
      { name: "Yaourt grec 0%", qty: "150g", cal: 87, prot: 15, icon: "🥛" },
      { name: "Granola maison", qty: "40g", cal: 180, prot: 4, icon: "🥣" },
      { name: "Banane", qty: "1 moyenne", cal: 105, prot: 1, icon: "🍌" },
      { name: "Miel", qty: "1 c.à.s.", cal: 64, prot: 0, icon: "🍯" },
      { name: "Graines de chia", qty: "10g", cal: 49, prot: 2, icon: "🌱" },
      { name: "Myrtilles", qty: "50g", cal: 29, prot: 0.4, icon: "🫐" },
    ],
  },
  {
    name: "Tartines Avocat-Œuf", icon: "🍞", totalCal: 420, prepTime: "8 min",
    energy: { label: "Boost matinal", desc: "Protéines + bons gras — concentration et satiété longue durée", color: "#f0a060" },
    macros: { proteines: 22, glucides: 35, lipides: 24, fibres: 10 },
    ingredients: [
      { name: "Pain complet", qty: "2 tranches", cal: 160, prot: 6, icon: "🍞" },
      { name: "Avocat", qty: "½", cal: 120, prot: 1.5, icon: "🥑" },
      { name: "Œuf poché", qty: "1", cal: 72, prot: 6, icon: "🥚" },
      { name: "Graines de sésame", qty: "5g", cal: 29, prot: 1, icon: "🌿" },
      { name: "Tomate cerise", qty: "5 pièces", cal: 15, prot: 0.5, icon: "🍅" },
      { name: "Jus de citron", qty: "filet", cal: 4, prot: 0, icon: "🍋" },
    ],
  },
  {
    name: "Smoothie Énergie Verte", icon: "🥤", totalCal: 380, prepTime: "3 min",
    energy: { label: "Énergie rapide", desc: "Vitamines + minéraux — parfait avant une séance de sport matinale", color: "#8bca6b" },
    macros: { proteines: 14, glucides: 48, lipides: 16, fibres: 7 },
    ingredients: [
      { name: "Épinards frais", qty: "50g", cal: 12, prot: 1.5, icon: "🥬" },
      { name: "Banane congelée", qty: "1", cal: 105, prot: 1, icon: "🍌" },
      { name: "Lait d'amande", qty: "200ml", cal: 26, prot: 0.5, icon: "🥛" },
      { name: "Beurre de cacahuète", qty: "1 c.à.s.", cal: 94, prot: 4, icon: "🥜" },
      { name: "Graines de lin", qty: "10g", cal: 55, prot: 2, icon: "🌾" },
      { name: "Miel ou dattes", qty: "1 c.à.c.", cal: 22, prot: 0, icon: "🍯" },
      { name: "Glaçons", qty: "3-4", cal: 0, prot: 0, icon: "🧊" },
    ],
  },
  {
    name: "Porridge Pomme-Cannelle", icon: "🥣", totalCal: 410, prepTime: "6 min",
    energy: { label: "Chaleur durable", desc: "Glucides complexes — libération progressive sur 4h, confort digestif", color: "#f59e0b" },
    macros: { proteines: 12, glucides: 62, lipides: 14, fibres: 9 },
    ingredients: [
      { name: "Flocons d'avoine", qty: "50g", cal: 190, prot: 7, icon: "🥣" },
      { name: "Lait demi-écrémé", qty: "200ml", cal: 92, prot: 6, icon: "🥛" },
      { name: "Pomme", qty: "1 râpée", cal: 72, prot: 0.3, icon: "🍎" },
      { name: "Cannelle", qty: "1 c.à.c.", cal: 6, prot: 0, icon: "🫙" },
      { name: "Noix", qty: "15g", cal: 98, prot: 2, icon: "🌰" },
      { name: "Raisins secs", qty: "10g", cal: 30, prot: 0.3, icon: "🍇" },
    ],
  },
  {
    name: "Crêpes Protéinées", icon: "🥞", totalCal: 450, prepTime: "12 min",
    energy: { label: "Énergie gourmande", desc: "Équilibre plaisir et nutrition — réconfort du week-end", color: "#e07898" },
    macros: { proteines: 24, glucides: 50, lipides: 16, fibres: 5 },
    ingredients: [
      { name: "Farine complète", qty: "60g", cal: 192, prot: 8, icon: "🌾" },
      { name: "Œuf entier", qty: "1", cal: 72, prot: 6, icon: "🥚" },
      { name: "Lait végétal", qty: "150ml", cal: 20, prot: 0.5, icon: "🥛" },
      { name: "Whey vanille", qty: "15g", cal: 58, prot: 12, icon: "💪" },
      { name: "Fruits rouges", qty: "80g", cal: 40, prot: 0.8, icon: "🍓" },
      { name: "Sirop d'érable", qty: "1 c.à.s.", cal: 52, prot: 0, icon: "🍁" },
    ],
  },
  {
    name: "Açaí Bowl", icon: "🫐", totalCal: 460, prepTime: "5 min",
    energy: { label: "Antioxydant boost", desc: "Superaliments + fibres — énergie progressive et défenses immunitaires", color: "#a78bfa" },
    macros: { proteines: 10, glucides: 58, lipides: 18, fibres: 11 },
    ingredients: [
      { name: "Purée d'açaí", qty: "100g sachet", cal: 70, prot: 1, icon: "🫐" },
      { name: "Banane congelée", qty: "1", cal: 105, prot: 1, icon: "🍌" },
      { name: "Lait de coco", qty: "80ml", cal: 72, prot: 0.5, icon: "🥥" },
      { name: "Granola", qty: "30g", cal: 135, prot: 3, icon: "🥣" },
      { name: "Noix de coco râpée", qty: "10g", cal: 65, prot: 0.7, icon: "🥥" },
      { name: "Kiwi", qty: "1 tranché", cal: 42, prot: 0.8, icon: "🥝" },
      { name: "Beurre d'amande", qty: "1 c.à.c.", cal: 33, prot: 1, icon: "🌰" },
    ],
  },
  {
    name: "Overnight Oats Choco", icon: "🍫", totalCal: 430, prepTime: "2 min (veille)",
    energy: { label: "Prêt en avance", desc: "Préparé la veille — 0 effort le matin, énergie stable toute la matinée", color: "#5ec4d4" },
    macros: { proteines: 16, glucides: 55, lipides: 16, fibres: 8 },
    ingredients: [
      { name: "Flocons d'avoine", qty: "45g", cal: 171, prot: 6, icon: "🥣" },
      { name: "Lait d'amande", qty: "150ml", cal: 20, prot: 0.5, icon: "🥛" },
      { name: "Yaourt grec", qty: "80g", cal: 46, prot: 8, icon: "🥛" },
      { name: "Cacao en poudre", qty: "10g", cal: 23, prot: 2, icon: "🍫" },
      { name: "Graines de chia", qty: "10g", cal: 49, prot: 2, icon: "🌱" },
      { name: "Banane", qty: "½", cal: 53, prot: 0.5, icon: "🍌" },
      { name: "Pépites de chocolat", qty: "10g", cal: 53, prot: 0.5, icon: "🍫" },
      { name: "Miel", qty: "1 c.à.c.", cal: 21, prot: 0, icon: "🍯" },
    ],
  },
];

const MOODS = [
  { emoji: "😊", label: "Content" }, { emoji: "😴", label: "Fatigué" },
  { emoji: "💪", label: "Motivé" }, { emoji: "😰", label: "Stressé" }, { emoji: "🤔", label: "Pensif" },
];

const MOOD_CITATIONS = {
  "😊": ["La joie est la plus belle des conquêtes. — Voltaire", "Le bonheur est parfois caché dans l'inconnu. — Hugo"],
  "😴": ["Le repos est la sauce des travaux. — Plutarque", "Même la nuit la plus sombre prendra fin. — Hugo"],
  "💪": ["Le seul voyage impossible est celui qu'on ne commence jamais. — Robbins", "Soyez le changement. — Gandhi"],
  "😰": ["La patience est amère mais son fruit est doux. — Rousseau", "Au milieu de la difficulté se trouve l'opportunité. — Einstein"],
  "🤔": ["Savoir, c'est se souvenir. — Aristote", "Le doute est le commencement de la sagesse. — Aristote"],
};

// ━━━ HOOKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function useClock() { const [n, setN] = useState(new Date()); useEffect(() => { const id = setInterval(() => setN(new Date()), 1000); return () => clearInterval(id); }, []); return n; }

function getDST() {
  const n = new Date(), ja = new Date(n.getFullYear(), 0, 1).getTimezoneOffset(), ju = new Date(n.getFullYear(), 6, 1).getTimezoneOffset(), is = n.getTimezoneOffset() < Math.max(ja, ju);
  for (let d = 1; d <= 7; d++) { const f = new Date(n.getTime() + d * 864e5); if ((f.getTimezoneOffset() < Math.max(ja, ju)) !== is) return { changing: true, date: f.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }), dir: f.getTimezoneOffset() < n.getTimezoneOffset() ? "+1h" : "-1h" }; }
  return { changing: false };
}

function Toggle({ on, onToggle, T }) {
  return (
    <button onClick={onToggle} style={{ width: 38, height: 20, borderRadius: 10, background: on ? T.ac : T.card, border: `1px solid ${on ? T.ac : T.cb}`, position: "relative", transition: "all .2s", flexShrink: 0, cursor: "pointer", padding: 0 }}>
      <div style={{ width: 16, height: 16, borderRadius: 8, background: on ? "#fff" : T.mu, position: "absolute", top: 1, left: on ? 20 : 1, transition: "all .2s" }} />
    </button>
  );
}

// ━━━ MACRO BAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function MacroBar({ macros, T }) {
  const total = macros.proteines + macros.glucides + macros.lipides;
  const pcts = { p: (macros.proteines / total * 100).toFixed(0), g: (macros.glucides / total * 100).toFixed(0), l: (macros.lipides / total * 100).toFixed(0) };
  return (
    <div>
      <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", height: 8, marginBottom: 8 }}>
        <div style={{ width: pcts.p + "%", background: "#f87171", transition: "width .5s" }} />
        <div style={{ width: pcts.g + "%", background: "#fbbf24", transition: "width .5s" }} />
        <div style={{ width: pcts.l + "%", background: "#60a5fa", transition: "width .5s" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
        <span style={{ color: "#f87171" }}>🔴 Protéines {macros.proteines}g</span>
        <span style={{ color: "#fbbf24" }}>🟡 Glucides {macros.glucides}g</span>
        <span style={{ color: "#60a5fa" }}>🔵 Lipides {macros.lipides}g</span>
      </div>
      <div style={{ fontSize: 11, color: T.mu, marginTop: 4 }}>🌾 Fibres : {macros.fibres}g</div>
    </div>
  );
}

// ━━━ PETIT-DEJ CARD (briefing) ━━━━━━━━━━━━━━━━━━━━━━
function PetitDejCard({ meal, T, expanded, onToggle }) {
  const cd = { background: T.card, border: `1px solid ${T.cb}`, borderRadius: 16, padding: "14px 16px", backdropFilter: "blur(20px)" };
  return (
    <div style={{ animation: "fu .5s ease" }}>
      {/* Header */}
      <div style={{ ...cd, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 40 }}>{meal.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{meal.name}</div>
            <div style={{ fontSize: 12, color: T.mu, marginTop: 2 }}>⏱ {meal.prepTime}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 200, color: T.ac }}>{meal.totalCal}</div>
            <div style={{ fontSize: 10, color: T.mu, fontWeight: 700, letterSpacing: 0.5 }}>KCAL</div>
          </div>
        </div>
        {/* Energy badge */}
        <div style={{ background: meal.energy.color + "18", border: `1px solid ${meal.energy.color}33`, borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: meal.energy.color }}>⚡ {meal.energy.label}</div>
          <div style={{ fontSize: 12, color: T.mu, marginTop: 3, lineHeight: 1.4 }}>{meal.energy.desc}</div>
        </div>
        <MacroBar macros={meal.macros} T={T} />
      </div>

      {/* Ingredients */}
      <button onClick={onToggle} style={{ width: "100%", ...cd, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "inherit", color: T.tx, marginBottom: expanded ? 6 : 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>🛒 Ingrédients ({meal.ingredients.length})</span>
        <span style={{ fontSize: 16, transition: "transform .2s", transform: expanded ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
      </button>

      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {meal.ingredients.map((ing, i) => (
            <div key={i} style={{ ...cd, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, animation: `sl .3s ease ${i * .04}s both` }}>
              <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{ing.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{ing.name}</div>
                <div style={{ fontSize: 11, color: T.mu }}>{ing.qty}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.ac }}>{ing.cal}</div>
                <div style={{ fontSize: 10, color: T.mu }}>kcal</div>
              </div>
              {ing.prot > 0 && <div style={{ fontSize: 10, color: "#f87171", fontWeight: 600, minWidth: 28, textAlign: "right" }}>{ing.prot}g P</div>}
            </div>
          ))}
          {/* Total row */}
          <div style={{ ...cd, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: T.ac + "15", border: `1px solid ${T.ac}33` }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Total</span>
            <div style={{ display: "flex", gap: 14, fontSize: 13 }}>
              <span style={{ fontWeight: 700, color: T.ac }}>{meal.totalCal} kcal</span>
              <span style={{ color: "#f87171", fontWeight: 600 }}>{meal.macros.proteines}g P</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ━━━ MAIN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function SunriseApp() {
  const now = useClock();
  const [scr, setScr] = useState("home");
  const [theme, setTheme] = useState("aurore");
  const [city, setCity] = useState("Clamart");
  const [selVoice, setSelVoice] = useState(null);
  const [voices, setVoices] = useState([]);
  const [aWeek, setAWeek] = useState("07:00");
  const [aWE, setAWE] = useState("09:00");
  const [aOn, setAOn] = useState(false);
  const [plugs, setPlugs] = useState(["meteo", "news", "agenda", "yoga", "petitdej"]);
  const [order, setOrder] = useState(["meteo", "news", "agenda", "yoga", "petitdej"]);
  const [newsApps, setNewsApps] = useState(["flipboard", "google"]);
  const [newsCats, setNewsCats] = useState(["Général", "Tech"]);
  const [selRadio, setSelRadio] = useState(RADIOS[0]);
  const [radioMin, setRadioMin] = useState(15);
  const [sportMode, setSportMode] = useState("app");
  const [sportApp, setSportApp] = useState(SPORT_APPS[0]);
  const [sportYT, setSportYT] = useState(YT_SPORT[0]);
  const [yogaYT, setYogaYT] = useState(YT_YOGA[0]);
  const [customYogaURL, setCustomYogaURL] = useState("");
  const [customSportURL, setCustomSportURL] = useState("");
  const [podcastSrc, setPodcastSrc] = useState("youtube");
  const [podcastYT, setPodcastYT] = useState(YT_PODCAST[0]);
  const [podcastApp, setPodcastApp] = useState(PODCAST_APPS[0]);
  const [customPodcastURL, setCustomPodcastURL] = useState("");
  const [mood, setMood] = useState("😊");
  const [weatherDetail, setWeatherDetail] = useState({ rain: false, wind: true, sun: true, humidity: false });
  const [briefing, setBriefing] = useState(false);
  const [bStep, setBStep] = useState(-1);
  const [weather, setWeather] = useState(null);
  const [settingsTab, setSettingsTab] = useState("general");
  const [pdjExpanded, setPdjExpanded] = useState(false);
  const audioRef = useRef(null);
  const activeRef = useRef(false);

  const T = THEMES[theme];
  const isWE = [0, 6].includes(now.getDay());
  const alarm = isWE ? aWE : aWeek;
  const hhmm = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const dst = getDST();
  const di = now.getDay();
  const todayPDJ = PETITDEJ[di % PETITDEJ.length];
  const todayCit = (MOOD_CITATIONS[mood] || MOOD_CITATIONS["😊"])[di % 2];
  const smartAgenda = AGENDA.filter(e => e.prio === "high" || parseInt(e.time) <= parseInt(hhmm.replace(":", "")) / 100 + 2);

  useEffect(() => { const l = () => setVoices((window.speechSynthesis?.getVoices() || []).filter(v => v.lang.startsWith("fr") || v.lang.startsWith("en"))); l(); window.speechSynthesis?.addEventListener("voiceschanged", l); return () => window.speechSynthesis?.removeEventListener("voiceschanged", l); }, []);

  useEffect(() => {
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr`).then(r => r.json()).then(g => {
      if (!g.results?.[0]) throw 0;
      const { latitude: la, longitude: lo } = g.results[0];
      return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&timezone=auto&forecast_days=1`).then(r => r.json()).then(d => setWeather(d));
    }).catch(() => setWeather(null));
  }, [city]);

  useEffect(() => { if (aOn && hhmm === alarm && !briefing) startBriefing(); }, [hhmm, aOn]);

  useEffect(() => {
    if (!briefing) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return;
    const r = new SR(); r.lang = "fr-FR"; r.continuous = true;
    r.onresult = (e) => { const t = Array.from(e.results).slice(-1)[0]?.[0]?.transcript?.toLowerCase() || ""; if (t.includes("stop") || t.includes("arrête")) stopB(); };
    try { r.start(); } catch (e) {} return () => { try { r.stop(); } catch (e) {} };
  }, [briefing]);

  const wI = (c) => c <= 1 ? "☀️" : c <= 3 ? "⛅" : c <= 48 ? "🌫️" : c <= 67 ? "🌧️" : c <= 77 ? "🌨️" : c <= 86 ? "🌦️" : "⛈️";
  const wD = (c) => c <= 1 ? "ciel dégagé" : c <= 3 ? "nuageux" : c <= 48 ? "brouillard" : c <= 67 ? "pluie" : c <= 77 ? "neige" : c <= 86 ? "averses" : "orage";

  const say = (text) => new Promise(res => {
    if (!window.speechSynthesis) { res(); return; }
    const u = new SpeechSynthesisUtterance(text); u.lang = selVoice?.lang || "fr-FR";
    if (selVoice?.native) u.voice = selVoice.native; u.rate = 0.92; u.pitch = 1.02;
    u.onend = res; u.onerror = res; window.speechSynthesis.speak(u);
  });

  const startBriefing = async () => {
    setBriefing(true); setScr("briefing"); setBStep(0); activeRef.current = true; setAOn(false);
    const active = order.filter(id => plugs.includes(id));
    await say(`Bonjour. Il est ${alarm.replace(":", " heures ")}. ${isWE ? "Bon week-end !" : "Bonne journée !"}`);
    for (let i = 0; i < active.length; i++) {
      if (!activeRef.current) return; setBStep(i);
      const p = active[i];
      if (p === "meteo" && weather) {
        const c = weather.current, d = weather.daily;
        let t = `Météo à ${city} : ${Math.round(c.temperature_2m)} degrés, ${wD(c.weathercode)}. Max ${Math.round(d.temperature_2m_max[0])}, min ${Math.round(d.temperature_2m_min[0])}.`;
        if (weatherDetail.wind) t += ` Vent ${c.windspeed_10m} kilomètres heure.`;
        if (weatherDetail.rain) t += ` Précipitations : ${d.precipitation_sum?.[0] || 0} millimètres.`;
        if (weatherDetail.sun) t += ` Lever ${d.sunrise[0]?.split("T")[1]}, coucher ${d.sunset[0]?.split("T")[1]}.`;
        if (weatherDetail.humidity) t += ` Humidité ${c.relative_humidity_2m} pourcent.`;
        if (dst.changing) t += ` Changement d'heure ${dst.date}, ${dst.dir}.`;
        await say(t);
      }
      if (p === "news") { await say("Les titres."); for (const n of Object.values(MOCK_NEWS_BY_CAT).flat().slice(0, 3)) { if (!activeRef.current) return; await say(n.t); } }
      if (p === "agenda") {
        if (smartAgenda.length === 0) await say("Rien d'urgent ce matin.");
        else { await say(`${smartAgenda.length} rendez-vous importants.`); for (const e of smartAgenda.slice(0, 3)) { if (!activeRef.current) return; await say(`${e.time}, ${e.title}.`); } }
      }
      if (p === "yoga") await say(`Yoga du matin disponible sur votre écran.`);
      if (p === "sport") await say(sportMode === "app" ? `Sport : ouvrez ${sportApp.name}.` : `Sport : vidéo prête sur l'écran.`);
      if (p === "petitdej") await say(`Petit-déjeuner : ${todayPDJ.name}. ${todayPDJ.totalCal} calories, ${todayPDJ.macros.proteines} grammes de protéines, ${todayPDJ.macros.glucides} grammes de glucides. ${todayPDJ.energy.desc}. La liste des ingrédients est sur votre écran.`);
      if (p === "citation") await say(todayCit);
      if (p === "podcast") await say("Podcast prêt.");
      if (p === "spotify") await say("Ouvrez Spotify.");
      if (p === "radio") { await say(`${selRadio.name}.`); try { audioRef.current = new Audio(selRadio.url); audioRef.current.play(); if (radioMin > 0) setTimeout(() => { audioRef.current?.pause(); }, radioMin * 60000); } catch (e) {} }
    }
    if (activeRef.current) await say("Briefing terminé. Excellente journée.");
  };

  const stopB = () => { activeRef.current = false; window.speechSynthesis?.cancel(); if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } setBriefing(false); setBStep(-1); };
  const toggleP = (id) => { setPlugs(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); setOrder(o => o.includes(id) ? o : [...o, id]); };
  const moveP = (id, dir) => { setOrder(o => { const i = o.indexOf(id); if (i < 0) return o; const j = i + dir; if (j < 0 || j >= o.length) return o; const n = [...o]; [n[i], n[j]] = [n[j], n[i]]; return n; }); };

  const cd = { background: T.card, border: `1px solid ${T.cb}`, borderRadius: 16, padding: "14px 16px", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" };
  const tg = { display: "inline-block", background: T.ac + "22", color: T.ac, borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" };
  const sec = { fontSize: 11, fontWeight: 700, color: T.mu, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 };
  const CSS = `@keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes sl{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}@keyframes pu{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;400;600;700&display=swap');*{box-sizing:border-box}input[type="time"]::-webkit-calendar-picker-indicator{filter:invert(0.7)}`;
  const pg = { minHeight: "100vh", background: T.bg, fontFamily: "'Outfit','DM Sans',-apple-system,sans-serif", color: T.tx, maxWidth: 430, margin: "0 auto", overflow: "hidden" };
  const pad = { padding: "18px 18px calc(env(safe-area-inset-bottom,18px)+18px)" };

  // ━━━ BRIEFING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (scr === "briefing") {
    const active = order.filter(id => plugs.includes(id));
    const cur = active[bStep] || active[0];
    return (
      <div style={pg}><style>{CSS}</style>
        <div style={{ ...pad, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 48, fontWeight: 200, letterSpacing: -2 }}>{hhmm}</div>
            <div style={{ fontSize: 12, color: T.mu, textTransform: "capitalize", marginTop: 4 }}>{dateStr} · 📍 {city}</div>
          </div>
          <button onClick={stopB} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: 12, color: "#f87171", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171", animation: "pu 1s infinite" }} /> 🛑 STOP
          </button>
          <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
            {active.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= bStep ? T.ac : T.card, transition: "background .3s" }} />)}
          </div>
          <div style={{ display: "flex", gap: 5, overflowX: "auto", marginBottom: 12, paddingBottom: 2 }}>
            {active.map((pid, i) => { const pl = ALL_PLUGINS.find(p => p.id === pid); return <span key={pid} style={{ ...tg, opacity: i === bStep ? 1 : 0.35, flexShrink: 0 }}>{pl?.icon} {pl?.name}</span>; })}
          </div>

          <div style={{ flex: 1, overflow: "auto", WebkitOverflowScrolling: "touch" }}>
            {cur === "meteo" && weather && (
              <div style={{ ...cd, animation: "fu .5s", textAlign: "center" }}>
                <span style={{ fontSize: 52 }}>{wI(weather.current.weathercode)}</span>
                <div style={{ fontSize: 40, fontWeight: 200, margin: "6px 0" }}>{Math.round(weather.current.temperature_2m)}°C</div>
                <div style={{ color: T.mu, fontSize: 13, textTransform: "capitalize" }}>{wD(weather.current.weathercode)}</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 12, fontSize: 12, color: T.mu, flexWrap: "wrap" }}>
                  <span>↑{Math.round(weather.daily.temperature_2m_max[0])}°</span><span>↓{Math.round(weather.daily.temperature_2m_min[0])}°</span>
                  {weatherDetail.wind && <span>💨{weather.current.windspeed_10m}km/h</span>}
                  {weatherDetail.rain && <span>🌧️{weather.daily.precipitation_sum?.[0] || 0}mm</span>}
                  {weatherDetail.humidity && <span>💧{weather.current.relative_humidity_2m}%</span>}
                </div>
                {weatherDetail.sun && <div style={{ marginTop: 8, fontSize: 12, color: T.mu }}>🌅 {weather.daily.sunrise[0]?.split("T")[1]} — 🌇 {weather.daily.sunset[0]?.split("T")[1]}</div>}
                {dst.changing && <div style={{ ...tg, marginTop: 10 }}>⏰ Changement d'heure {dst.date} ({dst.dir})</div>}
              </div>
            )}
            {cur === "news" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(MOCK_NEWS_BY_CAT).slice(0, 4).map(([cat, items]) => items.map((n, i) => (
                  <a key={cat + i} href={n.u} target="_blank" rel="noopener noreferrer" style={{ ...cd, textDecoration: "none", color: T.tx, animation: `sl .4s ease ${i * .07}s both`, display: "block" }}>
                    <span style={tg}>{cat}</span><div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35, marginTop: 5 }}>{n.t} ↗</div>
                  </a>)))}
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 4 }}>
                  {NEWS_APPS.filter(a => newsApps.includes(a.id)).map(a => <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" style={{ ...tg, textDecoration: "none", padding: "6px 12px", fontSize: 11 }}>{a.icon} {a.name} ↗</a>)}
                </div>
              </div>
            )}
            {cur === "agenda" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={sec}>RDV importants</span><a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: T.ac, textDecoration: "none" }}>Calendar ↗</a></div>
                {smartAgenda.length === 0 && <div style={{ ...cd, textAlign: "center", color: T.mu }}>Rien d'urgent ☀️</div>}
                {smartAgenda.map((ev, i) => (
                  <div key={i} style={{ ...cd, borderLeft: `3px solid ${ev.col}`, display: "flex", alignItems: "center", gap: 12, animation: `sl .4s ease ${i * .07}s both` }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.ac, minWidth: 36 }}>{ev.time}</span>
                    <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{ev.title}</span>
                    {ev.prio === "high" && <span style={{ ...tg, background: "#dc262622", color: "#f87171" }}>⚡</span>}
                  </div>
                ))}
              </div>
            )}
            {cur === "yoga" && (
              <div style={{ ...cd, animation: "fu .5s", textAlign: "center" }}>
                <span style={{ fontSize: 40 }}>🧘</span>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>{yogaYT.name}</div>
                <a href={yogaYT.ch || customYogaURL || "#"} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 14, background: "#dc2626", color: "#fff", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>▶ Ouvrir</a>
              </div>
            )}
            {cur === "sport" && (
              <div style={{ ...cd, animation: "fu .5s", textAlign: "center" }}>
                <span style={{ fontSize: 40 }}>💪</span>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>{sportMode === "app" ? sportApp.name : sportYT.name}</div>
                <a href={sportMode === "app" ? sportApp.url : (sportYT.ch || customSportURL || "#")} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 14, background: T.ac, color: "#000", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>▶ Ouvrir</a>
              </div>
            )}

            {/* ━━━ PETIT-DEJ ENRICHI ━━━ */}
            {cur === "petitdej" && (
              <PetitDejCard meal={todayPDJ} T={T} expanded={pdjExpanded} onToggle={() => setPdjExpanded(!pdjExpanded)} />
            )}

            {cur === "citation" && (
              <div style={{ ...cd, animation: "fu .5s", textAlign: "center", padding: "24px 18px" }}>
                <span style={{ fontSize: 28 }}>{mood}</span>
                <div style={{ fontSize: 15, lineHeight: 1.6, fontStyle: "italic", marginTop: 10 }}>{todayCit}</div>
              </div>
            )}
            {cur === "radio" && (
              <div style={{ ...cd, animation: "fu .5s", textAlign: "center" }}>
                <span style={{ fontSize: 36 }}>📻</span>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>{selRadio.name}</div>
                <div style={{ ...tg, marginTop: 6 }}>● LIVE · {radioMin} min</div>
              </div>
            )}
            {cur === "podcast" && (
              <div style={{ ...cd, animation: "fu .5s", textAlign: "center" }}>
                <span style={{ fontSize: 36 }}>🎙️</span>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>{podcastSrc === "youtube" ? podcastYT.name : podcastApp.name}</div>
                <a href={podcastSrc === "youtube" ? (podcastYT.ch || customPodcastURL) : podcastApp.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 12, background: T.ac, color: "#000", borderRadius: 12, padding: "10px 22px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>▶ Dernier épisode</a>
              </div>
            )}
            {cur === "spotify" && (
              <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer" style={{ ...cd, textDecoration: "none", color: T.tx, display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(135deg,rgba(30,215,96,0.1),rgba(30,215,96,0.03))", border: "1px solid rgba(30,215,96,0.2)" }}>
                <span style={{ fontSize: 34 }}>🎧</span><div><div style={{ fontSize: 16, fontWeight: 700 }}>Spotify</div><div style={{ fontSize: 12, color: T.mu }}>Playlist du matin</div></div><span style={{ marginLeft: "auto", color: "#1DB954", fontSize: 18 }}>↗</span>
              </a>
            )}
          </div>
          <button onClick={() => { stopB(); setScr("home"); }} style={{ marginTop: 10, background: T.card, border: `1px solid ${T.cb}`, borderRadius: 12, padding: 10, color: T.mu, fontSize: 13, cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>← Accueil</button>
        </div>
      </div>
    );
  }

  // ━━━ SETTINGS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (scr === "settings") {
    const STABS = [
      { id: "general", icon: "⚙️", name: "Général" }, { id: "plugins", icon: "🧩", name: "Plugins" },
      { id: "meteo_s", icon: "🌤️", name: "Météo" }, { id: "news_s", icon: "📰", name: "Actus" },
      { id: "media_s", icon: "🎵", name: "Médias" }, { id: "well_s", icon: "🌿", name: "Bien-être" },
    ];
    return (
      <div style={pg}><style>{CSS}</style>
        <div style={{ ...pad, paddingBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <button onClick={() => setScr("home")} style={{ background: "none", border: "none", color: T.ac, fontSize: 14, cursor: "pointer", fontFamily: "inherit", padding: 0 }}>← Retour</button>
            <span style={{ fontSize: 18, fontWeight: 700 }}>Réglages</span>
          </div>
          <div style={{ display: "flex", gap: 4, overflowX: "auto", marginBottom: 16, paddingBottom: 2 }}>
            {STABS.map(t => (
              <button key={t.id} onClick={() => setSettingsTab(t.id)} style={{ ...tg, cursor: "pointer", border: `1px solid ${settingsTab === t.id ? T.ac : T.cb}`, background: settingsTab === t.id ? T.ac + "22" : T.card, color: settingsTab === t.id ? T.ac : T.mu, padding: "7px 12px", fontSize: 11, borderRadius: 10, fontFamily: "inherit", flexShrink: 0, letterSpacing: 0 }}>{t.icon} {t.name}</button>
            ))}
          </div>

          {settingsTab === "general" && (<>
            <div style={{ marginBottom: 20 }}>
              <div style={sec}>⏰ Réveil</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["SEMAINE", aWeek, setAWeek], ["WEEK-END", aWE, setAWE]].map(([l, v, s]) => (
                  <div key={l} style={cd}><div style={{ fontSize: 10, color: T.mu, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>{l}</div>
                    <input type="time" value={v} onChange={e => s(e.target.value)} style={{ width: "100%", background: "transparent", border: `1px solid ${T.cb}`, borderRadius: 10, padding: 8, color: T.tx, fontSize: 20, fontWeight: 600, fontFamily: "inherit", textAlign: "center" }} /></div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}><div style={sec}>📍 Ville</div><input value={city} onChange={e => setCity(e.target.value)} style={{ width: "100%", background: T.card, border: `1px solid ${T.cb}`, borderRadius: 14, padding: "12px 14px", color: T.tx, fontSize: 15, fontFamily: "inherit" }} /></div>
            <div style={{ marginBottom: 20 }}>
              <div style={sec}>🎙️ Voix</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {voices.length > 0 ? voices.slice(0, 6).map((v, i) => (
                  <button key={i} onClick={() => { setSelVoice({ lang: v.lang, native: v }); const u = new SpeechSynthesisUtterance("Bonjour."); u.voice = v; u.lang = v.lang; window.speechSynthesis.speak(u); }} style={{ ...cd, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit", color: T.tx, padding: "10px 14px", ...(selVoice?.native?.name === v.name ? { border: `1px solid ${T.ac}`, background: T.gw } : {}) }}>
                    🎙️ <span style={{ flex: 1, fontSize: 13, fontWeight: 600, textAlign: "left" }}>{v.name}</span><span style={{ fontSize: 10, color: T.mu }}>{v.lang}</span>
                  </button>
                )) : <div style={{ color: T.mu, fontSize: 13 }}>Voix fr-FR par défaut</div>}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={sec}>🎨 Thème</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                {Object.entries(THEMES).map(([k, th]) => (
                  <button key={k} onClick={() => setTheme(k)} style={{ background: th.bg, border: theme === k ? `2px solid ${th.ac}` : `1px solid ${th.cb}`, borderRadius: 12, padding: "12px 2px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontFamily: "inherit" }}>
                    <span style={{ fontSize: 18 }}>{th.icon}</span><span style={{ fontSize: 8, fontWeight: 700, color: th.tx }}>{th.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={sec}>💬 Humeur (citations)</div>
              <div style={{ display: "flex", gap: 6 }}>
                {MOODS.map(m => (
                  <button key={m.emoji} onClick={() => setMood(m.emoji)} style={{ ...cd, flex: 1, cursor: "pointer", textAlign: "center", fontFamily: "inherit", color: T.tx, padding: "10px 4px", ...(mood === m.emoji ? { border: `1px solid ${T.ac}`, background: T.gw } : {}) }}>
                    <div style={{ fontSize: 22 }}>{m.emoji}</div><div style={{ fontSize: 9, color: T.mu, marginTop: 2 }}>{m.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </>)}

          {settingsTab === "plugins" && (() => {
            const cats = { info: "📊 Info", media: "🎵 Médias", well: "🌿 Bien-être" };
            const activeOrd = order.filter(id => plugs.includes(id));
            return (<>
              {activeOrd.length > 0 && (<div style={{ marginBottom: 20 }}>
                <div style={sec}>📋 Ordre</div>
                {activeOrd.map((pid, idx) => { const pl = ALL_PLUGINS.find(p => p.id === pid); return (
                  <div key={pid} style={{ ...cd, display: "flex", alignItems: "center", gap: 8, marginBottom: 5, animation: `fu .3s ease ${idx * .03}s both` }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.mu, minWidth: 14, textAlign: "right" }}>{idx + 1}</span>
                    <span style={{ fontSize: 18 }}>{pl?.icon}</span><span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{pl?.name}</span>
                    <button onClick={() => moveP(pid, -1)} style={{ background: "none", border: "none", color: T.mu, fontSize: 13, cursor: "pointer", padding: 3, fontFamily: "inherit" }}>▲</button>
                    <button onClick={() => moveP(pid, 1)} style={{ background: "none", border: "none", color: T.mu, fontSize: 13, cursor: "pointer", padding: 3, fontFamily: "inherit" }}>▼</button>
                    <button onClick={() => toggleP(pid)} style={{ background: "none", border: "none", color: "#f87171", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>✕</button>
                  </div>); })}
              </div>)}
              {Object.entries(cats).map(([cat, label]) => (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div style={sec}>{label}</div>
                  {ALL_PLUGINS.filter(p => p.cat === cat).map(pl => { const on = plugs.includes(pl.id); return (
                    <div key={pl.id} style={{ ...cd, display: "flex", alignItems: "center", gap: 10, marginBottom: 5, ...(on ? { border: `1px solid ${T.ac}`, background: T.gw } : {}) }}>
                      <span style={{ fontSize: 20 }}>{pl.icon}</span>
                      <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{pl.name}</div><div style={{ fontSize: 11, color: T.mu }}>{pl.desc}</div></div>
                      <Toggle on={on} onToggle={() => toggleP(pl.id)} T={T} />
                    </div>); })}
                </div>
              ))}
            </>);
          })()}

          {settingsTab === "meteo_s" && (
            <div>
              <div style={sec}>Détails lus et affichés</div>
              {[["wind", "💨 Vent"], ["rain", "🌧️ Précipitations (mm)"], ["sun", "🌅 Lever / coucher"], ["humidity", "💧 Humidité"]].map(([k, l]) => (
                <div key={k} style={{ ...cd, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 14 }}>{l}</span>
                  <Toggle on={weatherDetail[k]} onToggle={() => setWeatherDetail(d => ({ ...d, [k]: !d[k] }))} T={T} />
                </div>
              ))}
            </div>
          )}

          {settingsTab === "news_s" && (<>
            <div style={{ marginBottom: 20 }}>
              <div style={sec}>Sources</div>
              {NEWS_APPS.map(a => { const on = newsApps.includes(a.id); return (
                <div key={a.id} style={{ ...cd, display: "flex", alignItems: "center", gap: 10, marginBottom: 5, ...(on ? { border: `1px solid ${T.ac}`, background: T.gw } : {}) }}>
                  <span style={{ fontSize: 18 }}>{a.icon}</span><span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{a.name}</span>
                  <Toggle on={on} onToggle={() => setNewsApps(s => on ? s.filter(x => x !== a.id) : [...s, a.id])} T={T} />
                </div>); })}
            </div>
            <div><div style={sec}>Catégories</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {NEWS_CATS.map(c => { const on = newsCats.includes(c); return (
                  <button key={c} onClick={() => setNewsCats(s => on ? s.filter(x => x !== c) : [...s, c])} style={{ ...tg, cursor: "pointer", border: `1px solid ${on ? T.ac : T.cb}`, background: on ? T.ac + "22" : T.card, color: on ? T.ac : T.mu, padding: "7px 14px", fontSize: 12, borderRadius: 10, fontFamily: "inherit", letterSpacing: 0 }}>{c}</button>); })}
              </div>
            </div>
          </>)}

          {settingsTab === "media_s" && (<>
            <div style={{ marginBottom: 20 }}>
              <div style={sec}>📻 Radio</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
                {RADIOS.map(r => <button key={r.name} onClick={() => setSelRadio(r)} style={{ ...cd, cursor: "pointer", textAlign: "center", fontSize: 11, fontWeight: 600, fontFamily: "inherit", color: T.tx, padding: "10px 4px", ...(selRadio.name === r.name ? { border: `1px solid ${T.ac}`, background: T.gw } : {}) }}>{r.name}</button>)}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: T.mu, marginBottom: 4 }}>Durée</div>
              <div style={{ display: "flex", gap: 5 }}>
                {[10, 15, 20, 30, 60].map(m => <button key={m} onClick={() => setRadioMin(m)} style={{ ...cd, flex: 1, cursor: "pointer", textAlign: "center", fontSize: 13, fontWeight: 700, fontFamily: "inherit", color: T.tx, padding: "8px 4px", ...(radioMin === m ? { border: `1px solid ${T.ac}`, background: T.gw } : {}) }}>{m}m</button>)}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={sec}>🎙️ Podcast</div>
              <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                {[["youtube", "YouTube"], ["app", "Application"]].map(([v, l]) => <button key={v} onClick={() => setPodcastSrc(v)} style={{ ...cd, flex: 1, cursor: "pointer", textAlign: "center", fontSize: 13, fontWeight: 600, fontFamily: "inherit", color: T.tx, ...(podcastSrc === v ? { border: `1px solid ${T.ac}`, background: T.gw } : {}) }}>{l}</button>)}
              </div>
              {podcastSrc === "youtube" ? YT_PODCAST.map(p => (
                <button key={p.name} onClick={() => setPodcastYT(p)} style={{ ...cd, width: "100%", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit", color: T.tx, marginBottom: 5, ...(podcastYT.name === p.name ? { border: `1px solid ${T.ac}`, background: T.gw } : {}) }}>
                  {p.icon} <span style={{ flex: 1, fontSize: 13, fontWeight: 600, textAlign: "left" }}>{p.name}</span>
                </button>
              )) : PODCAST_APPS.map(a => (
                <button key={a.name} onClick={() => setPodcastApp(a)} style={{ ...cd, width: "100%", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit", color: T.tx, marginBottom: 5, ...(podcastApp.name === a.name ? { border: `1px solid ${T.ac}`, background: T.gw } : {}) }}>
                  {a.icon} <span style={{ flex: 1, fontSize: 13, fontWeight: 600, textAlign: "left" }}>{a.name}</span>
                </button>
              ))}
              {podcastSrc === "youtube" && podcastYT.name === "Personnalisé…" && <input value={customPodcastURL} onChange={e => setCustomPodcastURL(e.target.value)} placeholder="URL chaîne YouTube…" style={{ width: "100%", background: T.card, border: `1px solid ${T.cb}`, borderRadius: 12, padding: "10px 12px", color: T.tx, fontSize: 13, fontFamily: "inherit" }} />}
            </div>
          </>)}

          {settingsTab === "well_s" && (<>
            <div style={{ marginBottom: 20 }}>
              <div style={sec}>🧘 Yoga — YouTube</div>
              {YT_YOGA.map(y => <button key={y.name} onClick={() => setYogaYT(y)} style={{ ...cd, width: "100%", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit", color: T.tx, marginBottom: 5, ...(yogaYT.name === y.name ? { border: `1px solid ${T.ac}`, background: T.gw } : {}) }}>{y.icon} <span style={{ flex: 1, fontSize: 13, fontWeight: 600, textAlign: "left" }}>{y.name}</span></button>)}
              {yogaYT.name === "Personnalisé…" && <input value={customYogaURL} onChange={e => setCustomYogaURL(e.target.value)} placeholder="URL chaîne…" style={{ width: "100%", background: T.card, border: `1px solid ${T.cb}`, borderRadius: 12, padding: "10px 12px", color: T.tx, fontSize: 13, fontFamily: "inherit" }} />}
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={sec}>💪 Sport</div>
              <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                {[["app", "App"], ["youtube", "YouTube"], ["podcast", "Podcast"]].map(([v, l]) => <button key={v} onClick={() => setSportMode(v)} style={{ ...cd, flex: 1, cursor: "pointer", textAlign: "center", fontSize: 12, fontWeight: 600, fontFamily: "inherit", color: T.tx, ...(sportMode === v ? { border: `1px solid ${T.ac}`, background: T.gw } : {}) }}>{l}</button>)}
              </div>
              {sportMode === "app" && SPORT_APPS.map(a => <button key={a.name} onClick={() => setSportApp(a)} style={{ ...cd, width: "100%", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit", color: T.tx, marginBottom: 5, ...(sportApp.name === a.name ? { border: `1px solid ${T.ac}`, background: T.gw } : {}) }}>{a.icon} <span style={{ flex: 1, fontSize: 13, fontWeight: 600, textAlign: "left" }}>{a.name}</span></button>)}
              {sportMode === "youtube" && (<>{YT_SPORT.map(y => <button key={y.name} onClick={() => setSportYT(y)} style={{ ...cd, width: "100%", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit", color: T.tx, marginBottom: 5, ...(sportYT.name === y.name ? { border: `1px solid ${T.ac}`, background: T.gw } : {}) }}>{y.icon} <span style={{ flex: 1, fontSize: 13, fontWeight: 600, textAlign: "left" }}>{y.name}</span></button>)}
              {sportYT.name === "Personnalisé…" && <input value={customSportURL} onChange={e => setCustomSportURL(e.target.value)} placeholder="URL chaîne…" style={{ width: "100%", background: T.card, border: `1px solid ${T.cb}`, borderRadius: 12, padding: "10px 12px", color: T.tx, fontSize: 13, fontFamily: "inherit" }} />}</>)}
            </div>
            <div>
              <div style={sec}>🥐 Petit-déj — Aperçu du jour</div>
              <div style={{ ...cd, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 28 }}>{todayPDJ.icon}</span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 700 }}>{todayPDJ.name}</div><div style={{ fontSize: 12, color: T.mu }}>{todayPDJ.totalCal} kcal · {todayPDJ.ingredients.length} ingrédients</div></div>
                </div>
                <MacroBar macros={todayPDJ.macros} T={T} />
                <div style={{ marginTop: 10, background: todayPDJ.energy.color + "18", border: `1px solid ${todayPDJ.energy.color}33`, borderRadius: 10, padding: "8px 12px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: todayPDJ.energy.color }}>⚡ {todayPDJ.energy.label}</div>
                  <div style={{ fontSize: 11, color: T.mu, marginTop: 2 }}>{todayPDJ.energy.desc}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: T.mu, marginTop: 6 }}>7 recettes en rotation quotidienne avec ingrédients détaillés, calories par aliment et profil énergétique.</div>
            </div>
          </>)}
        </div>
      </div>
    );
  }

  // ━━━ HOME ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const activeList = order.filter(id => plugs.includes(id));
  return (
    <div style={pg}><style>{CSS}</style>
      <div style={{ ...pad, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.5 }}><span style={{ color: T.ac }}>Sun</span>rise</div>
          <button onClick={() => setScr("settings")} style={{ background: T.card, border: `1px solid ${T.cb}`, borderRadius: 10, padding: "5px 10px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: T.tx, backdropFilter: "blur(20px)" }}>⚙️</button>
        </div>
        <div style={{ textAlign: "center", margin: "28px 0 20px", animation: "fu .6s" }}>
          <div style={{ fontSize: 68, fontWeight: 200, letterSpacing: -3, lineHeight: 1 }}>{hhmm}</div>
          <div style={{ fontSize: 14, color: T.mu, marginTop: 6, textTransform: "capitalize" }}>{dateStr}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 6 }}>
            <span style={tg}>📍 {city}</span><span style={tg}>{isWE ? "🛋️ Week-end" : "💼 Semaine"}</span>
          </div>
        </div>
        {weather && (
          <div style={{ ...cd, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 12, animation: "fu .6s ease .1s both" }}>
            <span style={{ fontSize: 30 }}>{wI(weather.current.weathercode)}</span>
            <div><div style={{ fontSize: 24, fontWeight: 200 }}>{Math.round(weather.current.temperature_2m)}°C</div><div style={{ fontSize: 11, color: T.mu, textTransform: "capitalize" }}>{wD(weather.current.weathercode)}</div></div>
            <div style={{ fontSize: 11, color: T.mu, marginLeft: 6 }}><div>↑{Math.round(weather.daily.temperature_2m_max[0])}° ↓{Math.round(weather.daily.temperature_2m_min[0])}°</div>{weatherDetail.sun && <div>🌅 {weather.daily.sunrise[0]?.split("T")[1]}</div>}</div>
          </div>
        )}
        {dst.changing && (
          <div style={{ ...cd, background: T.ac + "10", border: `1px solid ${T.ac}33`, marginBottom: 12, fontSize: 12, display: "flex", alignItems: "center", gap: 8, animation: "fu .6s ease .15s both" }}>
            ⏰ <div><b>Changement d'heure</b><div style={{ color: T.mu, fontSize: 11, marginTop: 1 }}>{dst.date} — {dst.dir}</div></div>
          </div>
        )}
        <div style={{ ...cd, marginBottom: 12, animation: "fu .6s ease .2s both" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div><div style={{ fontSize: 10, color: T.mu, fontWeight: 700, letterSpacing: 1 }}>RÉVEIL {isWE ? "WEEK-END" : "SEMAINE"}</div><div style={{ fontSize: 28, fontWeight: 200, marginTop: 2 }}>{alarm}</div></div>
            <button onClick={() => setAOn(!aOn)} style={{ width: 50, height: 26, borderRadius: 13, background: aOn ? T.ac : T.card, border: `1px solid ${aOn ? T.ac : T.cb}`, cursor: "pointer", position: "relative", transition: "all .25s", padding: 0 }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, background: aOn ? "#fff" : T.mu, position: "absolute", top: 2, left: aOn ? 28 : 2, transition: "all .25s" }} />
            </button>
          </div>
          {aOn && <div style={{ fontSize: 11, color: "#4ade80", marginTop: 4 }}>✓ Programmé</div>}
        </div>
        <button onClick={startBriefing} style={{ width: "100%", background: `linear-gradient(135deg,${T.ac},${T.ac2})`, border: "none", borderRadius: 14, padding: 14, color: theme === "creme" ? "#fff" : "#000", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit", marginBottom: 14, animation: "fu .6s ease .25s both" }}>
          ▶ Lancer le briefing
        </button>
        <div style={{ marginBottom: 12, animation: "fu .6s ease .3s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={sec}>Routine — {activeList.length} plugins</span>
            <button onClick={() => { setScr("settings"); setSettingsTab("plugins"); }} style={{ background: "none", border: "none", color: T.ac, fontSize: 11, cursor: "pointer", fontFamily: "inherit", padding: 0 }}>Modifier ↗</button>
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {activeList.map((pid, i) => { const pl = ALL_PLUGINS.find(p => p.id === pid); return (
              <div key={pid} style={{ background: T.card, border: `1px solid ${T.cb}`, borderRadius: 10, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5, fontSize: 12, backdropFilter: "blur(10px)" }}>
                <span style={{ fontSize: 9, color: T.mu, fontWeight: 700 }}>{i + 1}</span><span>{pl?.icon}</span><span style={{ fontWeight: 600 }}>{pl?.name}</span>
              </div>); })}
          </div>
        </div>
        {/* Petit-dej preview on home */}
        {plugs.includes("petitdej") && (
          <div style={{ marginBottom: 12, animation: "fu .6s ease .32s both" }}>
            <div style={sec}>🥐 Petit-déj du jour</div>
            <div style={{ ...cd, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>{todayPDJ.icon}</span>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{todayPDJ.name}</div><div style={{ fontSize: 11, color: T.mu }}>{todayPDJ.macros.proteines}g protéines · {todayPDJ.macros.fibres}g fibres</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 20, fontWeight: 200, color: T.ac }}>{todayPDJ.totalCal}</div><div style={{ fontSize: 9, color: T.mu, fontWeight: 700 }}>KCAL</div></div>
            </div>
          </div>
        )}
        {smartAgenda.length > 0 && (
          <div style={{ marginBottom: 12, animation: "fu .6s ease .35s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={sec}>Prochain</span><a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: T.ac, textDecoration: "none" }}>Calendar ↗</a></div>
            <div style={{ ...cd, borderLeft: `3px solid ${smartAgenda[0].col}`, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.ac }}>{smartAgenda[0].time}</span><span style={{ fontSize: 13, fontWeight: 500 }}>{smartAgenda[0].title}</span>
            </div>
          </div>
        )}
        <div style={{ marginTop: "auto", textAlign: "center", fontSize: 10, color: T.mu, opacity: 0.4, paddingTop: 10 }}>Sunrise — Réveil vocal intelligent</div>
      </div>
    </div>
  );
}
