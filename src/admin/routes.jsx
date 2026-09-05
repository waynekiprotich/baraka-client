import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { AdminLayout } from '@/admin/components/AdminLayout'
import { RequireAuth } from '@/admin/components/RequireAuth'
import { Spinner } from '@/components/ui/Spinner'

/*
 * The CMS routes.
 *
 * Everything below `RequireAuth` is auth-gated in one place. The pages are lazy within the
 * already-lazy admin chunk so that opening the login page does not pull in the whole CMS.
 *
 * `AdminLayout` nests inside `RequireAuth` so the sidebar, toast host and sign-out are shared
 * by every signed-in page, and the login screen renders without any of that chrome.
 */

const Login = lazy(() => import('@/admin/pages/Login'))
const Dashboard = lazy(() => import('@/admin/pages/Dashboard'))
const NewsList = lazy(() => import('@/admin/pages/NewsList'))
const NewsEdit = lazy(() => import('@/admin/pages/NewsEdit'))
const EventsList = lazy(() => import('@/admin/pages/EventsList'))
const EventEdit = lazy(() => import('@/admin/pages/EventEdit'))
const GalleryManager = lazy(() => import('@/admin/pages/GalleryManager'))
const CategoriesManager = lazy(() => import('@/admin/pages/CategoriesManager'))
const SettingsPage = lazy(() => import('@/admin/pages/SettingsPage'))
const EnquiriesInbox = lazy(() => import('@/admin/pages/EnquiriesInbox'))
const ChangePassword = lazy(() => import('@/admin/pages/ChangePassword'))

function PageFallback() {
  return (
    <div className="flex min-h-[60svh] items-center justify-center">
      <Spinner label="Loading" />
    </div>
  )
}

export function AdminRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="login" element={<Login />} />

        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="news" element={<NewsList />} />
            <Route path="news/new" element={<NewsEdit />} />
            <Route path="news/:id" element={<NewsEdit />} />
            <Route path="events" element={<EventsList />} />
            <Route path="events/new" element={<EventEdit />} />
            <Route path="events/:id" element={<EventEdit />} />
            <Route path="gallery" element={<GalleryManager />} />
            <Route path="gallery/categories" element={<CategoriesManager />} />
            <Route path="enquiries" element={<EnquiriesInbox />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="password" element={<ChangePassword />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Suspense>
  )
}

export default AdminRoutes
