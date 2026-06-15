export function CosmicKids() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0F0C29 0%, #302B63 50%, #24243e 100%)",
      fontFamily: "'Outfit', 'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Stars overlay */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            background: "#fff",
            borderRadius: "50%",
            top: `${Math.sin(i * 137.5) * 50 + 50}%`,
            left: `${Math.cos(i * 137.5) * 50 + 50}%`,
            opacity: 0.4 + (i % 5) * 0.12,
          }} />
        ))}
      </div>

      {/* Header */}
      <div style={{
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 24 }}>🚀</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 18, letterSpacing: -0.5 }}>SudokuFun</div>
            <div style={{ color: "#A78BFA", fontSize: 11, fontWeight: 600 }}>Cosmic Kids</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)", borderRadius: 20, padding: "5px 12px", fontSize: 13, fontWeight: 800, color: "#fff" }}>
            💎 42
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "5px 10px", fontSize: 16 }}>👤</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "12px 16px 20px", overflowY: "auto", position: "relative", zIndex: 1 }}>
        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 900,
            background: "linear-gradient(90deg, #A78BFA, #38BDF8, #34D399)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: -1,
          }}>
            Mission Control 🌌
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", margin: "4px 0 0", fontSize: 13, fontWeight: 500 }}>
            Choose your mission, commander!
          </p>
        </div>

        {/* Game cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { size: "3×3", label: "Cadet", emoji: "🌙", from: "#38BDF8", to: "#0EA5E9" },
            { size: "4×4", label: "Scout", emoji: "⭐", from: "#34D399", to: "#059669" },
            { size: "9×9", label: "Pilot", emoji: "🪐", from: "#A78BFA", to: "#7C3AED" },
            { size: "16×16", label: "Commander", emoji: "🌟", from: "#F59E0B", to: "#EF4444" },
          ].map(({ size, label, emoji, from, to }) => (
            <div key={size} style={{
              background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
              borderRadius: 20,
              padding: "18px 14px",
              cursor: "pointer",
              textAlign: "center",
              boxShadow: `0 4px 20px ${from}55`,
              border: "1px solid rgba(255,255,255,0.15)",
            }}>
              <div style={{ fontSize: 30, marginBottom: 6, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}>{emoji}</div>
              <div style={{ color: "#fff", fontSize: 20, fontWeight: 900, lineHeight: 1, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>{size}</div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 700, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Sudoku board */}
        <div style={{
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(12px)",
          borderRadius: 20,
          padding: 16,
          marginBottom: 16,
          border: "1px solid rgba(167,139,250,0.3)",
          boxShadow: "0 0 30px rgba(167,139,250,0.1)",
        }}>
          <div style={{ color: "#A78BFA", fontSize: 12, fontWeight: 800, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
            🎯 Current Mission — 9×9 Easy
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(9, 1fr)",
            gap: 2,
            background: "rgba(167,139,250,0.2)",
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
                  background: isSelected
                    ? "linear-gradient(135deg, #A78BFA, #38BDF8)"
                    : isRelated ? "rgba(167,139,250,0.15)"
                    : isGiven ? "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.06)",
                  aspectRatio: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: isGiven ? 800 : 500,
                  color: isSelected ? "#fff" : isGiven ? "#E0D7FF" : "rgba(255,255,255,0.4)",
                  borderRadius: 4,
                  borderRight: isThickRight ? "2px solid rgba(167,139,250,0.4)" : "none",
                  borderBottom: isThickBottom ? "2px solid rgba(167,139,250,0.4)" : "none",
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
            { icon: "✏️", label: "Notes", color: "#38BDF8" },
            { icon: "⚠️", label: "3 left", color: "#F59E0B" },
            { icon: "💡", label: "2 left", color: "#34D399" },
            { icon: "⌫", label: "Erase", color: "#A78BFA" },
          ].map(({ icon, label, color }) => (
            <div key={label} style={{
              background: "rgba(255,255,255,0.07)",
              borderRadius: 16,
              padding: "12px 8px",
              textAlign: "center",
              border: `1.5px solid ${color}55`,
            }}>
              <div style={{ fontSize: 18 }}>{icon}</div>
              <div style={{ color, fontSize: 10, fontWeight: 700, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Number pad */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <div key={n} style={{
              background: n === 5
                ? "linear-gradient(135deg, #A78BFA, #38BDF8)"
                : "rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "14px 8px",
              textAlign: "center",
              fontSize: 20,
              fontWeight: 900,
              color: "#fff",
              cursor: "pointer",
              border: n === 5 ? "none" : "1px solid rgba(255,255,255,0.1)",
              boxShadow: n === 5 ? "0 4px 16px rgba(167,139,250,0.5)" : "none",
            }}>
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
