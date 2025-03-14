import { fetchLocations } from "./supabase.js";

document.addEventListener("DOMContentLoaded", async function () {
    console.log("Fetching locations from Supabase...");
    const locations = await fetchLocations();

    console.log("Locations received:", locations);

    const sidebar = document.querySelector(".sidebar ul"); // Select the sidebar list
    const mapMarkers = {}; // Store markers for easy reference

    // ✅ Organize locations by "Pemegang Wilus" (Company Name)
    const groupedData = {};
    locations.forEach((location) => {
        if (!location["Pemegang Wilus"] || !location["Nama Lokasi"] || !location.geom) return;

        let company = location["Pemegang Wilus"];
        let place = location["Nama Lokasi"];

        if (!groupedData[company]) {
            groupedData[company] = [];
        }
        groupedData[company].push(location);
    });

    // ✅ Populate the Sidebar Dynamically
    for (const company in groupedData) {
        let companyItem = document.createElement("li");
        companyItem.classList.add("parent-item");
        companyItem.textContent = company;

        let sublist = document.createElement("ul");
        sublist.classList.add("sublist");

        groupedData[company].forEach((location) => {
            let subItem = document.createElement("li");
            subItem.textContent = location["Nama Lokasi"];

            // ✅ Add event listener to zoom to the location when clicked
            subItem.addEventListener("click", function () {
                if (location.geom.type === "Point") {
                    let [lng, lat] = location.geom.coordinates;
                    map.setView([lat, lng], 14);
                } else if (location.geom.type === "Polygon") {
                    let polygonCoordinates = location.geom.coordinates[0].map(coord => [coord[1], coord[0]]);
                    let bounds = L.latLngBounds(polygonCoordinates);
                    map.fitBounds(bounds);
                }
            });

            sublist.appendChild(subItem);
        });

        companyItem.appendChild(sublist);
        sidebar.appendChild(companyItem);

        // ✅ Sidebar Toggle Functionality
        companyItem.addEventListener("click", function () {
            this.classList.toggle("open");
        });
    }
});
