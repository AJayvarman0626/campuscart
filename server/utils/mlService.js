import axios from "axios";

const ML_API_URL = "https://campus-cart-ml.onrender.com/predict";

export const getRecommendedCategory = async ({
  semester,
  regulation,
  category,
}) => {
  try {
    const response = await axios.post(ML_API_URL, {
      semester,
      regulation,
      category,
    });

    return response.data.recommended_category;
  } catch (error) {
    console.error("❌ ML service error:", error.message);
    return null; // graceful fallback
  }
};
