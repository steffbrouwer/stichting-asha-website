"use client";

import { useState } from "react";

interface Activity {
  title: string;
  time: string;
  place: string;
  description: string;
}

const defaultActivities: Activity[] = [
  {
    title: "Huiswerkbegeleiding",
    time: "15:00 - 17:00",
    place: "Buurthuis Asha",
    description: "Begeleiding bij huiswerk voor scholieren.",
  },
  {
    title: "Donderdagmiddag bijeenkomst",
    time: "12:00 - 16:00",
    place: "Buurthuis Asha",
    description: "Wekelijkse bijeenkomst voor sociale activiteiten.",
  },
  {
    title: "Nederlandse taalles",
    time: "10:00 - 12:00",
    place: "Buurthuis Asha",
    description: "Nederlandse taallessen voor beginners en gevorderden.",
  },
];

export default function Activiteiten() {
  const [activities] = useState<Activity[]>(defaultActivities);
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-secondary mb-6">Activiteiten</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-xl"
            onClick={() => setExpandedActivity(expandedActivity === index ? null : index)}
          >
            <h3 className="text-xl font-semibold text-secondary">{activity.title}</h3>
            <div className={`mt-2 ${expandedActivity === index ? "block" : "hidden"}`}>
              <p className="text-gray-700">
                <strong>Tijd:</strong> {activity.time}
              </p>
              <p className="text-gray-700">
                <strong>Plaats:</strong> {activity.place}
              </p>
              <p className="text-gray-700 mt-2">{activity.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}