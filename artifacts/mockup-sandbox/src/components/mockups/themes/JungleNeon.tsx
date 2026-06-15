function Board() {
  const sample = "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(9,1fr)",gap:2,background:"rgba(57,255,20,0.18)",padding:3,borderRadius:12}}>
      {Array(81).fill(null).map((_,i)=>{
        const val=sample[i]; const isGiven=val!=="0";
        const col=i%9; const row=Math.floor(i/9);
        const isThickR=(col===2||col===5)&&col!==8;
        const isThickB=(row===2||row===5)&&row!==8;
        const isSel=i===13;
        const isRel=!isSel&&(Math.floor(i/9)===1||i%9===4);
        return <div key={i} style={{
          background:isSel?"linear-gradient(135deg,#39FF14,#ADFF2F)":isRel?"rgba(57,255,20,0.1)":isGiven?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.05)",
          aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:10,fontWeight:isGiven?800:500,
          color:isSel?"#0D1F00":isGiven?"#ADFF2F":"rgba(255,255,255,0.35)",
          borderRadius:4,
          borderRight:isThickR?"2px solid rgba(57,255,20,0.4)":"none",
          borderBottom:isThickB?"2px solid rgba(57,255,20,0.4)":"none",
        }}>{val!=="0"?val:""}</div>;
      })}
    </div>
  );
}

export function JungleNeon() {
  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg, #0D1F00 0%, #1A3A0A 35%, #0F2D1A 65%, #1C1F00 100%)",
      fontFamily:"'Outfit','Inter',sans-serif",
      display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",
    }}>
      {/* Neon glow blobs */}
      <div style={{position:"absolute",top:-60,left:-40,width:220,height:220,borderRadius:"50%",background:"rgba(57,255,20,0.12)",filter:"blur(70px)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:80,right:-50,width:200,height:200,borderRadius:"50%",background:"rgba(255,215,0,0.1)",filter:"blur(60px)",pointerEvents:"none"}}/>

      {/* Header */}
      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:24}}>🌿</div>
          <div>
            <div style={{color:"#fff",fontWeight:900,fontSize:18,letterSpacing:-0.5}}>SudokuFun</div>
            <div style={{color:"#39FF14",fontSize:11,fontWeight:600,textShadow:"0 0 8px #39FF14"}}>Jungle Neon</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <div style={{background:"linear-gradient(135deg,#39FF14,#ADFF2F)",borderRadius:20,padding:"5px 12px",fontSize:13,fontWeight:800,color:"#0D1F00"}}>💎 42</div>
          <div style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(57,255,20,0.2)",borderRadius:20,padding:"5px 10px",fontSize:16}}>👤</div>
        </div>
      </div>

      <div style={{flex:1,padding:"12px 16px 20px",overflowY:"auto",position:"relative",zIndex:1}}>
        <div style={{marginBottom:20}}>
          <h1 style={{margin:0,fontSize:26,fontWeight:900,background:"linear-gradient(90deg,#39FF14,#ADFF2F,#FFD700)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:-1,filter:"drop-shadow(0 0 12px rgba(57,255,20,0.4))"}}>
            Wild Mode 🦎
          </h1>
          <p style={{color:"rgba(173,255,47,0.65)",margin:"4px 0 0",fontSize:13}}>Survive the puzzle jungle!</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
          {[
            {size:"3×3",label:"Seedling",emoji:"🌱",from:"#39FF14",to:"#1A7A00"},
            {size:"4×4",label:"Scout",emoji:"🦋",from:"#ADFF2F",to:"#6B8E00"},
            {size:"9×9",label:"Hunter",emoji:"🐆",from:"#FFD700",to:"#B8860B"},
            {size:"16×16",label:"Apex",emoji:"🦁",from:"#39FF14",to:"#FFD700"},
          ].map(({size,label,emoji,from,to})=>(
            <div key={size} style={{background:`linear-gradient(135deg,${from},${to})`,borderRadius:20,padding:"18px 14px",textAlign:"center",boxShadow:`0 4px 20px ${from}44`,border:"1px solid rgba(255,255,255,0.08)"}}>
              <div style={{fontSize:30,marginBottom:6}}>{emoji}</div>
              <div style={{color:label==="Seedling"||label==="Scout"?"#0D1F00":"#fff",fontSize:20,fontWeight:900,lineHeight:1}}>{size}</div>
              <div style={{color:label==="Seedling"||label==="Scout"?"rgba(0,30,0,0.8)":"rgba(255,255,255,0.85)",fontSize:11,fontWeight:700,marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{background:"rgba(57,255,20,0.05)",backdropFilter:"blur(12px)",borderRadius:20,padding:16,marginBottom:16,border:"1px solid rgba(57,255,20,0.2)",boxShadow:"0 0 20px rgba(57,255,20,0.05)"}}>
          <div style={{color:"#39FF14",fontSize:12,fontWeight:800,marginBottom:12,textTransform:"uppercase",letterSpacing:1,textShadow:"0 0 8px rgba(57,255,20,0.5)"}}>🎯 Current Mission — 9×9 Easy</div>
          <Board />
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:16}}>
          {[{icon:"✏️",label:"Notes",c:"#39FF14"},{icon:"⚠️",label:"3 left",c:"#FF6B35"},{icon:"💡",label:"2 left",c:"#FFD700"},{icon:"⌫",label:"Erase",c:"#ADFF2F"}].map(({icon,label,c})=>(
            <div key={label} style={{background:"rgba(255,255,255,0.05)",borderRadius:16,padding:"12px 8px",textAlign:"center",border:`1.5px solid ${c}44`}}>
              <div style={{fontSize:18}}>{icon}</div>
              <div style={{color:c,fontSize:10,fontWeight:700,marginTop:4,textShadow:`0 0 6px ${c}88`}}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {[1,2,3,4,5,6,7,8,9].map(n=>(
            <div key={n} style={{background:n===5?"linear-gradient(135deg,#39FF14,#ADFF2F)":"rgba(255,255,255,0.06)",borderRadius:14,padding:"14px 8px",textAlign:"center",fontSize:20,fontWeight:900,color:n===5?"#0D1F00":"#fff",border:n===5?"none":"1px solid rgba(57,255,20,0.15)",boxShadow:n===5?"0 0 20px rgba(57,255,20,0.5)":"none"}}>
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
