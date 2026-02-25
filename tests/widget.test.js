import { describe, it, expect } from "vitest";
import {
  relativeDate,
  truncateText,
} from "@/components/site-editor/GoogleReviewsWidget";

// ── Relative Date ───────────────────────────────────────────

describe("relativeDate", () => {
  it('returns "Aujourd\'hui" for today', () => {
    expect(relativeDate(new Date().toISOString())).toBe("Aujourd'hui");
  });

  it('returns "Hier" for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(relativeDate(yesterday.toISOString())).toBe("Hier");
  });

  it("returns days for less than a week", () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    expect(relativeDate(threeDaysAgo.toISOString())).toBe("Il y a 3 jours");
  });

  it("returns weeks for less than a month", () => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    expect(relativeDate(twoWeeksAgo.toISOString())).toBe("Il y a 2 semaines");
  });

  it("returns singular week", () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    expect(relativeDate(oneWeekAgo.toISOString())).toBe("Il y a 1 semaine");
  });

  it("returns months", () => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
    expect(relativeDate(threeMonthsAgo.toISOString())).toBe("Il y a 3 mois");
  });

  it("returns years", () => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    expect(relativeDate(twoYearsAgo.toISOString())).toBe("Il y a 2 ans");
  });

  it("returns singular year", () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    expect(relativeDate(oneYearAgo.toISOString())).toBe("Il y a 1 an");
  });

  it("returns empty string for null", () => {
    expect(relativeDate(null)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(relativeDate("")).toBe("");
  });
});

// ── Text Truncation ─────────────────────────────────────────

describe("truncateText", () => {
  it("does not truncate short text", () => {
    const { text, truncated } = truncateText("Short text", 150);
    expect(text).toBe("Short text");
    expect(truncated).toBe(false);
  });

  it("truncates text longer than max", () => {
    const longText = "A".repeat(200);
    const { text, truncated } = truncateText(longText, 150);
    expect(text.length).toBeLessThanOrEqual(151); // 150 + ellipsis
    expect(text.endsWith("…")).toBe(true);
    expect(truncated).toBe(true);
  });

  it("truncates at word boundary", () => {
    const text = "This is a test sentence that is quite long and should be truncated at a word boundary for readability";
    const { text: result } = truncateText(text, 50);
    // Should end with ellipsis and be shorter than original
    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThan(text.length);
    // The truncation point should be at or before the limit
    expect(result.replace("…", "").length).toBeLessThanOrEqual(50);
  });

  it("handles null/undefined input", () => {
    expect(truncateText(null).text).toBe("");
    expect(truncateText(undefined).text).toBe("");
    expect(truncateText(null).truncated).toBe(false);
  });

  it("handles empty string", () => {
    const { text, truncated } = truncateText("", 150);
    expect(text).toBe("");
    expect(truncated).toBe(false);
  });

  it("handles text exactly at max length", () => {
    const exactText = "A".repeat(150);
    const { text, truncated } = truncateText(exactText, 150);
    expect(text).toBe(exactText);
    expect(truncated).toBe(false);
  });

  it("uses custom max length", () => {
    const text = "A".repeat(100);
    const { truncated: t50 } = truncateText(text, 50);
    const { truncated: t200 } = truncateText(text, 200);
    expect(t50).toBe(true);
    expect(t200).toBe(false);
  });
});
