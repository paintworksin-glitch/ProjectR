import { useEffect, useState } from "react";

const DocsModule = ({ supabase, brokerId, listings = [], leads = [], showToast }) => {
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [linkType, setLinkType] = useState("listing");
  const [linkId, setLinkId] = useState("");

  const load = async () => {
    const { data, error } = await supabase.from("broker_documents").select("*").eq("broker_id", brokerId).order("created_at", { ascending: false });
    if (error) showToast(`Docs load failed: ${error.message}`, "error");
    else setDocs(data || []);
  };
  useEffect(() => { load(); }, [brokerId]);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/(pdf|image)/.test(file.type)) return showToast("Only PDF/images allowed", "error");
    setUploading(true);
    const path = `${brokerId}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error: upErr } = await supabase.storage.from("broker-docs").upload(path, file, { upsert: false, contentType: file.type });
    if (upErr) { setUploading(false); return showToast(upErr.message, "error"); }
    const { data: pub } = supabase.storage.from("broker-docs").getPublicUrl(path);
    const row = { broker_id: brokerId, file_name: file.name, file_url: pub.publicUrl, file_type: file.type, link_type: linkType, link_id: linkId || null };
    const { data, error } = await supabase.from("broker_documents").insert(row).select("*").single();
    if (error) showToast(error.message, "error");
    else setDocs((d) => [data, ...d]);
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div className="card" style={{padding:16}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
        <select className="inp" style={{maxWidth:140}} value={linkType} onChange={e=>setLinkType(e.target.value)}><option value="listing">Listing</option><option value="lead">Lead</option></select>
        <select className="inp" style={{maxWidth:220}} value={linkId} onChange={e=>setLinkId(e.target.value)}>
          <option value="">Unlinked</option>
          {(linkType==="listing"?listings:leads).map((x)=><option key={x.id} value={x.id}>{x.title || x.name}</option>)}
        </select>
        <label className="btn-primary" style={{padding:"10px 14px",borderRadius:10,cursor:"pointer"}}>{uploading?"Uploading...":"Upload Doc"}<input type="file" accept=".pdf,image/*" onChange={upload} style={{display:"none"}}/></label>
      </div>
      <div style={{display:"grid",gap:8}}>
        {docs.map((d)=><a key={d.id} href={d.file_url} target="_blank" rel="noreferrer" className="card-flat" style={{padding:10,textDecoration:"none",color:"inherit"}}><div style={{fontWeight:700,fontSize:13}}>{d.file_name}</div><div style={{fontSize:12,color:"var(--muted)"}}>{d.link_type || "general"}</div></a>)}
        {!docs.length && <div style={{fontSize:13,color:"var(--muted)"}}>No documents uploaded yet.</div>}
      </div>
    </div>
  );
};

export default DocsModule;
