import { BROKER_TABS } from "./brokerData";

const BrokerBottomTabs = ({ tab, setTab }) => (
  <div style={{position:"sticky",bottom:10,zIndex:30,background:"#fff",border:"1px solid var(--border)",borderRadius:14,padding:6,display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4,boxShadow:"0 8px 22px rgba(0,0,0,0.08)"}}>
    {BROKER_TABS.map(([key, icon, label]) => (
      <button key={key} onClick={() => setTab(key)} style={{border:"none",cursor:"pointer",background:tab===key?"var(--primary-light)":"transparent",color:tab===key?"var(--primary)":"var(--muted)",padding:"7px 2px",borderRadius:10,fontSize:11,fontWeight:700,fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
        <span style={{fontSize:15}}>{icon}</span>
        <span>{label}</span>
      </button>
    ))}
  </div>
);

export default BrokerBottomTabs;
