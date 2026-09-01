import React from 'react';
import { VisaApplication } from '../types';
import { PassportAuditStatisticsDashboard } from './PassportAuditStatisticsDashboard';

interface PassportAuditAnalyticsWidgetProps {
  applications: VisaApplication[];
  onSelectApplication?: (app: VisaApplication) => void;
}

export const PassportAuditAnalyticsWidget: React.FC<PassportAuditAnalyticsWidgetProps> = ({
  applications,
  onSelectApplication
}) => {
  return (
    <PassportAuditStatisticsDashboard
      applications={applications}
      onSelectApplication={onSelectApplication}
    />
  );
};

export { PassportAuditStatisticsDashboard };
