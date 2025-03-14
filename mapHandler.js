export async function loadMapData(map) {
    try {
        console.log("Fetching locations from Supabase...");
        const locations = await fetchLocations();
        console.log("Locations received:", locations);

        locations.forEach((location) => {
            if (!location.geom) {
                console.warn("Skipping location with missing geometry:", location);
                return;
            }

            console.log("Raw Geometry Data:", location.geom); // ✅ Debugging

            let shape; // Store marker or polygon

            // ✅ If "Point", add a marker
            if (location.geom.type === "Point") {
                if (!location.geom.coordinates) {
                    console.error("Point is missing coordinates:", location);
                    return;
                }
                let [lng, lat] = location.geom.coordinates;
                console.log(`Adding Marker at: ${lat}, ${lng}`); // ✅ Debugging
                shape = L.marker([lat, lng], { icon: customIcon }).addTo(map);
            }

            // ✅ If "Polygon", draw a polygon
            else if (location.geom.type === "Polygon") {
                if (!Array.isArray(location.geom.coordinates) || location.geom.coordinates.length === 0) {
                    console.error("Polygon is missing valid coordinates:", location);
                    return;
                }
                let polygonCoordinates = location.geom.coordinates[0].map(coord => [coord[1], coord[0]]);
                console.log("Adding Polygon with coordinates:", polygonCoordinates); // ✅ Debugging
                shape = L.polygon(polygonCoordinates, {
                    color: "blue",
                    fillColor: "blue",
                    fillOpacity: 0.3
                }).addTo(map);
            }

            // ✅ Add popup to both markers & polygons
            if (shape) {
                shape.bindPopup(`
                    <b>${location["Nama Lokasi"]}</b><br>
                    🏢 <b>Company:</b> ${location["Pemegang Wilus"]}<br>
                    ⚡ <b>PLN UID:</b> ${location["UID"]}<br>
                `);
            }
        });

        console.log("Shapes added:", locations);
    } catch (error) {
        console.error("Error fetching locations:", error);
    }
}
