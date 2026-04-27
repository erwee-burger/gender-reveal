import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { supabase } from "../lib/supabase.js";

const HAIR_OPTIONS = [
  { value: "blonde", label: "Blonde" },
  { value: "brown", label: "Brown" },
  { value: "black", label: "Black" },
  { value: "red", label: "Red" },
  { value: "bald", label: "Bald / very little" }
];

const EYE_OPTIONS = [
  { value: "blue", label: "Blue" },
  { value: "brown", label: "Brown" },
  { value: "green", label: "Green" },
  { value: "hazel", label: "Hazel" },
  { value: "grey", label: "Grey" }
];

const EMPTY_FIELDS = {
  name: "",
  gender: "",
  birth_date: "",
  birth_time: "",
  weight_kg: "",
  length_cm: "",
  hair_colour: "",
  eye_colour: "",
  name_letter: ""
};

export function PredictionForm({ onSubmitted }) {
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submittedName, setSubmittedName] = useState(null);
  const [nameWarning, setNameWarning] = useState(null);

  useEffect(() => {
    const trimmed = fields.name.trim();
    if (!trimmed || !supabase) {
      setNameWarning(null);
      return;
    }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("predictions")
        .select("name")
        .eq("name_key", trimmed.toLowerCase())
        .maybeSingle();
      setNameWarning(data ? `"${data.name}" has already voted!` : null);
    }, 400);
    return () => clearTimeout(timer);
  }, [fields.name]);

  if (!supabase) {
    return (
      <p className="pool-confirmed-sub">
        The baby pool is not available right now. Check back soon!
      </p>
    );
  }

  if (submittedName) {
    return (
      <div className="pool-confirmed" data-testid="pool-confirmed">
        <p className="pool-confirmed-headline">
          You're in, <strong>{submittedName}</strong>. Good luck!
        </p>
        <p className="pool-confirmed-sub">
          Prediction locked. Check the leaderboard after the reveal.
        </p>
        <button
          type="button"
          className="button button-secondary pool-form-submit"
          onClick={() => setSubmittedName(null)}
        >
          Submit another prediction
        </button>
      </div>
    );
  }

  function set(field, value) {
    setFields((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const name = fields.name.trim();
    const letter = fields.name_letter.trim().toUpperCase();
    const weightG = Math.round(parseFloat(fields.weight_kg) * 10) * 100;

    const { error: dbError } = await supabase.from("predictions").insert({
      name,
      gender: fields.gender,
      birth_date: fields.birth_date,
      birth_time: fields.birth_time,
      weight_g: weightG,
      length_cm: parseFloat(fields.length_cm),
      hair_colour: fields.hair_colour,
      eye_colour: fields.eye_colour,
      name_letter: letter
    });

    if (dbError) {
      setSubmitting(false);
      if (dbError.code === "23505") {
        setError(`Looks like "${name}" already has a prediction in!`);
      } else {
        setError("Something went wrong — please try again.");
      }
      return;
    }

    const colors =
      fields.gender === "boy"
        ? ["#2176c9", "#75bbf7", "#ffffff"]
        : ["#d6538c", "#f7a8cc", "#ffffff"];

    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors });
    confetti({ particleCount: 60, spread: 120, origin: { y: 0.6 }, colors, startVelocity: 20 });

    setFields(EMPTY_FIELDS);
    setSubmitting(false);
    setSubmittedName(name);
    onSubmitted(name);
  }

  return (
    <form className="pool-form" onSubmit={handleSubmit} noValidate>
      <div className="pool-form-group">
        <label htmlFor="pf-name">Your name</label>
        <input
          id="pf-name"
          type="text"
          required
          maxLength={80}
          value={fields.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Ouma Sannie"
        />
        {nameWarning && (
          <p className="pool-name-warning" role="alert">{nameWarning}</p>
        )}
      </div>

      <fieldset className="pool-form-group pool-form-gender">
        <legend>Gender</legend>
        <div className="pool-radios">
          <label className={`pool-radio ${fields.gender === "boy" ? "is-selected" : ""}`}>
            <input
              type="radio"
              name="gender"
              value="boy"
              required
              checked={fields.gender === "boy"}
              onChange={() => set("gender", "boy")}
            />
            Boy
          </label>
          <label className={`pool-radio ${fields.gender === "girl" ? "is-selected" : ""}`}>
            <input
              type="radio"
              name="gender"
              value="girl"
              required
              checked={fields.gender === "girl"}
              onChange={() => set("gender", "girl")}
            />
            Girl
          </label>
        </div>
      </fieldset>

      <div className="pool-form-row">
        <div className="pool-form-group">
          <label htmlFor="pf-date">Birth date</label>
          <input
            id="pf-date"
            type="date"
            required
            value={fields.birth_date}
            onChange={(e) => set("birth_date", e.target.value)}
          />
        </div>
        <div className="pool-form-group">
          <label htmlFor="pf-time">Birth time</label>
          <input
            id="pf-time"
            type="time"
            required
            value={fields.birth_time}
            onChange={(e) => set("birth_time", e.target.value)}
          />
        </div>
      </div>

      <div className="pool-form-row">
        <div className="pool-form-group">
          <label htmlFor="pf-weight">Weight (kg)</label>
          <input
            id="pf-weight"
            type="number"
            required
            step="0.1"
            min="0"
            max="15"
            value={fields.weight_kg}
            onChange={(e) => set("weight_kg", e.target.value)}
            placeholder="e.g. 3.2"
          />
        </div>
        <div className="pool-form-group">
          <label htmlFor="pf-length">Length (cm)</label>
          <input
            id="pf-length"
            type="number"
            required
            step="0.1"
            min="0"
            max="180"
            value={fields.length_cm}
            onChange={(e) => set("length_cm", e.target.value)}
            placeholder="e.g. 51.0"
          />
        </div>
      </div>

      <div className="pool-form-row">
        <div className="pool-form-group">
          <label htmlFor="pf-hair">Hair colour</label>
          <select
            id="pf-hair"
            required
            value={fields.hair_colour}
            onChange={(e) => set("hair_colour", e.target.value)}
          >
            <option value="">Select…</option>
            {HAIR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="pool-form-group">
          <label htmlFor="pf-eye">Eye colour</label>
          <select
            id="pf-eye"
            required
            value={fields.eye_colour}
            onChange={(e) => set("eye_colour", e.target.value)}
          >
            <option value="">Select…</option>
            {EYE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pool-form-group pool-form-letter">
        <label htmlFor="pf-letter">Name's first letter</label>
        <input
          id="pf-letter"
          type="text"
          required
          maxLength={1}
          pattern="[A-Za-z]"
          value={fields.name_letter}
          onChange={(e) => set("name_letter", e.target.value.replace(/[^A-Za-z]/g, ""))}
          placeholder="E"
        />
      </div>

      {error && <p className="pool-form-error" role="alert">{error}</p>}

      <button
        type="submit"
        className="button button-primary pool-form-submit"
        disabled={submitting}
      >
        {submitting ? "Locking in…" : "Lock in my prediction"}
      </button>
    </form>
  );
}
