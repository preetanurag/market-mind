import { Route, Routes } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './pages/Home'
import Posts from './pages/Posts'
import PostDetail from './pages/PostDetail'
import Admin from './pages/Admin'
import './styles.css'

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blogs" element={<Posts type="blog" eyebrow="Blogs" title="Market notes, psychology, and process thinking." />} />
        <Route path="/trades" element={<Posts type="trade_note" eyebrow="Trade Notes" title="Setups, decisions, and post-trade learning." />} />
        <Route path="/posts/:slug" element={<PostDetail />} />
        <Route path="/preet-admin" element={<Admin />} />
      </Routes>
    </>
  )
}
