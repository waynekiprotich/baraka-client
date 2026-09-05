import { Button } from '@/components/ui/Button'

import { Modal } from './Modal'

/**
 * The gate in front of every destructive action. Nothing in the CMS deletes without one.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onCancel
 * @param {() => void} props.onConfirm
 * @param {string} props.title
 * @param {string} [props.body]        what will actually happen, in plain words
 * @param {string} [props.confirmLabel]
 * @param {boolean} [props.busy]
 */
export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  body,
  confirmLabel = 'Delete',
  busy = false,
}) {
  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onCancel}
      title={title}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-ink-70">{body}</p>
    </Modal>
  )
}
