import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import QSISimulator from './QSISimulator'
import CRBUSimulator from './CRBUSimulator'

function App() {
  const [tab, setTab] = useState('qsi')

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      background: '#0a0e17',
      minHeight: '100vh',
    }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #21262d',
        position: 'sticky',
        top: 0,
        background: '#0a0e17',
        zIndex: 100,
      }}>
        <button
          onClick={() => setTab('qsi')}
          style={{
            flex: 1,
            padding: '14px 0',
            background: tab === 'qsi' ? '#161b22' : 'transparent',
            color: tab === 'qsi' ? '#58a6ff' : '#8b949e',
            border: 'none',
            borderBottom: tab === 'qsi' ? '2px solid #1f6feb' : '2px solid transparent',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: 'pointer',
            letterSpacing: 1,
          }}
        >
          QSI · Proteus
        </button>
        <button
          onClick={() => setTab('crbu')}
          style={{
            flex: 1,
            padding: '14px 0',
            background: tab === 'crbu' ? '#161b22' : 'transparent',
            color: tab === 'crbu' ? '#da3633' : '#8b949e',
            border: 'none',
            borderBottom: tab === 'crbu' ? '2px solid #da3633' : '2px solid transparent',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: 'pointer',
            letterSpacing: 1,
          }}
        >
          CRBU · CAR-T
        </button>
      </div>

      {tab === 'qsi' ? <QSISimulator /> : <CRBUSimulator />}

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #21262d',
        textAlign: 'center',
        fontSize: 9,
        color: '#484f58',
        lineHeight: 1.5,
      }}>
        팩트체크 완료된 공개 데이터 기반 시뮬레이션 · 투자 조언 아님 · Built with Claude
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
