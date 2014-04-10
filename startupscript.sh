#! /bin/bash
cd /home/mmarks
sudo apt-get -y install build-essential
sudo apt-get -y install build-essential postgresql-9.1 postgresql-server-dev-9.1 libxml2-dev libproj-dev libjson0-dev libgeos-dev xsltproc docbook-xsl docbook-mathml
sudo apt-get -y install libproj-dev
sudo apt-get -y install libgdal-dev
wget http://download.osgeo.org/postgis/source/postgis-2.0.4.tar.gz
tar xfz postgis-2.0.4.tar.gz
cd postgis-2.0.4
./configure
make
sudo make install
sudo ldconfig
sudo make comments-install
sudo ln -sf /usr/share/postgresql-common/pg_wrapper /usr/local/bin/shp2pgsql
sudo ln -sf /usr/share/postgresql-common/pg_wrapper /usr/local/bin/pgsql2shp
sudo ln -sf /usr/share/postgresql-common/pg_wrapper /usr/local/bin/raster2pgsql
sudo apt-get -y install gdal-bin
sudo apt-get -y install python-gdal
sudo apt-get -y install git
cd /home/mmarks
wget https://s3.amazonaws.com/json-c_releases/releases/json-c-0.11-nodoc.tar.gz
tar xfz json-c-0.11-nodoc.tar.gz
cd json-c-0.11
./configure
make
make check
sudo make install
sudo apt-get -y install python g++ make checkinstall
src=$(mktemp -d) && cd $src
wget -N http://nodejs.org/dist/node-latest.tar.gz
tar xzvf node-latest.tar.gz && cd node-v*
./configure
fakeroot checkinstall -y --install=no --pkgversion $(echo $(pwd) | sed -n -re's/.+node-v(.+)$/\1/p') make -j$(($(nproc)+1)) install
sudo dpkg -i node_*
sudo apt-get -y install unzip
sudo apt-get -y install libpq-dev
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
cd /home/mmarks
sudo -u postgres createuser root -s
createdb manotest
psql manotest -c "CREATE EXTENSION POSTGIS;"
echo "tried to create extension"
psql manotest -c "ALTER USER postgres WITH PASSWORD 'postgres';"
echo "tried to alter password"
#change manotest to your database name
cd /home/mmarks
sudo mkdir data
cd data
wget http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/110m/cultural/110m_cultural.zip
unzip 110m_cultural.zip
cd 110m_cultural
#change manotest to your database name
ogr2ogr -t_srs EPSG:4326 -f PostgreSQL -overwrite -lco GEOMETRY_NAME=wkb_geometry -lco ENCODING="Windows 1252" -clipsrc -180 -85.05112878 180 85.05112878 -nlt MULTIPOLYGON -nln countries   PG:"dbname='manotest' " ne_110m_admin_0_countries.shp
cd /home/mmarks
mkdir src
cd src
sudo git clone http://github.com/ManoMarks/node-gis-server.git
cd node-gis-server
sudo npm install
#node server
