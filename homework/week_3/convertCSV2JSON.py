#!/usr/bin/env python
# Name: Matthew Finnegan
# Student number: 10698485
"""
This script converts a csv file with
Toyota import numbers in Norway to json
"""

import json
import csv

INPUT_CSV = 'norway_new_car_sales_by_make.csv'
OUTPUT_JSON = 'norway_cars.json'

data = {}
with open(INPUT_CSV) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        if row["Make"] == "Toyota":
            if row["Year"] in data:
                data[row["Year"]] += int(row["Quantity"])
            else:
                data[row["Year"]] = int(row["Quantity"])

with open(OUTPUT_JSON, 'w') as fp:
    json.dump(data, fp)
