"use client";

import React from "react";

type Props = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  highlight?: boolean;
};

export default function OverviewCard({ label, value, icon, highlight }: Props) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition flex items-center justify-between ${
        highlight ? "border border-yellow-300" : ""
      }`}
    >
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      </div>

      <div className="text-3xl ml-4">{icon}</div>
    </div>
  );
}
