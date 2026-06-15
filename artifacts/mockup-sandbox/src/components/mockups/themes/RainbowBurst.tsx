export function RainbowBurst() {
  const grid = Array(9).fill(null).map((_, i) => {
    const vals = ["5","3","","","7","","","","","6","","","1","9","5","","","","","9","8","","","","","6","","","8","","","","6","","","","","3","","","","8","3","","","1","","6","6","","","5","","","","","4","","","","","8","","","3","","","","2","","","","","1","9","","5","","","","","8","7","9"];
    return vals[i] || "";
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "'Outfit', 'Inter', sans-serif",
      padding: "0",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(10px)",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 24 }}>🌈</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>SudokuFun</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Rainbow Burst</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ background: "#FFD93D", borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 700, color: "#7c3700" }}>💎 42</div>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "6px 10px", fontSize: 16 }}>👤</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "20px 16px", overflowY: "auto" }}>
        {/* Game hub title */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
            Let's Play! 🎮
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", margin: "4px 0 0", fontSize: 13 }}>
            Pick your puzzle and start solving!
          </p>
        </div>

        {/* Game size cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { size: "3×3", label: "Baby", emoji: "🐣", color: "#FF6B9D", shadow: "#c94d7c" },
            { size: "4×4", label: "Mini", emoji: "🐥", color: "#FFB347", shadow: "#cc8a30" },
            { size: "9×9", label: "Classic", emoji: "🦊", color: "#4ECDC4", shadow: "#35a59d" },
            { size: "16×16", label: "Pro", emoji: "🦁", color: "#A855F7", shadow: "#7c3aed" },
          ].map(({ size, label, emoji, color, shadow }) => (
            <div key={size} style={{
              background: color,
              borderRadius: 20,
              padding: "18px 16px",
              cursor: "pointer",
              boxShadow: `0 4px 0 ${shadow}, 0 6px 20px rgba(0,0,0,0.2)`,
              transform: "translateY(0)",
              transition: "all 0.1s",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>{emoji}</div>
              <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{size}</div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 600, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Mini sudoku board */}
        <div style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(10px)",
          borderRadius: 20,
          padding: 16,
          marginBottom: 16,
          border: "1px solid rgba(255,255,255,0.25)",
        }}>
          <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
            🎯 Current Game — 9×9 Easy
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(9, 1fr)",
            gap: 2,
            background: "rgba(255,255,255,0.3)",
            padding: 3,
            borderRadius: 12,
          }}>
            {Array(81).fill(null).map((_, i) => {
              const sample = "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
              const val = sample[i];
              const isGiven = val !== "0";
              const col = i % 9;
              const row = Math.floor(i / 9);
              const isThickRight = (col === 2 || col === 5) && col !== 8;
              const isThickBottom = (row === 2 || row === 5) && row !== 8;
              const isSelected = i === 13;
              return (
                <div key={i} style={{
                  background: isSelected ? "#FFD93D" : isGiven ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)",
                  aspectRatio: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: isGiven ? 800 : 500,
                  color: isSelected ? "#333" : isGiven ? "#4c1d95" : "#666",
                  borderRadius: 3,
                  borderRight: isThickRight ? "2px solid rgba(100,50,200,0.5)" : "none",
                  borderBottom: isThickBottom ? "2px solid rgba(100,50,200,0.5)" : "none",
                }}>
                  {val !== "0" ? val : ""}
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { icon: "✏️", label: "Notes" },
            { icon: "⚠️", label: "3 left", highlight: true },
            { icon: "💡", label: "2 left" },
            { icon: "⌫", label: "Erase" },
          ].map(({ icon, label, highlight }) => (
            <div key={label} style={{
              background: highlight ? "#FF6B9D" : "rgba(255,255,255,0.2)",
              borderRadius: 16,
              padding: "12px 8px",
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
              <div style={{ fontSize: 18 }}>{icon}</div>
              <div style={{ color: "#fff", fontSize: 10, fontWeight: 700, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Number pad */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <div key={n} style={{
              background: n === 5 ? "#FFD93D" : "rgba(255,255,255,0.2)",
              borderRadius: 14,
              padding: "14px 8px",
              textAlign: "center",
              fontSize: 20,
              fontWeight: 800,
              color: n === 5 ? "#333" : "#fff",
              cursor: "pointer",
              border: "2px solid rgba(255,255,255,0.2)",
              boxShadow: n === 5 ? "0 3px 0 #ccac00" : "0 3px 0 rgba(0,0,0,0.2)",
            }}>
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
