/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var admin2 = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2"),
    modisLandTemp = ee.ImageCollection("MODIS/061/MOD11A1"),
    modisLandTemp8 = ee.ImageCollection("MODIS/061/MOD11A2");
/***** End of imports. If edited, may not auto-convert in the playground. *****/


var delhiShape = admin2.filter(ee.Filter.eq('ADM2_NAME', 'Delhi'));

var filteredModisLandTemp = modisLandTemp8
  .filterBounds(delhiShape)
  .filterDate('2010-01-01', '2022-12-31');

var filteredModisLandTemp = filteredModisLandTemp.map(function(image){
  return image.multiply(0.02).copyProperties(image,['system:time_start']);
})

var timeSeries = filteredModisLandTemp
  .map(function(image) {
    var temperature = image.select('LST_Day_1km')
      .reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: delhiShape,
        scale: 1000,
        maxPixels: 1e13
      }).get('LST_Day_1km');
    return ee.Feature(null, {'temperature': temperature, 'date': image.date().format()});
});

print(timeSeries);

// Export.table.toDrive({
//   collection: timeSeries,
//   description: 'modis_land_temp',
//   fileFormat: 'CSV'
// });