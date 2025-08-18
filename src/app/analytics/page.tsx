// /src/app/analytics/page.tsx
"use client";
import { useApplications } from "@/hooks/useApplications";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function AnalyticsPage() {
  const { apps } = useApplications();

  // 1. Count per stage
  const stageCounts = ["Applied", "Interview", "Offer", "Rejected"].map(s => ({
    stage: s, value: apps.filter(a => a.stage === s).length
  }));

  // 2. Count per role
  const roleCounts = Object.values(
    apps.reduce((acc: any, a) => {
      acc[a.job.title] = (acc[a.job.title] || 0) + 1;
      return acc;
    }, {})
  );

  // 3. Avg experience
  const avgExp = apps.length ? 
    (apps.reduce((sum, a) => sum + (a.yearsOfExperience || 0), 0) / apps.length).toFixed(1) : 0;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-xl">
          <h2 className="font-semibold mb-2">Applications by Stage</h2>
          <PieChart width={300} height={300}>
            <Pie data={stageCounts} dataKey="value" nameKey="stage" outerRadius={100} label>
              {stageCounts.map((_, i) => (
                <Cell key={i} fill={["#3b82f6","#f59e0b","#10b981","#ef4444"][i]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        <div className="p-4 border rounded-xl">
          <h2 className="font-semibold mb-2">Candidates by Role</h2>
          <BarChart width={400} height={300} data={Object.entries(
            apps.reduce((acc: any, a) => {
              acc[a.job.title] = (acc[a.job.title] || 0) + 1;
              return acc;
            }, {})
          ).map(([role, count]) => ({ role, count }))}>
            <XAxis dataKey="role" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" />
          </BarChart>
        </div>
      </div>

      <div className="p-4 border rounded-xl text-center">
        <h2 className="font-semibold mb-2">Average Candidate Experience</h2>
        <p className="text-3xl font-bold">{avgExp} years</p>
      </div>
    </div>
  );
}
