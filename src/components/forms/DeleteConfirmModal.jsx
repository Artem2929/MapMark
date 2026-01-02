import { memo } from 'react'
import './DeleteConfirmModal.css'

const DeleteConfirmModal = memo(({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="delete-confirm-modal" onClick={onCancel}>
      <div className="delete-confirm-modal__content" onClick={(e) => e.stopPropagation()}>
        <h3 className="delete-confirm-modal__title">{title}</h3>
        <p className="delete-confirm-modal__message">{message}</p>
        <div className="delete-confirm-modal__actions">
          <button
            type="button"
            className="btn secondary"
            onClick={onCancel}
          >
            Скасувати
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={onConfirm}
          >
            Так
          </button>
        </div>
      </div>
    </div>
  )
})

DeleteConfirmModal.displayName = 'DeleteConfirmModal'

export default DeleteConfirmModal
