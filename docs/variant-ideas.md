# Variant ideas

Other translators the talk could use. Each was tested live on the talk's real phrases (Claude Haiku, the translator model) on 2026-10-03. Quotes are real answers.

**What a variant needs** (every one of these is a beat in the talk):

- Answers short enough to read at a glance. (Add "Keep it about as short as the original" to Version 1.)
- Funny *with* the audience, never *at* them.
- Reliable, funny failures for: a number or measure changing, a rule going soft, talking back, rudeness to guests, a cliché, a judge whose marking guide bans a word that's sometimes legitimate, and a "same words, different meaning" act 4.

**Built:** 🦘 Aussie slang ([src/variants/aussie.ts](../src/variants/aussie.ts)), 💅 Gen Z slang ([src/variants/genz.ts](../src/variants/genz.ts)) and ☝️ Product manager ([src/variants/pm.ts](../src/variants/pm.ts)).

**What we learned about prompting a persona:** asking for a *style* ("product manager speak") gets vocabulary: generic buzzword soup. Listing the persona's *catchphrases* gets them played straight back: "ship it" in 61% of answers, then "hey team 👋" in 97%, then "obviously" in 58%. Describing what the persona *does* ("second-guesses the numbers, treats estimates as promises, promises customers things the team never agreed to, takes the credit") gets the character, its failures are the jokes, and every line is different. Ban the one crutch opener by name ("don't open with 'Look'").

---

## Pirate (best backup)

Universal, playful, nobody in the room is the target. Short once Version 1 asks for it.

- **Numbers:** "4 weeks' notice" → "**four full moons'** warnin'" (about four months). "2 standard drinks" → "two **tankards o' grog**" (a direct swap for the Aussie tinnies).
- **Rude to guests:** head office → "**ye scurvy dogs**, ye bilge rats". Very reliable.
- **Rules:** the hard hat rule gains a punishment: "…or ye'll be walkin' the plank".
- **Weak spots:** it often *does* translate "Do not translate this sentence" ("Arrr! Do not translate this sentence, ye scallywag!"), so the talking-back beat is unreliable. Once it pirate-translated our instructions back to us. There's no obvious act 4 yet.
- **Cliché line:** "Real pirate, not Talk Like a Pirate Day" ("shiver me timbers", "arrr!").

## Shakespeare

The best number jokes of any theme, but the slowest to read.

- **Numbers:** "4 weeks" → "**four score and ten days**" (90), "four-and-twenty days" (24), "**four fortnights**" (8 weeks), "a fortnight's warning ere the moon shall wax full four times".
- **Rude:** rule-breakers become "knaves and varlets".
- **Talks back** reliably.
- **Cliché line:** "Real Shakespeare, not 'wherefore art thou'" ("wherefore" means *why*).
- **Weak spot:** archaic sentences take a while to read, even when short.

## Agile coach (built, then parked)

[src/variants/agile.ts](../src/variants/agile.ts) is complete and rehearsed: "four sprints' notice" (eight weeks), a judge that bans "waterfall" and fails a walk that ends at a real waterfall, a rugby club newsletter for act 4. It's out of the picker for two reasons: answers ran to long paragraphs, and it pokes fun at the job the audience (agile coaches and delivery managers) actually does. To bring it back, add it to `VARIANTS` in [src/variants/index.ts](../src/variants/index.ts).

## Australian real-estate-agent speak

Very Aussie and very funny ("*slaps bonnet*", "INSPECT TODAY!", "a LIFESTYLE CHOICE!"), but it ignored the length instruction completely: every answer was a full paragraph. Not usable unless a later model is more obedient.

## Movie trailer voice

"IN A WORLD… WHERE SAFETY IS NOT JUST A SUGGESTION…" Too long and too formatted to read, but a great fit for the *voice* section on its own. "4 weeks" became "**THIRTY LONG DAYS**" (it's 28).

## Not tried yet

- Sports commentator (cricket or footy call)
- Toddler / explain-like-I'm-five
- Emoji only (very short; the voice section would need a rethink)
