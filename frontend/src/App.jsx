import { Routes, Route } from 'react-router-dom'
import Sandbox from './playground/Sandbox.jsx'
import Register from './components/auth/Register.jsx'

function App() {
  return (
    <Routes>
      <Route path="/sandbox" element={<Sandbox />} />
      <Route path="register" element={<Register />} />
    </Routes>
  )
}

export default App