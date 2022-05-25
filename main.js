/* Wetterstationen Tirol Beispiel */

let innsbruck = {
    lat: 47.267222,
    lng: 11.392778,
    zoom: 11
};

// WMTS Hintergrundlayer von https://lawinen.report (CC BY avalanche.report) als Startlayer
let startLayer = L.tileLayer("https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
    attribution: '&copy; <a href="https://lawinen.report">CC BY avalanche.report</a>'
})

// Overlays Objekt für die thematischen Layer
let overlays = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
    humidity: L.featureGroup(),
    snowheight: L.featureGroup(),
    wind: L.featureGroup(),
};

// Karte initialisieren
let map = L.map("map", {
    center: [innsbruck.lat, innsbruck.lng],
    zoom: innsbruck.zoom,
    layers: [
        startLayer
    ],
});

// Layer control mit WMTS Hintergründen und Overlays
let layerControl = L.control.layers({
    "Relief avalanche.report": startLayer,
    "Esri World Imagery": L.tileLayer.provider("Esri.WorldImagery"),
}, {
    "Wetterstationen": overlays.stations,
    "Temperatur": overlays.temperature,
    "Relative Luftfeuchtigkeit": overlays.humidity,
    "Schneehöhe": overlays.snowheight,
    "Wind": overlays.wind,
}).addTo(map);

// Layer control ausklappen
layerControl.expand();

// Maßstab control
L.control.scale({
    imperial: false
}).addTo(map);

// Fullscreen control
L.control.fullscreen().addTo(map);

// Layer beim Laden der Seite als erstes anzeigen - da wir anfangs daraan gearbeitet haben
overlays.stations.addTo(map);

// Farben nach Wert und Schwellen ermitteln
let getColor = function (value, ramp) {
    console.log(value, ramp);
    for (let rule of ramp) {
        console.log(rule);
        if (value >= rule.min && value < rule.max) {
            return rule.color;
        }
    }
};
//console.log(getColor(-40, COLORS.temperature))
// temperature in colors.js definiert

// Wetterstationen mit Icons und Popups
let drawStations = function (geojson) {

    L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            let popup = `
            <strong>Name</strong>: ${geoJsonPoint.properties.name}<br>
            <strong>Meereshöhe</strong>: ${geoJsonPoint.geometry.coordinates[2]} m üNN <br><br>
            <strong>Lufttemperatur</strong> = ${geoJsonPoint.properties.LT}°C <br>
            <strong> Schneehöhe</strong> = ${geoJsonPoint.properties.HS} cm <br>
            <strong>Windgeschwindigeit</strong> = ${(geoJsonPoint.properties.WG*3.6).toFixed(1)} km/h <br>
            <strong>Windrichtung</strong> = ${geoJsonPoint.properties.WR} ° <br>
            <strong>Relative Luftfeuchtigkeit</strong> = ${geoJsonPoint.properties.RH} % <br>
            <a href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/dreitage/${geoJsonPoint.properties.plot}.png">Weblink</a>
        `
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/wifi.png",
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            }).bindPopup(popup);
        }
    }).addTo(overlays.stations);
}

//Temperatur
let drawTemperature = function (geojson) {
    L.geoJSON(geojson, {
        filter: function (geoJsonPoint) {
            if (geoJsonPoint.properties.LT > -50 && geoJsonPoint.properties.LT < 50) {
                return true;
            }
        },
        pointToLayer: function (geoJsonPoint, latlng) {
            let popup = `
            <strong>Relative Luftfeuchtigkeit</strong><br><br>
            <strong>Wetterstation:</strong><br>
            <strong>Name</strong>: ${geoJsonPoint.properties.name}<br>
            <strong>Meereshöhe</strong>: ${geoJsonPoint.geometry.coordinates[2]} m üNN
        `
            // Farbe aufrufen auf getColor (s.oben) für jeden wert die passende Farbe
            let color = getColor(
                geoJsonPoint.properties.LT,
                COLORS.temperature,
            );
            //console.log(geoJsonPoint.properties.LT, color);

            // Marker nur, damit ich weiß, wo der Marker genau sitzt
            //L.marker(latlng).addTo(map);

            // divIcon 

            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style = "background-color: ${color}">${geoJsonPoint.properties.LT.toFixed(1)}</span>`
                })
                // aws = Automatische Wetterstationen
                // span : Inhalt wird einfach auf Karte geschrieben (mit style Farbeninhalt im CSS-Stil)
                // Formatierung im main.css
                // toFixed(1): Nachkommastellen > Problem: undefined
            }).bindPopup(popup);
        }
    }).addTo(overlays.temperature);
}

//Schneehöhen
let drawSnowheight = function (geojson) {
    L.geoJSON(geojson, {
        filter: function (geoJsonPoint) {
            if (geoJsonPoint.properties.HS >= 0 && geoJsonPoint.properties.HS < 1500) {
                return true;
            }
        },
        pointToLayer: function (geoJsonPoint, latlng) {
            let popup = `
            <strong>Relative Luftfeuchtigkeit</strong><br><br>
            <strong>Wetterstation:</strong><br>
            <strong>Name</strong>: ${geoJsonPoint.properties.name}<br>
            <strong>Meereshöhe</strong>: ${geoJsonPoint.geometry.coordinates[2]} m üNN
        `
            // Farbe aufrufen auf getColor (s.oben) für jeden wert die passende Farbe
            let color = getColor(
                geoJsonPoint.properties.HS,
                COLORS.snowheight,
            );
            //console.log(geoJsonPoint.properties.HS, color);

            // Marker nur, damit ich weiß, wo der Marker genau sitzt
            //L.marker(latlng).addTo(map);

            // divIcon 

            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style = "background-color: ${color}">${geoJsonPoint.properties.HS.toFixed(1)}</span>`
                })
                // aws = Automatische Wetterstationen
                // span : Inhalt wird einfach auf Karte geschrieben (mit style Farbeninhalt im CSS-Stil)
                // Formatierung im main.css
                // toFixed(1): Nachkommastellen > Problem: undefined
            }).bindPopup(popup);
        }
    }).addTo(overlays.snowheight);
}

//Wind
let drawWind = function (geojson) {
    L.geoJSON(geojson, {
        filter: function (geoJsonPoint) {
            if (geoJsonPoint.properties.WG >= 0 && geoJsonPoint.properties.WG < 1500 &&
                geoJsonPoint.properties.WR >= 0 && geoJsonPoint.properties.WR <= 360) {
                return true;
            }
        },
        pointToLayer: function (geoJsonPoint, latlng) {
            let popup = `
            <strong>Relative Luftfeuchtigkeit</strong><br><br>
            <strong>Wetterstation:</strong><br>
            <strong>Stationsname</strong>: ${geoJsonPoint.properties.name}<br>
            <strong>Meereshöhe</strong>: ${geoJsonPoint.geometry.coordinates[2]} m üNN
        `
            // Farbe aufrufen auf getColor (s.oben) für jeden wert die passende Farbe
            let color = getColor(
                geoJsonPoint.properties.WG,
                COLORS.wind,
            );
            //console.log(geoJsonPoint.properties.HS, color);

            // Marker nur, damit ich weiß, wo der Marker genau sitzt
            //L.marker(latlng).addTo(map);

            // divIcon 
            let deg = geoJsonPoint.properties.WR;
            //console.log(deg);

            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style = "background-color: ${color}; transform: rotate(${deg}deg)"
                    <i class="fas fa-arrow-up"></i> <br>
                    <br>
                    ${geoJsonPoint.properties.WG.toFixed(0)}</span>`
                })
                // aws = Automatische Wetterstationen
                // span : Inhalt wird einfach auf Karte geschrieben (mit style Farbeninhalt im CSS-Stil)
                // Formatierung im main.css
                // toFixed(1): Nachkommastellen > Problem: undefined
                // arrow aus fontawesome.com <i class="fas fa-arrow-up"></i> 
            }).bindPopup(popup);
        }
    }).addTo(overlays.wind);
}

//rel. Luftfeuchtigkeit
let drawHumidity = function (geojson) {
    L.geoJSON(geojson, {
        filter: function (geoJsonPoint) {
            if (geoJsonPoint.properties.RH >= 0 && geoJsonPoint.properties.RH < 1500) {
                return true;
            }
        },
        pointToLayer: function (geoJsonPoint, latlng) {
            let popup = `
            <strong>Relative Luftfeuchtigkeit</strong><br><br>
            <strong>Wetterstation:</strong><br>
            <strong>Name</strong>: ${geoJsonPoint.properties.name}<br>
            <strong>Meereshöhe</strong>: ${geoJsonPoint.geometry.coordinates[2]} m üNN
        `
            // Farbe aufrufen auf getColor (s.oben) für jeden wert die passende Farbe
            let color = getColor(
                geoJsonPoint.properties.RH,
                COLORS.humidity,
            );

            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style = "background-color: ${color}">${geoJsonPoint.properties.RH.toFixed(1)}</span>`
                })
            }).bindPopup(popup);
        }
    }).addTo(overlays.humidity);
}

//Rainviewer einbauen
L.control.rainviewer({ 
    position: 'bottomleft',
    nextButtonText: '>',
    playStopButtonText: 'Play/Stop',
    prevButtonText: '<',
    positionSliderLabelText: "Hour:",
    opacitySliderLabelText: "Opacity:",
    animationInterval: 500,
    opacity: 0.5
}).addTo(map);

// async function -Ausführung, wenn alle Daten geladen wurden
async function loadData(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    // Wetterstationen, Temperature, .... aufrufen - sonst wird die Funktion nicht aufgerufen und angezeigt
    drawStations(geojson);
    drawTemperature(geojson);
    drawSnowheight(geojson);
    drawWind(geojson);
    drawHumidity(geojson);
}

loadData("https://static.avalanche.report/weather_stations/stations.geojson");


// Draw Temperatur als Kopie der Draw Stations