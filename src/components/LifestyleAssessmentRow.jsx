import { Checkbox, Form, Input, Radio, Typography } from '../ui/antd'

const { Text } = Typography
const { TextArea } = Input

function getAutoSelectedPlanOptions(row, selectedStatus) {
  const [educationOption] = row.planOptions

  const autoSelectionMap = {
    1: {
      Optimal: row.planOptions,
      Suboptimal: [],
    },

    2: {
      Optimal: [educationOption],
      Suboptimal: row.planOptions,
    },

    3: {
      Optimal: [educationOption],
      Suboptimal: row.planOptions,
    },
    4: {
      Optimal: [],
      Suboptimal: [educationOption],
    },
    5: {
      Yes: row.planOptions,
      No: [],
    },
    6: {
      Yes: [educationOption],
      No: row.planOptions,
    },
    7: {
      Optimal: [educationOption],
      Suboptimal: row.planOptions,
    },
    8: {
      Optimal: [educationOption],
      Suboptimal: row.planOptions,
    },
    9: {
      Yes: [],
      No: row.planOptions,
    },
  }

  return autoSelectionMap[row.id]?.[selectedStatus]
}

function LifestyleAssessmentRow({ row, form, mobile = false }) {
  const statusPath = ['assessment', row.id, 'status']
  const barrierPath = ['assessment', row.id, 'barrier']
  const planPath = ['assessment', row.id, 'plan']

  const isBarrierDisabled = false

  const handleStatusChange = (event) => {
    const nextStatus = event.target.value
    const nextPlan = getAutoSelectedPlanOptions(row, nextStatus)

    if (Array.isArray(nextPlan)) {
      form.setFieldValue(planPath, nextPlan)
    }
  }

  const computedBarrierHeight = Math.max(
    row.barrierHeight - 8,
    row.planOptions.length * 24 + 12,
    row.statusOptions.length * 24 + 12,
    60,
  )

  if (mobile) {
    return (
      <div className="assessment-mobile-card">
        <div className="mobile-field">
          <Text className="mobile-field__label">Risk Modifier</Text>
          <Text className="mobile-risk-text">{row.riskModifier}</Text>
        </div>

        <div className="mobile-field">
          <Text className="mobile-field__label">Goal / Target</Text>
          <div className="mobile-goal-list">
            {row.goalTarget.map((goal, index) => (
              <Text key={index} className="goal-text">
                {goal}
              </Text>
            ))}
          </div>
        </div>

        <div className="mobile-field">
          <Text className="mobile-field__label">Current Status</Text>
          <Form.Item name={statusPath} style={{ marginBottom: 4 }}>
            <Radio.Group
              className="current-status-group ant-status-group"
              style={{
                '--status-container-height': `${row.statusContainerHeight}px`,
              }}
              onChange={handleStatusChange}
            >
              {row.statusOptions.map((option) => (
                <Radio key={option} value={option}>
                  <Text className="status-text">{option}</Text>
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        </div>

        <div className="mobile-field">
          <Text className="mobile-field__label">Barrier Identified</Text>
          <Form.Item name={barrierPath} style={{ marginBottom: 0 }}>
            <div className="barrier-field-wrap">
              <TextArea
                className="barrier-textarea"
                style={{ '--barrier-height': `${computedBarrierHeight}px` }}
                autoSize={false}
                disabled={isBarrierDisabled}
              />
            </div>
          </Form.Item>
        </div>

        <div className="mobile-field">
          <Text className="mobile-field__label">Plan / Patient Education</Text>
          <Form.Item name={planPath} style={{ marginBottom: 0 }}>
            <Checkbox.Group className="plan-group">
              {row.planOptions.map((item) => (
                <Checkbox key={item} value={item}>
                  <Text className="plan-text">{item}</Text>
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
        </div>
      </div>
    )
  }

  return (
    <tr>
      <td>
        <Text className="risk-text">{row.riskModifier}</Text>
      </td>

      <td>
        <div className="goal-list">
          {row.goalTarget.map((goal, index) => (
            <Text key={index} className="goal-text">
              {goal}
            </Text>
          ))}
        </div>
      </td>

      <td className="current-status-cell">
        <Form.Item name={statusPath} style={{ marginBottom: 0 }}>
          <Radio.Group
            className="current-status-group ant-status-group"
            style={{
              '--status-container-height': `${row.statusContainerHeight}px`,
            }}
            onChange={handleStatusChange}
          >
            {row.statusOptions.map((option) => (
              <Radio key={option} value={option}>
                <Text className="status-text">{option}</Text>
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
      </td>

      <td className="barrier-cell">
        <Form.Item name={barrierPath} style={{ marginBottom: 0 }}>
          <div className="barrier-field-wrap">
            <TextArea
              className="barrier-textarea"
              style={{ '--barrier-height': `${computedBarrierHeight}px` }}
              autoSize={false}
              disabled={isBarrierDisabled}
            />
          </div>
        </Form.Item>
      </td>

      <td>
        <Form.Item name={planPath} style={{ marginBottom: 0 }}>
          <Checkbox.Group className="plan-group">
            {row.planOptions.map((item) => (
              <Checkbox key={item} value={item}>
                <Text className="plan-text">{item}</Text>
              </Checkbox>
            ))}
          </Checkbox.Group>
        </Form.Item>
      </td>
    </tr>
  )
}

export default LifestyleAssessmentRow