import { useEffect, useMemo, useState } from "react";
import { getPredictionInsights, hasPredictionApi } from "../lib/supabase.js";

const EMPTY_INSIGHTS = {
  total: 0,
  threshold: 3,
  visible: false,
  gender: [],
  birthDates: [],
  birthTimes: [],
  weights: [],
  lengths: [],
  hairColours: [],
  eyeColours: [],
  nameLetters: []
};

const GENDER_LABELS = {
  boy: "Boy",
  girl: "Girl"
};

function getPercent(count, total) {
  if (!total) {
    return 0;
  }

  return Math.round((count / total) * 100);
}

function normalizeChartItems(items) {
  return (items ?? []).map((item) => ({
    label: item.label ?? GENDER_LABELS[item.value] ?? item.value ?? "Unknown",
    value: item.value ?? item.label ?? "unknown",
    count: Number(item.count ?? 0)
  }));
}

function ChartRows({ items, total, tone = "neutral" }) {
  const rows = normalizeChartItems(items);
  const max = Math.max(...rows.map((item) => item.count), 1);

  return (
    <div className="insight-chart-rows">
      {rows.map((item) => {
        const percent = getPercent(item.count, total);
        const width = Math.max((item.count / max) * 100, item.count > 0 ? 7 : 0);

        return (
          <div className={`insight-chart-row insight-chart-row-${tone}`} key={item.value}>
            <div className="insight-chart-row-label">
              <span>{item.label}</span>
              <strong>{item.count}</strong>
            </div>
            <div className="insight-chart-track" aria-hidden="true">
              <span style={{ width: `${width}%` }} />
            </div>
            <span className="insight-chart-percent">{percent}%</span>
          </div>
        );
      })}
    </div>
  );
}

function GenderSplit({ items, total }) {
  const rows = normalizeChartItems(items);
  const boyCount = rows.find((item) => item.value === "boy")?.count ?? 0;
  const girlCount = rows.find((item) => item.value === "girl")?.count ?? 0;
  const boyPercent = getPercent(boyCount, total);
  const girlPercent = getPercent(girlCount, total);

  return (
    <article className="insight-card insight-card-featured">
      <div className="insight-card-heading">
        <span>Prime Suspect</span>
        <h3>Gender split</h3>
      </div>
      <div className="gender-meter" aria-label={`Boy ${boyPercent}%, Girl ${girlPercent}%`}>
        <span className="gender-meter-boy" style={{ width: `${boyPercent}%` }} />
        <span className="gender-meter-girl" style={{ width: `${girlPercent}%` }} />
      </div>
      <div className="gender-scoreboard">
        <div>
          <span>Boy</span>
          <strong>{boyCount}</strong>
          <em>{boyPercent}%</em>
        </div>
        <div>
          <span>Girl</span>
          <strong>{girlCount}</strong>
          <em>{girlPercent}%</em>
        </div>
      </div>
    </article>
  );
}

function InsightCard({ title, eyebrow, items, total, tone }) {
  return (
    <article className="insight-card">
      <div className="insight-card-heading">
        <span>{eyebrow}</span>
        <h3>{title}</h3>
      </div>
      <ChartRows items={items} total={total} tone={tone} />
    </article>
  );
}

export function PredictionInsights() {
  const [insights, setInsights] = useState(EMPTY_INSIGHTS);
  const [loading, setLoading] = useState(hasPredictionApi());
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    if (!hasPredictionApi()) {
      setLoading(false);
      return () => {
        ignore = true;
      };
    }

    setLoading(true);
    getPredictionInsights().then(({ data, error: fetchError }) => {
      if (ignore) {
        return;
      }

      setLoading(false);
      if (fetchError) {
        setError("The anonymous guess board is sealed for now.");
        return;
      }

      setInsights({ ...EMPTY_INSIGHTS, ...data });
    });

    return () => {
      ignore = true;
    };
  }, []);

  const remainingGuesses = useMemo(
    () => Math.max((insights.threshold ?? 3) - (insights.total ?? 0), 0),
    [insights.threshold, insights.total]
  );

  return (
    <section className="insights-section" id="guess-board" aria-labelledby="guess-board-title">
      <div className="section-heading">
        <p className="eyebrow">Anonymous Intelligence</p>
        <h2 id="guess-board-title">The Guess Board</h2>
        <p className="insights-intro">
          Public clues only. The board shows patterns from the baby pool without revealing who
          guessed what.
        </p>
      </div>

      <div className="insights-shell" data-testid="prediction-insights">
        <div className="insights-summary">
          <span>Total locked guesses</span>
          <strong>{insights.total}</strong>
          <p>No names. No row-by-row predictions. Just the public pattern.</p>
        </div>

        {!hasPredictionApi() ? (
          <p className="insights-state">
            The guess board is not connected yet. Check back once the pool is live.
          </p>
        ) : loading ? (
          <p className="insights-state">Gathering anonymous clues...</p>
        ) : error ? (
          <p className="insights-state" role="alert">{error}</p>
        ) : insights.total === 0 ? (
          <p className="insights-state">No guesses have been locked yet. Be the first suspect.</p>
        ) : !insights.visible ? (
          <p className="insights-state">
            {remainingGuesses} more {remainingGuesses === 1 ? "guess" : "guesses"} needed before
            the anonymous charts open.
          </p>
        ) : (
          <div className="insights-grid">
            <GenderSplit items={insights.gender} total={insights.total} />
            <InsightCard
              title="Birth date"
              eyebrow="Calendar Watch"
              items={insights.birthDates}
              total={insights.total}
              tone="blue"
            />
            <InsightCard
              title="Birth time"
              eyebrow="Clock Patrol"
              items={insights.birthTimes}
              total={insights.total}
              tone="pink"
            />
            <InsightCard
              title="Weight"
              eyebrow="Scale Notes"
              items={insights.weights}
              total={insights.total}
              tone="blue"
            />
            <InsightCard
              title="Length"
              eyebrow="Measuring Tape"
              items={insights.lengths}
              total={insights.total}
              tone="pink"
            />
            <InsightCard
              title="Hair colour"
              eyebrow="Style Desk"
              items={insights.hairColours}
              total={insights.total}
              tone="blue"
            />
            <InsightCard
              title="Eye colour"
              eyebrow="Witness Sketch"
              items={insights.eyeColours}
              total={insights.total}
              tone="pink"
            />
            <InsightCard
              title="Name initial"
              eyebrow="Letter File"
              items={insights.nameLetters}
              total={insights.total}
              tone="neutral"
            />
          </div>
        )}
      </div>
    </section>
  );
}
