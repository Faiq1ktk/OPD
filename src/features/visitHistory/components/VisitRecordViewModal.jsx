import { useMemo, useRef } from 'react'
import { Button, Modal, Typography } from '../../../ui/antd'
import { PrinterOutlined } from '@ant-design/icons'
import { strokeAssessmentData } from '../../../data/strokeAssessmentData'
import { VISIT_HISTORY_TITLE } from '../constants/visitHistory.constants'
import { formatVisitDateTime } from '../utils/visitHistory.utils'

function buildLines(value, otherText, otherLabel = 'Other') {
  const lines = []

  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (item) lines.push(item)
    })
  } else if (value) {
    lines.push(value)
  }

  if (otherText && typeof otherText === 'string' && otherText.trim() !== '') {
    const hasOtherSelected = Array.isArray(value)
      ? value.includes(otherLabel)
      : value === otherLabel

    if (hasOtherSelected) {
      lines.push(`Other: ${otherText}`)
    }
  }

  return lines
}

function AssessmentCell({ lines }) {
  if (!lines.length) {
    return <span className="visit-record-empty">—</span>
  }

  return (
    <div className="visit-record-cell-lines">
      {lines.map((line, index) => (
        <Typography.Text key={`${line}-${index}`} className="visit-record-cell-text">
          {line}
        </Typography.Text>
      ))}
    </div>
  )
}

function VisitRecordViewModal({
  open,
  onClose,
  patientName,
  employeeId,
  record,
}) {
  const printContainerRef = useRef(null)

  const modalTitle = `${VISIT_HISTORY_TITLE} (${patientName}) ${employeeId}`

  const displayRows = useMemo(() => {
    const assessment = record?.assessmentSnapshot ?? {}

    return strokeAssessmentData.map((row) => {
      const rowData = assessment[row.id] ?? assessment[String(row.id)] ?? {}

      const riskLines = [row.riskModifier]
      if (rowData.mrs) {
        riskLines.push(`mRS: ${rowData.mrs}`)
      }

      return {
        id: row.id,
        riskLines,
        currentLines: buildLines(
          rowData.currentStatus,
          rowData.currentStatusOther,
          row.currentStatus?.otherInputLabel ?? 'Other',
        ),
        barrierLines: buildLines(
          rowData.barrierIdentified,
          rowData.barrierIdentifiedOther,
          'Other',
        ),
        planLines: buildLines(rowData.planEducation, '', 'Other'),
      }
    })
  }, [record])

  const submittedOn = formatVisitDateTime(record?.submittedAt)
  const enteredBy = record?.enteredBy ?? '—'

  const handlePrint = () => {
    const printableNode = printContainerRef.current
    if (!printableNode) return

    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentWindow?.document
    if (!iframeDoc) {
      document.body.removeChild(iframe)
      return
    }

    iframeDoc.open()
    iframeDoc.write(`
      <html>
        <head>
          <title>${modalTitle}</title>
          <style>
            body {
              margin: 0;
              padding: 24px;
              font-family: 'Open Sans', Arial, sans-serif;
              color: #111827;
            }

            /* 🔥 FIX: hide unwanted content */
            .visit-record-mobile-list {
              display: none !important;
            }

            .no-print {
              display: none !important;
            }

            .visit-record-view-desktop {
              display: block !important;
            }

            .print-titlebar {
              background: #4e8dbd;
              color: #ffffff;
              padding: 12px 16px;
              font-weight: 600;
              font-size: 20px;
            }

            .print-meta {
              display: flex;
              flex-wrap: wrap;
              gap: 24px;
              padding: 12px 16px;
              background: #f1f7ff;
              border-bottom: 1px solid #d7e7ff;
              font-size: 14px;
              font-weight: 600;
            }

            .print-table {
              width: 100%;
              border-collapse: collapse;
            }

            .print-table th,
            .print-table td {
              border: 1px solid #064f8d;
              padding: 10px 12px;
              vertical-align: top;
              text-align: left;
            }

            .print-table th {
              background: #f1f7ff;
              font-size: 15px;
              font-weight: 600;
            }

            .print-line {
              display: block;
              font-size: 14px;
              line-height: 1.45;
              margin-bottom: 4px;
              word-break: break-word;
            }

            .print-empty {
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          ${printableNode.innerHTML}
        </body>
      </html>
    `)
    iframeDoc.close()

    iframe.onload = () => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 500)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closeIcon={null}
      width={1100}
      destroyOnClose
      className="visit-record-view-modal"
      styles={{
        content: { padding: 0, overflow: 'hidden' },
        body: { padding: 0 },
      }}
    >
      <div ref={printContainerRef}>
        <div className="visit-history-modal-titlebar print-titlebar">
          <Typography.Title level={4} className="visit-history-modal-title">
            {modalTitle}
          </Typography.Title>
        </div>

        <div className="visit-record-view-toolbar print-meta">
          <div className="visit-record-view-meta">
            <Typography.Text className="visit-record-view-meta-text">
              Submitted on: {submittedOn}
            </Typography.Text>
            <Typography.Text className="visit-record-view-meta-text">
              Entered by: {enteredBy}
            </Typography.Text>
          </div>

          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            className="visit-record-print-btn no-print"
          >
            Print
          </Button>
        </div>

        <div className="visit-record-view-desktop">
          <div className="visit-record-view-scroll">
            <table className="visit-record-view-table print-table">
              <thead>
                <tr>
                  <th>Risk Modifier</th>
                  <th>Current Status</th>
                  <th>Barrier Identified</th>
                  <th>Plan / Education</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row) => (
                  <tr key={row.id}>
                    <td><AssessmentCell lines={row.riskLines} /></td>
                    <td><AssessmentCell lines={row.currentLines} /></td>
                    <td><AssessmentCell lines={row.barrierLines} /></td>
                    <td><AssessmentCell lines={row.planLines} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="visit-record-mobile-list">
          {displayRows.map((row) => (
            <div key={row.id} className="visit-record-mobile-card">
              <div className="visit-record-mobile-title">
                <AssessmentCell lines={row.riskLines} />
              </div>

              <div className="visit-record-mobile-section">
                <div className="visit-record-mobile-label">Current Status</div>
                <AssessmentCell lines={row.currentLines} />
              </div>

              <div className="visit-record-mobile-section">
                <div className="visit-record-mobile-label">Barrier Identified</div>
                <AssessmentCell lines={row.barrierLines} />
              </div>

              <div className="visit-record-mobile-section">
                <div className="visit-record-mobile-label">Plan / Education</div>
                <AssessmentCell lines={row.planLines} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="visit-history-modal-footer no-print">
        <Button type="primary" onClick={onClose} className="visit-history-back-btn">
          Back
        </Button>
      </div>
    </Modal>
  )
}

export default VisitRecordViewModal