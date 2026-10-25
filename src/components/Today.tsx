import { useState } from "react";
import { entryFromFood } from "../models/foods.ts";
import { addDays, formatKcal, formatLong, formatMacro } from "../models/dates.ts";
import { MEALS, suggestedMeal } from "../models/energy.ts";
import { parsePlate } from "../models/parse.ts";
import type { Entry, MealId, Profile, Targets } from "../models/types.ts";
import { totals } from "../models/foods.ts";

type TodayProps = {
  date: string;
  today: string;
  profile: Profile;
  entries: Entry[];
  targets: Targets;
  onDate: (date: string) => void;
  onRemove: (id: string) => void;
  onAdd: (entries: Entry[]) => void;
  onReview: (meal: MealId, text: string) => void;
  onOpenMeal: (meal: MealId) => void;
};

export function Today({
  date,
  today,
  profile,
  entries,
  targets,
  onDate,
  onRemove,
  onAdd,
  onReview,
  onOpenMeal,
}: TodayProps) {
  const [text, setText] = useState("");
  const [meal, setMeal] = useState<MealId>(suggestedMeal());
  const [status, setStatus] = useState("");
  const consumed = totals(entries);
  const over = consumed.kcal - targets.kcal;
  const named = profile.name.trim();
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const greeting = date === today ? (named ? `${hello}, ${named}` : hello) : named || "The record";

  function logQuick(raw: string) {
    const parsed = parsePlate(raw);
    if (!parsed.items.length || parsed.unmatched.length) {
      onReview(meal, raw);
      setText("");
      return;
    }
    const next = parsed.items.map((item) => entryFromFood(item.food, meal, item.amount));
    onAdd(next);
    setText("");
    const kcal = next.reduce((sum, item) => sum + item.kcal, 0);
    setStatus(`Recorded · ${formatKcal(kcal)} kcal`);
  }

  return (
    <div className="day">
      <div className="datebar">
        <button type="button" className="icon-btn" onClick={() => onDate(addDays(date, -1))} aria-label="Previous day">
          ←
        </button>
        <div className="date-copy">
          <h1>{formatLong(date)}</h1>
          {date !== today && (
            <button type="button" className="text-btn" onClick={() => onDate(today)}>
              Back to today
            </button>
          )}
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={() => onDate(addDays(date, 1))}
          disabled={date >= today}
          aria-label="Next day"
        >
          →
        </button>
      </div>

      <div className="layout">
        <section className="hero">
          <p className="eyebrow">{greeting}</p>
          <p className="figure">{formatKcal(consumed.kcal)}</p>
          <p className={over > 0 ? "remain over" : "remain"}>
            {over > 0
              ? `${formatKcal(over)} past ${formatKcal(targets.kcal)}`
              : `${formatKcal(targets.kcal - consumed.kcal)} open of ${formatKcal(targets.kcal)}`}
          </p>
        </section>

        <div className="macros">
          <Macro label="Protein" value={consumed.protein} max={targets.protein} />
          <Macro label="Carbs" value={consumed.carbs} max={targets.carbs} />
          <Macro label="Fat" value={consumed.fat} max={targets.fat} />
        </div>

        <section className="composer-inline">
          <form
            className="quick"
            onSubmit={(event) => {
              event.preventDefault();
              if (text.trim()) logQuick(text.trim());
            }}
          >
            <label className="sr" htmlFor="quick-log">
              Describe a meal
            </label>
            <select value={meal} onChange={(event) => setMeal(event.target.value as MealId)} aria-label="Meal">
              {MEALS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <input
              id="quick-log"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Write the plate"
            />
            <button className="btn" type="submit">
              Record
            </button>
          </form>
          {status && (
            <p className="status" role="status">
              {status}
            </p>
          )}
        </section>

        <section className="meals">
          {MEALS.map((item) => {
            const rows = entries.filter((entry) => entry.meal === item.id);
            const mealKcal = rows.reduce((sum, entry) => sum + entry.kcal, 0);
            return (
              <article key={item.id} className="meal">
                <header className="meal-head">
                  <h2>{item.label}</h2>
                  <div className="meal-actions">
                    {rows.length > 0 && <span>{formatKcal(mealKcal)} kcal</span>}
                    <button type="button" className="text-btn" onClick={() => onOpenMeal(item.id)}>
                      Add
                    </button>
                  </div>
                </header>
                {rows.length > 0 && (
                  <ul className="entry-list">
                    {rows.map((entry) => (
                      <li key={entry.id} className="entry">
                        <div>
                          <div className="entry-name">{entry.name}</div>
                          <div className="entry-meta">{entry.detail}</div>
                        </div>
                        <div className="entry-end">
                          <span className="entry-kcal">{formatKcal(entry.kcal)}</span>
                          <button
                            type="button"
                            className="text-btn remove"
                            aria-label={`Remove ${entry.name}`}
                            onClick={() => onRemove(entry.id)}
                          >
                            ×
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}

function Macro({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="macro">
      <div className="macro-top">
        <span>{label}</span>
        <strong>
          {formatMacro(value)}
          <em> / {max}</em>
        </strong>
      </div>
    </div>
  );
}
