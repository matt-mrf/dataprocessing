#!/usr/bin/env python
# Name: Matthew Finnegan
# Student number: 10698485
"""
This script converts a csv file with
Toyota import numbers in Norway to json

[
   2008: {
            Rav4: 206694
            Avensis: 35067
            total:
         }
]
"""

import json
import csv

INPUT_CSV = 'data/norway.csv'
OUTPUT_JSON = 'data.json'

data = {}
with open(INPUT_CSV) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        if row["Make"].strip() == "Toyota":
            print(row)
            # if row["Year"] in data:
            #     data[row["Year"]] += int(row["Quantity"])
            # else:
            #     data[row["Year"]] = int(row["Quantity"])

with open(OUTPUT_JSON, 'w') as fp:
    json.dump(data, fp)
