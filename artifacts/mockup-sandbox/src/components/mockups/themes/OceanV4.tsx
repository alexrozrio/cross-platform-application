function Board({ accent }: { accent: string }) {
  const sample = "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(9,1fr)",gap:2,background:`${accent}28`,padding:3,borderRadius:12}}>
      {Array(81).fill(null).map((_,i)=>{
        const val=sample[i];const isGiven=val!=="0";
        const col=i%9;const row=Math.floor(i/9);
        const isSel=i===13;const isRel=!isSel&&(Math.floor(i/9)===1||i%9===4);
        const isThickR=(col===2||col===5)&&col!==8;const isThickB=(row===2||row===5)&&row!==8;
        return <div key={i} style={{
          background:isSel?`linear-gradient(135deg,${accent},#34D399)`:isRel?`${accent}18`:isGiven?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.05)",
          aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:10,fontWeight:isGiven?800:500,
          color:isSel?"#0A1A12":isGiven?"rgba(167,243,208,0.95)":"rgba(255,255,255,0.3)",
          borderRadius:4,
          borderRight:isThickR?`2px solid ${accent}40`:"none",
          borderBottom:isThickB?`2px solid ${accent}40`:"none",
        }}>{val!=="0"?val:""}</div>;
      })}
    </div>
  );
}

export function OceanV4() {
  const accent = "#34D399";
  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg, #022C22 0%, #064E3B 25%, #065F46 50%, #047857 70%, #6EE7B7 100%)",
      fontFamily:"'Outfit','Inter',sans-serif",
      display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",
    }}>
      {/* Aurora ribbons */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:200,background:"linear-gradient(180deg,rgba(110,231,183,0.12) 0%,transparent 100%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:60,left:-100,right:-100,height:60,background:"rgba(52,211,153,0.08)",filter:"blur(30px)",transform:"rotate(-3deg)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:110,left:-100,right:-100,height:40,background:"rgba(16,185,129,0.06)",filter:"blur(25px)",transform:"rotate(2deg)",pointerEvents:"none"}}/>

      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:24}}>🌌</div>
          <div>
            <div style={{color:"#fff",fontWeight:900,fontSize:18,letterSpacing:-0.5}}>SudokuFun</div>
            <div style={{color:"#6EE7B7",fontSize:11,fontWeight:600}}>Aurora Borealis</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <div style={{background:"linear-gradient(135deg,#34D399,#059669)",borderRadius:20,padding:"5px 12px",fontSize:13,fontWeight:800,color:"#fff"}}>💎 42</div>
          <div style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(52,211,153,0.25)",borderRadius:20,padding:"5px 10px",fontSize:16}}>👤</div>
        </div>
      </div>

      <div style={{flex:1,padding:"12px 16px 20px",overflowY:"auto",position:"relative",zIndex:1}}>
        <div style={{marginBottom:20}}>
          <h1 style={{margin:0,fontSize:26,fontWeight:900,background:"linear-gradient(90deg,#D1FAE5,#6EE7B7,#34D399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:-1}}>Dive In! 🌠</h1>
          <p style={{color:"rgba(110,231,183,0.65)",margin:"4px 0 0",fontSize:13}}>Northern lights are calling</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
          {[
            {size:"3×3",label:"Cadet",emoji:"🌱",from:"#34D399",to:"#059669"},
            {size:"4×4",label:"Scout",emoji:"🍀",from:"#059669",to:"#047857"},
            {size:"9×9",label:"Pilot",emoji:"🌿",from:"#047857",to:"#065F46"},
            {size:"16×16",label:"Legend",emoji:"🌟",from:"#6EE7B7",to:"#34D399"},
          ].map(({size,label,emoji,from,to})=>(
            <div key={size} style={{background:`linear-gradient(135deg,${from},${to})`,borderRadius:20,padding:"18px 14px",textAlign:"center",boxShadow:`0 4px 20px ${from}55`,border:"1px solid rgba(255,255,255,0.1)"}}>
              <div style={{fontSize:30,marginBottom:6}}>{emoji}</div>
              <div style={{color:label==="Cadet"||label==="Legend"?"#022C22":"#fff",fontSize:20,fontWeight:900,lineHeight:1}}>{size}</div>
              <div style={{color:label==="Cadet"||label==="Legend"?"rgba(2,44,34,0.8)":"rgba(255,255,255,0.8)",fontSize:11,fontWeight:700,marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{background:"rgba(52,211,153,0.07)",backdropFilter:"blur(12px)",borderRadius:20,padding:16,marginBottom:16,border:"1px solid rgba(52,211,153,0.2)"}}>
          <div style={{color:"#6EE7B7",fontSize:12,fontWeight:800,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>🎯 Current Mission — 9×9 Easy</div>
          <Board accent={accent} />
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:16}}>
          {[{icon:"✏️",label:"Notes",c:"#6EE7B7"},{icon:"⚠️",label:"3 left",c:"#F87171"},{icon:"💡",label:"2 left",c:"#FCD34D"},{icon:"⌫",label:"Erase",c:"#34D399"}].map(({icon,label,c})=>(
            <div key={label} style={{background:"rgba(255,255,255,0.05)",borderRadius:16,padding:"12px 8px",textAlign:"center",border:`1.5px solid ${c}44`}}>
              <div style={{fontSize:18}}>{icon}</div>
              <div style={{color:c,fontSize:10,fontWeight:700,marginTop:4}}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {[1,2,3,4,5,6,7,8,9].map(n=>(
            <div key={n} style={{background:n===5?"linear-gradient(135deg,#34D399,#059669)":"rgba(255,255,255,0.07)",borderRadius:14,padding:"14px 8px",textAlign:"center",fontSize:20,fontWeight:900,color:n===5?"#022C22":"#fff",border:n===5?"none":"1px solid rgba(52,211,153,0.2)",boxShadow:n===5?"0 4px 16px rgba(52,211,153,0.45)":"none"}}>{n}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
