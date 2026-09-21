import { Link } from "wouter";

const sectionClass =
  "rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 text-sm text-muted-foreground leading-relaxed";
const headingClass = "text-xl font-serif font-bold text-foreground";
const subheadingClass = "font-semibold text-foreground";

export function SudokuGuide() {
  return (
    <section aria-labelledby="sudoku-guide-title" className={sectionClass}>
      <div className="space-y-2">
        <h2 id="sudoku-guide-title" className={headingClass}>
          How to play Sudoku online
        </h2>
        <p>
          Sudoku is a logic puzzle built around three repeating constraints:
          every row, every column, and every box must contain each symbol once.
          The clues already on the board give you a starting point; the goal is
          to place the remaining symbols through deduction rather than guessing.
        </p>
        <p>
          Play Brain Games . Online includes smaller grids for learning the
          pattern, a Classic 9×9 board for the familiar Sudoku experience, and
          a Pro 16×16 board for a longer session. You can also use letters or
          themed images on supported grids when you want a different visual
          style.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-background/60 p-4">
          <h3 className={subheadingClass}>1. Scan for obvious placements</h3>
          <p className="mt-1">
            Look across a row, column, or box and ask which symbols are missing.
            If only one symbol can fit an empty cell, place it and scan the
            surrounding groups again.
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/60 p-4">
          <h3 className={subheadingClass}>2. Use candidate notes</h3>
          <p className="mt-1">
            When a cell has several possibilities, record small candidates
            instead of committing too early. Remove a candidate whenever the
            same symbol is placed in its row, column, or box.
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/60 p-4">
          <h3 className={subheadingClass}>3. Follow the constraints</h3>
          <p className="mt-1">
            A symbol may be missing from a box but only have one possible
            position in that box. This “hidden single” is often easier to see
            by checking the rows and columns that cross the box.
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/60 p-4">
          <h3 className={subheadingClass}>4. Pause before guessing</h3>
          <p className="mt-1">
            If the board feels stuck, review your notes and recent placements.
            A contradiction usually means a candidate was missed or a previous
            entry needs checking—not that a random guess is required.
          </p>
        </div>
      </div>

      <div>
        <h3 className={subheadingClass}>Choosing a Sudoku grid</h3>
        <div className="mt-2 overflow-x-auto rounded-xl border border-border/70">
          <table className="w-full min-w-[30rem] text-left text-xs sm:text-sm">
            <thead className="bg-muted/60 text-foreground">
              <tr>
                <th className="px-3 py-2 font-semibold">Grid</th>
                <th className="px-3 py-2 font-semibold">Good for</th>
                <th className="px-3 py-2 font-semibold">What to expect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              <tr>
                <td className="px-3 py-2 font-semibold text-foreground">3×3 or 4×4</td>
                <td className="px-3 py-2">First-time players</td>
                <td className="px-3 py-2">Short rounds with fewer symbols to track</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-foreground">6×6</td>
                <td className="px-3 py-2">A bridge to Classic Sudoku</td>
                <td className="px-3 py-2">More deductions while keeping the board compact</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-foreground">9×9</td>
                <td className="px-3 py-2">The standard Sudoku format</td>
                <td className="px-3 py-2">The best starting point for regular practice</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-foreground">16×16</td>
                <td className="px-3 py-2">Experienced solvers</td>
                <td className="px-3 py-2">A larger symbol set and a longer concentration challenge</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className={subheadingClass}>Sudoku questions</h3>
        <details className="rounded-xl border border-border/70 bg-background/60 px-4 py-3">
          <summary className="cursor-pointer font-semibold text-foreground">
            Is Sudoku a guessing game?
          </summary>
          <p className="mt-2">
            A well-formed Sudoku can be solved with deduction. Use notes and
            check the row, column, and box constraints before making a placement.
          </p>
        </details>
        <details className="rounded-xl border border-border/70 bg-background/60 px-4 py-3">
          <summary className="cursor-pointer font-semibold text-foreground">
            Which difficulty should I choose?
          </summary>
          <p className="mt-2">
            Easy is a gentle introduction, Medium adds more candidate work,
            Hard requires longer chains of deduction, and Expert is intended for
            players who enjoy a dense board. Start with a smaller grid if the
            Classic board feels too busy.
          </p>
        </details>
        <details className="rounded-xl border border-border/70 bg-background/60 px-4 py-3">
          <summary className="cursor-pointer font-semibold text-foreground">
            Can I play without an account?
          </summary>
          <p className="mt-2">
            Yes. Guest and offline play let you start a puzzle immediately.
            Signing in is optional and lets the site keep progress, results,
            rewards, and personal bests across devices.
          </p>
        </details>
      </div>

      <p className="text-foreground">
        Ready to solve?{" "}
        <Link href="/sudoku" className="font-semibold text-primary underline underline-offset-2">
          Choose a Sudoku grid
        </Link>{" "}
        or{" "}
        <Link href="/daily-challenge" className="font-semibold text-primary underline underline-offset-2">
          try today&apos;s daily challenge
        </Link>
        .
      </p>
    </section>
  );
}

export function MemoryGuide() {
  return (
    <section aria-labelledby="memory-guide-title" className={sectionClass}>
      <div className="space-y-2">
        <h2 id="memory-guide-title" className={headingClass}>
          How to play Memory Match online
        </h2>
        <p>
          Memory Match is a concentration game. Cards begin face-down, and you
          reveal two cards at a time to find matching pairs. A successful match
          stays visible; a mismatch turns face-down again, so remembering the
          location and appearance of each card is the heart of the game.
        </p>
        <p>
          Start with the 2×4 board for a quick introduction, then move through
          4×4, 4×8, and 8×8 boards as you become comfortable. The image, number,
          and letter display styles use the same board rules, so you can choose
          the format that is easiest to scan.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-background/60 p-4">
          <h3 className={subheadingClass}>1. Build a mental map</h3>
          <p className="mt-1">
            When a card is revealed, notice its position before looking for the
            next move. Even a brief location memory becomes useful when its pair
            appears later.
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/60 p-4">
          <h3 className={subheadingClass}>2. Use a consistent scan</h3>
          <p className="mt-1">
            Work through the board in a repeatable order instead of flipping
            cards randomly. A consistent scan makes it easier to remember which
            locations have already been checked.
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/60 p-4">
          <h3 className={subheadingClass}>3. Match known pairs</h3>
          <p className="mt-1">
            If you remember both locations of a pair, play them together before
            exploring. This clears the board and reduces the number of unknown
            cards you need to hold in memory.
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/60 p-4">
          <h3 className={subheadingClass}>4. Balance speed and accuracy</h3>
          <p className="mt-1">
            Faster play is not always better if it causes extra flips. First
            build a reliable memory of the board, then reduce hesitation as the
            layout becomes familiar.
          </p>
        </div>
      </div>

      <div>
        <h3 className={subheadingClass}>Choosing a board</h3>
        <div className="mt-2 overflow-x-auto rounded-xl border border-border/70">
          <table className="w-full min-w-[30rem] text-left text-xs sm:text-sm">
            <thead className="bg-muted/60 text-foreground">
              <tr>
                <th className="px-3 py-2 font-semibold">Board</th>
                <th className="px-3 py-2 font-semibold">Pairs</th>
                <th className="px-3 py-2 font-semibold">Best for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              <tr>
                <td className="px-3 py-2 font-semibold text-foreground">2×4</td>
                <td className="px-3 py-2">4</td>
                <td className="px-3 py-2">A short warm-up or a first game</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-foreground">4×4</td>
                <td className="px-3 py-2">8</td>
                <td className="px-3 py-2">Regular casual play</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-foreground">4×8</td>
                <td className="px-3 py-2">16</td>
                <td className="px-3 py-2">A longer memory challenge</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-foreground">8×8</td>
                <td className="px-3 py-2">32</td>
                <td className="px-3 py-2">Experienced players who want a marathon board</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className={subheadingClass}>Memory Match questions</h3>
        <details className="rounded-xl border border-border/70 bg-background/60 px-4 py-3">
          <summary className="cursor-pointer font-semibold text-foreground">
            How is the score calculated?
          </summary>
          <p className="mt-2">
            The result considers the board size, completion time, and number of
            flips. Larger boards provide a bigger challenge, while accurate and
            efficient play helps improve your personal result.
          </p>
        </details>
        <details className="rounded-xl border border-border/70 bg-background/60 px-4 py-3">
          <summary className="cursor-pointer font-semibold text-foreground">
            Which display style should I use?
          </summary>
          <p className="mt-2">
            Images are useful for visual association, numbers provide a simple
            neutral pattern, and letters are an alternative for players who
            prefer an alphabetic layout. All three styles use identical matching
            rules.
          </p>
        </details>
        <details className="rounded-xl border border-border/70 bg-background/60 px-4 py-3">
          <summary className="cursor-pointer font-semibold text-foreground">
            Can I pause and continue later?
          </summary>
          <p className="mt-2">
            The site can retain an unfinished session in the same browser for a
            limited period. If you sign in, completed results and progress can
            also be associated with your profile.
          </p>
        </details>
      </div>

      <p className="text-foreground">
        Ready to play?{" "}
        <Link href="/memory" className="font-semibold text-primary underline underline-offset-2">
          Choose a Memory Match board
        </Link>{" "}
        or{" "}
        <Link href="/memory-challenge" className="font-semibold text-primary underline underline-offset-2">
          open the Memory Match challenge
        </Link>
        .
      </p>
    </section>
  );
}