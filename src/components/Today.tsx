import { useState } from "react";
import { entryFromFood } from "../models/foods.ts";
import { addDays, formatKcal, formatLong, formatMacro } from "../models/dates.ts";
import { MEALS, suggestedMeal } from "../models/energy.ts";
import { parsePlate } from "../models/parse.ts";
import type { Entry, MealId, Profile, Targets } from "../models/types.ts";
import { totals } from "../models/foods.ts";
import { Ring } from "./Ring.tsx";

const EXAMPLES = ["2 eggs and toast", "150g chicken breast, 1 cup rice", "greek yogurt and blueberries"];

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
          <div>
            <p className="eyebrow">{greeting}</p>
            <p className="figure">{formatKcal(consumed.kcal)}</p>
            <p className="figure-sub">of {formatKcal(targets.kcal)} kcal</p>
            <p className={over > 0 ? "remain over" : "remain"}>
              {over > 0 ? `${formatKcal(over)} past the mark` : `${formatKcal(targets.kcal - consumed.kcal)} still open`}
            </p>
          </div>
          <Ring value={consumed.kcal} max={targets.kcal} />
        </section>

        <aside className="side">
          <Macro label="Protein" value={consumed.protein} max={targets.protein} tone="protein" />
          <Macro label="Carbs" value={consumed.carbs} max={targets.carbs} tone="carbs" />
          <Macro label="Fat" value={consumed.fat} max={targets.fat} tone="fat" />
          <p className="note">A private record. The figure is an estimate, kept on this device.</p>
        </aside>

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
          <div className="chips">
            {EXAMPLES.map((example) => (
              <button key={example} type="button" className="chip" onClick={() => logQuick(example)}>
                {example}
              </button>
            ))}
          </div>
          <p className="status" role="status">
            {status}
          </p>
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
                {rows.length === 0 ? (
                  <p className="empty">Unwritten</p>
                ) : (
                  <ul className="entry-list">
                    {rows.map((entry) => (
                      <li key={entry.id} className="entry">
                        <div>
                          <div className="entry-name">{entry.name}</div>
                          <div className="entry-meta">
                            {entry.detail} · {formatMacro(entry.protein)}p {formatMacro(entry.carbs)}c{" "}
                            {formatMacro(entry.fat)}f
                          </div>
                        </div>
                        <div className="entry-kcal">{formatKcal(entry.kcal)}</div>
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label={`Remove ${entry.name}`}
                          onClick={() => onRemove(entry.id)}
                        >
                          ×
                        </button>
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

function Macro({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="macro">
      <div className="macro-top">
        <span>{label}</span>
        <strong>
          {formatMacro(value)} <em>/ {max} g</em>
        </strong>
      </div>
      <div className="bar" aria-hidden="true">
        <span className={`tone-${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
