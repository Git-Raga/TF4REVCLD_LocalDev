import React from 'react';

const InitialsBadge = ({ initial }) => {
  if (!initial) return null;

  // Generate a consistent color based on the initials
  const colorMap = {
    VLM: "bg-pink-600",
    SR: "bg-amber-700",
    RS: "bg-blue-500",
    PD: "bg-orange-600",
    PK: "bg-green-500",
    NS: "bg-teal-600",
    ES: "bg-yellow-600",
    AK: "bg-violet-600",
    RGV: "bg-blue-700",
  };

  // Default color if not found in map
  const bgColor = colorMap[initial] || "bg-gray-500";
}

  // Adjust text size and badge size based on