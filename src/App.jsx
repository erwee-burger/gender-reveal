import { useCallback, useEffect, useRef, useState } from "react";
import { getCountdownParts } from "./countdown.js";
import { evidenceLog, goldFishPhrases, siteConfig } from "./config.js";
import { getConfiguredTheme } from "./theme.js";
import { PredictionForm } from "./components/PredictionForm.jsx";
import { PredictionInsights } from "./components/PredictionInsights.jsx";

const GOLD_FISH_INITIAL_DELAY_MS = 4000;
const GOLD_FISH_MIN_DELAY_MS = 8000;
const GOLD_FISH_MAX_DELAY_MS = 18000;
const GOLD_FISH_VISIBLE_MS = 3600;

const schoolFish = Array.from({ length: 24 }, (_, index) => {
  const isBlue = index < 12;
  const localIndex = isBlue ? index : index - 12;
  const direction = (index + Math.floor(index / 3)) % 2 === 0 ? "right" : "left";

  return {
    id: `${isBlue ? "blue" : "pink"}-${localIndex + 1}`,
    color: isBlue ? "blue" : "pink",
    direction,
    top: 10 + ((index * 17) % 82),
    size: 46 + ((index * 11) % 44),
    duration: 22 + ((index * 7) % 26),
    delay: -1 * ((index * 5) % 39),
    opacity: 0.42 + ((index % 5) * 0.08),
    drift: ((index % 7) - 3) * 7,
    path: (index % 4) + 1
  };
});

function CountdownUnit({ value, label }) {
  return (
    <div className="countdown-unit">
      <strong>{String(value).padStart(2, "0")}</strong>
      <span>{label}</span>
    </div>
  );
}

function Fish({ className = "" }) {
  return (
    <svg className={`fish ${className}`} viewBox="0 0 130 70" aria-hidden="true">
      <path className="fish-tail" d="M17 35 L2 14 Q24 20 32 35 Q24 50 2 56 Z" />
      <ellipse className="fish-body" cx="68" cy="35" rx="43" ry="25" />
      <circle className="fish-eye" cx="92" cy="27" r="9" />
      <circle className="fish-pupil" cx="95" cy="27" r="4" />
      <path className="fish-fin" d="M54 38 Q42 54 70 48" />
      <path className="fish-smile" d="M100 40 Q106 45 112 39" />
    </svg>
  );
}

function SchoolFish({ fish }) {
  const style = {
    "--fish-top": `${fish.top}%`,
    "--fish-size": `${fish.size}px`,
    "--fish-duration": `${fish.duration}s`,
    "--fish-delay": `${fish.delay}s`,
    "--fish-opacity": fish.opacity,
    "--fish-drift": `${fish.drift}px`
  };

  return (
    <div
      className={`school-fish school-fish-${fish.direction} school-path-${fish.path}`}
      style={style}
      data-testid="school-fish"
    >
      <Fish className={`fish-${fish.color}`} />
    </div>
  );
}

function GoldFish({ phrase, showBubble, onClick }) {
  return (
    <button
      className="gold-fish-button"
      type="button"
      onClick={onClick}
      aria-label="Gold fish secret"
      data-testid="gold-fish"
    >
      <span className={`fish-bubble ${showBubble ? "is-visible" : ""}`}>
        {phrase}
      </span>
      <span className="gold-fish-art">
        <svg className="gold-fish" viewBox="0 0 150 82" aria-hidden="true">
          <path className="gold-tail" d="M27 41 L2 13 Q31 17 43 35 Q35 45 41 65 Q23 58 27 41 Z" />
          <path
            className="gold-body"
            d="M35 44 C43 12 92 3 127 25 C145 36 143 55 125 66 C91 87 43 74 35 44 Z"
          />
          <path className="gold-belly" d="M40 51 C62 68 101 70 126 54 C114 78 61 82 40 51 Z" />
          <path className="gold-fin" d="M72 53 Q57 78 91 65" />
          <path className="gold-top-fin" d="M66 21 Q82 0 102 19" />
          <circle className="gold-eye gold-eye-left" cx="104" cy="34" r="14" />
          <circle className="gold-eye gold-eye-right" cx="127" cy="37" r="12" />
          <circle className="gold-pupil" cx="108" cy="36" r="5" />
          <circle className="gold-pupil" cx="130" cy="39" r="4" />
          <path className="gold-mouth" d="M137 48 Q145 52 137 57" />
        </svg>
      </span>
    </button>
  );
}

function App() {
  const [now, setNow] = useState(() => new Date());
  const [showGoldBubble, setShowGoldBubble] = useState(false);
  const [goldFishPhrase, setGoldFishPhrase] = useState(goldFishPhrases[0]);
  const [heroImage, setHeroImage] = useState(siteConfig.heroImage);
  const [page, setPage] = useState("home");
  const goldFishSpeechTimer = useRef(null);
  const goldFishHideTimer = useRef(null);
  const lastGoldFishPhrase = useRef(goldFishPhrases[0]);
  const theme = getConfiguredTheme(siteConfig.theme);
  const countdown = getCountdownParts(siteConfig.countdownTarget, now);
  const latestEvidence = evidenceLog[0];
  const archivedEvidence = evidenceLog.slice(1);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  function getRandomGoldFishPhrase() {
    if (goldFishPhrases.length <= 1) {
      return goldFishPhrases[0] ?? "";
    }

    let phrase = goldFishPhrases[Math.floor(Math.random() * goldFishPhrases.length)];

    while (phrase === lastGoldFishPhrase.current) {
      phrase = goldFishPhrases[Math.floor(Math.random() * goldFishPhrases.length)];
    }

    lastGoldFishPhrase.current = phrase;
    return phrase;
  }

  function getRandomGoldFishDelay() {
    return (
      GOLD_FISH_MIN_DELAY_MS +
      Math.floor(Math.random() * (GOLD_FISH_MAX_DELAY_MS - GOLD_FISH_MIN_DELAY_MS + 1))
    );
  }

  function scrollToEvidence() {
    document.getElementById("evidence")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  const revealGoldBubble = useCallback(() => {
    setGoldFishPhrase(getRandomGoldFishPhrase());
    setShowGoldBubble(true);

    window.clearTimeout(goldFishHideTimer.current);
    goldFishHideTimer.current = window.setTimeout(() => {
      setShowGoldBubble(false);
    }, GOLD_FISH_VISIBLE_MS);

    window.clearTimeout(goldFishSpeechTimer.current);
    goldFishSpeechTimer.current = window.setTimeout(revealGoldBubble, getRandomGoldFishDelay());
  }, []);

  useEffect(() => {
    goldFishSpeechTimer.current = window.setTimeout(revealGoldBubble, GOLD_FISH_INITIAL_DELAY_MS);

    return () => {
      window.clearTimeout(goldFishSpeechTimer.current);
      window.clearTimeout(goldFishHideTimer.current);
    };
  }, [revealGoldBubble]);

  function goToPool() {
    setPage("pool");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function goHome() {
    setPage("home");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return (
    <main className="site-shell" data-theme={theme}>
      <div className="water-background">
        <div className="water-layer water-layer-one" />
        <div className="water-layer water-layer-two" />
        <div className="water-shine" />
        <div className="school-layer" aria-hidden="true">
          {schoolFish.map((fish) => (
            <SchoolFish fish={fish} key={fish.id} />
          ))}
        </div>
      </div>
      <GoldFish phrase={goldFishPhrase} showBubble={showGoldBubble} onClick={revealGoldBubble} />

      {page === "home" ? (
        <>
          <section className="hero-section" aria-labelledby="page-title">
            <div className="hero-copy">
              <p className="eyebrow">Classified Baba File</p>
              <h1 id="page-title">The Pikkewyn Case File</h1>
              <p className="subtitle">
                {siteConfig.parents} are expecting... but the result is still classified.
              </p>
              <p className="teaser">
                Charlie and Bruce may know something. They are not considered reliable witnesses.
              </p>

              <div className="case-window" aria-label="Reveal window">
                <span>Reveal window</span>
                <strong>{siteConfig.revealWindow}</strong>
              </div>

              <div className="countdown-panel" aria-live="polite">
                <p>{countdown.isOpen ? "Case window is open" : "Case window opens in"}</p>
                <div className="countdown-grid">
                  <CountdownUnit value={countdown.days} label="Days" />
                  <CountdownUnit value={countdown.hours} label="Hours" />
                  <CountdownUnit value={countdown.minutes} label="Minutes" />
                  <CountdownUnit value={countdown.seconds} label="Seconds" />
                </div>
              </div>

              <div className="hero-actions">
                <button className="button button-primary" type="button" onClick={scrollToEvidence}>
                  View the Latest Evidence
                </button>
                <button className="button button-secondary" type="button" onClick={goToPool}>
                  Kliek hier om te raai
                </button>
              </div>
            </div>

            <div className="hero-visual" aria-label="Pikkewyn mascot holding the case file">
              <img
                src={heroImage}
                alt="Pikkewyn mascot holding a case file"
                onError={() => setHeroImage(siteConfig.heroImageFallback)}
              />
            </div>
          </section>

          <PredictionInsights />

          <section className="evidence-log-section" id="evidence" aria-labelledby="evidence-log-title">
            <div className="section-heading">
              <p className="eyebrow">Evidence Log</p>
              <h2 id="evidence-log-title">One place for every suspicious update.</h2>
            </div>

            <div className="evidence-log">
              <article className="evidence-log-item evidence-log-item-featured">
                <div>
                  <span>{latestEvidence.id}</span>
                  <time>{latestEvidence.date}</time>
                </div>
                <h3>{latestEvidence.title}</h3>
                {latestEvidence.image ? (
                  <img
                    className="evidence-log-image"
                    src={latestEvidence.image}
                    alt={latestEvidence.title}
                  />
                ) : null}
                <p>{latestEvidence.summary}</p>
                <span className="stamp evidence-log-stamp">{latestEvidence.stamp ?? "Inconclusive"}</span>
              </article>

              {archivedEvidence.length > 0 ? (
                <div className="evidence-archive" aria-label="Previous evidence">
                  {archivedEvidence.map((item) => (
                    <article className="evidence-log-item" key={item.id}>
                      <div>
                        <span>{item.id}</span>
                        <time>{item.date}</time>
                      </div>
                      <h3>{item.title}</h3>
                      {item.image ? (
                        <img
                          className="evidence-log-image"
                          src={item.image}
                          alt={item.title}
                        />
                      ) : null}
                      <p>{item.summary}</p>
                      <span className="stamp evidence-log-stamp">{item.stamp ?? "Inconclusive"}</span>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="pool-page-nav">
            <button className="pool-back-button" type="button" onClick={goHome}>
              ← Back to Case File
            </button>
          </div>

          <section className="pool-section" id="pool" aria-labelledby="pool-title">
            <div className="section-heading">
              <p className="eyebrow">Baby Pool</p>
              <h2 id="pool-title">Make your prediction.</h2>
              <p className="pool-intro">
                Think you know what Pikkewyn has in store? Lock in your guesses below —
                one entry per person. Scoring is based on gender, birth date, time, weight,
                length, hair colour, eye colour, and the baby's name initial. Check the
                leaderboard after the reveal to see who called it.
              </p>
            </div>
            <PredictionForm onSubmitted={() => {}} />
          </section>

        </>
      )}
    </main>
  );
}

export default App;
