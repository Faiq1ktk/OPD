import { Button } from './ui/antd'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'

import PostIschemicStroke from './ui/PostIschemicStroke'
import LifestyleandRiskAssessment from './ui/LifestyleandRiskAssessment'

function App() {
  const navigate = useNavigate()
  const location = useLocation()

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
        <Route path="/" element={<PostIschemicStroke />} />
        <Route path="/lifestyle" element={<LifestyleandRiskAssessment />} />
      </Routes>
    </div>
  )
}

export default App