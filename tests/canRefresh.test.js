import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase before importing the module
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { canRefresh } from "@/repositories/googleReviews";
import { supabase } from "@/lib/supabase";

function mockSupabaseQuery(data) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
  };
  supabase.from.mockReturnValue(chain);
  return chain;
}

describe("canRefresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when no source exists", async () => {
    mockSupabaseQuery(null);
    expect(await canRefresh("therapist-1")).toBe(true);
  });

  it("returns true when source has never been scraped", async () => {
    mockSupabaseQuery({
      id: "src-1",
      last_scraped_at: null,
      status: "pending",
    });
    expect(await canRefresh("therapist-2")).toBe(true);
  });

  it("returns false when currently scraping", async () => {
    mockSupabaseQuery({
      id: "src-1",
      last_scraped_at: new Date().toISOString(),
      status: "scraping",
    });
    expect(await canRefresh("therapist-3")).toBe(false);
  });

  it("returns false when scraped less than 15 days ago", async () => {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const nextRefresh = new Date(fiveDaysAgo);
    nextRefresh.setDate(nextRefresh.getDate() + 15);

    mockSupabaseQuery({
      id: "src-1",
      last_scraped_at: fiveDaysAgo.toISOString(),
      next_refresh_available_at: nextRefresh.toISOString(),
      status: "completed",
    });
    expect(await canRefresh("therapist-4")).toBe(false);
  });

  it("returns true when scraped more than 15 days ago", async () => {
    const twentyDaysAgo = new Date();
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
    const nextRefresh = new Date(twentyDaysAgo);
    nextRefresh.setDate(nextRefresh.getDate() + 15);

    mockSupabaseQuery({
      id: "src-1",
      last_scraped_at: twentyDaysAgo.toISOString(),
      next_refresh_available_at: nextRefresh.toISOString(),
      status: "completed",
    });
    expect(await canRefresh("therapist-5")).toBe(true);
  });

  it("returns true when scraped exactly 15 days ago", async () => {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    const nextRefresh = new Date(fifteenDaysAgo);
    nextRefresh.setDate(nextRefresh.getDate() + 15);

    mockSupabaseQuery({
      id: "src-1",
      last_scraped_at: fifteenDaysAgo.toISOString(),
      next_refresh_available_at: nextRefresh.toISOString(),
      status: "completed",
    });
    expect(await canRefresh("therapist-6")).toBe(true);
  });

  it("returns true when source failed (not scraping)", async () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    mockSupabaseQuery({
      id: "src-1",
      last_scraped_at: null,
      status: "failed",
    });
    expect(await canRefresh("therapist-7")).toBe(true);
  });
});
