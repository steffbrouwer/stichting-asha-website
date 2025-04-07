"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Event {
  date: string;
  title: string;
  description: string;
  time: string;
  location: string;
}

const defaultEvents: Event[] = [
  {
    date: "2024-03-20",
    title: "Workshop: Website Ontwikkeling",
    description: "Leer hoe je een website maakt.",
    time: "10:00",
    location: "Kantoor 101",
  },
  {
    date: "2024-03-21",
    title: "Bijeenkomst: Vrijwilligers",
    description: "Bespreek toekomstige projecten en activiteiten.",
    time: "14:00",
    location: "Vergaderruimte A",
  },
];

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events] = useState<Event[]>(defaultEvents);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => event.date === format(date, "yyyy-MM-dd"));
  };

  return (
    <div className="container mx-auto py-10">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-secondary mb-4">Agenda</h2>

        <div className="flex justify-between mb-4">
          <button onClick={previousMonth} className="text-primary">
            ← Vorige maand
          </button>
          <div className="text-xl font-semibold text-secondary">
            {format(currentDate, "MMMM yyyy", { locale: nl })}
          </div>
          <button onClick={nextMonth} className="text-primary">
            Volgende maand →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-6">
          {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((day) => (
            <div key={day} className="font-semibold text-center text-secondary">
              {day}
            </div>
          ))}
          {days.map((day, dayIdx) => (
            <div
              key={day.toString()}
              className={cn(
                "p-2 text-center cursor-pointer rounded-lg hover:bg-gray-100",
                !isSameMonth(day, currentDate) && "text-gray-400",
                isToday(day) && "bg-primary text-white",
                selectedDate && format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd") && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedDate(day)}
            >
              <span>{format(day, "d")}</span>
              {getEventsForDate(day).length > 0 && (
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mx-auto mt-1" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          {selectedDate && (
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Activiteiten op {format(selectedDate, "d MMMM yyyy", { locale: nl })}
              </h3>
              {getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map((event, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-2">
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-gray-600">{event.description}</p>
                    <p className="text-gray-500">
                      Tijd: {event.time} - Locatie: {event.location}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">Geen activiteiten gepland voor deze dag.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}