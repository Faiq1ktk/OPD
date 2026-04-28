import { useEffect, useRef } from 'react'
import { Checkbox, Form, Input, Radio } from '../ui/antd'

const renderOptionText = (text) => <span className="option-text">{text}</span>

function toArray(value) {
  return Array.isArray(value) ? value : []
}

function hasSelection(value, type) {
  if (type === 'checkbox') {
    return Array.isArray(value) && value.length > 0
  }

  return typeof value === 'string' && value.trim() !== ''
}

function getNavProps({ rowId, col, idx, type, disabled = false }) {
  return {
    'data-nav': 'true',
    'data-nav-row': rowId,
    'data-nav-col': col,
    'data-nav-idx': idx,
    'data-nav-type': type,
    tabIndex: disabled ? -1 : 0,
  }
}

function useRowInteractionState(row, form) {
  const mrsValue = Form.useWatch(['assessment', row.id, 'mrs'], form)
  const currentStatusValue = Form.useWatch(
    ['assessment', row.id, 'currentStatus'],
    form,
  )
  const barrierValues = toArray(
    Form.useWatch(['assessment', row.id, 'barrierIdentified'], form),
  )

  const isRow1 = row.id === 1
  const hasMrsValue = typeof mrsValue === 'string' && mrsValue.trim() !== ''
  const isCurrentStatusEnabled = !isRow1 || hasMrsValue
  const isCurrentStatusSelected = hasSelection(
    currentStatusValue,
    row.currentStatus.type,
  )
  const isBarrierEnabled = isCurrentStatusEnabled && isCurrentStatusSelected
  const isBarrierNoneSelected = barrierValues.includes('None')
  const isPlanEnabled = isBarrierEnabled && !isBarrierNoneSelected

  return {
    isCurrentStatusEnabled,
    isBarrierEnabled,
    isPlanEnabled,
  }
}

function MRSBlock({ row, disabled = false }) {
  return (
    <div className="mrs-wrap">
      <div className="mrs-label">
        <span>{row.riskExtra.label}:</span>
        {row.riskExtra.required && <span className="required-asterisk">*</span>}
      </div>

      <Form.Item name={['assessment', row.id, 'mrs']} style={{ marginBottom: 0 }}>
        <Radio.Group className="mrs-grid" disabled={disabled}>
          {row.riskExtra.options.map((item, index) => (
            <Radio
              key={item}
              value={item}
              className="mrs-item"
              disabled={disabled}
              {...getNavProps({
                rowId: row.id,
                col: 0,
                idx: index,
                type: 'radio',
                disabled,
              })}
            >
              <span className="mrs-value">{item}</span>
            </Radio>
          ))}
        </Radio.Group>
      </Form.Item>
    </div>
  )
}

function RadioGroupBlock({ rowId, fieldKey, options, disabled = false, navCol }) {
  return (
    <Form.Item name={['assessment', rowId, fieldKey]} style={{ marginBottom: 0 }}>
      <Radio.Group className="status-group" disabled={disabled}>
        {options.map((item, index) => (
          <Radio
            key={item}
            value={item}
            className="status-option"
            disabled={disabled}
            {...getNavProps({
              rowId,
              col: navCol,
              idx: index,
              type: 'radio',
              disabled,
            })}
          >
            {renderOptionText(item)}
          </Radio>
        ))}
      </Radio.Group>
    </Form.Item>
  )
}

function CheckboxGroupBlock({
  form,
  rowId,
  fieldKey,
  options,
  otherInput = false,
  otherInputLabel = 'Other',
  smallOtherInput = false,
  disabled = false,
  navCol,
}) {
  const selectedValues = toArray(Form.useWatch(['assessment', rowId, fieldKey], form))
  const isBarrierField = fieldKey === 'barrierIdentified'
  const hasNoneSelected = selectedValues.includes('None')
  const includesOtherOption = otherInput && options.includes(otherInputLabel)
  const mainOptions = includesOtherOption
    ? options.filter((item) => item !== otherInputLabel)
    : options

  const isOtherSelected =
    includesOtherOption &&
    selectedValues.includes(otherInputLabel) &&
    !hasNoneSelected

  const otherInputRef = useRef(null)

  useEffect(() => {
    if (!isOtherSelected || disabled) return

    const inputElement = otherInputRef.current?.input ?? otherInputRef.current
    if (!inputElement) return

    inputElement.focus({ preventScroll: true })

    if (typeof inputElement.select === 'function') {
      inputElement.select()
    }
  }, [isOtherSelected, disabled])

  const groupClass =
    fieldKey === 'planEducation' ? 'plan-column' : 'checkbox-column'
  const optionClass =
    fieldKey === 'planEducation' ? 'plan-option' : 'checkbox-option'

  const rowClass = smallOtherInput
    ? 'checkbox-with-small-input-row'
    : 'checkbox-with-input-row'

  const scopeClass =
    fieldKey === 'currentStatus'
      ? 'other-row-current-status'
      : fieldKey === 'planEducation'
        ? 'other-row-plan'
        : 'other-row-barrier'

  const isOtherDisabled = disabled || (isBarrierField && hasNoneSelected)

  const handleOtherChange = (event) => {
    const checked = event.target.checked
    const currentValues = toArray(form.getFieldValue(['assessment', rowId, fieldKey]))
    const withoutOther = currentValues.filter((item) => item !== otherInputLabel)

    if (!checked) {
      form.setFieldsValue({
        assessment: {
          [rowId]: {
            [fieldKey]: withoutOther,
          },
        },
      })
      return
    }

    if (isBarrierField && withoutOther.includes('None')) {
      form.setFieldsValue({
        assessment: {
          [rowId]: {
            [fieldKey]: ['None'],
          },
        },
      })
      return
    }

    form.setFieldsValue({
      assessment: {
        [rowId]: {
          [fieldKey]: [...withoutOther, otherInputLabel],
        },
      },
    })
  }

  return (
    <>
      <Form.Item
        name={['assessment', rowId, fieldKey]}
        style={{ marginBottom: 0 }}
        getValueFromEvent={(nextMainValues) => {
          const nextValues = toArray(nextMainValues)

          if (
            includesOtherOption &&
            selectedValues.includes(otherInputLabel) &&
            !nextValues.includes('None')
          ) {
            return [...nextValues, otherInputLabel]
          }

          return nextValues
        }}
      >
        <Checkbox.Group className={groupClass} disabled={disabled}>
          {mainOptions.map((item, index) => {
            const isOptionDisabled =
              disabled || (isBarrierField && hasNoneSelected && item !== 'None')

            return (
              <Checkbox
                key={item}
                value={item}
                className={optionClass}
                disabled={isOptionDisabled}
                {...getNavProps({
                  rowId,
                  col: navCol,
                  idx: index,
                  type: 'checkbox',
                  disabled: isOptionDisabled,
                })}
              >
                {renderOptionText(item)}
              </Checkbox>
            )
          })}
        </Checkbox.Group>
      </Form.Item>

      {includesOtherOption && (
        <div className={`${rowClass} ${scopeClass}`}>
          <Checkbox
            checked={selectedValues.includes(otherInputLabel)}
            onChange={handleOtherChange}
            className={optionClass}
            disabled={isOtherDisabled}
            {...getNavProps({
              rowId,
              col: navCol,
              idx: mainOptions.length,
              type: 'checkbox',
              disabled: isOtherDisabled,
            })}
          />

          <span className="inline-option-text">{otherInputLabel}</span>

          <Form.Item
            name={['assessment', rowId, `${fieldKey}Other`]}
            style={{ marginBottom: 0 }}
          >
            <Input
              ref={otherInputRef}
              size="small"
              disabled={disabled || !isOtherSelected}
              className={smallOtherInput ? 'other-small-input' : 'other-input'}
              {...getNavProps({
                rowId,
                col: navCol,
                idx: mainOptions.length + 1,
                type: 'text',
                disabled: disabled || !isOtherSelected,
              })}
            />
          </Form.Item>
        </div>
      )}
    </>
  )
}

function CurrentStatusField({ row, form, disabled }) {
  if (row.currentStatus.type === 'radio') {
    return (
      <RadioGroupBlock
        rowId={row.id}
        fieldKey="currentStatus"
        options={row.currentStatus.options}
        disabled={disabled}
        navCol={1}
      />
    )
  }

  return (
    <CheckboxGroupBlock
      form={form}
      rowId={row.id}
      fieldKey="currentStatus"
      options={row.currentStatus.options}
      otherInput={row.currentStatus.otherInput}
      otherInputLabel={row.currentStatus.otherInputLabel}
      smallOtherInput={row.currentStatus.smallOtherInput}
      disabled={disabled}
      navCol={1}
    />
  )
}

function RiskModifierContent({ row }) {
  return (
    <div className="risk-block">
      <div className="risk-title">
        {row.riskModifier}
        {row.required && <span className="required-asterisk"> *</span>}
      </div>

      {row.riskExtra?.type === 'mrs' && <MRSBlock row={row} />}
    </div>
  )
}

function RowFields({ row, form }) {
  const {
    isCurrentStatusEnabled,
    isBarrierEnabled,
    isPlanEnabled,
  } = useRowInteractionState(row, form)

  return (
    <>
      <td>
        <RiskModifierContent row={row} />
      </td>

      <td>
        <CurrentStatusField
          row={row}
          form={form}
          disabled={!isCurrentStatusEnabled}
        />
      </td>

      <td>
        <CheckboxGroupBlock
          form={form}
          rowId={row.id}
          fieldKey="barrierIdentified"
          options={row.barrierIdentified.options}
          otherInput={row.barrierIdentified.otherInput}
          otherInputLabel="Other"
          disabled={!isBarrierEnabled}
          navCol={2}
        />
      </td>

      <td>
        <CheckboxGroupBlock
          form={form}
          rowId={row.id}
          fieldKey="planEducation"
          options={row.planEducation.options}
          disabled={!isPlanEnabled}
          navCol={3}
        />
      </td>
    </>
  )
}

function DesktopRow({ row, form }) {
  return (
    <tr>
      <RowFields row={row} form={form} />
    </tr>
  )
}

function MobileRow({ row, form }) {
  const {
    isCurrentStatusEnabled,
    isBarrierEnabled,
    isPlanEnabled,
  } = useRowInteractionState(row, form)

  return (
    <div className="assessment-mobile-card">
      <div className="mobile-field">
        <div className="mobile-label">Risk Modifier</div>
        <div className="mobile-value">
          <RiskModifierContent row={row} />
        </div>
      </div>

      <div className="mobile-field">
        <div className="mobile-label">Current Status</div>
        <div className="mobile-value mobile-section">
          <CurrentStatusField
            row={row}
            form={form}
            disabled={!isCurrentStatusEnabled}
          />
        </div>
      </div>

      <div className="mobile-field">
        <div className="mobile-label">Barrier Identified</div>
        <div className="mobile-value mobile-section">
          <CheckboxGroupBlock
            form={form}
            rowId={row.id}
            fieldKey="barrierIdentified"
            options={row.barrierIdentified.options}
            otherInput={row.barrierIdentified.otherInput}
            otherInputLabel="Other"
            disabled={!isBarrierEnabled}
            navCol={2}
          />
        </div>
      </div>

      <div className="mobile-field">
        <div className="mobile-label">Plan / Education</div>
        <div className="mobile-value mobile-section">
          <CheckboxGroupBlock
            form={form}
            rowId={row.id}
            fieldKey="planEducation"
            options={row.planEducation.options}
            disabled={!isPlanEnabled}
            navCol={3}
          />
        </div>
      </div>
    </div>
  )
}

function AssessmentRow({ row, mobile = false, form }) {
  if (mobile) {
    return <MobileRow row={row} form={form} />
  }

  return <DesktopRow row={row} form={form} />
}

export default AssessmentRow