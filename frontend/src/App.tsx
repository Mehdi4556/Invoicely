import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AssetsProvider } from './contexts/AssetsContext'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import CreateInvoice from './pages/CreateInvoice'
import Invoices from './pages/Invoices'
import Assets from './pages/Assets'
import AuthCallback from './pages/AuthCallback'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AssetsProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route element={<Layout />}>
                <Route path="/create-invoice" element={<CreateInvoice />} />
                <Route path="/edit-invoice/:id" element={<CreateInvoice />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/assets" element={<Assets />} />
              </Route>
            </Routes>
          </Router>
        </AssetsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App;
