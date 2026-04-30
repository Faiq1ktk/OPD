import { useState } from 'react'
import {
  cloneAssessmentSnapshot,
  createVisitHistoryRecord,
  deriveManualPlanSelectionsFromSnapshot,
} from '../utils/visitHistory.utils'

function useVisitHistory({
  form,
  previousAssessmentRef,
  manualPlanSelectionsRef,
  applyingLogicRef,
  autoPlanDependencies,
  enteredBy,
  messageApi,
}) {
  const [isVisitHistoryOpen, setIsVisitHistoryOpen] = useState(false)
  const [visitHistoryRecords, setVisitHistoryRecords] = useState([])
  const [viewRecord, setViewRecord] = useState(null)

  const openVisitHistory = () => setIsVisitHistoryOpen(true)
  const closeVisitHistory = () => setIsVisitHistoryOpen(false)
  const closeViewRecord = () => setViewRecord(null)

  const backToHistoryFromView = () => {
    setViewRecord(null)
    setIsVisitHistoryOpen(true)
  }
   

  const addVisitHistoryRecord = (values) => {
    const record = createVisitHistoryRecord(values, enteredBy)
    
  // Backend integration note:
  // Right now, this record is only saved in React state (frontend memory).
  // Later, this same record should also be sent to the backend database.
  // Example:
  // await api.createPostIschemicVisit(record)

    setVisitHistoryRecords((previousRecords) => [record, ...previousRecords])
    return record
  }

  const importVisitHistoryRecord = (record) => {
    const importedAssessment = cloneAssessmentSnapshot(
      record?.assessmentSnapshot ?? {},
    )

    manualPlanSelectionsRef.current = deriveManualPlanSelectionsFromSnapshot(
      importedAssessment,
      autoPlanDependencies,
    )

    previousAssessmentRef.current = cloneAssessmentSnapshot(importedAssessment)

    applyingLogicRef.current = true
    form.setFieldsValue({ assessment: importedAssessment })

    Promise.resolve().then(() => {
      applyingLogicRef.current = false
    })

    setIsVisitHistoryOpen(false)
    setViewRecord(null)
    messageApi.success('Visit imported into the form.')
  }

  const openViewVisitRecord = (record) => {
    setIsVisitHistoryOpen(false)
    setViewRecord(record)
  }

  return {
    isVisitHistoryOpen,
    visitHistoryRecords,
    viewRecord,
    openVisitHistory,
    closeVisitHistory,
    closeViewRecord,
    backToHistoryFromView,
    addVisitHistoryRecord,
    importVisitHistoryRecord,
    openViewVisitRecord,
  }
}

export default useVisitHistory