import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Inbox } from './pages/Inbox'
import { Archive } from './pages/Archive'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:slug" element={<Inbox />} />
        <Route path="/:slug/archive" element={<Archive />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
