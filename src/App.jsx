import React, { useState } from "react";

const defaultTags = [
  { name: "Tag 1", color: "#000000", species: "" },
  { name: "Tag 2", color: "#0000FF", species: "" },
  { name: "Tag 3", color: "#008000", species: "" },
  { name: "Tag 4", color: "#7FFF00", species: "" },
  { name: "Tag 5", color: "#FFA500", species: "" }
];

const colorOptions = [
  { name: "Black", value: "#000000" },
  { name: "Blue", value: "#0000FF" },
  { name: "Green", value: "#008000" },
  { name: "Chartreuse", value: "#7FFF00" },
  { name: "Orange", value: "#FFA500" },
  { name: "White", value: "#FFFFFF" },
  { name: "Yellow", value: "#FFFF00" },
  { name: "Red", value: "#FF0000" },
  { name: "Purple", value: "#800080" },
  { name: "Gray", value: "#808080" },
  { name: "Orange/White", value: "linear-gradient(to right, #FFA500 50%, #FFFFFF 50%)" },
  { name: "Pink", value: "#FFC0CB" }
];

const inputStyle = {
  padding: 8,
  backgroundColor: "#fff",
  color: "#000",
  border: "1px solid #ccc",
  borderRadius: 4
};

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
      bestFiveTotal: getBestFive()
    };
    setTournaments([...tournaments, summary]);
    setView("summary");
  };

  const startTournament = () => {
    setView("tracker");
  };

  const editTournament = (index) => {
    const t = tournaments[index];
    setTournamentName(t.tournamentName);
    setLocation(t.location);
    setDate(t.date);
    setNotes(t.notes);
    setUnit(t.unit);
    setTags(t.tags);
    setFishWeights(t.fishWeights);
    setCullHistory(t.cullHistory);
    setView("tracker");
  };

  const deleteTournament = (index) => {
    const newList = tournaments.filter((_, i) => i !== index);
    setTournaments(newList);
  };

  const exportTournament = (t) => {
    const content = `Tournament: ${t.tournamentName}\nLocation: ${t.location}\nDate: ${t.date}\nTotal Weight: ${t.bestFiveTotal} lbs\nNotes: ${t.notes}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${t.tournamentName.replace(/\s+/g, '_')}_summary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const updateWeight = (tag, weight) => {
    const updated = { ...fishWeights, [tag]: weight };
    setFishWeights(updated);
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
        <h1 style={{ fontSize: "1.5rem" }}>Start a New Tournament</h1>
        <input style={{ ...inputStyle, width: "100%" }} placeholder="Tournament Name" value={tournamentName} onChange={(e) => setTournamentName(e.target.value)} /><br /><br />
        <input style={{ ...inputStyle, width: "100%" }} placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} /><br /><br />
        <label>Date:</label><br />
        <input style={{ ...inputStyle, width: "100%" }} type="date" value={date} onChange={(e) => setDate(e.target.value)} /><br /><br />
        <textarea style={{ ...inputStyle, width: "100%" }} placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} /><br /><br />
        <label>Weight Format:</label><br />
        <select style={{ ...inputStyle, width: "100%" }} value={unit} onChange={(e) => setUnit(e.target.value)}>
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
            <button onClick={() => editTournament(i)}>Edit</button>
            <button onClick={() => deleteTournament(i)} style={{ marginLeft: 10 }}>Delete</button>
            <button onClick={() => exportTournament(t)} style={{ marginLeft: 10 }}>Export</button>
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
            <select
              value={tag.color}
              onChange={(e) => updateTag(index, "color", e.target.value)}
              style={{ width: 150, padding: 6 }}
            >
              {colorOptions.map((opt) => (
                <option key={opt.name} value={opt.value} style={{ backgroundColor: opt.value, color: opt.name === "White" ? "black" : "white" }}>
                  {opt.name}
                </option>
              ))}
            </select>
            <input
              placeholder="Name or Number"
              value={tag.name}
              onChange={(e) => updateTag(index, "name", e.target.value)}
              style={{ width: 120, ...inputStyle }}
            />
            <select
              value={tag.species || ""}
              onChange={(e) => updateTag(index, "species", e.target.value)}
              style={{ width: 160, ...inputStyle }}
            >
              <option value="">Species</option>
              <option value="Largemouth Bass">Largemouth Bass</option>
              <option value="Smallmouth Bass">Smallmouth Bass</option>
              <option value="Spotted Bass">Spotted Bass</option>
            </select>
          </div>
          <br />
          {unit === "decimal" ? (
            <input
              type="text"
              placeholder="e.g. 3.25"
              value={fishWeights[tag.name] || ""}
              onChange={(e) => updateWeight(tag.name, e.target.value)}
              style={{ width: "100%", ...inputStyle }}
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
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="oz"
                value={fishWeights[tag.name]?.split(" ")[1] || ""}
                onChange={(e) => {
                  const current = fishWeights[tag.name]?.split(" ") || ["", ""];
                  updateWeight(tag.name, `${current[0]} ${e.target.value}`);
                }}
                style={inputStyle}
              />
            </div>
          )}
        </div>
      ))}

      <h3>Best 5 Total: {getBestFive()} lbs</h3>
      <button onClick={saveTournament}>Save Tournament</button>
    </div>
  );
}
