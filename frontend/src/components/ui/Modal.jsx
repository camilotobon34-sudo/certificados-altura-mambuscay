import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export function Modal({ open, title, onClose, children, footer, tone = 'default' }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-[var(--radius-card)] bg-surface-elevated p-0 text-ink shadow-[var(--shadow-elevation-2)] backdrop:bg-ink/40"
    >
      {open && (
        <div className={tone === 'danger' ? 'border-t-4 border-danger' : 'border-t-4 border-primary'}>
          <header className="flex items-start justify-between gap-4 px-5 pt-5">
            <h2 className={`text-2xl ${tone === 'danger' ? 'text-danger' : 'text-ink'}`}>{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 -mt-1 inline-flex size-11 items-center justify-center rounded-full text-muted hover:bg-surface"
              aria-label="Cerrar"
            >
              <X className="size-5" />
            </button>
          </header>
          <div className="px-5 py-4">{children}</div>
          {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4">{footer}</footer>}
        </div>
      )}
    </dialog>
  )
}
