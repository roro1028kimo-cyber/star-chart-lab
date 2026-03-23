import './App.css'
import { APP_COPY, getTaiwanToday } from './content'
import { DashboardView } from './components/DashboardView'
import { InteractiveTransition } from './components/InteractiveTransition'
import { LandingView } from './components/LandingView'
import { TarotView } from './components/TarotView'
import { useChartExperience } from './hooks/useChartExperience'
import { useMotionPreference } from './hooks/useMotionPreference'

function App() {
  const prefersReducedMotion = useMotionPreference()
  const experience = useChartExperience({ prefersReducedMotion })
  const today = getTaiwanToday()
  const isTransitionView = experience.view === 'entry-transition' || experience.view === 'premium-transition'

  const shellClassName = [
    'page-shell',
    isTransitionView ? 'page-shell--transition' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={shellClassName}>
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

      {experience.view === 'dashboard' && experience.chart && (
        <DashboardView
          activeSection={experience.activeSection}
          chart={experience.chart}
          onBackHome={experience.resetToLanding}
          onOpenPremium={experience.openPremium}
          onOpenTarot={experience.openTarot}
          onSelectSection={experience.selectSection}
          vipUnlocked={experience.vipUnlocked}
        />
      )}

      {experience.view === 'premium-transition' && (
        <InteractiveTransition
          variant="premium"
          title={APP_COPY.premiumTransitionTitle}
          lead={APP_COPY.premiumTransitionLead}
          hint={APP_COPY.premiumTransitionHint}
        />
      )}

      {experience.view === 'tarot' && experience.chart && (
        <TarotView
          chart={experience.chart}
          onBackHome={experience.resetToLanding}
          onBackDashboard={experience.backToDashboard}
        />
      )}
    </div>
  )
}

export default App
