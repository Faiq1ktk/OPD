import { Button, Typography } from '../../../ui/antd'
import { HistoryOutlined } from '@ant-design/icons'

function LifestyleHistoryTrigger({ onClick }) {
  return (
    <Button
      type="text"
      onClick={onClick}
      className="lifestyle-history-trigger"
      icon={<HistoryOutlined className="lifestyle-history-trigger-icon" />}
    >
      <Typography.Text className="lifestyle-history-trigger-text">
        View History
      </Typography.Text>
    </Button>
  )
}

export default LifestyleHistoryTrigger