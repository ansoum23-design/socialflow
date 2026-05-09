import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

// ── Design tokens ──────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#09090f;--bg2:#111118;--bg3:#18181f;--bg4:#1f1f28;
    --border:#2a2a38;--border2:#363645;
    --txt:#e8e8f0;--txt2:#9898b0;--txt3:#5a5a72;
    --acc:#7c5cfc;--acc2:#a78bfa;--acc3:#c4b5fd;
    --cyan:#22d3ee;--pink:#f472b6;--green:#34d399;--amber:#fbbf24;
    --font-h:'Syne',sans-serif;--font-b:'DM Sans',sans-serif;
    --r:12px;--r2:8px;--r3:20px;
    --sh:0 4px 24px rgba(0,0,0,.4);
  }
  body{background:var(--bg);color:var(--txt);font-family:var(--font-b)}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg2)}::-webkit-scrollbar-thumb{background:var(--border2);border-radius:4px}
  button{font-family:var(--font-b);cursor:pointer;border:none;outline:none}
  input,textarea,select{font-family:var(--font-b);background:var(--bg3);border:1px solid var(--border);color:var(--txt);border-radius:var(--r2);padding:10px 14px;font-size:14px;outline:none;transition:border .2s}
  input:focus,textarea:focus,select:focus{border-color:var(--acc)}
  textarea{resize:vertical}
  @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fade{animation:fadeIn .4s ease forwards}
  .spin{animation:spin .8s linear infinite}
`;

// ── Fake data ──────────────────────────────────────────────────────
const engagementData = [
  {day:"Lun",Instagram:3200,Twitter:1800,Facebook:900,LinkedIn:600},
  {day:"Mar",Instagram:2800,Twitter:2200,Facebook:1100,LinkedIn:800},
  {day:"Mer",Instagram:4100,Twitter:1600,Facebook:1300,LinkedIn:950},
  {day:"Jeu",Instagram:3700,Twitter:2800,Facebook:1000,LinkedIn:700},
  {day:"Ven",Instagram:5200,Twitter:3100,Facebook:1800,LinkedIn:1100},
  {day:"Sam",Instagram:6800,Twitter:2400,Facebook:2200,LinkedIn:500},
  {day:"Dim",Instagram:5500,Twitter:1900,Facebook:1700,LinkedIn:300},
];
const followerGrowth = [
  {month:"Jan",total:12400},{month:"Fév",total:14200},{month:"Mar",total:15800},
  {month:"Avr",total:18300},{month:"Mai",total:21000},{month:"Jun",total:24500},
];
const platformShare = [
  {name:"Instagram",value:42,color:"#f472b6"},
  {name:"Twitter/X",value:28,color:"#22d3ee"},
  {name:"Facebook",value:18,color:"#818cf8"},
  {name:"LinkedIn",value:12,color:"#34d399"},
];

const platforms = [
  {id:"instagram",label:"Instagram",color:"#f472b6",icon:"📸"},
  {id:"twitter",label:"Twitter/X",color:"#22d3ee",icon:"🐦"},
  {id:"facebook",label:"Facebook",color:"#818cf8",icon:"📘"},
  {id:"linkedin",label:"LinkedIn",color:"#34d399",icon:"💼"},
  {id:"tiktok",label:"TikTok",color:"#fbbf24",icon:"🎵"},
];

const scheduledPosts = [
  {id:1,platform:"instagram",content:"🌅 Notre nouveau produit arrive demain ! Restez connectés pour la grande révélation...",time:"09:00",date:"2026-05-10",status:"scheduled",likes:0,reach:"12K"},
  {id:2,platform:"twitter",content:"Thread : 5 stratégies marketing qui ont multiplié notre ROI par 3 en 6 mois 🧵",time:"11:30",date:"2026-05-10",status:"scheduled",likes:0,reach:"8K"},
  {id:3,platform:"linkedin",content:"Nous recrutons ! 3 postes ouverts en marketing digital. Partagez avec vos réseaux 🚀",time:"14:00",date:"2026-05-11",status:"scheduled",likes:0,reach:"5K"},
  {id:4,platform:"facebook",content:"Découvrez notre guide gratuit : 10 étapes pour doubler votre audience en 30 jours.",time:"16:00",date:"2026-05-12",status:"draft",likes:0,reach:"15K"},
];

const contentIdeas = [
  "Partagez les coulisses de votre équipe",
  "Faites un sondage sur votre audience",
  "Publiez un témoignage client",
  "Créez un Reel tutoriel",
  "Annoncez un concours ou giveaway",
];

// ── Composants UI ─────────────────────────────────────────────────
const Badge = ({children, color="#7c5cfc"}) => (
  <span style={{background:`${color}22`,color,border:`1px solid ${color}44`,
    padding:"2px 10px",borderRadius:99,fontSize:11,fontWeight:600,letterSpacing:.5}}>
    {children}
  </span>
);

const Stat = ({label,value,delta,color="#7c5cfc",icon}) => (
  <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--r)",
    padding:"20px 24px",flex:1,minWidth:150,transition:"transform .2s",cursor:"default"}}
    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
    onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
      <span style={{fontSize:20}}>{icon}</span>
      <span style={{color:"var(--txt2)",fontSize:12,letterSpacing:.5,textTransform:"uppercase",fontWeight:500}}>{label}</span>
    </div>
    <div style={{fontSize:28,fontFamily:"var(--font-h)",fontWeight:700,color,marginBottom:4}}>{value}</div>
    <div style={{fontSize:12,color:delta>0?"var(--green)":"var(--pink)"}}>
      {delta>0?"▲":"▼"} {Math.abs(delta)}% vs semaine dernière
    </div>
  </div>
);

const PlatformTag = ({id}) => {
  const p = platforms.find(x=>x.id===id);
  return p ? <Badge color={p.color}>{p.icon} {p.label}</Badge> : null;
};

// ── Pages ─────────────────────────────────────────────────────────

function Dashboard() {
  return (
    <div className="fade" style={{display:"flex",flexDirection:"column",gap:24}}>
      <div>
        <h1 style={{fontFamily:"var(--font-h)",fontSize:28,fontWeight:800}}>Tableau de bord 📊</h1>
        <p style={{color:"var(--txt2)",marginTop:4}}>Bienvenue ! Voici votre vue globale d'aujourd'hui.</p>
      </div>

      {/* KPIs */}
      <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
        <Stat label="Abonnés totaux" value="24 582" delta={8.4} color="var(--acc2)" icon="👥"/>
        <Stat label="Engagement" value="6.2%" delta={12.1} color="var(--cyan)" icon="❤️"/>
        <Stat label="Portée" value="148K" delta={-3.2} color="var(--pink)" icon="📡"/>
        <Stat label="Posts publiés" value="47" delta={22} color="var(--green)" icon="📝"/>
      </div>

      {/* Charts row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:16}}>
        {/* Engagement chart */}
        <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:24}}>
          <h3 style={{fontFamily:"var(--font-h)",fontSize:16,fontWeight:700,marginBottom:4}}>Engagement par plateforme</h3>
          <p style={{color:"var(--txt2)",fontSize:12,marginBottom:20}}>7 derniers jours</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={engagementData}>
              <defs>
                {[["ig","#f472b6"],["tw","#22d3ee"],["fb","#818cf8"],["li","#34d399"]].map(([id,c])=>(
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={c} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--txt3)" fontSize={11}/>
              <YAxis stroke="var(--txt3)" fontSize={11}/>
              <Tooltip contentStyle={{background:"var(--bg4)",border:"1px solid var(--border2)",borderRadius:8,color:"var(--txt)"}}/>
              <Area type="monotone" dataKey="Instagram" stroke="#f472b6" fill="url(#ig)" strokeWidth={2}/>
              <Area type="monotone" dataKey="Twitter" stroke="#22d3ee" fill="url(#tw)" strokeWidth={2}/>
              <Area type="monotone" dataKey="Facebook" stroke="#818cf8" fill="url(#fb)" strokeWidth={2}/>
              <Area type="monotone" dataKey="LinkedIn" stroke="#34d399" fill="url(#li)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:24}}>
          <h3 style={{fontFamily:"var(--font-h)",fontSize:16,fontWeight:700,marginBottom:4}}>Répartition</h3>
          <p style={{color:"var(--txt2)",fontSize:12,marginBottom:12}}>Part par plateforme</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={platformShare} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                dataKey="value" paddingAngle={3}>
                {platformShare.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip contentStyle={{background:"var(--bg4)",border:"1px solid var(--border2)",borderRadius:8,color:"var(--txt)"}}
                formatter={(v,n)=>[`${v}%`,n]}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
            {platformShare.map(p=>(
              <div key={p.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:8,height:8,borderRadius:99,background:p.color}}/>
                  <span style={{fontSize:12,color:"var(--txt2)"}}>{p.name}</span>
                </div>
                <span style={{fontSize:12,fontWeight:600,color:p.color}}>{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth chart */}
      <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:24}}>
        <h3 style={{fontFamily:"var(--font-h)",fontSize:16,fontWeight:700,marginBottom:4}}>Croissance des abonnés</h3>
        <p style={{color:"var(--txt2)",fontSize:12,marginBottom:20}}>6 derniers mois (tous réseaux)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={followerGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--txt3)" fontSize={11}/>
            <YAxis stroke="var(--txt3)" fontSize={11}/>
            <Tooltip contentStyle={{background:"var(--bg4)",border:"1px solid var(--border2)",borderRadius:8,color:"var(--txt)"}}
              formatter={v=>[v.toLocaleString(),"Abonnés"]}/>
            <Bar dataKey="total" fill="var(--acc)" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ideas rapides */}
      <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:24}}>
        <h3 style={{fontFamily:"var(--font-h)",fontSize:16,fontWeight:700,marginBottom:16}}>💡 Idées de contenu du jour</h3>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {contentIdeas.map((idea,i)=>(
            <div key={i} style={{background:"var(--bg4)",border:"1px solid var(--border2)",borderRadius:"var(--r2)",
              padding:"10px 16px",fontSize:13,color:"var(--txt2)",cursor:"pointer",transition:"all .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--acc)";e.currentTarget.style.color="var(--txt)"}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border2)";e.currentTarget.style.color="var(--txt2)"}}>
              {idea}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Scheduler({posts,setPosts}) {
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({platform:"instagram",content:"",date:"",time:"",status:"scheduled"});

  const add=()=>{
    if(!form.content||!form.date||!form.time)return;
    setPosts(p=>[...p,{...form,id:Date.now(),likes:0,reach:"~"}]);
    setForm({platform:"instagram",content:"",date:"",time:"",status:"scheduled"});
    setShowForm(false);
  };

  return (
    <div className="fade" style={{display:"flex",flexDirection:"column",gap:24}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontFamily:"var(--font-h)",fontSize:28,fontWeight:800}}>Planificateur 📅</h1>
          <p style={{color:"var(--txt2)",marginTop:4}}>Planifiez vos publications à l'avance</p>
        </div>
        <button onClick={()=>setShowForm(v=>!v)} style={{background:"var(--acc)",color:"#fff",padding:"10px 20px",
          borderRadius:"var(--r2)",fontWeight:600,fontSize:14,transition:"opacity .2s"}}
          onMouseEnter={e=>e.currentTarget.style.opacity=".85"}
          onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          + Nouveau post
        </button>
      </div>

      {showForm&&(
        <div className="fade" style={{background:"var(--bg3)",border:"1px solid var(--acc)",borderRadius:"var(--r)",padding:24}}>
          <h3 style={{fontFamily:"var(--font-h)",fontWeight:700,marginBottom:16}}>Créer un post</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label style={{fontSize:12,color:"var(--txt2)",display:"block",marginBottom:6}}>Plateforme</label>
              <select value={form.platform} onChange={e=>setForm(f=>({...f,platform:e.target.value}))} style={{width:"100%"}}>
                {platforms.map(p=><option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontSize:12,color:"var(--txt2)",display:"block",marginBottom:6}}>Statut</label>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={{width:"100%"}}>
                <option value="scheduled">Planifié</option>
                <option value="draft">Brouillon</option>
              </select>
            </div>
            <div>
              <label style={{fontSize:12,color:"var(--txt2)",display:"block",marginBottom:6}}>Date</label>
              <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{width:"100%"}}/>
            </div>
            <div>
              <label style={{fontSize:12,color:"var(--txt2)",display:"block",marginBottom:6}}>Heure</label>
              <input type="time" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} style={{width:"100%"}}/>
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:12,color:"var(--txt2)",display:"block",marginBottom:6}}>Contenu du post</label>
            <textarea value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))}
              placeholder="Rédigez votre publication..." rows={4} style={{width:"100%"}}/>
            <div style={{textAlign:"right",fontSize:11,color:form.content.length>280?"var(--pink)":"var(--txt3)",marginTop:4}}>
              {form.content.length}/280
            </div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={add} style={{background:"var(--acc)",color:"#fff",padding:"10px 20px",
              borderRadius:"var(--r2)",fontWeight:600,fontSize:14}}>Planifier</button>
            <button onClick={()=>setShowForm(false)} style={{background:"var(--bg4)",color:"var(--txt2)",padding:"10px 20px",
              borderRadius:"var(--r2)",fontWeight:500,fontSize:14}}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {posts.map(post=>(
          <div key={post.id} style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--r)",
            padding:20,display:"flex",alignItems:"flex-start",gap:16,transition:"border-color .2s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="var(--border2)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,flexWrap:"wrap"}}>
                <PlatformTag id={post.platform}/>
                <Badge color={post.status==="scheduled"?"var(--green)":"var(--amber)"}>
                  {post.status==="scheduled"?"✓ Planifié":"📄 Brouillon"}
                </Badge>
                <span style={{fontSize:12,color:"var(--txt3)",marginLeft:"auto"}}>
                  📅 {post.date} à {post.time}
                </span>
              </div>
              <p style={{fontSize:14,lineHeight:1.6,color:"var(--txt2)"}}>{post.content}</p>
              <div style={{display:"flex",gap:16,marginTop:12}}>
                <span style={{fontSize:12,color:"var(--txt3)"}}>📡 Portée estimée : <b style={{color:"var(--txt)"}}>{post.reach}</b></span>
              </div>
            </div>
            <button onClick={()=>setPosts(p=>p.filter(x=>x.id!==post.id))}
              style={{background:"transparent",color:"var(--txt3)",fontSize:18,padding:"4px 8px",
                borderRadius:"var(--r2)",transition:"color .2s"}}
              onMouseEnter={e=>e.currentTarget.style.color="var(--pink)"}
              onMouseLeave={e=>e.currentTarget.style.color="var(--txt3)"}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIGenerator() {
  const [topic,setTopic]=useState("");
  const [platform,setPlatform]=useState("instagram");
  const [tone,setTone]=useState("professionnel");
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState("");
  const [error,setError]=useState("");
  const [copied,setCopied]=useState(false);

  const generate=async()=>{
    if(!topic.trim())return;
    setLoading(true);setResult("");setError("");
    try{
      const plat=platforms.find(p=>p.id===platform);
      const prompt=`Tu es un expert en marketing des réseaux sociaux. Génère un post ${plat.label} sur le thème : "${topic}".
Ton : ${tone}
Contraintes : adapté à ${plat.label}, accrocheur, avec émojis pertinents, hashtags si approprié, max 280 mots.
Réponds directement avec le texte du post, sans introduction.`;

      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{role:"user",content:prompt}]
        })
      });
      const data=await res.json();
      if(data.content?.[0]?.text) setResult(data.content[0].text);
      else setError("Erreur lors de la génération. Réessayez.");
    }catch{
      setError("Impossible de contacter l'IA. Vérifiez votre connexion.");
    }finally{setLoading(false);}
  };

  const copy=()=>{
    navigator.clipboard.writeText(result);
    setCopied(true);setTimeout(()=>setCopied(false),2000);
  };

  return (
    <div className="fade" style={{display:"flex",flexDirection:"column",gap:24}}>
      <div>
        <h1 style={{fontFamily:"var(--font-h)",fontSize:28,fontWeight:800}}>Générateur IA ✨</h1>
        <p style={{color:"var(--txt2)",marginTop:4}}>Créez des posts engageants en quelques secondes</p>
      </div>

      <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:28}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <div>
            <label style={{fontSize:12,color:"var(--txt2)",display:"block",marginBottom:6,letterSpacing:.5,textTransform:"uppercase"}}>Plateforme cible</label>
            <select value={platform} onChange={e=>setPlatform(e.target.value)} style={{width:"100%"}}>
              {platforms.map(p=><option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:12,color:"var(--txt2)",display:"block",marginBottom:6,letterSpacing:.5,textTransform:"uppercase"}}>Ton de communication</label>
            <select value={tone} onChange={e=>setTone(e.target.value)} style={{width:"100%"}}>
              {["professionnel","décontracté","humoristique","inspirant","éducatif","urgent"].map(t=>(
                <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{fontSize:12,color:"var(--txt2)",display:"block",marginBottom:6,letterSpacing:.5,textTransform:"uppercase"}}>Sujet ou thème du post</label>
          <textarea value={topic} onChange={e=>setTopic(e.target.value)}
            placeholder="Ex: lancement de notre nouvelle application mobile, promotion d'été -50%, recrutement d'un développeur..."
            rows={3} style={{width:"100%"}}/>
        </div>
        <button onClick={generate} disabled={loading||!topic.trim()}
          style={{background:loading||!topic.trim()?"var(--bg4)":"linear-gradient(135deg,var(--acc),#a855f7)",
            color:loading||!topic.trim()?"var(--txt3)":"#fff",padding:"12px 28px",borderRadius:"var(--r2)",
            fontWeight:700,fontSize:15,transition:"all .2s",width:"100%",letterSpacing:.3}}>
          {loading?(
            <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
              <span className="spin" style={{display:"inline-block",width:16,height:16,border:"2px solid #fff3",borderTopColor:"#fff",borderRadius:99}}/>
              Génération en cours...
            </span>
          ):"✨ Générer avec Claude AI"}
        </button>
      </div>

      {error&&(
        <div style={{background:"#f472b622",border:"1px solid #f472b644",borderRadius:"var(--r)",padding:16,color:"var(--pink)"}}>
          ⚠️ {error}
        </div>
      )}

      {result&&(
        <div className="fade" style={{background:"var(--bg3)",border:"1px solid var(--acc)",borderRadius:"var(--r)",padding:24}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <h3 style={{fontFamily:"var(--font-h)",fontWeight:700}}>Post généré</h3>
              <PlatformTag id={platform}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={copy} style={{background:"var(--bg4)",color:copied?"var(--green)":"var(--txt2)",
                padding:"8px 16px",borderRadius:"var(--r2)",fontSize:13,fontWeight:500,transition:"all .2s"}}>
                {copied?"✓ Copié !":"📋 Copier"}
              </button>
              <button onClick={generate} style={{background:"var(--bg4)",color:"var(--txt2)",
                padding:"8px 16px",borderRadius:"var(--r2)",fontSize:13,fontWeight:500}}>
                🔄 Regénérer
              </button>
            </div>
          </div>
          <div style={{background:"var(--bg4)",borderRadius:"var(--r2)",padding:20,
            fontSize:14,lineHeight:1.8,whiteSpace:"pre-wrap",color:"var(--txt)"}}>
            {result}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
            <span style={{fontSize:12,color:"var(--txt3)"}}>{result.length} caractères</span>
            <span style={{fontSize:12,color:result.length>280?"var(--pink)":"var(--green)"}}>
              {result.length>280?"⚠️ Dépasse 280 chars":"✓ Longueur optimale"}
            </span>
          </div>
        </div>
      )}

      {/* Tips */}
      <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:24}}>
        <h3 style={{fontFamily:"var(--font-h)",fontSize:15,fontWeight:700,marginBottom:14}}>🎯 Conseils par plateforme</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
          {[
            {icon:"📸",name:"Instagram",tip:"Visuels + hashtags (5-10) + appel à l'action"},
            {icon:"🐦",name:"Twitter/X",tip:"Court, percutant, max 280 chars, 1-2 hashtags"},
            {icon:"💼",name:"LinkedIn",tip:"Professionnel, storytelling, insights du secteur"},
            {icon:"📘",name:"Facebook",tip:"Questions ouvertes, contenu local, groupes"},
            {icon:"🎵",name:"TikTok",tip:"Tendances, sons viraux, contenu authentique"},
          ].map(p=>(
            <div key={p.name} style={{background:"var(--bg4)",borderRadius:"var(--r2)",padding:14}}>
              <div style={{fontSize:18,marginBottom:6}}>{p.icon}</div>
              <div style={{fontSize:12,fontWeight:600,color:"var(--txt)",marginBottom:4}}>{p.name}</div>
              <div style={{fontSize:11,color:"var(--txt2)",lineHeight:1.5}}>{p.tip}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Analytics() {
  return (
    <div className="fade" style={{display:"flex",flexDirection:"column",gap:24}}>
      <div>
        <h1 style={{fontFamily:"var(--font-h)",fontSize:28,fontWeight:800}}>Analytics 📈</h1>
        <p style={{color:"var(--txt2)",marginTop:4}}>Performance détaillée de vos réseaux</p>
      </div>

      {/* Platform cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14}}>
        {[
          {id:"instagram",followers:"12 400",growth:"+8.2%",eng:"7.4%",posts:18},
          {id:"twitter",followers:"7 300",growth:"+3.1%",eng:"2.8%",posts:34},
          {id:"facebook",followers:"3 200",growth:"+1.4%",eng:"1.9%",posts:12},
          {id:"linkedin",followers:"1 682",growth:"+14.7%",eng:"5.1%",posts:8},
        ].map(p=>{
          const plat=platforms.find(x=>x.id===p.id);
          return (
            <div key={p.id} style={{background:"var(--bg3)",border:`1px solid ${plat.color}33`,
              borderRadius:"var(--r)",padding:20,borderTop:`3px solid ${plat.color}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <span style={{fontSize:22}}>{plat.icon}</span>
                <span style={{fontFamily:"var(--font-h)",fontWeight:700}}>{plat.label}</span>
              </div>
              <div style={{fontSize:24,fontWeight:800,fontFamily:"var(--font-h)",color:plat.color}}>{p.followers}</div>
              <div style={{fontSize:12,color:"var(--green)",marginTop:2}}>{p.growth} ce mois</div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)"}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:700,color:"var(--txt)"}}>{p.eng}</div>
                  <div style={{fontSize:10,color:"var(--txt3)"}}>Engagement</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:700,color:"var(--txt)"}}>{p.posts}</div>
                  <div style={{fontSize:10,color:"var(--txt3)"}}>Posts / mois</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Meilleurs horaires */}
      <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:24}}>
        <h3 style={{fontFamily:"var(--font-h)",fontSize:16,fontWeight:700,marginBottom:16}}>⏰ Meilleurs horaires de publication</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
          {[
            {plat:"Instagram",icon:"📸",color:"#f472b6",slots:["Lundi 09h","Mercredi 18h","Vendredi 12h"]},
            {plat:"Twitter/X",icon:"🐦",color:"#22d3ee",slots:["Mardi 08h","Jeudi 12h","Samedi 10h"]},
            {plat:"LinkedIn",icon:"💼",color:"#34d399",slots:["Mardi 07h","Mercredi 09h","Jeudi 17h"]},
            {plat:"Facebook",icon:"📘",color:"#818cf8",slots:["Mercredi 15h","Jeudi 13h","Dimanche 16h"]},
          ].map(p=>(
            <div key={p.plat} style={{background:"var(--bg4)",borderRadius:"var(--r2)",padding:16}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                <span>{p.icon}</span>
                <span style={{fontWeight:600,fontSize:13,color:p.color}}>{p.plat}</span>
              </div>
              {p.slots.map(s=>(
                <div key={s} style={{fontSize:12,color:"var(--txt2)",padding:"4px 0",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:6}}>
                  <span style={{color:"var(--green)"}}>●</span>{s}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Top posts */}
      <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:24}}>
        <h3 style={{fontFamily:"var(--font-h)",fontSize:16,fontWeight:700,marginBottom:16}}>🏆 Top publications du mois</h3>
        {[
          {plat:"instagram",text:"Notre équipe en coulisses — une journée ordinaire 🎬",likes:"2.4K",reach:"48K",shares:380},
          {plat:"linkedin",text:"5 leçons que j'ai apprises en lançant 3 startups en 5 ans 💡",likes:"1.8K",reach:"32K",shares:920},
          {plat:"twitter",text:"Thread : Comment nous avons 10x notre trafic en 60 jours sans pub 🧵",likes:"3.1K",reach:"95K",shares:1240},
        ].map((p,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:16,padding:"14px 0",
            borderBottom:i<2?"1px solid var(--border)":"none"}}>
            <div style={{width:32,height:32,borderRadius:99,background:"var(--acc)",display:"flex",
              alignItems:"center",justifyContent:"center",fontFamily:"var(--font-h)",fontWeight:800,fontSize:14,color:"#fff",flexShrink:0}}>
              #{i+1}
            </div>
            <div style={{flex:1}}>
              <div style={{marginBottom:6}}><PlatformTag id={p.plat}/></div>
              <div style={{fontSize:13,color:"var(--txt)"}}>{p.text}</div>
            </div>
            <div style={{display:"flex",gap:16,textAlign:"center",flexShrink:0}}>
              <div><div style={{fontSize:14,fontWeight:700,color:"var(--pink)"}}>{p.likes}</div><div style={{fontSize:10,color:"var(--txt3)"}}>Likes</div></div>
              <div><div style={{fontSize:14,fontWeight:700,color:"var(--cyan)"}}>{p.reach}</div><div style={{fontSize:10,color:"var(--txt3)"}}>Portée</div></div>
              <div><div style={{fontSize:14,fontWeight:700,color:"var(--green)"}}>{p.shares}</div><div style={{fontSize:10,color:"var(--txt3)"}}>Partages</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Settings() {
  const [saved,setSaved]=useState(false);
  const [name,setName]=useState("Mon Entreprise");
  const [email,setEmail]=useState("contact@monentreprise.com");
  const [notif,setNotif]=useState(true);

  const save=()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);};

  return (
    <div className="fade" style={{display:"flex",flexDirection:"column",gap:24}}>
      <div>
        <h1 style={{fontFamily:"var(--font-h)",fontSize:28,fontWeight:800}}>Paramètres ⚙️</h1>
        <p style={{color:"var(--txt2)",marginTop:4}}>Configurez votre compte et vos intégrations</p>
      </div>

      {/* Compte */}
      <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:28}}>
        <h3 style={{fontFamily:"var(--font-h)",fontWeight:700,marginBottom:20}}>👤 Informations du compte</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <div>
            <label style={{fontSize:12,color:"var(--txt2)",display:"block",marginBottom:6}}>Nom de l'entreprise</label>
            <input value={name} onChange={e=>setName(e.target.value)} style={{width:"100%"}}/>
          </div>
          <div>
            <label style={{fontSize:12,color:"var(--txt2)",display:"block",marginBottom:6}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:"100%"}}/>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
          <div onClick={()=>setNotif(v=>!v)} style={{width:40,height:22,borderRadius:99,
            background:notif?"var(--acc)":"var(--bg4)",border:"1px solid var(--border2)",
            cursor:"pointer",position:"relative",transition:"background .2s"}}>
            <div style={{position:"absolute",top:2,left:notif?20:2,width:16,height:16,
              borderRadius:99,background:"#fff",transition:"left .2s"}}/>
          </div>
          <span style={{fontSize:13,color:"var(--txt2)"}}>Notifications par email</span>
        </div>
        <button onClick={save} style={{background:saved?"var(--green)":"var(--acc)",color:"#fff",
          padding:"10px 24px",borderRadius:"var(--r2)",fontWeight:600,fontSize:14,transition:"background .3s"}}>
          {saved?"✓ Sauvegardé !":"Sauvegarder"}
        </button>
      </div>

      {/* Réseaux connectés */}
      <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:28}}>
        <h3 style={{fontFamily:"var(--font-h)",fontWeight:700,marginBottom:20}}>🔗 Réseaux connectés</h3>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {platforms.map((p,i)=>{
            const connected=i<3;
            return (
              <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"14px 18px",background:"var(--bg4)",borderRadius:"var(--r2)",
                border:`1px solid ${connected?p.color+"44":"var(--border)"}`}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:22}}>{p.icon}</span>
                  <div>
                    <div style={{fontWeight:600,fontSize:14}}>{p.label}</div>
                    <div style={{fontSize:11,color:connected?"var(--green)":"var(--txt3)"}}>
                      {connected?"● Connecté":"○ Non connecté"}
                    </div>
                  </div>
                </div>
                <button style={{background:connected?"transparent":"var(--acc)",
                  color:connected?"var(--pink)":"#fff",border:connected?"1px solid var(--pink)44":"none",
                  padding:"6px 16px",borderRadius:"var(--r2)",fontSize:12,fontWeight:600}}>
                  {connected?"Déconnecter":"Connecter"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan */}
      <div style={{background:"linear-gradient(135deg,var(--acc)22,#a855f722)",border:"1px solid var(--acc)44",
        borderRadius:"var(--r)",padding:28}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <h3 style={{fontFamily:"var(--font-h)",fontWeight:800,fontSize:18}}>Plan Pro ⭐</h3>
            <p style={{color:"var(--txt2)",marginTop:4,fontSize:13}}>Jusqu'à 10 comptes · Posts illimités · IA incluse</p>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"var(--font-h)",fontSize:28,fontWeight:800,color:"var(--acc2)"}}>29€<span style={{fontSize:14,fontWeight:400,color:"var(--txt3)"}}>/mois</span></div>
            <button style={{background:"var(--acc)",color:"#fff",padding:"8px 18px",
              borderRadius:"var(--r2)",fontWeight:600,fontSize:13,marginTop:8}}>Gérer l'abonnement</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App principale ─────────────────────────────────────────────────
export default function App() {
  const [page,setPage]=useState("dashboard");
  const [posts,setPosts]=useState(scheduledPosts);

  const nav=[
    {id:"dashboard",icon:"⊞",label:"Tableau de bord"},
    {id:"scheduler",icon:"📅",label:"Planificateur"},
    {id:"ai",icon:"✨",label:"Générateur IA"},
    {id:"analytics",icon:"📈",label:"Analytics"},
    {id:"settings",icon:"⚙️",label:"Paramètres"},
  ];

  const pages={
    dashboard:<Dashboard/>,
    scheduler:<Scheduler posts={posts} setPosts={setPosts}/>,
    ai:<AIGenerator/>,
    analytics:<Analytics/>,
    settings:<Settings/>,
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{display:"flex",height:"100vh",overflow:"hidden",background:"var(--bg)"}}>
        {/* Sidebar */}
        <div style={{width:230,background:"var(--bg2)",borderRight:"1px solid var(--border)",
          display:"flex",flexDirection:"column",flexShrink:0}}>
          {/* Logo */}
          <div style={{padding:"24px 20px",borderBottom:"1px solid var(--border)"}}>
            <div style={{fontFamily:"var(--font-h)",fontWeight:800,fontSize:22,letterSpacing:-.5}}>
              <span style={{color:"var(--acc)"}}>Social</span><span style={{color:"var(--txt)"}}>Flow</span>
            </div>
            <div style={{fontSize:11,color:"var(--txt3)",marginTop:2}}>Marketing Suite</div>
          </div>

          {/* Nav */}
          <nav style={{flex:1,padding:"12px 10px",display:"flex",flexDirection:"column",gap:2}}>
            {nav.map(n=>(
              <button key={n.id} onClick={()=>setPage(n.id)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:"var(--r2)",
                  background:page===n.id?"var(--acc)22":"transparent",
                  color:page===n.id?"var(--acc2)":"var(--txt2)",
                  textAlign:"left",width:"100%",fontSize:13,fontWeight:page===n.id?600:400,
                  transition:"all .2s",border:page===n.id?"1px solid var(--acc)44":"1px solid transparent"}}
                onMouseEnter={e=>{if(page!==n.id){e.currentTarget.style.background="var(--bg3)";e.currentTarget.style.color="var(--txt)"}}}
                onMouseLeave={e=>{if(page!==n.id){e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--txt2)"}}}>
                <span style={{fontSize:16}}>{n.icon}</span>
                {n.label}
                {n.id==="scheduler"&&posts.filter(p=>p.status==="scheduled").length>0&&(
                  <span style={{marginLeft:"auto",background:"var(--acc)",color:"#fff",
                    width:18,height:18,borderRadius:99,fontSize:10,fontWeight:700,
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {posts.filter(p=>p.status==="scheduled").length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* User */}
          <div style={{padding:"16px 14px",borderTop:"1px solid var(--border)",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,borderRadius:99,background:"linear-gradient(135deg,var(--acc),#a855f7)",
              display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontFamily:"var(--font-h)",fontSize:14,color:"#fff",flexShrink:0}}>
              M
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600}}>Mon Entreprise</div>
              <div style={{fontSize:10,color:"var(--txt3)"}}>Plan Pro ⭐</div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{flex:1,overflow:"auto",padding:"32px 36px"}}>
          <div style={{maxWidth:900,margin:"0 auto"}}>
            {pages[page]}
          </div>
        </div>
      </div>
    </>
  );
}
