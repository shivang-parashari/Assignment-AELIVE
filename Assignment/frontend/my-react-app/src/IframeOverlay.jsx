import React, { useRef, useEffect, useState } from "react";
import Lottie from "lottie-react";
import { useSubscription, gql } from "@apollo/client";
import animationData from "./lottie/gfx_LF_Substitutions_lottieAnimation.json";

const SUB_ADDED = gql`
  subscription {
    substitutionAdded {
      playerOutName
      playerOutNumber
      playerInName
      playerInNumber
      time
    }
  }
`;
// src/utils/updateLottieText.js
function updateLottieText(animation, replacements = {}) {
  const clone = structuredClone(animation);

  function walkLayers(layers, name) {
    if(name === 'OFF'){
      layers[0].t.d.k[0].s.t = replacements['OUTNUM'];
      layers[2].t.d.k[0].s.t = replacements['OUT'];
    }else if(name === 'ON'){
      layers[0].t.d.k[0].s.t = replacements['ON'];
      layers[1].t.d.k[0].s.t = replacements['ONNUM'];
    }
    // layers.forEach((layer) => {
    //   // if this layer has text data
    //   if (layer.t?.d?.k?.[0]?.s?.t) {
    //     // find if its name matches one of your keys
    //     for (const key of Object.keys(replacements)) {
    //       if (name === key) {
    //         layer.t.d.k[0].s.t = replacements[key];
    //       }
    //     }
    //   } 

    //   // if the layer itself contains nested comp layers
    //   if (layer.layers) {
    //     walkLayers(layer.layers);
    //   }
    // });
  }

  // Lottie keeps text layers both in top-level and nested comps (“assets”)
 // if (clone.layers) walkLayers(clone.layers);
  if (clone.assets) {
    clone.assets.forEach((asset) => {
      if (asset.layers) walkLayers(asset.layers, asset.nm);
    });
  }

  return clone;
}

export default function IframeOverlay() {
  const { data } = useSubscription(SUB_ADDED);
  const lottieRef = useRef();
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(null);
  const [animationDataState, setAnimationDataState] = useState(animationData);

  useEffect(() => {
    if (data?.substitutionAdded) {
      setCurrent(data.substitutionAdded);
      setVisible(true);

      // update text
      const replacements = {
        'ON' : data.substitutionAdded.playerInName,
        'OUT': data.substitutionAdded.playerOutName,
        'ONNUM' : data.substitutionAdded.playerInNumber,
        'OUTNUM': data.substitutionAdded.playerOutNumber
      }
      const updatedAnimation = updateLottieText(animationData, replacements);
      setAnimationDataState(updatedAnimation);
      lottieRef.current = data.substitutionAdded

      // restart animation from beginning
      //lottieRef.current?.goToAndPlay(0, true);

      // hide after 8 seconds
      const timeout = setTimeout(() => setVisible(false), 8000);
      return () => clearTimeout(timeout);
    }
  }, [data]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ width: '200vw', height: '200vh' }}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationDataState}
        loop={false}
        className="w-full h-full"
      />
      {current && (
        <div className="absolute bottom-16 text-white text-3xl font-bold text-center drop-shadow-lg">
          <p>OUT: #{current.playerOutNumber} {current.playerOutName}</p>
          <p>IN: #{current.playerInNumber} {current.playerInName}</p>
          <p className="text-sm opacity-80">{current.time}</p>
        </div>
      )}
    </div>
  );
}
