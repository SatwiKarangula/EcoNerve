// ============================================================
// EcoNerve – AI Prediction Module
// Simple Moving Average (SMA) + Linear Regression forecast
// ============================================================

/**
 * Simple Moving Average over last `window` values.
 */
function movingAverage(data, window = 5) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return result;
}

/**
 * Linear regression returning slope, intercept, and R².
 */
function linearRegression(y) {
  const n = y.length;
  if (n < 2) return { slope: 0, intercept: y[0] || 0, r2: 0 };
  const x   = Array.from({ length: n }, (_, i) => i);
  const sx  = x.reduce((a, b) => a + b, 0);
  const sy  = y.reduce((a, b) => a + b, 0);
  const sxy = x.reduce((a, xi, i) => a + xi * y[i], 0);
  const sx2 = x.reduce((a, xi) => a + xi * xi, 0);
  const slope     = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
  const intercept = (sy - slope * sx) / n;
  const yMean = sy / n;
  const ssTot = y.reduce((a, yi) => a + (yi - yMean) ** 2, 0);
  const ssRes = y.reduce((a, yi, i) => a + (yi - (slope * i + intercept)) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { slope, intercept, r2 };
}

/**
 * Forecast `steps` future values using linear regression.
 * Returns { forecast[], trend, confidence }
 */
function forecastAQI(history, steps = 6) {
  if (!history || history.length < 3) return null;
  const { slope, intercept, r2 } = linearRegression(history);
  const n        = history.length;
  const forecast = Array.from({ length: steps }, (_, i) =>
    Math.max(0, slope * (n + i) + intercept)
  );
  const trend = slope > 0.5 ? 'rising' : slope < -0.5 ? 'falling' : 'stable';
  return { forecast, trend, slope, r2: r2.toFixed(2) };
}

/**
 * Classify AQI into category + colour token.
 */
function classifyAQI(aqi) {
  if (aqi <= 50)  return { label: 'Good',              color: '#00e676', emoji: '😊' };
  if (aqi <= 100) return { label: 'Moderate',          color: '#ffee58', emoji: '😐' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: '#ffa726', emoji: '😷' };
  if (aqi <= 200) return { label: 'Unhealthy',         color: '#ef5350', emoji: '🤧' };
  if (aqi <= 300) return { label: 'Very Unhealthy',    color: '#ab47bc', emoji: '🚨' };
  return             { label: 'Hazardous',             color: '#b71c1c', emoji: '☠️' };
}

/**
 * Health recommendation based on AQI.
 */
function healthRecommendation(aqi) {
  if (aqi <= 50)  return 'Air quality is excellent. Ideal for outdoor activities.';
  if (aqi <= 100) return 'Air quality is acceptable. Unusually sensitive individuals should limit prolonged outdoor exertion.';
  if (aqi <= 150) return 'Members of sensitive groups may experience health effects. Reduce outdoor exertion.';
  if (aqi <= 200) return 'Everyone may begin to experience health effects. Limit outdoor activities.';
  if (aqi <= 300) return 'Health alert: Everyone may experience serious health effects. Avoid outdoor activities.';
  return 'Emergency conditions. Entire population likely affected. Stay indoors with windows closed.';
}

/**
 * Classify TDS (ppm) water quality.
 */
function classifyTDS(tds) {
  if (tds < 50)   return { label: 'Excellent',  color: '#00e676' };
  if (tds < 150)  return { label: 'Good',        color: '#69f0ae' };
  if (tds < 300)  return { label: 'Fair',        color: '#ffee58' };
  if (tds < 600)  return { label: 'Poor',        color: '#ffa726' };
  return             { label: 'Unacceptable',    color: '#ef5350' };
}
