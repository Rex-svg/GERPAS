type MetricCardProps = {
  title: string;
  value: string | number;
  description?: string;
};

export default function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-4 text-3xl font-bold text-gray-900">{value}</p>
      {description ? <p className="mt-2 text-sm text-gray-500">{description}</p> : null}
    </div>
  );
}
