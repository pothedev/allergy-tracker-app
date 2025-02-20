import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from datetime import datetime, timedelta

def generate_blooming_graph(start, end):
    # Parse the start and end dates
    start_date = datetime.strptime(start, "%d/%m/%Y")
    end_date = datetime.strptime(end, "%d/%m/%Y")

    # Generate a range of dates from start to end
    date_range = pd.date_range(start=start_date, end=end_date)

    # Calculate the midpoint of the season (peak)
    midpoint = start_date + (end_date - start_date) / 2

    # Create x-values as days from the start date
    x_days = np.array([(date - start_date).days for date in date_range])

    # Create y-values using a normal distribution
    # Peak intensity is 5, with standard deviation chosen for smoothness
    peak_intensity = 5
    std_dev = (end_date - start_date).days / 6  # Adjust std_dev to control curve width
    y_values = peak_intensity * np.exp(-((x_days - (midpoint - start_date).days) ** 2) / (2 * std_dev ** 2))

    # Plot the graph
    plt.figure(figsize=(10, 6))
    plt.plot(date_range, y_values, label="Normal distribution curve", color="green")
    plt.title("Blooming Season Intensity")
    plt.xlabel("Date")
    plt.ylabel("Intensity (0-5)")
    plt.ylim(0, 5.5)
    plt.xticks(rotation=45)
    plt.grid(alpha=0.3)
    plt.legend()
    plt.tight_layout()
    plt.show()

    # Return the rounded intensities for each day
    intensity_values = np.round(y_values).tolist()
    return intensity_values


def generate_dates_dict(start, intensities):
    # Parse the start date
    start_date = datetime.strptime(start, "%d/%m/%Y")

    # Generate the dictionary
    dates_dict = {}
    for i, intensity in enumerate(intensities):
        date = start_date + timedelta(days=i)  # Calculate the date for each intensity
        dates_dict[date.strftime("%Y-%m-%d")] = intensity  # Add to the dictionary with formatted date as key

    return dates_dict


# Example usage
start = "25/07/2025"
end = "20/10/2025"
intensities = generate_blooming_graph(start, end)
# Generate the dates dictionary
dates_dict = generate_dates_dict(start, intensities)

# Print the result
print("Dates to Intensities Dictionary:")
print(dates_dict)

print("Daily Intensities:")
print(intensities)
