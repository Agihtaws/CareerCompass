"use client";

import { useEffect, useRef, useState } from "react";


export function useSpeechRecognition() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef(null);

  useEffect(() => {
    const SR =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN"; // Indian English; falls back gracefully

    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setTranscript(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recRef.current = rec;
    return () => {
      try {
        rec.stop();
      } catch {}
    };
  }, []);

  const start = () => {
    setTranscript("");
    try {
      recRef.current?.start();
      setListening(true);
    } catch {}
  };
  const stop = () => {
    try {
      recRef.current?.stop();
    } catch {}
    setListening(false);
  };

  return { supported, listening, transcript, start, stop, setTranscript };
}

/** Read text aloud using the browser's free speech synthesis. */
export function speak(text) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-IN";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {}
}