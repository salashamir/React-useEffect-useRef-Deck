import { useEffect, useState, useRef } from "react";
import Card from "./Card";
import axios from "axios";

const API_BASE_URL = "http://deckofcardsapi.com/api/deck";

/******* Deck component: calls deck API, to draw cards, create deck */

const Deck = () => {
  const [deck, setDeck] = useState(null);
  const [drawnCards, setDrawnCards] = useState([]);
  const [automaticDraw, setAutomaticDraw] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      let res = await axios.get(`${API_BASE_URL}/new/shuffle/`);
      setDeck(res.data);
    };
    fetchData();
  }, [setDeck]);

  // useefect to draw one card per second if automaticdraw is true
  useEffect(() => {
    // draw card through API, add card to drawnCards state list
    async function drawCard() {
      let { deck_id } = deck;

      try {
        let drawRes = await axios.get(`${API_BASE_URL}/${deck_id}/draw/`);

        if (drawRes.data.remaining === 0) {
          setAutomaticDraw(false);
          throw new Error("No cards left in deck!");
        }

        const card = drawRes.data.cards[0];

        setDrawnCards((prev) => [
          ...prev,
          {
            id: card.code,
            name: card.suit + " " + card.value,
            image: card.image,
          },
        ]);
      } catch (error) {
        alert(error);
      }
    }

    if (automaticDraw && !timerRef.current) {
      timerRef.current = setInterval(async () => {
        await drawCard();
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [automaticDraw, setAutomaticDraw, deck]);

  const toggleAutomaticDraw = () => {
    setAutomaticDraw((prev) => !prev);
  };

  const cards = drawnCards.map((c) => (
    <Card key={c.id} name={c.name} image={c.image} />
  ));

  return (
    <div className="Deck">
      {deck ? (
        <button onClick={toggleAutomaticDraw}>
          {automaticDraw ? "STOP" : "KEEP"} DRAWING!
        </button>
      ) : null}
      <div className="cards">{cards}</div>
    </div>
  );
};

export default Deck;
