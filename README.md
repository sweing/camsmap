# CAMS Map

Hosted [here](https://www.nebulaverse.space/camsmap).

![Screenshot](screenshot.jpg)

## Introduction

Nitrogen dioxide (NO2), a byproduct of burning fossil fuels, can serve as a visible marker of our climate emergency. As these fuels are burned, NO2 is released into the atmosphere, alongside CO2, exacerbating climate change. Understanding this connection can give us opportunities in our efforts to combat the environmental crisis we face.

So why we use NO2 and not CO2 directly? NO2 plays a central role in air quality and has been used to identify fossil fuel hot-spots. It is a gas created by incomplete combustion, is short-living and dissolves already hours after release. As a result, this pollutant tends to remain in close proximity to its emission sources, causing concentrations to rapidly fluctuate when there are changes in those sources. As such, it is also a very powerful indicator for local pollution. Exposure to nitrogen oxides can lead to a higher probability of respiratory problems and asthma. Thus, the burning of fossil fuels is not only a global problem, but also a local one.

By decreasing NO2 emissions, we not only improve air quality and protect human health but also address the root cause of climate change. This knowledge empowers us to take decisive action and implement measures that can mitigate the adverse impacts of greenhouse gas emissions.

This small project asks the following question: Wouldn't it be valuable to have an indicator that tracks and rewards cities for their efforts in reducing NO2 emissions? How can we measure progress in reducing NO2 levels over time? Imagine a friendly competition that celebrates the cities making the most significant strides in NO2 reduction. Let's explore how this indicator could inspire progress and shape our environmental landscape. 

## Data

The dataset provides information on air quality in Europe and worldwide, based on satellite and ground-based observations and advanced numerical models. The dataset is produced by the Copernicus Atmosphere Monitoring Service (CAMS), which is part of the European Union’s Earth observation programme. It is available on [GitHub](https://github.com/CopernicusAtmosphere/air-quality-covid19-response)

## Run
```bash
# Create and activate virtual environment:
python -m env env
. env/bin/activate

# Install required packages:
pip install -r requirements.txt

# Run dev server, served to ip:port/camsmap
python ./app.py
```