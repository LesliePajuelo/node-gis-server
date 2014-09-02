var pg = require('pg');
var geojson = require('../helpers/geojson');
var jsonp = require('../helpers/jsonp');
var settings = require('../settings');

module.exports.controller = function(app) {

  /* enable CORS */
  app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
  });

  app.get('/vector/:schema/:table/:geom/intersect', function(req, res, next) {
    var queryshape = ' {"type": "Point", "coordinates": [' + req.query['lng'] + ',' + req.query['lat'] + '] }';
    var geom = req.params.geom.toLowerCase();
    if ((geom != 'features') && (geom != 'geometry') && (geom != 'all')) {
      res.status(404).send("Resource '" + geom + "' not found");
      return;
    }
    var schemaname = req.params.schema;
    var tablename = req.params.table;
    var fullname = schemaname + '.' + tablename;
    pg.connect(settings.database, function(err, client, done) {
      var spatialcol = 'wkb_geometry';
      var sql;
      var coll;
      if (geom == 'features') {
        sql = 'select st_asgeojson(st_transform(' + spatialcol + ',4326)) as geojson, * from ' + tablename + ' where ST_INTERSECTS(' + spatialcol + ", ST_SetSRID(ST_GeomFromGeoJSON('" + queryshape + "'),4326));";
        coll = {
          type: 'FeatureCollection',
          features: []
        };
        query = client.query(sql);
      }

      if (geom == 'all') {
        sql = 'select st_asgeojson(st_transform(' + spatialcol + ',4326)) as geojson, * from ' + tablename;
        coll = {
          type: 'FeatureCollection',
          features: []
        };
        query = client.query(sql);
      }

      query.on('row', function(result) {
        var props = new Object;
        if (!result) {
          return res.send('No data found');
        }
        else {
          if (geom == 'features' ||  geom == 'all') {
            coll.features.push(geojson.getFeatureResult(result, spatialcol));
          } else if (geom == 'geometry') {
            var shape = JSON.parse(result.geojson);
            coll.geometries.push(shape);
          }
        }
      });

      query.on('end', function(err, result) {
        res.setHeader('Content-Type', 'application/json');
        res.send(jsonp.getJsonP(req.query.callback, coll));
        done();
      });
    });
  });
  app.get('/neighbor/:schema/:table/:geom/intersect', function(req, res, next) {
    var queryshape = "'SRID=4326;POINT(" + req.query['lng'] +' ' + req.query['lat'] + ")'";
    var geom = req.params.geom.toLowerCase();
    if ((geom != 'features') && (geom != 'geometry')) {
      res.status(404).send("Resource '" + geom + "' not found");
      return;
    }
    var schemaname = req.params.schema;
    var tablename = req.params.table;
    var fullname = schemaname + '.' + tablename;
    pg.connect(settings.database, function(err, client, done) {
      var spatialcol = 'wkb_geometry';
      var sql;
      var coll;
      if (geom == 'features') {
        sql = 'SELECT ST_AsGeoJson(ST_Transform(b.' + spatialcol + ',4326)) as geojson, * from ' + tablename + ' as a, ' + tablename + ' as b where st_distance(a.' + spatialcol + ',b.' + spatialcol + ') < .00005 and ST_INTERSECTS(a.' + spatialcol + ', ST_GeographyFromText(' + queryshape + '));'
        //sql = 'SELECT ST_AsGeoJson(ST_Transform(b.' + spatialcol + ',4326)) as geojson, * from ' + tablename + ' as a, ' + tablename + ' as b where st_touches(a.' + spatialcol + ',b.' + spatialcol + ') and ST_INTERSECTS(a.' + spatialcol + ', ST_GeographyFromText(' + queryshape + '));'
        coll = {
          type: 'FeatureCollection',
          features: []
        };
        query = client.query(sql);
      }

      query.on('row', function(result) {
        var props = new Object;
        if (!result) {
          return res.send('No data found');
        }
        else {
          if (geom == 'features') {
            coll.features.push(geojson.getFeatureResult(result, spatialcol));
          } else if (geom == 'geometry') {
            var shape = JSON.parse(result.geojson);
            coll.geometries.push(shape);
          }
        }
      });

      query.on('end', function(err, result) {
        res.setHeader('Content-Type', 'application/json');
        res.send(jsonp.getJsonP(req.query.callback, coll));
        done();
      });
    });
  });

};