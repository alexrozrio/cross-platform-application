PATH = "src/pages/snake.tsx"
src = open(PATH, encoding="utf-8").read()

def rep(old, new, count=1):
    global src
    n = src.count(old)
    assert n >= count, f"anchor not found ({n}): {old[:90]!r}"
    src = src.replace(old, new, count)

# tick: remove wonNow branch
rep("""    if (result.ate) sounds.note();
    if (result.died) { sounds.click(); finishRound(nextState); }
    else if (result.wonNow) { sounds.complete(); finishRound(nextState); }""",
    """    if (result.ate) sounds.note();
    if (result.died) { sounds.click(); finishRound(nextState); }""")

# effect deps: remove .won
rep("game?.state.foodsEaten, game?.state.alive, game?.state.won]);",
    "game?.state.foodsEaten, game?.state.alive]);")
rep("[game?.savedAt, game?.state.alive, game?.state.won, paused]);",
    "[game?.savedAt, game?.state.alive, paused]);")
rep("}, [game?.state.foodsEaten, game?.state.alive, game?.state.won, game?.challengeId]);",
    "}, [game?.state.foodsEaten, game?.state.alive, game?.challengeId]);")

# displays: foodsEaten/target -> foodsEaten (JSX braces)
rep("{game.state.foodsEaten}/{cfg.foods} apples eaten", "{game.state.foodsEaten} apples eaten")
rep("{game.state.foodsEaten}/{cfg?.foods ?? 0}", "{game.state.foodsEaten}")
rep("`${game.state.foodsEaten}/${cfg.foods}`", "`${game.state.foodsEaten}`")
rep("{saved.state.foodsEaten}/{SNAKE_LEVELS[saved.difficulty].foods} apples", "{saved.state.foodsEaten} apples")
rep("({game?.state.foodsEaten ?? 0}/{cfg?.foods ?? 0} apples)", "({game?.state.foodsEaten ?? 0} apples)")
rep("You finished with {game.state.foodsEaten}/{cfg.foods} apples.", "You finished with {game.state.foodsEaten} apples.")
# template literal in shareResult
rep("${game.state.foodsEaten}/${cfg.foods} apples in ${fmt(elapsed)}!", "${game.state.foodsEaten} apples in ${fmt(elapsed)}!")

# level buttons: foods -> endless
rep("{level.gridSize}×{level.gridSize} · {level.foods} apples", "{level.gridSize}×{level.gridSize} · endless apples")

# rules dialog
rep("<p>Guide the snake to eat every apple and complete the round.</p>",
    "<p>Guide the snake to eat apples for as long as you can — the run only ends when you crash.</p>")
rep('"Eat apples to grow — every apple brings you closer to the round target.",',
    '"Eat apples to grow — there is no limit, every apple is bonus score.",')
rep('"Eat the target number of apples to complete the round — speed and clean paths score more.",',
    '"The run ends only when you hit a wall or your own tail — survive longer and eat more for a bigger score.",')

open(PATH, "w", encoding="utf-8").write(src)
print("snake.tsx patched OK")
