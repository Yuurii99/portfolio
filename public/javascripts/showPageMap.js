maptilersdk.config.apiKey = mapToken;

const map = new maptilersdk.Map({
  container: 'map', // container's id or the HTML element in which the SDK will render the map
  style: maptilersdk.MapStyle.STREETS,
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 10 // starting zoom
});

new maptilersdk.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new maptilersdk.Popup({ offset: 25 })
    .setHTML(`<h5>${campground.title}</h5><p>${campground.location}</p>`)
  )
  .addTo(map);