import { SmileAnalysisClient } from "@/components/ai/smile-analysis-client";

export default function AiSmilePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 md:px-8">
      <h1 className="text-4xl font-bold">AI Smile Analysis</h1>
      <SmileAnalysisClient />
    </div>
  );
}
