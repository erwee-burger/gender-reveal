/**
 * Calculates total score for a prediction against the reveal result.
 * Returns 0 for every category when result is null (pre-reveal).
 *
 * @param {object} prediction - row from Supabase predictions table
 * @param {object|null} result - poolConfig.revealResult from config.js
 * @returns {{ gender, birthDate, birthTime, weight, length, hairColour, eyeColour, nameLetter, total }}
 */
export function calculateScore(prediction, result) {
  if (!result) {
    return { gender: 0, birthDate: 0, birthTime: 0, weight: 0, length: 0, hairColour: 0, eyeColour: 0, nameLetter: 0, total: 0 };
  }

  const gender = scoreGender(prediction.gender, result.gender);
  const birthDate = scoreBirthDate(prediction.birth_date, result.birthDate);
  const birthTime = scoreBirthTime(prediction.birth_time, result.birthTime);
  const weight = scoreWeight(prediction.weight_g, result.weightG);
  const length = scoreLength(Number(prediction.length_cm), result.lengthCm);
  const hairColour = scoreExact(prediction.hair_colour, result.hairColour, 5);
  const eyeColour = scoreExact(prediction.eye_colour, result.eyeColour, 5);
  const nameLetter = scoreExact(
    prediction.name_letter.toUpperCase(),
    result.nameLetter.toUpperCase(),
    5
  );

  return {
    gender,
    birthDate,
    birthTime,
    weight,
    length,
    hairColour,
    eyeColour,
    nameLetter,
    total: gender + birthDate + birthTime + weight + length + hairColour + eyeColour + nameLetter
  };
}

function scoreGender(guess, actual) {
  return guess === actual ? 25 : 0;
}

function scoreBirthDate(guessDateStr, actualDateStr) {
  const diff = Math.abs(daysBetween(guessDateStr, actualDateStr));
  if (diff === 0) return 25;
  if (diff > 12) return 0;
  return Math.max(1, 25 - diff * 2);
}

function scoreBirthTime(guessTimeStr, actualTimeStr) {
  const diffHours = Math.abs(hoursBetween(guessTimeStr, actualTimeStr));
  // BabyHunch uses shortest direction, max deviation 12 h
  const shortest = Math.min(diffHours, 24 - diffHours);
  if (shortest === 0) return 15;
  if (shortest > 12) return 0;
  return Math.max(2, 15 - shortest);
}

function scoreWeight(guessG, actualG) {
  const diff = Math.abs(guessG - actualG);
  if (diff === 0) return 10;
  const deductions = Math.floor(diff / 100);
  if (deductions >= 10) return 0;
  return Math.max(1, 10 - deductions);
}

function scoreLength(guessCm, actualCm) {
  const diff = Math.abs(guessCm - actualCm);
  if (diff === 0) return 10;
  const deductions = Math.floor(diff);
  if (deductions >= 10) return 0;
  return Math.max(1, 10 - deductions);
}

function scoreExact(guess, actual, points) {
  return guess === actual ? points : 0;
}

function daysBetween(dateStrA, dateStrB) {
  const a = new Date(dateStrA);
  const b = new Date(dateStrB);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function hoursBetween(timeStrA, timeStrB) {
  const [hA, mA] = timeStrA.split(":").map(Number);
  const [hB, mB] = timeStrB.split(":").map(Number);
  return (hB * 60 + mB - (hA * 60 + mA)) / 60;
}
