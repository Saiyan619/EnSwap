import './App.css'
import BackgroundGlow from './global/BackgroundGlow'
import Navbar from './global/Navbar'
import { SwapCard } from './swap/Swap'

function App() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundGlow />
    <Navbar />
       <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <SwapCard />
      </div>
    </div>
  )
}

export default App
