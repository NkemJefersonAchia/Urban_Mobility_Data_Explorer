#!/bin/bash

echo "Checking dependencies..."

python3 --version > /dev/null 2>&1 || { echo "Error: Python 3 not installed"; exit 1; }
python3 -c "import flask" 2>/dev/null || { echo "Error: flask not installed"; exit 1; }
python3 -c "import flask_cors" 2>/dev/null || { echo "Error: flask-cors not installed"; exit 1; }
python3 -c "import pandas" 2>/dev/null || { echo "Error: pandas not installed"; exit 1; }
python3 -c "import geopandas" 2>/dev/null || { echo "Error: geopandas not installed"; exit 1; }
python3 -c "import shapely" 2>/dev/null || { echo "Error: shapely not installed"; exit 1; }

echo "All dependencies installed."
echo ""
echo "See README.md for setup instructions."
