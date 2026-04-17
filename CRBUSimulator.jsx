import { useState, useMemo } from "react";

const SHARES = 95143690;
const CURRENT_PRICE = 2.20;
const CASH = 142800000;
const ANNUAL_BURN = 111000000;
const CURRENT_MCAP = SHARES * CURRENT_PRICE;

// Peak sales estimates for approved CAR-T therapies as comparables
// Yescarta ~$1.2B, Breyanzi ~$0.9B, Abecma ~$0.5B, Carvykti ~$1B+
// Allogeneic discount: manufacturing advantage but durability/efficacy questions

const MILESTONES = [
  {
    id: "antler_p3",
    label: "Vispa-cel Phase 3 개시",
    desc: "FDA와 피보탈 디자인 협의 후 P3 시작 (2L LBCL)",
    probability: 0.70,
    mcapImpact: 450000000, // market cap at this milestone
  },
  {
    id: "cb011_expansion",
    label: "CB-011 Dose Expansion 데이터",
    desc: "다발성골수종 확장코호트 ORR/CR 확인",
    probability: 0.60,
    mcapImpact: 550000000,
  },
  {
    id: "antler_p3_data",
    label: "Vispa-cel Phase 3 중간 데이터",
    desc: "P3에서 자가 CAR-T 대비 비열등성 트렌드",
    probability: 0.35,
    mcapImpact: 1200000000,
  },
  {
    id: "partnership",
    label: "대형 파트너십/라이센싱",
    desc: "Big Pharma와 글로벌 상업화 계약",
    probability: 0.30,
    mcapImpact: 1500000000,
  },
  {
    id: "bla_filing",
    label: "Vispa-cel BLA 신청",
    desc: "FDA 허가 신청 단계 도달",
    probability: 0.20,
    mcapImpact: 2500000000,
  },
  {
    id: "approval",
    label: "FDA 승인 + 상업 출시",
    desc: "최초의 allo CAR-T 승인 시 시장 재평가",
    probability: 0.12,
    mcapImpact: 4000000000,
  },
  {
    id: "peak_sales",
    label: "피크 매출 $1B+ 달성",
    desc: "Vispa-cel + CB-011 합산 블록버스터",
    probability: 0.08,
    mcapImpact: 8000000000,
  },
];

function fmt(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toFixed(2)}`;
}

function fmtKRW(usd) {
  const krw = usd * 1420;
  if (krw >= 1e12) return `${(krw / 1e12).toFixed(2)}조원`;
  if (krw >= 1e8) return `${(krw / 1e8).toFixed(0)}억원`;
  return `${(krw / 1e4).toFixed(0)}만원`;
}

export default function CRBUSimulator() {
  const [dilutionPct, setDilutionPct] = useState(15);
  const [holdings, setHoldings] = useState(0);
  const [selectedMilestones, setSelectedMilestones] = useState(
    new Set(["antler_p3", "cb011_expansion"])
  );

  const dilutedShares = SHARES * (1 + dilutionPct / 100);
  const cashRunwayMonths = Math.floor((CASH / ANNUAL_BURN) * 12);

  const toggle = (id) => {
    setSelectedMilestones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const rows = useMemo(() => {
    return MILESTONES.map((m) => {
      const pricePerShare = m.mcapImpact / dilutedShares;
      const upside = ((pricePerShare - CURRENT_PRICE) / CURRENT_PRICE) * 100;
      const portfolioValue = holdings * pricePerShare;
      const riskAdjPrice = pricePerShare * m.probability;
      return { ...m, pricePerShare, upside, portfolioValue, riskAdjPrice };
    });
  }, [dilutedShares, holdings]);

  // Expected value calc
  const expectedValue = useMemo(() => {
    let maxMcap = CURRENT_MCAP;
    rows.forEach((r) => {
      if (selectedMilestones.has(r.id) && r.mcapImpact > maxMcap) {
        maxMcap = r.mcapImpact;
      }
    });
    // weighted by probability of reaching highest selected milestone
    const selectedRows = rows.filter((r) => selectedMilestones.has(r.id));
    if (selectedRows.length === 0)
      return { price: CURRENT_PRICE, mcap: CURRENT_MCAP };
    const highest = selectedRows.reduce((a, b) =>
      a.mcapImpact > b.mcapImpact ? a : b
    );
    const adjMcap =
      highest.mcapImpact * highest.probability +
      CURRENT_MCAP * (1 - highest.probability);
    return { price: adjMcap / dilutedShares, mcap: adjMcap };
  }, [rows, selectedMilestones, dilutedShares]);

  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
        background: "#0a0e17",
        color: "#c9d1d9",
        minHeight: "100vh",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #21262d",
          paddingBottom: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              background: "#da3633",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 3,
              letterSpacing: 1.5,
            }}
          >
            CRBU
          </div>
          <span style={{ color: "#8b949e", fontSize: 11 }}>
            NASDAQ: CRBU · Allo CAR-T
          </span>
          <span
            style={{ color: "#f0883e", fontSize: 11, marginLeft: "auto" }}
          >
            현재 ${CURRENT_PRICE}
          </span>
        </div>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#e6edf3",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          파이프라인 마일스톤 → 주가 시뮬레이터
        </h1>
        <p style={{ fontSize: 11, color: "#8b949e", margin: "6px 0 0" }}>
          주식수 {(SHARES / 1e6).toFixed(1)}M · 캐시 ${fmt(CASH)} (
          {cashRunwayMonths}개월 런웨이, 2027 H2까지) · 시총{" "}
          {fmt(CURRENT_MCAP)}
        </p>
      </div>

      {/* Pipeline overview */}
      <div
        style={{
          background: "#161b22",
          border: "1px solid #21262d",
          borderRadius: 8,
          padding: 14,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#8b949e",
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          핵심 파이프라인 현황
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div
            style={{
              background: "#0d1117",
              borderRadius: 6,
              padding: 10,
              borderLeft: "3px solid #58a6ff",
            }}
          >
            <div
              style={{ fontSize: 12, color: "#58a6ff", fontWeight: 700 }}
            >
              Vispa-cel (CB-010)
            </div>
            <div style={{ fontSize: 10, color: "#c9d1d9", marginTop: 4 }}>
              Anti-CD19 · 2L LBCL
            </div>
            <div style={{ fontSize: 10, color: "#8b949e", marginTop: 2 }}>
              P1: 82% ORR, 64% CR
            </div>
            <div style={{ fontSize: 10, color: "#3fb950", marginTop: 2 }}>
              → P3 피보탈 준비 중
            </div>
          </div>
          <div
            style={{
              background: "#0d1117",
              borderRadius: 6,
              padding: 10,
              borderLeft: "3px solid #d2a8ff",
            }}
          >
            <div
              style={{ fontSize: 12, color: "#d2a8ff", fontWeight: 700 }}
            >
              CB-011
            </div>
            <div style={{ fontSize: 10, color: "#c9d1d9", marginTop: 4 }}>
              Anti-BCMA · r/r 다발성골수종
            </div>
            <div style={{ fontSize: 10, color: "#8b949e", marginTop: 2 }}>
              RDE: 92% ORR, 75% ≥CR
            </div>
            <div style={{ fontSize: 10, color: "#f0883e", marginTop: 2 }}>
              → Dose Expansion 중
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: "#161b22",
            border: "1px solid #21262d",
            borderRadius: 8,
            padding: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 11, color: "#8b949e" }}>추가 희석</span>
            <span
              style={{ fontSize: 13, color: "#f85149", fontWeight: 700 }}
            >
              {dilutionPct}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={60}
            step={5}
            value={dilutionPct}
            onChange={(e) => setDilutionPct(+e.target.value)}
            style={{ width: "100%", accentColor: "#f85149" }}
          />
          <div
            style={{
              fontSize: 9,
              color: "#484f58",
              marginTop: 4,
              textAlign: "center",
            }}
          >
            P3 자금조달 시 20~40% 희석 예상
          </div>
        </div>
        <div
          style={{
            background: "#161b22",
            border: "1px solid #21262d",
            borderRadius: 8,
            padding: 14,
          }}
        >
          <div style={{ fontSize: 11, color: "#8b949e", marginBottom: 6 }}>
            보유 주식수
          </div>
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

      {/* Milestone table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #21262d" }}>
              {[
                "",
                "마일스톤",
                "성공확률",
                "시총",
                "주가",
                "수익률",
                holdings > 0 ? "포트폴리오" : "리스크조정 주가",
              ].map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: "8px 4px",
                    textAlign: i < 2 ? "left" : "right",
                    color: "#8b949e",
                    fontWeight: 600,
                    fontSize: 10,
                    letterSpacing: 0.5,
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const bgColor = i % 2 === 0 ? "#0d1117" : "#161b22";
              const isSelected = selectedMilestones.has(r.id);
              const probColor =
                r.probability >= 0.5
                  ? "#3fb950"
                  : r.probability >= 0.2
                  ? "#f0883e"
                  : "#f85149";
              return (
                <tr
                  key={i}
                  style={{
                    background: bgColor,
                    borderBottom: "1px solid #21262d",
                    opacity: isSelected ? 1 : 0.5,
                  }}
                >
                  <td style={{ padding: "8px 4px", width: 30 }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(r.id)}
                      style={{ accentColor: "#58a6ff" }}
                    />
                  </td>
                  <td style={{ padding: "8px 4px" }}>
                    <div
                      style={{
                        color: "#e6edf3",
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    >
                      {r.label}
                    </div>
                    <div
                      style={{ color: "#484f58", fontSize: 9, marginTop: 2 }}
                    >
                      {r.desc}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "8px 4px",
                      textAlign: "right",
                      color: probColor,
                      fontWeight: 700,
                    }}
                  >
                    {(r.probability * 100).toFixed(0)}%
                  </td>
                  <td
                    style={{
                      padding: "8px 4px",
                      textAlign: "right",
                      color: "#c9d1d9",
                    }}
                  >
                    <div>{fmt(r.mcapImpact)}</div>
                    <div style={{ fontSize: 9, color: "#484f58" }}>
                      {fmtKRW(r.mcapImpact)}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "8px 4px",
                      textAlign: "right",
                      fontWeight: 800,
                      fontSize: 14,
                      color:
                        r.pricePerShare >= 10
                          ? "#3fb950"
                          : r.pricePerShare >= 4
                          ? "#58a6ff"
                          : "#f0883e",
                    }}
                  >
                    ${r.pricePerShare.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "8px 4px",
                      textAlign: "right",
                      fontWeight: 700,
                      color: r.upside > 0 ? "#3fb950" : "#f85149",
                    }}
                  >
                    +{r.upside.toFixed(0)}%
                  </td>
                  <td
                    style={{
                      padding: "8px 4px",
                      textAlign: "right",
                    }}
                  >
                    {holdings > 0 ? (
                      <>
                        <div
                          style={{ color: "#e6edf3", fontWeight: 600 }}
                        >
                          {fmt(r.portfolioValue)}
                        </div>
                        <div style={{ fontSize: 9, color: "#484f58" }}>
                          {fmtKRW(r.portfolioValue)}
                        </div>
                      </>
                    ) : (
                      <span style={{ color: "#8b949e" }}>
                        ${r.riskAdjPrice.toFixed(2)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Expected value summary */}
      <div
        style={{
          marginTop: 20,
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: 8,
          padding: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#8b949e",
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          선택된 최고 마일스톤 기준 확률가중 기대가치
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
          }}
        >
          <div>
            <span
              style={{ fontSize: 24, fontWeight: 800, color: "#58a6ff" }}
            >
              ${expectedValue.price.toFixed(2)}
            </span>
            <span
              style={{ fontSize: 11, color: "#8b949e", marginLeft: 6 }}
            >
              확률가중 주가
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#484f58" }}>
            시총 {fmt(expectedValue.mcap)}
          </div>
          {holdings > 0 && (
            <div style={{ fontSize: 11, color: "#3fb950" }}>
              포트폴리오 {fmt(holdings * expectedValue.price)} (
              {fmtKRW(holdings * expectedValue.price)})
            </div>
          )}
        </div>
      </div>

      {/* Visual bar chart */}
      <div
        style={{
          marginTop: 20,
          background: "#161b22",
          border: "1px solid #21262d",
          borderRadius: 8,
          padding: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#8b949e",
            marginBottom: 14,
            fontWeight: 600,
          }}
        >
          마일스톤별 도달 주가 (희석 {dilutionPct}% 반영)
        </div>
        {rows.map((r, i) => {
          const maxPrice = Math.max(...rows.map((x) => x.pricePerShare));
          const pct = (r.pricePerShare / maxPrice) * 100;
          const color =
            r.pricePerShare >= 10
              ? "#3fb950"
              : r.pricePerShare >= 4
              ? "#58a6ff"
              : "#f0883e";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
                opacity: selectedMilestones.has(r.id) ? 1 : 0.35,
              }}
            >
              <div
                style={{
                  width: 80,
                  fontSize: 9,
                  color: "#8b949e",
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {r.label.length > 12
                  ? r.label.slice(0, 12) + "…"
                  : r.label}
              </div>
              <div style={{ flex: 1, position: "relative", height: 20 }}>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: `${Math.max(pct, 2)}%`,
                    background: `linear-gradient(90deg, ${color}33, ${color}88)`,
                    borderRadius: 3,
                    transition: "width 0.4s ease",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: `${Math.max(pct, 2)}%`,
                    top: "50%",
                    transform: "translateY(-50%)",
                    marginLeft: 6,
                    fontSize: 11,
                    color,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  ${r.pricePerShare.toFixed(2)}{" "}
                  <span style={{ fontSize: 8, color: "#484f58" }}>
                    ({(r.probability * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk callouts */}
      <div
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <div
          style={{
            background: "#1c1210",
            border: "1px solid #462c1e",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "#f85149",
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            핵심 리스크
          </div>
          <div style={{ fontSize: 10, color: "#c9d1d9", lineHeight: 1.6 }}>
            • 캐시 $142.8M, 2027 H2까지
            <br />
            • P3 자금조달 시 대규모 희석
            <br />
            • Allo CAR-T 내구성 미검증
            <br />
            • 자가 CAR-T 대비 열등성 가능
            <br />• 인력 32% 감축 완료
          </div>
        </div>
        <div
          style={{
            background: "#0d1a12",
            border: "1px solid #1e462c",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "#3fb950",
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            카탈리스트
          </div>
          <div style={{ fontSize: 10, color: "#c9d1d9", lineHeight: 1.6 }}>
            • Vispa-cel P1: 82% ORR 강력
            <br />
            • CB-011: 92% ORR, 75% CR
            <br />
            • FDA Fast Track 지정
            <br />
            • P3 디자인 FDA 협의 중<br />• Big Pharma 파트너십 가능성
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div
        style={{
          marginTop: 20,
          padding: 10,
          background: "#161b22",
          borderRadius: 6,
          fontSize: 9,
          color: "#484f58",
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        ⚠️ 투자 조언이 아닙니다. 임상 바이오텍의 가치는 파이프라인 성공 확률에
        극도로 의존합니다. 성공확률은 업계 평균 기반 추정치이며, P3 자금조달 시
        20~40% 희석은 거의 확실합니다. 모든 수치는 시뮬레이션이며 실제 주가와
        무관합니다.
      </div>
    </div>
  );
}
