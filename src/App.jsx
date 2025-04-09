import React, { useState } from "react";

const defaultTags = [
  { name: "Orange", color: "#FFA500" },
  { name: "Green", color: "#008000" },
  { name: "Pink", color: "#FFC0CB" },
  { name: "Chartreuse", color: "#DFFF00" },
  { name: "Orange/White", color: "#FFCC99" }
];

export default function CullTracker() {
  const [tournaments, setTournaments] = useState([]);
  const [view, setView] = useState("start");
  const [tournamentName, setTournamentName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [unit, setUnit] = useState("decimal");
  const [fishWeights, setFishWeights] = useState({});
  const [cullHistory, setCullHistory] = useState({});
  const [tags, setTags] = useState(defaultTags);

  const saveTournament = () => {
    const summary = {
      tournamentName,
      location,
      date,
      notes,
      unit,
      tags,
      fishWeights,
      cullHistory,
      bestFiveTotal: getBestFive(),
    };
    setTournaments([...tournaments, summary]);
    setView("summary");
  };

  const startTournament = () => {
    setView("tracker");
  };

  const updateWeight = (tag, weight) => {
    setFishWeights({ ...fishWeights, [tag]: weight });
  };

  const addCull = (tag, weight) => {
    setCullHistory({
      ...cullHistory,
      [tag]: [...(cullHistory[tag] || []), weight],
    });
  };

  const convertToDecimal = (weight) => {
    if (unit === "decimal") return parseFloat(weight);
    const [lbs, oz] = weight.split(" ").map(Number);
    return lbs + (oz ? oz / 16 : 0);
  };

  const getBestFive = () => {
    const weights = Object.values(fishWeights)
      .map((w) => convertToDecimal(w))
      .filter((w) => !isNaN(w))
      .sort((a, b) => b - a);
    return weights.slice(0, 5).reduce((sum, val) => sum + val, 0).toFixed(2);
  };

  const updateTag = (index, field, value) => {
    const newTags = [...tags];
    newTags[index][field] = value;
    setTags(newTags);
  };

  if (view === "start") {
    return (
      <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
        <h1>Start a New Tournament</h1>
        <input placeholder="Tournament Name" value={tournamentName} onChange={(e) => setTournamentName(e.target.value)} /><br /><br />
        <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} /><br /><br />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} /><br /><br />
        <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} /><br /><br />
        <label>Weight Format:</label><br />
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="decimal">Pounds (e.g. 3.25)</option>
          <option value="lbs_oz">Pounds & Ounces</option>
        </select><br /><br />
        <button onClick={startTournament}>Start Tournament</button>
      </div>
    );
  }

  if (view === "summary") {
    return (
      <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
        <h2>My Tournaments</h2>
        {tournaments.map((t, i) => (
          <div key={i} style={{ border: "1px solid #ccc", marginBottom: 10, padding: 10 }}>
            <h3>{t.tournamentName} – {t.location}</h3>
            <p>{t.date}</p>
            <p>Total Weight: {t.bestFiveTotal} lbs</p>
            <p><i>Notes: {t.notes}</i></p>
          </div>
        ))}
        <button onClick={() => setView("start")}>Start New Tournament</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h2>{tournamentName} – {location} – {date}</h2>
      <p><i>{notes}</i></p>

      {tags.map((tag, index) => (
        <div key={tag.name} style={{ border: "1px solid #ddd", marginBottom: 15, padding: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="color"
              value={tag.color}
              onChange={(e) => updateTag(index, "color", e.target.value)}
            />
            <input
              value={tag.name}
              onChange={(e) => updateTag(index, "name", e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
          <br />
          {unit === "decimal" ? (
            <input
              type="text"
              placeholder="e.g. 3.25"
              value={fishWeights[tag.name] || ""}
              onChange={(e) => updateWeight(tag.name, e.target.value)}
            />
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="number"
                placeholder="lbs"
                value={fishWeights[tag.name]?.split(" ")[0] || ""}
                onChange={(e) => {
                  const current = fishWeights[tag.name]?.split(" ") || ["", ""];
                  updateWeight(tag.name, `${e.target.value} ${current[1]}`);
                }}
              />
              <input
                type="number"
                placeholder="oz"
                value={fishWeights[tag.name]?.split(" ")[1] || ""}
                onChange={(e) => {
                  const current = fishWeights[tag.name]?.split(" ") || ["", ""];
                  updateWeight(tag.name, `${current[0]} ${e.target.value}`);
                }}
              />
            </div>
          )}
          <br />
          <button
            onClick={() => {
              const newWeight = prompt("Enter new culled weight:");
              if (newWeight) addCull(tag.name, newWeight);
            }}
          >
            Add Cull Replacement
          </button>
          <p style={{ fontSize: "0.9em", color: "#555" }}>
            Culls: {(cullHistory[tag.name] || []).join(", ") || "None"}
          </p>
        </div>
      ))}

      <h3>Best 5 Total: {getBestFive()} lbs</h3>
      <button onClick={saveTournament}>Save Tournament</button>
    </div>
  );
}