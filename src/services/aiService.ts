/**
 * Production AI Analysis Service
 * Handles image upload to AI backend via REST API with robust error handling.
 * Falls back to local filename-based detection when the backend is unreachable.
 */

export const AI_API_ENDPOINT = "http://localhost:5000/api/analyze";

export interface AiAnalysisResult {
  disease: string;
  damagePct: number;
  aiConfidence: number;
  crop: string;
  healthy: boolean;
}

class AiServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isNetworkError = false
  ) {
    super(message);
    this.name = "AiServiceError";
  }
}

/**
 * Fallback: local filename-based detection (legacy mock logic).
 */
const detectFromFilename = (filename: string): AiAnalysisResult => {
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
 * Sends a crop image to the AI backend for disease analysis.
 * On network/server failure, falls back to filename-based detection.
 *
 * @param file - The image file to analyze
 * @returns AiAnalysisResult with disease info and damage metrics
 * @throws AiServiceError only if both real API and fallback fail
 */
export const analyzeCropImage = async (
  file: File
): Promise<{ result: AiAnalysisResult; usedFallback: boolean }> => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(AI_API_ENDPOINT, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Unknown error");
      throw new AiServiceError(
        `AI Server returned ${response.status}: ${errorBody}`,
        response.status
      );
    }

    const data = await response.json();

    // Map server response to our interface
    const result: AiAnalysisResult = {
      disease: data.diseaseName ?? data.disease ?? "Unknown",
      damagePct: data.damagePercentage ?? data.damagePct ?? 0,
      aiConfidence: data.confidenceScore ?? data.aiConfidence ?? 0,
      crop: data.crop ?? "Unknown",
      healthy: (data.damagePercentage ?? data.damagePct ?? 0) === 0,
    };

    return { result, usedFallback: false };
  } catch (error) {
    // Network errors, timeouts, server errors → fall back to filename detection
    console.warn(
      "[AI Service] Backend unreachable, using local fallback:",
      error instanceof Error ? error.message : error
    );

    const fallbackResult = detectFromFilename(file.name);
    return { result: fallbackResult, usedFallback: true };
  }
};

/**
 * Gets user geolocation coordinates.
 */
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
