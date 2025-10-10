import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CreateInvoice from './pages/CreateInvoice'
import Invoices from './pages/Invoices'
import Assets from './pages/Assets'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<Layout />}>
          <Route path="/create-invoice" element={<CreateInvoice />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/assets" element={<Assets />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App;
