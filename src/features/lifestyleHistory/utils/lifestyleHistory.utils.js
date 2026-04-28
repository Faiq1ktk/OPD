function getSafeDate(dateInput) {
  const date = new Date(dateInput)
  return isNaN(date.getTime()) ? new Date() : date
}

export function formatDate(dateInput = new Date()) {
  const date = getSafeDate(dateInput)

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatFullDate(dateInput = new Date()) {
  const date = getSafeDate(dateInput)

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatTime(dateInput = new Date()) {
  const date = getSafeDate(dateInput)

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function formatDateTime(dateInput = new Date()) {
  const date = getSafeDate(dateInput)

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export function generateVisitRecord(values, context = {}) {
  const submittedAt = new Date()

  return {
    id: `lifestyle-${submittedAt.getTime()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    visitDate: submittedAt.toISOString(),
    visitDateLabel: formatDate(submittedAt),
    visitDateFullLabel: formatFullDate(submittedAt),
    visitTimeLabel: formatTime(submittedAt),
    enteredBy: context.enteredBy ?? 'Dr. Dummy',
    patientName: context.patientName ?? 'Dummy Patient',
    employeeId: context.employeeId ?? '000000',
    assessmentSnapshot: values,
  }
}