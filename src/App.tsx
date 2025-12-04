import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { Landing } from "@/pages/Landing"
import { About } from "@/pages/About"
import { Features } from "@/pages/Features"
import { SupportBot } from "@/components/SupportBot"

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
        </Routes>
        <SupportBot />
      </div>
    </BrowserRouter>
  )
}

export default App