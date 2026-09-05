import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

import { SiteLayout } from '@/components/layout/SiteLayout'

/*
 * Every public page is its own lazy chunk, and the whole admin CMS is one further chunk that
 * a visitor to the public site never downloads (SPEC §7).
 */

const Home = lazy(() => import('@/pages/Home'))
const About = lazy(() => import('@/pages/About'))
const Academics = lazy(() => import('@/pages/Academics'))
const Admissions = lazy(() => import('@/pages/Admissions'))
const SchoolLife = lazy(() => import('@/pages/SchoolLife'))
const Gallery = lazy(() => import('@/pages/Gallery'))
const News = lazy(() => import('@/pages/News'))
const NewsArticle = lazy(() => import('@/pages/NewsArticle'))
const EventDetail = lazy(() => import('@/pages/EventDetail'))
const Contact = lazy(() => import('@/pages/Contact'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const AdminApp = lazy(() => import('@/admin/AdminApp'))

/** A fallback that reserves height so swapping in a chunk never shifts the page. */
function ChunkFallback() {
  return <div className="min-h-dvh" aria-hidden="true" />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/academics" element={<Academics />} />
        <Route path="/admissions" element={<Admissions />} />
        <Route path="/school-life" element={<SchoolLife />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsArticle />} />
        <Route path="/events/:slug" element={<EventDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<ChunkFallback />}>
            <AdminApp />
          </Suspense>
        }
      />
    </Routes>
  )
}

export default AppRoutes
