import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase
const mockSupabase = {
  from: vi.fn(),
};
vi.mock("@/lib/supabase", () => ({ supabase: mockSupabase }));

// Mock the Apify client
vi.mock("apify-client", () => {
  return {
    ApifyClient: vi.fn().mockImplementation(() => ({
      actor: vi.fn().mockReturnValue({
        call: vi.fn(),
      }),
      dataset: vi.fn().mockReturnValue({
        listItems: vi.fn(),
      }),
    })),
  };
});

import { filterAndNormalizeReviews } from "@/services/googleReviews";

describe("Scrape flow integration", () => {
  // Simulate what Apify would return: a mix of reviews with different ratings and text
  const mockApifyData = [
    {
      placeName: "Cabinet Thérapeutique",
      reviews: [
        {
          name: "Marie Dupont",
          stars: 5,
          text: "Excellent thérapeute, très à l'écoute et professionnel. Je recommande vivement !",
          publishedAtDate: "2025-02-01T10:00:00Z",
          reviewerPhotoUrl: "https://photo1.url",
          reviewUrl: "https://review1.url",
        },
        {
          name: "Pierre Martin",
          stars: 4,
          text: "Bon thérapeute mais un peu cher.",
          publishedAtDate: "2025-01-20T10:00:00Z",
        },
        {
          name: "Sophie Laurent",
          stars: 5,
          text: "", // empty text — should be excluded
          publishedAtDate: "2025-01-15T10:00:00Z",
        },
        {
          name: "Jean Bernard",
          stars: 5,
          text: "Magnifique expérience, résultats dès la première séance.",
          publishedAtDate: "2025-01-10T10:00:00Z",
          reviewerPhotoUrl: null,
          reviewUrl: "https://review3.url",
        },
        {
          name: "Lucas Petit",
          stars: 3,
          text: "Moyen, pas convaincu.",
          publishedAtDate: "2025-01-05T10:00:00Z",
        },
        {
          name: "Camille R.",
          stars: 5,
          text: "   ", // whitespace only — should be excluded
          publishedAtDate: "2025-01-03T10:00:00Z",
        },
        {
          name: "Emma Noir",
          stars: 1,
          text: "Très déçu, aucun résultat après 3 séances.",
          publishedAtDate: "2025-01-02T10:00:00Z",
        },
        {
          name: "Thomas Vert",
          stars: 5,
          text: "Un vrai professionnel. Mes douleurs ont disparu !",
          publishedAtDate: "2025-02-10T10:00:00Z",
        },
        {
          name: "XSS User",
          stars: 5,
          text: '<script>alert("xss")</script>Super thérapeute !',
          publishedAtDate: "2025-02-05T10:00:00Z",
        },
        {
          name: '<b onclick="hack()">Hacker</b>',
          stars: 5,
          text: "Normal review text with clean content.",
          publishedAtDate: "2025-01-25T10:00:00Z",
        },
      ],
    },
  ];

  it("filters correctly: only 5-star reviews with text", () => {
    const { filtered, totalFiveStar } = filterAndNormalizeReviews(mockApifyData);

    // 5-star reviews with text: Marie, Jean, Thomas, XSS User, Hacker = 5
    // Excluded: Pierre (4★), Sophie (empty text), Lucas (3★), Camille (whitespace), Emma (1★)
    expect(filtered).toHaveLength(5);
    expect(totalFiveStar).toBe(5);

    // All should have rating 5
    expect(filtered.every((r) => r.rating === 5)).toBe(true);

    // All should have non-empty reviewText
    expect(filtered.every((r) => r.reviewText.trim().length > 0)).toBe(true);
  });

  it("sorts by date newest first", () => {
    const { filtered } = filterAndNormalizeReviews(mockApifyData);

    // Expected order by date: Thomas (Feb 10), XSS User (Feb 5), Marie (Feb 1), Hacker (Jan 25), Jean (Jan 10)
    expect(filtered[0].reviewerName).toBe("Thomas Vert");
    expect(filtered[1].reviewerName).toBe("XSS User");
    expect(filtered[2].reviewerName).toBe("Marie Dupont");
  });

  it("sanitizes HTML from review text", () => {
    const { filtered } = filterAndNormalizeReviews(mockApifyData);

    const xssReview = filtered.find((r) =>
      r.reviewText.includes("Super")
    );
    expect(xssReview).toBeDefined();
    expect(xssReview.reviewText).not.toContain("<script>");
    expect(xssReview.reviewText).not.toContain("alert");
    expect(xssReview.reviewText).toBe("Super thérapeute !");
  });

  it("sanitizes HTML from reviewer names", () => {
    const { filtered } = filterAndNormalizeReviews(mockApifyData);

    const hackerReview = filtered.find((r) =>
      r.reviewText.includes("Normal review")
    );
    expect(hackerReview).toBeDefined();
    expect(hackerReview.reviewerName).not.toContain("<b");
    expect(hackerReview.reviewerName).not.toContain("onclick");
    expect(hackerReview.reviewerName).toBe("Hacker");
  });

  it("preserves photo URLs and review URLs", () => {
    const { filtered } = filterAndNormalizeReviews(mockApifyData);

    const marieReview = filtered.find(
      (r) => r.reviewerName === "Marie Dupont"
    );
    expect(marieReview.reviewerPhotoUrl).toBe("https://photo1.url");
    expect(marieReview.reviewUrl).toBe("https://review1.url");
  });

  it("handles null photo/review URLs gracefully", () => {
    const { filtered } = filterAndNormalizeReviews(mockApifyData);

    const jeanReview = filtered.find(
      (r) => r.reviewerName === "Jean Bernard"
    );
    expect(jeanReview.reviewerPhotoUrl).toBeNull();
  });

  it("handles business with zero reviews", () => {
    const emptyData = [{ placeName: "Empty Business", reviews: [] }];
    const { filtered, totalFiveStar } =
      filterAndNormalizeReviews(emptyData);
    expect(filtered).toHaveLength(0);
    expect(totalFiveStar).toBe(0);
  });

  it("handles business with reviews but none 5-star with text", () => {
    const noFiveStarData = [
      {
        reviews: [
          { name: "A", stars: 4, text: "Good" },
          { name: "B", stars: 5, text: "" },
          { name: "C", stars: 3, text: "OK" },
        ],
      },
    ];
    const { filtered, totalFiveStar } =
      filterAndNormalizeReviews(noFiveStarData);
    expect(filtered).toHaveLength(0);
    expect(totalFiveStar).toBe(0);
  });

  it("caps at 15 reviews when more are available", () => {
    const manyReviews = {
      reviews: Array.from({ length: 30 }, (_, i) => ({
        name: `User ${i}`,
        stars: 5,
        text: `Review text ${i} - great service!`,
        publishedAtDate: new Date(2025, 0, i + 1).toISOString(),
      })),
    };
    const { filtered, totalFiveStar } = filterAndNormalizeReviews([
      manyReviews,
    ]);
    expect(filtered).toHaveLength(15);
    expect(totalFiveStar).toBe(30);
    // Should have the 15 newest (Jan 16-30)
    expect(filtered[0].reviewerName).toBe("User 29");
  });
});
