import './App.css'
import Header from './components/Header'
import Hero from './components/Hero'
import FeatureCards from './components/FeatureCards'
import InvoicelyLogo3D from './components/InvoicelyLogo3D'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <FeatureCards />
      <InvoicelyLogo3D />
    </div>
  )
}

export default App;
