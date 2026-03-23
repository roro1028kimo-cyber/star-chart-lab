import './App.css'
import { APP_COPY, getTaiwanToday } from './content'
import { InteractiveTransition } from './components/InteractiveTransition'
import { LandingView } from './components/LandingView'
import { PremiumView } from './components/PremiumView'
import { StoryView } from './components/StoryView'
import { Topbar } from './components/Topbar'
import { useChartExperience } from './hooks/useChartExperience'
import { useMotionPreference } from './hooks/useMotionPreference'

function App() {
  const prefersReducedMotion = useMotionPreference()
  const experience = useChartExperience({ prefersReducedMotion })
  const today = getTaiwanToday()

  const showTopbar = experience.view === 'story' || experience.view === 'premium'

  return (
    <div className={`page-shell ${experience.view === 'premium' ? 'page-shell--light' : ''}`}>
      {showTopbar && <Topbar />}

      {experience.view === 'landing' && (
        <LandingView
          chartError={experience.chartError}
          chartLoading={experience.chartLoading}
          date={experience.date}
          onPlaceQueryChange={experience.handlePlaceQueryChange}
          onSelectPlace={experience.selectPlace}
          onSubmit={experience.handleSubmit}
          placeError={experience.placeError}
          placeLoading={experience.placeLoading}
          placeQuery={experience.placeQuery}
          placeResults={experience.placeResults}
          selectedPlace={experience.selectedPlace}
          setDate={experience.setDate}
          setTime={experience.setTime}
          time={experience.time}
          today={today}
        />
      )}

      {experience.view === 'entry-transition' && (
        <InteractiveTransition
          variant="entry"
          title={APP_COPY.entryTransitionTitle}
          lead={APP_COPY.entryTransitionLead}
          hint={APP_COPY.entryTransitionHint}
        />
      )}

      {experience.view === 'story' && experience.chart && (
        <StoryView chart={experience.chart} onOpenPremium={experience.openPremium} onReset={experience.resetToLanding} />
      )}

      {experience.view === 'premium-transition' && (
        <InteractiveTransition
          variant="premium"
          title={APP_COPY.premiumTransitionTitle}
          lead={APP_COPY.premiumTransitionLead}
          hint={APP_COPY.premiumTransitionHint}
        />
      )}

      {experience.view === 'premium' && experience.chart && (
        <PremiumView
          chart={experience.chart}
          onBackHome={experience.resetToLanding}
          onBackStory={experience.backToStory}
        />
      )}
    </div>
  )
}

export default App
