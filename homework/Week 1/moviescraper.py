#!/usr/bin/env python
# Name: Matthew Finnegan
# Student number: 10698485
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

TARGET_URL = "https://www.imdb.com/search/title?title_type=feature&release_date=2008-01-01,2018-01-01&num_votes=5000,&sort=user_rating,desc"
BACKUP_HTML = 'movies.html'
OUTPUT_CSV = 'movies.csv'


def extract_movies(dom):
    """
    Extract a list of highest rated movies from DOM (of IMDB page).
    Each movie entry should contain the following fields:
    - Title
    - Rating
    - Year of release (only a number!)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """

    film_containers = dom.find_all('div', class_ = 'lister-item mode-advanced')

    movies = []

    for film in film_containers:
        # scrape the title
        title = film.h3.a.text

        # scrape the rating
        rating = film.strong.text

        # scrape the year of release, eliminating all but the year
        year = film.h3.find('span',class_='lister-item-year').string[-5:-1]

        # scrape the Actors
        actor_string = ''
        names = []
        actors_list = film.select('a[href*="adv_li_st_"]')
        # if no actors, put 'No actors'
        if len(actors_list) == 0:
            actor_string = 'No actors'
        # put actors_list into one actor string
        else:
            for actor in actors_list:
                names.append(actor.text)

        actor_string = ",".join(names)

        # scrape the runtime, leaving just the numbers
        runtime = film.find(class_='runtime').text[0:3]

        movie = [title, rating, year, actor_string, runtime]
        movies.append(movie)
    return movies


def save_csv(outfile, movies):
    """
    Output a CSV file containing highest rated movies.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Year', 'Actors', 'Runtime'])

    for movie in movies:
        writer.writerow([movie[0], movie[1], movie[2], movie[3], movie[4]])


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as a backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the movies (using the function you implemented)
    movies = extract_movies(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, movies)
