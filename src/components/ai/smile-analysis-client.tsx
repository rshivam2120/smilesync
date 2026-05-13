"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Analysis = {
  alignment: number;
  whitening: number;
  gumHealth: number;
  symmetry: number;
  confidence: number;
  recommendations: string[];
};

export function SmileAnalysisClient() {
  const [age, setAge] = useState(26);
  const [concern, setConcern] = useState("alignment");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const run = async () => {
    const res = await fetch("/api/ai/smile-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ age, concern }),
    });
    const data = await res.json();
    setAnalysis(data?.data?.analysis ?? null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Upload & Analyze</CardTitle>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input type="file" />
          <Input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} />
          <Input value={concern} onChange={(e) => setConcern(e.target.value)} placeholder="Primary concern" />
        </div>
        <Button className="mt-4" onClick={run}>Generate AI Insights</Button>
      </Card>
      {analysis && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>Alignment: {analysis.alignment}/100</Card>
          <Card>Whitening: {analysis.whitening}/100</Card>
          <Card>Gum Health: {analysis.gumHealth}/100</Card>
          <Card>Symmetry: {analysis.symmetry}/100</Card>
          <Card>Confidence: {analysis.confidence}/100</Card>
          <Card>Recommendations: {analysis.recommendations.join(", ")}</Card>
        </div>
      )}
    </div>
  );
}
