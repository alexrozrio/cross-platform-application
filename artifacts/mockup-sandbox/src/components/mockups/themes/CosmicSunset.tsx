function Board() {
  const sample = "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(9,1fr)", gap:2, background:"rgba(255,120,50,0.25)", padding:3, borderRadius:12 }}>
      {Array(81).fill(null).map((_,i)=>{
        const val=sample[i]; const isGiven=val!=="0";
        const col=i%9; const row=Math.floor(i/9);
        const isThickR=(col===2||col===5)&&col!==8;
        const isThickB=(row===2||row===5)&&row!==8;
        const isSel=i===13;
        const isRel=!isSel&&(Math.floor(i/9)===1||i%9===4);
        return <div key={i} style={{
          background:isSel?"linear-gradient(135deg,#FF6B35,#F7C59F)":isRel?"rgba(255,107,53,0.15)":isGiven?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.07)",
          aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:10,fontWeight:isGiven?800:500,
          color:isSel?"#fff":isGiven?"#FFE0CC":"rgba(255,255,255,0.4)",
          borderRadius:4,
          borderRight:isThickR?"2px solid rgba(255,120,50,0.5)":"none",
          borderBottom:isThickB?"2px solid rgba(255,120,50,0.5)":"none",
        }}>{val!=="0"?val:""}</div>;
      })}
    </div>
  );
}

export function CosmicSunset() {
  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg, #1a0533 0%, #6B1C3C 35%, #C2401A 70%, #FF8C42 100%)",
      fontFamily:"'Outfit','Inter',sans-serif",
      display:"flex", flexDirection:"column", position:"relative", overflow:"hidden",
    }}>
      {/* glow blobs */}
      <div style={{position:"absolute",top:-80,right:-60,width:260,height:260,borderRadius:"50%",background:"rgba(255,140,66,0.25)",filter:"blur(60px)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:100,left:-80,width:200,height:200,borderRadius:"50%",background:"rgba(194,64,26,0.3)",filter:"blur(50px)",pointerEvents:"none"}}/>

      {/* Header */}
      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:24}}>🌅</div>
          <div>
            <div style={{color:"#fff",fontWeight:900,fontSize:18,letterSpacing:-0.5}}>SudokuFun</div>
            <div style={{color:"rgba(255,200,150,0.8)",fontSize:11,fontWeight:600}}>Sunset Cosmic</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <div style={{background:"linear-gradient(135deg,#FF6B35,#F7C59F)",borderRadius:20,padding:"5px 12px",fontSize:13,fontWeight:800,color:"#fff"}}>💎 42</div>
          <div style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:20,padding:"5px 10px",fontSize:16}}>👤</div>
        </div>
      </div>

      <div style={{flex:1,padding:"12px 16px 20px",overflowY:"auto",position:"relative",zIndex:1}}>
        <div style={{marginBottom:20}}>
          <h1 style={{margin:0,fontSize:26,fontWeight:900,background:"linear-gradient(90deg,#FFD580,#FF8C42,#FF6B35)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:-1}}>
            Sunset Mode 🔥
          </h1>
          <p style={{color:"rgba(255,200,150,0.75)",margin:"4px 0 0",fontSize:13}}>Warm up your brain!</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
          {[
            {size:"3×3",label:"Cadet",emoji:"🌙",from:"#FF6B35",to:"#C2401A"},
            {size:"4×4",label:"Scout",emoji:"⭐",from:"#F7C59F",to:"#FF8C42"},
            {size:"9×9",label:"Pilot",emoji:"🪐",from:"#9B2335",to:"#6B1C3C"},
            {size:"16×16",label:"Legend",emoji:"🌟",from:"#FF8C42",to:"#FF6B35"},
          ].map(({size,label,emoji,from,to})=>(
            <div key={size} style={{background:`linear-gradient(135deg,${from},${to})`,borderRadius:20,padding:"18px 14px",textAlign:"center",boxShadow:`0 4px 20px ${from}66`,border:"1px solid rgba(255,255,255,0.12)"}}>
              <div style={{fontSize:30,marginBottom:6}}>{emoji}</div>
              <div style={{color:"#fff",fontSize:20,fontWeight:900,lineHeight:1}}>{size}</div>
              <div style={{color:"rgba(255,255,255,0.8)",fontSize:11,fontWeight:700,marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{background:"rgba(255,255,255,0.08)",backdropFilter:"blur(12px)",borderRadius:20,padding:16,marginBottom:16,border:"1px solid rgba(255,140,66,0.3)"}}>
          <div style={{color:"#FF8C42",fontSize:12,fontWeight:800,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>🎯 Current Mission — 9×9 Easy</div>
          <Board />
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:16}}>
          {[{icon:"✏️",label:"Notes",c:"#F7C59F"},{icon:"⚠️",label:"3 left",c:"#FF6B35"},{icon:"💡",label:"2 left",c:"#FFD580"},{icon:"⌫",label:"Erase",c:"#C2401A"}].map(({icon,label,c})=>(
            <div key={label} style={{background:"rgba(255,255,255,0.08)",borderRadius:16,padding:"12px 8px",textAlign:"center",border:`1.5px solid ${c}55`}}>
              <div style={{fontSize:18}}>{icon}</div>
              <div style={{color:c,fontSize:10,fontWeight:700,marginTop:4}}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {[1,2,3,4,5,6,7,8,9].map(n=>(
            <div key={n} style={{background:n===5?"linear-gradient(135deg,#FF6B35,#FF8C42)":"rgba(255,255,255,0.09)",borderRadius:14,padding:"14px 8px",textAlign:"center",fontSize:20,fontWeight:900,color:"#fff",border:n===5?"none":"1px solid rgba(255,140,66,0.2)",boxShadow:n===5?"0 4px 16px rgba(255,107,53,0.5)":"none"}}>
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
