import { useEffect } from "react";
import { useMap } from "react-leaflet";

function Grid({ api, setMoveEnd, setLineOpacity }) {
  const map = useMap();

  function drawGrid(map, api) {
    const zoom = map.getZoom();

    if (zoom > 17) {
      // Zoom level is high enough
      const ne = map.getBounds().getNorthEast();
      const sw = map.getBounds().getSouthWest();

      // Call the what3words Grid API to obtain the grid squares within the current visible bounding box
      api
        .gridSection({
          boundingBox: {
            southwest: {
              lat: sw.lat,
              lng: sw.lng,
            },
            northeast: {
              lat: ne.lat,
              lng: ne.lng,
            },
          },
          format: "geojson",
        })
        .then(function (data) {
          // If the grid layer is already present, remove it as it will need to be replaced by the new grid section
          map.eachLayer((l) => {
            if (l.getPane()?.className?.includes("leaflet-overlay-pane")) {
              map.removeLayer(l);
            }
          });

          L.geoJSON(data, {
            style: function () {
              return {
                color: "#777",
                stroke: true,
                weight: 0.5,
              };
            },
          }).addTo(map);
        })
        .catch(console.error);
    } else if (zoom >= 16) {
      map.eachLayer((l) => {
        if (l.getPane()?.className?.includes("leaflet-overlay-pane")) {
          map.removeLayer(l);
        }
      });
    }
  }

  useEffect(() => {
    map.whenReady(() => drawGrid(map, api));

    map.on("zoomend", function () {
      setMoveEnd(Math.random());
      drawGrid(map, api);
    });

    map.on("dragend", function () {
      setMoveEnd(Math.random());
      drawGrid(map, api);
    });

    map.on("movestart", () => {
      setLineOpacity(0);
    });
  }, [map, api, setMoveEnd, setLineOpacity]);

  return null;
}

export default Grid;
