import { useState, useMemo } from "react";

const SHARES = 216368773;
const INSTRUMENT_PRICE = 425000;
const CURRENT_PRICE = 0.74;
const CASH = 215800000;
const ANNUAL_BURN = 93000000;

// Realistic scenarios
const SCENARIOS = [
  { units: 50, label: "극도로 보수적", desc: "얼리어답터 소수만 구매" },
  { units: 100, label: "보수적", desc: "Top-tier 대학 시작" },
  { units: 200, label: "초기 채택", desc: "코어랩/바이오텍 진입" },
  { units: 500, label: "Niche 표준", desc: "특정 분야 필수 장비화" },
  { units: 1000, label: "강한 플랫폼", desc: "Academic + Pharma 채택" },
  { units: 2000, label: "공격적", desc: "시장 절반 침투 (낙관적)" },
];

const PSR_OPTIONS = [
  { value: 5, label: "5x (극보수)", color: "#6b7280" },
  { value: 8, label: "8x (보수적)", color: "#3b82f6" },
  { value: 12, label: "12x (중립)", color: "#8b5cf6" },
  { value: 15, label: "15x (낙관)", color: "#f59e0b" },
  { value: 20, label: "20x (극낙관)", color: "#ef4444" },
];

function fmt(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtKRW(usd) {
  const krw = usd * 1420;
  if (krw >= 1e12) return `${(krw / 1e12).toFixed(2)}조원`;
  if (krw >= 1e8) return `${(krw / 1e8).toFixed(0)}억원`;
  return `${(krw / 1e4).toFixed(0)}만원`;
}

export default function QSISimulator() {
  const [consumablePerUnit, setConsumablePerUnit] = useState(75000);
  const [psr, setPsr] = useState(12);
  const [dilutionPct, setDilutionPct] = useState(0);
  const [holdings, setHoldings] = useState(330000);

  const dilutedShares = SHARES * (1 + dilutionPct / 100);

  const rows = useMemo(() => {
    return SCENARIOS.map((s) => {
      const instrumentRev = s.units * INSTRUMENT_PRICE;
      const consumableRev = s.units * consumablePerUnit;
      const totalRev = instrumentRev + consumableRev;
      const marketCap = totalRev * psr;
      const pricePerShare = marketCap / dilutedShares;
      const upside = ((pricePerShare - CURRENT_PRICE) / CURRENT_PRICE) * 100;
      const portfolioValue = holdings * pricePerShare;
      return { ...s, instrumentRev, consumableRev, totalRev, marketCap, pricePerShare, upside, portfolioValue };
    });
  }, [consumablePerUnit, psr, dilutedShares, holdings]);

  const cashRunwayMonths = Math.floor((CASH / ANNUAL_BURN) * 12);

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      background: "#0a0e17",
      color: "#c9d1d9",
      minHeight: "100vh",
      padding: "20px",
      boxSizing: "border-box",
    }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #21262d", paddingBottom: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            background: "#1f6feb",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 3,
            letterSpacing: 1.5,
          }}>QSI</div>
          <span style={{ color: "#8b949e", fontSize: 11 }}>NASDAQ: QSI</span>
          <span style={{ color: "#f0883e", fontSize: 11, marginLeft: "auto" }}>현재 ${CURRENT_PRICE}</span>
        </div>
        <h1 style={{
          fontSize: 18,
          fontWeight: 800,
          color: "#e6edf3",
          margin: 0,
          lineHeight: 1.3,
        }}>
          Proteus 판매 시나리오 → 주가 시뮬레이터
        </h1>
        <p style={{ fontSize: 11, color: "#8b949e", margin: "6px 0 0" }}>
          팩트체크 완료된 숫자 기반 | 장비가 ${fmt(INSTRUMENT_PRICE)} · 주식수 {(SHARES/1e6).toFixed(1)}M · 캐시 ${fmt(CASH)} ({cashRunwayMonths}개월)
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 16,
        marginBottom: 28,
      }}>
        {/* Consumable */}
        <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#8b949e" }}>연간 소모품 매출/대</span>
            <span style={{ fontSize: 14, color: "#58a6ff", fontWeight: 700 }}>{fmt(consumablePerUnit)}</span>
          </div>
          <input
            type="range" min={0} max={200000} step={5000}
            value={consumablePerUnit}
            onChange={(e) => setConsumablePerUnit(+e.target.value)}
            style={{ width: "100%", accentColor: "#58a6ff" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#484f58", marginTop: 4 }}>
            <span>$0 (장비만)</span><span>$100K</span><span>$200K</span>
          </div>
        </div>

        {/* PSR */}
        <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#8b949e" }}>PSR (매출 대비 시총 배수)</span>
            <span style={{ fontSize: 14, color: "#d2a8ff", fontWeight: 700 }}>{psr}x</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {PSR_OPTIONS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPsr(p.value)}
                style={{
                  background: psr === p.value ? p.color : "#0d1117",
                  color: psr === p.value ? "#fff" : "#8b949e",
                  border: `1px solid ${psr === p.value ? p.color : "#30363d"}`,
                  borderRadius: 4,
                  padding: "4px 10px",
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: psr === p.value ? 700 : 400,
                  transition: "all 0.15s",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dilution & Holdings */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "#8b949e" }}>추가 희석</span>
              <span style={{ fontSize: 13, color: "#f85149", fontWeight: 700 }}>{dilutionPct}%</span>
            </div>
            <input
              type="range" min={0} max={50} step={5}
              value={dilutionPct}
              onChange={(e) => setDilutionPct(+e.target.value)}
              style={{ width: "100%", accentColor: "#f85149" }}
            />
          </div>
          <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 11, color: "#8b949e", marginBottom: 6 }}>보유 주식수</div>
            <input
              type="number"
              value={holdings}
              onChange={(e) => setHoldings(+e.target.value || 0)}
              style={{
                width: "100%",
                background: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: 4,
                color: "#e6edf3",
                padding: "6px 8px",
                fontSize: 13,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #21262d" }}>
              {["시나리오", "판매(대)", "총매출", "시총", "주가", "수익률", "내 포트폴리오"].map((h,i) => (
                <th key={i} style={{
                  padding: "8px 6px",
                  textAlign: i < 2 ? "left" : "right",
                  color: "#8b949e",
                  fontWeight: 600,
                  fontSize: 10,
                  letterSpacing: 0.5,
                  whiteSpace: "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const isPositive = r.upside > 0;
              const bgColor = i % 2 === 0 ? "#0d1117" : "#161b22";
              return (
                <tr key={i} style={{ background: bgColor, borderBottom: "1px solid #21262d" }}>
                  <td style={{ padding: "10px 6px" }}>
                    <div style={{ color: "#e6edf3", fontWeight: 600, fontSize: 12 }}>{r.label}</div>
                    <div style={{ color: "#484f58", fontSize: 9, marginTop: 2 }}>{r.desc}</div>
                  </td>
                  <td style={{ padding: "10px 6px", color: "#58a6ff", fontWeight: 700 }}>{r.units.toLocaleString()}</td>
                  <td style={{ padding: "10px 6px", textAlign: "right", color: "#c9d1d9" }}>{fmt(r.totalRev)}</td>
                  <td style={{ padding: "10px 6px", textAlign: "right", color: "#c9d1d9" }}>
                    <div>{fmt(r.marketCap)}</div>
                    <div style={{ fontSize: 9, color: "#484f58" }}>{fmtKRW(r.marketCap)}</div>
                  </td>
                  <td style={{
                    padding: "10px 6px",
                    textAlign: "right",
                    fontWeight: 800,
                    fontSize: 14,
                    color: r.pricePerShare >= 4 ? "#3fb950" : r.pricePerShare >= 2 ? "#58a6ff" : "#f0883e",
                  }}>
                    ${r.pricePerShare.toFixed(2)}
                  </td>
                  <td style={{
                    padding: "10px 6px",
                    textAlign: "right",
                    fontWeight: 700,
                    color: isPositive ? "#3fb950" : "#f85149",
                  }}>
                    {isPositive ? "+" : ""}{r.upside.toFixed(0)}%
                  </td>
                  <td style={{ padding: "10px 6px", textAlign: "right" }}>
                    <div style={{ color: "#e6edf3", fontWeight: 600 }}>{fmt(r.portfolioValue)}</div>
                    <div style={{ fontSize: 9, color: "#484f58" }}>{fmtKRW(r.portfolioValue)}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Visual bar chart */}
      <div style={{ marginTop: 28, background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 11, color: "#8b949e", marginBottom: 14, fontWeight: 600 }}>주가 시각화</div>
        <div style={{ position: "relative" }}>
          {rows.map((r, i) => {
            const maxPrice = Math.max(...rows.map(x => x.pricePerShare));
            const pct = (r.pricePerShare / maxPrice) * 100;
            const color = r.pricePerShare >= 4 ? "#3fb950" : r.pricePerShare >= 2 ? "#58a6ff" : "#f0883e";
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 60, fontSize: 10, color: "#8b949e", textAlign: "right", flexShrink: 0 }}>
                  {r.units.toLocaleString()}대
                </div>
                <div style={{ flex: 1, position: "relative", height: 22 }}>
                  <div style={{
                    position: "absolute",
                    left: 0, top: 0,
                    height: "100%",
                    width: `${Math.max(pct, 2)}%`,
                    background: `linear-gradient(90deg, ${color}33, ${color}88)`,
                    borderRadius: 3,
                    transition: "width 0.4s ease",
                  }} />
                  <div style={{
                    position: "absolute",
                    left: `${Math.max(pct, 2)}%`,
                    top: "50%",
                    transform: "translateY(-50%)",
                    marginLeft: 6,
                    fontSize: 11,
                    color,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}>
                    ${r.pricePerShare.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
          {/* Current price line */}
          {(() => {
            const maxPrice = Math.max(...rows.map(x => x.pricePerShare));
            const currentPct = (CURRENT_PRICE / maxPrice) * 100;
            return (
              <div style={{
                position: "absolute",
                left: `calc(60px + 8px + ${currentPct}%)`,
                top: 0,
                bottom: 0,
                borderLeft: "1px dashed #f85149",
                zIndex: 5,
              }}>
                <div style={{
                  position: "absolute",
                  top: -14,
                  left: -20,
                  fontSize: 8,
                  color: "#f85149",
                  whiteSpace: "nowrap",
                  fontWeight: 700,
                }}>현재 ${CURRENT_PRICE}</div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Risk callouts */}
      <div style={{
        marginTop: 24,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
      }}>
        <div style={{ background: "#1c1210", border: "1px solid #462c1e", borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 10, color: "#f85149", fontWeight: 700, marginBottom: 4 }}>핵심 리스크</div>
          <div style={{ fontSize: 10, color: "#c9d1d9", lineHeight: 1.6 }}>
            • 2026 가이던스 매출 ~$1M<br/>
            • 확보된 주문 없음 (Q4 콜)<br/>
            • 연간 캐시번 ~$93M<br/>
            • 출시 시 18/20 아미노산<br/>
            • 희석 가능성 (2028 Q2 이후)
          </div>
        </div>
        <div style={{ background: "#0d1a12", border: "1px solid #1e462c", borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 10, color: "#3fb950", fontWeight: 700, marginBottom: 4 }}>카탈리스트</div>
          <div style={{ fontSize: 10, color: "#c9d1d9", lineHeight: 1.6 }}>
            • AACR 포스터 데이터 (4/20, 4/22)<br/>
            • Proteus 로드쇼 반응<br/>
            • 첫 Pre-order 발표 시<br/>
            • 독립 연구실 검증 논문<br/>
            • 20 아미노산 달성 발표
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{
        marginTop: 20,
        padding: 10,
        background: "#161b22",
        borderRadius: 6,
        fontSize: 9,
        color: "#484f58",
        lineHeight: 1.5,
        textAlign: "center",
      }}>
        ⚠️ 투자 조언이 아닙니다. PSR 배수는 시장 심리에 따라 극단적으로 변동합니다.
        프리-레비뉴 바이오텍의 PSR은 고정값이 아니라 기대감의 함수입니다.
        모든 수치는 가정 기반 시뮬레이션이며, 실제 주가와 무관합니다.
      </div>
    </div>
  );
}
