import { formatKcal, formatWeekday, weekKeys } from "../models/dates.ts";
import { totals } from "../models/foods.ts";
import type { Entry, Targets } from "../models/types.ts";

type WeekProps = {
  anchor: string;
  today: string;
  logs: Record<string, Entry[]>;
  targets: Targets;
  onOpen: (date: string) => void;
};

export function streakEnding(logs: Record<string, Entry[]>, today: string) {
  const cursor = new Date(
    Number(today.slice(0, 4)),
    Number(today.slice(5, 7)) - 1,
    Number(today.slice(8, 10)),
  );
  const keyOf = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  };
  if ((logs[keyOf(cursor)] ?? []).length === 0) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while ((logs[keyOf(cursor)] ?? []).length > 0 && count < 3650) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function Week({ anchor, today, logs, targets, onOpen }: WeekProps) {
  const days = weekKeys(anchor).map((key) => ({
    key,
    kcal: totals(logs[key] ?? []).kcal,
  }));
  const logged = days.filter((day) => day.kcal > 0);
  const average = logged.length ? logged.reduce((sum, day) => sum + day.kcal, 0) / logged.length : 0;
  const tallest = Math.max(...days.map((day) => day.kcal), 1);
  const peak = tallest / 0.72;
  const showGoal = targets.kcal / peak <= 1;
  const streak = streakEnding(logs, today);

  return (
    <section className="week">
      <header className="week-head">
        <h1>This week</h1>
        <p className="streak">{streak === 0 ? "No days yet" : `${streak} ${streak === 1 ? "day" : "days"} kept`}</p>
      </header>
      <div className="columns">
        {days.map((day) => {
          const near = day.kcal > 0 && Math.abs(day.kcal - targets.kcal) / targets.kcal <= 0.1;
          return (
            <button
              key={day.key}
              type="button"
              className={`column${day.key === anchor ? " is-selected" : ""}${day.kcal === 0 ? " is-empty" : ""}`}
              onClick={() => onOpen(day.key)}
            >
              <span className="col-figure">{day.kcal ? formatKcal(day.kcal) : ""}</span>
              <span className="col-track">
                {day.kcal > 0 && (
                  <span
                    className={near ? "col-bar is-near" : "col-bar"}
                    style={{ height: `${(day.kcal / peak) * 100}%` }}
                  />
                )}
                {showGoal && <span className="col-goal" style={{ bottom: `${(targets.kcal / peak) * 100}%` }} />}
              </span>
              <span className="col-label">
                {formatWeekday(day.key)}
                {day.key === today ? " · today" : ""}
              </span>
            </button>
          );
        })}
      </div>
      <p className="insight">
        {logged.length === 0
          ? "No days written."
          : `${formatKcal(average)} average · mark ${formatKcal(targets.kcal)}`}
      </p>
    </section>
  );
}
