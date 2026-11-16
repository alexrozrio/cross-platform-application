import { describe, expect, it } from "vitest";
import { QUIZ_BANKS, QUIZ_LEVEL_IDS, QUIZ_SUBJECT_IDS, quizBank } from "@workspace/api-zod/quiz";

describe("quiz question banks", () => {
  it("has a bank for every subject", () => {
    for (const subject of QUIZ_SUBJECT_IDS) {
      expect(QUIZ_BANKS[subject], `missing bank for ${subject}`).toBeDefined();
    }
  });

  for (const subject of QUIZ_SUBJECT_IDS) {
    for (const level of QUIZ_LEVEL_IDS) {
      it(`${subject}/${level} bank is well-formed`, () => {
        const questions = quizBank(subject, level);
        // Must have enough questions for the largest round (expert = 12).
        expect(questions.length).toBeGreaterThanOrEqual(12);

        const ids = new Set<string>();
        const texts = new Set<string>();
        for (const q of questions) {
          expect(ids.has(q.id), `duplicate id ${q.id}`).toBe(false);
          ids.add(q.id);
          expect(texts.has(q.text), `duplicate question: ${q.text}`).toBe(false);
          texts.add(q.text);

          expect(q.options).toHaveLength(4);
          expect(new Set(q.options).size, `duplicate options in ${q.id}`).toBe(4);
          expect(Number.isInteger(q.answer)).toBe(true);
          expect(q.answer).toBeGreaterThanOrEqual(0);
          expect(q.answer).toBeLessThan(q.options.length);
          expect(q.options[q.answer]?.length).toBeGreaterThan(0);
        }
      });
    }
  }

  it("has no question appearing in two levels of the same subject", () => {
    for (const subject of QUIZ_SUBJECT_IDS) {
      const seen = new Map<string, string>();
      for (const level of QUIZ_LEVEL_IDS) {
        for (const q of quizBank(subject, level)) {
          const prev = seen.get(q.text);
          expect(prev, `"${q.text}" appears in both ${prev} and ${level}`).toBeUndefined();
          seen.set(q.text, level);
        }
      }
    }
  });
});
