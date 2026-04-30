import { useState } from 'react'
import { generateVisitRecord } from '../utils/lifestyleHistory.utils'

export function useLifestyleHistory(context = {}) {
  const [records, setRecords] = useState([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [viewRecord, setViewRecord] = useState(null)

  const addRecord = (values) => {
    const record = generateVisitRecord(values, context)

  // Backend integration note:
  // Right now, this record is only stored in React state (frontend memory).
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