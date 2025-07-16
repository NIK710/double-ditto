import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <h1 className="text-4xl font-bold text-blue-700">Tailwind is working!</h1>
    </div>
  )
}

export default App
