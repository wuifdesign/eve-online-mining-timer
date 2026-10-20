import type { ComponentChildren, FunctionComponent } from 'preact'
import { useId, useLayoutEffect, useRef } from 'preact/hooks'
import { IconButton } from './button.tsx'
import { Icon } from './icon.tsx'

export type ModalProps = {
  opened: boolean
  onClose: () => void
  title: ComponentChildren
  children: ComponentChildren
}

// native <dialog>: focus trapping, Escape and top-layer stacking come from the browser
export const Modal: FunctionComponent<ModalProps> = ({ opened, onClose, title, children }) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  // layout effect: open/close in the same frame as the render, Preact defers useEffect until after paint
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }
    if (opened && !dialog.open) {
      dialog.showModal()
    } else if (!opened && dialog.open) {
      dialog.close()
    }
  }, [opened])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        // a click on the dialog element itself is a click on the backdrop
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-[620px] rounded-xl border border-line bg-panel p-0 text-fg shadow-[0_24px_60px_rgb(0_0_0/0.55)] backdrop:bg-black/65"
    >
      {opened && (
        <div className="p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 id={titleId} className="text-base font-semibold">
              {title}
            </h2>
            <IconButton title="Close" onClick={onClose}>
              <Icon name="x" />
            </IconButton>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}
