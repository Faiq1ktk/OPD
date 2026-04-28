let lastFocusedNavElement = null

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function getFocusableTarget(element) {
  if (!element) return null

  if (
    element.matches(
      'input:not([type="hidden"]), button, textarea, select, [tabindex]',
    )
  ) {
    return element
  }

  return element.querySelector(
    'input:not([disabled]):not([type="hidden"]), button:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )
}

function isSubmitButton(element) {
  return (
    element?.tagName === 'BUTTON' &&
    (element.type === 'submit' || element.getAttribute('htmltype') === 'submit')
  )
}

function isCheckboxOrRadio(element) {
  return (
    element?.tagName === 'INPUT' &&
    ['checkbox', 'radio'].includes(element.type)
  )
}

function isTextarea(element) {
  return element?.tagName === 'TEXTAREA'
}

function isDisabled(element) {
  const target = getFocusableTarget(element)

  return (
    !target ||
    target.disabled ||
    element.getAttribute('aria-disabled') === 'true' ||
    target.getAttribute('aria-disabled') === 'true'
  )
}

function isVisible(element) {
  if (!element) return false

  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

function getActiveNavElement(activeElement) {
  return activeElement?.closest?.('[data-nav="true"]') ?? null
}

function getNavElements(container) {
  if (!container) return []

  return Array.from(container.querySelectorAll('[data-nav="true"]'))
    .filter((element) => isVisible(element) && !isDisabled(element))
    .sort((a, b) => {
      const rowDiff = toNumber(a.dataset.navRow) - toNumber(b.dataset.navRow)
      if (rowDiff !== 0) return rowDiff

      const colDiff = toNumber(a.dataset.navCol) - toNumber(b.dataset.navCol)
      if (colDiff !== 0) return colDiff

      return toNumber(a.dataset.navIdx) - toNumber(b.dataset.navIdx)
    })
}

function getCellElements(elements, row, col) {
  return elements
    .filter(
      (element) =>
        toNumber(element.dataset.navRow) === row &&
        toNumber(element.dataset.navCol) === col,
    )
    .sort((a, b) => toNumber(a.dataset.navIdx) - toNumber(b.dataset.navIdx))
}

function getColumnElements(elements, col) {
  return elements
    .filter((element) => toNumber(element.dataset.navCol) === col)
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
        .filter((element) => toNumber(element.dataset.navRow) === row)
        .map((element) => toNumber(element.dataset.navCol)),
    ),
  ].sort((a, b) => a - b)
}

function getSubmitButton(elements) {
  return (
    elements.find((element) => {
      const target = getFocusableTarget(element)

      return (
        toNumber(element.dataset.navRow) === 10 &&
        target?.tagName === 'BUTTON'
      )
    }) ?? null
  )
}

function findVerticalTarget(elements, currentElement, direction) {
  const row = toNumber(currentElement.dataset.navRow)
  const col = toNumber(currentElement.dataset.navCol)

  const sameCellElements = getCellElements(elements, row, col)
  const currentCellIndex = sameCellElements.indexOf(currentElement)

  if (currentCellIndex !== -1) {
    const nextCellIndex =
      direction === 'down' ? currentCellIndex + 1 : currentCellIndex - 1

    if (nextCellIndex >= 0 && nextCellIndex < sameCellElements.length) {
      return sameCellElements[nextCellIndex]
    }
  }

  const columnElements = getColumnElements(elements, col)

  const nextRowTarget =
    direction === 'down'
      ? columnElements.find(
          (element) => toNumber(element.dataset.navRow) > row,
        )
      : [...columnElements]
          .reverse()
          .find((element) => toNumber(element.dataset.navRow) < row)

  if (nextRowTarget) return nextRowTarget

  if (direction === 'down') {
    return getSubmitButton(elements)
  }

  return null
}

function findHorizontalTarget(elements, currentElement, direction) {
  const row = toNumber(currentElement.dataset.navRow)
  const col = toNumber(currentElement.dataset.navCol)
  const idx = toNumber(currentElement.dataset.navIdx)

  const rowColumns = getRowColumns(elements, row)
  const currentColumnIndex = rowColumns.indexOf(col)

  if (currentColumnIndex === -1) return null

  const nextColumnIndex =
    direction === 'right' ? currentColumnIndex + 1 : currentColumnIndex - 1

  if (nextColumnIndex < 0 || nextColumnIndex >= rowColumns.length) {
    return null
  }

  const targetCol = rowColumns[nextColumnIndex]
  const targetCellElements = getCellElements(elements, row, targetCol)

  return (
    targetCellElements.find(
      (element) => toNumber(element.dataset.navIdx) === idx,
    ) ??
    targetCellElements[0] ??
    null
  )
}

function focusNavElement(element) {
  const target = getFocusableTarget(element)

  if (!target) return

  lastFocusedNavElement = element

  target.focus({ preventScroll: true })

  target.scrollIntoView?.({
    block: 'nearest',
    inline: 'nearest',
    behavior: 'auto',
  })
}

function focusFirstPlanOptionInSameRow(container, currentNavElement) {
  const elements = getNavElements(container)
  const row = toNumber(currentNavElement.dataset.navRow)
  const planColumnElements = getCellElements(elements, row, 5)

  if (planColumnElements.length > 0) {
    focusNavElement(planColumnElements[0])
  }
}

function handleEnterKey(event) {
  const target = event.target
  const currentNavElement = getActiveNavElement(target)

  if (currentNavElement) {
    lastFocusedNavElement = currentNavElement
  }

  if (isSubmitButton(target)) {
    return
  }

  event.preventDefault()
  event.stopPropagation()

  if (isCheckboxOrRadio(target)) {
    target.click()
    return
  }

  if (isTextarea(target) && currentNavElement) {
    focusFirstPlanOptionInSameRow(event.currentTarget, currentNavElement)
  }
}

export function handleArrowNavigation(event) {
  if (event.key === 'Enter') {
    handleEnterKey(event)
    return
  }

  const directionMap = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
  }

  const direction = directionMap[event.key]
  if (!direction) return

  const activeNavElement =
    getActiveNavElement(document.activeElement) ?? lastFocusedNavElement

  if (!activeNavElement) return

  const elements = getNavElements(event.currentTarget)

  const nextElement =
    direction === 'up' || direction === 'down'
      ? findVerticalTarget(elements, activeNavElement, direction)
      : findHorizontalTarget(elements, activeNavElement, direction)

  if (!nextElement) return

  event.preventDefault()
  event.stopPropagation()
  focusNavElement(nextElement)
}