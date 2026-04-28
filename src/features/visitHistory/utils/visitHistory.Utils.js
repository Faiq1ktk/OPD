import { strokeAssessmentData } from '../../../data/strokeAssessmentData'

export function toArray(value) {
  return Array.isArray(value) ? value : []
}

export function orderedUnique(values, order) {
  const selected = new Set(values)
  return order.filter((item) => selected.has(item))
}

export function subtractByOrder(source, toRemove, order) {
  const removeSet = new Set(toRemove)
  return order.filter((item) => source.includes(item) && !removeSet.has(item))
}

export function cloneAssessmentSnapshot(assessment) {
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

export function formatVisitDateLabel(dateInput) {
  const date = new Date(dateInput)

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatVisitDateTime(dateInput) {
  const date = new Date(dateInput)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function getAutoPlansFromBarriers(row, selectedBarriers, autoPlanDependencies) {
  const barrierList = toArray(selectedBarriers)

  if (barrierList.length === 0 || barrierList.includes('None')) {
    return []
  }

  const rowMap = autoPlanDependencies[row.id] ?? {}
  const autoPlans = []

  barrierList.forEach((barrier) => {
    const plans = rowMap[barrier] ?? []
    autoPlans.push(...plans)
  })

  const validPlanOptions = row?.planEducation?.options ?? []

  return orderedUnique(autoPlans, validPlanOptions)
}

export function deriveManualPlanSelectionsFromSnapshot(
  assessment,
  autoPlanDependencies,
) {
  const manualSelections = {}

  strokeAssessmentData.forEach((row) => {
    const rowData = assessment[row.id] ?? assessment[String(row.id)] ?? {}
    const selectedBarriers = toArray(rowData.barrierIdentified)
    const planOptions = row.planEducation?.options ?? []
    const selectedPlans = orderedUnique(toArray(rowData.planEducation), planOptions)

    if (selectedBarriers.includes('None')) {
      manualSelections[row.id] = []
      return
    }

    const autoPlans = getAutoPlansFromBarriers(
      row,
      selectedBarriers,
      autoPlanDependencies,
    )

    manualSelections[row.id] = subtractByOrder(
      selectedPlans,
      autoPlans,
      planOptions,
    )
  })

  return manualSelections
}

export function createVisitHistoryRecord(values, enteredBy) {
  const submittedAt = new Date()

  return {
    id: `visit-${submittedAt.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    visitDateLabel: formatVisitDateLabel(submittedAt),
    enteredBy,
    submittedAt: submittedAt.toISOString(),
    assessmentSnapshot: cloneAssessmentSnapshot(values?.assessment ?? {}),
  }
}