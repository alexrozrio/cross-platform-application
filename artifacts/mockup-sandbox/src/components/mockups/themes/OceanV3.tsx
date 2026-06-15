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
          background:isSel?`linear-gradient(135deg,${accent},#E5E7EB)`:isRel?`${accent}15`:isGiven?"rgba(255,255,255,0.11)":"rgba(255,255,255,0.05)",
          aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:10,fontWeight:isGiven?800:500,
          color:isSel?"#111":isGiven?"rgba(255,255,255,0.85)":"rgba(255,255,255,0.3)",
          borderRadius:4,
          borderRight:isThickR?`2px solid ${accent}38`:"none",
          borderBottom:isThickB?`2px solid ${accent}38`:"none",
        }}>{val!=="0"?val:""}</div>;
      })}
    </div>
  );
}

export function OceanV3() {
  const accent = "#E5E7EB";
  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg, #060608 0%, #0D0D12 30%, #111118 60%, #18181E 100%)",
      fontFamily:"'Outfit','Inter',sans-serif",
      display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",
    }}>
      {/* Very subtle glow */}
      <div style={{position:"absolute",top:-100,right:-80,width:300,height:300,borderRadius:"50%",background:"rgba(229,231,235,0.04)",filter:"blur(80px)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:60,left:-80,width:250,height:250,borderRadius:"50%",background:"rgba(99,102,241,0.06)",filter:"blur(70px)",pointerEvents:"none"}}/>

      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:24}}>⚫</div>
          <div>
            <div style={{color:"#fff",fontWeight:900,fontSize:18,letterSpacing:-0.5}}>SudokuFun</div>
            <div style={{color:"#9CA3AF",fontSize:11,fontWeight:600}}>Midnight Ink</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <div style={{background:"linear-gradient(135deg,#374151,#1F2937)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:20,padding:"5px 12px",fontSize:13,fontWeight:800,color:"#E5E7EB"}}>💎 42</div>
          <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"5px 10px",fontSize:16}}>👤</div>
        </div>
      </div>

      <div style={{flex:1,padding:"12px 16px 20px",overflowY:"auto",position:"relative",zIndex:1}}>
        <div style={{marginBottom:20}}>
          <h1 style={{margin:0,fontSize:26,fontWeight:900,background:"linear-gradient(90deg,#F9FAFB,#9CA3AF,#6B7280)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:-1}}>Dive In! 🌑</h1>
          <p style={{color:"rgba(156,163,175,0.65)",margin:"4px 0 0",fontSize:13}}>Pure focus, zero distraction</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
          {[
            {size:"3×3",label:"Cadet",emoji:"🌙",from:"#374151",to:"#1F2937"},
            {size:"4×4",label:"Scout",emoji:"⭐",from:"#4B5563",to:"#374151"},
            {size:"9×9",label:"Pilot",emoji:"🌌",from:"#1F2937",to:"#111827"},
            {size:"16×16",label:"Legend",emoji:"💎",from:"#6366F1",to:"#4338CA"},
          ].map(({size,label,emoji,from,to})=>(
            <div key={size} style={{background:`linear-gradient(135deg,${from},${to})`,borderRadius:20,padding:"18px 14px",textAlign:"center",border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 4px 16px rgba(0,0,0,0.5)"}}>
              <div style={{fontSize:30,marginBottom:6}}>{emoji}</div>
              <div style={{color:"#F9FAFB",fontSize:20,fontWeight:900,lineHeight:1}}>{size}</div>
              <div style={{color:"rgba(255,255,255,0.6)",fontSize:11,fontWeight:700,marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{background:"rgba(255,255,255,0.03)",backdropFilter:"blur(12px)",borderRadius:20,padding:16,marginBottom:16,border:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{color:"#9CA3AF",fontSize:12,fontWeight:800,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>🎯 Current Mission — 9×9 Easy</div>
          <Board accent={accent} />
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:16}}>
          {[{icon:"✏️",label:"Notes",c:"#9CA3AF"},{icon:"⚠️",label:"3 left",c:"#F87171"},{icon:"💡",label:"2 left",c:"#FCD34D"},{icon:"⌫",label:"Erase",c:"#6B7280"}].map(({icon,label,c})=>(
            <div key={label} style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:"12px 8px",textAlign:"center",border:`1.5px solid ${c}33`}}>
              <div style={{fontSize:18}}>{icon}</div>
              <div style={{color:c,fontSize:10,fontWeight:700,marginTop:4}}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {[1,2,3,4,5,6,7,8,9].map(n=>(
            <div key={n} style={{background:n===5?"linear-gradient(135deg,#4B5563,#374151)":"rgba(255,255,255,0.05)",borderRadius:14,padding:"14px 8px",textAlign:"center",fontSize:20,fontWeight:900,color:"#F9FAFB",border:"1px solid rgba(255,255,255,0.08)",boxShadow:n===5?"0 4px 12px rgba(0,0,0,0.5)":"none"}}>{n}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
