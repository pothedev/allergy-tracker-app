const fetchPrediction = async () => {
  try {
    const response = await fetch("https://allergyprediction.onrender.com/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weather_data: [[7, 30, 60, 30, 0], [8, 30, 60, 30, 0]]
      }),
    });
    if (!response.ok) throw new Error("Failed to fetch"); 
    const data = await response.json();
    console.log("Prediction data received:", data);
    const shiftingMap: Record<string, number[]> = {
      ragweed: [data.start_shift, data.end_shift],
      mugwort: [0, 0],
      birch: [0, 0],
      poplar: [0, 0],
      nettle: [0, 0],
      timothy: [0, 0],
      goosefoot: [0, 0],
      alder: [0, 0],
    }
    return shiftingMap
    //setDateShifting(shiftingMap)
    //console.log("setting dateShifting", shiftingMap)
  } 
  catch (err) {
    console.error("Fetch error:", err);
  }
};