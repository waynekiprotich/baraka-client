import { useState } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'

import { SESSION_END_REASONS } from '@/admin/lib/adminApi'
import { useAuth } from '@/admin/lib/auth'
import { SeoHead } from '@/components/SeoHead'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'

/**
 * CMS sign-in.
 *
 * Errors are chosen from the ApiError `code`, never from its message text, and the generic
 * INVALID_CREDENTIALS message is shown for both an unknown e-mail and a wrong password.
 */
export default function Login() {
  const { signIn, isAuthenticated, booting } = useAuth()
  const location = useLocation()
  const [params] = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [fields, setFields] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const reason = params.get('reason')
  const notice = reason ? SESSION_END_REASONS[reason] : null
  const from = (location.state && location.state.from) || '/admin'

  if (!booting && isAuthenticated) return <Navigate to={from} replace />

  const onSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setFields({})

    try {
      await signIn({ email: email.trim(), password })
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR' && err.fields) {
        setFields(err.fields)
        setError('Check the details below.')
      } else if (err.code === 'INVALID_CREDENTIALS') {
        setError('That e-mail and password do not match.')
      } else if (err.code === 'RATE_LIMITED') {
        setError('Too many attempts. Please wait a few minutes and try again.')
      } else if (err.code === 'NETWORK_ERROR') {
        setError('Could not reach the server. Check your connection.')
      } else {
        setError('Sign-in failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <SeoHead title="Sign in" noindex />

      <div className="flex min-h-dvh items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <img
            src="/brand/crest-ink-256.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
          />
          <h1 id="page-title" tabIndex={-1} className="type-h3 mt-6 outline-none">
            Baraka School CMS
          </h1>
          <p className="type-meta mt-2">Sign in to manage news, events, photos and settings.</p>

          {notice ? (
            <p className="mt-6 border border-line bg-paper-2 px-4 py-3 text-sm text-ink-70">
              {notice}
            </p>
          ) : null}

          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5" noValidate>
            <Field
              label="E-mail address"
              name="email"
              type="email"
              autoComplete="username"
              inputMode="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={fields.email}
            />

            <Field
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={fields.password}
            />

            {error ? (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            ) : null}

            <Button type="submit" block disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
