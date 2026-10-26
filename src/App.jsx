import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Statement from './components/Statement'
import Research from './components/Research'
import People from './components/People'
import Publications from './components/Publications'
import Collaborations from './components/Collaborations'
import Updates from './components/Updates'
import Genesis from './components/Genesis'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Statement />
        <Research />
        <People />
        <Publications />
        <Collaborations />
        <Updates />
        <Genesis />
      </main>
      <Footer />
    </>
  )
}
