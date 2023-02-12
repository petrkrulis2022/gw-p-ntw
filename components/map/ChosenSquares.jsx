import useChosenSquares from "../../hooks/useChosenSquares";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

function ChosenSquares({
  api,
  chosenSquares,
  isClaiming,
  words,
  setMoveEnd,
  claimed,
  moveEnd,
}) {
  const map = useMap();
  const { drawChosenSquares } = useChosenSquares();

  useEffect(() => {
    if (chosenSquares.length) {
      //TODO Maybe Remove this, but before testing drawing square
      // if (!isClaiming && !claimed) {
      //   drawChosenSquares(map, api, [words], isClaiming, setMoveEnd);
      // } else {
      drawChosenSquares(map, api, chosenSquares, isClaiming, setMoveEnd);
      //}
    }
  }, [
    chosenSquares,
    isClaiming,
    moveEnd,
    api,
    claimed,
    setMoveEnd,
    map,
    words,
    drawChosenSquares,
  ]);

  return null;
}

export default ChosenSquares;
