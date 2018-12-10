#!/usr/bin/env python
# Name: Matthew Finnegan
# Student number: 10698485
"""
This script converts a csv file with
import numbers in Norway to json
"""

import pprint
import json
import csv

INPUT_CSV = 'data/norway.csv'
OUTPUT_JSON = 'data/audi.json'

data = {}
with open(INPUT_CSV) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:

        make = row["Make"].strip()
        year = row["Year"]
        model = row["Model"]
        quant = int(row["Quantity"])

        if make == "Audi":
            if year in data:
                if model in data[year]:
                    data[year][model] += quant
                    data[year]["total"] += quant
                else:
                    data[year][model] = quant
                    data[year]["total"] += quant
            else:
                data[year] = {model: quant,
                                     "total": quant}

data_list = []
for k, v in data.items():
    temp_obj = {}
    temp_obj["year"] = k
    temp_obj["models"] = v
    data_list.append(temp_obj)

with open(OUTPUT_JSON, 'w') as fp:
    json.dump(data_list, fp)
