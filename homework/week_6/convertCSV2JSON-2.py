#!/usr/bin/env python
# Name: Matthew Finnegan
# Student number: 10698485
"""
This script converts a csv file with
Toyota import numbers in Norway to json
{
   Toyota:{
            2008:{
                    rav4: 500
                 }
            2009:{
                    rav4: 800
                 }
          }
  Mitsubishi:{
                2008:{
                        evo: 500
                     }
                2009:{
                        evo: 800
                     }
             }
}
"""

import pprint
import json
import csv

INPUT_CSV = 'data/norway.csv'
OUTPUT_JSON = 'data-2.json'

data = {}
with open(INPUT_CSV) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:

        make = row["Make"].strip()
        year = row["Year"]
        model = row["Model"]
        quantity = row["Quantity"]

        if make in data:

            pass
        else:
            data[make] = {year: {model:quantity}}
            # pass
print(data)

# data_list = []
# for k, v in data.items():
#     temp_obj = {}
#     temp_obj["year"] = k
#     temp_obj["models"] = v
#     data_list.append(temp_obj)

# with open(OUTPUT_JSON, 'w') as fp:
# json.dump(data_list, fp)
