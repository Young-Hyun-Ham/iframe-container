import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IframeScenario from './IframeScenario'
import IframeScenarioAsis from './IframeScenarioAsis'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IframeScenarioAsis />} />
        <Route path="/v2" element={<IframeScenario />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
