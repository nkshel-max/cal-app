import { useEffect, useMemo, useState } from "react";
import { entryCustom, entryFromFood } from "../models/foods.ts";
import { formatKcal } from "../models/dates.ts";
import { MEALS } from "../models/energy.ts";
import { parsePlate, searchFoods } from "../models/parse.ts";
import type { Entry, Food, MealId } from "../models/types.ts";

type ComposerProps = {
  meal: MealId;
  initialText: string;
  onMeal: (meal: MealId) => void;
  onClose: () => void;
  onAdd: (entries: Entry[]) => void;
};

type Tab = "describe" | "search" | "custom";

export function Composer({ meal, initialText, onMeal, onClose, onAdd }: ComposerProps) {
  const [tab, setTab] = useState<Tab>(initialText ? "describe" : "search");
  const [text, setText] = useState(initialText);
  const [missKcal, setMissKcal] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Food | null>(null);
  const [servings, setServings] = useState(1);
  const [custom, setCustom] = useState({ name: "", kcal: "", protein: "", carbs: "", fat: "" });
  const parsed = useMemo(() => parsePlate(text), [text]);
  const results = useMemo(() => searchFoods(query), [query]);
  const describedCount =
    parsed.items.length +
    parsed.unmatched.filter((miss) => {
      const kcal = Number(missKcal[miss]);
      return Number.isFinite(kcal) && kcal > 0;
    }).length;
  const describedKcal =
    parsed.items.reduce((sum, item) => sum + item.portion.kcal, 0) +
    parsed.unmatched.reduce((sum, miss) => {
      const kcal = Number(missKcal[miss]);
      return Number.isFinite(kcal) && kcal > 0 ? sum + kcal : sum;
    }, 0);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function describedEntries(): Entry[] {
    return [
      ...parsed.items.map((item) => entryFromFood(item.food, meal, item.amount)),
      ...parsed.unmatched.flatMap((miss) => {
        const kcal = Number(missKcal[miss]);
        if (!Number.isFinite(kcal) || kcal <= 0) return [];
        return [entryCustom({ name: miss, meal, kcal, protein: 0, carbs: 0, fat: 0 })];
      }),
    ];
  }

  function addSelected() {
    if (!selected) return;
    onAdd([entryFromFood(selected, meal, { servings })]);
    onClose();
  }

  function addCustom() {
    const kcal = Number(custom.kcal);
    if (!custom.name.trim() || !Number.isFinite(kcal) || kcal <= 0) return;
    onAdd([
      entryCustom({
        name: custom.name,
        meal,
        kcal,
        protein: Number(custom.protein) || 0,
        carbs: Number(custom.carbs) || 0,
        fat: Number(custom.fat) || 0,
      }),
    ]);
    onClose();
  }

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="log-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="sheet-head">
          <div>
            <p className="eyebrow">The plate</p>
            <h2 id="log-title">Write it down.</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="segment" aria-label="Meal">
          {MEALS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={meal === item.id}
              onClick={() => onMeal(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="tabs">
          {(
            [
              ["describe", "Describe"],
              ["search", "Search"],
              ["custom", "Custom"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" className={tab === id ? "is-on" : ""} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {tab === "describe" && (
          <div className="pane">
            <label className="field">
              What was on the plate?
              <textarea
                autoFocus
                rows={3}
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="150g salmon, 1 cup rice, half an avocado"
              />
            </label>
            <ul className="match-list">
              {parsed.items.map((item) => (
                <li key={`${item.source}-${item.food.id}`}>
                  <div>
                    <strong>{item.food.name}</strong>
                    <span>
                      {item.detail}
                      {item.score < 80 ? ` · matched from “${item.source}”` : ""}
                    </span>
                  </div>
                  <em>{formatKcal(item.portion.kcal)} kcal</em>
                </li>
              ))}
              {parsed.unmatched.map((miss) => (
                <li key={miss} className="miss">
                  <div>
                    <strong>No table match</strong>
                    <span>{miss}</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    placeholder="kcal"
                    aria-label={`Kilocalories for ${miss}`}
                    value={missKcal[miss] ?? ""}
                    onChange={(event) => setMissKcal((current) => ({ ...current, [miss]: event.target.value }))}
                  />
                </li>
              ))}
            </ul>
            <div className="sheet-actions">
              <button
                className="btn"
                type="button"
                disabled={!describedCount}
                onClick={() => {
                  onAdd(describedEntries());
                  onClose();
                }}
              >
                {describedCount ? `Record ${formatKcal(describedKcal)} kcal` : "Record"}
              </button>
            </div>
          </div>
        )}

        {tab === "search" && (
          <div className="pane">
            <label className="field">
              Search the table
              <input
                autoFocus
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelected(null);
                }}
                placeholder="Chicken, oats, yogurt"
              />
            </label>
            <ul className="result-list">
              {results.map((food) => (
                <li key={food.id}>
                  <button
                    type="button"
                    className={selected?.id === food.id ? "result is-selected" : "result"}
                    onClick={() => setSelected(food)}
                  >
                    <span>
                      <strong>{food.name}</strong>
                      <small>
                        {food.servingLabel} · {food.kcal} kcal
                      </small>
                    </span>
                    <span className="group">{food.group}</span>
                  </button>
                </li>
              ))}
              {results.length === 0 && <li className="empty">Not in the table. Write it under Custom.</li>}
            </ul>
            {selected && (
              <div className="stepper-row">
                <div>
                  <strong>{selected.name}</strong>
                  <span>
                    {servings} × {selected.servingLabel} ·{" "}
                    {formatKcal(Math.round(selected.kcal * servings))} kcal
                  </span>
                </div>
                <div className="stepper">
                  <button type="button" onClick={() => setServings((value) => Math.max(0.5, Math.round((value - 0.5) * 10) / 10))} aria-label="Fewer servings">
                    −
                  </button>
                  <span>{servings}</span>
                  <button type="button" onClick={() => setServings((value) => Math.min(20, Math.round((value + 0.5) * 10) / 10))} aria-label="More servings">
                    +
                  </button>
                </div>
              </div>
            )}
            <div className="sheet-actions">
              <button className="btn" type="button" disabled={!selected} onClick={addSelected}>
                Record in {MEALS.find((item) => item.id === meal)?.label}
              </button>
            </div>
          </div>
        )}

        {tab === "custom" && (
          <form
            className="pane"
            onSubmit={(event) => {
              event.preventDefault();
              addCustom();
            }}
          >
            <label className="field">
              Name
              <input
                autoFocus
                value={custom.name}
                onChange={(event) => setCustom((current) => ({ ...current, name: event.target.value }))}
                placeholder="Restaurant bowl"
              />
            </label>
            <div className="form-grid">
              <label className="field">
                Kilocalories
                <input
                  type="number"
                  min={0}
                  value={custom.kcal}
                  onChange={(event) => setCustom((current) => ({ ...current, kcal: event.target.value }))}
                />
              </label>
              <label className="field">
                Protein (g)
                <input
                  type="number"
                  min={0}
                  value={custom.protein}
                  onChange={(event) => setCustom((current) => ({ ...current, protein: event.target.value }))}
                />
              </label>
              <label className="field">
                Carbs (g)
                <input
                  type="number"
                  min={0}
                  value={custom.carbs}
                  onChange={(event) => setCustom((current) => ({ ...current, carbs: event.target.value }))}
                />
              </label>
              <label className="field">
                Fat (g)
                <input
                  type="number"
                  min={0}
                  value={custom.fat}
                  onChange={(event) => setCustom((current) => ({ ...current, fat: event.target.value }))}
                />
              </label>
            </div>
            <div className="sheet-actions">
              <button className="btn" type="submit">
                Record this plate
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
