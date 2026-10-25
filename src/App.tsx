import { useState } from "react";
import { Composer } from "./components/Composer.tsx";
import { LegalCenter, LegalLinks, type LegalTarget } from "./components/Legal.tsx";
import { Setup } from "./components/Setup.tsx";
import { Today } from "./components/Today.tsx";
import { Week } from "./components/Week.tsx";
import { dateKey } from "./models/dates.ts";
import { targetsFor } from "./models/energy.ts";
import type { Entry, MealId } from "./models/types.ts";
import { useJournal } from "./store.ts";

type View = "today" | "week" | "model";

export default function App() {
  const journal = useJournal();
  const [view, setView] = useState<View>("today");
  const [date, setDate] = useState(dateKey());
  const [composer, setComposer] = useState<{ meal: MealId; text: string } | null>(null);
  const [legal, setLegal] = useState<LegalTarget | null>(null);
  const profile = journal.data.profile;

  if (!profile) {
    return (
      <main className="shell welcome-shell">
        <Setup onSave={journal.setProfile} onOpenLegal={setLegal} />
        <LegalLinks onOpen={setLegal} />
        {legal && <LegalCenter key={legal} initial={legal} onClose={() => setLegal(null)} />}
      </main>
    );
  }

  const targets = targetsFor(profile);
  const entries = journal.data.logs[date] ?? [];

  function addEntries(next: Entry[]) {
    journal.addEntries(date, next);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <strong>Caltek</strong>
        </div>
        <nav className="nav" aria-label="Sections">
          {(
            [
              ["today", "Today"],
              ["week", "Week"],
              ["model", "Model"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={view === id ? "is-on" : ""}
              aria-current={view === id ? "page" : undefined}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {view === "today" && (
        <Today
          date={date}
          today={journal.today}
          profile={profile}
          entries={entries}
          targets={targets}
          onDate={(next) => {
            setDate(next);
          }}
          onRemove={(id) => journal.removeEntry(date, id)}
          onAdd={addEntries}
          onReview={(meal, text) => setComposer({ meal, text })}
          onOpenMeal={(meal) => setComposer({ meal, text: "" })}
        />
      )}

      {view === "week" && (
        <Week
          anchor={date}
          today={journal.today}
          logs={journal.data.logs}
          targets={targets}
          onOpen={(next) => {
            setDate(next);
            setView("today");
          }}
        />
      )}

      {view === "model" && (
        <Setup
          initial={profile}
          onOpenLegal={setLegal}
          onSave={(next) => {
            journal.setProfile(next);
            setView("today");
          }}
          onReset={() => {
            journal.reset();
            setView("today");
          }}
        />
      )}

      <LegalLinks onOpen={setLegal} />
      {legal && <LegalCenter key={legal} initial={legal} onClose={() => setLegal(null)} />}

      {composer && (
        <Composer
          meal={composer.meal}
          initialText={composer.text}
          onMeal={(meal) => setComposer({ ...composer, meal })}
          onClose={() => setComposer(null)}
          onAdd={(next) => {
            addEntries(next);
            setComposer(null);
          }}
        />
      )}
    </main>
  );
}
