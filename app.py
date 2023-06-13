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
    
    data['year'] = pd.to_datetime(data['year'])

    # Extract unique years and months
    
    years = sorted(data['year'].dt.year.unique(), reverse=True)
    months = sorted(data['year'].dt.month.unique())

    max_year = data['year'].dt.year.max()
    max_year_data = data[data['year'].dt.year == max_year]
    last_month = max_year_data['year'].dt.month.max()

    # Determine the winner for each month
    data['winner_month'] = ""
    for year in data['year'].dt.year.unique():
        for month in data['year'].dt.month.unique():
            month_data = data[(data['year'].dt.year == year) & (data['year'].dt.month == month)]
            if month_data['year'].dt.month.max() == month and month_data['year'].dt.year.max() != pd.to_datetime('today').year:
                last_day_data = month_data[month_data['year'] == month_data['year'].max()]
                if len(last_day_data) > 0:
                    min_monthly_index = last_day_data['Monthly Index Race'].min()
                    winner_city_month = last_day_data[last_day_data['Monthly Index Race'] == min_monthly_index]['city'].values[0]
                    data.loc[(data['year'].dt.year == year) & (data['year'].dt.month == month), 'winner_month'] = winner_city_month

    # Determine the winner for each year
    data['winner_year'] = ""
    for year in data['year'].dt.year.unique():
        year_data = data[data['year'].dt.year == year]
        if year_data['year'].dt.year.max() != pd.to_datetime('today').year:
            last_day_data = year_data[year_data['year'] == year_data['year'].max()]
            if len(last_day_data) > 0:
                min_yearly_index = last_day_data['Yearly Index Race'].min()
                winner_city_year = last_day_data[last_day_data['Yearly Index Race'] == min_yearly_index]['city'].values[0]
                data.loc[data['year'].dt.year == year, 'winner_year'] = winner_city_year



    data['year'] = data['year'].dt.strftime('%Y-%m-%d')
    # Serve the processed data to the front end
    data_json = data.to_json(orient='records')

    # return the index file and the data
    return render_template("index.html", data=data_json, variables=variables, years=years, months=months, last_month = last_month, max_year = max_year, bounds=json.dumps(bounds))


if __name__ == "__main__":
  app.run(host='0.0.0.0', port=1024, debug=True)