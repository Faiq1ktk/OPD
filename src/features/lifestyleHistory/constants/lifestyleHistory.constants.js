export const LIFESTYLE_HISTORY_TITLE = 'Lifestyle and Risk Assessment'


// Backend integration note:
// This is temporary dummy context data.
// Later, enteredBy should come from the logged-in doctor/user profile.
// patientName and employeeId should come from the backend patient API.
// Example backend source: authenticated doctor session + selected patient profile.

export const DEFAULT_LIFESTYLE_HISTORY_CONTEXT = {
  enteredBy: 'Dr. Dummy',
  patientName: 'Dummy Patient',
  employeeId: '000000',
}

export const HISTORY_COLUMNS = {
  visitDate: 'Visit Date / Time',
  enteredBy: 'Entered By',
  import: 'Import',
  view: 'View',
}