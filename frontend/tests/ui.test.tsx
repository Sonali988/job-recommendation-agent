import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressRing, MatchScoreRing } from "../src/components/ui";

describe("presentational components", () => {
  it("ProgressRing clamps and renders a percentage label", () => {
    render(<ProgressRing value={150} label="progress" />);
    expect(screen.getByLabelText(/100% progress/i)).toBeInTheDocument();
  });

  it("MatchScoreRing shows a bounded percentage", () => {
    render(<MatchScoreRing score={0.42} />);
    expect(screen.getByLabelText(/42% match/i)).toBeInTheDocument();
  });
});
