import { useState } from 'react'
import { generateVisitRecord } from '../utils/lifestyleHistory.utils'

export function useLifestyleHistory(context = {}, historyStore = {}) {
  const [internalRecords, setInternalRecords] = useState([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [viewRecord, setViewRecord] = useState(null)

  const records = Array.isArray(historyStore.records)
    ? historyStore.records
    : internalRecords

  const setRecords =
    typeof historyStore.setRecords === 'function'
      ? historyStore.setRecords
      : setInternalRecords

  const addRecord = (values) => {
    const record = generateVisitRecord(values, context)

    // Keeps lifestyle history above route level when provided, so navigation does not clear it.
    // Later, this same record should also be sent to the backend database.
    // Example:
    // await api.createLifestyleRiskAssessment(record)

    setRecords((prev) => [record, ...prev])
    return record
  }

  const openHistory = () => setHistoryOpen(true)

  const closeHistory = () => setHistoryOpen(false)

  const importRecord = (record, form) => {
    if (form && record?.assessmentSnapshot) {
      form.setFieldsValue(record.assessmentSnapshot)
    }

    setHistoryOpen(false)
  }

  const openView = (record) => {
    setHistoryOpen(false)
    setViewRecord(record)
  }

  const closeView = () => {
    setViewRecord(null)
  }

  const backToHistoryFromView = () => {
    setViewRecord(null)
    setHistoryOpen(true)
  }

  return {
    records,
    historyOpen,
    viewRecord,
    addRecord,
    openHistory,
    closeHistory,
    importRecord,
    openView,
    closeView,
    backToHistoryFromView,
  }
}