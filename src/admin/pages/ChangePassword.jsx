import { useState } from 'react'

import { FormRow } from '@/admin/components/FormRow'
import { useToast } from '@/admin/components/Toast'
import { adminPost } from '@/admin/lib/adminApi'
import { SeoHead } from '@/components/SeoHead'
import { Button } from '@/components/ui/Button'

import { PageTitle } from './PageTitle'

const MIN_LENGTH = 10

export default function ChangePassword() {
  const toast = useToast()
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    if (!form.current_password) next.current_password = 'Enter your current password.'
    if (form.new_password.length < MIN_LENGTH) {
      next.new_password = `Use at least ${MIN_LENGTH} characters.`
    }
    if (form.new_password !== form.confirm) next.confirm = 'The two passwords do not match.'
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      await adminPost('/auth/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
      })
      setForm({ current_password: '', new_password: '', confirm: '' })
      toast.success('Your password has been changed.')
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR' && err.fields) setErrors(err.fields)
      else if (err.code === 'INVALID_CREDENTIALS') {
        setErrors({ current_password: 'That is not your current password.' })
      } else {
        toast.error(err.message || 'Could not change your password.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <SeoHead title="Change password" noindex />
      <PageTitle title="Change password" lead="Choose something long and unique to this site." />

      <form onSubmit={submit} className="grid max-w-md gap-5">
        <FormRow
          label="Current password"
          type="password"
          autoComplete="current-password"
          required
          value={form.current_password}
          error={errors.current_password}
          onChange={(event) => set({ current_password: event.target.value })}
        />
        <FormRow
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          value={form.new_password}
          error={errors.new_password}
          hint={`At least ${MIN_LENGTH} characters.`}
          onChange={(event) => set({ new_password: event.target.value })}
        />
        <FormRow
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
          value={form.confirm}
          error={errors.confirm}
          onChange={(event) => set({ confirm: event.target.value })}
        />
        <div>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Change password'}
          </Button>
        </div>
      </form>
    </>
  )
}
