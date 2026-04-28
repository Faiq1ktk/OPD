import { useMemo, useRef } from 'react'
import { Button, Modal, Typography } from '../../../ui/antd'
import { PrinterOutlined } from '@ant-design/icons'
import { lifestyleAssessmentData } from '../../../data/lifestyleAssessmentData'
import { LIFESTYLE_HISTORY_TITLE } from '../constants/lifestyleHistory.constants'
import { formatDateTime } from '../utils/lifestyleHistory.utils'

function AssessmentCell({ lines, emptyText = '—', valueClassName = '' }) {
  if (!lines.length) {
    return <span className="lifestyle-record-empty">{emptyText}</span>
  }

  return (
    <div className="lifestyle-record-cell-lines">
      {lines.map((line, index) => (
        <Typography.Text
          key={`${line}-${index}`}
          className={`lifestyle-record-cell-text ${valueClassName}`.trim()}
        >
          {line}
        </Typography.Text>
      ))}
    </div>
  )
}

function LifestyleRecordViewModal({ open, onClose, record }) {
  const printContainerRef = useRef(null)

  const modalTitle = `${LIFESTYLE_HISTORY_TITLE} (${record?.patientName ?? 'Dummy Patient'}) ${record?.employeeId ?? '000000'}`

  const submittedOn = useMemo(() => {
    if (!record?.visitDate) return record?.visitDateLabel ?? '—'

    return formatDateTime(record.visitDate)
  }, [record])

  const displayRows = useMemo(() => {
    const assessment = record?.assessmentSnapshot?.assessment ?? {}

    return lifestyleAssessmentData.map((row) => {
      const rowData = assessment[row.id] ?? {}

      return {
        id: row.id,
        riskModifier: row.riskModifier,
        goalLines: Array.isArray(row.goalTarget) ? row.goalTarget : [],
        statusLines: rowData.status ? [rowData.status] : [],
        barrierLines: rowData.barrier ? [rowData.barrier] : [],
        planLines: Array.isArray(rowData.plan) ? rowData.plan : [],
      }
    })
  }, [record])

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
      iframe.remove()
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

            .no-print,
            .lifestyle-record-mobile-list {
              display: none !important;
            }

            .lifestyle-record-table-view,
            .lifestyle-record-view-scroll {
              display: block !important;
              width: 100% !important;
            }

            .print-table {
              width: 100%;
              border-collapse: collapse;
            }

            .print-table thead tr {
              background: #d7e7ff;
            }

            .print-table th,
            .print-table td {
              border: 1px solid #064f8d;
              padding: 10px 12px;
              vertical-align: top;
              text-align: left;
            }

            .print-table th {
              font-size: 14px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>${printableNode.innerHTML}</body>
      </html>
    `)
    iframeDoc.close()

    iframe.onload = () => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()

      setTimeout(() => {
        iframe.remove()
      }, 500)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      title={modalTitle}
      width={1100}
      className="lifestyle-record-view-modal"
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
      <div ref={printContainerRef}>
        <div className="lifestyle-record-view-meta">
          <div className="lifestyle-record-view-meta-left">
            <Typography.Text className="lifestyle-record-meta-text">
              Submitted On: {submittedOn}
            </Typography.Text>
            <Typography.Text className="lifestyle-record-meta-text">
              Entered By: {record?.enteredBy ?? '—'}
            </Typography.Text>
          </div>

          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            className="lifestyle-record-print-btn no-print"
          >
            Print
          </Button>
        </div>

        <div className="lifestyle-record-table-view">
          <div className="lifestyle-record-view-scroll">
            <table className="lifestyle-record-view-table print-table">
              <thead>
                <tr>
                  <th>Risk Modifier</th>
                  <th>Goal / Target</th>
                  <th>Current Status</th>
                  <th>Barrier Identified</th>
                  <th>Plan / Patient Education</th>
                </tr>
              </thead>

              <tbody>
                {displayRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <AssessmentCell
                        lines={[row.riskModifier]}
                        valueClassName="lifestyle-record-risk-text"
                      />
                    </td>

                    <td>
                      <AssessmentCell
                        lines={row.goalLines}
                        valueClassName="lifestyle-record-goal-text"
                      />
                    </td>

                    <td>
                      <AssessmentCell
                        lines={row.statusLines}
                        valueClassName="lifestyle-record-value-text"
                      />
                    </td>

                    <td>
                      <AssessmentCell
                        lines={row.barrierLines}
                        valueClassName="lifestyle-record-value-text"
                      />
                    </td>

                    <td>
                      <AssessmentCell
                        lines={row.planLines}
                        valueClassName="lifestyle-record-value-text"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lifestyle-record-mobile-list">
          {displayRows.map((row) => (
            <div key={row.id} className="lifestyle-record-mobile-card">
              <div className="lifestyle-record-mobile-section lifestyle-record-mobile-section--title">
                <div className="lifestyle-record-mobile-label">Risk Modifier</div>
                <AssessmentCell
                  lines={[row.riskModifier]}
                  valueClassName="lifestyle-record-risk-text"
                />
              </div>

              <div className="lifestyle-record-mobile-section">
                <div className="lifestyle-record-mobile-label">Goal / Target</div>
                <AssessmentCell
                  lines={row.goalLines}
                  valueClassName="lifestyle-record-goal-text"
                />
              </div>

              <div className="lifestyle-record-mobile-section">
                <div className="lifestyle-record-mobile-label">Current Status</div>
                <AssessmentCell
                  lines={row.statusLines}
                  valueClassName="lifestyle-record-value-text"
                />
              </div>

              <div className="lifestyle-record-mobile-section">
                <div className="lifestyle-record-mobile-label">Barrier Identified</div>
                <AssessmentCell
                  lines={row.barrierLines}
                  valueClassName="lifestyle-record-value-text"
                />
              </div>

              <div className="lifestyle-record-mobile-section">
                <div className="lifestyle-record-mobile-label">Plan / Patient Education</div>
                <AssessmentCell
                  lines={row.planLines}
                  valueClassName="lifestyle-record-value-text"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lifestyle-history-footer no-print">
        <Button
          type="primary"
          onClick={onClose}
          className="lifestyle-record-back-btn"
        >
          Back
        </Button>
      </div>
    </Modal>
  )
}

export default LifestyleRecordViewModal