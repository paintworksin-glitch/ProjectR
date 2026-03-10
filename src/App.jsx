import { useState, useEffect, useRef, Component } from 'react'
import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL      = "https://thgnziutmpmnsrkjoext.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoZ256aXV0bXBtbnNya2pvZXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MTUwOTcsImV4cCI6MjA4ODA5MTA5N30.SYLiGFgGChnibmEP5RQVmJzlfr_nBDpJJCOmTCZgZ9Y";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Fraunces:ital,wght@0,700;0,800;1,700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', sans-serif; background: #fff8f4; color: #1a1410; overflow-x: hidden; }
  input, select, textarea, button { font-family: inherit; }
  :root {
    --primary: #FF6B00; --primary2: #E55E00; --primary-light: #fff3ea; --primary-mid: #ffd4b0;
    --navy: #1a1410; --navy2: #2d2118; --green: #FF6B00; --green2: #E55E00;
    --green-light: #fff3ea; --green-mid: #ffd4b0; --cream: #fff8f4;
    --white: #FFFFFF; --gray: #f5f0ec; --border: #ede5dc; --text: #1a1410;
    --muted: #78716c; --shadow: 0 1px 3px rgba(255,107,0,0.06),0 4px 16px rgba(255,107,0,0.08);
    --shadow-lg: 0 8px 16px rgba(255,107,0,0.08),0 24px 48px rgba(255,107,0,0.14);
  }
  .card { background: var(--white); border-radius: 20px; border: 1px solid var(--border); box-shadow: 0 1px 4px rgba(0,0,0,0.04); transition: all 0.25s ease; }
  .card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
  .card-flat { background: var(--white); border-radius: 14px; border: 1px solid var(--border); }
  .inp { background: var(--white); border: 1.5px solid var(--border); color: var(--text); border-radius: 10px; padding: 10px 13px; font-size: 14px; width: 100%; outline: none; transition: border 0.2s; font-family: inherit; }
  .inp::placeholder { color: var(--muted); }
  .inp:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(255,107,0,0.12); }
  .inp option { background: #fff; color: var(--text); }
  .btn-primary { background: var(--primary); color: #fff; border: none; cursor: pointer; font-weight: 700; transition: all 0.2s; font-family: inherit; box-shadow: 0 4px 14px rgba(255,107,0,0.3); }
  .btn-primary:hover:not(:disabled) { background: var(--primary2); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,107,0,0.4); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-ghost { background: var(--gray); border: 1.5px solid var(--border); color: var(--muted); cursor: pointer; font-weight: 600; transition: all 0.2s; font-family: inherit; }
  .btn-ghost:hover { background: var(--border); color: var(--text); }
  .btn-danger { background: #FEF2F2; border: 1.5px solid #FECACA; color: #DC2626; cursor: pointer; font-weight: 600; transition: all 0.2s; font-family: inherit; }
  .btn-danger:hover { background: #FEE2E2; }
  .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.2px; display: inline-block; }
  .tag { background: var(--primary-light); color: var(--primary); border: 1px solid var(--primary-mid); }
  .tag-navy { background: rgba(26,20,16,0.06); color: var(--navy); border: 1px solid rgba(26,20,16,0.12); }
  .section-label { font-size: 12px; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; display: block; }
  @keyframes shiny-sweep { 0%{background-position:200% center} 100%{background-position:-200% center} }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .shiny-text { display: inline-block; }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
  @keyframes spin { to { transform: rotate(360deg); } }
  .af{animation:float 5s ease-in-out infinite} .asl{animation:slideUp 0.4s ease forwards}
  .afd{animation:fadeIn 0.3s ease forwards} .shk{animation:shake 0.4s ease}
  .spin{animation:spin 0.8s linear infinite; display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%;}
  ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:var(--gray)} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
  @media print {
    body > * { display:none !important; }
    #pdf-print-area { display:block !important; position:static !important; width:100% !important; padding:32px !important; box-sizing:border-box !important; }
    #pdf-print-area * { visibility:visible !important; }
  }
  @media(max-width:768px){.hm{display:none!important}.gr{grid-template-columns:1fr!important}.gr3{grid-template-columns:1fr!important}.mob-nav{display:flex!important}}
  @media(max-width:640px){.h1big{font-size:32px!important}}
`;

const ShinyText = ({text, color="#b5b5b5", shineColor="#ffffff", speed=2, spread=120, direction="left", disabled=false, className=""}) => {
  const animDuration = `${speed}s`;
  const gradAngle = direction==="left" ? "90deg" : "-90deg";
  const style = disabled ? {color} : {
    display:"inline-block",
    backgroundImage:`linear-gradient(${gradAngle}, ${color} 0%, ${color} calc(50% - ${spread/2}px), ${shineColor} 50%, ${color} calc(50% + ${spread/2}px), ${color} 100%)`,
    backgroundSize:"200% auto",
    WebkitBackgroundClip:"text",
    WebkitTextFillColor:"transparent",
    backgroundClip:"text",
    animation:`shiny-sweep ${animDuration} linear infinite`,
  };
  return <span className={`shiny-text ${className}`} style={style}>{text}</span>;
};

const fmtP = (p) => { if(!p) return "POA"; const n=Number(p); if(n>=10000000) return `₹${(n/10000000).toFixed(2)} Cr`; if(n>=100000) return `₹${(n/100000).toFixed(2)} L`; return `₹${n.toLocaleString("en-IN")}`; };
const simScore = (a="",b="") => { a=a.toLowerCase().trim(); b=b.toLowerCase().trim(); if(!a||!b) return 0; const sa=new Set(a.split(/\s+/)),sb=new Set(b.split(/\s+/)); return [...sa].filter(x=>sb.has(x)).length/Math.max(sa.size,sb.size); };
const findDups = (form, all, editId) => all.filter(l => {
  if(l.id===editId) return false;
  const ts=simScore(form.title,l.title), ls=simScore(form.location,l.location);
  const pm=form.price&&l.price&&Math.abs(Number(form.price)-Number(l.price))/Number(l.price)<0.1;
  const dm=form.bedrooms&&l.bedrooms&&String(form.bedrooms)===String(l.bedrooms)&&form.propertyType===l.propertyType;
  return (ts>0.6?2:0)+(ls>0.7?2:0)+(pm?1:0)+(dm?1:0)>=3;
});

const getVisitorId = () => {
  let id = localStorage.getItem('northing_visitor_id');
  if (!id) {
    id = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('northing_visitor_id', id);
  }
  return id;
};

const mapListing = (l) => !l ? null : ({
  id: l.id, agentId: l.agent_id, title: l.title, location: l.location,
  propertyType: l.property_type, listingType: l.listing_type,
  price: l.price, sizesqft: l.size_sqft, bedrooms: l.bedrooms, bathrooms: l.bathrooms,
  furnishingStatus: l.furnishing_status, status: l.status,
  description: l.description, highlights: l.highlights || [],
  agentName: l.agent_name, agentPhone: l.agent_phone, agentEmail: l.agent_email,
  agencyName: l.agency_name, photos: l.photos || [], createdAt: l.created_at,
  ...(l.details || {}),
  logoUrl: l.details?.logoUrl || null,
  agentAddress: l.details?.agentAddress || null,
  agentWebsite: l.details?.agentWebsite || null,
  viewCount: l.view_count||0,
  waCount: l.wa_count||0,
  pdfCount: l.pdf_count||0,
});

const formToDb = (form, agentId) => ({
  agent_id: agentId, title: form.title, location: form.location,
  property_type: form.propertyType, listing_type: form.listingType,
  price: Number(form.price) || 0, size_sqft: Number(form.sizesqft) || null,
  bedrooms: Number(form.bedrooms) || 0, bathrooms: Number(form.bathrooms) || 0,
  furnishing_status: form.furnishingStatus, status: form.status || "Active",
  description: form.description, highlights: form.highlights || [],
  agent_name: form.agentName, agent_phone: form.agentPhone,
  agent_email: form.agentEmail, agency_name: form.agencyName,
  photos: form.photos || [],
  details: { toilets:form.toilets, condition:form.condition, builtYear:form.builtYear,
    modernKitchen:form.modernKitchen, wcType:form.wcType, superBuiltUp:form.superBuiltUp,
    carpetArea:form.carpetArea, parkingType:form.parkingType, vastuDirection:form.vastuDirection,
    totalFloors:form.totalFloors, propertyFloor:form.propertyFloor, maintenance:form.maintenance,
    societyFormed:form.societyFormed, ocReceived:form.ocReceived,
    reraRegistered:form.reraRegistered, reraNumber:form.reraNumber,
    logoUrl:form.logoUrl||null, agentAddress:form.agentAddress||null, agentWebsite:form.agentWebsite||null }
});

const dbToForm = (l) => ({
  ...l.details, title:l.title, location:l.location, propertyType:l.property_type,
  listingType:l.listing_type, price:l.price, sizesqft:l.size_sqft,
  bedrooms:l.bedrooms, bathrooms:l.bathrooms, furnishingStatus:l.furnishing_status,
  status:l.status, description:l.description, highlights:l.highlights||[],
  agentName:l.agent_name, agentPhone:l.agent_phone, agentEmail:l.agent_email,
  agencyName:l.agency_name, photos:l.photos||[]
});

const uploadPhoto = async (file) => {
  const ext = file.name.split(".").pop().toLowerCase() || "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).substr(2,7)}.${ext}`;
  const { error } = await supabase.storage.from("property-photos").upload(name, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("property-photos").getPublicUrl(name);
  return data.publicUrl;
};

const _h = { openWA: ()=>{}, openPDF: ()=>{} };
const showWACard = (l) => _h.openWA(l);
const showPDF    = (l) => _h.openPDF(l);

const track = async (listingId, type, platform = 'web', brokerId = null) => {
  if (!listingId) return;
  const key = `tracked_${listingId}_${type}`;
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, '1');
  const visitorId = getVisitorId();
  await supabase.from('shareevents').insert({
    listing_id: listingId,
    broker_id: brokerId,
    visitor_id: visitorId,
    event_type: type,
    platform,
  });
  const col = type === 'pageview' ? 'view_count'
            : type === 'whatsappclick' ? 'wa_count'
            : type === 'brochuredownload' ? 'pdf_count'
            : null;
  if (col) await supabase.rpc('incrementcount', { rowid: listingId, colname: col });
};

const WALogo = ({size=16}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" style={{flexShrink:0}}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const Toast = ({msg,type,onClose}) => (
  <div className="asl" style={{position:"fixed",bottom:28,right:28,zIndex:9999,padding:"13px 18px",borderRadius:12,display:"flex",alignItems:"center",gap:10,maxWidth:340,fontSize:14,fontWeight:600,boxShadow:"0 8px 32px rgba(27,58,45,0.18)",background:type==="error"?"#FEF2F2":type==="success"?"#ECFDF5":"#EFF6FF",border:`1.5px solid ${type==="error"?"#FCA5A5":type==="success"?"#6EE7B7":"#BFDBFE"}`,color:type==="error"?"#DC2626":type==="success"?"#059669":"#1D4ED8"}}>
    <span>{type==="error"?"⚠️":type==="success"?"✅":"ℹ️"}</span>
    <span style={{flex:1}}>{msg}</span>
    <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,opacity:0.5}}>×</button>
  </div>
);

const ConfirmModal = ({message,onConfirm,onCancel}) => (
  <div className="afd" style={{position:"fixed",inset:0,background:"rgba(27,58,45,0.45)",zIndex:4000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
    <div className="card asl" style={{padding:28,maxWidth:360,width:"100%"}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{width:46,height:46,borderRadius:"50%",background:"#FEF2F2",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:22}}>🗑️</div>
        <h3 style={{fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:700,color:"var(--navy)",marginBottom:6}}>Delete Listing</h3>
        <p style={{fontSize:13,color:"var(--muted)"}}>{message}</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <button onClick={onCancel} className="btn-ghost" style={{padding:"10px",borderRadius:9,fontSize:14}}>Cancel</button>
        <button onClick={onConfirm} className="btn-danger" style={{padding:"10px",borderRadius:9,fontSize:14}}>Yes, Delete</button>
      </div>
    </div>
  </div>
);

const DupModal = ({dups,onProceed,onCancel}) => (
  <div className="afd" style={{position:"fixed",inset:0,background:"rgba(27,58,45,0.4)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
    <div className="card asl" style={{padding:32,maxWidth:500,width:"100%",boxShadow:"0 24px 80px rgba(27,58,45,0.2)"}}>
      <div style={{textAlign:"center",marginBottom:22}}>
        <div style={{width:52,height:52,borderRadius:"50%",background:"#FEF3C7",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:24}}>⚠️</div>
        <h2 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"var(--navy)",marginBottom:7}}>Possible Duplicate Detected</h2>
        <p style={{fontSize:14,color:"var(--muted)",lineHeight:1.6}}>We found {dups.length} similar listing{dups.length>1?"s":""} already on the platform. Please review before saving.</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:22,maxHeight:200,overflow:"auto"}}>
        {dups.map(d=>(
          <div key={d.id} className="card-flat" style={{padding:"12px 14px"}}>
            <div style={{fontSize:14,fontWeight:700,color:"var(--navy)",marginBottom:2}}>{d.title}</div>
            <div style={{fontSize:12,color:"var(--muted)"}}>📍 {d.location} · <strong style={{color:"var(--green)"}}>{fmtP(d.price)}</strong> · by {d.agentName}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <button onClick={onCancel} className="btn-ghost" style={{padding:"11px",borderRadius:10,fontSize:14}}>← Go Back</button>
        <button onClick={onProceed} className="btn-primary" style={{padding:"11px",borderRadius:10,fontSize:14}}>Save Anyway</button>
      </div>
    </div>
  </div>
);

const PropCard = ({listing,currentUser,savedIds,onSave}) => {
  const isSaved = savedIds?.includes(listing.id);
  const statusColor = listing.status==="Active"?"#059669":listing.status==="Rented"?"#D97706":"#7C3AED";
  const statusBg = listing.status==="Active"?"#ECFDF5":listing.status==="Rented"?"#FFFBEB":"#F5F3FF";
  return (
    <div className="card" style={{overflow:"hidden"}}>
      <div style={{height:195,position:"relative",background:"linear-gradient(135deg,#E8F5EE,#C2E8D4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {listing.photos?.[0] ? <img src={listing.photos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : <div style={{fontSize:48,opacity:0.4}}>🏠</div>}
        <div style={{position:"absolute",top:12,right:12,background:"white",borderRadius:50,padding:10,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:"1px solid var(--border)",transition:"all 0.2s"}} onClick={()=>onSave(listing.id,!isSaved)}>
          <span style={{fontSize:18}}>{isSaved?"❤️":"🤍"}</span>
        </div>
        <div style={{position:"absolute",bottom:12,left:12,background:statusBg,color:statusColor,padding:"4px 12px",borderRadius:16,fontSize:11,fontWeight:700}}>{listing.status}</div>
      </div>
      <div style={{padding:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div style={{flex:1}}>
            <h3 style={{fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:800,marginBottom:4,color:"var(--navy)"}}>{listing.title}</h3>
            <div style={{fontSize:13,color:"var(--muted)",marginBottom:8}}>📍 {listing.location}</div>
            <div style={{fontSize:20,fontWeight:900,color:"var(--primary)",fontFamily:"'Fraunces',serif",marginBottom:2}}>{fmtP(listing.price)}{listing.listingType==="Rent"&&<span style={{fontSize:12,color:"var(--muted)",fontWeight:400}}>/mo</span>}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
          {listing.bedrooms>0&&<span className="tag" style={{fontSize:11}}>{listing.bedrooms} Bed{listing.bedrooms>1?"s":""}</span>}
          {listing.bathrooms>0&&<span className="tag" style={{fontSize:11}}>{listing.bathrooms} Bath{listing.bathrooms>1?"s":""}</span>}
          {listing.listingType&&<span className="tag-navy badge" style={{fontSize:10}}>For {listing.listingType}</span>}
        </div>
        {listing.description&&<div style={{fontSize:12,color:"var(--muted)",lineHeight:1.5,marginBottom:12,maxHeight:40,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{listing.description}</div>}
        <div style={{display:"flex",gap:10,marginTop:4,flexWrap:"wrap"}}>
          {listing.agentPhone&&<a href={`https://wa.me/${listing.agentPhone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:7,background:"#25D366",color:"#fff",padding:"10px 16px",borderRadius:9,textDecoration:"none",fontWeight:700,fontSize:13}}><WALogo size={15}/>WhatsApp Agent</a>}
          <button onClick={()=>showWACard(listing)} style={{display:"inline-flex",alignItems:"center",gap:7,background:"#128C7E",color:"#fff",padding:"10px 16px",borderRadius:9,fontWeight:700,fontSize:13,border:"none",cursor:"pointer",fontFamily:"inherit"}}><WALogo size={15}/>Property Card</button>
          <button onClick={()=>showPDF(listing)} style={{display:"inline-flex",alignItems:"center",gap:7,background:"var(--navy)",color:"#fff",padding:"10px 16px",borderRadius:9,fontWeight:700,fontSize:13,border:"none",cursor:"pointer",fontFamily:"inherit"}}>📄 PDF Report</button>
        </div>
      </div>
    </div>
  );
};

const WACardModal = ({listing,onClose}) => {
  const [downloading,setDownloading]=useState(false);
  useEffect(()=>{if(listing?.id)track(listing.id,"whatsappclick");},[listing?.id]);
  if(!listing) return null;

  const loadH2C=()=>new Promise((res,rej)=>{
    if(window.html2canvas){res(window.html2canvas);return;}
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    s.onload=()=>res(window.html2canvas); s.onerror=rej;
    document.head.appendChild(s);
  });

  const captureCard=async()=>{
    const h2c=await loadH2C();
    const card=document.getElementById("wa-card");
    return h2c(card,{scale:3,useCORS:true,allowTaint:true,backgroundColor:null,logging:false});
  };

  const downloadImage=async()=>{
    setDownloading(true);
    try{
      const canvas=await captureCard();
      const a=document.createElement("a");
      a.download=`Northing-${(listing.title||"property").replace(/\s+/g,"-").toLowerCase()}.png`;
      a.href=canvas.toDataURL("image/png",0.95);
      a.click();
    }catch(e){alert("Download failed — try screenshotting the card manually.");}
    setDownloading(false);
  };

  const shareOnWA=async()=>{
    setDownloading(true);
    try{
      const canvas=await captureCard();
      canvas.toBlob(async(blob)=>{
        const file=new File([blob],"Northing-card.png",{type:"image/png"});
        if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
          await navigator.share({files:[file],title:listing.title,text:buildText()});
        } else {
          const a=document.createElement("a"); a.download="Northing-card.png";
          a.href=canvas.toDataURL(); a.click();
          setTimeout(()=>window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`,"_blank"),800);
        }
      },"image/png");
    }catch(e){alert("Share failed — try downloading the image instead.");}
    setDownloading(false);
  };

  const price=fmtP(listing.price);
  const details=[listing.bedrooms>0?`🛏 ${listing.bedrooms} Bed${listing.bedrooms>1?"s":""}`:null,listing.bathrooms>0?`🚿 ${listing.bathrooms} Bath${listing.bathrooms>1?"s":""}`:null,listing.sizesqft?`📐 ${listing.sizesqft} sqft`:null,listing.furnishingStatus?`🛋 ${listing.furnishingStatus}`:null].filter(Boolean);
  const highlights=(listing.highlights||[]).slice(0,3);

  const buildText=()=>{
    const lines=[];
    lines.push('*' + listing.title + '*');
    lines.push('Location: ' + listing.location);
    lines.push('');
    lines.push('Price: *' + price + '*' + (listing.listingType==='Rent' ? ' / month' : ''));
    lines.push('Type: For ' + listing.listingType);
    const dc=details.map(d=>d.replace(/[^\w\s.,:%\/\-]/g,'').trim()).filter(Boolean);
    if(dc.length>0) lines.push('Details: ' + dc.join(' | '));
    if(listing.description){lines.push('');lines.push(listing.description);}
    if(highlights.length>0){lines.push('');lines.push('Highlights:');highlights.forEach(h=>lines.push('  - '+h));}
    lines.push('');
    lines.push('Contact:');
    lines.push('  Agent: *' + (listing.agentName||'') + '*');
    if(listing.agentPhone) lines.push('  Phone: ' + listing.agentPhone);
    if(listing.agencyName) lines.push('  Agency: ' + listing.agencyName);
    lines.push('');
    lines.push('_Powered by Northing_');
    return lines.join('\n');
  };

  const hasAgentBrand = listing.agencyName || listing.logoUrl;

  return (
    <div className="afd" style={{position:"fixed",inset:0,background:"rgba(10,5,2,0.75)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div className="asl" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,maxHeight:"95vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>

        {/* THE CARD — FIXED 1080x1080 */}
        <div id="wa-card" style={{width:540,height:540,borderRadius:20,overflow:"hidden",boxShadow:"0 32px 80px rgba(0,0,0,0.7)",position:"relative",flexShrink:0,background:"#1a1410"}}>
          {/* Photo */}
          {listing.photos?.[0]
            ?<img src={listing.photos[0]} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
            :<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#2d2118,#1a1410)",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:120,opacity:0.08}}>🏠</div></div>
          }
          {/* Gradient overlay */}
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.18) 0%,rgba(0,0,0,0.05) 35%,rgba(10,5,2,0.92) 68%,rgba(10,5,2,1) 100%)"}}/>

          {/* Top badges */}
          <div style={{position:"absolute",top:20,left:20,right:20,display:"flex",gap:8,justifyContent:"space-between",alignItems:"flex-start",zIndex:10}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {listing.bedrooms>0&&<div style={{background:"rgba(255,107,0,0.9)",color:"#fff",padding:"8px 14px",borderRadius:8,fontSize:12,fontWeight:700,backdropFilter:"blur(12px)"}}>🛏 {listing.bedrooms}+</div>}
              {listing.listingType&&<div style={{background:"rgba(255,107,0,0.9)",color:"#fff",padding:"8px 14px",borderRadius:8,fontSize:12,fontWeight:700,backdropFilter:"blur(12px)"}}>For {listing.listingType}</div>}
            </div>
          </div>

          {/* Bottom content */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:24,background:"linear-gradient(to top,rgba(10,5,2,1) 0%,rgba(10,5,2,0.95) 60%,rgba(10,5,2,0) 100%)",zIndex:10}}>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:32,fontWeight:900,color:"var(--primary)",marginBottom:4}}>{price}</div>
            {listing.listingType==="Rent"&&<div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginBottom:12}}>per month</div>}
            <h2 style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:800,color:"#fff",marginBottom:4,lineHeight:1.1}}>{listing.title}</h2>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.7)"}}>📍 {listing.location}</div>
          </div>

          {/* Watermark — BROKER or NORTHING */}
          <div style={{position:"absolute",top:20,right:20,zIndex:10}}>
            {hasAgentBrand?(
              <div style={{background:"rgba(255,255,255,0.95)",borderRadius:12,padding:12,display:"flex",alignItems:"center",gap:10,backdropFilter:"blur(12px)"}}>
                {listing.logoUrl
                  ?<img src={listing.logoUrl} alt="logo" style={{width:40,height:40,objectFit:"contain",borderRadius:6}}/>
                  :<div style={{width:40,height:40,borderRadius:6,background:"var(--primary-light)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏢</div>
                }
                <div style={{fontSize:11,fontWeight:700,color:"var(--navy)"}}>
                  <div>{listing.agencyName||listing.agentName}</div>
                  {listing.agentPhone&&<div style={{fontSize:9,color:"var(--muted)",marginTop:2}}>📞 {listing.agentPhone}</div>}
                </div>
              </div>
            ):(
              <div style={{background:"rgba(255,255,255,0.95)",borderRadius:12,padding:12,display:"flex",alignItems:"center",gap:8,backdropFilter:"blur(12px)"}}>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:14,fontWeight:800,color:"var(--navy)"}}>Northing</div>
              </div>
            )}
          </div>
        </div>

        {/* BUTTONS */}
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <button onClick={downloadImage} disabled={downloading} className="btn-primary" style={{padding:"12px 24px",borderRadius:10,fontSize:14,fontWeight:700}}>
            {downloading?"⏳ Downloading…":"⬇️ Download Property Card"}
          </button>
          <button onClick={shareOnWA} disabled={downloading} style={{background:"#25D366",color:"#fff",border:"none",padding:"12px 24px",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 14px rgba(37,211,102,0.3)",transition:"all 0.2s",disabled:"disabled"}} className="btn-primary">
            {downloading?"⏳ Preparing…":"💬 Share on WhatsApp"}
          </button>
        </div>

        <button onClick={onClose} style={{marginTop:8,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.6)",padding:"8px 20px",borderRadius:8,fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Close</button>
      </div>
    </div>
  );
};

const PDFModal = ({listing,onClose}) => {
  const [downloading,setDownloading]=useState(false);
  useEffect(()=>{if(listing?.id)track(listing.id,"brochuredownload");},[listing?.id]);
  if(!listing) return null;

  const hasAgentBrand = listing.agencyName || listing.logoUrl;
  const td = new Date(listing.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const ref = `NTH-${listing.id?.toString().padStart(6, '0')}`;

  const fields = [
    ['Property Type', listing.propertyType],
    ['Listing Type', listing.listingType],
    ['Size', listing.sizesqft ? `${listing.sizesqft} sqft` : '-'],
    ['Bedrooms', listing.bedrooms || '-'],
    ['Bathrooms', listing.bathrooms || '-'],
    ['Furnishing', listing.furnishingStatus || '-'],
    ['Status', listing.status || 'Active'],
  ].filter(([k, v]) => v !== undefined && v !== null && v !== '');

  const loadHtml2Pdf=()=>new Promise((res,rej)=>{
    if(window.html2pdf){res(window.html2pdf);return;}
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    s.onload=()=>res(window.html2pdf); s.onerror=rej;
    document.head.appendChild(s);
  });

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const html2pdf = await loadHtml2Pdf();
      const element = document.getElementById('pdf-print-area');
      const opt = {
        margin: 0,
        filename: `Northing-${(listing.title || 'property').replace(/\s+/g, '-').toLowerCase()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      };
      html2pdf().set(opt).from(element).save();
    } catch (e) {
      alert('PDF download failed. Try again.');
    }
    setDownloading(false);
  };

  return (
    <div className="afd" style={{position:"fixed",inset:0,background:"rgba(10,5,2,0.75)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div className="asl" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,maxHeight:"95vh",overflowY:"auto",background:"white",borderRadius:20,maxWidth:800,width:"100%"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"20px 24px",borderBottom:"1px solid var(--border)"}}>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:800}}>Property Report</h2>
          <div style={{display:"flex",gap:8}}>
            <button onClick={downloadPDF} disabled={downloading} className="btn-primary" style={{padding:"8px 16px",borderRadius:8,fontSize:12}}>
              {downloading?"⏳":"📥"} {downloading?"Generating…":"Download PDF"}
            </button>
            <button onClick={onClose} style={{background:"#f4f4f4",border:"1px solid #ddd",color:"#666",padding:"8px 14px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>✕ Close</button>
          </div>
        </div>
        <div id="pdf-print-area" style={{padding:"36px 44px",fontFamily:"'Inter',sans-serif",color:"#1a1410"}}>
          {hasAgentBrand?(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,paddingBottom:20,borderBottom:"3px solid var(--primary)"}}>
              <div style={{display:"flex",alignItems:"center",gap:16}}>
                {listing.logoUrl
                  ?<img src={listing.logoUrl} alt="logo" style={{width:64,height:64,objectFit:"contain",borderRadius:10,border:"1px solid #eee"}}/>
                  :<div style={{width:64,height:64,borderRadius:10,background:"var(--primary-light)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,border:"1px solid var(--primary-mid)"}}>🏢</div>
                }
                <div>
                  <div style={{fontWeight:900,fontSize:22,color:"var(--navy)",letterSpacing:"-0.5px"}}>{listing.agencyName||listing.agentName}</div>
                  {listing.agentPhone&&<div style={{fontSize:13,color:"#666",marginTop:2}}>📞 {listing.agentPhone}</div>}
                  {listing.agentAddress&&<div style={{fontSize:12,color:"#666"}}>📍 {listing.agentAddress}</div>}
                  {listing.agentWebsite&&<div style={{fontSize:12,color:"var(--primary)"}}>{listing.agentWebsite}</div>}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,color:"#aaa"}}>{td}</div>
                <div style={{fontSize:11,color:"#aaa",marginTop:2}}>Ref: {ref}</div>
              </div>
            </div>
          ):(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,paddingBottom:20,borderBottom:"3px solid var(--primary)"}}>
              <div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:800,color:"var(--navy)"}}>Northing</div>
                <div style={{fontSize:10,color:"#888",letterSpacing:"1.5px",marginTop:2,textTransform:"uppercase"}}>Professional Property Marketing</div>
              </div>
              <div style={{textAlign:"right",fontSize:12,color:"#888"}}><div>{td}</div><div style={{marginTop:3}}>{ref}</div></div>
            </div>
          )}
          {/* PROPERTY INFO */}
          <h1 style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:900,margin:"0 0 4px",color:"var(--navy)",lineHeight:1.15}}>{listing.title}</h1>
          <div style={{color:"#888",fontSize:14,marginBottom:12}}>📍 {listing.location}</div>
          <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:6,flexWrap:"wrap"}}>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:34,fontWeight:900,color:"var(--primary)"}}>{fmtP(listing.price)}{listing.listingType==="Rent"&&<span style={{fontSize:15,fontWeight:400,color:"#888"}}>/month</span>}</div>
            <div style={{display:"inline-block",background:"var(--primary-light)",color:"var(--primary)",border:"1px solid var(--primary-mid)",borderRadius:20,padding:"3px 14px",fontSize:12,fontWeight:700}}>For {listing.listingType}</div>
          </div>

          {listing.description&&<div style={{background:"#fafafa",padding:16,borderRadius:10,fontSize:13,lineHeight:1.8,marginBottom:20,marginTop:14,border:"1px solid #eee",color:"#444"}}>{listing.description}</div>}

          {fields.length>0&&<div style={{marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--primary)",textTransform:"uppercase",letterSpacing:"1px",borderBottom:"1.5px solid var(--primary-mid)",paddingBottom:7,marginBottom:12}}>Property Details</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 40px"}}>
              {fields.map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f4f4f4",fontSize:13}}><span style={{color:"#888"}}>{k}</span><span style={{fontWeight:700,color:"var(--navy)"}}>{v}</span></div>)}
            </div>
          </div>}

          {listing.highlights?.length>0&&<div style={{marginBottom:24}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--primary)",textTransform:"uppercase",letterSpacing:"1px",borderBottom:"1.5px solid var(--primary-mid)",paddingBottom:7,marginBottom:12}}>Key Highlights</div>
            {listing.highlights.map((h,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:7,fontSize:13,alignItems:"flex-start"}}><span style={{color:"var(--primary)",fontWeight:700,flexShrink:0}}>✓</span>{h}</div>)}
          </div>}

          {listing.photos?.length>0&&(
            <div style={{marginBottom:24}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--primary)",textTransform:"uppercase",letterSpacing:"1px",borderBottom:"1.5px solid var(--primary-mid)",paddingBottom:7,marginBottom:14}}>Property Photos</div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {listing.photos.map((p,i)=>(
                  <div key={i} style={{position:"relative"}}>
                    <img src={p} alt={`Photo ${i+1}`} style={{width:"100%",height:320,objectFit:"cover",borderRadius:12,border:"1px solid #eee",display:"block"}}/>
                    {i===0&&<div style={{position:"absolute",top:10,left:10,background:"var(--primary)",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20}}>Cover Photo</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GOOGLE MAPS */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--primary)",textTransform:"uppercase",letterSpacing:"1px",borderBottom:"1.5px solid var(--primary-mid)",paddingBottom:7,marginBottom:14}}>Location Map</div>
            {listing.location?(
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(listing.location)}&zoom=15&size=640x220&scale=2&maptype=roadmap&markers=color:0xFF6B00|${encodeURIComponent(listing.location)}&key=AIzaSyARwh01nkBj8NE1Kca5l_eq2MtvaNmCIg4`}
                alt="Property location map"
                style={{width:"100%",height:220,objectFit:"cover",borderRadius:12,border:"1px solid #eee",display:"block"}}
                onError={e=>{e.target.style.display="none";if(e.target.nextSibling)e.target.nextSibling.style.display="flex";}}
              />
            ):null}
            <div style={{display:"none",width:"100%",height:120,background:"#f5f0ec",borderRadius:12,border:"1px dashed #ede5dc",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}>
              <div style={{fontSize:24}}>🗺️</div>
              <div style={{fontSize:12,color:"#aaa",fontWeight:600}}>Map not available</div>
            </div>
          </div>

          {/* FOOTER */}
          <div style={{borderTop:"2px solid #f0f0f0",paddingTop:16,marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:"var(--navy)"}}>{listing.agentName||""}</div>
              {listing.agentEmail&&<div style={{fontSize:12,color:"#888"}}>{listing.agentEmail}</div>}
              {listing.agentPhone&&<div style={{fontSize:12,color:"#888"}}>📞 {listing.agentPhone}</div>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:13,fontWeight:800,color:"#ccc"}}>Northing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const useSecretAdmin = (cb) => {
  const c = useRef(0);
  const t = useRef();
  return ()=>{c.current++;clearTimeout(t.current);t.current=setTimeout(()=>{c.current=0;},1500);if(c.current>=5){c.current=0;cb();}};
};

const SecretAdminModal = ({onLogin,onClose,showToast}) => {
  const [email,setEmail]=useState("");const [pass,setPass]=useState("");const [shake,setShake]=useState(false);const [loading,setLoading]=useState(false);
  const attempt=async()=>{
    setLoading(true);
    try {
      const {data,error}=await supabase.auth.signInWithPassword({email,password:pass});
      if(error) throw error;
      const {data:profile,error:pe}=await supabase.from("profiles").select("*").eq("id",data.user.id).single();
      if(pe||!profile) throw new Error("Profile not found");
      if(profile.role!=="master") throw new Error("Not authorised");
      onLogin({id:profile.id,name:profile.name,email:profile.email,role:profile.role,phone:profile.phone,agencyName:profile.agency_name,savedListings:[]});
      onClose();
    } catch(err){setShake(true);setTimeout(()=>setShake(false),500);showToast(err.message||"Invalid credentials","error");}
    setLoading(false);
  };
  return (
    <div className="afd" style={{position:"fixed",inset:0,background:"rgba(27,58,45,0.5)",zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}} onClick={onClose}>
      <div className={`card asl ${shake?"shk":""}`} style={{padding:"40px 36px",maxWidth:380,width:"100%",boxShadow:"0 32px 80px rgba(27,58,45,0.2)"}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:"var(--green-light)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:24,border:"2px solid var(--green-mid)"}}>🔐</div>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:21,fontWeight:700,color:"var(--navy)",marginBottom:5}}>Secure Access</h2>
          <p style={{fontSize:13,color:"var(--muted)"}}>Authorised personnel only</p>
        </div>
        <div style={{marginBottom:12}}><input className="inp" type="email" placeholder="Admin email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} /></div>
        <div style={{marginBottom:20}}><input className="inp" type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} /></div>
        <button onClick={attempt} disabled={loading} className="btn-primary" style={{width:"100%",padding:"13px",borderRadius:10,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{loading?<><span className="spin"/>Please wait…</>:"Access Platform →"}</button>
        <button onClick={onClose} style={{width:"100%",marginTop:8,background:"none",border:"none",color:"var(--muted)",fontSize:13,cursor:"pointer",padding:8}}>Cancel</button>
      </div>
    </div>
  );
};

const Home = ({currentUser,onNavigate}) => {
  const [listings,setListings]=useState([]);const [loading,setLoading]=useState(true);const [savedIds,setSavedIds]=useState([]);
  const [searchQ,setSearchQ]=useState("");const [listingTypeFilter,setListingTypeFilter]=useState("All");const [minPrice,setMinPrice]=useState("");const [maxPrice,setMaxPrice]=useState("");const [propertyTypeFilter,setPropertyTypeFilter]=useState("All");

  useEffect(()=>{
    (async()=>{
      try{
        const {data,error}=await supabase.from("listings").select("*").eq("status","Active").order("created_at",{ascending:false});
        if(error) throw error;
        setListings((data||[]).map(mapListing));
      }catch(e){console.error(e);}finally{setLoading(false);}
    })();
  },[]);

  const filteredListings = listings.filter(l => {
    const matchesSearch = !searchQ || l.title.toLowerCase().includes(searchQ.toLowerCase()) || l.location.toLowerCase().includes(searchQ.toLowerCase());
    const matchesListingType = listingTypeFilter === "All" || l.listingType === listingTypeFilter;
    const matchesPropertyType = propertyTypeFilter === "All" || l.propertyType === propertyTypeFilter;
    const price = Number(l.price);
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Infinity;
    const matchesPrice = price >= min && price <= max;
    return matchesSearch && matchesListingType && matchesPropertyType && matchesPrice;
  });

  const onSave = async (id, isSave) => {
    if (!currentUser) {
      onNavigate("login");
      return;
    }
    if (isSave) {
      await supabase.from("saved_listings").insert({ user_id: currentUser.id, listing_id: id });
      setSavedIds(s => [...s, id]);
    } else {
      await supabase.from("saved_listings").delete().eq("user_id", currentUser.id).eq("listing_id", id);
      setSavedIds(s => s.filter(x => x !== id));
    }
  };

  return (
    <div style={{minHeight:"100vh",background:"var(--cream)",paddingTop:20}}>
      {/* Hero */}
      <div style={{background:"var(--navy)",color:"#fff",padding:"60px 32px",textAlign:"center",marginBottom:40}}>
        <h1 style={{fontFamily:"'Fraunces',serif",fontSize:48,fontWeight:800,marginBottom:12}}>Find Your Perfect Home</h1>
        <p style={{fontSize:16,color:"rgba(255,255,255,0.7)",maxWidth:500,margin:"0 auto"}}>Browse verified listings, download brochures, and connect with agents instantly.</p>
      </div>

      {/* SEARCH BOX — FIXED */}
      <div style={{maxWidth:1200,margin:"0 auto",padding:"0 32px",marginBottom:40}}>
        <div style={{background:"white",borderRadius:16,padding:24,boxShadow:"0 4px 20px rgba(0,0,0,0.08)",border:"1px solid var(--border)"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:16,marginBottom:16}}>
            {/* Search */}
            <input
              type="text"
              placeholder="Search by location or property..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="inp"
              style={{gridColumn:"1 / -1"}}
            />

            {/* Listing Type Dropdown — RENT / BUY / SELL */}
            <select value={listingTypeFilter} onChange={(e) => setListingTypeFilter(e.target.value)} className="inp">
              <option value="All">All Types</option>
              <option value="Rent">Rent</option>
              <option value="Buy">Buy</option>
              <option value="Sell">Sell</option>
            </select>

            {/* Property Type Dropdown */}
            <select value={propertyTypeFilter} onChange={(e) => setPropertyTypeFilter(e.target.value)} className="inp">
              <option value="All">All Properties</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Commercial">Commercial</option>
              <option value="Land">Land</option>
            </select>

            {/* Min Price — FIXED */}
            <input
              type="number"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="inp"
            />

            {/* Max Price — FIXED */}
            <input
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="inp"
            />
          </div>
          <div style={{fontSize:13,color:"var(--muted)"}}>
            {filteredListings.length} property{filteredListings.length!==1?"ies":""} found
          </div>
        </div>
      </div>

      {/* LISTINGS GRID */}
      <div style={{maxWidth:1200,margin:"0 auto",padding:"0 32px 60px"}}>
        {loading?(
          <div style={{textAlign:"center",padding:"60px 20px"}}>
            <div className="spin" style={{margin:"0 auto 16px"}}/>
            <p style={{color:"var(--muted)"}}>Loading properties...</p>
          </div>
        ):filteredListings.length===0?(
          <div style={{textAlign:"center",padding:"60px 20px",background:"var(--gray)",borderRadius:16}}>
            <div style={{fontSize:48,marginBottom:12}}>🔍</div>
            <h3 style={{fontSize:18,fontWeight:700,color:"var(--navy)",marginBottom:6}}>No properties found</h3>
            <p style={{color:"var(--muted)"}}>Try adjusting your search filters.</p>
          </div>
        ):(
          <div className="gr" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:24}}>
            {filteredListings.map(l=><PropCard key={l.id} listing={l} currentUser={currentUser} savedIds={savedIds} onSave={onSave}/>)}
          </div>
        )}
      </div>
    </div>
  );
};

const Feed = ({currentUser,showToast,onNavigate}) => {
  return <div style={{minHeight:"100vh",padding:40,textAlign:"center"}}>📰 Feed coming soon</div>;
};

const LoginPage = ({onLogin,showToast,onNavigate}) => {
  const [mode,setMode]=useState("login");const [role,setRole]=useState("user");
  const [form,setForm]=useState({name:"",email:"",password:"",phone:"",agencyName:""});const [loading,setLoading]=useState(false);
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=async()=>{
    if(!form.email||!form.password){showToast("Email and password required","error");return;}
    setLoading(true);
    try{
      if(mode==="login"){
        const {data,error}=await supabase.auth.signInWithPassword({email:form.email,password:form.password});
        if(error) throw error;
        const {data:profile,error:pe}=await supabase.from("profiles").select("*").eq("id",data.user.id).single();
        if(pe||!profile) throw new Error("Profile not found. Contact support.");
        const savedRes=await supabase.from("saved_listings").select("listing_id").eq("user_id",data.user.id);
        const savedIds=(savedRes.data||[]).map(r=>r.listing_id);
        showToast(`Welcome back, ${profile.name}!`,"success");
        onLogin({id:profile.id,name:profile.name,email:profile.email,role:profile.role,phone:profile.phone,agencyName:profile.agency_name,logoUrl:profile.logo_url||null,agentAddress:profile.address||null,agentWebsite:profile.website||null,savedListings:savedIds});
      } else {
        if(!form.name){showToast("Name is required","error");setLoading(false);return;}
        if(form.password.length<6){showToast("Password must be at least 6 characters","error");setLoading(false);return;}
        const {data,error}=await supabase.auth.signUp({email:form.email,password:form.password});
        if(error) throw error;
        const {error:pe}=await supabase.from("profiles").insert({id:data.user.id,name:form.name,email:form.email,role,phone:form.phone||null,agency_name:form.agencyName||null});
        if(pe) throw pe;
        showToast("Account created! You can now sign in.","success");
        setMode("login");setForm(f=>({...f,password:""}));
      }
    }catch(err){showToast(err.message||"Something went wrong","error");}
    setLoading(false);
  };
  const roles=[
    {id:"user",icon:"🔍",label:"Buyer",desc:"Browse & save properties"},
    {id:"seller",icon:"🏠",label:"Individual Seller",desc:"List up to 2 properties"},
    {id:"agent",icon:"🏢",label:"Agent / Firm",desc:"Unlimited listings + white-label"},
  ];
  return (
    <div style={{minHeight:"100vh",background:"var(--cream)",display:"flex"}}>
      <div className="hm" style={{width:"45%",background:"var(--navy)",padding:"60px 48px",display:"flex",flexDirection:"column",justifyContent:"space-between",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-60,right:-60,width:300,height:300,borderRadius:"50%",background:"rgba(255,107,0,0.12)"}}/>
        <div style={{position:"absolute",bottom:-80,left:-40,width:250,height:250,borderRadius:"50%",background:"rgba(255,107,0,0.08)"}}/>
        <div style={{position:"relative"}}><div style={{fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:28,color:"#fff",marginBottom:4}}>Northing</div><div style={{fontSize:13,color:"rgba(255,255,255,0.45)",letterSpacing:"1.5px",textTransform:"uppercase"}}>Professional Property Marketing</div></div>
        <div style={{position:"relative"}}>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:34,fontWeight:700,color:"#fff",lineHeight:1.25,marginBottom:16}}>Buy, Sell, or Rent — all in one place.</h2>
          <p style={{fontSize:14,color:"rgba(255,255,255,0.5)",lineHeight:1.75}}>Instant brochures, WhatsApp cards, and verified listings — built for Indian real estate.</p>
          <div style={{marginTop:36,display:"flex",flexDirection:"column",gap:12}}>
            {[["🔍","Buyers","Browse verified listings and download reports"],["🏠","Sellers","List your property and reach thousands"],["🏢","Agents","White-label brochures and full firm profile"]].map(([icon,title,desc])=>(
              <div key={title} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <span style={{fontSize:20}}>{icon}</span>
                <div><div style={{fontWeight:700,fontSize:14,color:"#fff"}}>{title}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>{desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:32,overflowY:"auto"}}>
        <div style={{maxWidth:440,width:"100%"}}>
          <div style={{marginBottom:16}}>
            <button onClick={()=>onNavigate&&onNavigate("home")} style={{background:"none",border:"none",color:"var(--muted)",fontSize:13,cursor:"pointer",padding:"4px 0",display:"flex",alignItems:"center",gap:6,fontFamily:"inherit",fontWeight:600}}>← Back to Home</button>
          </div>
          <div style={{marginBottom:28}}>
            <h1 style={{fontFamily:"'Fraunces',serif",fontSize:32,fontWeight:800,color:"var(--navy)",marginBottom:8}}>{mode==="login"?"Welcome Back":"Create Account"}</h1>
            <p style={{fontSize:14,color:"var(--muted)"}}>Let's get you set up.</p>
          </div>
          {mode==="signup"&&<div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:12,fontWeight:700,color:"var(--primary)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.5px"}}>Account Type</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {roles.map(r=>(
                <div key={r.id} onClick={()=>setRole(r.id)} style={{padding:12,borderRadius:10,border:`2px solid ${role===r.id?"var(--primary)":"var(--border)"}`,background:role===r.id?"rgba(255,107,0,0.06)":"white",cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}>
                  <div style={{fontSize:24,marginBottom:6}}>{r.icon}</div>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--navy)",marginBottom:2}}>{r.label}</div>
                  <div style={{fontSize:10,color:"var(--muted)"}}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>}
          {mode==="signup"&&<div style={{marginBottom:12}}><label style={{display:"block",fontSize:12,fontWeight:700,color:"var(--muted)",marginBottom:6}}>Name</label><input className="inp" type="text" placeholder="Full name" value={form.name} onChange={e=>setF("name",e.target.value)}/></div>}
          <div style={{marginBottom:12}}><label style={{display:"block",fontSize:12,fontWeight:700,color:"var(--muted)",marginBottom:6}}>Email</label><input className="inp" type="email" placeholder="your@email.com" value={form.email} onChange={e=>setF("email",e.target.value)}/></div>
          <div style={{marginBottom:12}}><label style={{display:"block",fontSize:12,fontWeight:700,color:"var(--muted)",marginBottom:6}}>Password</label><input className="inp" type="password" placeholder="••••••••" value={form.password} onChange={e=>setF("password",e.target.value)}/></div>
          {mode==="signup"&&<div style={{marginBottom:12}}><label style={{display:"block",fontSize:12,fontWeight:700,color:"var(--muted)",marginBottom:6}}>Phone (optional)</label><input className="inp" type="tel" placeholder="10-digit mobile" value={form.phone} onChange={e=>setF("phone",e.target.value)}/></div>}
          {mode==="signup"&&role!=="user"&&<div style={{marginBottom:20}}><label style={{display:"block",fontSize:12,fontWeight:700,color:"var(--muted)",marginBottom:6}}>Agency Name (optional)</label><input className="inp" type="text" placeholder="Your agency" value={form.agencyName} onChange={e=>setF("agencyName",e.target.value)}/></div>}
          <button onClick={submit} disabled={loading} className="btn-primary" style={{width:"100%",padding:"13px",borderRadius:10,fontSize:15,marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{loading?<><span className="spin"/>Please wait…</>:mode==="login"?"Sign In →":"Create Account →"}</button>
          <button onClick={()=>setMode(mode==="login"?"signup":"login")} style={{width:"100%",background:"none",border:"none",color:"var(--primary)",fontSize:13,cursor:"pointer",padding:8,fontFamily:"inherit",fontWeight:600}}>{mode==="login"?"Need an account? Sign up":"Already have an account? Sign in"}</button>
        </div>
      </div>
    </div>
  );
};

const AgentPage = ({agentId,onNavigate,currentUser}) => {
  return <div style={{minHeight:"100vh",padding:40,textAlign:"center"}}>🏢 Agent profile coming soon</div>;
};

const AgentDash = ({currentUser,showToast}) => {
  return <div style={{minHeight:"100vh",padding:40}}>📊 Agent dashboard</div>;
};

const UserDash = ({currentUser,showToast}) => {
  return <div style={{minHeight:"100vh",padding:40}}>📌 Saved listings</div>;
};

const MasterDash = ({showToast}) => {
  return <div style={{minHeight:"100vh",padding:40}}>🔐 Admin control panel</div>;
};

const Nav = ({currentUser,page,onNavigate,onLogout,onSecretClick}) => {
  return (
    <nav style={{background:"white",borderBottom:"1px solid var(--border)",padding:"16px 32px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
      <div onClick={()=>onNavigate("home")} style={{cursor:"pointer",fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:800,color:"var(--navy)"}} onDoubleClick={onSecretClick}>Northing</div>
      <div style={{display:"flex",gap:16,alignItems:"center"}}>
        {currentUser?<>
          <button onClick={()=>onNavigate("dashboard")} className="hm" style={{padding:"7px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer",background:"transparent",color:"var(--muted)",border:"none"}}>{currentUser.role==="master"?"Control":currentUser.role==="agent"?"Listings":currentUser.role==="seller"?"My Properties":"Account"}</button>
          <div style={{display:"flex",alignItems:"center",gap:8,background:"var(--gray)",borderRadius:24,padding:"5px 12px 5px 5px",border:"1px solid var(--border)",cursor:"pointer"}} onClick={()=>onNavigate("dashboard")}>
            <div style={{width:28,height:28,borderRadius:"50%",background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:800}}>{currentUser.name?.charAt(0)}</div>
            <span style={{fontSize:12,fontWeight:600,color:"var(--text)"}} className="hm">{currentUser.name?.split(" ")[0]}</span>
          </div>
          <button onClick={onLogout} style={{padding:"7px 13px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer",background:"var(--gray)",color:"var(--muted)",border:"1px solid var(--border)",transition:"all 0.2s"}}>Sign Out</button>
        </>:<>
          <button onClick={()=>onNavigate("login")} style={{padding:"7px 16px",borderRadius:9,fontWeight:600,fontSize:13,cursor:"pointer",background:"transparent",color:"var(--primary)",border:"none"}}>Log In</button>
          <button onClick={()=>onNavigate("login")} className="btn-primary" style={{padding:"9px 20px",borderRadius:9,fontSize:13}}>Sign Up →</button>
        </>}
      </div>
    </nav>
  );
};

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { crashed: false, error: null }; }
  static getDerivedStateFromError(error) { return { crashed: true, error }; }
  componentDidCatch(error, info) { console.error("Northing crash:", error, info); }
  render() {
    if (this.state.crashed) {
      return (
        <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#fff8f4",fontFamily:"'Inter',sans-serif",padding:24}}>
          <div style={{textAlign:"center",maxWidth:420}}>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:800,color:"#1a1410",marginBottom:8}}>Northing</div>
            <div style={{fontSize:40,marginBottom:16}}>⚠️</div>
            <h2 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"#1a1410",marginBottom:8}}>Something went wrong</h2>
            <p style={{fontSize:14,color:"#78716c",marginBottom:24,lineHeight:1.6}}>The app encountered an unexpected error. Your data is safe — just reload to continue.</p>
            <button onClick={()=>window.location.reload()} style={{background:"#FF6B00",color:"#fff",border:"none",padding:"12px 28px",borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>↺ Reload App</button>
            {this.state.error && <details style={{marginTop:20,textAlign:"left",fontSize:11,color:"#aaa",background:"#f5f0ec",padding:12,borderRadius:8,wordBreak:"break-all"}}><summary style={{cursor:"pointer",marginBottom:6}}>Error details</summary>{this.state.error.toString()}</details>}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [page,setPage]=useState("home");
  const [agentPageId,setAgentPageId]=useState(null);
  const [user,setUser]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [toast,setToast]=useState(null);
  const [adminModal,setAdminModal]=useState(false);
  const [waListing,setWAListing]=useState(null);
  const [pdfListing,setPDFListing]=useState(null);

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const agentParam=params.get("agent");
    if(agentParam){setAgentPageId(agentParam);setPage("agentpage");}
    supabase.auth.getSession().then(async({data:{session}})=>{
      if(session){
        const {data:profile}=await supabase.from("profiles").select("*").eq("id",session.user.id).single();
        if(profile){
          const savedRes=await supabase.from("saved_listings").select("listing_id").eq("user_id",profile.id);
          const savedIds=(savedRes.data||[]).map(r=>r.listing_id);
          setUser({id:profile.id,name:profile.name,email:profile.email,role:profile.role,phone:profile.phone,agencyName:profile.agency_name,logoUrl:profile.logo_url||null,agentAddress:profile.address||null,agentWebsite:profile.website||null,savedListings:savedIds});
        }
      }
      setAuthLoading(false);
    }).catch(()=>setAuthLoading(false));
    _h.openWA=(l)=>setWAListing(l);
    _h.openPDF=(l)=>setPDFListing(l);
  },[]);

  const showToast=(msg,type="info")=>{setToast({msg,type});setTimeout(()=>setToast(null),3500);};
  const nav=(p)=>{setPage(p);window.scrollTo(0,0);};
  const login=(u)=>{setUser(u);nav("dashboard");};
  const logout=async()=>{await supabase.auth.signOut();setUser(null);nav("home");showToast("Signed out successfully","success");};
  const secretTrigger=useSecretAdmin(()=>{if(!user||user.role!=="master") setAdminModal(true);});

  if(authLoading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--cream)",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{G}</style>
      <div style={{textAlign:"center"}}><div style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:800,color:"var(--navy)",marginBottom:12}}>Northing</div><div style={{width:28,height:28,border:"3px solid var(--border)",borderTopColor:"var(--green)",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}></div></div>
    </div>
  );

  return (
    <ErrorBoundary>
    <div style={{minHeight:"100vh",background:"var(--cream)",color:"var(--text)"}}>
      <style>{G}</style>
      {page!=="login"&&<Nav currentUser={user} page={page} onNavigate={nav} onLogout={logout} onSecretClick={secretTrigger}/>}
      {page==="home"&&<Home currentUser={user} onNavigate={nav}/>}
      {page==="feed"&&<Feed currentUser={user} showToast={showToast} onNavigate={nav}/>}
      {page==="login"&&<LoginPage onLogin={login} showToast={showToast} onNavigate={nav}/>}
      {page==="agentpage"&&agentPageId&&<AgentPage agentId={agentPageId} onNavigate={nav} currentUser={user}/>}
      {page==="dashboard"&&user?.role==="agent"&&<AgentDash currentUser={user} showToast={showToast}/>}
      {page==="dashboard"&&user?.role==="seller"&&<AgentDash currentUser={user} showToast={showToast}/>}
      {page==="dashboard"&&user?.role==="user"&&<UserDash currentUser={user} showToast={showToast}/>}
      {page==="dashboard"&&user?.role==="master"&&<MasterDash showToast={showToast}/>}
      {page==="dashboard"&&!user&&<LoginPage onLogin={login} showToast={showToast} onNavigate={nav}/>}
      {adminModal&&<SecretAdminModal onLogin={login} onClose={()=>setAdminModal(false)} showToast={showToast}/>}
      {waListing&&<WACardModal listing={waListing} onClose={()=>setWAListing(null)}/>}
      {pdfListing&&<PDFModal listing={pdfListing} onClose={()=>setPDFListing(null)}/>}
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
    </ErrorBoundary>
  );
}
