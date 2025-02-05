import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load your dataset
df = pd.read_csv('ranking_history.csv')

# Set 'record_id' as the index
df.set_index('record_id', inplace=True)

# Replace placeholder values (-1) with NaN
df.replace(-1, np.nan, inplace=True)

# Ensure ranks are whole numbers (if needed)
df = df.applymap(lambda x: int(x) if not np.isnan(x) else np.nan)

# Plot raw trend lines for all papers (no smoothing)
plt.figure(figsize=(20, 10))

# Modern and elegant color palette
custom_palette = [
    '#4C72B0',  # Soft blue
    '#DD8452',  # Muted orange
    '#55A868',  # Muted green
    '#C44E52',  # Muted red
    '#8172B3',  # Muted purple
    '#937860',  # Muted brown
    '#DA8BC3',  # Soft pink
    '#8C8C8C',  # Medium gray
    '#CCB974',  # Muted gold
    '#64B5CD',  # Soft teal
    '#4C8C8C',  # Dark teal
    '#A0522D',  # Sienna
]

# Cycle through the custom palette for each paper
for record_id, row in df.iterrows():
    color = custom_palette[record_id % len(custom_palette)]  # Cycle through the palette
    plt.plot(row, alpha=0.5, linewidth=0.6, color=color, label=f'Paper {record_id}')

# Highlight overlapping regions
for step in df.columns:
    ranks = df[step].dropna().values
    unique_ranks, counts = np.unique(ranks, return_counts=True)
    for rank, count in zip(unique_ranks, counts):
        if count > 1:  # If multiple papers share the same rank
            plt.scatter(step, rank, color='red', s=50, alpha=0.5)  # Highlight overlapping points

# Add labels and title
plt.title('Simulation Mode - Dataset (Appenzeller-Herzog_2019) Reordering Using ASReview', fontsize=18, fontweight='bold', pad=20)
plt.xlabel('Active Learning Steps', fontsize=10, labelpad=10)
plt.ylabel('Order in Dataset', fontsize=10)

# Simplify x-axis labels (remove "step" prefix)
plt.xticks(np.arange(len(df.columns)), labels=np.arange(1, len(df.columns) + 1), fontsize=7)
plt.yticks(fontsize=12)

# Add grid lines for better readability
plt.grid(True, linestyle='--', alpha=0.6, color='gray')

# Set background color to white
plt.gca().set_facecolor('white')

# Add a legend (optional)
# plt.legend(title='Paper ID', bbox_to_anchor=(1.05, 1), loc='upper left', fontsize=10)

# Enable interactive zoom and pan
plt.tight_layout()
plt.show()