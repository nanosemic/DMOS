import ResearchHero from '../components/pages/research/ResearchHero'
import ResearchSequence from '../components/pages/research/ResearchSequence'
import ResearchThemes from '../components/pages/research/ResearchThemes'
import ResearchCapabilities from '../components/pages/research/ResearchCapabilities'
import ResearchProjects from '../components/pages/research/ResearchProjects'
import ResearchJoin from '../components/pages/research/ResearchJoin'

// Research page, built section by section.
function Research() {
  return (
    <>
      <ResearchHero />
      <ResearchSequence />
      <ResearchThemes />
      <ResearchCapabilities />
      <ResearchProjects />
      <ResearchJoin />
    </>
  )
}

export default Research
