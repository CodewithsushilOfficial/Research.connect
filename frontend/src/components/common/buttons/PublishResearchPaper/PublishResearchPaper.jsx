import React from 'react';
import { Edit3 } from 'lucide-react';
import Button from '../Button';

const PublishResearchPaper = ({ onClick, disabled = false, loading = false, className = '' }) => {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      icon={<Edit3 className="w-4 h-4" />}
      className={className}
    >
      Publish Research
    </Button>
  );
};

export default PublishResearchPaper;
