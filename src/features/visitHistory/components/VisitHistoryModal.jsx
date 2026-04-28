import { Button, Modal, Typography } from '../../../ui/antd'
import { EyeOutlined, ImportOutlined } from '@ant-design/icons'
import {
  VISIT_HISTORY_COLUMNS,
  VISIT_HISTORY_TITLE,
} from '../constants/visitHistory.constants'

const TIME_LABEL_STYLE = {
  marginLeft: 6,
  color: '#6b7280',
  fontSize: '10px',
  fontWeight: 400,
  whiteSpace: 'nowrap',
}

function formatTimeAMPM(dateInput) {
  const date = new Date(dateInput)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function VisitHistoryModal({
  open,
  onClose,
  patientName,
  employeeId,
  records = [],
  onImport,
  onView,
}) {
  const modalTitle = `${VISIT_HISTORY_TITLE} (${patientName}) ${employeeId}`

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closeIcon={null}
      width={721}
      destroyOnClose
      className="visit-history-modal"
      styles={{
        content: { padding: 0, overflow: 'hidden' },
        body: { padding: 0 },
      }}
    >
      <div className="visit-history-modal-titlebar">
        <Typography.Title level={4} className="visit-history-modal-title">
          {modalTitle}
        </Typography.Title>
      </div>

      <div className="visit-history-modal-body">
        <div className="visit-history-table-head">
          <Typography.Text className="visit-history-head-text">
            {VISIT_HISTORY_COLUMNS.visitDate} / Time
          </Typography.Text>
          <Typography.Text className="visit-history-head-text">
            {VISIT_HISTORY_COLUMNS.enteredBy}
          </Typography.Text>
          <Typography.Text className="visit-history-head-text visit-history-head-text-center">
            {VISIT_HISTORY_COLUMNS.import}
          </Typography.Text>
          <Typography.Text className="visit-history-head-text visit-history-head-text-right">
            {VISIT_HISTORY_COLUMNS.view}
          </Typography.Text>
        </div>

        <div className="visit-history-table-body">
          {records.length > 0 ? (
            records.map((record) => {
              const timeLabel = formatTimeAMPM(record.submittedAt)

              return (
                <div key={record.id} className="visit-history-row">
                  <Typography.Text className="visit-history-row-text">
                    {record.visitDateLabel}
                    {timeLabel && (
                      <span style={TIME_LABEL_STYLE}>{timeLabel}</span>
                    )}
                  </Typography.Text>

                  <Typography.Text className="visit-history-row-text">
                    {record.enteredBy}
                  </Typography.Text>

                  <button
                    type="button"
                    className="visit-history-icon-action visit-history-icon-action-center"
                    aria-label={`Import visit ${record.visitDateLabel}`}
                    onClick={() => onImport?.(record)}
                  >
                    <ImportOutlined />
                  </button>

                  <button
                    type="button"
                    className="visit-history-icon-action visit-history-icon-action-right"
                    aria-label={`View visit ${record.visitDateLabel}`}
                    onClick={() => onView?.(record)}
                  >
                    <EyeOutlined />
                  </button>
                </div>
              )
            })
          ) : (
            <div className="visit-history-empty-row">
              <Typography.Text className="visit-history-empty-text">
                No visit history available yet.
              </Typography.Text>
            </div>
          )}
        </div>
      </div>

      <div className="visit-history-modal-footer">
        <Button
          type="primary"
          onClick={onClose}
          className="visit-history-back-btn"
        >
          Back
        </Button>
      </div>
    </Modal>
  )
}

export default VisitHistoryModal