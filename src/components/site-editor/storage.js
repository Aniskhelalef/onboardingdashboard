// Shared localStorage utilities for the editor
// Replaces inline loadSaved pattern used in Index.tsx

export function loadSaved(key, fallback) {
  try {
    const saved = localStorage.getItem(`editor_${key}`);
    if (!saved) return fallback;

    const parsed = JSON.parse(saved);

    // Migration: Convert old paragraph1-5 to richTextPresentation
    if (key === 'content' && parsed && !parsed.aboutRichTextPresentation) {
      const paragraphs = [
        parsed.aboutParagraph1,
        parsed.aboutParagraph2,
        parsed.aboutParagraph3,
        parsed.aboutParagraph4,
        parsed.aboutParagraph5,
      ].filter((p) => p && p?.trim && p.trim());

      if (paragraphs.length > 0) {
        parsed.aboutRichTextPresentation = paragraphs.map((p) => `<p>${p}</p>`).join('');
      }

      // Clean up old fields
      delete parsed.aboutParagraph1;
      delete parsed.aboutParagraph2;
      delete parsed.aboutParagraph3;
      delete parsed.aboutParagraph4;
      delete parsed.aboutParagraph5;

      // Save migrated data back
      localStorage.setItem(`editor_${key}`, JSON.stringify(parsed));
    }

    return parsed;
  } catch {
    return fallback;
  }
}

export function saveTo(key, value) {
  try {
    localStorage.setItem(`editor_${key}`, JSON.stringify(value));
    // Mark that editor has unsaved changes (for publish button state)
    if (localStorage.getItem("sitePublished") === "true") {
      localStorage.setItem("editorHasChanges", "true");
    }
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
}
