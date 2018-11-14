#!/usr/bin/env python
# Name: Matthew Finnegan
# Student number: 10698485
"""
This script takes a CSV file, preprocesses it
and analyses the data from it.
"""

import pandas as pd
import csv
import matplotlib.pyplot as plt
import numpy as np
import json

# global constants
INPUT_CSV = "input.csv"
NEW_CSV = "input_better.csv"

# global data_dictionary
data_dict = {}


def preprocess_data():
    """
    Output a CSV file containing the preprocessed data
    """
    # setting codes for strings
    co = "Country"
    re = "Region"
    pop_dense = "Pop. Density (per sq. mi.)"
    inf_mor = "Infant mortality (per 1000 births)"
    gdp = "GDP ($ per capita) dollars"

    # read the csv to be preprocessed
    with open(INPUT_CSV, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            for key in row:
                # standardise missing data
                if row[key] == 'unknown':
                    row[key] = ''
                # set GDP-comlumn to numbers only
                if key == gdp:
                    if row[key] != '':
                        row[key] = int(row[key].split()[0])
                # replace all commas in infant mortality data
                elif key == inf_mor or key == pop_dense:
                    if row[key] != '':
                        row[key] = float(row[key].replace(',','.'))

            # put new and less data in dictionary
            data_dict[row[co].strip()] = {
                                         re:row[re].strip(),
                                         pop_dense:row[pop_dense],
                                         inf_mor:row[inf_mor],
                                         gdp:row[gdp],
                                         }

    # write new CSV with preprocessed data
    with open(NEW_CSV, 'w', newline='') as outfile:
        writer = csv.writer(outfile)
        writer.writerow([co, re, pop_dense, inf_mor, gdp])

        for country in data_dict:
            region = data_dict[country][re]
            pop_density = data_dict[country][pop_dense]
            inf_mortality = data_dict[country][inf_mor]
            gdp_value = data_dict[country][gdp]

            writer.writerow([country, region, pop_density, \
                            inf_mortality, gdp_value])


def plot_graph(gdp_values ,summary):
    """
    PLots charts of the GDP values and of
    the descriptive values of infant mortality
    """
    # set the y values for the figures
    plt1_x = gdp_values
    plt2_y = summary

    # make figure 1
    plt.figure(1)
    plt.tick_params(
        axis='x',
        which='both',
        bottom=True,
        labelbottom=True
        )
    # set labels and plot
    plt.title('GDP frequency over countries')
    plt.xlabel('GDP')
    plt.ylabel('Frequency')
    plt.hist(plt1_x)

    # make figure 2
    plt.figure(2)
    plt.tick_params(
        axis='x',          # changes apply to the x-axis
        which='both',      # both major and minor ticks are affected
        bottom=False,      # ticks along the bottom edge are off
        labelbottom=False  # labels along the bottom edge are off
        )

    # set labels and plot
    plt.title('Summary of infant mortality')
    plt.boxplot(plt2_y, whis=100)

    plt.show()


def to_json():
    with open('result.json', 'w') as fp:
        json.dump(data_dict, fp)


if __name__ == "__main__":
    preprocess_data()

    # put data into dataframe
    pandas_file = pd.read_csv(NEW_CSV)
    df = pd.DataFrame(pandas_file)

    # take GDP column
    target = df['GDP ($ per capita) dollars']

    # filtering out outliers that are removed more than
    # 2 times the standard deviation
    gdp_mean = int(target.mean())
    gdp_sd = int(target.std())
    selected_df = df[(target > gdp_mean - 2*gdp_sd) & (target < gdp_mean + 2*gdp_sd)]

    target2 = selected_df['GDP ($ per capita) dollars']

    # calculating the new mean, median, mode and standard deviation
    gdp_mean = int(target2.mean())
    gdp_median = int(target2.median())
    gdp_mode = int(target2.mode())
    gdp_sd = int(target2.std())
    print(f"GDP data: median: {gdp_median}, mean: {gdp_mean}, "+ \
    f"mode: {gdp_mode}, std. dev: {gdp_sd}")

    gdp_values = list(target2)

    inf_des = df["Infant mortality (per 1000 births)"].describe()

    min = inf_des["min"]
    first_q = inf_des["25%"]
    median = inf_des["50%"]
    third_q = inf_des["75%"]
    max = inf_des["max"]

    summary = [min, first_q, median, third_q, max]

    plot_graph(gdp_values, summary)

    to_json()
