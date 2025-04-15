import React from 'react';
import { format } from 'date-fns';

const DueDateBadge = ({ dueDate }) => {
  if (!dueDate) return <div className="w-20"></div>;

  const date = new Date(dueDate);
  const formattedDate = format(date, 'd MMM');

  return (
    <div className="bg-red-500 text-xs text-white px-3 py-1 rounded text-sm inline-block text-center w-20">
      {formattedDate}
    </div>
  );
};

export default DueDateBadge;