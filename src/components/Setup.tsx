import { useState } from "react";
import {
  ACTIVITIES,
  activityById,
  DEFAULT_PROFILE,
  GOALS,
  goalById,
  MACRO_STYLES,
  macroStyleById,
  targetsFor,
} from "../models/energy.ts";
import { formatKcal } from "../models/dates.ts";
import type { LegalTarget } from "./Legal.tsx";
import type { Profile, UnitSystem } from "../models/types.ts";

type SetupProps = {
  initial?: Profile | null;
  onSave: (profile: Profile) => void;
  onReset?: () => void;
  onOpenLegal: (target: LegalTarget) => void;
};

function cmToFeetInches(cm: number) {
  const total = Math.round(cm / 2.54);
  const feet = Math.floor(total / 12);
  const inches = total - feet * 12;
  return { feet, inches };
}

export function Setup({ initial, onSave, onReset, onOpenLegal }: SetupProps) {
  const [profile, setProfile] = useState<Profile>(initial ?? DEFAULT_PROFILE);
  const [customOn, setCustomOn] = useState(initial?.customKcal != null);
  const [agreed, setAgreed] = useState(Boolean(initial));
  const targets = targetsFor(profile);
  const editing = Boolean(initial);
  const imperial = profile.units === "imperial";
  const height = cmToFeetInches(profile.heightCm);
  const pounds = Math.round(profile.weightKg * 2.20462);

  function update(patch: Partial<Profile>) {
    setProfile((current) => ({ ...current, ...patch }));
  }

  function setUnits(units: UnitSystem) {
    update({ units });
  }

  return (
    <section className={editing ? "setup editing" : "setup welcome"}>
      <div className="setup-copy">
        {!editing && (
          <p className="brand-lockup">
            <span>Caltek</span>
          </p>
        )}
        <h1>{editing ? "The measure" : "A private measure of the day."}</h1>
        <p className="lede">
          Caltek sets a calm estimate, then keeps the plates you write down. The record does not leave
          this device.
        </p>
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            onSave({
              ...profile,
              name: profile.name.trim(),
              customKcal: customOn ? profile.customKcal : null,
            });
          }}
        >
          <label className="field">
            Name
            <input
              value={profile.name}
              onChange={(event) => update({ name: event.target.value })}
              placeholder="Optional"
              maxLength={32}
            />
          </label>

          <div className="field">
            <span>Units</span>
            <div className="segment">
              <button type="button" aria-pressed={!imperial} onClick={() => setUnits("metric")}>
                Metric
              </button>
              <button type="button" aria-pressed={imperial} onClick={() => setUnits("imperial")}>
                Imperial
              </button>
            </div>
          </div>

          <div className="field">
            <span>Equation term</span>
            <div className="segment">
              <button
                type="button"
                aria-pressed={profile.sex === "female"}
                onClick={() => update({ sex: "female" })}
              >
                Female
              </button>
              <button
                type="button"
                aria-pressed={profile.sex === "male"}
                onClick={() => update({ sex: "male" })}
              >
                Male
              </button>
            </div>
          </div>

          <div className="form-grid">
            <label className="field">
              Age
              <input
                type="number"
                min={15}
                max={90}
                value={profile.age}
                onChange={(event) => update({ age: Number(event.target.value) })}
              />
            </label>
            {imperial ? (
              <>
                <label className="field">
                  Height (ft)
                  <input
                    type="number"
                    min={4}
                    max={7}
                    value={height.feet}
                    onChange={(event) => {
                      const feet = Number(event.target.value);
                      update({ heightCm: Math.round((feet * 12 + height.inches) * 2.54 * 10) / 10 });
                    }}
                  />
                </label>
                <label className="field">
                  Height (in)
                  <input
                    type="number"
                    min={0}
                    max={11}
                    value={height.inches}
                    onChange={(event) => {
                      const inches = Number(event.target.value);
                      update({ heightCm: Math.round((height.feet * 12 + inches) * 2.54 * 10) / 10 });
                    }}
                  />
                </label>
                <label className="field">
                  Weight (lb)
                  <input
                    type="number"
                    min={80}
                    max={500}
                    value={pounds}
                    onChange={(event) =>
                      update({ weightKg: Math.round((Number(event.target.value) / 2.20462) * 10) / 10 })
                    }
                  />
                </label>
              </>
            ) : (
              <>
                <label className="field">
                  Height (cm)
                  <input
                    type="number"
                    min={120}
                    max={230}
                    value={profile.heightCm}
                    onChange={(event) => update({ heightCm: Number(event.target.value) })}
                  />
                </label>
                <label className="field">
                  Weight (kg)
                  <input
                    type="number"
                    min={35}
                    max={250}
                    step={0.1}
                    value={profile.weightKg}
                    onChange={(event) => update({ weightKg: Number(event.target.value) })}
                  />
                </label>
              </>
            )}
          </div>

          <label className="field">
            Activity
            <select
              value={profile.activity}
              onChange={(event) => update({ activity: event.target.value as Profile["activity"] })}
            >
              {ACTIVITIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — {item.detail}
                </option>
              ))}
            </select>
          </label>

          <div className="field">
            <span>Goal</span>
            <div className="choice-grid">
              {GOALS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="choice"
                  aria-pressed={profile.goal === item.id}
                  onClick={() => update({ goal: item.id })}
                >
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span>Macro model</span>
            <div className="segment wrap">
              {MACRO_STYLES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={profile.macroStyle === item.id}
                  onClick={() => update({ macroStyle: item.id })}
                >
                  {item.label}
                  <small>{item.detail}</small>
                </button>
              ))}
            </div>
          </div>

          <label className="check">
            <input
              type="checkbox"
              checked={customOn}
              onChange={(event) => {
                setCustomOn(event.target.checked);
                if (event.target.checked && profile.customKcal == null) {
                  update({ customKcal: targets.kcal });
                }
              }}
            />
            Use my own calorie target
          </label>
          {customOn && (
            <label className="field">
              Daily kilocalories
              <input
                type="number"
                min={1000}
                max={6000}
                value={profile.customKcal ?? targets.kcal}
                onChange={(event) => update({ customKcal: Number(event.target.value) })}
              />
            </label>
          )}

          {!editing && (
            <label className="check agree">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
              />
              <span>
                I agree to the{" "}
                <button
                  type="button"
                  className="text-btn"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onOpenLegal("terms");
                  }}
                >
                  Terms of Use
                </button>{" "}
                and I have read the{" "}
                <button
                  type="button"
                  className="text-btn"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onOpenLegal("privacy");
                  }}
                >
                  Privacy Policy
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="text-btn"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onOpenLegal("health");
                  }}
                >
                  Health Disclaimer
                </button>
                .
              </span>
            </label>
          )}

          <div className="actions">
            <button className="btn" type="submit" disabled={!editing && !agreed}>
              {editing ? "Save model" : "Begin journal"}
            </button>
            {onReset && (
              <button
                className="text-danger"
                type="button"
                onClick={() => {
                  if (window.confirm("Erase the journal stored on this device?")) onReset();
                }}
              >
                Erase journal
              </button>
            )}
          </div>
        </form>
      </div>

      <aside className="model-card">
        <p className="eyebrow">Today’s target</p>
        <p className="figure">{formatKcal(targets.kcal)}</p>
        <p className="figure-sub">kilocalories</p>
        <dl className="stat-row">
          <div>
            <dt>BMR</dt>
            <dd>{formatKcal(targets.bmr)}</dd>
          </div>
          <div>
            <dt>TDEE</dt>
            <dd>{formatKcal(targets.tdee)}</dd>
          </div>
          <div>
            <dt>Activity</dt>
            <dd>×{activityById(profile.activity).factor}</dd>
          </div>
        </dl>
        <p className="model-note">
          {targets.custom
            ? `Maintenance is still about ${formatKcal(targets.tdee)} kcal. The journal will use your target.`
            : `${formatKcal(targets.bmr)} basal × ${activityById(profile.activity).factor} activity, then ${goalById(profile.goal).label.toLowerCase()}.`}
        </p>
        <ul className="macro-preview">
          <li>
            <span>Protein</span>
            <strong>{targets.protein} g</strong>
          </li>
          <li>
            <span>Carbs</span>
            <strong>{targets.carbs} g</strong>
          </li>
          <li>
            <span>Fat</span>
            <strong>{targets.fat} g</strong>
          </li>
        </ul>
        <p className="disclaimer">
          {macroStyleById(profile.macroStyle).label} split. Estimates for personal tracking, not a
          medical prescription. The equation uses its original female and male terms.{" "}
          <button type="button" className="text-btn" onClick={() => onOpenLegal("health")}>
            Read the health disclaimer
          </button>
          .
        </p>
      </aside>
    </section>
  );
}
