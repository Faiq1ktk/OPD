import { useEffect, useRef, useState } from 'react'
import './index.css'
import { App as AntApp, Button, Form, message } from '../antd'
import { strokeAssessmentData } from '../../data/strokeAssessmentData'
import AssessmentRow from '../../components/AssessmentRow'
import {
  findNextNavTarget,
  focusNavElement,
} from '../../utils/keyboardGridNavigation.js'
import {
  DEFAULT_VISIT_HISTORY_PATIENT,
  VisitHistoryModal,
  VisitHistoryTrigger,
  VisitRecordViewModal,
  useVisitHistory,
} from '../../features/visitHistory'

const AUTO_PLAN_DEPENDENCIES = {
  1: {
    'Stroke Extension': ['Repeat Imaging', 'Re-admission'],
    'New event': ['Repeat Imaging', 'Re-admission'],
  },
  2: {
    'Not performed': ['Arrange Echocardiography'],
    'Report not available yet': ['Chase Echocardiography report'],
  },
  3: {
    'Not performed': ['Arrange Carotid Doppler / CTCA / MRA Neck'],
    'Report not available yet': ['Chase Doppler / CTCA / MRA report'],
  },
  4: {
    Cost: ['Consider economical options'],
    Awareness: ['Possible consequences of medication non-adherence explained'],
    'Non-adherence': ['Possible consequences of medication non-adherence explained'],
  },
  5: {
    Awareness: ['Counselling regarding botulinum toxin'],
  },
  6: {
    'Bleeding risk of anticoagulants': ['Counselling regarding DVT prophylaxis/treatment'],
    Awareness: ['Counselling regarding DVT prophylaxis/treatment'],
  },
  7: {
    Awareness: [
      'Counselling regarding pressure sores prevention and management (frequent posture change, air mattress)',
    ],
    'Access / Logistics': [
      'Counselling regarding pressure sores prevention and management (frequent posture change, air mattress)',
    ],
  },
  8: {
    'Indwelling urinary catheter': ['Counselling regarding catheter care / swallowing'],
    Dysphagia: ['Referral to relevant specialty (medicine, ID, urology, Speech therapy)'],
  },
  9: {
    Cost: ['Consider economical options'],
    'Side Effects': [
      'Signs/symptoms of GI and other side effects',
      'Reinforce daily medication schedule',
      'Switch formulation if GI / other-side effects Reinforce daily medication schedule',
      'Switch formulation if GI / other side-effects Reinforce daily medication schedule',
    ],
    Forgetfulness: [
      'Pill organizer / phone alarm advised; caregiver educated',
      'Possible consequences of missing and suboptimal dose of antiplatelets explained',
    ],
  },
  10: {
    Cost: ['Consider economical options'],
    'Bleeding fear': ['Possible consequences of missing and suboptimal dose of anticoagulation explained'],
    Forgetfulness: [
      'Possible consequences of missing and suboptimal dose of anticoagulation explained',
      'INR diary (warfarin); missed-dose protocol explained',
    ],
    'INR access': ['INR diary (warfarin); missed-dose protocol explained'],
  },
  11: {
    Cost: ['Consider economical options'],
    'Side effects': ['Adjust to max tolerated dose', 'Switch to Rosuvastatin if myalgia'],
    'Forgetfulness / Awareness': [
      'Possible consequences of missing / suboptimal dose of statins explained',
    ],
  },
  12: {
    Cost: ['Consider economical options for Anti-Hypertensives'],
    'Medication over/under dosed': ['Adjust Antihypertensives'],
    'Medication non-adherence': [
      'Possible consequences of missing / suboptimal doses of BP medications explained',
    ],
    'Dietary sodium excess': ['DASH diet + sodium < 2.3 g/day'],
    'White-coat effect': ['Ambulatory/Home BP Monitoring if white-coat suspected'],
  },
  13: {
    'Lack of awareness': ['Possible consequences of missing / suboptimal doses of OHG medications explained'],
  },
  14: {
    'Aspiration Pneumonia': ['Speech therapy referral'],
    'Patient / Family Beliefs': [
      'Speech therapy referral',
      'Counselled regarding PEG tube placement',
    ],
  },
  15: {
    Motivation: ['Nutritionist referral'],
    Dysphagia: ['Speech therapy referral'],
  },
  16: {
    Cost: ['Physical therapy referral'],
    Transport: ['Physical therapy referral'],
    'Access Issues': ['Physical therapy referral'],
    'Transport / Access issues': ['Physical therapy referral'],
    'Transport / Access Issues': ['Physical therapy referral'],
    Fatigue: ['Physical therapy referral'],
    Other: ['Physical therapy referral'],
  },
  17: {
    Cost: ['Occupational therapy referral'],
    Transport: ['Occupational therapy referral'],
    'Access Issues': ['Occupational therapy referral'],
    'Transport / Access issues': ['Occupational therapy referral'],
    'Transport / Access Issues': ['Occupational therapy referral'],
    Other: ['Occupational therapy referral'],
  },
  18: {
    'Access / Logistics': ['Counselled to remain physically active'],
    Motivation: ['Counselled to remain physically active'],
  },
  19: {
    Cost: ['Adjustment of SSRIs'],
    Awareness: ['Psychiatry referral'],
    Stigma: ['Psychiatry referral'],
  },
  20: {
    'Withdrawal reaction': ['Consult to quit / hazard of smoking and other addiction explain'],
    Motivation: ['Consult to quit / hazard of smoking and other addiction explain'],
  },
}

const AUTO_NONE_CURRENT_STATUS = {
  1: ['Stable'],
  2: ['Normal'],
  3: ['No significant stenosis'],
  4: ['None'],
  5: ['None'],
  6: ['None'],
  7: ['None'],
  8: ['None'],
  9: ['Optimal'],
  10: ['Not Indicated', 'Not anticoagulated'],
  11: ['On statin'],
  12: ['BP at target'],
  13: ['Optimal'],
  14: ['No dysphagia, orally fed'],
  15: ['Optimal'],
  16: ['Completed / Not required'],
  17: ['Completed / Not required'],
  18: ['Optimal'],
  19: ['None'],
}

// Backend integration note:
// This doctor name is temporary.
// Later, this should come from the logged-in doctor/user data returned by the backend.
// Example backend source: auth profile API, user session, or hospital staff context.

const CURRENT_DOCTOR_NAME = 'Dr. Nabeel Muzafar'

function hasEnteredData(values) {
  const assessment = values?.assessment ?? {}

  return Object.values(assessment).some((rowData) => {
    if (!rowData || typeof rowData !== 'object') return false

    return Object.values(rowData).some((value) => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'string') return value.trim() !== ''
      return value !== undefined && value !== null && value !== ''
    })
  })
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== ''
}

function hasCurrentStatusSelection(row, rowData) {
  if (!rowData) return false

  if (row.currentStatus?.type === 'checkbox') {
    return Array.isArray(rowData.currentStatus) && rowData.currentStatus.length > 0
  }

  return isNonEmptyString(rowData.currentStatus)
}

function toArray(value) {
  return Array.isArray(value) ? value : []
}

function orderedUnique(values, order) {
  const selected = new Set(values)
  return order.filter((item) => selected.has(item))
}

function subtractByOrder(source, toRemove, order) {
  const removeSet = new Set(toRemove)
  return order.filter((item) => source.includes(item) && !removeSet.has(item))
}

function resolveExclusiveNone(nextValues, prevValues) {
  const next = toArray(nextValues)
  const prev = toArray(prevValues)

  if (!next.includes('None') || next.length <= 1) return next

  const prevHadNone = prev.includes('None')
  const nextHasNonNone = next.some((item) => item !== 'None')

  if (!nextHasNonNone) return ['None']
  if (prevHadNone) return next.filter((item) => item !== 'None')

  return ['None']
}

function isOnlyNoneSelected(value) {
  const selectedValues = toArray(value)
  return selectedValues.length === 1 && selectedValues[0] === 'None'
}

function shouldAutoSelectBarrierNone(rowId, currentStatus) {
  if (rowId === 20) {
    const currentList = toArray(currentStatus)
    const hasSafeTobaccoState =
      currentList.includes('No Addiction') || currentList.includes('Non Smoker')
    const hasRiskTobaccoState = currentList.includes('Other illicit drug use')

    return hasSafeTobaccoState && !hasRiskTobaccoState
  }

  const allowedStatuses = AUTO_NONE_CURRENT_STATUS[rowId] ?? []

  if (Array.isArray(currentStatus)) return false

  return allowedStatuses.includes(currentStatus)
}

function getAutoPlans(rowId, selectedBarriers) {
  const barrierList = toArray(selectedBarriers)

  if (barrierList.length === 0 || barrierList.includes('None')) return []

  const rowMap = AUTO_PLAN_DEPENDENCIES[rowId] ?? {}
  const autoPlans = []

  barrierList.forEach((barrier) => {
    const plans = rowMap[barrier] ?? []
    autoPlans.push(...plans)
  })

  const row = strokeAssessmentData.find((item) => item.id === rowId)
  const validPlanOptions = row?.planEducation?.options ?? []

  return orderedUnique(autoPlans, validPlanOptions)
}

function cloneAssessment(assessment) {
  const cloned = {}

  Object.entries(assessment ?? {}).forEach(([rowId, rowData]) => {
    cloned[rowId] = {
      ...(rowData ?? {}),
      currentStatus: Array.isArray(rowData?.currentStatus)
        ? [...rowData.currentStatus]
        : rowData?.currentStatus,
      barrierIdentified: Array.isArray(rowData?.barrierIdentified)
        ? [...rowData.barrierIdentified]
        : rowData?.barrierIdentified,
      planEducation: Array.isArray(rowData?.planEducation)
        ? [...rowData.planEducation]
        : rowData?.planEducation,
    }
  })

  return cloned
}

function getOptionId(options, selectedOption) {
  const optionIndex = options.indexOf(selectedOption)
  return optionIndex >= 0 ? optionIndex + 1 : ''
}

function getSelectedOptionIds(options, selectedOptions) {
  const selectedList = toArray(selectedOptions)

  return selectedList
    .map((selectedOption) => getOptionId(options, selectedOption))
    .filter((optionId) => optionId !== '')
}

function getSelectedOptionIdString(options, selectedOptions) {
  return getSelectedOptionIds(options, selectedOptions).join(',')
}

function buildBackendAssessmentPayload(row, rowData) {
  const currentStatusOptions = row.currentStatus?.options ?? []
  const barrierOptions = row.barrierIdentified?.options ?? []
  const planOptions = row.planEducation?.options ?? []

  const currentStatusValue = rowData.currentStatus
  const isCheckboxCurrentStatus = row.currentStatus?.type === 'checkbox'

  const currentStatus = isCheckboxCurrentStatus
    ? getSelectedOptionIdString(currentStatusOptions, currentStatusValue)
    : String(getOptionId(currentStatusOptions, currentStatusValue))

  const neurologicalStatus = getOptionId(row.riskExtra?.options ?? [], rowData.mrs)
  const barrierOptionIds = getSelectedOptionIds(
    barrierOptions,
    rowData.barrierIdentified,
  )
  const planOptionIds = getSelectedOptionIds(planOptions, rowData.planEducation)

  const hasCurrentStatus = isNonEmptyString(currentStatus)
  const hasNeurologicalStatus = row.id === 1 && neurologicalStatus !== ''
  const hasCurrentStatusText =
    row.currentStatus?.type === 'checkbox' &&
    isNonEmptyString(rowData.currentStatusOther)
  const hasBarrierText = isNonEmptyString(rowData.barrierIdentifiedOther)
  const hasBarrierOptions = barrierOptionIds.length > 0
  const hasPlanOptions = planOptionIds.length > 0

  if (
    !hasCurrentStatus &&
    !hasNeurologicalStatus &&
    !hasCurrentStatusText &&
    !hasBarrierText &&
    !hasBarrierOptions &&
    !hasPlanOptions
  ) {
    return null
  }

  const payload = {
    risk_modifier_id: row.id,
  }

  if (hasNeurologicalStatus) {
    payload.neurological_status = String(neurologicalStatus)
  }

  if (hasCurrentStatus) {
    payload.current_status = currentStatus
  }

  if (hasCurrentStatusText) {
    payload.current_status_text = rowData.currentStatusOther.trim()
  }

  if (hasBarrierText) {
    payload.barrier_identified = rowData.barrierIdentifiedOther.trim()
  }

  if (hasBarrierOptions) {
    payload.barrier_options = barrierOptionIds
  }

  if (hasPlanOptions) {
    payload.plan_options = planOptionIds
  }

  return payload
}

function formatPostIschemicAssessmentJson(values) {
  const assessment = values?.assessment ?? {}

  return {
    assessments: strokeAssessmentData
      .map((row) => {
        const rowData = assessment[row.id] ?? assessment[String(row.id)] ?? {}

        return buildBackendAssessmentPayload(row, rowData)
      })
      .filter(Boolean),
  }
}

function getChangedAssessmentRowIds(changedAssessment) {
  return Object.keys(changedAssessment ?? {})
    .map((rowId) => Number(rowId))
    .filter((rowId) => Number.isFinite(rowId))
}

function normalizeAssessment({
  allValues,
  changedValues,
  previousAssessment,
  manualPlanSelectionsRef,
  barrierNoneOverrideRef,
}) {
  const assessment = cloneAssessment(allValues?.assessment ?? {})
  const changedAssessment = changedValues?.assessment ?? {}
  const changedRowIds = getChangedAssessmentRowIds(changedAssessment)

  // Bug fix: normalize only the row that changed.
  // This prevents selecting "None" in one row from applying auto-selection to the whole form.
  const rowsToNormalize =
    changedRowIds.length > 0
      ? strokeAssessmentData.filter((row) => changedRowIds.includes(row.id))
      : strokeAssessmentData

  rowsToNormalize.forEach((row) => {
    const rowId = row.id
    const rowKey = String(rowId)
    const rowData = { ...(assessment[rowKey] ?? {}) }

    const previousRowData =
      previousAssessment?.[rowKey] ?? previousAssessment?.[rowId] ?? {}

    const rowChangedFields = Object.keys(
      changedAssessment[rowKey] ?? changedAssessment[rowId] ?? {},
    )

    const barrierOptions = row.barrierIdentified?.options ?? []
    const planOptions = row.planEducation?.options ?? []
    const currentStatusOtherLabel = row.currentStatus?.otherInputLabel ?? 'Other'

    if (row.currentStatus?.type === 'checkbox') {
      rowData.currentStatus = toArray(rowData.currentStatus)

      if (
        row.currentStatus.otherInput &&
        !rowData.currentStatus.includes(currentStatusOtherLabel)
      ) {
        rowData.currentStatusOther = ''
      }
    }

    const rowRequiresMrsFirst = rowId === 1
    const hasMrs = !rowRequiresMrsFirst || isNonEmptyString(rowData.mrs)
    const hasCurrentStatus = hasCurrentStatusSelection(row, rowData)

    if (!hasMrs) {
      rowData.currentStatus = row.currentStatus?.type === 'checkbox' ? [] : undefined
      rowData.currentStatusOther = ''
      rowData.barrierIdentified = []
      rowData.barrierIdentifiedOther = ''
      rowData.planEducation = []
      manualPlanSelectionsRef.current[rowId] = []
      assessment[rowKey] = rowData
      return
    }

    if (!hasCurrentStatus) {
      rowData.barrierIdentified = []
      rowData.barrierIdentifiedOther = ''
      rowData.planEducation = []
      manualPlanSelectionsRef.current[rowId] = []
      assessment[rowKey] = rowData
      return
    }

    const currentStatusTriggersAutoNone = shouldAutoSelectBarrierNone(
      rowId,
      rowData.currentStatus,
    )

    const previousStatusTriggeredAutoNone = shouldAutoSelectBarrierNone(
      rowId,
      previousRowData.currentStatus,
    )

    if (rowChangedFields.includes('currentStatus') || !currentStatusTriggersAutoNone) {
      barrierNoneOverrideRef.current[rowId] = false
    }

    if (rowChangedFields.includes('barrierIdentified') && currentStatusTriggersAutoNone) {
      const previousBarrierSelections = toArray(previousRowData.barrierIdentified)
      const nextBarrierSelections = toArray(rowData.barrierIdentified)

      if (isOnlyNoneSelected(previousBarrierSelections) && nextBarrierSelections.length === 0) {
        barrierNoneOverrideRef.current[rowId] = true
      } else if (nextBarrierSelections.includes('None')) {
        barrierNoneOverrideRef.current[rowId] = false
      }
    }

    const barrierAutoNoneOverrideActive = Boolean(barrierNoneOverrideRef.current[rowId])

    if (currentStatusTriggersAutoNone && !barrierAutoNoneOverrideActive) {
      rowData.barrierIdentified = ['None']
      rowData.barrierIdentifiedOther = ''
      rowData.planEducation = []
      manualPlanSelectionsRef.current[rowId] = []
      assessment[rowKey] = rowData
      return
    }

    if (
      rowChangedFields.includes('currentStatus') &&
      previousStatusTriggeredAutoNone &&
      toArray(rowData.barrierIdentified).includes('None')
    ) {
      rowData.barrierIdentified = []
      rowData.barrierIdentifiedOther = ''
    }

    rowData.barrierIdentified = resolveExclusiveNone(
      rowData.barrierIdentified,
      previousRowData.barrierIdentified,
    )

    rowData.barrierIdentified = orderedUnique(rowData.barrierIdentified, barrierOptions)

    const barrierHasNone = rowData.barrierIdentified.includes('None')

    if (barrierHasNone) {
      rowData.barrierIdentified = ['None']
      rowData.barrierIdentifiedOther = ''
      rowData.planEducation = []
      manualPlanSelectionsRef.current[rowId] = []
      assessment[rowKey] = rowData
      return
    }

    if (!rowData.barrierIdentified.includes('Other')) {
      rowData.barrierIdentifiedOther = ''
    }

    const autoPlans = getAutoPlans(rowId, rowData.barrierIdentified)
    const incomingSelectedPlans = orderedUnique(toArray(rowData.planEducation), planOptions)

    if (rowChangedFields.includes('planEducation')) {
      manualPlanSelectionsRef.current[rowId] = subtractByOrder(
        incomingSelectedPlans,
        autoPlans,
        planOptions,
      )
    }

    const manualPlans = manualPlanSelectionsRef.current[rowId] ?? []
    rowData.planEducation = orderedUnique([...autoPlans, ...manualPlans], planOptions)

    assessment[rowKey] = rowData
  })

  return assessment
}

function rowNeedsFullCompletion(rowId, rowData) {
  if (![9, 11, 12, 13].includes(rowId)) return false

  const currentStatus = rowData?.currentStatus

  if (rowId === 9) return currentStatus !== 'Optimal'
  if (rowId === 11) return currentStatus !== 'On statin'
  if (rowId === 12) return currentStatus !== 'BP at target'
  if (rowId === 13) return currentStatus !== 'Optimal'

  return false
}

function validateBeforeSubmit(values) {
  const assessment = values?.assessment ?? {}
  const row1 = assessment[1] ?? assessment['1'] ?? {}

  const row1HasAnyData =
    isNonEmptyString(row1.mrs) ||
    isNonEmptyString(row1.currentStatus) ||
    toArray(row1.barrierIdentified).length > 0 ||
    toArray(row1.planEducation).length > 0

  if (row1HasAnyData && !isNonEmptyString(row1.mrs)) {
    return 'Row 1: mRS must be selected first.'
  }

  if (row1HasAnyData && !isNonEmptyString(row1.currentStatus)) {
    return 'Row 1: Current Status is required once the row is being used.'
  }

  for (const row of strokeAssessmentData) {
    if (!row.required) continue

    const rowData = assessment[row.id] ?? assessment[String(row.id)] ?? {}
    const hasStatus = hasCurrentStatusSelection(row, rowData)

    if (!hasStatus) return `${row.riskModifier}: Current Status is required.`

    if (rowNeedsFullCompletion(row.id, rowData)) {
      const hasBarrier = toArray(rowData.barrierIdentified).length > 0
      const hasPlan = toArray(rowData.planEducation).length > 0

      if (!hasBarrier) return `${row.riskModifier}: Barrier Identified is required.`
      if (!hasPlan) return `${row.riskModifier}: Plan / Education is required.`
    }
  }

  return ''
}

function getFirstValidationMessage(errorInfo) {
  const firstError = errorInfo?.errorFields?.find(
    (field) => Array.isArray(field.errors) && field.errors.length > 0,
  )

  return firstError?.errors?.[0] || 'Please fill the form.'
}

function useIsMobile(breakpoint = 600) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= breakpoint
  })

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= breakpoint)
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [breakpoint])

  return isMobile
}

function AppContent({ visitHistoryRecords, setVisitHistoryRecords }) {
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const [showEmptyValidation, setShowEmptyValidation] = useState(false)

  const applyingLogicRef = useRef(false)
  const previousAssessmentRef = useRef({})
  const manualPlanSelectionsRef = useRef({})
  const barrierNoneOverrideRef = useRef({})
  const formContainerRef = useRef(null)

  const isMobile = useIsMobile(600)

  const visitHistory = useVisitHistory({
    form,
    previousAssessmentRef,
    manualPlanSelectionsRef,
    applyingLogicRef,
    autoPlanDependencies: AUTO_PLAN_DEPENDENCIES,
    enteredBy: CURRENT_DOCTOR_NAME,
    messageApi,
    // Keeps Post Ischemic history above this route so navigation does not clear it.
    visitHistoryRecords,
    setVisitHistoryRecords,
  })

  const handleValuesChange = (changedValues, allValues) => {
    if (hasEnteredData(allValues)) {
      setShowEmptyValidation(false)
    }

    if (applyingLogicRef.current) return

    const normalizedAssessment = normalizeAssessment({
      allValues,
      changedValues,
      previousAssessment: previousAssessmentRef.current,
      manualPlanSelectionsRef,
      barrierNoneOverrideRef,
    })

    const currentAssessment = allValues?.assessment ?? {}

    previousAssessmentRef.current = normalizedAssessment

    if (JSON.stringify(currentAssessment) === JSON.stringify(normalizedAssessment)) {
      return
    }

    applyingLogicRef.current = true
    form.setFieldsValue({ assessment: normalizedAssessment })

    Promise.resolve().then(() => {
      applyingLogicRef.current = false
    })
  }

  const handleKeyboardNavigation = (event) => {
    const activeElement = event.target?.closest?.('[data-nav="true"]')

    if (!activeElement || !formContainerRef.current?.contains(activeElement)) return

    if (event.key === 'Enter') {
      event.preventDefault()

      const navType = activeElement.dataset.navType

      if (navType === 'text') {
        focusNavElement(activeElement)

        const inputTarget = activeElement.matches('input, textarea')
          ? activeElement
          : activeElement.querySelector('input, textarea')

        if (inputTarget && typeof inputTarget.select === 'function') {
          inputTarget.select()
        }

        return
      }

      activeElement.click()
      return
    }

    const directionMap = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'up',
      ArrowDown: 'down',
    }

    const direction = directionMap[event.key]
    if (!direction) return

    const currentRow = Number(activeElement.dataset.navRow)
    const currentCol = Number(activeElement.dataset.navCol)
    const currentType = activeElement.dataset.navType

    if (
      direction === 'down' &&
      currentRow === 20 &&
      [1, 2, 3].includes(currentCol)
    ) {
      const sameColumnLastRowItems = Array.from(
        formContainerRef.current?.querySelectorAll(
          `[data-nav="true"][data-nav-row="20"][data-nav-col="${currentCol}"]`,
        ) ?? [],
      )
        .filter((element) => {
          if (element.disabled) return false
          if (element.getAttribute('aria-disabled') === 'true') return false
          if (element.tabIndex < 0) return false
          if (element.offsetParent === null) return false
          return true
        })
        .sort((a, b) => Number(a.dataset.navIdx) - Number(b.dataset.navIdx))

      const lastItemInSameColumn =
        sameColumnLastRowItems[sameColumnLastRowItems.length - 1]

      if (lastItemInSameColumn === activeElement) {
        const submitButton = formContainerRef.current?.querySelector(
          '[data-nav-type="button"]',
        )

        if (submitButton) {
          event.preventDefault()
          focusNavElement(submitButton)
        }

        return
      }
    }

    if (direction === 'up' && currentType === 'button') {
      const tobaccoCurrentStatusItems = Array.from(
        formContainerRef.current?.querySelectorAll(
          '[data-nav="true"][data-nav-row="20"][data-nav-col="1"]',
        ) ?? [],
      )
        .filter((element) => {
          if (element.disabled) return false
          if (element.getAttribute('aria-disabled') === 'true') return false
          if (element.tabIndex < 0) return false
          if (element.offsetParent === null) return false
          return element.dataset.navType !== 'text'
        })
        .sort((a, b) => Number(a.dataset.navIdx) - Number(b.dataset.navIdx))

      const lastCurrentStatusItem =
        tobaccoCurrentStatusItems[tobaccoCurrentStatusItems.length - 1]

      if (lastCurrentStatusItem) {
        event.preventDefault()
        focusNavElement(lastCurrentStatusItem)
      }

      return
    }

    const nextTarget = findNextNavTarget(
      formContainerRef.current,
      activeElement,
      direction,
    )

    if (!nextTarget) return

    event.preventDefault()
    focusNavElement(nextTarget)
  }

  const handleFinish = (values) => {
    const entered = hasEnteredData(values)

    if (!entered) {
      setShowEmptyValidation(true)
      messageApi.warning('Please fill the form.')
      return
    }

    const validationMessage = validateBeforeSubmit(values)

    if (validationMessage) {
      messageApi.error(validationMessage)
      return
    }

    visitHistory.addVisitHistoryRecord(values)
    const formattedAssessmentJson = formatPostIschemicAssessmentJson(values)

    // Backend integration note:
    // This formattedAssessmentJson is the backend-friendly JSON payload for this visit.
    // Later, this object can be sent to the backend using an API call.
    // Example: POST /api/post-ischemic-visits
    console.log(
      'Post Ischemic Stroke OPD Assessment Submitted JSON:',
      JSON.stringify(formattedAssessmentJson, null, 2),
    )

    messageApi.success('Data submitted successfully.')

    setShowEmptyValidation(false)
    manualPlanSelectionsRef.current = {}
    barrierNoneOverrideRef.current = {}
    previousAssessmentRef.current = {}
    form.resetFields()
  }

  const handleFinishFailed = (errorInfo) => {
    const validationMessage = getFirstValidationMessage(errorInfo)

    if (validationMessage === 'Please fill the form.') {
      setShowEmptyValidation(true)
      messageApi.warning(validationMessage)
      return
    }

    messageApi.error(validationMessage)
  }

  return (
    <>
      {contextHolder}

      <main className="app-shell post-ischemic-page">
        <section className="assessment-layout">
          <Form
            form={form}
            layout="vertical"
            onValuesChange={handleValuesChange}
            onFinish={handleFinish}
            onFinishFailed={handleFinishFailed}
            className="assessment-form"
          >
            <div
              className="assessment-card"
              ref={formContainerRef}
              onKeyDownCapture={handleKeyboardNavigation}
            >
              <header className="assessment-header">
                <h1 className="assessment-title">Post Ischemic Stroke OPD Assessment</h1>
                <VisitHistoryTrigger onClick={visitHistory.openVisitHistory} />
              </header>

              {!isMobile ? (
                <div className="assessment-table-wrapper">
                  <table className="assessment-table">
                    <thead>
                      <tr>
                        <th><span className="table-head-text">Risk Modifier</span></th>
                        <th><span className="table-head-text">Current Status</span></th>
                        <th><span className="table-head-text">Barrier Identified</span></th>
                        <th><span className="table-head-text">Plan / Education</span></th>
                      </tr>
                    </thead>

                    <tbody>
                      {strokeAssessmentData.map((row) => (
                        <AssessmentRow
                          key={row.id}
                          row={row}
                          form={form}
                          showEmptyValidation={showEmptyValidation}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="assessment-mobile-list">
                  {strokeAssessmentData.map((row) => (
                    <AssessmentRow
                      key={`mobile-${row.id}`}
                      row={row}
                      mobile
                      form={form}
                      showEmptyValidation={showEmptyValidation}
                    />
                  ))}
                </div>
              )}

              <footer className="assessment-footer">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="submit-btn"
                  data-nav="true"
                  data-nav-row={strokeAssessmentData.length + 1}
                  data-nav-col={4}
                  data-nav-idx={0}
                  data-nav-type="button"
                  tabIndex={0}
                >
                  Submit
                </Button>
              </footer>
            </div>
          </Form>
        </section>
      </main>

      <VisitHistoryModal
        open={visitHistory.isVisitHistoryOpen}
        onClose={visitHistory.closeVisitHistory}
        patientName={DEFAULT_VISIT_HISTORY_PATIENT.patientName}
        employeeId={DEFAULT_VISIT_HISTORY_PATIENT.employeeId}
        records={visitHistory.visitHistoryRecords}
        onImport={visitHistory.importVisitHistoryRecord}
        onView={visitHistory.openViewVisitRecord}
      />

      <VisitRecordViewModal
        open={Boolean(visitHistory.viewRecord)}
        onClose={visitHistory.backToHistoryFromView}
        patientName={DEFAULT_VISIT_HISTORY_PATIENT.patientName}
        employeeId={DEFAULT_VISIT_HISTORY_PATIENT.employeeId}
        record={visitHistory.viewRecord}
      />
    </>
  )
}

function PostIschemicStroke({
  visitHistoryRecords = [],
  setVisitHistoryRecords,
}) {
  return (
    <AntApp>
      <AppContent
        visitHistoryRecords={visitHistoryRecords}
        setVisitHistoryRecords={setVisitHistoryRecords}
      />
    </AntApp>
  )
}

export default PostIschemicStroke