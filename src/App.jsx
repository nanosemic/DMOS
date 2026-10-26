import Home from './pages/Home'
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import { Route, Routes } from 'react-router-dom'
export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* for future work */}
        {/* <Route path="/research" element={<Home />} />
        <Route path="/projects" element={<Home />} />
        <Route path="/publication" element={<Home />} />
        <Route path="/teams" element={<Home />} />
        <Route path="/news" element={<Home />} /> */}

      </Routes>
      <Footer />
    </>
  )
}
