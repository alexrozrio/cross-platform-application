export function CandyPop() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#FFF0F7",
      fontFamily: "'Outfit', 'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #FF6CAB 0%, #FF8E53 100%)",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "0 0 24px 24px",
        boxShadow: "0 4px 20px rgba(255,108,171,0.4)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 24 }}>🍭</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 18, letterSpacing: -0.5 }}>SudokuFun</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 600 }}>Candy Pop</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "5px 12px", fontSize: 13, fontWeight: 800, color: "#FF6CAB" }}>💎 42</div>
          <div style={{ background: "rgba(255,255,255,0.3)", borderRadius: 20, padding: "5px 10px", fontSize: 16 }}>👤</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "20px 16px", overflowY: "auto" }}>
        {/* Welcome */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ color: "#FF6CAB", fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: -1 }}>
            Hey there! 👋
          </h1>
          <p style={{ color: "#888", margin: "4px 0 0", fontSize: 13, fontWeight: 500 }}>
            Ready for a sweet challenge?
          </p>
        </div>

        {/* Game cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { size: "3×3", label: "Baby", emoji: "🐣", bg: "#FFE0F0", border: "#FF6CAB", text: "#FF6CAB" },
            { size: "4×4", label: "Mini", emoji: "🌸", bg: "#FFF3E0", border: "#FF8E53", text: "#FF8E53" },
            { size: "9×9", label: "Classic", emoji: "🦋", bg: "#E8F5E9", border: "#4CAF50", text: "#388E3C" },
            { size: "16×16", label: "Pro", emoji: "🦄", bg: "#EDE7F6", border: "#9C27B0", text: "#7B1FA2" },
          ].map(({ size, label, emoji, bg, border, text }) => (
            <div key={size} style={{
              background: bg,
              borderRadius: 20,
              padding: "18px 14px",
              cursor: "pointer",
              border: `2.5px solid ${border}`,
              textAlign: "center",
              transition: "all 0.15s",
              boxShadow: `0 4px 16px ${border}33`,
            }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>{emoji}</div>
              <div style={{ color: text, fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{size}</div>
              <div style={{ color: text, fontSize: 11, fontWeight: 700, marginTop: 2, opacity: 0.8 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Sudoku board */}
        <div style={{
          background: "#fff",
          borderRadius: 20,
          padding: 16,
          marginBottom: 16,
          border: "2.5px solid #FFD1E8",
          boxShadow: "0 4px 20px rgba(255,108,171,0.12)",
        }}>
          <div style={{ color: "#FF6CAB", fontSize: 12, fontWeight: 800, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
            🎯 Current Game — 9×9 Easy
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(9, 1fr)",
            gap: 2,
            background: "#FFD1E8",
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
              const isRelated = !isSelected && (Math.floor(i / 9) === Math.floor(13 / 9) || i % 9 === 13 % 9);
              return (
                <div key={i} style={{
                  background: isSelected ? "#FF6CAB" : isRelated ? "#FFE8F4" : isGiven ? "#fff" : "#FFF5FA",
                  aspectRatio: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: isGiven ? 800 : 500,
                  color: isSelected ? "#fff" : isGiven ? "#FF6CAB" : "#999",
                  borderRadius: 4,
                  borderRight: isThickRight ? "2px solid #FFB3D9" : "none",
                  borderBottom: isThickBottom ? "2px solid #FFB3D9" : "none",
                }}>
                  {val !== "0" ? val : ""}
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { icon: "✏️", label: "Notes", bg: "#FFF0F7", border: "#FFD1E8", color: "#FF6CAB" },
            { icon: "⚠️", label: "3 left", bg: "#FFF0F7", border: "#FF8E53", color: "#FF8E53" },
            { icon: "💡", label: "2 left", bg: "#FFF9E6", border: "#FFD700", color: "#B8860B" },
            { icon: "⌫", label: "Erase", bg: "#F0F4FF", border: "#9C27B0", color: "#9C27B0" },
          ].map(({ icon, label, bg, border, color }) => (
            <div key={label} style={{
              background: bg,
              borderRadius: 16,
              padding: "12px 8px",
              textAlign: "center",
              border: `2px solid ${border}`,
            }}>
              <div style={{ fontSize: 18 }}>{icon}</div>
              <div style={{ color, fontSize: 10, fontWeight: 800, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Number pad */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <div key={n} style={{
              background: n === 5
                ? "linear-gradient(135deg, #FF6CAB 0%, #FF8E53 100%)"
                : "#fff",
              borderRadius: 14,
              padding: "14px 8px",
              textAlign: "center",
              fontSize: 20,
              fontWeight: 900,
              color: n === 5 ? "#fff" : "#FF6CAB",
              cursor: "pointer",
              border: `2.5px solid ${n === 5 ? "transparent" : "#FFD1E8"}`,
              boxShadow: n === 5 ? "0 4px 12px rgba(255,108,171,0.4)" : "none",
            }}>
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
