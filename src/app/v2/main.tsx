import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import IframeScenario from '../../IframeScenarioAsis'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IframeScenario />
  </StrictMode>,
)
