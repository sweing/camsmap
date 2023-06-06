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


    # return the index file and the data
    return render_template("index.html", data=data_json, variables=variables)


if __name__ == '__main__':
    app.run()