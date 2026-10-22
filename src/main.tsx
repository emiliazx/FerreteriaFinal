<<<<<<< HEAD
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
=======
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import "bootstrap/dist/css/bootstrap.min.css"
>>>>>>> origin/main
import './index.css'

<<<<<<< HEAD
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
=======
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  
  </StrictMode>,
>>>>>>> origin/main
)
