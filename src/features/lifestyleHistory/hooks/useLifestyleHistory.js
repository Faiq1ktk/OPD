import { useState } from 'react'
import { generateVisitRecord } from '../utils/lifestyleHistory.utils'

export function useLifestyleHistory(context = {}) {
  const [records, setRecords] = useState([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [viewRecord, setViewRecord] = useState(null)

  const addRecord = (values) => {
    const record = generateVisitRecord(values, context)
    setRecords((prev) => [record, ...prev])
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