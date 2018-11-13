#!/usr/bin/env python
# Name: Matthew Finnegan
# Student number: 10698485
"""
This script ...
"""

import pandas as pd
import csv
import matplotlib.pyplot as plt
import json

# global constants
INPUT_CSV = "input.csv"
NEW_CSV = "input_better.csv"

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
                if row[key] == 'unknown':
                    row[key] = ''
                # set GDP-comlumn to numberso only
                if key == "GDP ($ per capita) dollars":
                    try:
                        row[key] = row[key].split()[0]
                    except:
                        pass
                elif key == "Infant mortality (per 1000 births)":
                    try:
                        row[key] = float(row[key].replace(',','.'))
                    except:
                        pass

            data_dict[row['Country'].strip()] = {
                                                "Region":row['Region'].strip(),
                                                "Population":row["Population"],
                                                "Pop. Density (per sq. mi.)":row["Pop. Density (per sq. mi.)"],
                                                "Infant mortality (per 1000 births)":row["Infant mortality (per 1000 births)"],
                                                "GDP ($ per capita) dollars":row["GDP ($ per capita) dollars"],
                                                }

    with open(NEW_CSV, 'w', newline='') as outfile:
        writer = csv.writer(outfile)
        writer.writerow(['Country', 'Region', 'Population', \
        'Pop. Density (per sq. mi.)', \
        'Infant mortality (per 1000 births)', \
        'GDP ($ per capita) dollars'])

        for country in data_dict:
            region = data_dict[country]["Region"]
            population = data_dict[country]["Population"]
            pop_density = data_dict[country]["Pop. Density (per sq. mi.)"]
            inf_mortality = data_dict[country]["Infant mortality (per 1000 births)"]
            gdp = data_dict[country]["GDP ($ per capita) dollars"]

            writer.writerow([country, region, population, pop_density, \
                            inf_mortality, gdp])

def plot_hist(pandas_df, summary):
    """
    Plots a histogram of the GDP in a country
    """
    f = plt.figure(1)
    y = list(pandas_df["GDP ($ per capita) dollars"])

    plt.tick_params(
    axis='x',          # changes apply to the x-axis
    which='both',      # both major and minor ticks are affected
    bottom=False,      # ticks along the bottom edge are off
    top=False,         # ticks along the top edge are off
    labelbottom=False) # labels along the bottom edge are off

    # plot and set limits
    plt.plot(y)

    # set labels
    plt.title('GDP per country')
    plt.ylabel('GDP')

    f.show()

    x = list(summary.keys())
    y2 = list(summary.values())

    g = plt.figure(2)
    plt.bar(x, y2)

    # set labels
    plt.title('Summary of infant mortality')
    plt.xlabel('')
    plt.ylabel('')

    g.show()

    input()


def plot_bar(summary):
    """
    PLots a bar chart of the descriptive values of infant mortality
    """
    x = list(summary.keys())
    y = list(summary.values())

    plt.bar(x, y)

    # set labels
    plt.title('Summary of infant mortality')
    plt.xlabel('')
    plt.ylabel('')

    plt.show()

def to_json():
    with open('result.json', 'w') as fp:
        json.dump(data_dict, fp)


if __name__ == "__main__":
    preprocess_csv()

    pandas_file = pd.read_csv(NEW_CSV)
    pandas_df = pd.DataFrame(pandas_file)

    gdp_median = int(pandas_df["GDP ($ per capita) dollars"].median())
    gdp_mean = int(pandas_df["GDP ($ per capita) dollars"].mean())
    gdp_mode = int(pandas_df["GDP ($ per capita) dollars"].mode())
    gdp_std = pandas_df["GDP ($ per capita) dollars"].std()

    inf_des = pandas_df["Infant mortality (per 1000 births)"].describe()
    inf_med = pandas_df["Infant mortality (per 1000 births)"].median()
    summary = {"Minimum":inf_des["min"], \
               "First Quartile":inf_des["25%"], \
               "Median":inf_med, \
               "Third Quartile":inf_des["75%"], \
               "Maximum":inf_des["max"]}

    plot_hist(pandas_df, summary)
    # plot_bar(summary)

    to_json()

    print(f"median: {gdp_median}, mean: {gdp_mean}, mode: {gdp_mode}, "+ \
         f"std. dev: {gdp_std}")
