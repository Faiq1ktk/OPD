import { Button, Modal, Typography } from '../../../ui/antd'
import { EyeOutlined, ImportOutlined } from '@ant-design/icons'
import {
  HISTORY_COLUMNS,
  LIFESTYLE_HISTORY_TITLE,
} from '../constants/lifestyleHistory.constants'
import { formatFullDate, formatTime } from '../utils/lifestyleHistory.utils'

function LifestyleHistoryModal({
  open,
  onClose,
  records = [],
  patientName = 'Dummy Patient',
  employeeId = '000000',
  onImport,
  onView,
}) {
  const modalTitle = `${LIFESTYLE_HISTORY_TITLE} (${patientName}) ${employeeId}`

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      title={modalTitle}
      width={721}
      className="lifestyle-history-modal"
      destroyOnClose
      styles={{
        content: {
          padding: 0,
          borderRadius: 0,
          overflow: 'hidden',
          boxShadow: 'none',
        },
        header: {
          marginBottom: 0,
          padding: '10px 14px',
          background: '#4E8DBD',
          borderBottom: 'none',
          borderRadius: 0,
        },
        body: {
          padding: 0,
          background: '#FFFFFF',
          borderRadius: 0,
        },
      }}
    >
      <div className="lifestyle-history-list-head">
        <Typography.Text className="lifestyle-history-head-text">
          {HISTORY_COLUMNS.visitDate}
        </Typography.Text>
        <Typography.Text className="lifestyle-history-head-text">
          {HISTORY_COLUMNS.enteredBy}
        </Typography.Text>
        <Typography.Text className="lifestyle-history-head-text lifestyle-history-head-text--center">
          {HISTORY_COLUMNS.import}
        </Typography.Text>
        <Typography.Text className="lifestyle-history-head-text lifestyle-history-head-text--right">
          {HISTORY_COLUMNS.view}
        </Typography.Text>
      </div>

      <div className="lifestyle-history-list-body">
        {records.length > 0 ? (
          records.map((record) => {
            const dateSource = record.visitDate ?? new Date()
            const dateLabel =
              record.visitDateFullLabel ?? formatFullDate(dateSource)
            const timeLabel = record.visitTimeLabel ?? formatTime(dateSource)

            return (
              <div key={record.id} className="lifestyle-history-row">
                <div className="lifestyle-history-date-cell">
                  <Typography.Text className="lifestyle-history-row-text">
                    {dateLabel}
                  </Typography.Text>

                  <Typography.Text className="lifestyle-history-time-text">
                    {timeLabel}
                  </Typography.Text>
                </div>

                <Typography.Text className="lifestyle-history-row-text">
                  {record.enteredBy ?? '—'}
                </Typography.Text>

                <button
                  type="button"
                  className="lifestyle-history-action lifestyle-history-action--center"
                  aria-label={`Import visit ${dateLabel} ${timeLabel}`}
                  onClick={() => onImport?.(record)}
                >
                  <ImportOutlined />
                </button>

                <button
                  type="button"
                  className="lifestyle-history-action lifestyle-history-action--right"
                  aria-label={`View visit ${dateLabel} ${timeLabel}`}
                  onClick={() => onView?.(record)}
                >
                  <EyeOutlined />
                </button>
              </div>
            )
          })
        ) : (
          <div className="lifestyle-history-empty">
            <Typography.Text className="lifestyle-history-empty-text">
              No history available yet.
            </Typography.Text>
          </div>
        )}
      </div>

      <div className="lifestyle-history-footer">
        <Button
          type="primary"
          onClick={onClose}
          className="lifestyle-history-back-btn"
        >
          Back
        </Button>
      </div>
    </Modal>
  )
}

export default LifestyleHistoryModal