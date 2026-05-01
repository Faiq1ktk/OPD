import { useState } from 'react'
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

function getOptionId(options, selectedOption) {
  const optionIndex = options.indexOf(selectedOption)
  return optionIndex >= 0 ? optionIndex + 1 : ''
}

function getSelectedOptionIds(options, selectedOptions) {
  const selectedList = Array.isArray(selectedOptions) ? selectedOptions : []

  return selectedList
    .map((selectedOption) => getOptionId(options, selectedOption))
    .filter((optionId) => optionId !== '')
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== ''
}

function formatLifestyleAssessmentJson(values) {
  const assessment = values?.assessment || {}

  return {
    assessments: lifestyleAssessmentData
      .map((row) => {
        const rowData = assessment[row.id] || {}
        const statusOptions = row.statusOptions || []
        const planOptions = row.planOptions || []

        const selectedStatus = rowData.status || ''
        const currentStatusId = getOptionId(statusOptions, selectedStatus)

        if (!currentStatusId) {
          return null
        }

        const payload = {
          risk_modifier_id: row.id,
          current_status: String(currentStatusId),
        }

        if (isNonEmptyString(rowData.barrier)) {
          payload.barrier_identified = rowData.barrier.trim()
        }

        const planOptionIds = getSelectedOptionIds(planOptions, rowData.plan)

        if (planOptionIds.length > 0) {
          payload.plan_options = planOptionIds
        }

        return payload
      })
      .filter(Boolean),
  }
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

function getFirstValidationMessage(errorInfo) {
  const firstError = errorInfo?.errorFields?.find(
    (field) => Array.isArray(field.errors) && field.errors.length > 0,
  )

  return firstError?.errors?.[0] || 'Please fill the form.'
}

function LifestyleandRiskAssessment({
  lifestyleHistoryRecords = [],
  setLifestyleHistoryRecords,
}) {
  const [form] = Form.useForm()
  const [showEmptyValidation, setShowEmptyValidation] = useState(false)

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
  } = useLifestyleHistory(DEFAULT_LIFESTYLE_HISTORY_CONTEXT, {
    // Keeps lifestyle history above this route so navigation does not clear it.
    records: lifestyleHistoryRecords,
    setRecords: setLifestyleHistoryRecords,
  })

  const handleValuesChange = (_, allValues) => {
    if (hasAnyAssessmentValue(allValues)) {
      setShowEmptyValidation(false)
    }
  }

  const handleSubmitClick = () => {
    const values = form.getFieldsValue(true)

    if (!hasAnyAssessmentValue(values)) {
      setShowEmptyValidation(true)
    }
  }

  const handleFinish = (values) => {
    if (!hasAnyAssessmentValue(values)) {
      setShowEmptyValidation(true)
      message.warning('Please fill the form.')
      return
    }

    addRecord(values)

    const formattedAssessmentJson = formatLifestyleAssessmentJson(values)

    console.log(
      'Lifestyle and Risk Assessment Submitted JSON:',
      JSON.stringify(formattedAssessmentJson, null, 2),
    )

    message.success('Data submitted successfully')
    setShowEmptyValidation(false)
    form.resetFields()
  }

  const handleFinishFailed = (errorInfo) => {
    const validationMessage = getFirstValidationMessage(errorInfo)

    setShowEmptyValidation(true)
    message.warning(validationMessage)
  }

  return (
    <main className="app-shell lifestyle-page" onKeyDown={handleArrowNavigation}>
      <section className="assessment-layout">
        {/* <div className="top-cutter" aria-hidden="true"></div> */}

        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleValuesChange}
          onFinish={handleFinish}
          onFinishFailed={handleFinishFailed}
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
                    <LifestyleAssessmentRow
                      key={row.id}
                      row={row}
                      form={form}
                      showEmptyValidation={showEmptyValidation}
                    />
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
                  showEmptyValidation={showEmptyValidation}
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
                onClick={handleSubmitClick}
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