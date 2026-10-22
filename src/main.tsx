<<<<<<< HEAD
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
=======
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import "bootstrap/dist/css/bootstrap.min.css"
>>>>>>> a9d32bf15f0a9a10015bd94ed0b0804020ffe848
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
>>>>>>> a9d32bf15f0a9a10015bd94ed0b0804020ffe848
)
