import { Route, Routes } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './pages/Home'
import Blogs from './pages/Blogs'
import BlogDetail from './pages/BlogDetail'
import Trades from './pages/Trades'
import Admin from './pages/Admin'
import './styles.css'

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:slug" element={<BlogDetail />} />
        <Route path="/trades" element={<Trades />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  )
}
