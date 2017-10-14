# X-Plane Remote Console

## Overview

This is a quick-and-dirty web-based console to monitor X-Plane flights. It uses UDP to receive data from X-Plane, and displays airspeed, altitude and map location through a web interface. It also adds basic interaction options through the web interface (like deploying or retracting speedbrakes).

## Why?

When practicing takeoffs and landings with X-Plane, I noticed that it is impossible to save situation files for 3rd party aircraft, meaning I have to actually do the entire flight over and over again just to get to the landing part. As most of the work prior to approach is done via LNAV/VNAV, I wanted a way to do other stuff around the house, only occasionally monitoring the ongoing flight. This app provides a way to have a laptop or tablet open with the web page displaying the progress, and glance at it every few minutes.

## Requirements

* Python 3.6 or later

## Installation

First, install the Python dependencies:
```
$ python3 -m pip -r ./requirements.txt
```

Now, point X-Plane to send UDP data to the host running the app, to the listening port (which is configurable through command-line, but defaults to port 8888). Enabling data output is done via the configuration screen, under the data output tab. Make sure you check the "Network via UDP" column for *Speeds*, *Lattitude, Longitude and altitude*, and *Trim, flaps, stats and speedbrakes*.

## Running

Just run the server via:
```
$ python3 main.py
```

And point your browser to port 8000 on your host machine.

## License

MIT
