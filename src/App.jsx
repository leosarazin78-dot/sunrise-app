import { useState, useEffect, useRef } from "react";

/*
  SUNRISE v7 — Premium dark design inspired by Lovon
  - Single config state fixes onboarding → home transition
  - Calorie estimator for custom recipes
  - Professional, minimal aesthetic
*/

// ━━━ CALORIE DATABASE (per 100g or unit) ━━━━━━━━━━━━━
const CAL_DB = {
  "yaourt":59,"yaourt grec":97,"lait":42,"lait amande":17,"lait avoine":46,"lait coco":230,
  "banane":89,"pomme":52,"fraise":32,"myrtille":57,"kiwi":61,"mangue":60,"orange":47,"pêche":39,
  "avocat":160,"tomate":18,"épinard":23,"concombre":16,"carotte":41,
  "oeuf":155,"œuf":155,"beurre":717,"beurre cacahuète":588,"confiture":250,"miel":304,"nutella":530,
  "pain":265,"pain complet":247,"pain de mie":267,"baguette":270,"croissant":406,"brioche":357,
  "flocon avoine":389,"granola":471,"muesli":340,"céréales":379,"chia":486,
  "fromage":350,"comté":418,"emmental":380,"chèvre":364,"cream cheese":342,
  "jambon":145,"saumon fumé":117,"thon":130,
  "chocolat":546,"cacao":228,"sirop érable":260,"sucre":387,
  "amande":579,"noix":654,"noisette":628,"noix coco":354,
  "café":2,"thé":1,"jus orange":45,"smoothie":50,
  "crêpe":190,"pancake":227,"gaufre":312,"tartine":180,
  "protéine":120,"whey":400,"compote":68,"fromage blanc":73,
};

function estimateCal(recipeName) {
  const lower = recipeName.toLowerCase();
  let total = 0; let matches = 0;
  for (const [food, cal] of Object.entries(CAL_DB)) {
    if (lower.includes(food)) { total += cal * 0.8; matches++; }
  }
  if (matches === 0) return { cal: 350, prot: 12, note: "Estimation moyenne" };
  const cal = Math.round(Math.min(700, Math.max(150, total)));
  const prot = Math.round(cal * 0.12 / 4);
  return { cal, prot, note: `Estimé (${matches} ingrédient${matches>1?"s":""} détecté${matches>1?"s":""})` };
}

// ━━━ DESIGN TOKENS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const D = {
  bg: "#09090b",
  bg2: "#0f0f12",
  surface: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.06)",
  borderHi: "rgba(255,255,255,0.1)",
  text: "#e4e4e7",
  text2: "rgba(228,228,231,0.55)",
  text3: "rgba(228,228,231,0.3)",
  accent: "#d4a853",
  accentSoft: "rgba(212,168,83,0.12)",
  accentBorder: "rgba(212,168,83,0.25)",
  green: "#4ade80",
  red: "#ef4444",
  radius: 12,
  font: "'Outfit','SF Pro Display',-apple-system,BlinkMacSystemFont,sans-serif",
};

const CSS = `
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
@keyframes breathe{0%,100%{opacity:.6}50%{opacity:1}}
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400;500;600;700&display=swap');
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0}
body{background:${D.bg};font-family:${D.font}}
input[type="time"]::-webkit-calendar-picker-indicator{filter:invert(.4)}
::-webkit-scrollbar{width:0}
::placeholder{color:${D.text3}}
`;

// ━━━ DATA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PROFILES = [
  { id:"sportif",icon:"●",label:"Sportif",sub:"Sport · Nutrition · Énergie",plugs:["meteo","sport","petitdej","spotify","citation"],radio:3 },
  { id:"bureau",icon:"●",label:"Bureau",sub:"Actus · Agenda · Podcast",plugs:["meteo","news","agenda","podcast","petitdej"],radio:0 },
  { id:"creatif",icon:"●",label:"Créatif",sub:"Inspiration · Yoga · Musique",plugs:["citation","yoga","petitdej","spotify","meteo"],radio:2 },
  { id:"etudiant",icon:"●",label:"Étudiant",sub:"Actus · Sport express · Budget",plugs:["meteo","news","sport","petitdej","citation"],radio:4 },
  { id:"parent",icon:"●",label:"Parent",sub:"Agenda · Météo · Zen",plugs:["meteo","agenda","petitdej","yoga","radio"],radio:0 },
  { id:"custom",icon:"○",label:"Sur mesure",sub:"Configurez tout",plugs:["meteo","agenda","petitdej"],radio:0 },
];

const PLUGS = [
  {id:"meteo",icon:"◐",label:"Météo",cat:"info"},{id:"news",icon:"▤",label:"Actus",cat:"info"},{id:"agenda",icon:"◫",label:"Agenda",cat:"info"},
  {id:"radio",icon:"◉",label:"Radio",cat:"media"},{id:"podcast",icon:"◎",label:"Podcast",cat:"media"},{id:"spotify",icon:"◈",label:"Spotify",cat:"media"},
  {id:"yoga",icon:"◯",label:"Yoga",cat:"well"},{id:"sport",icon:"△",label:"Sport",cat:"well"},{id:"petitdej",icon:"◇",label:"Petit-déj",cat:"well"},{id:"citation",icon:"❝",label:"Citation",cat:"well"},
];

const RADIOS=[{n:"France Inter",u:"https://icecast.radiofrance.fr/franceinter-hifi.aac"},{n:"France Info",u:"https://icecast.radiofrance.fr/franceinfo-hifi.aac"},{n:"FIP",u:"https://icecast.radiofrance.fr/fip-hifi.aac"},{n:"NRJ",u:"https://scdn.nrjaudio.fm/adwz2/fr/30001/mp3_128.mp3"},{n:"Chérie FM",u:"https://scdn.nrjaudio.fm/adwz2/fr/30201/mp3_128.mp3"},{n:"RTL",u:"https://streamer-03.rtl.fr/rtl-1-44-128"}];

const DEF_PDJ = [
  {id:0,n:"Bowl Protéiné",cal:485,prot:28,d:"Yaourt grec · granola · banane · miel · chia",e:"Soutenue 4h"},
  {id:1,n:"Tartines Avocat-Œuf",cal:420,prot:22,d:"Pain complet · avocat · œuf poché · sésame",e:"Boost matinal"},
  {id:2,n:"Smoothie Vert",cal:380,prot:14,d:"Épinards · banane · lait d'amande · cacahuète",e:"Pré-sport"},
  {id:3,n:"Porridge Cannelle",cal:410,prot:12,d:"Avoine · lait · pomme · cannelle · noix",e:"Chaleur 4h"},
  {id:4,n:"Crêpes Protéinées",cal:450,prot:24,d:"Farine complète · whey · fruits rouges",e:"Gourmande"},
  {id:5,n:"Açaí Bowl",cal:460,prot:10,d:"Açaí · banane · coco · granola · kiwi",e:"Antioxydant"},
  {id:6,n:"Overnight Oats",cal:430,prot:16,d:"Avoine · yaourt · cacao · chia · choco",e:"Zéro effort"},
];

const AGENDA=[{t:"09:00",n:"Stand-up équipe",p:"high"},{t:"10:30",n:"Appel client Alpha",p:"high"},{t:"12:30",n:"Déjeuner Marie",p:"low"},{t:"14:00",n:"Review Sprint 4",p:"high"}];
const NEWS=[{t:"Plan vélo : 200 km de pistes d'ici 2027",s:"Flipboard",u:"https://flipboard.com"},{t:"Startup IA lève 50M€",s:"Les Échos",u:"https://lesechos.fr"},{t:"Festival gratuit samedi",s:"Google News",u:"https://news.google.com"}];
const CITS={"😊":"La joie est la plus belle des conquêtes. — Voltaire","😴":"Le repos est la sauce des travaux. — Plutarque","💪":"Le seul voyage impossible est celui qu'on ne commence jamais. — Robbins","😰":"La patience est amère mais son fruit est doux. — Rousseau","🤔":"Le doute est le commencement de la sagesse. — Aristote"};
const MOODS=[{e:"😊",l:"Content"},{e:"😴",l:"Fatigué"},{e:"💪",l:"Motivé"},{e:"😰",l:"Stressé"},{e:"🤔",l:"Pensif"}];

// ━━━ PRIMITIVES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const card = { background:D.surface, border:`1px solid ${D.border}`, borderRadius:D.radius, padding:"14px 16px" };
const cardHi = (on) => on ? { ...card, border:`1px solid ${D.accentBorder}`, background:D.accentSoft } : card;
const label = { fontSize:10, fontWeight:600, color:D.text3, letterSpacing:1.5, textTransform:"uppercase", marginBottom:10 };
const page = { minHeight:"100vh", background:D.bg, fontFamily:D.font, color:D.text, maxWidth:430, margin:"0 auto" };
const pad = { padding:"20px 20px calc(env(safe-area-inset-bottom,20px)+20px)" };

function Btn({children,onClick,primary,disabled}){
  return <button onClick={onClick} disabled={disabled} style={{width:"100%",padding:"14px",borderRadius:D.radius,border:primary?"none":`1px solid ${D.border}`,background:primary?D.accent:D.surface,color:primary?D.bg:D.text,fontSize:15,fontWeight:600,cursor:disabled?"default":"pointer",fontFamily:"inherit",opacity:disabled?.4:1,letterSpacing:.2,transition:"opacity .2s"}}>{children}</button>;
}

function Switch({on,onToggle}){
  return <button onClick={onToggle} style={{width:40,height:22,borderRadius:11,background:on?D.accent:D.surface,border:`1px solid ${on?D.accent:D.border}`,position:"relative",transition:"all .2s",cursor:"pointer",padding:0,flexShrink:0}}>
    <div style={{width:16,height:16,borderRadius:8,background:on?"#000":D.text3,position:"absolute",top:2,left:on?22:2,transition:"all .2s"}}/>
  </button>;
}

function useClock(){const[n,s]=useState(new Date());useEffect(()=>{const id=setInterval(()=>s(new Date()),1000);return()=>clearInterval(id)},[]);return n}

// ━━━ APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function App(){
  // Single config object — fixes onboarding bug
  const[cfg,setCfg]=useState(null);
  const[scr,setScr]=useState("onboard");
  const[obStep,setObStep]=useState(0);

  // Onboarding temp state
  const[obName,setObName]=useState("");
  const[obCity,setObCity]=useState("Paris");
  const[obAw,setObAw]=useState("07:00");
  const[obAwe,setObAwe]=useState("09:00");
  const[obProf,setObProf]=useState(null);
  const[obPdj,setObPdj]=useState([0,1,3]);
  const[obCustomPdj,setObCustomPdj]=useState([]);
  const[obNewPdj,setObNewPdj]=useState("");

  // App state (post-onboarding)
  const now=useClock();
  const[plugs,setPlugs]=useState([]);
  const[order,setOrder]=useState([]);
  const[radio,setRadio]=useState(RADIOS[0]);
  const[rMin,setRMin]=useState(15);
  const[mood,setMood]=useState("💪");
  const[wDet,setWDet]=useState({wind:true,sun:true,rain:false,hum:false});
  const[aOn,setAOn]=useState(false);
  const[brf,setBrf]=useState(false);
  const[bSt,setBSt]=useState(-1);
  const[vol,setVol]=useState(0);
  const[wx,setWx]=useState(null);
  const[voice,setVoice]=useState(null);
  const[voices,setVoices]=useState([]);
  const[stab,setStab]=useState("routine");
  const audioRef=useRef(null);
  const actRef=useRef(false);

  // Finalize onboarding
  const finishOnboard=()=>{
    const prof=obProf||PROFILES[5];
    const config={name:obName,city:obCity,aw:obAw,awe:obAwe,pdj:obPdj,customPdj:obCustomPdj};
    setCfg(config);
    setPlugs(prof.plugs);
    setOrder(prof.plugs);
    setRadio(RADIOS[prof.radio]);
    setScr("home");
  };

  // Custom PDJ add with calorie estimate
  const addCustomPdj=()=>{
    if(!obNewPdj.trim())return;
    const est=estimateCal(obNewPdj);
    const np={id:100+obCustomPdj.length,n:obNewPdj.trim(),cal:est.cal,prot:est.prot,d:est.note,e:"—",custom:true};
    setObCustomPdj(c=>[...c,np]);
    setObPdj(p=>[...p,np.id]);
    setObNewPdj("");
  };

  // Post-onboard custom PDJ
  const addCustomPdjSettings=()=>{
    if(!obNewPdj.trim())return;
    const est=estimateCal(obNewPdj);
    const np={id:100+(cfg?.customPdj||[]).length+obCustomPdj.length,n:obNewPdj.trim(),cal:est.cal,prot:est.prot,d:est.note,e:"—",custom:true};
    setCfg(c=>({...c,customPdj:[...(c.customPdj||[]),np],pdj:[...(c.pdj||[]),np.id]}));
    setObNewPdj("");
  };

  const allPdj=[...DEF_PDJ,...(cfg?.customPdj||obCustomPdj)];

  // Weather
  const city=cfg?.city||obCity;
  useEffect(()=>{
    if(!city)return;
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr`).then(r=>r.json()).then(g=>{
      if(!g.results?.[0])throw 0;const{latitude:la,longitude:lo}=g.results[0];
      return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&timezone=auto&forecast_days=1`).then(r=>r.json()).then(d=>setWx(d));
    }).catch(()=>setWx(null));
  },[city]);

  useEffect(()=>{const l=()=>setVoices((window.speechSynthesis?.getVoices()||[]).filter(v=>v.lang.startsWith("fr")||v.lang.startsWith("en")));l();window.speechSynthesis?.addEventListener("voiceschanged",l);return()=>window.speechSynthesis?.removeEventListener("voiceschanged",l)},[]);

  const isWE=cfg?[0,6].includes(now.getDay()):false;
  const al=cfg?(isWE?cfg.awe:cfg.aw):"07:00";
  const hhmm=now.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
  const secs=now.getSeconds().toString().padStart(2,"0");
  const dStr=now.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
  const favPdj=(cfg?.pdj||[]).map(id=>allPdj.find(p=>p.id===id)).filter(Boolean);
  const todayPDJ=favPdj[now.getDay()%Math.max(1,favPdj.length)]||DEF_PDJ[0];
  const smartAg=AGENDA.filter(e=>e.p==="high");

  const wI=c=>c<=1?"☀️":c<=3?"⛅":c<=48?"🌫️":c<=67?"🌧️":c<=77?"🌨️":c<=86?"🌦️":"⛈️";
  const wD=c=>c<=1?"Dégagé":c<=3?"Nuageux":c<=48?"Brouillard":c<=67?"Pluie":c<=77?"Neige":c<=86?"Averses":"Orage";

  const say=(t,v=1)=>new Promise(r=>{if(!window.speechSynthesis){r();return}const u=new SpeechSynthesisUtterance(t);u.lang=voice?.lang||"fr-FR";if(voice?.native)u.voice=voice.native;u.rate=0.92;u.volume=Math.min(1,v);u.onend=r;u.onerror=r;window.speechSynthesis.speak(u)});

  // Auto alarm check
  useEffect(()=>{if(aOn&&cfg&&hhmm===al&&!brf)startB()},[hhmm,aOn,cfg]);
  useEffect(()=>{if(!brf)return;const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return;const r=new SR();r.lang="fr-FR";r.continuous=true;r.onresult=e=>{const t=Array.from(e.results).slice(-1)[0]?.[0]?.transcript?.toLowerCase()||"";if(t.includes("stop")||t.includes("arrête"))stopB()};try{r.start()}catch(e){}return()=>{try{r.stop()}catch(e){}}},[brf]);

  const startB=async()=>{
    setBrf(true);setScr("briefing");setBSt(0);actRef.current=true;setAOn(false);
    const act=order.filter(id=>plugs.includes(id));
    let v=0.2;const vs=(1-0.2)/(act.length+1);
    await say(`Bonjour${cfg?.name?", "+cfg.name:""}. Il est ${al.replace(":"," heures ")}. ${isWE?"Bon week-end.":"Bonne journée."}`,v);
    v+=vs;setVol(Math.round(v*100));

    for(let i=0;i<act.length;i++){
      if(!actRef.current)return;setBSt(i);v=Math.min(1,0.2+vs*(i+1));setVol(Math.round(v*100));
      const p=act[i];
      if(p==="meteo"&&wx){const c=wx.current,d=wx.daily;let t=`${city}: ${Math.round(c.temperature_2m)} degrés, ${wD(c.weathercode).toLowerCase()}. Max ${Math.round(d.temperature_2m_max[0])}, min ${Math.round(d.temperature_2m_min[0])}.`;if(wDet.wind)t+=` Vent ${c.windspeed_10m} km/h.`;if(wDet.sun&&d.sunrise)t+=` Lever ${d.sunrise[0]?.split("T")[1]}.`;await say(t,v)}
      if(p==="news"){for(const n of NEWS.slice(0,2)){if(!actRef.current)return;await say(n.t,v)}}
      if(p==="agenda"){if(smartAg.length>0)for(const e of smartAg.slice(0,3)){if(!actRef.current)return;await say(`${e.t}, ${e.n}.`,v)}}
      if(p==="petitdej")await say(`${todayPDJ.n}. ${todayPDJ.cal} calories.`,v);
      if(p==="citation")await say(CITS[mood]||CITS["💪"],v);
      if(p==="yoga")await say("Séance yoga sur l'écran.",v);
      if(p==="sport")await say("Séance sport prête.",v);
      if(p==="podcast")await say("Podcast prêt.",v);
      if(p==="spotify")await say("Spotify.",v);
      if(p==="radio"){await say(`${radio.n}.`,v);try{audioRef.current=new Audio(radio.u);audioRef.current.volume=v;audioRef.current.play();if(rMin>0)setTimeout(()=>audioRef.current?.pause(),rMin*60000)}catch(e){}}
      await new Promise(r=>setTimeout(r,500));
    }
    if(actRef.current){setVol(100);await say("Briefing terminé.",1)}
  };
  const stopB=()=>{actRef.current=false;window.speechSynthesis?.cancel();if(audioRef.current){audioRef.current.pause();audioRef.current=null}setBrf(false);setBSt(-1);setVol(0)};
  const togP=id=>{setPlugs(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);setOrder(o=>o.includes(id)?o:[...o,id])};
  const movP=(id,dir)=>{setOrder(o=>{const i=o.indexOf(id);if(i<0)return o;const j=i+dir;if(j<0||j>=o.length)return o;const n=[...o];[n[i],n[j]]=[n[j],n[i]];return n})};

  // ━━━ ONBOARDING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if(scr==="onboard"){
    const obAllPdj=[...DEF_PDJ,...obCustomPdj];
    const dots=<div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:32}}>{[0,1,2,3].map(i=><div key={i} style={{width:i===obStep?20:6,height:6,borderRadius:3,background:i<=obStep?D.accent:D.border,transition:"all .3s"}}/>)}</div>;

    // Step 0: Welcome
    if(obStep===0) return(
      <div style={page}><style>{CSS}</style>
        <div style={{...pad,flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",minHeight:"100vh",animation:"fadeIn .8s"}}>
          <div style={{width:64,height:64,borderRadius:32,background:D.accentSoft,border:`1px solid ${D.accentBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,marginBottom:24}}>☀</div>
          <div style={{fontSize:28,fontWeight:200,letterSpacing:-1,marginBottom:8}}>Sunrise</div>
          <div style={{fontSize:14,color:D.text2,textAlign:"center",lineHeight:1.7,marginBottom:40,maxWidth:260}}>Votre briefing matinal vocal.<br/>Personnalisé. Progressif. Mains libres.</div>
          <Btn onClick={()=>setObStep(1)} primary>Configurer mon réveil</Btn>
        </div>
      </div>
    );

    // Step 1: Identity
    if(obStep===1) return(
      <div style={page}><style>{CSS}</style>
        <div style={{...pad,minHeight:"100vh",animation:"fadeIn .5s"}}>
          <div style={{marginTop:40,marginBottom:20}}>{dots}</div>
          <div style={{fontSize:20,fontWeight:300,marginBottom:28}}>Qui êtes-vous ?</div>
          <div style={{marginBottom:20}}>
            <div style={label}>Prénom</div>
            <input value={obName} onChange={e=>setObName(e.target.value)} placeholder="Optionnel" style={{width:"100%",...card,color:D.text,fontSize:16,fontFamily:"inherit",outline:"none"}} autoFocus/>
          </div>
          <div style={{marginBottom:20}}>
            <div style={label}>Ville</div>
            <input value={obCity} onChange={e=>setObCity(e.target.value)} style={{width:"100%",...card,color:D.text,fontSize:16,fontFamily:"inherit",outline:"none"}}/>
          </div>
          <div style={{marginBottom:28}}>
            <div style={label}>Heure de réveil</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["Semaine",obAw,setObAw],["Week-end",obAwe,setObAwe]].map(([l,v,f])=>(
                <div key={l} style={card}><div style={{fontSize:10,color:D.text3,fontWeight:600,marginBottom:6}}>{l}</div>
                  <input type="time" value={v} onChange={e=>f(e.target.value)} style={{width:"100%",background:"transparent",border:`1px solid ${D.border}`,borderRadius:8,padding:8,color:D.text,fontSize:22,fontWeight:200,fontFamily:"inherit",textAlign:"center",outline:"none"}}/></div>
              ))}
            </div>
          </div>
          <Btn onClick={()=>setObStep(2)} primary>Continuer</Btn>
        </div>
      </div>
    );

    // Step 2: Profile
    if(obStep===2) return(
      <div style={page}><style>{CSS}</style>
        <div style={{...pad,minHeight:"100vh",animation:"fadeIn .5s",overflow:"auto"}}>
          <div style={{marginTop:40,marginBottom:20}}>{dots}</div>
          <div style={{fontSize:20,fontWeight:300,marginBottom:6}}>Type de matin</div>
          <div style={{fontSize:13,color:D.text2,marginBottom:20}}>Pré-configure vos plugins. Modifiable ensuite.</div>
          {PROFILES.map((p,i)=>(
            <button key={p.id} onClick={()=>setObProf(p)} style={{...cardHi(obProf?.id===p.id),width:"100%",display:"flex",alignItems:"center",gap:14,marginBottom:8,cursor:"pointer",fontFamily:"inherit",color:D.text,textAlign:"left",animation:`slideIn .3s ease ${i*.04}s both`}}>
              <div style={{width:36,height:36,borderRadius:18,background:obProf?.id===p.id?D.accentSoft:D.surface,border:`1px solid ${obProf?.id===p.id?D.accentBorder:D.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:obProf?.id===p.id?D.accent:D.text3,fontWeight:700,flexShrink:0}}>{p.icon}</div>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:500}}>{p.label}</div><div style={{fontSize:12,color:D.text2,marginTop:2}}>{p.sub}</div></div>
              {obProf?.id===p.id&&<div style={{color:D.accent,fontSize:16}}>✓</div>}
            </button>
          ))}
          <div style={{marginTop:12}}><Btn onClick={()=>setObStep(3)} primary disabled={!obProf}>Continuer</Btn></div>
        </div>
      </div>
    );

    // Step 3: Breakfast + finish
    if(obStep===3) return(
      <div style={page}><style>{CSS}</style>
        <div style={{...pad,minHeight:"100vh",animation:"fadeIn .5s",overflow:"auto",paddingBottom:40}}>
          <div style={{marginTop:40,marginBottom:20}}>{dots}</div>
          <div style={{fontSize:20,fontWeight:300,marginBottom:6}}>Petit-déjeuner</div>
          <div style={{fontSize:13,color:D.text2,marginBottom:18}}>Sélectionnez ou ajoutez vos recettes. Les calories sont estimées automatiquement.</div>

          {obAllPdj.map(p=>{const on=obPdj.includes(p.id);return(
            <button key={p.id} onClick={()=>setObPdj(x=>on?x.filter(v=>v!==p.id):[...x,p.id])} style={{...cardHi(on),width:"100%",display:"flex",alignItems:"center",gap:12,marginBottom:6,cursor:"pointer",fontFamily:"inherit",color:D.text}}>
              <div style={{flex:1,textAlign:"left"}}>
                <div style={{fontSize:14,fontWeight:500}}>{p.n}</div>
                <div style={{fontSize:11,color:D.text2,marginTop:2}}>{p.d}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:16,fontWeight:200,color:D.accent}}>{p.cal}</div>
                <div style={{fontSize:9,color:D.text3}}>kcal{p.prot>0?` · ${p.prot}g P`:""}</div>
              </div>
              <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${on?D.accent:D.border}`,background:on?D.accent:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{on&&<span style={{color:"#000",fontSize:10,fontWeight:700}}>✓</span>}</div>
            </button>
          )})}

          <div style={{marginTop:14,marginBottom:6}}>
            <div style={{...label,marginBottom:6}}>Ajouter une recette</div>
            <div style={{display:"flex",gap:6}}>
              <input value={obNewPdj} onChange={e=>setObNewPdj(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCustomPdj()} placeholder="Ex: Tartine beurre confiture, Pancakes banane…" style={{flex:1,...card,color:D.text,fontSize:13,fontFamily:"inherit",outline:"none",padding:"10px 14px"}}/>
              <button onClick={addCustomPdj} style={{background:D.accent,border:"none",borderRadius:D.radius,padding:"10px 18px",color:D.bg,fontWeight:700,fontSize:16,cursor:"pointer",fontFamily:"inherit"}}>+</button>
            </div>
            <div style={{fontSize:11,color:D.text3,marginTop:6}}>Les calories sont estimées automatiquement à partir des ingrédients mentionnés.</div>
          </div>

          <div style={{marginTop:20}}><Btn onClick={finishOnboard} primary disabled={obPdj.length===0}>Lancer Sunrise</Btn></div>
        </div>
      </div>
    );
  }

  // ━━━ BRIEFING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if(scr==="briefing"){
    const act=order.filter(id=>plugs.includes(id));
    const cur=act[bSt]||act[0];
    return(
      <div style={page}><style>{CSS}</style>
        <div style={{...pad,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
          {/* Time */}
          <div style={{textAlign:"center",marginBottom:12}}>
            <div style={{fontSize:52,fontWeight:100,letterSpacing:-3,color:D.accent,animation:"breathe 4s ease infinite"}}>{hhmm}</div>
            <div style={{fontSize:12,color:D.text3,textTransform:"capitalize",marginTop:2}}>{dStr}</div>
          </div>

          {/* Volume */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <div style={{flex:1,height:2,borderRadius:1,background:D.surface}}><div style={{height:2,borderRadius:1,background:D.accent,width:vol+"%",transition:"width .5s"}}/></div>
            <span style={{fontSize:10,color:D.text3,minWidth:28}}>{vol}%</span>
          </div>

          {/* Stop */}
          <button onClick={stopB} style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.12)",borderRadius:D.radius,padding:12,color:D.red,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8,letterSpacing:.3}}>
            <span style={{width:6,height:6,borderRadius:3,background:D.red,animation:"pulse 1s infinite"}}/>STOP
          </button>

          {/* Steps */}
          <div style={{display:"flex",gap:2,marginBottom:12}}>{act.map((_,i)=><div key={i} style={{flex:1,height:2,borderRadius:1,background:i<=bSt?D.accent:D.surface,transition:"background .3s"}}/>)}</div>

          <div style={{flex:1,overflow:"auto"}}>
            {cur==="meteo"&&wx&&<div style={{...card,animation:"fadeIn .4s",textAlign:"center"}}><div style={{fontSize:42,fontWeight:100,color:D.accent,margin:"8px 0"}}>{Math.round(wx.current.temperature_2m)}°</div><div style={{color:D.text2,fontSize:14}}>{wD(wx.current.weathercode)}</div><div style={{display:"flex",justifyContent:"center",gap:16,marginTop:12,fontSize:12,color:D.text3}}><span>↑{Math.round(wx.daily.temperature_2m_max[0])}°</span><span>↓{Math.round(wx.daily.temperature_2m_min[0])}°</span>{wDet.wind&&<span>{wx.current.windspeed_10m} km/h</span>}</div>{wDet.sun&&wx.daily.sunrise&&<div style={{marginTop:8,fontSize:11,color:D.text3}}>{wx.daily.sunrise[0]?.split("T")[1]} — {wx.daily.sunset[0]?.split("T")[1]}</div>}</div>}

            {cur==="news"&&<div style={{display:"flex",flexDirection:"column",gap:6}}>{NEWS.map((n,i)=><a key={i} href={n.u} target="_blank" rel="noopener noreferrer" style={{...card,textDecoration:"none",color:D.text,animation:`slideIn .3s ease ${i*.05}s both`}}><div style={{fontSize:14,fontWeight:500,lineHeight:1.4}}>{n.t}</div><div style={{fontSize:11,color:D.text3,marginTop:4}}>{n.s} →</div></a>)}</div>}

            {cur==="agenda"&&<div style={{display:"flex",flexDirection:"column",gap:6}}>{smartAg.map((e,i)=><div key={i} style={{...card,display:"flex",alignItems:"center",gap:12,animation:`slideIn .3s ease ${i*.05}s both`}}><span style={{fontSize:13,fontWeight:600,color:D.accent,minWidth:36}}>{e.t}</span><span style={{fontSize:14,fontWeight:400}}>{e.n}</span></div>)}</div>}

            {cur==="petitdej"&&<div style={{...card,animation:"fadeIn .4s"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{fontSize:17,fontWeight:500}}>{todayPDJ.n}</div><div style={{fontSize:12,color:D.text2,marginTop:4}}>{todayPDJ.d}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:26,fontWeight:100,color:D.accent}}>{todayPDJ.cal}</div><div style={{fontSize:10,color:D.text3}}>kcal{todayPDJ.prot>0?` · ${todayPDJ.prot}g`:""}</div></div></div></div>}

            {cur==="citation"&&<div style={{...card,animation:"fadeIn .4s",textAlign:"center",padding:"28px 20px"}}><div style={{fontSize:15,lineHeight:1.7,fontWeight:300,fontStyle:"italic"}}>{CITS[mood]}</div></div>}

            {cur==="radio"&&<div style={{...card,animation:"fadeIn .4s",textAlign:"center"}}><div style={{fontSize:18,fontWeight:500,marginBottom:4}}>{radio.n}</div><div style={{fontSize:11,color:D.accent}}>En direct · {rMin} min</div></div>}

            {["yoga","sport","podcast","spotify"].includes(cur)&&<div style={{...card,animation:"fadeIn .4s",textAlign:"center"}}><div style={{fontSize:17,fontWeight:500,marginBottom:8}}>{PLUGS.find(p=>p.id===cur)?.label}</div><div style={{fontSize:13,color:D.text2,marginBottom:12}}>{cur==="sport"||cur==="yoga"?"Ouvrez votre app pour commencer.":"Prêt à lancer."}</div><a href={cur==="spotify"?"https://open.spotify.com":"#"} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",background:D.accent,color:D.bg,borderRadius:10,padding:"10px 28px",fontSize:14,fontWeight:600,textDecoration:"none"}}>Ouvrir</a></div>}
          </div>

          <button onClick={()=>{stopB();setScr("home")}} style={{marginTop:10,...card,color:D.text3,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"center",padding:10}}>Retour</button>
        </div>
      </div>
    );
  }

  // ━━━ SETTINGS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if(scr==="settings"){
    const tabs=[{id:"routine",l:"Routine"},{id:"pdj",l:"Petit-déj"},{id:"media",l:"Médias"},{id:"prefs",l:"Préférences"}];
    return(
      <div style={page}><style>{CSS}</style>
        <div style={{...pad,paddingBottom:40}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <button onClick={()=>setScr("home")} style={{background:"none",border:"none",color:D.accent,fontSize:13,cursor:"pointer",fontFamily:"inherit",padding:0}}>← Retour</button>
            <span style={{fontSize:16,fontWeight:500}}>Réglages</span>
          </div>
          <div style={{display:"flex",gap:4,marginBottom:18}}>
            {tabs.map(t=><button key={t.id} onClick={()=>setStab(t.id)} style={{background:stab===t.id?D.accentSoft:D.surface,border:`1px solid ${stab===t.id?D.accentBorder:D.border}`,borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:stab===t.id?600:400,color:stab===t.id?D.accent:D.text3,cursor:"pointer",fontFamily:"inherit"}}>{t.l}</button>)}
          </div>

          {stab==="routine"&&(<>
            <div style={{marginBottom:16}}>
              <div style={label}>Ordre des plugins</div>
              {order.filter(id=>plugs.includes(id)).map((pid,idx)=>{const pl=PLUGS.find(p=>p.id===pid);return(
                <div key={pid} style={{...card,display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:10,fontWeight:700,color:D.text3,minWidth:14}}>{idx+1}</span>
                  <span style={{fontSize:12,color:D.accent}}>{pl?.icon}</span>
                  <span style={{flex:1,fontSize:13,fontWeight:500}}>{pl?.label}</span>
                  <button onClick={()=>movP(pid,-1)} style={{background:"none",border:"none",color:D.text3,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>↑</button>
                  <button onClick={()=>movP(pid,1)} style={{background:"none",border:"none",color:D.text3,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>↓</button>
                  <button onClick={()=>togP(pid)} style={{background:"none",border:"none",color:D.red,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
                </div>
              )})}
            </div>
            {["info","media","well"].map(cat=><div key={cat} style={{marginBottom:14}}>
              <div style={label}>{cat==="info"?"Information":cat==="media"?"Médias":"Bien-être"}</div>
              {PLUGS.filter(p=>p.cat===cat).map(pl=>{const on=plugs.includes(pl.id);return(
                <div key={pl.id} style={{...cardHi(on),display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                  <span style={{fontSize:13,color:on?D.accent:D.text3}}>{pl.icon}</span>
                  <span style={{flex:1,fontSize:13,fontWeight:500}}>{pl.label}</span>
                  <Switch on={on} onToggle={()=>togP(pl.id)}/>
                </div>
              )})}
            </div>)}
          </>)}

          {stab==="pdj"&&(<>
            <div style={label}>Vos recettes</div>
            {allPdj.map(p=>{const on=(cfg?.pdj||[]).includes(p.id);return(
              <button key={p.id} onClick={()=>setCfg(c=>({...c,pdj:on?(c.pdj||[]).filter(v=>v!==p.id):[...(c.pdj||[]),p.id]}))} style={{...cardHi(on),width:"100%",display:"flex",alignItems:"center",gap:10,marginBottom:4,cursor:"pointer",fontFamily:"inherit",color:D.text}}>
                <div style={{flex:1,textAlign:"left"}}><div style={{fontSize:13,fontWeight:500}}>{p.n}</div><div style={{fontSize:10,color:D.text3}}>{p.d}</div></div>
                <div style={{fontSize:14,fontWeight:200,color:D.accent}}>{p.cal}<span style={{fontSize:9,color:D.text3}}> kcal</span></div>
                <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${on?D.accent:D.border}`,background:on?D.accent:"transparent",flexShrink:0}}/>
              </button>
            )})}
            <div style={{marginTop:14}}>
              <div style={{...label,marginBottom:6}}>Ajouter une recette</div>
              <div style={{display:"flex",gap:6}}>
                <input value={obNewPdj} onChange={e=>setObNewPdj(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCustomPdjSettings()} placeholder="Pancakes banane, Tartine nutella…" style={{flex:1,...card,color:D.text,fontSize:12,fontFamily:"inherit",outline:"none",padding:"10px 14px"}}/>
                <button onClick={addCustomPdjSettings} style={{background:D.accent,border:"none",borderRadius:D.radius,padding:"10px 16px",color:D.bg,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+</button>
              </div>
              <div style={{fontSize:11,color:D.text3,marginTop:6}}>Calories estimées automatiquement (beurre, pain, banane, yaourt, etc.)</div>
            </div>
          </>)}

          {stab==="media"&&(<>
            <div style={{marginBottom:16}}>
              <div style={label}>Radio</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4}}>{RADIOS.map(r=><button key={r.n} onClick={()=>setRadio(r)} style={{...cardHi(radio.n===r.n),cursor:"pointer",textAlign:"center",fontSize:11,fontWeight:500,fontFamily:"inherit",color:D.text,padding:"10px 4px"}}>{r.n}</button>)}</div>
              <div style={{marginTop:8,...label,marginBottom:4}}>Durée</div>
              <div style={{display:"flex",gap:4}}>{[10,15,20,30,60].map(m=><button key={m} onClick={()=>setRMin(m)} style={{...cardHi(rMin===m),flex:1,cursor:"pointer",textAlign:"center",fontSize:12,fontWeight:600,fontFamily:"inherit",color:D.text,padding:"8px 2px"}}>{m}m</button>)}</div>
            </div>
          </>)}

          {stab==="prefs"&&(<>
            <div style={{marginBottom:16}}>
              <div style={label}>Réveil</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{[["Semaine",cfg?.aw,v=>setCfg(c=>({...c,aw:v}))],["Week-end",cfg?.awe,v=>setCfg(c=>({...c,awe:v}))]].map(([l,v,f])=><div key={l} style={card}><div style={{fontSize:9,color:D.text3,fontWeight:600,marginBottom:4}}>{l}</div><input type="time" value={v} onChange={e=>f(e.target.value)} style={{width:"100%",background:"transparent",border:`1px solid ${D.border}`,borderRadius:8,padding:6,color:D.text,fontSize:20,fontWeight:200,fontFamily:"inherit",textAlign:"center",outline:"none"}}/></div>)}</div>
            </div>
            <div style={{marginBottom:16}}><div style={label}>Ville</div><input value={cfg?.city} onChange={e=>setCfg(c=>({...c,city:e.target.value}))} style={{width:"100%",...card,color:D.text,fontSize:14,fontFamily:"inherit",outline:"none"}}/></div>
            <div style={{marginBottom:16}}><div style={label}>Voix</div>{voices.slice(0,5).map((v,i)=><button key={i} onClick={()=>{setVoice({lang:v.lang,native:v});const u=new SpeechSynthesisUtterance("Bonjour.");u.voice=v;window.speechSynthesis.speak(u)}} style={{...cardHi(voice?.native?.name===v.name),width:"100%",cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontFamily:"inherit",color:D.text,marginBottom:4,padding:"10px 14px"}}><span style={{flex:1,fontSize:12,fontWeight:500,textAlign:"left"}}>{v.name}</span><span style={{fontSize:10,color:D.text3}}>{v.lang}</span></button>)}</div>
            <div style={{marginBottom:16}}><div style={label}>Humeur (citations)</div><div style={{display:"flex",gap:5}}>{MOODS.map(m=><button key={m.e} onClick={()=>setMood(m.e)} style={{...cardHi(mood===m.e),flex:1,cursor:"pointer",textAlign:"center",fontFamily:"inherit",color:D.text,padding:"10px 2px"}}><div style={{fontSize:18}}>{m.e}</div><div style={{fontSize:8,color:D.text3,marginTop:2}}>{m.l}</div></button>)}</div></div>
            <div><div style={label}>Détails météo</div>{[["wind","Vent"],["rain","Pluie mm"],["sun","Soleil"],["hum","Humidité"]].map(([k,l])=><div key={k} style={{...card,display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13}}>{l}</span><Switch on={wDet[k]} onToggle={()=>setWDet(d=>({...d,[k]:!d[k]}))}/></div>)}</div>
          </>)}
        </div>
      </div>
    );
  }

  // ━━━ HOME ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const actList=order.filter(id=>plugs.includes(id));
  return(
    <div style={page}><style>{CSS}</style>
      <div style={{...pad,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:0}}>
          <div style={{fontSize:13,fontWeight:500,letterSpacing:.5,color:D.text3}}>SUNRISE</div>
          <button onClick={()=>setScr("settings")} style={{...card,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"inherit",color:D.text3}}>Réglages</button>
        </div>

        {/* Clock */}
        <div style={{textAlign:"center",margin:"28px 0 4px",animation:"fadeIn .8s"}}>
          <div style={{fontSize:84,fontWeight:100,letterSpacing:-5,lineHeight:1,color:D.accent,animation:"breathe 4s ease infinite"}}>{hhmm}</div>
          <div style={{fontSize:20,fontWeight:100,color:D.text3+"66",marginTop:0}}>{secs}</div>
        </div>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:13,color:D.text3,textTransform:"capitalize"}}>{dStr}</div>
          <div style={{fontSize:12,color:D.text3,marginTop:4}}>{city}{cfg?.name?` · ${cfg.name}`:""}</div>
        </div>

        {/* Weather */}
        {wx&&<div style={{...card,display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,animation:"fadeIn .6s ease .1s both"}}>
          <div><div style={{fontSize:22,fontWeight:200,color:D.accent}}>{Math.round(wx.current.temperature_2m)}°</div><div style={{fontSize:12,color:D.text2}}>{wD(wx.current.weathercode)}</div></div>
          <div style={{fontSize:11,color:D.text3,textAlign:"right"}}><div>↑{Math.round(wx.daily.temperature_2m_max[0])}° ↓{Math.round(wx.daily.temperature_2m_min[0])}°</div>{wDet.sun&&wx.daily.sunrise&&<div>{wx.daily.sunrise[0]?.split("T")[1]}</div>}</div>
        </div>}

        {/* Alarm */}
        <div style={{...card,marginBottom:10,animation:"fadeIn .6s ease .15s both"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div><div style={{fontSize:10,color:D.text3,fontWeight:600,letterSpacing:1}}>RÉVEIL {isWE?"WEEK-END":"SEMAINE"}</div><div style={{fontSize:26,fontWeight:100,color:D.accent,marginTop:2}}>{al}</div></div>
            <Switch on={aOn} onToggle={()=>setAOn(!aOn)}/>
          </div>
          {aOn&&<div style={{fontSize:10,color:D.green,marginTop:4}}>Programmé · volume progressif</div>}
        </div>

        {/* Launch */}
        <div style={{animation:"fadeIn .6s ease .2s both"}}><Btn onClick={startB} primary>Lancer le briefing</Btn></div>

        {/* Routine */}
        <div style={{marginTop:16,marginBottom:10,animation:"fadeIn .6s ease .25s both"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={label}>Routine · {actList.length} étapes</span>
            <button onClick={()=>setScr("settings")} style={{background:"none",border:"none",color:D.accent,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Modifier</button>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{actList.map((pid,i)=>{const pl=PLUGS.find(p=>p.id===pid);return<div key={pid} style={{...card,padding:"4px 10px",display:"flex",alignItems:"center",gap:4,fontSize:11}}><span style={{fontSize:9,color:D.text3}}>{i+1}</span><span style={{color:D.accent,fontSize:10}}>{pl?.icon}</span><span style={{fontWeight:500}}>{pl?.label}</span></div>})}</div>
        </div>

        {/* Petit-dej */}
        {plugs.includes("petitdej")&&<div style={{...card,display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,animation:"fadeIn .6s ease .3s both"}}><div><div style={{fontSize:13,fontWeight:500}}>{todayPDJ.n}</div><div style={{fontSize:11,color:D.text3,marginTop:2}}>{todayPDJ.d}</div></div><div style={{fontSize:18,fontWeight:100,color:D.accent}}>{todayPDJ.cal}<span style={{fontSize:9,color:D.text3}}> kcal</span></div></div>}

        {/* Agenda */}
        {smartAg.length>0&&plugs.includes("agenda")&&<div style={{...card,display:"flex",alignItems:"center",gap:10,marginBottom:10,animation:"fadeIn .6s ease .35s both"}}><span style={{fontSize:12,fontWeight:600,color:D.accent}}>{smartAg[0].t}</span><span style={{fontSize:13}}>{smartAg[0].n}</span></div>}

        <div style={{marginTop:"auto",textAlign:"center",fontSize:9,color:D.text3,opacity:.4,paddingTop:8}}>Sunrise</div>
      </div>
    </div>
  );
}
