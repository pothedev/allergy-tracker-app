import pandas as pd
import requests
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

# Function to process weather data
def process_weather_data(response):
    hourly_data = response['hourly']
    data = pd.DataFrame({
        'time': pd.to_datetime(hourly_data['time']),
        'temperature': hourly_data['temperature_2m'],
        'humidity': hourly_data['relative_humidity_2m'],
        'rain': hourly_data['rain'],
        'cloud_cover': hourly_data['cloud_cover'],
        'wind_speed': hourly_data['wind_speed_10m']
    })
    data['date'] = data['time'].dt.date
    daily_averages = data.groupby('date').mean()
    result = daily_averages[['temperature', 'humidity', 'wind_speed', 'cloud_cover']].to_numpy()
    return result

# Fetch weather data
url = "https://api.open-meteo.com/v1/forecast"
params = {
    "latitude": 50.5,
    "longitude": 30.4375,
    "hourly": "temperature_2m,relative_humidity_2m,rain,cloud_cover,wind_speed_10m",
    "timezone": "Africa/Cairo",
    "forecast_days": 16
}
try:
    res = requests.get(url, params=params)
    res.raise_for_status()
    response = res.json()
    weather_data = process_weather_data(response)
except requests.exceptions.RequestException as e:
    print(f"HTTP Request failed: {e}")
    exit()
except Exception as e:
    print(f"An error occurred: {e}")
    exit()

# Load and process training data
file_path = "intensity_pattern.xlsx"
data = pd.read_excel(file_path)
print(f"Dataset contains {len(data)} rows and {data.shape[1]} columns.")

sample_size = min(300, len(data))
data_subset = data.sample(n=sample_size, random_state=42).reset_index(drop=True)
X = data_subset[["Temperature_Deviation_C", "Humidity_Percent", "Wind_Speed_kmh", "Cloud_Cover_Percent"]]
y = data_subset["Corrected_Intensity_Delta"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the Random Forest model
rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)

# Evaluate the model
y_pred = rf_model.predict(X_test).round().astype(int)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
accuracy = 1 - mse / np.var(y_test)
print(f"Mean Squared Error: {mse:.2f}")
print(f"R^2 Score: {r2:.2f}")
print(f"Accuracy: {accuracy:.2f}")

plt.figure(figsize=(10, 6))
plt.scatter(y_test, y_pred, alpha=0.7, label="Predicted vs Actual")
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], color='red', linestyle='--', label="Ideal Fit")
plt.xlabel("Actual Intensity Delta")
plt.ylabel("Predicted Intensity Delta")
plt.title("Actual vs Predicted Intensity Delta")
plt.legend()
plt.show()

# Predict for the 16-day forecast
test_data = pd.DataFrame(weather_data, columns=["Temperature_Deviation_C", "Humidity_Percent", "Wind_Speed_kmh", "Cloud_Cover_Percent"])
test_predictions = rf_model.predict(test_data).round().astype(int)
test_data["Predicted Intensity Delta"] = test_predictions

# Display predictions for 16 days
print("Predicted Intensity Delta for the 16-day forecast:")
print(test_data)

# Extract delta intensities as an array
delta_intensities = test_data["Predicted Intensity Delta"].tolist()

# Function to generate a map of dates to delta intensities
def generate_intensity_map(delta_intensities):
    today = datetime.today()  # Get today's date
    intensity_map = {}

    # Generate the mapping
    for i, delta in enumerate(delta_intensities):
        date = today + timedelta(days=i)  # Calculate the date for each delta
        intensity_map[date.strftime("%Y-%m-%d")] = delta  # Add to map with formatted date as key

    return intensity_map

# Generate the map
intensity_map = generate_intensity_map(delta_intensities)

# Print the results
print("\nArray of Delta Intensities:")
print(delta_intensities)

print("\nDate-to-Delta Intensity Map:")
print(intensity_map)
