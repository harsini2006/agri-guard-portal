import { supabase } from "@/integrations/supabase/client";

export interface AiResult {
  disease: string;
  damagePct: number;
  aiConfidence: number;
  crop: string;
  healthy: boolean;
}

/**
 * Converts a File to a base64 string (without the data-url prefix).
 */
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Strip "data:<mime>;base64," prefix
      resolve(dataUrl.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/**
 * Sends the crop image to the AI-powered edge function for real disease analysis.
 * Falls back to a basic result if the call fails.
 */
export const analyzeCropImage = async (file: File): Promise<AiResult> => {
  try {
    const imageBase64 = await fileToBase64(file);
    const mimeType = file.type || "image/jpeg";

    const { data, error } = await supabase.functions.invoke("analyze-crop", {
      body: { imageBase64, mimeType },
    });

    if (error) {
      console.error("Edge function error:", error);
      throw error;
    }

    if (data?.error) {
      console.error("AI analysis error:", data.error);
      throw new Error(data.error);
    }

    return data as AiResult;
  } catch (err) {
    console.error("Crop analysis failed, using fallback:", err);
    // Fallback so the app doesn't break
    return {
      disease: "Analysis Unavailable",
      damagePct: 0,
      aiConfidence: 0,
      crop: "Unknown",
      healthy: false,
    };
  }
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
