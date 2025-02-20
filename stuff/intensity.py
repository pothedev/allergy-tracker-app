import pandas as pd
import numpy as np


rows = 1000
# Function to generate random weather data
def generate_random_weather_data(rows=rows):
    np.random.seed(42)  # Set seed for reproducibility
    data = {
        "Temperature_Deviation_C": np.random.randint(-10, 11, size=rows),  # From -10 to 10
        "Humidity_Percent": np.random.randint(10, 101, size=rows),  # From 10 to 100
        "Wind_Speed_kmh": np.random.randint(0, 51, size=rows),  # Arbitrary wind range (0 to 50 km/h)
        "Cloud_Cover_Percent": np.random.randint(0, 101, size=rows),  # From 0 to 100%
        "CO2_ppm": np.random.randint(390, 471, size=rows),  # From 390 to 470
    }
    return pd.DataFrame(data)

# Function to calculate intensity delta
def calculate_intensity_delta(row):
    
    temp_factor = row["Temperature_Deviation_C"] * 0.1  # Moderate influence of temperature
    humidity_factor = 0.2 * (row["Humidity_Percent"] - 50) / 10  # Humidity increases intensity
    wind_factor = row["Wind_Speed_kmh"] * 0.05  # Wind disperses pollen
    cloud_factor = -0.03 * row["Cloud_Cover_Percent"] / 10  # Suppressive effect of cloud cover
    co2_factor = (row["CO2_ppm"] - 400) * 0.002  # Minimal CO2 effect

    delta_intensity = temp_factor + humidity_factor + wind_factor + cloud_factor + co2_factor
    #print(max(0, min(5, round(delta_intensity))))
    return max(0, min(5, round(delta_intensity)))  # Round and constrain to 0-5

# Generate random weather data
random_weather_data = generate_random_weather_data(rows=rows)

# Calculate intensity delta for each row
random_weather_data["Intensity_Delta"] = random_weather_data.apply(calculate_intensity_delta, axis=1)

# Save the DataFrame to an Excel file
file_path = "intensity_pattern.xlsx"
random_weather_data.to_excel(file_path, index=False)
print(random_weather_data)

# Confirm the file generation
file_path
