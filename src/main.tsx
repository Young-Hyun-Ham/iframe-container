import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import IframeScenrio from './IframeScenrio.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IframeScenrio />
  </StrictMode>,
)
