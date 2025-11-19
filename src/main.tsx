import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IframeScenarioChangeStyle from './IframeScenarioChangeStyle'
import IframeScenario from './IframeScenario'
import IframeScenarioAsis from './IframeScenarioAsis'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IframeScenarioAsis />} />
        <Route path="/v2" element={<IframeScenario />} />
        {/* 2025.11.12 스타일변경 테스트 */}
        <Route path="/v3" element={<IframeScenarioChangeStyle />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
