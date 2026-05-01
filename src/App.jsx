import { useState } from 'react'
import { Button } from './ui/antd'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'

import PostIschemicStroke from './ui/PostIschemicStroke'
import LifestyleandRiskAssessment from './ui/LifestyleandRiskAssessment'

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  // Keeps both histories alive while switching routes. Clears only on browser refresh.
  const [postIschemicHistoryRecords, setPostIschemicHistoryRecords] = useState([])
  const [lifestyleHistoryRecords, setLifestyleHistoryRecords] = useState([])

  const currentPath = location.pathname

  return (
    <div>
      {/* MENU */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          padding: '10px',
          background: '#e6f0ff',
        }}
      >
        <Button
          type={currentPath === '/' ? 'primary' : 'default'}
          onClick={() => navigate('/')}
        >
          Post-Ischemic Stroke
        </Button>

        <Button
          type={currentPath === '/lifestyle' ? 'primary' : 'default'}
          onClick={() => navigate('/lifestyle')}
        >
          Lifestyle Risk Assessment
        </Button>
      </div>

      {/* ROUTES */}
      <Routes>
        <Route
          path="/"
          element={
            <PostIschemicStroke
              visitHistoryRecords={postIschemicHistoryRecords}
              setVisitHistoryRecords={setPostIschemicHistoryRecords}
            />
          }
        />

        <Route
          path="/lifestyle"
          element={
            <LifestyleandRiskAssessment
              lifestyleHistoryRecords={lifestyleHistoryRecords}
              setLifestyleHistoryRecords={setLifestyleHistoryRecords}
            />
          }
        />
      </Routes>
    </div>
  )
}

export default App