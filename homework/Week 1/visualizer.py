#!/usr/bin/env python
# Name: Matthew Finnegan
# Student number: 10698485
"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt
import numpy as np

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# Global dictionary for the data
data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}

with open(INPUT_CSV, newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        data_dict[row['Year']].append(float(row['Rating']))

for key in data_dict:
    data_dict[key] = np.mean(data_dict.get(key))

x = list(data_dict.keys())
y = list(data_dict.values())

plt.plot(x, y)
plt.ylim(7, 10)
plt.ylabel('Average rating')
plt.show()
