import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  extractPlaceIdFromUrl,
  filterAndNormalizeReviews,
  sanitizeText,
} from "@/services/googleReviews";

// ── URL Validation ──────────────────────────────────────────

describe("extractPlaceIdFromUrl", () => {
  it("accepts standard google.com/maps URL", () => {
    const result = extractPlaceIdFromUrl(
      "https://www.google.com/maps/place/Some+Business/@48.8,2.3,17z/"
    );
    expect(result.url).toContain("google.com/maps");
  });

  it("accepts maps.google.com URL", () => {
    const result = extractPlaceIdFromUrl(
      "https://maps.google.com/maps?q=some+business"
    );
    expect(result.url).toContain("maps.google.com");
  });

  it("accepts google.fr domain", () => {
    const result = extractPlaceIdFromUrl(
      "https://www.google.fr/maps/place/Cabinet/"
    );
    expect(result.url).toContain("google.fr/maps");
  });

  it("accepts goo.gl/maps short URL", () => {
    const result = extractPlaceIdFromUrl("https://goo.gl/maps/abc123xyz");
    expect(result.url).toContain("goo.gl/maps");
  });

  it("extracts ChIJ place ID from URL", () => {
    const result = extractPlaceIdFromUrl(
      "https://www.google.com/maps/place/Test/@48.8,2.3,17z/data=!3m1!4b1!4m5!3m4!1s0x0:0x0!8m2!3d48.8!4d2.3!ChIJabc123def456"
    );
    expect(result.placeId).toBe("ChIJabc123def456");
  });

  it("extracts place_id query parameter", () => {
    const result = extractPlaceIdFromUrl(
      "https://www.google.com/maps/place/?place_id=ChIJN1t_tDeuEmsRUsoyG83frY4"
    );
    expect(result.placeId).toBe("ChIJN1t_tDeuEmsRUsoyG83frY4");
  });

  it("extracts CID from URL", () => {
    const result = extractPlaceIdFromUrl(
      "https://www.google.com/maps?cid=12345678901234567"
    );
    expect(result.placeId).toBe("cid:12345678901234567");
  });

  it("returns null placeId when none found", () => {
    const result = extractPlaceIdFromUrl(
      "https://www.google.com/maps/place/Some+Business/"
    );
    expect(result.placeId).toBeNull();
  });

  it("throws for non-Google URL", () => {
    expect(() => extractPlaceIdFromUrl("https://example.com/business")).toThrow(
      "URL invalide"
    );
  });

  it("throws for Yelp URL", () => {
    expect(() =>
      extractPlaceIdFromUrl("https://www.yelp.com/biz/some-business")
    ).toThrow("URL invalide");
  });

  it("throws for empty string", () => {
    expect(() => extractPlaceIdFromUrl("")).toThrow("URL invalide");
  });

  it("throws for null", () => {
    expect(() => extractPlaceIdFromUrl(null)).toThrow("URL invalide");
  });

  it("throws for non-string", () => {
    expect(() => extractPlaceIdFromUrl(12345)).toThrow("URL invalide");
  });

  it("trims whitespace", () => {
    const result = extractPlaceIdFromUrl(
      "  https://www.google.com/maps/place/Test/  "
    );
    expect(result.url).toBe("https://www.google.com/maps/place/Test/");
  });
});

// ── Text Sanitization ───────────────────────────────────────

describe("sanitizeText", () => {
  it("strips HTML tags", () => {
    expect(sanitizeText("<p>Hello <b>world</b></p>")).toBe("Hello world");
  });

  it("strips script tags and content", () => {
    expect(sanitizeText('Good review<script>alert("xss")</script>')).toBe(
      "Good review"
    );
  });

  it("strips style tags and content", () => {
    expect(
      sanitizeText("Nice<style>.evil { display: none }</style> place")
    ).toBe("Nice place");
  });

  it("decodes HTML entities", () => {
    expect(sanitizeText("Tom &amp; Jerry &lt;3")).toBe("Tom & Jerry <3");
  });

  it("returns empty string for null/undefined", () => {
    expect(sanitizeText(null)).toBe("");
    expect(sanitizeText(undefined)).toBe("");
  });

  it("trims whitespace", () => {
    expect(sanitizeText("  hello  ")).toBe("hello");
  });
});

// ── Review Filtering ────────────────────────────────────────

describe("filterAndNormalizeReviews", () => {
  const makeReview = (overrides = {}) => ({
    name: "Jean Dupont",
    stars: 5,
    text: "Excellent thérapeute, je recommande vivement !",
    publishedAtDate: "2025-01-15T10:00:00Z",
    reviewerPhotoUrl: "https://photo.url",
    reviewUrl: "https://review.url",
    ...overrides,
  });

  it("returns only 5-star reviews", () => {
    const items = [
      makeReview({ stars: 5 }),
      makeReview({ stars: 4, name: "Marie" }),
      makeReview({ stars: 3, name: "Pierre" }),
      makeReview({ stars: 1, name: "Paul" }),
      makeReview({ stars: 5, name: "Sophie" }),
    ];
    const { filtered } = filterAndNormalizeReviews(items);
    expect(filtered).toHaveLength(2);
    expect(filtered.every((r) => r.rating === 5)).toBe(true);
  });

  it("excludes reviews without text", () => {
    const items = [
      makeReview({ text: "" }),
      makeReview({ text: null }),
      makeReview({ text: "   " }),
      makeReview({ text: "Great service!", name: "Valid" }),
    ];
    const { filtered } = filterAndNormalizeReviews(items);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].reviewerName).toBe("Valid");
  });

  it("caps results at 15", () => {
    const items = Array.from({ length: 25 }, (_, i) =>
      makeReview({ name: `User ${i}`, text: `Review ${i}` })
    );
    const { filtered, totalFiveStar } = filterAndNormalizeReviews(items);
    expect(filtered).toHaveLength(15);
    expect(totalFiveStar).toBe(25);
  });

  it("sorts by date newest first", () => {
    const items = [
      makeReview({ publishedAtDate: "2024-01-01T00:00:00Z", name: "Old" }),
      makeReview({ publishedAtDate: "2025-06-01T00:00:00Z", name: "New" }),
      makeReview({ publishedAtDate: "2024-06-01T00:00:00Z", name: "Mid" }),
    ];
    const { filtered } = filterAndNormalizeReviews(items);
    expect(filtered[0].reviewerName).toBe("New");
    expect(filtered[1].reviewerName).toBe("Mid");
    expect(filtered[2].reviewerName).toBe("Old");
  });

  it("handles nested reviews format (place object with reviews array)", () => {
    const items = [
      {
        placeName: "Test Business",
        reviews: [
          makeReview({ name: "Nested User 1" }),
          makeReview({ stars: 3, name: "Bad Rating" }),
        ],
      },
    ];
    const { filtered } = filterAndNormalizeReviews(items);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].reviewerName).toBe("Nested User 1");
  });

  it("handles flat review format (rating field instead of stars)", () => {
    const items = [
      {
        reviewerName: "Flat User",
        rating: 5,
        reviewText: "Great!",
        publishedAt: "2025-01-01",
      },
    ];
    const { filtered } = filterAndNormalizeReviews(items);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].reviewerName).toBe("Flat User");
  });

  it("sanitizes HTML in review text", () => {
    const items = [
      makeReview({ text: '<b>Bold</b> review<script>alert("xss")</script>' }),
    ];
    const { filtered } = filterAndNormalizeReviews(items);
    expect(filtered[0].reviewText).toBe("Bold review");
  });

  it("sanitizes HTML in reviewer name", () => {
    const items = [makeReview({ name: "<b>Jean</b> Dupont" })];
    const { filtered } = filterAndNormalizeReviews(items);
    expect(filtered[0].reviewerName).toBe("Jean Dupont");
  });

  it("returns empty array for null/empty input", () => {
    expect(filterAndNormalizeReviews(null).filtered).toEqual([]);
    expect(filterAndNormalizeReviews([]).filtered).toEqual([]);
  });

  it("returns totalFiveStar count separate from capped results", () => {
    const items = Array.from({ length: 20 }, (_, i) =>
      makeReview({ name: `User ${i}` })
    );
    const { filtered, totalFiveStar } = filterAndNormalizeReviews(items);
    expect(filtered).toHaveLength(15);
    expect(totalFiveStar).toBe(20);
  });

  it("handles mixed valid and invalid reviews", () => {
    const items = [
      makeReview({ stars: 5, text: "Great!", name: "A" }),
      makeReview({ stars: 5, text: "", name: "B" }), // no text
      makeReview({ stars: 4, text: "Good", name: "C" }), // not 5 stars
      makeReview({ stars: 5, text: "Amazing!", name: "D" }),
      makeReview({ stars: 1, text: "Terrible", name: "E" }), // 1 star
      makeReview({ stars: 5, text: "   ", name: "F" }), // whitespace only
    ];
    const { filtered } = filterAndNormalizeReviews(items);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((r) => r.reviewerName)).toEqual(
      expect.arrayContaining(["A", "D"])
    );
  });
});
