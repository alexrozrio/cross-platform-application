function Board({ accent }: { accent: string }) {
  const sample = "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(9,1fr)",gap:2,background:`${accent}30`,padding:3,borderRadius:12}}>
      {Array(81).fill(null).map((_,i)=>{
        const val=sample[i];const isGiven=val!=="0";
        const col=i%9;const row=Math.floor(i/9);
        const isSel=i===13;const isRel=!isSel&&(Math.floor(i/9)===1||i%9===4);
        const isThickR=(col===2||col===5)&&col!==8;const isThickB=(row===2||row===5)&&row!==8;
        return <div key={i} style={{
          background:isSel?`linear-gradient(135deg,${accent},${accent}99)`:isRel?`${accent}18`:isGiven?"rgba(255,255,255,0.14)":"rgba(255,255,255,0.06)",
          aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:10,fontWeight:isGiven?800:500,
          color:isSel?"#fff":isGiven?"rgba(220,210,255,0.9)":"rgba(255,255,255,0.3)",
          borderRadius:4,
          borderRight:isThickR?`2px solid ${accent}44`:"none",
          borderBottom:isThickB?`2px solid ${accent}44`:"none",
        }}>{val!=="0"?val:""}</div>;
      })}
    </div>
  );
}

export function OceanV1() {
  const accent = "#A78BFA"; // violet
  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg, #0A0014 0%, #1E0B3E 30%, #2D1363 60%, #4C1D95 100%)",
      fontFamily:"'Outfit','Inter',sans-serif",
      display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",
    }}>
      <div style={{position:"absolute",top:-80,right:-60,width:280,height:280,borderRadius:"50%",background:"rgba(167,139,250,0.15)",filter:"blur(70px)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:100,left:-60,width:220,height:220,borderRadius:"50%",background:"rgba(109,40,217,0.2)",filter:"blur(60px)",pointerEvents:"none"}}/>

      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:24}}>🟣</div>
          <div>
            <div style={{color:"#fff",fontWeight:900,fontSize:18,letterSpacing:-0.5}}>SudokuFun</div>
            <div style={{color:"#A78BFA",fontSize:11,fontWeight:600}}>Deep Violet</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <div style={{background:"linear-gradient(135deg,#A78BFA,#7C3AED)",borderRadius:20,padding:"5px 12px",fontSize:13,fontWeight:800,color:"#fff"}}>💎 42</div>
          <div style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(167,139,250,0.25)",borderRadius:20,padding:"5px 10px",fontSize:16}}>👤</div>
        </div>
      </div>

      <div style={{flex:1,padding:"12px 16px 20px",overflowY:"auto",position:"relative",zIndex:1}}>
        <div style={{marginBottom:20}}>
          <h1 style={{margin:0,fontSize:26,fontWeight:900,background:"linear-gradient(90deg,#DDD6FE,#A78BFA,#7C3AED)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:-1}}>Dive In! 🌌</h1>
          <p style={{color:"rgba(167,139,250,0.65)",margin:"4px 0 0",fontSize:13}}>Explore the violet depths</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
          {[
            {size:"3×3",label:"Cadet",emoji:"🌙",from:"#A78BFA",to:"#6D28D9"},
            {size:"4×4",label:"Scout",emoji:"⭐",from:"#7C3AED",to:"#4C1D95"},
            {size:"9×9",label:"Pilot",emoji:"🪐",from:"#5B21B6",to:"#2D1363"},
            {size:"16×16",label:"Legend",emoji:"💫",from:"#A78BFA",to:"#7C3AED"},
          ].map(({size,label,emoji,from,to})=>(
            <div key={size} style={{background:`linear-gradient(135deg,${from},${to})`,borderRadius:20,padding:"18px 14px",textAlign:"center",boxShadow:`0 4px 20px ${from}55`,border:"1px solid rgba(255,255,255,0.08)"}}>
              <div style={{fontSize:30,marginBottom:6}}>{emoji}</div>
              <div style={{color:"#fff",fontSize:20,fontWeight:900,lineHeight:1}}>{size}</div>
              <div style={{color:"rgba(255,255,255,0.8)",fontSize:11,fontWeight:700,marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{background:"rgba(255,255,255,0.05)",backdropFilter:"blur(12px)",borderRadius:20,padding:16,marginBottom:16,border:"1px solid rgba(167,139,250,0.25)"}}>
          <div style={{color:"#A78BFA",fontSize:12,fontWeight:800,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>🎯 Current Mission — 9×9 Easy</div>
          <Board accent={accent} />
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:16}}>
          {[{icon:"✏️",label:"Notes",c:"#A78BFA"},{icon:"⚠️",label:"3 left",c:"#F87171"},{icon:"💡",label:"2 left",c:"#DDD6FE"},{icon:"⌫",label:"Erase",c:"#7C3AED"}].map(({icon,label,c})=>(
            <div key={label} style={{background:"rgba(255,255,255,0.05)",borderRadius:16,padding:"12px 8px",textAlign:"center",border:`1.5px solid ${c}44`}}>
              <div style={{fontSize:18}}>{icon}</div>
              <div style={{color:c,fontSize:10,fontWeight:700,marginTop:4}}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {[1,2,3,4,5,6,7,8,9].map(n=>(
            <div key={n} style={{background:n===5?"linear-gradient(135deg,#A78BFA,#7C3AED)":"rgba(255,255,255,0.07)",borderRadius:14,padding:"14px 8px",textAlign:"center",fontSize:20,fontWeight:900,color:"#fff",border:n===5?"none":"1px solid rgba(167,139,250,0.2)",boxShadow:n===5?"0 4px 16px rgba(167,139,250,0.45)":"none"}}>{n}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
