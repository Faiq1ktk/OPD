import './index.css'
import { lifestyleAssessmentData } from '../../data/lifestyleAssessmentData'
import LifestyleAssessmentRow from '../../components/LifestyleAssessmentRow'
import { Button, Form, Typography, message } from '../antd'
import { handleArrowNavigation } from '../../utils/lifestyleKeyboardNavigation'

import {
  LifestyleHistoryTrigger,
  LifestyleHistoryModal,
  LifestyleRecordViewModal,
  useLifestyleHistory,
} from '../../features/lifestyleHistory'

import { DEFAULT_LIFESTYLE_HISTORY_CONTEXT } from '../../features/lifestyleHistory/constants/lifestyleHistory.constants'

const { Title, Text } = Typography

function formatSubmittedAssessment(values) {
  const assessment = values?.assessment || {}

  return lifestyleAssessmentData.map((row) => {
    const rowData = assessment[row.id] || {}

    return {
      id: row.id,
      riskModifier: row.riskModifier,
      status: rowData.status || '',
      barrier: rowData.barrier || '',
      plan: Array.isArray(rowData.plan) ? rowData.plan.join(', ') : '',
    }
  })
}

function hasAnyAssessmentValue(values) {
  const assessment = values?.assessment || {}

  return Object.values(assessment).some((rowData) => {
    if (!rowData || typeof rowData !== 'object') return false

    const hasStatus =
      typeof rowData.status === 'string' && rowData.status.trim() !== ''

    const hasBarrier =
      typeof rowData.barrier === 'string' && rowData.barrier.trim() !== ''

    const hasPlan = Array.isArray(rowData.plan) && rowData.plan.length > 0

    return hasStatus || hasBarrier || hasPlan
  })
}

function LifestyleandRiskAssessment() {
  const [form] = Form.useForm()

  const {
    records,
    historyOpen,
    viewRecord,
    addRecord,
    openHistory,
    closeHistory,
    importRecord,
    openView,
    backToHistoryFromView,
  } = useLifestyleHistory(DEFAULT_LIFESTYLE_HISTORY_CONTEXT)

  const handleFinish = (values) => {
    if (!hasAnyAssessmentValue(values)) {
      message.warning('Please fill the form')
      return
    }

    const formattedAssessment = formatSubmittedAssessment(values)

    console.group('Submitted Assessment Form')
    console.table(formattedAssessment)
    console.log('Raw submitted values:')
    console.log(JSON.stringify(values, null, 2))
    console.groupEnd()

    addRecord(values)
    message.success('Data submitted successfully')
    form.resetFields()
  }

  return (
    <main className="app-shell lifestyle-page" onKeyDown={handleArrowNavigation}>
      <section className="assessment-layout">
        {/* <div className="top-cutter" aria-hidden="true"></div> */}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          className="assessment-form"
        >
          <div className="assessment-card">
            <header className="assessment-header">
              <Title level={1} className="assessment-title">
                Lifestyle and Risk Assessment
              </Title>

              <LifestyleHistoryTrigger onClick={openHistory} />
            </header>

            <div className="assessment-table-wrapper">
              <table className="assessment-table">
                <thead>
                  <tr>
                    <th>
                      <Text className="table-head-text">Risk Modifier</Text>
                    </th>
                    <th>
                      <Text className="table-head-text">Goal / Target</Text>
                    </th>
                    <th>
                      <Text className="table-head-text">Current Status</Text>
                    </th>
                    <th>
                      <Text className="table-head-text">Barrier Identified</Text>
                    </th>
                    <th>
                      <Text className="table-head-text">
                        Plan / Patient Education
                      </Text>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {lifestyleAssessmentData.map((row) => (
                    <LifestyleAssessmentRow key={row.id} row={row} form={form} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="assessment-mobile-list">
              {lifestyleAssessmentData.map((row) => (
                <LifestyleAssessmentRow
                  key={`mobile-${row.id}`}
                  row={row}
                  form={form}
                  mobile
                />
              ))}
            </div>

            <footer className="assessment-footer">
              <Button
                type="primary"
                htmlType="submit"
                data-nav="true"
                data-nav-row={10}
                data-nav-col={5}
                data-nav-idx={0}
              >
                Submit
              </Button>
            </footer>
          </div>
        </Form>

        <LifestyleHistoryModal
          open={historyOpen}
          onClose={closeHistory}
          records={records}
          patientName={DEFAULT_LIFESTYLE_HISTORY_CONTEXT.patientName}
          employeeId={DEFAULT_LIFESTYLE_HISTORY_CONTEXT.employeeId}
          onImport={(record) => importRecord(record, form)}
          onView={openView}
        />

        <LifestyleRecordViewModal
          open={Boolean(viewRecord)}
          onClose={backToHistoryFromView}
          record={viewRecord}
        />
      </section>
    </main>
  )
}

export default LifestyleandRiskAssessment