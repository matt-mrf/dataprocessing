#!/usr/bin/env python
# Name: Matthew Finnegan
# Student number: 10698485
"""
This script converts a csv file with
Toyota import numbers in Norway to json
{
   2008: {
            Rav4: 206694
            Avensis: 35067
            total:
         }
}
"""

import pprint
import json
import csv

INPUT_CSV = 'data/norway.csv'
OUTPUT_JSON = 'data.json'

data = {}
with open(INPUT_CSV) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        if row["Make"].strip() == "Toyota":
            if row["Year"] in data:
                if row["Model"] in data[row["Year"]]:
                    data[row["Year"]][row["Model"]] += int(row["Quantity"])
                    data[row["Year"]]["total"] += int(row["Quantity"])
                else:
                    data[row["Year"]][row["Model"]] = int(row["Quantity"])
                    data[row["Year"]]["total"] += int(row["Quantity"])
            else:
                data[row["Year"]] = {row["Model"]: int(row["Quantity"]),
                                     "total": int(row["Quantity"])}

data_list = []
for k, v in data.items():
    temp_obj = {}
    temp_obj["year"] = k
    temp_obj["models"] = v
    data_list.append(temp_obj)

with open(OUTPUT_JSON, 'w') as fp:
json.dump(data_list, fp)
