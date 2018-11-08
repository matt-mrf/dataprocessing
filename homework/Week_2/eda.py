#!/usr/bin/env python
# Name: Matthew Finnegan
# Student number: 10698485
"""
This script ...
"""

import pandas as pd
import csv

# global constants
INPUT_CSV = "input.csv"

# global data_dictionary
data_dict = {}


def preprocess_csv():
    """
    Output a CSV file containing the preprocessed countries
    """
    with open(INPUT_CSV, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            for key in row:
                # standardise missing data
                if row[key] == '':
                    row[key] = 'unknown'
                # set GDP to numbers
                if key == "GDP ($ per capita) dollars":
                    row[key] = row[key].split()[0]


            data_dict[row['Country'].strip()] = {
                                                "Region":row['Region'].strip(),
                                                "Population":row["Population"],
                                                "Pop. Density (per sq. mi.)":row["Pop. Density (per sq. mi.)"],
                                                "Infant mortality (per 1000 births)":row["Infant mortality (per 1000 births)"],
                                                "GDP ($ per capita) dollars":row["GDP ($ per capita) dollars"],
                                                }


if __name__ == "__main__":
    panda_file = pd.read_csv(INPUT_CSV)
    print(panda_file)
    # preprocess_csv()
