import { NavLink } from 'react-router-dom'

import { Icon } from '@/components/ui/Icon'

const ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: 'compass', end: true },
  { to: '/admin/news', label: 'News', icon: 'book-open' },
  { to: '/admin/events', label: 'Events', icon: 'calendar' },
  { to: '/admin/gallery', label: 'Gallery', icon: 'image' },
  { to: '/admin/gallery/categories', label: 'Categories', icon: 'shield' },
  { to: '/admin/enquiries', label: 'Enquiries', icon: 'mail', badge: 'enquiries' },
  { to: '/admin/settings', label: 'Settings', icon: 'sparkle' },
  { to: '/admin/password', label: 'Change password', icon: 'users' },
]

/**
 * Sidebar navigation. `unread` drives the enquiries badge so the school can see at a glance
 * that a parent is waiting.
 *
 * @param {{unread?: number, onNavigate?: () => void}} props
 */
export function AdminNav({ unread = 0, onNavigate }) {
  return (
    <nav aria-label="Admin sections" className="px-3 py-4">
      <ul className="space-y-0.5">
        {ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xs px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-paper/15 font-medium text-paper'
                    : 'text-paper/70 hover:bg-paper/10 hover:text-paper'
                }`
              }
            >
              <Icon name={item.icon} size={18} className="shrink-0" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {item.badge === 'enquiries' && unread > 0 && (
                <span className="rounded-xs bg-gold px-1.5 py-0.5 text-[0.6875rem] font-semibold text-ink">
                  {unread}
                  <span className="sr-only"> unread</span>
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
