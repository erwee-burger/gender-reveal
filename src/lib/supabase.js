import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

function getPredictionApiMock() {
  if (import.meta.env.PROD) {
    return null;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return window.__PIKKEWYN_PREDICTION_API_MOCK__ ?? null;
}

export function hasPredictionApi() {
  return Boolean(supabase || getPredictionApiMock());
}

export async function getPredictionInsights() {
  const mock = getPredictionApiMock();
  if (mock?.getPredictionInsights) {
    return mock.getPredictionInsights();
  }

  if (!supabase) {
    return {
      data: null,
      error: new Error("Supabase is not configured.")
    };
  }

  const { data, error } = await supabase.rpc("get_prediction_insights");
  return { data: normalizeInsights(data), error };
}

export async function predictionNameExists(name) {
  const mock = getPredictionApiMock();
  if (mock?.predictionNameExists) {
    return mock.predictionNameExists(name);
  }

  if (!supabase) {
    return {
      data: false,
      error: new Error("Supabase is not configured.")
    };
  }

  const { data, error } = await supabase.rpc("prediction_name_exists", {
    input_name: name
  });

  return { data: Boolean(data), error };
}

export async function submitPrediction(prediction) {
  const mock = getPredictionApiMock();
  if (mock?.submitPrediction) {
    return mock.submitPrediction(prediction);
  }

  if (!supabase) {
    return {
      error: new Error("Supabase is not configured.")
    };
  }

  return supabase.from("predictions").insert(prediction);
}

function normalizeInsights(data) {
  if (!data) {
    return data;
  }

  return {
    total: Number(data.total ?? 0),
    threshold: Number(data.threshold ?? 3),
    visible: Boolean(data.visible),
    gender: data.gender ?? [],
    birthDates: data.birthDates ?? data.birth_dates ?? [],
    birthTimes: data.birthTimes ?? data.birth_times ?? [],
    weights: data.weights ?? [],
    lengths: data.lengths ?? [],
    hairColours: data.hairColours ?? data.hair_colours ?? [],
    eyeColours: data.eyeColours ?? data.eye_colours ?? [],
    nameLetters: data.nameLetters ?? data.name_letters ?? []
  };
}
