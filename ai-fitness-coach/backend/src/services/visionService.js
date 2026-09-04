/**
 * Body Metrics Estimation Service.
 *
 * IMPORTANT — honest scope: these values are CALCULATED ESTIMATES derived from
 * the user's height/weight/age/gender inputs (BMI, Deurenberg body-fat formula,
 * healthy weight range). Photos are stored as a visual snapshot only.
 * There is NO computer-vision / landmark / MediaPipe processing in this codebase
 * yet — real CV pose analysis is a planned future feature. Do not present these
 * outputs as vision measurements.
 */
export const analyzeBodyImages = async ({ heightCm = 175, weightKg = 70, age = 25, gender = 'Male', images = {} }) => {
  const hMeters = Number(heightCm) / 100 || 1.75;
  const wKg = Number(weightKg) || 70;
  const aYears = Number(age) || 25;

  // 1. Dynamic BMI Calculation
  const bmiRaw = wKg / (hMeters * hMeters);
  const estimatedBmi = parseFloat(bmiRaw.toFixed(1));

  // 2. BMI Category Classification
  let bmiCategory = 'Normal Weight';
  if (estimatedBmi < 18.5) bmiCategory = 'Underweight';
  else if (estimatedBmi >= 25 && estimatedBmi < 29.9) bmiCategory = 'Overweight';
  else if (estimatedBmi >= 30) bmiCategory = 'Obese';

  // 3. Dynamic Body Fat % Estimation (Deurenberg Formula)
  const isFemale = gender.toLowerCase() === 'female';
  const genderFactor = isFemale ? 0 : 1; // 1 for males, 0 for females
  const rawFatPct = 1.20 * estimatedBmi + 0.23 * aYears - 10.8 * genderFactor - 5.4;
  const estimatedBodyFatPct = parseFloat(Math.max(5, Math.min(50, rawFatPct)).toFixed(1));

  // 4. Dynamic Ideal Weight Range Calculation
  const minIdealKg = parseFloat((18.5 * hMeters * hMeters).toFixed(1));
  const maxIdealKg = parseFloat((24.9 * hMeters * hMeters).toFixed(1));

  // 5. No vision/landmark data exists yet — keep the payload field empty so
  //    nothing downstream can present fabricated landmark coordinates as real.
  const bodyLandmarks = {};

  // 6. Posture / snapshot status string — honest wording.
  const photoEntries = Object.values(images || {}).filter((v) => typeof v === 'string' && v.length > 0);
  const processedCount = photoEntries.length;
  const photoNote = processedCount > 0
    ? `${processedCount} photo(s) stored as your visual snapshot.`
    : 'No photos provided.';
  const postureStatus =
    `${photoNote} Metrics are ESTIMATED from your measurements (BMI ${estimatedBmi} · ${bmiCategory}, ` +
    `est. body fat ${estimatedBodyFatPct}%, healthy weight range ${minIdealKg}–${maxIdealKg} kg). ` +
    `Computer-vision landmark analysis is not enabled yet.`;

  return {
    estimatedBmi,
    bmiCategory,
    estimatedBodyFatPct,
    idealWeightRangeKg: { min: minIdealKg, max: maxIdealKg },
    postureStatus,
    bodyLandmarks,
    processedImageCount: processedCount,
    disclaimer: 'Note: BMI, body-fat % and related estimates are calculated approximations from your measurements — they are not vision-based and are not medically certified.'
  };
};
