import React from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
      <div className="p-4 max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Start a New Tournament</h1>
        <Input placeholder="Tournament Name" value={tournamentName} onChange={(e) => setTournamentName(e.target.value)} />
        <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="space-y-2">
          <label className="font-semibold block">Weight Format:</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value)} className="border rounded px-2 py-1">
            <option value="decimal">Pounds (e.g. 3.25)</option>
            <option value="lbs_oz">Pounds & Ounces</option>
          </select>
        </div>
        <Button className="mt-4" onClick={startTournament}>Start Tournament</Button>
      </div>
    );
  }

  if (view === "summary") {
    return (
      <div className="p-4 max-w-3xl mx-auto space-y-4">
        <h2 className="text-xl font-bold">My Tournaments</h2>
        {tournaments.map((t, i) => (
          <Card key={i} className="border shadow">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold">{t.tournamentName} – {t.location}</h3>
              <p className="text-sm text-gray-600">{t.date}</p>
              <p className="text-sm">Total Weight: {t.bestFiveTotal} lbs</p>
              <p className="text-sm italic">Notes: {t.notes}</p>
            </CardContent>
          </Card>
        ))}
        <Button onClick={() => setView("start")}>Start New Tournament</Button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold">{tournamentName} – {location} – {date}</h2>
      <p className="text-sm text-gray-600">Notes: {notes}</p>

      {tags.map((tag, index) => (
        <Card key={tag.name} className="border shadow">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={tag.color}
                onChange={(e) => updateTag(index, "color", e.target.value)}
              />
              <Input
                value={tag.name}
                onChange={(e) => updateTag(index, "name", e.target.value)}
                className="w-full"
              />
            </div>
            {unit === "decimal" ? (
              <Input
                type="text"
                placeholder="e.g. 3.25"
                value={fishWeights[tag.name] || ""}
                onChange={(e) => updateWeight(tag.name, e.target.value)}
              />
            ) : (
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="lbs"
                  value={fishWeights[tag.name]?.split(" ")[0] || ""}
                  onChange={(e) => {
                    const current = fishWeights[tag.name]?.split(" ") || ["", ""];
                    updateWeight(tag.name, `${e.target.value} ${current[1]}`);
                  }}
                />
                <Input
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
            <Button
              onClick={() => {
                const newWeight = prompt("Enter new culled weight:");
                if (newWeight) addCull(tag.name, newWeight);
              }}
            >
              Add Cull Replacement
            </Button>
            <div className="text-sm text-gray-600">
              Culls: {(cullHistory[tag.name] || []).join(", ") || "None"}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="p-4 border-t font-semibold text-xl">
        Best 5 Total: {getBestFive()} lbs
      </div>
      <Button className="mt-4" onClick={saveTournament}>Save Tournament</Button>
    </div>
  );
}
