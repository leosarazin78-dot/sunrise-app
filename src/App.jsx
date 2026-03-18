import { useState, useEffect, useRef, useCallback } from "react";

// ━━━ THEMES (dark, clock-like, warm) ━━━━━━━━━━━━━━━━━
const THEMES = {
  minuit: { name: "Minuit", icon: "🕛", bg: "#0a0a0f", bg2: "#111118", card: "rgba(255,255,255,0.03)", cb: "rgba(255,255,255,0.06)", ac: "#c9a86c", ac2: "#8a6d3b", tx: "#d4cfc7", mu: "rgba(212,207,199,0.35)", gw: "rgba(201,168,108,0.08)", clock: "#c9a86c" },
  charbon: { name: "Charbon", icon: "🌑", bg: "#0d0d0d", bg2: "#151515", card: "rgba(255,255,255,0.025)", cb: "rgba(255,255,255,0.05)", ac: "#e8b96f", ac2: "#a07840", tx: "#c8c4bc", mu: "rgba(200,196,188,0.35)", gw: "rgba(232,185,111,0.07)", clock: "#e8b96f" },
  ardoise: { name: "Ardoise", icon: "🪨", bg: "#0e1117", bg2: "#141820", card: "rgba(255,255,255,0.03)", cb: "rgba(255,255,255,0.06)", ac: "#7eb8c9", ac2: "#4a8a9f", tx: "#c5cdd6", mu: "rgba(197,205,214,0.35)", gw: "rgba(126,184,201,0.07)", clock: "#7eb8c9" },
  foret: { name: "Forêt noire", icon: "🌲", bg: "#090e09", bg2: "#0f160f", card: "rgba(255,255,255,0.025)", cb: "rgba(255,255,255,0.05)", ac: "#8baa6b", ac2: "#5a7a3a", tx: "#c2cab8", mu: "rgba(194,202,184,0.35)", gw: "rgba(139,170,107,0.07)", clock: "#8baa6b" },
  crepuscule: { name: "Crépuscule", icon: "🌆", bg: "#0c0812", bg2: "#12101a", card: "rgba(255,255,255,0.03)", cb: "rgba(255,255,255,0.06)", ac: "#b08acd", ac2: "#7a5a9f", tx: "#cdc6d8", mu: "rgba(205,198,216,0.35)", gw: "rgba(176,138,205,0.07)", clock: "#b08acd" },
};

// ━━━ PROFILES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PROFILES = [
  { id: "sportif", icon: "🏃", name: "Sportif", desc: "Sport, nutrition protéinée, musique motivante", plugs: ["meteo","sport","petitdej","spotify","citation"], theme: "charbon", radioIdx: 3, sportMode: "app", pdjPref: [0,2,4] },
  { id: "bureau", icon: "💼", name: "Bureau", desc: "Actus, agenda, podcast, café tranquille", plugs: ["meteo","news","agenda","podcast","petitdej"], theme: "minuit", radioIdx: 0, sportMode: "youtube", pdjPref: [1,3,6] },
  { id: "creatif", icon: "🎨", name: "Créatif", desc: "Inspiration, yoga, musique douce, smoothie", plugs: ["citation","yoga","petitdej","spotify","meteo"], theme: "crepuscule", radioIdx: 2, sportMode: "youtube", pdjPref: [2,5,3] },
  { id: "etudiant", icon: "📚", name: "Étudiant", desc: "Actus rapides, sport express, petit budget", plugs: ["meteo","news","sport","petitdej","citation"], theme: "ardoise", radioIdx: 4, sportMode: "app", pdjPref: [0,3,6] },
  { id: "parent", icon: "👨‍👩‍👧", name: "Parent", desc: "Agenda familial, météo, recette enfant, zen", plugs: ["meteo","agenda","petitdej","yoga","radio"], theme: "foret", radioIdx: 0, sportMode: "youtube", pdjPref: [4,3,0] },
  { id: "custom", icon: "⚙️", name: "Personnalisé", desc: "Tout configurer soi-même", plugs: ["meteo","agenda","petitdej"], theme: "minuit", radioIdx: 0, sportMode: "app", pdjPref: [0,1,2] },
];

// ━━━ DATA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ALL_PLUGINS = [
  { id: "meteo", icon: "🌤️", name: "Météo", cat: "info" },
  { id: "news", icon: "📰", name: "Actus", cat: "info" },
  { id: "agenda", icon: "📅", name: "Agenda", cat: "info" },
  { id: "radio", icon: "📻", name: "Radio", cat: "media" },
  { id: "podcast", icon: "🎙️", name: "Podcast", cat: "media" },
  { id: "spotify", icon: "🎧", name: "Spotify", cat: "media" },
  { id: "yoga", icon: "🧘", name: "Yoga", cat: "well" },
  { id: "sport", icon: "💪", name: "Sport", cat: "well" },
  { id: "petitdej", icon: "🥐", name: "Petit-déj", cat: "well" },
  { id: "citation", icon: "💬", name: "Citation", cat: "well" },
];

const RADIOS = [
  { name: "France Inter", url: "https://icecast.radiofrance.fr/franceinter-hifi.aac" },
  { name: "France Info", url: "https://icecast.radiofrance.fr/franceinfo-hifi.aac" },
  { name: "FIP", url: "https://icecast.radiofrance.fr/fip-hifi.aac" },
  { name: "NRJ", url: "https://scdn.nrjaudio.fm/adwz2/fr/30001/mp3_128.mp3" },
  { name: "Chérie FM", url: "https://scdn.nrjaudio.fm/adwz2/fr/30201/mp3_128.mp3" },
  { name: "RTL", url: "https://streamer-03.rtl.fr/rtl-1-44-128" },
];

const PETITDEJ = [
  { id:0, name:"Bowl Protéiné", icon:"🥣", cal:485, prot:28, desc:"Yaourt grec, granola, banane, miel, chia, myrtilles", energy:"Soutenue 4h", tags:["protéines","rapide"] },
  { id:1, name:"Tartines Avocat", icon:"🍞", cal:420, prot:22, desc:"Pain complet, avocat, œuf poché, sésame, tomate", energy:"Boost matinal", tags:["équilibré","salé"] },
  { id:2, name:"Smoothie Vert", icon:"🥤", cal:380, prot:14, desc:"Épinards, banane, lait d'amande, beurre de cacahuète", energy:"Rapide pré-sport", tags:["rapide","sport"] },
  { id:3, name:"Porridge Cannelle", icon:"🥣", cal:410, prot:12, desc:"Flocons d'avoine, lait, pomme, cannelle, noix", energy:"Chaleur 4h", tags:["réconfort","hiver"] },
  { id:4, name:"Crêpes Protéinées", icon:"🥞", cal:450, prot:24, desc:"Farine complète, whey, fruits rouges, sirop d'érable", energy:"Gourmande", tags:["week-end","protéines"] },
  { id:5, name:"Açaí Bowl", icon:"🫐", cal:460, prot:10, desc:"Açaí, banane, lait de coco, granola, kiwi", energy:"Antioxydant", tags:["super-aliment","été"] },
  { id:6, name:"Overnight Oats", icon:"🍫", cal:430, prot:16, desc:"Avoine, yaourt, cacao, chia, banane, pépites choco", energy:"Zéro effort", tags:["préparé veille","rapide"] },
];

const AGENDA = [
  { time:"09:00", title:"Stand-up équipe", col:"#6366f1", prio:"high" },
  { time:"10:30", title:"Appel client Alpha", col:"#e07898", prio:"high" },
  { time:"12:30", title:"Déjeuner Marie", col:"#c9a86c", prio:"low" },
  { time:"14:00", title:"Review Sprint 4", col:"#8baa6b", prio:"high" },
];

const MOODS = [{e:"😊",l:"Content"},{e:"😴",l:"Fatigué"},{e:"💪",l:"Motivé"},{e:"😰",l:"Stressé"},{e:"🤔",l:"Pensif"}];
const MOOD_CIT = {
  "😊":["La joie est la plus belle des conquêtes. — Voltaire"],
  "😴":["Le repos est la sauce des travaux. — Plutarque"],
  "💪":["Le seul voyage impossible est celui qu'on ne commence jamais. — Robbins"],
  "😰":["La patience est amère mais son fruit est doux. — Rousseau"],
  "🤔":["Le doute est le commencement de la sagesse. — Aristote"],
};

const NEWS_CATS = ["Général","Tech","Sport","Économie","Culture","Science"];
const MOCK_NEWS = [
  {t:"Plan vélo : 200 km de pistes d'ici 2027",s:"Flipboard",u:"https://flipboard.com",c:"Général"},
  {t:"Startup IA lève 50M€",s:"Les Échos",u:"https://www.lesechos.fr",c:"Tech"},
  {t:"Festival gratuit samedi",s:"Google News",u:"https://news.google.com",c:"Culture"},
];

// ━━━ HOOKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function useClock(){const[n,sN]=useState(new Date());useEffect(()=>{const id=setInterval(()=>sN(new Date()),1000);return()=>clearInterval(id)},[]);return n}

// ━━━ CSS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CSS=`@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes sl{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}@keyframes pu{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}@keyframes glow{0%,100%{text-shadow:0 0 20px var(--glow)}50%{text-shadow:0 0 40px var(--glow),0 0 80px var(--glow2)}}@keyframes fadeScale{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400;600;700&display=swap');*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}input[type="time"]::-webkit-calendar-picker-indicator{filter:invert(.5)}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:3px}`;

// ━━━ COMPONENTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Toggle({on,onT,T}){return<button onClick={onT} style={{width:36,height:19,borderRadius:10,background:on?T.ac:T.card,border:`1px solid ${on?T.ac:T.cb}`,position:"relative",transition:"all .2s",flexShrink:0,cursor:"pointer",padding:0}}><div style={{width:15,height:15,borderRadius:8,background:on?"#fff":T.mu,position:"absolute",top:1,left:on?19:1,transition:"all .2s"}}/></button>}

function Chip({label,on,onT,T}){return<button onClick={onT} style={{background:on?T.ac+"18":T.card,border:`1px solid ${on?T.ac+"55":T.cb}`,borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:on?700:400,color:on?T.ac:T.mu,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>{label}</button>}

function ClockFace({time,T}){
  const[h,m]=time.split(":");
  return(
    <div style={{textAlign:"center",position:"relative"}}>
      <div style={{"--glow":T.clock+"40","--glow2":T.clock+"15",animation:"glow 4s ease infinite",fontSize:88,fontWeight:100,letterSpacing:-6,lineHeight:1,fontFamily:"'Outfit',sans-serif",color:T.clock,fontVariantNumeric:"tabular-nums"}}>{h}<span style={{opacity:.3,animation:"pu 2s infinite"}}>:</span>{m}</div>
    </div>
  );
}

// ━━━ ONBOARDING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Onboarding({onComplete}){
  const[step,setStep]=useState(0);
  const[name,setName]=useState("");
  const[profile,setProfile]=useState(null);
  const[city,setCity]=useState("Paris");
  const[aWeek,setAWeek]=useState("07:00");
  const[aWE,setAWE]=useState("09:00");
  const[selPDJ,setSelPDJ]=useState([0,1,3]);
  const[theme,setTheme]=useState("minuit");

  const T=THEMES[theme];
  const pg={minHeight:"100vh",background:T.bg,fontFamily:"'Outfit',sans-serif",color:T.tx,maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column"};

  const selectProfile=(p)=>{
    setProfile(p);
    setTheme(p.theme);
    setSelPDJ(p.pdjPref);
  };

  const finish=()=>{
    onComplete({name,profile:profile||PROFILES[5],city,aWeek,aWE,selPDJ,theme});
  };

  const btn=(label,onClick,primary)=>(<button onClick={onClick} style={{width:"100%",padding:"14px",borderRadius:14,border:primary?"none":`1px solid ${T.cb}`,background:primary?T.ac:T.card,color:primary?(T.bg.startsWith("#0")?"#000":T.tx):T.tx,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:8}}>{label}</button>);

  // Step 0: Welcome
  if(step===0) return(
    <div style={pg}><style>{CSS}</style>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"40px 28px",animation:"fadeScale .8s ease"}}>
        <div style={{fontSize:64,marginBottom:16}}>🌅</div>
        <div style={{fontSize:32,fontWeight:200,marginBottom:8}}>Sunrise</div>
        <div style={{fontSize:14,color:T.mu,textAlign:"center",lineHeight:1.6,marginBottom:32,maxWidth:280}}>
          Votre réveil vocal intelligent.<br/>Configurons ensemble votre routine matinale parfaite.
        </div>
        {btn("Commencer →",()=>setStep(1),true)}
      </div>
    </div>
  );

  // Step 1: Name + City
  if(step===1) return(
    <div style={pg}><style>{CSS}</style>
      <div style={{flex:1,padding:"40px 24px",animation:"fu .5s"}}>
        <div style={{fontSize:11,color:T.ac,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:20}}>Étape 1/4</div>
        <div style={{fontSize:22,fontWeight:200,marginBottom:28}}>Comment vous appelez-vous ?</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Prénom" style={{width:"100%",background:T.card,border:`1px solid ${T.cb}`,borderRadius:14,padding:"14px 16px",color:T.tx,fontSize:18,fontFamily:"inherit",marginBottom:20}} autoFocus/>
        <div style={{fontSize:22,fontWeight:200,marginBottom:12}}>Votre ville ?</div>
        <input value={city} onChange={e=>setCity(e.target.value)} placeholder="Paris, Lyon, Marseille…" style={{width:"100%",background:T.card,border:`1px solid ${T.cb}`,borderRadius:14,padding:"14px 16px",color:T.tx,fontSize:16,fontFamily:"inherit",marginBottom:28}}/>
        <div style={{fontSize:22,fontWeight:200,marginBottom:12}}>Heures de réveil</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:28}}>
          {[["Semaine",aWeek,setAWeek],["Week-end",aWE,setAWE]].map(([l,v,s])=>(
            <div key={l} style={{background:T.card,border:`1px solid ${T.cb}`,borderRadius:14,padding:"12px"}}>
              <div style={{fontSize:10,color:T.mu,fontWeight:700,letterSpacing:1,marginBottom:6}}>{l.toUpperCase()}</div>
              <input type="time" value={v} onChange={e=>s(e.target.value)} style={{width:"100%",background:"transparent",border:`1px solid ${T.cb}`,borderRadius:10,padding:8,color:T.tx,fontSize:20,fontWeight:300,fontFamily:"inherit",textAlign:"center"}}/>
            </div>
          ))}
        </div>
        {btn("Suivant →",()=>setStep(2),true)}
      </div>
    </div>
  );

  // Step 2: Profile
  if(step===2) return(
    <div style={pg}><style>{CSS}</style>
      <div style={{flex:1,padding:"40px 24px",animation:"fu .5s",overflow:"auto"}}>
        <div style={{fontSize:11,color:T.ac,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:20}}>Étape 2/4</div>
        <div style={{fontSize:22,fontWeight:200,marginBottom:6}}>Quel type de matin ?</div>
        <div style={{fontSize:13,color:T.mu,marginBottom:20}}>Choisissez un profil — tout reste modifiable après.</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {PROFILES.map((p,i)=>(
            <button key={p.id} onClick={()=>selectProfile(p)} style={{background:profile?.id===p.id?T.ac+"12":T.card,border:`1px solid ${profile?.id===p.id?T.ac+"55":T.cb}`,borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",fontFamily:"inherit",color:T.tx,textAlign:"left",animation:`sl .4s ease ${i*.06}s both`,transition:"all .15s"}}>
              <span style={{fontSize:28,width:36,textAlign:"center"}}>{p.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:600}}>{p.name}</div>
                <div style={{fontSize:12,color:T.mu,marginTop:2}}>{p.desc}</div>
              </div>
              {profile?.id===p.id&&<span style={{color:T.ac,fontSize:18}}>✓</span>}
            </button>
          ))}
        </div>
        <div style={{marginTop:16}}>{btn("Suivant →",()=>setStep(3),!!profile)}</div>
      </div>
    </div>
  );

  // Step 3: Breakfast picker
  if(step===3) return(
    <div style={pg}><style>{CSS}</style>
      <div style={{flex:1,padding:"40px 24px",animation:"fu .5s",overflow:"auto"}}>
        <div style={{fontSize:11,color:T.ac,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:20}}>Étape 3/4</div>
        <div style={{fontSize:22,fontWeight:200,marginBottom:6}}>Vos petits-déjeuners</div>
        <div style={{fontSize:13,color:T.mu,marginBottom:20}}>Sélectionnez ceux que vous aimez — ils tourneront en rotation.</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {PETITDEJ.map((p,i)=>{
            const on=selPDJ.includes(p.id);
            return(
              <button key={p.id} onClick={()=>setSelPDJ(s=>on?s.filter(x=>x!==p.id):[...s,p.id])} style={{background:on?T.ac+"10":T.card,border:`1px solid ${on?T.ac+"44":T.cb}`,borderRadius:14,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",fontFamily:"inherit",color:T.tx,animation:`sl .3s ease ${i*.05}s both`}}>
                <span style={{fontSize:24}}>{p.icon}</span>
                <div style={{flex:1,textAlign:"left"}}>
                  <div style={{fontSize:14,fontWeight:600}}>{p.name}<span style={{fontWeight:300,color:T.mu,marginLeft:8}}>{p.cal} kcal</span></div>
                  <div style={{fontSize:11,color:T.mu,marginTop:2}}>{p.desc}</div>
                </div>
                <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${on?T.ac:T.cb}`,background:on?T.ac:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {on&&<span style={{color:"#fff",fontSize:12,fontWeight:700}}>✓</span>}
                </div>
              </button>
            );
          })}
        </div>
        <div style={{marginTop:16}}>{btn("Suivant →",()=>setStep(4),selPDJ.length>0)}</div>
      </div>
    </div>
  );

  // Step 4: Theme + finish
  if(step===4) return(
    <div style={{...pg,background:THEMES[theme].bg}}><style>{CSS}</style>
      <div style={{flex:1,padding:"40px 24px",animation:"fu .5s"}}>
        <div style={{fontSize:11,color:THEMES[theme].ac,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:20}}>Étape 4/4</div>
        <div style={{fontSize:22,fontWeight:200,marginBottom:6,color:THEMES[theme].tx}}>Ambiance</div>
        <div style={{fontSize:13,color:THEMES[theme].mu,marginBottom:20}}>Choisissez le thème de votre réveil.</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:32}}>
          {Object.entries(THEMES).map(([k,th])=>(
            <button key={k} onClick={()=>setTheme(k)} style={{background:th.bg2,border:theme===k?`2px solid ${th.ac}`:`1px solid ${th.cb}`,borderRadius:14,padding:"16px 4px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6,fontFamily:"inherit"}}>
              <span style={{fontSize:22}}>{th.icon}</span>
              <span style={{fontSize:9,fontWeight:700,color:th.tx,letterSpacing:.5}}>{th.name}</span>
            </button>
          ))}
        </div>
        <div style={{textAlign:"center",marginBottom:32}}>
          <ClockFace time={aWeek} T={THEMES[theme]}/>
          <div style={{fontSize:13,color:THEMES[theme].mu,marginTop:8}}>Aperçu de votre horloge</div>
        </div>
        <div style={{background:THEMES[theme].card,border:`1px solid ${THEMES[theme].cb}`,borderRadius:14,padding:"14px 16px",marginBottom:20,fontSize:13,color:THEMES[theme].mu,lineHeight:1.6}}>
          💡 <strong style={{color:THEMES[theme].tx}}>Astuce iPhone</strong> — Programmez votre réveil iOS à la même heure. Quand il sonne et que vous le coupez, ouvrez Sunrise pour lancer votre briefing. Une future version s'intégrera directement via les Raccourcis iOS.
        </div>
        {btn(`C'est parti${name?", "+name:""} ! 🌅`,finish,true)}
      </div>
    </div>
  );
}

// ━━━ MAIN APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function SunriseApp(){
  const now=useClock();
  const[setup,setSetup]=useState(null);
  const[scr,setScr]=useState("home");
  const[theme,setTheme]=useState("minuit");
  const[city,setCity]=useState("Paris");
  const[userName,setUserName]=useState("");
  const[selVoice,setSelVoice]=useState(null);
  const[voices,setVoices]=useState([]);
  const[aWeek,setAWeek]=useState("07:00");
  const[aWE,setAWE]=useState("09:00");
  const[aOn,setAOn]=useState(false);
  const[plugs,setPlugs]=useState(["meteo","agenda","petitdej"]);
  const[order,setOrder]=useState(["meteo","agenda","petitdej"]);
  const[selRadio,setSelRadio]=useState(RADIOS[0]);
  const[radioMin,setRadioMin]=useState(15);
  const[pdjFavs,setPdjFavs]=useState([0,1,3]);
  const[mood,setMood]=useState("😊");
  const[wDetail,setWDetail]=useState({rain:false,wind:true,sun:true,humidity:false});
  const[briefing,setBriefing]=useState(false);
  const[bStep,setBStep]=useState(-1);
  const[weather,setWeather]=useState(null);
  const[volume,setVolume]=useState(0);
  const[streak,setStreak]=useState(0);
  const[stab,setStab]=useState("general");
  const audioRef=useRef(null);
  const activeRef=useRef(false);
  const volRef=useRef(null);

  // Apply onboarding
  const handleSetup=(cfg)=>{
    setSetup(cfg);
    setUserName(cfg.name);
    setCity(cfg.city);
    setAWeek(cfg.aWeek);
    setAWE(cfg.aWE);
    setTheme(cfg.theme);
    setPlugs(cfg.profile.plugs);
    setOrder(cfg.profile.plugs);
    setSelRadio(RADIOS[cfg.profile.radioIdx]);
    setPdjFavs(cfg.selPDJ);
    setStreak(1);
  };

  if(!setup) return <Onboarding onComplete={handleSetup}/>;

  const T=THEMES[theme];
  const isWE=[0,6].includes(now.getDay());
  const alarm=isWE?aWE:aWeek;
  const hhmm=now.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
  const secs=now.getSeconds().toString().padStart(2,"0");
  const dateStr=now.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
  const di=now.getDay();
  const todayPDJ=pdjFavs.length>0?PETITDEJ[pdjFavs[di%pdjFavs.length]]:PETITDEJ[0];
  const todayCit=(MOOD_CIT[mood]||MOOD_CIT["😊"])[0];
  const smartAgenda=AGENDA.filter(e=>e.prio==="high");

  useEffect(()=>{const l=()=>setVoices((window.speechSynthesis?.getVoices()||[]).filter(v=>v.lang.startsWith("fr")||v.lang.startsWith("en")));l();window.speechSynthesis?.addEventListener("voiceschanged",l);return()=>window.speechSynthesis?.removeEventListener("voiceschanged",l)},[]);

  useEffect(()=>{
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr`).then(r=>r.json()).then(g=>{
      if(!g.results?.[0])throw 0;
      const{latitude:la,longitude:lo}=g.results[0];
      return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&timezone=auto&forecast_days=1`).then(r=>r.json()).then(d=>setWeather(d));
    }).catch(()=>setWeather(null));
  },[city]);

  useEffect(()=>{if(aOn&&hhmm===alarm&&!briefing)startBriefing()},[hhmm,aOn]);
  useEffect(()=>{if(!briefing)return;const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return;const r=new SR();r.lang="fr-FR";r.continuous=true;r.onresult=(e)=>{const t=Array.from(e.results).slice(-1)[0]?.[0]?.transcript?.toLowerCase()||"";if(t.includes("stop")||t.includes("arrête"))stopB()};try{r.start()}catch(e){}return()=>{try{r.stop()}catch(e){}}},[briefing]);

  const wI=(c)=>c<=1?"☀️":c<=3?"⛅":c<=48?"🌫️":c<=67?"🌧️":c<=77?"🌨️":c<=86?"🌦️":"⛈️";
  const wD=(c)=>c<=1?"ciel dégagé":c<=3?"nuageux":c<=48?"brouillard":c<=67?"pluie":c<=77?"neige":c<=86?"averses":"orage";

  const say=(text,vol=1)=>new Promise(res=>{
    if(!window.speechSynthesis){res();return}
    const u=new SpeechSynthesisUtterance(text);u.lang=selVoice?.lang||"fr-FR";
    if(selVoice?.native)u.voice=selVoice.native;u.rate=0.92;u.pitch=1.02;u.volume=Math.min(1,vol);
    u.onend=res;u.onerror=res;window.speechSynthesis.speak(u);
  });

  // Progressive volume briefing
  const startBriefing=async()=>{
    setBriefing(true);setScr("briefing");setBStep(0);activeRef.current=true;setAOn(false);
    const active=order.filter(id=>plugs.includes(id));
    const greet=isWE?"Bon week-end":"Bonne journée";
    // Progressive volume: start at 30%, ramp to 100%
    const totalSteps=active.length+1;
    let vol=0.3;
    const volStep=(1-0.3)/totalSteps;

    await say(`Bonjour${userName?", "+userName:""}. Il est ${alarm.replace(":"," heures ")}. ${greet}.`,vol);
    vol+=volStep; setVolume(Math.round(vol*100));

    for(let i=0;i<active.length;i++){
      if(!activeRef.current)return;setBStep(i);vol=Math.min(1,0.3+volStep*(i+1));setVolume(Math.round(vol*100));
      const p=active[i];
      if(p==="meteo"&&weather){const c=weather.current,d=weather.daily;let t=`Météo à ${city}: ${Math.round(c.temperature_2m)} degrés, ${wD(c.weathercode)}. Max ${Math.round(d.temperature_2m_max[0])}, min ${Math.round(d.temperature_2m_min[0])}.`;if(wDetail.wind)t+=` Vent ${c.windspeed_10m} km/h.`;if(wDetail.sun&&d.sunrise)t+=` Lever ${d.sunrise[0]?.split("T")[1]}.`;await say(t,vol)}
      if(p==="news"){await say("Les titres.",vol);for(const n of MOCK_NEWS.slice(0,2)){if(!activeRef.current)return;await say(n.t,vol)}}
      if(p==="agenda"){if(smartAgenda.length===0)await say("Rien d'urgent.",vol);else{await say(`${smartAgenda.length} rendez-vous importants.`,vol);for(const e of smartAgenda.slice(0,3)){if(!activeRef.current)return;await say(`${e.time}, ${e.title}.`,vol)}}}
      if(p==="yoga")await say("Yoga du matin sur votre écran.",vol);
      if(p==="sport")await say("Votre séance sport est prête.",vol);
      if(p==="petitdej")await say(`${todayPDJ.name}, ${todayPDJ.cal} calories, ${todayPDJ.prot} grammes de protéines. ${todayPDJ.energy}.`,vol);
      if(p==="citation")await say(todayCit,vol);
      if(p==="podcast")await say("Podcast prêt.",vol);
      if(p==="spotify")await say("Ouvrez Spotify.",vol);
      if(p==="radio"){await say(`${selRadio.name}.`,vol);try{audioRef.current=new Audio(selRadio.url);audioRef.current.volume=vol;audioRef.current.play();if(radioMin>0)setTimeout(()=>{audioRef.current?.pause()},radioMin*60000)}catch(e){}}
    }
    if(activeRef.current){setVolume(100);await say("Briefing terminé. Excellente journée.",1)}
  };

  const stopB=()=>{activeRef.current=false;window.speechSynthesis?.cancel();if(audioRef.current){audioRef.current.pause();audioRef.current=null}setBriefing(false);setBStep(-1);setVolume(0)};
  const toggleP=(id)=>{setPlugs(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);setOrder(o=>o.includes(id)?o:[...o,id])};
  const moveP=(id,dir)=>{setOrder(o=>{const i=o.indexOf(id);if(i<0)return o;const j=i+dir;if(j<0||j>=o.length)return o;const n=[...o];[n[i],n[j]]=[n[j],n[i]];return n})};

  const cd={background:T.card,border:`1px solid ${T.cb}`,borderRadius:14,padding:"12px 14px",backdropFilter:"blur(16px)"};
  const tg={display:"inline-block",background:T.ac+"18",color:T.ac,borderRadius:20,padding:"3px 9px",fontSize:10,fontWeight:700,letterSpacing:.6,textTransform:"uppercase"};
  const sec={fontSize:10,fontWeight:700,color:T.mu,letterSpacing:1.2,textTransform:"uppercase",marginBottom:8};
  const pg={minHeight:"100vh",background:T.bg,fontFamily:"'Outfit',sans-serif",color:T.tx,maxWidth:430,margin:"0 auto"};
  const pad={padding:"16px 18px calc(env(safe-area-inset-bottom,16px)+16px)"};

  // ━━━ BRIEFING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if(scr==="briefing"){
    const active=order.filter(id=>plugs.includes(id));
    const cur=active[bStep]||active[0];
    return(
      <div style={pg}><style>{CSS}</style>
        <div style={{...pad,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
          <ClockFace time={hhmm} T={T}/>
          <div style={{textAlign:"center",fontSize:11,color:T.mu,marginTop:4,marginBottom:14,textTransform:"capitalize"}}>{dateStr}</div>

          {/* Volume bar */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <span style={{fontSize:11,color:T.mu}}>🔊</span>
            <div style={{flex:1,height:3,borderRadius:2,background:T.card}}>
              <div style={{height:3,borderRadius:2,background:T.ac,width:volume+"%",transition:"width .5s"}}/>
            </div>
            <span style={{fontSize:10,color:T.mu,minWidth:28,textAlign:"right"}}>{volume}%</span>
          </div>

          <button onClick={stopB} style={{background:"rgba(220,50,50,0.08)",border:"1px solid rgba(220,50,50,0.15)",borderRadius:12,padding:11,color:"#e05555",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:"#e05555",animation:"pu 1s infinite"}}/>STOP
          </button>

          <div style={{display:"flex",gap:2,marginBottom:8}}>{active.map((_,i)=><div key={i} style={{flex:1,height:2,borderRadius:1,background:i<=bStep?T.ac:T.card,transition:"background .3s"}}/>)}</div>
          <div style={{display:"flex",gap:4,overflowX:"auto",marginBottom:12,paddingBottom:2}}>{active.map((pid,i)=>{const pl=ALL_PLUGINS.find(p=>p.id===pid);return<span key={pid} style={{...tg,opacity:i===bStep?1:.3,flexShrink:0}}>{pl?.icon} {pl?.name}</span>})}</div>

          <div style={{flex:1,overflow:"auto",WebkitOverflowScrolling:"touch"}}>
            {cur==="meteo"&&weather&&<div style={{...cd,animation:"fu .5s",textAlign:"center"}}><span style={{fontSize:48}}>{wI(weather.current.weathercode)}</span><div style={{fontSize:38,fontWeight:100,margin:"6px 0",color:T.clock}}>{Math.round(weather.current.temperature_2m)}°C</div><div style={{color:T.mu,fontSize:13}}>{wD(weather.current.weathercode)}</div><div style={{display:"flex",justifyContent:"center",gap:14,marginTop:10,fontSize:12,color:T.mu,flexWrap:"wrap"}}><span>↑{Math.round(weather.daily.temperature_2m_max[0])}°</span><span>↓{Math.round(weather.daily.temperature_2m_min[0])}°</span>{wDetail.wind&&<span>💨{weather.current.windspeed_10m}</span>}</div>{wDetail.sun&&weather.daily.sunrise&&<div style={{marginTop:6,fontSize:11,color:T.mu}}>🌅 {weather.daily.sunrise[0]?.split("T")[1]} — 🌇 {weather.daily.sunset[0]?.split("T")[1]}</div>}</div>}
            {cur==="news"&&<div style={{display:"flex",flexDirection:"column",gap:6}}>{MOCK_NEWS.map((n,i)=><a key={i} href={n.u} target="_blank" rel="noopener noreferrer" style={{...cd,textDecoration:"none",color:T.tx,animation:`sl .3s ease ${i*.06}s both`}}><span style={tg}>{n.c}</span><div style={{fontSize:13,fontWeight:600,marginTop:5,lineHeight:1.3}}>{n.t} ↗</div></a>)}</div>}
            {cur==="agenda"&&<div style={{display:"flex",flexDirection:"column",gap:6}}>{smartAgenda.length===0?<div style={{...cd,textAlign:"center",color:T.mu}}>Rien d'urgent</div>:smartAgenda.map((ev,i)=><div key={i} style={{...cd,borderLeft:`3px solid ${ev.col}`,display:"flex",alignItems:"center",gap:12,animation:`sl .3s ease ${i*.06}s both`}}><span style={{fontSize:13,fontWeight:700,color:T.ac,minWidth:36}}>{ev.time}</span><span style={{fontSize:13,fontWeight:500}}>{ev.title}</span></div>)}</div>}
            {cur==="petitdej"&&<div style={{...cd,animation:"fu .5s"}}><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}><span style={{fontSize:36}}>{todayPDJ.icon}</span><div style={{flex:1}}><div style={{fontSize:17,fontWeight:600}}>{todayPDJ.name}</div><div style={{fontSize:12,color:T.mu,marginTop:2}}>{todayPDJ.desc}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:24,fontWeight:100,color:T.clock}}>{todayPDJ.cal}</div><div style={{fontSize:9,color:T.mu,fontWeight:700}}>KCAL</div></div></div><div style={{display:"flex",gap:10,fontSize:12,color:T.mu}}><span style={{color:"#e07070"}}>P {todayPDJ.prot}g</span><span>⚡ {todayPDJ.energy}</span></div></div>}
            {cur==="citation"&&<div style={{...cd,animation:"fu .5s",textAlign:"center",padding:"20px 16px"}}><span style={{fontSize:24}}>{mood}</span><div style={{fontSize:14,lineHeight:1.6,fontStyle:"italic",fontWeight:300,marginTop:8}}>{todayCit}</div></div>}
            {cur==="radio"&&<div style={{...cd,animation:"fu .5s",textAlign:"center"}}><span style={{fontSize:32}}>📻</span><div style={{fontSize:17,fontWeight:600,marginTop:6}}>{selRadio.name}</div><div style={{...tg,marginTop:6}}>● {radioMin}min</div></div>}
            {["yoga","sport","podcast","spotify"].includes(cur)&&<div style={{...cd,animation:"fu .5s",textAlign:"center"}}><span style={{fontSize:36}}>{ALL_PLUGINS.find(p=>p.id===cur)?.icon}</span><div style={{fontSize:17,fontWeight:600,marginTop:8}}>{ALL_PLUGINS.find(p=>p.id===cur)?.name}</div></div>}
          </div>
          <button onClick={()=>{stopB();setScr("home")}} style={{marginTop:8,background:T.card,border:`1px solid ${T.cb}`,borderRadius:10,padding:9,color:T.mu,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>← Accueil</button>
        </div>
      </div>
    );
  }

  // ━━━ SETTINGS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if(scr==="settings"){
    const STABS=[{id:"general",l:"Général"},{id:"plugins",l:"Plugins"},{id:"petitdej_s",l:"Petit-déj"},{id:"media_s",l:"Médias"},{id:"look",l:"Apparence"}];
    return(
      <div style={pg}><style>{CSS}</style>
        <div style={{...pad,paddingBottom:40}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <button onClick={()=>setScr("home")} style={{background:"none",border:"none",color:T.ac,fontSize:13,cursor:"pointer",fontFamily:"inherit",padding:0}}>← Retour</button>
            <span style={{fontSize:17,fontWeight:600}}>Réglages</span>
          </div>
          <div style={{display:"flex",gap:3,overflowX:"auto",marginBottom:16,paddingBottom:2}}>
            {STABS.map(t=><button key={t.id} onClick={()=>setStab(t.id)} style={{background:stab===t.id?T.ac+"18":T.card,border:`1px solid ${stab===t.id?T.ac+"44":T.cb}`,borderRadius:10,padding:"6px 12px",fontSize:11,fontWeight:stab===t.id?700:400,color:stab===t.id?T.ac:T.mu,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{t.l}</button>)}
          </div>

          {stab==="general"&&(<>
            <div style={{marginBottom:18}}><div style={sec}>⏰ Réveil</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{[["Semaine",aWeek,setAWeek],["Week-end",aWE,setAWE]].map(([l,v,s])=><div key={l} style={cd}><div style={{fontSize:9,color:T.mu,fontWeight:700,letterSpacing:1,marginBottom:4}}>{l.toUpperCase()}</div><input type="time" value={v} onChange={e=>s(e.target.value)} style={{width:"100%",background:"transparent",border:`1px solid ${T.cb}`,borderRadius:8,padding:6,color:T.tx,fontSize:18,fontWeight:300,fontFamily:"inherit",textAlign:"center"}}/></div>)}</div></div>
            <div style={{marginBottom:18}}><div style={sec}>📍 Ville</div><input value={city} onChange={e=>setCity(e.target.value)} style={{width:"100%",background:T.card,border:`1px solid ${T.cb}`,borderRadius:12,padding:"10px 14px",color:T.tx,fontSize:15,fontFamily:"inherit"}}/></div>
            <div style={{marginBottom:18}}>
              <div style={sec}>🎙️ Voix</div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {voices.length>0?voices.slice(0,6).map((v,i)=><button key={i} onClick={()=>{setSelVoice({lang:v.lang,native:v});const u=new SpeechSynthesisUtterance("Bonjour.");u.voice=v;u.lang=v.lang;window.speechSynthesis.speak(u)}} style={{...cd,cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontFamily:"inherit",color:T.tx,padding:"9px 12px",...(selVoice?.native?.name===v.name?{border:`1px solid ${T.ac}`,background:T.gw}:{})}}><span style={{fontSize:13,fontWeight:600,flex:1,textAlign:"left"}}>{v.name}</span><span style={{fontSize:10,color:T.mu}}>{v.lang}</span></button>):<div style={{color:T.mu,fontSize:12}}>Voix par défaut</div>}
              </div>
            </div>
            <div style={{marginBottom:18}}>
              <div style={sec}>💬 Humeur (citations)</div>
              <div style={{display:"flex",gap:5}}>{MOODS.map(m=><button key={m.e} onClick={()=>setMood(m.e)} style={{...cd,flex:1,cursor:"pointer",textAlign:"center",fontFamily:"inherit",color:T.tx,padding:"8px 2px",...(mood===m.e?{border:`1px solid ${T.ac}`,background:T.gw}:{})}}><div style={{fontSize:20}}>{m.e}</div><div style={{fontSize:8,color:T.mu,marginTop:2}}>{m.l}</div></button>)}</div>
            </div>
            <div>
              <div style={sec}>🌤️ Détails météo</div>
              {[["wind","💨 Vent"],["rain","🌧️ Pluie mm"],["sun","🌅 Soleil"],["humidity","💧 Humidité"]].map(([k,l])=><div key={k} style={{...cd,display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13}}>{l}</span><Toggle on={wDetail[k]} onT={()=>setWDetail(d=>({...d,[k]:!d[k]}))} T={T}/></div>)}
            </div>
          </>)}

          {stab==="plugins"&&(()=>{
            const cats={info:"📊 Info",media:"🎵 Médias",well:"🌿 Bien-être"};
            const ao=order.filter(id=>plugs.includes(id));
            return(<>
              {ao.length>0&&<div style={{marginBottom:18}}><div style={sec}>Ordre de la routine</div>{ao.map((pid,idx)=>{const pl=ALL_PLUGINS.find(p=>p.id===pid);return<div key={pid} style={{...cd,display:"flex",alignItems:"center",gap:8,marginBottom:4}}><span style={{fontSize:9,fontWeight:700,color:T.mu,minWidth:14,textAlign:"right"}}>{idx+1}</span><span style={{fontSize:16}}>{pl?.icon}</span><span style={{flex:1,fontSize:13,fontWeight:600}}>{pl?.name}</span><button onClick={()=>moveP(pid,-1)} style={{background:"none",border:"none",color:T.mu,fontSize:12,cursor:"pointer",padding:2,fontFamily:"inherit"}}>▲</button><button onClick={()=>moveP(pid,1)} style={{background:"none",border:"none",color:T.mu,fontSize:12,cursor:"pointer",padding:2,fontFamily:"inherit"}}>▼</button><button onClick={()=>toggleP(pid)} style={{background:"none",border:"none",color:"#c05050",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>✕</button></div>})}</div>}
              {Object.entries(cats).map(([cat,label])=><div key={cat} style={{marginBottom:14}}><div style={sec}>{label}</div>{ALL_PLUGINS.filter(p=>p.cat===cat).map(pl=>{const on=plugs.includes(pl.id);return<div key={pl.id} style={{...cd,display:"flex",alignItems:"center",gap:10,marginBottom:4,...(on?{border:`1px solid ${T.ac}44`,background:T.gw}:{})}}><span style={{fontSize:18}}>{pl.icon}</span><span style={{flex:1,fontSize:13,fontWeight:600}}>{pl.name}</span><Toggle on={on} onT={()=>toggleP(pl.id)} T={T}/></div>})}</div>)}
            </>)
          })()}

          {stab==="petitdej_s"&&(
            <div>
              <div style={sec}>Sélectionnez vos recettes préférées</div>
              <div style={{fontSize:12,color:T.mu,marginBottom:14}}>Elles tourneront en rotation quotidienne. Modifiez quand vous voulez.</div>
              {PETITDEJ.map((p,i)=>{const on=pdjFavs.includes(p.id);return(
                <button key={p.id} onClick={()=>setPdjFavs(s=>on?s.filter(x=>x!==p.id):[...s,p.id])} style={{...cd,width:"100%",display:"flex",alignItems:"center",gap:12,marginBottom:5,cursor:"pointer",fontFamily:"inherit",color:T.tx,...(on?{border:`1px solid ${T.ac}44`,background:T.gw}:{})}}>
                  <span style={{fontSize:24}}>{p.icon}</span>
                  <div style={{flex:1,textAlign:"left"}}>
                    <div style={{fontSize:14,fontWeight:600}}>{p.name} <span style={{fontWeight:300,color:T.mu}}>{p.cal} kcal · P{p.prot}g</span></div>
                    <div style={{fontSize:11,color:T.mu,marginTop:1}}>{p.desc}</div>
                    <div style={{display:"flex",gap:4,marginTop:4}}>{p.tags.map(t=><span key={t} style={{...tg,fontSize:9,padding:"2px 7px"}}>{t}</span>)}</div>
                  </div>
                  <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${on?T.ac:T.cb}`,background:on?T.ac:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{on&&<span style={{color:"#fff",fontSize:11}}>✓</span>}</div>
                </button>
              )})}
            </div>
          )}

          {stab==="media_s"&&(<>
            <div style={{marginBottom:18}}>
              <div style={sec}>📻 Radio</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4}}>{RADIOS.map(r=><button key={r.name} onClick={()=>setSelRadio(r)} style={{...cd,cursor:"pointer",textAlign:"center",fontSize:11,fontWeight:600,fontFamily:"inherit",color:T.tx,padding:"10px 4px",...(selRadio.name===r.name?{border:`1px solid ${T.ac}`,background:T.gw}:{})}}>{r.name}</button>)}</div>
              <div style={{marginTop:8,fontSize:11,color:T.mu,marginBottom:4}}>Durée d'écoute</div>
              <div style={{display:"flex",gap:4}}>{[10,15,20,30,60].map(m=><button key={m} onClick={()=>setRadioMin(m)} style={{...cd,flex:1,cursor:"pointer",textAlign:"center",fontSize:12,fontWeight:700,fontFamily:"inherit",color:T.tx,padding:"7px 3px",...(radioMin===m?{border:`1px solid ${T.ac}`,background:T.gw}:{})}}>{m}m</button>)}</div>
            </div>
          </>)}

          {stab==="look"&&(
            <div>
              <div style={sec}>🎨 Thème</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:20}}>
                {Object.entries(THEMES).map(([k,th])=><button key={k} onClick={()=>setTheme(k)} style={{background:th.bg2,border:theme===k?`2px solid ${th.ac}`:`1px solid ${th.cb}`,borderRadius:12,padding:"14px 3px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5,fontFamily:"inherit"}}><span style={{fontSize:20}}>{th.icon}</span><span style={{fontSize:8,fontWeight:700,color:th.tx}}>{th.name}</span></button>)}
              </div>
              <div style={{textAlign:"center",marginBottom:16}}><ClockFace time={alarm} T={T}/><div style={{fontSize:11,color:T.mu,marginTop:6}}>Aperçu</div></div>
              <div style={{...cd,fontSize:12,color:T.mu,lineHeight:1.6}}>
                💡 <strong style={{color:T.tx}}>Intégration iPhone</strong> — Programmez votre réveil iOS à la même heure ({alarm}). Quand vous le coupez, ouvrez Sunrise. Prochainement : automatisation via Raccourcis iOS.
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ━━━ HOME ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const activeList=order.filter(id=>plugs.includes(id));
  return(
    <div style={pg}><style>{CSS}</style>
      <div style={{...pad,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:0}}>
          <div style={{fontSize:14,fontWeight:600,letterSpacing:-.3,color:T.mu}}><span style={{color:T.ac}}>Sun</span>rise</div>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            {streak>0&&<span style={{fontSize:11,color:T.ac}}>🔥{streak}j</span>}
            <button onClick={()=>setScr("settings")} style={{background:T.card,border:`1px solid ${T.cb}`,borderRadius:8,padding:"4px 9px",fontSize:12,cursor:"pointer",fontFamily:"inherit",color:T.mu}}>⚙️</button>
          </div>
        </div>

        {/* Clock */}
        <div style={{margin:"24px 0 4px",animation:"fu .8s"}}>
          <ClockFace time={hhmm} T={T}/>
          <div style={{textAlign:"center",fontSize:24,fontWeight:100,color:T.mu+"55",marginTop:-4,fontVariantNumeric:"tabular-nums"}}>{secs}</div>
        </div>

        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:13,color:T.mu,textTransform:"capitalize"}}>{dateStr}</div>
          <div style={{display:"flex",justifyContent:"center",gap:5,marginTop:6}}>
            <span style={tg}>📍 {city}</span>
            <span style={tg}>{isWE?"🛋️ W-E":"💼 Semaine"}</span>
          </div>
          {userName&&<div style={{fontSize:12,color:T.mu,marginTop:6,fontWeight:300}}>Bonjour, {userName}</div>}
        </div>

        {/* Weather mini */}
        {weather&&<div style={{...cd,display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginBottom:10,animation:"fu .6s ease .1s both"}}><span style={{fontSize:26}}>{wI(weather.current.weathercode)}</span><div><div style={{fontSize:22,fontWeight:100,color:T.clock}}>{Math.round(weather.current.temperature_2m)}°</div><div style={{fontSize:11,color:T.mu}}>{wD(weather.current.weathercode)}</div></div><div style={{fontSize:10,color:T.mu,marginLeft:6}}><div>↑{Math.round(weather.daily.temperature_2m_max[0])}° ↓{Math.round(weather.daily.temperature_2m_min[0])}°</div></div></div>}

        {/* Alarm */}
        <div style={{...cd,marginBottom:10,animation:"fu .6s ease .2s both"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div><div style={{fontSize:9,color:T.mu,fontWeight:700,letterSpacing:1}}>RÉVEIL {isWE?"W-E":"SEMAINE"}</div><div style={{fontSize:26,fontWeight:100,color:T.clock,marginTop:2}}>{alarm}</div></div>
            <button onClick={()=>setAOn(!aOn)} style={{width:46,height:24,borderRadius:12,background:aOn?T.ac:T.card,border:`1px solid ${aOn?T.ac:T.cb}`,cursor:"pointer",position:"relative",transition:"all .25s",padding:0}}>
              <div style={{width:18,height:18,borderRadius:9,background:aOn?"#fff":T.mu,position:"absolute",top:2,left:aOn?26:2,transition:"all .25s"}}/>
            </button>
          </div>
          {aOn&&<div style={{fontSize:11,color:"#5a9a5a",marginTop:4}}>✓ Programmé · volume progressif</div>}
        </div>

        <button onClick={startBriefing} style={{width:"100%",background:T.ac,border:"none",borderRadius:14,padding:13,color:T.bg,fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"inherit",marginBottom:14,animation:"fu .6s ease .25s both"}}>
          ▶ Lancer le briefing
        </button>

        {/* Routine pills */}
        <div style={{marginBottom:10,animation:"fu .6s ease .3s both"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={sec}>Routine · {activeList.length} plugins</span><button onClick={()=>{setScr("settings");setStab("plugins")}} style={{background:"none",border:"none",color:T.ac,fontSize:10,cursor:"pointer",fontFamily:"inherit",padding:0}}>Modifier ↗</button></div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{activeList.map((pid,i)=>{const pl=ALL_PLUGINS.find(p=>p.id===pid);return<div key={pid} style={{background:T.card,border:`1px solid ${T.cb}`,borderRadius:8,padding:"4px 9px",display:"flex",alignItems:"center",gap:4,fontSize:11}}><span style={{fontSize:8,color:T.mu,fontWeight:700}}>{i+1}</span><span>{pl?.icon}</span><span style={{fontWeight:600}}>{pl?.name}</span></div>})}</div>
        </div>

        {/* Petit-dej preview */}
        {plugs.includes("petitdej")&&<div style={{...cd,display:"flex",alignItems:"center",gap:10,marginBottom:10,animation:"fu .6s ease .33s both"}}><span style={{fontSize:24}}>{todayPDJ.icon}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{todayPDJ.name}</div><div style={{fontSize:10,color:T.mu}}>P{todayPDJ.prot}g · {todayPDJ.energy}</div></div><div style={{fontSize:18,fontWeight:100,color:T.clock}}>{todayPDJ.cal}<span style={{fontSize:9,color:T.mu}}> kcal</span></div></div>}

        {/* Next event */}
        {smartAgenda.length>0&&<div style={{...cd,borderLeft:`3px solid ${smartAgenda[0].col}`,display:"flex",alignItems:"center",gap:10,marginBottom:10,animation:"fu .6s ease .36s both"}}><span style={{fontSize:12,fontWeight:700,color:T.ac}}>{smartAgenda[0].time}</span><span style={{fontSize:12,fontWeight:500}}>{smartAgenda[0].title}</span></div>}

        <div style={{marginTop:"auto",textAlign:"center",fontSize:9,color:T.mu,opacity:.3,paddingTop:8}}>Sunrise · Réveil vocal intelligent</div>
      </div>
    </div>
  );
}
