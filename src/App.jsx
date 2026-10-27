import Home from './pages/Home'
import Research from './pages/Research'
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import { Route, Routes } from 'react-router-dom'
export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/research" element={<Research />} />

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
