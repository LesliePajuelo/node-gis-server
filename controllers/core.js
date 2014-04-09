var pg = require('pg');
var geojson = require('../helpers/geojson');
var jsonp = require('../helpers/jsonp');
module.exports.controller = function (app) {

	/* enable CORS */
	app.all('*', function (req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		next();
	});

	/* feature retrieval */

	/**
	 * retrieve all features (this could be really slow and is probably not what you really want to do)
	 */

app.get('/vector/:schema/:table/:geom/intersect', function (req, res, next) {
  var queryshape= ' {"type": "Point", "coordinates": [' + req.query['lng']  + ',' + req.query['lat']  +'] }'
		var geom = req.params.geom.toLowerCase();
		if ((geom != "features") && (geom != "geometry")) {
			res.status(404).send("Resource '" + geom + "' not found");
			return;
		}
		var client = new pg.Client(app.conString);
		var schemaname = req.params.schema;
		var tablename = req.params.table;
		var fullname = schemaname + "." + tablename;
		client.connect();
		var idformat = "'" + req.params.id + "'";
		idformat = idformat.toUpperCase();
		var spatialcol = "wkb_geometry";
    // var meta = client.query("select * from " + tablename + ";");
		var sql;
		// meta.on('row', function (row) {
			var query;
			var coll;
			if (geom == "features") {
				sql = "select st_asgeojson(st_transform(" + spatialcol + ",4326)) as geojson, * from " + tablename + " where ST_INTERSECTS(" + spatialcol + ", ST_SetSRID(ST_GeomFromGeoJSON('" + queryshape + "'),4326));"
				query = client.query(sql);
                        	coll = {
					type : "FeatureCollection",
					features : []
				};
			} else if (geom == "geometry") {
				sql = "select st_asgeojson(st_transform(" + spatialcol + ",4326)) as geojson from " + tablename + " where ST_INTERSECTS(" + spatialcol + ", ST_SetSRID(ST_GeomFromGeoJSON('" + queryshape + "'),4326));"
				query = client.query(sql);
				coll = {
					type : "GeometryCollection",
					geometries : []
				};
			}

			query.on('row', function (result) {
				console.log('here');
				var props = new Object;
				if (!result) {
					return res.send('No data found');
				} else {
					if (geom == "features") {
						coll.features.push(geojson.getFeatureResult(result, spatialcol));
					} else if (geom == "geometry") {
						var shape = JSON.parse(result.geojson);
						coll.geometries.push(shape);
					}
				}
			});

			query.on('end', function (result) {
				console.log(result);
				res.send(jsonp.getJsonP(req.query.callback, coll));
                                client.end();

			});
			query.on('error', function (error) {
                                client.end();
				//handle the error
				//res.status(500).send(error);
				//next();
			});

		// });
	});
// 	app.get('/vector/:schema/:table/:geom', function (req, res, next) {
// 		var client = new pg.Client(app.conString);
// 		var geom = req.params.geom.toLowerCase();
// 		if ((geom != "features") && (geom != "geometry")) {
// 			res.status(404).send("Resource '" + geom + "' not found");
// 			return;
// 		}
// 		var schemaname = req.params.schema;
// 		var tablename = req.params.table;
// 		var fullname = schemaname + "." + tablename;
//                 var proptype = req.query.type;
// 		var whereclause = ";";
// 		if (typeof proptype != "undefined") {
// 			if (proptype.toLowerCase() != "all") {
// 				whereclause = " where structure_ = '" + proptype + "';";
// 			}
// 		}
// 		var coll;
// 		var sql = "";
// 		client.connect(function (err) {
// 			if (err) {
// 				res.status(500).send(err);
// 				client.end();
// 				return console.error('could not connect to postgres', err);
// 			}
// 			client.query("select * from " + tablename + ";", function (err, result) {
// 				if (err) {
// 					res.status(500).send(err);
// 					client.end();
// 					return console.error('error running query', err);
// 				}
// 				spatialcol = result.rows[0].wkb_geometry;
// 				if (geom == "features") {
//                                         sql = "select st_asgeojson(st_transform(wkb_geometry,4326)) as geojson, * from " + tablename + ";";
// 					//sql = "select st_asgeojson(st_transform(" + spatialcol + ",4326)) as geojson, * from " + fullname + whereclause;
//                                         //if(tablename == 'uk') sql = "select st_asgeojson(wkb_geometry) as geojson, * from " + tablename + " limit 100;";
//                                         //console.log(sql);
// 					coll = {
// 						type : "FeatureCollection",
// 						features : []
// 					};
// 				} else if (geom == "geometry") {
//                                         sql = "select st_asgeojson(st_transform(wkb_geometry,4326)) as geojson, * from " + tablename + ";";
//                                         //console.log(sql);
// 						coll = {
// 						type : "GeometryCollection",
// 						geometries : []
// 					};
// 				}
// 				client.query(sql, function (err, result) {
// 					if (err) {
// 						res.status(500).send(err);
// 						client.end();
// 						return console.error('error running query', err);
// 					}
// 					for (var i = 0; i < result.rows.length; i++) {
// 						if (geom == "features") {
// 							coll.features.push(geojson.getFeatureResult(result.rows[i], "shape"));
// 						} else if (geom == "geometry") {
// 							var shape = JSON.parse(result.rows[i].geojson);
// 							//shape.crs = crsobj;
// 							coll.geometries.push(shape);
// 						}
// 					}
// 					client.end();
// 					res.send(jsonp.getJsonP(req.query.callback, coll));

// });
// });
// });
// });



		var client = new pg.Client(app.conString);
}
