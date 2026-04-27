import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { calculateScore } from "../lib/scoring.js";
import { poolConfig } from "../config.js";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function formatTime(timeStr) {
  if (!timeStr) return "—";
  return timeStr.slice(0, 5);
}

function formatWeight(g) {
  return (g / 1000).toFixed(3) + " kg";
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "—";
}

export function Leaderboard() {
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const revealed = Boolean(poolConfig.revealResult);

  function tryUnlock(e) {
    e.preventDefault();
    if (passwordInput === import.meta.env.VITE_LEADERBOARD_PASSWORD) {
      setUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  }

  useEffect(() => {
    if (!unlocked) return;

    setLoading(true);
    supabase
      .from("predictions")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        setLoading(false);
        if (error) {
          setFetchError("Could not load predictions.");
          return;
        }
        const scored = (data || []).map((row) => ({
          ...row,
          scores: calculateScore(row, poolConfig.revealResult)
        }));
        if (revealed) {
          scored.sort((a, b) => b.scores.total - a.scores.total);
        }
        setRows(scored);
      });
  }, [unlocked, revealed]);

  if (!supabase) {
    return (
      <p className="leaderboard-loading">The leaderboard is not available right now.</p>
    );
  }

  if (!unlocked) {
    return (
      <form className="leaderboard-gate" onSubmit={tryUnlock}>
        <p className="leaderboard-gate-label">This leaderboard is classified.</p>
        <div className="leaderboard-gate-row">
          <input
            type="password"
            className={`leaderboard-gate-input ${passwordError ? "is-error" : ""}`}
            placeholder="Enter password"
            value={passwordInput}
            onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
            autoComplete="off"
            aria-label="Leaderboard password"
          />
          <button type="submit" className="button button-primary">Unlock</button>
        </div>
        {passwordError && (
          <p className="leaderboard-gate-error" role="alert">Wrong password. Try again.</p>
        )}
      </form>
    );
  }

  if (loading) {
    return <p className="leaderboard-loading">Loading predictions…</p>;
  }

  if (fetchError) {
    return <p className="leaderboard-loading">{fetchError}</p>;
  }

  if (!rows || rows.length === 0) {
    return <p className="leaderboard-loading">No predictions yet — be the first!</p>;
  }

  return (
    <div className="leaderboard-wrap">
      {!revealed && (
        <p className="leaderboard-notice">
          Scores will appear after the reveal. Check back soon!
        </p>
      )}
      <div className="leaderboard-table-scroll">
        <table className="leaderboard-table">
          <thead>
            <tr>
              {revealed && <th>#</th>}
              <th>Name</th>
              <th>Gender</th>
              <th>Date</th>
              <th>Time</th>
              <th>Weight</th>
              <th>Length</th>
              <th>Hair</th>
              <th>Eye</th>
              <th>Letter</th>
              {revealed && <th>Score</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id}>
                {revealed && <td className="leaderboard-rank">{i + 1}</td>}
                <td className="leaderboard-name">{row.name}</td>
                <td>{capitalize(row.gender)}</td>
                <td>{formatDate(row.birth_date)}</td>
                <td>{formatTime(row.birth_time)}</td>
                <td>{formatWeight(row.weight_g)}</td>
                <td>{row.length_cm} cm</td>
                <td>{capitalize(row.hair_colour)}</td>
                <td>{capitalize(row.eye_colour)}</td>
                <td>{row.name_letter}</td>
                {revealed && (
                  <td className="leaderboard-score">{row.scores.total}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
