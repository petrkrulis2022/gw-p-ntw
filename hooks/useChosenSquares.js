import L from "leaflet";

const useChosenSquares = () => {
  const RED = "#fa3737";
  const GREEN = "#1ec716";

  function addSquare(api, words, color, map, pane, setMoveEnd) {
    api
      .convertToCoordinates({ words, format: "geojson" })
      .then(function (data) {
        const bbox = data.features[0].bbox;
        const bounds = [
          [bbox[1], bbox[2]],
          [bbox[3], bbox[0]],
        ];

        let exists = false;

        map.eachLayer((l) => {
          if (l instanceof L.Rectangle) {
            if (l.options.className?.includes(words + color.slice(1))) {
              exists = true;
            } else if (l.options.className?.includes(words)) {
              l.removeFrom(map);
            }
          }
        });

        if (!exists) {
          L.rectangle(bounds, {
            color,
            weight: 1,
            fillOpacity: 1,
            pane,
            className: words + color.slice(1),
          }).addTo(map);
          setMoveEnd(Math.random());
        }
      })
      .catch(console.error);
  }

  const drawChosenSquares = (
    map,
    api,
    chosenSquares,
    isClaiming,
    setMoveEnd
  ) => {
    map.eachLayer((l) => {
      if (!l.getPane("chosen")) {
        map.createPane("chosen");
        const chosenPane = map.getPane("chosen");
        if (chosenPane) chosenPane.style.zIndex = "475";
      }
    });

    const chosenPane = map.getPane("chosen");

    if (chosenPane) {
      chosenSquares.map((words) => {
        const color = isClaiming ? RED : GREEN;
        addSquare(api, words, color, map, chosenPane, setMoveEnd);
      });
    }
  };

  return { drawChosenSquares };
};

export default useChosenSquares;
