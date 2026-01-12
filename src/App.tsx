import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import SearchInputPage from './pages/SearchInputPage'
import SearchResultsPage from './pages/SearchResultsPage'
import AbilityDetailPage from './pages/AbilityDetailPage'
import CartPage from './pages/CartPage'
import RecommendationPage from './pages/RecommendationPage'
import SelectionHistoryPage from './pages/SelectionHistoryPage'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="search" element={<SearchInputPage />} />
            <Route path="results" element={<SearchResultsPage />} />
            <Route path="ability/:id" element={<AbilityDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="recommendation" element={<RecommendationPage />} />
            <Route path="history" element={<SelectionHistoryPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App

