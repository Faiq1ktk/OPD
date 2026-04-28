import { Button, Typography } from '../../../ui/antd'
import { HistoryOutlined } from '@ant-design/icons'

function VisitHistoryTrigger({ onClick }) {
  return (
    <Button
      type="text"
      onClick={onClick}
      className="visit-history-trigger"
      icon={<HistoryOutlined className="visit-history-trigger-icon" />}
    >
      <Typography.Text className="visit-history-trigger-text">
        View History
      </Typography.Text>
    </Button>
  )
}

export default VisitHistoryTrigger