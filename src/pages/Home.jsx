import Hero from "../components/pages/home/Hero";
import People from "../components/pages/home/People";
import Publications from "../components/pages/home/Publications";
import Research from "../components/pages/home/Research";
import Statement from "../components/pages/home/Statement";
import Collaborations from "./../components/pages/home/Collaborations"
import Updates from './../components/pages/home/Updates'
import Genesis from './../components/pages/home/Genesis'
function Home() {
  return (
      <>
        <Hero />
        <Statement />
        <Research />
        <People />
        <Publications />
        <Collaborations />
        <Updates />
        <Genesis />
      </>
  )
}

export default Home;













