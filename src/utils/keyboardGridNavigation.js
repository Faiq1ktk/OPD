function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function isVisible(element) {
  if (!element) return false
  if (element.disabled) return false
  if (element.getAttribute('aria-disabled') === 'true') return false
  if (element.tabIndex < 0) return false
  if (element.offsetParent === null) return false
  return true
}

export function getFocusableTarget(element) {
  if (!element) return null

  const innerTarget = element.querySelector(
    'input:not([disabled]), button:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )

  return innerTarget ?? element
}

export function focusNavElement(element) {
  const target = getFocusableTarget(element)
  if (!target) return

  target.focus({ preventScroll: true })

  if (typeof target.scrollIntoView === 'function') {
    target.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'auto',
    })
  }
}

export function getNavElements(container) {
  if (!container) return []

  return Array.from(container.querySelectorAll('[data-nav="true"]'))
    .filter(isVisible)
    .sort((a, b) => {
      const colDiff = toNumber(a.dataset.navCol) - toNumber(b.dataset.navCol)
      if (colDiff !== 0) return colDiff

      const rowDiff = toNumber(a.dataset.navRow) - toNumber(b.dataset.navRow)
      if (rowDiff !== 0) return rowDiff

      return toNumber(a.dataset.navIdx) - toNumber(b.dataset.navIdx)
    })
}

function getCellElements(elements, row, col) {
  return elements
    .filter(
      (item) =>
        toNumber(item.dataset.navRow) === row &&
        toNumber(item.dataset.navCol) === col,
    )
    .sort((a, b) => toNumber(a.dataset.navIdx) - toNumber(b.dataset.navIdx))
}

function getColumnElements(elements, col) {
  return elements
    .filter((item) => toNumber(item.dataset.navCol) === col)
    .sort((a, b) => {
      const rowDiff = toNumber(a.dataset.navRow) - toNumber(b.dataset.navRow)
      if (rowDiff !== 0) return rowDiff

      return toNumber(a.dataset.navIdx) - toNumber(b.dataset.navIdx)
    })
}

function getRowColumns(elements, row) {
  return [
    ...new Set(
      elements
        .filter((item) => toNumber(item.dataset.navRow) === row)
        .map((item) => toNumber(item.dataset.navCol)),
    ),
  ].sort((a, b) => a - b)
}

function getAdjacentInSameCell(elements, row, col, idx, direction) {
  const cellElements = getCellElements(elements, row, col)
  if (cellElements.length === 0) return null

  if (direction === 'right') {
    return cellElements.find((item) => toNumber(item.dataset.navIdx) === idx + 1) ?? null
  }

  if (direction === 'left') {
    return (
      [...cellElements]
        .reverse()
        .find((item) => toNumber(item.dataset.navIdx) === idx - 1) ?? null
    )
  }

  return null
}

export function findNextNavTarget(container, activeElement, direction) {
  const elements = getNavElements(container)
  if (elements.length === 0 || !activeElement) return null

  const currentRow = toNumber(activeElement.dataset.navRow)
  const currentCol = toNumber(activeElement.dataset.navCol)
  const currentIdx = toNumber(activeElement.dataset.navIdx)
  const currentType = activeElement.dataset.navType

  if (direction === 'up' || direction === 'down') {
    const columnElements = getColumnElements(elements, currentCol)
    const currentPosition = columnElements.findIndex((item) => item === activeElement)

    if (currentPosition === -1) return null

    const nextPosition =
      direction === 'down' ? currentPosition + 1 : currentPosition - 1

    if (nextPosition < 0 || nextPosition >= columnElements.length) return null

    return columnElements[nextPosition]
  }

  if (direction === 'right' || direction === 'left') {
    const sameCellStep = getAdjacentInSameCell(
      elements,
      currentRow,
      currentCol,
      currentIdx,
      direction,
    )

    if (
      sameCellStep &&
      (currentType === 'text' || sameCellStep.dataset.navType === 'text')
    ) {
      return sameCellStep
    }

    const rowColumns = getRowColumns(elements, currentRow)
    const currentColumnPosition = rowColumns.indexOf(currentCol)

    if (currentColumnPosition === -1) return null

    const nextColumnPosition =
      direction === 'right'
        ? currentColumnPosition + 1
        : currentColumnPosition - 1

    if (nextColumnPosition < 0 || nextColumnPosition >= rowColumns.length) return null

    const targetCol = rowColumns[nextColumnPosition]
    const targetCellElements = getCellElements(elements, currentRow, targetCol)

    if (targetCellElements.length === 0) return null

    const exact = targetCellElements.find(
      (item) => toNumber(item.dataset.navIdx) === currentIdx,
    )

    return exact ?? targetCellElements[0]
  }

  return null
}