from flask import Flask, render_template, jsonify
import json
import pandas as pd

app = Flask(__name__)

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['TEMPLATES_AUTO_RELOAD'] = True

@app.route('/')
def get_data():
    data = pd.read_csv('static/data/data.csv')

    # Extract the variable names (columns) except for 'city', 'lat', 'lng', 'year'
    variables = [col for col in data.columns if col not in ['city', 'lat', 'lng', 'year']]

    # Serve the processed data to the front end
    data_json = data.to_json(orient='records')

    # Extract unique years and months
    data['year'] = pd.to_datetime(data['year'])
    years = sorted(data['year'].dt.year.unique())
    months = sorted(data['year'].dt.month.unique())

    max_year = data['year'].dt.year.max()
    max_year_data = data[data['year'].dt.year == max_year]
    last_month = max_year_data['year'].dt.month.max()

    # return the index file and the data
    return render_template("index.html", data=data_json, variables=variables, years=years, months=months, last_month = last_month, max_year = max_year)


if __name__ == '__main__':
    app.run()