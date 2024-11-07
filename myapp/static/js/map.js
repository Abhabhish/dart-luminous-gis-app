var map = L.map('map', {
    center: [20.5937, 78.9629],
    zoom: 5,
    zoomControl: false // Disable default zoom control
});

var baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

// Add custom zoom control
L.control.zoom({
    position: 'bottomright'
}).addTo(map);

var geoJsonLayerGroup = L.layerGroup().addTo(map);  // Layer group to manage all GeoJSON layers

function clearLayers() {
    geoJsonLayerGroup.clearLayers();  // Clear all layers from the layer group
}

function createCustomMarker(feature, latlng, data) {
    var color = 'green';
    if (data.growth_percentage < 0) {
        color = 'red';
    }
    if (data.growth_percentage === null) {
        color = 'blue';
    }
    var customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="box" style="background-color: ${color};">
                  <table>
                      <tr>
                          <td><strong>${data.district}</strong>, LY: ${data.last_year}Cr, CY: ${data.current_year}Cr, Growth: ${data.growth_percentage}%</td>
                      </tr>
                  </table>
               </div>
               <div class="pointer" style="border-top-color: ${color};"></div>`,
        iconSize: [200, 60],  // Adjust this based on your box size
        iconAnchor: [100, 60]  // Adjust this based on your box size
    });
    return L.marker(latlng, { icon: customIcon });
}

function setDistrictColor(feature) {
    var districtName = feature.properties.DIST_NAME;
    $.getJSON('/api/district-details/' + encodeURIComponent(districtName), function(data) {
        var color = 'green';
        if (data.growth_percentage < 0) {
            color = 'red';
        }
        if (data.growth_percentage === null) {
            color = 'blue';
        }
        var geoJsonLayer = L.geoJSON(feature, {
            style: function() {
                return { color: color, weight: 2, fillOpacity: 0.3 };
            }
        });
        geoJsonLayerGroup.addLayer(geoJsonLayer);  // Add the layer to the layer group

        if (data.last_year !== null) {
            var latlng = geoJsonLayer.getBounds().getCenter();
            var customMarker = createCustomMarker(feature, latlng, data);
            geoJsonLayerGroup.addLayer(customMarker);  // Add the marker to the layer group
        }
    });
}

$(document).ready(function() {
    $('#id_state').change(function() {
        var url = "{% url 'ajax_load_districts' %}";
        var stateId = $(this).val();
        $.ajax({
            url: url,
            data: {
                'state': stateId
            },
            success: function(data) {
                var options = '<option value="">Select District</option>';
                for (var i = 0; i < data.length; i++) {
                    options += '<option value="' + data[i].name + '">' + data[i].name + '</option>';
                }
                $("#id_district").html(options);
            }
        });
    });

    $('#locationForm').submit(function(event) {
        event.preventDefault();
        clearLayers();

        var stateName = $('#id_state option:selected').text();
        var stateId = stateName.toLowerCase().replace(" ", "_");
        var districtName = $('#id_district').val().trim();
        var geoJsonPath = "/static/data/" + stateId + ".geojson";

        if (districtName === "") {
            // No district selected, draw boundaries for all districts in the state
            $.getJSON('/api/state-districts/' + encodeURIComponent(stateName), function(data) {
                var districtNames = data.districts;
                var districtFeatures = [];

                $.getJSON(geoJsonPath, function(geoJsonData) {
                    for (var i = 0; i < districtNames.length; i++) {
                        var features = geoJsonData.features.filter(function(feature) {
                            return feature.properties.DIST_NAME.trim() === districtNames[i].trim();
                        });
                        districtFeatures = districtFeatures.concat(features);
                    }

                    if (districtFeatures.length > 0) {
                        districtFeatures.forEach(function(feature) {
                            setDistrictColor(feature);
                        });
                        map.fitBounds(L.geoJSON(districtFeatures).getBounds());
                    } else {
                        alert("No districts found in GeoJSON file for the selected state");
                    }
                }).fail(function() {
                    alert("GeoJSON file not found for the selected state");
                });

                // Fetch table data for all districts
                $.getJSON('/api/state-district-details/' + encodeURIComponent(stateName), function(data) {
                    updateTable(data);
                });

            });
        } else {
            // District selected, draw boundary for the selected district
            $.getJSON(geoJsonPath, function(data) {
                var districtFeature = data.features.filter(function(feature) {
                    return feature.properties.DIST_NAME.trim() === districtName;
                });

                if (districtFeature.length > 0) {
                    setDistrictColor(districtFeature[0]);
                    map.fitBounds(L.geoJSON(districtFeature).getBounds());
                } else {
                    alert("District not found in GeoJSON file");
                }
            }).fail(function() {
                alert("GeoJSON file not found for the selected state");
            });

            // Fetch table data for the selected district
            $.getJSON('/api/district-details/' + encodeURIComponent(districtName), function(data) {
                updateTable([data]);
            });
        }
    });

    function updateTable(data) {
        var tableBody = $('#tableBody');
        tableBody.empty(); // Clear the table body

        data.forEach(function(item) {
            var row = '<tr>' +
                '<td>' + item.state + '</td>' +
                '<td>' + item.district + '</td>' +
                '<td>' + item.last_year + '</td>' +
                '<td>' + item.current_year + '</td>' +
                '<td>' + item.growth_percentage + '</td>' +
                '</tr>';
            tableBody.append(row);
        });
    }
});
