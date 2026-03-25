export interface AiResult {
  disease: string;
  damagePct: number;
  aiConfidence: number;
  crop: string;
  healthy: boolean;
}

const detectFromFilename = (filename: string): AiResult => {
  const lower = filename.toLowerCase();
  if (lower.includes("crop1"))
    return { disease: "Paddy Leaf Blast", damagePct: 45, aiConfidence: 92, crop: "Paddy", healthy: false };
  if (lower.includes("crop2"))
    return { disease: "Wheat Rust", damagePct: 38, aiConfidence: 94, crop: "Wheat", healthy: false };
  if (lower.includes("crop3"))
    return { disease: "Cotton Aphids", damagePct: 60, aiConfidence: 89, crop: "Cotton", healthy: false };
  return { disease: "Healthy Crop", damagePct: 0, aiConfidence: 99, crop: "Mixed Crop", healthy: true };
};

/**
 * Simulates an async API call to a Python AI backend.
 * Replace the setTimeout with a real fetch() call when the backend is ready.
 */
export const analyzeCropImage = (file: File): Promise<AiResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(detectFromFilename(file.name));
    }, 2500);
  });
};

export const getUserGeolocation = (): Promise<{ lat: string; lng: string }> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: "Location Unavailable", lng: "Location Unavailable" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude.toFixed(4),
          lng: position.coords.longitude.toFixed(4),
        });
      },
      () => {
        resolve({ lat: "Location Unavailable", lng: "Location Unavailable" });
      },
      { timeout: 10000 }
    );
  });
};
