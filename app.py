#!/usr/bin/env python3.6
import os
from flask import Flask, render_template, jsonify
import json
import pandas as pd

app = Flask(__name__, static_url_path='/camsmap/static')

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['TEMPLATES_AUTO_RELOAD'] = True

@app.route('/camsmap')
def get_data():
    data = pd.read_csv('static/data/data.csv')

    # Calculate the bounding box coordinates
    min_lat = data['lat'].min()
    max_lat = data['lat'].max()
    min_lng = data['lng'].min()
    max_lng = data['lng'].max()

    # Create a dictionary with the bounding box coordinates
    bounds = {
        'minLat': min_lat,
        'maxLat': max_lat,
        'minLng': min_lng,
        'maxLng': max_lng
    }

    # Extract the variable names (columns) except for 'city', 'lat', 'lng', 'year'
    variables = [col for col in data.columns if col not in ['city', 'lat', 'lng', 'year']]

    # Serve the processed data to the front end
    data_json = data.to_json(orient='records')

    # Extract unique years and months
    data['year'] = pd.to_datetime(data['year'])
    years = sorted(data['year'].dt.year.unique(), reverse=True)
    months = sorted(data['year'].dt.month.unique())

    max_year = data['year'].dt.year.max()
    max_year_data = data[data['year'].dt.year == max_year]
    last_month = max_year_data['year'].dt.month.max()

    # return the index file and the data
    return render_template("index.html", data=data_json, variables=variables, years=years, months=months, last_month = last_month, max_year = max_year, bounds=json.dumps(bounds))


if __name__ == "__main__":
  app.run(host='0.0.0.0', port=1024, debug=True)