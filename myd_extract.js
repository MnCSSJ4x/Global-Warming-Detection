/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var admin2 = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// ee.ImageCollection("MODIS/061/MYD11A1")
var geometry = admin2.filter(ee.Filter.eq('ADM2_NAME', 'Delhi'));
// ee.ImageCollection('MODIS/061/MOD11A2')
// Load the MODIS Terra Land Surface Temperature and Emissivity dataset
var modisLandTemp = ee.ImageCollection("MODIS/061/MYD11A1")
  .select('LST_Day_1km') // select the land surface temperature band
  .filterDate('2010-01-15', '2022-12-31') // filter the date range
  .filterBounds(geometry); // filter the region of interest

var modisLandTemp = modisLandTemp.map(function(image){
  return image.multiply(0.02).copyProperties(image,['system:time_start']);
}); 

// Define a function to extract the temperature data for each image
var extractTemperature = function(image) {
  // Get the date of the image
  var date = image.date().format('YYYY-MM-dd');
  // Compute the mean temperature in the region of interest
  var temperature = image.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: geometry,
    scale: 1000,
    maxPixels: 1e13
  }).get('LST_Day_1km');
  // Return a dictionary with the date and temperature values
  return ee.Feature(null,{'date': date, 'temperature': temperature});
};

// Map over the image collection to extract the temperature data for each image
var temperatureTimeSeries = modisLandTemp.map(extractTemperature);

// Print the time series
print(temperatureTimeSeries);

Export.table.toDrive({
  collection: temperatureTimeSeries,
  description: 'modis_land_temp',
  fileFormat: 'CSV'
});