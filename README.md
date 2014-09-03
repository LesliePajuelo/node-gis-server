Node GIS Server
============

In support of AGIC Symposium 2014 presentation: https://github.com/tooshel/agic2014

Node.js application to provide a GeoJSON-based REST interface to PostGIS data.

This code is based on code originally released by Bill Dollins, as described here: http://blog.geomusings.com/2014/02/18/a-little-deeper-with-node-and-postgis

This code is designed to run on Google Compute Engine using a backports wheezy Debian instance. startupscript.sh installs all the dependencies, creates the database, downloads country border data from http://naturalearthdata.com and loads it into the database. This can take several minutes. You can monitor progress in /var/log/startupscript.log.

To run the server, run node server from the /src/node-gis-server directory. It will then be available at your IP address. countryclick.html displays a map. When you click on a country it loads the boundary data and displays it on the map using.

before you run the startup script, change all instances of "manotest" to your own database name, and all instances of "mmarks" to your own username on Compute Engine.


See package.json for dependencies.

