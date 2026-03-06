import { useEffect, useMemo, useState } from "react";
import { LEAD_STAGES } from "./brokerData";

const emptyLead = { name:"", phone:"", requirement:"", budget:"", locality:"", stage:"New", notes:"", follow_up_at:"" };

const LeadsModule = ({ supabase, brokerId, showToast }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyLead);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("leads").select("*").eq("broker_id", brokerId).order("created_at", { ascending: false });
    if (error) showToast(`Could not load leads: ${error.message}`, "error");
    else setLeads(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [brokerId]);

  const grouped = useMemo(() => LEAD_STAGES.reduce((acc, s) => ({ ...acc, [s]: leads.filter((l) => (l.stage || "New") === s) }), {}), [leads]);
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const createLead = async () => {
    if (!form.name || !form.phone) return showToast("Name and phone are required", "error");
    const payload = { ...form, broker_id: brokerId, budget: Number(form.budget) || null };
    const { data, error } = await supabase.from("leads").insert(payload).select("*").single();
    if (error) return showToast(`Lead create failed: ${error.message}`, "error");
    setLeads((l) => [data, ...l]);
    setForm(emptyLead);
    showToast("Lead added", "success");
  };

  const moveLead = async (lead, stage) => {
    const { error } = await supabase.from("leads").update({ stage }).eq("id", lead.id);
    if (error) return showToast("Stage update failed", "error");
    setLeads((all) => all.map((l) => (l.id === lead.id ? { ...l, stage } : l)));
  };

  return (
    <div style={{display:"grid",gap:14}}>
      <div className="card" style={{padding:16}}>
        <h3 style={{fontSize:14,marginBottom:12}}>Add Lead</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}} className="gr">
          {[["name","Name"],["phone","Phone"],["requirement","Requirement"],["locality","Locality"],["budget","Budget"],["follow_up_at","Follow-up"]].map(([k,l])=>(
            <input key={k} className="inp" placeholder={l} type={k==="follow_up_at"?"datetime-local":k==="budget"?"number":"text"} value={form[k]||""} onChange={e=>setF(k,e.target.value)} />
          ))}
        </div>
        <textarea className="inp" placeholder="Notes" value={form.notes||""} onChange={e=>setF("notes",e.target.value)} style={{marginTop:10,minHeight:70}} />
        <button className="btn-primary" onClick={createLead} style={{marginTop:10,padding:"10px 14px",borderRadius:10}}>Create Lead</button>
      </div>
      {loading ? <div style={{color:"var(--muted)"}}>Loading leads…</div> : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10}} className="gr3">
          {LEAD_STAGES.map((stage)=>(
            <div key={stage} className="card" style={{padding:10}}>
              <div style={{fontSize:12,fontWeight:800,marginBottom:8}}>{stage} · {grouped[stage]?.length||0}</div>
              <div style={{display:"grid",gap:8}}>
                {(grouped[stage]||[]).map((lead)=>(
                  <div key={lead.id} className="card-flat" style={{padding:10}}>
                    <div style={{fontWeight:700,fontSize:13}}>{lead.name}</div>
                    <div style={{fontSize:12,color:"var(--muted)",marginBottom:6}}>{lead.phone} · {lead.locality||"Any locality"}</div>
                    <div style={{fontSize:12,color:"var(--muted)",marginBottom:6}}>{lead.requirement||""} {lead.budget?`· ₹${Number(lead.budget).toLocaleString("en-IN")}`:""}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                      <a href={`tel:${lead.phone}`} className="btn-ghost" style={{padding:"5px 8px",borderRadius:7,fontSize:11,textDecoration:"none"}}>📞 Call</a>
                      <a href={`https://wa.me/${String(lead.phone||"").replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{padding:"5px 8px",borderRadius:7,fontSize:11,textDecoration:"none",background:"#25D366",color:"#fff"}}>WhatsApp</a>
                    </div>
                    <select className="inp" value={lead.stage||"New"} onChange={(e)=>moveLead(lead,e.target.value)} style={{fontSize:12,padding:"7px 8px"}}>
                      {LEAD_STAGES.map((s)=><option key={s} value={s}>{s}</option>)}
                    </select>
                    {lead.follow_up_at && <div style={{marginTop:6,fontSize:11,color:"#B45309"}}>⏰ Follow-up: {new Date(lead.follow_up_at).toLocaleString()}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadsModule;
