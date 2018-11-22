#!/usr/bin/env python
# Name: Matthew Finnegan
# Student number: 10698485
"""
This script converts a csv file with
Toyota import numbers in Norway to json
"""

import json
import csv

INPUT_CSV = 'cost_of_living.csv'
OUTPUT_JSON = 'data.json'

data = []
with open(INPUT_CSV) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        data.append({"Country":row["Country"],
                     "Ranking":int(row["Ranking"]),
                     "Cost":int(row["Price Index"])})

with open(OUTPUT_JSON, 'w') as fp:
        json.dump(data, fp)
