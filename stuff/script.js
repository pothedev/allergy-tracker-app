// Function to fetch intensity data from the Flask server
async function fetchIntensityData(startDate, endDate) {
  try {
      const response = await fetch('https://intensityprediction.onrender.com/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ start_date: startDate, end_date: endDate }),
      });

      if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Updated Array:", data.updated_array);
      console.log("Updated Dictionary:", data.updated_dict);

      // Process the data (example)
      //displayIntensityData(data.updated_array, data.updated_dict);
  } catch (error) {
      console.error("Failed to fetch intensity data:", error);
  }
}

// Function to display the fetched intensity data (example)
function displayIntensityData(updatedArray, updatedDict) {
  console.log("Displaying Intensity Data...");

  // Log updated array
  console.log("Updated Array:");
  console.table(updatedArray);

  // Log updated dictionary in a readable format
  console.log("Updated Dictionary:");
  Object.entries(updatedDict).forEach(([date, intensity]) => {
      console.log(`Date: ${date}, Intensity: ${intensity}`);
  });
}

// Example usage
const startDate = "10/01/2025";
const endDate = "25/02/2025";

// Call the API
fetchIntensityData(startDate, endDate);
