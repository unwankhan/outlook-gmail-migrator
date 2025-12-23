//frontend/src/App-working.jsx
import React from 'react'

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        background: 'rgba(255,255,255,0.1)',
        padding: '40px',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🚀 CloudMigrator Pro</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>Outlook to Gmail Migration Tool</p>
        
        <button 
          style={{
            padding: '12px 24px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
          onClick={() => alert('App is working! 🎉')}
        >
          Test Button - Click Me!
        </button>
      </div>
    </div>
  )
}

export default App
