import "./index.css";
import { Composition } from "remotion";
import { ReelCTB, ReelCTBSchema, REEL_DURATION } from "./ReelCTB";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Reel-CTB"
        component={ReelCTB}
        durationInFrames={REEL_DURATION}
        fps={30}
        width={1080}
        height={1920}
        schema={ReelCTBSchema}
        defaultProps={{
          hookBadge: "ALERTA MERCANTIL",
          headline: "Tu capital social puede estar en cero sin que lo sepas",
          subtitle: "Así es como el SAREN lo detecta",
          valueText: "Miles de actas antiguas quedan atrapadas por la reconversión monetaria",
          ctbText: "Comenta la palabra clave y te decimos si tu empresa está en riesgo",
          ctbKeyword: "RIESGO CERO",
          handle: "@ceinca.mercantil",
        }}
      />
    </>
  );
};
