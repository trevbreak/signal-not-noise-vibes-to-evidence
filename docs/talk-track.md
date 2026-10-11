# Talk track: “Your AI feature works in the demo. Now prove it.”

Generated from `src/talk/content.ts` by `npm run talk-track`. Edit the lines there, not here: the presenter window shows the same text.

Each numbered line is one press of → (or the clicker). Quoted words are what to say; the rest is what to do. Make the words your own: the beats matter more than the phrasing.

| Movement | Finish by | Beats |
| --- | --- | --- |
| 1 · The demo | 6.5 min | 9 beats, 24 presses |
| 2 · Say what good is | 12 min | 6 beats, 22 presses |
| 3 · Check every answer | 17 min | 5 beats, 21 presses |
| 4 · Learn from the reasons | 22.5 min | 8 beats, 20 presses |
| 5 · Ship it? | 25 min | 3 beats, 10 presses |

## Before the talk

### 0 · Title (while people sit down)

1. Up while people arrive. When you're ready, → for the cold open.

## 1 · The demo

### 1.1 · Cold open

1. “Hands up if an AI demo blew your mind this year. Something a colleague built, something an engineer showed off, or something you knocked up yourself in an afternoon.” Wait for the hands.
2. “Keep it up if, when it went live, it was just as good.” Most go down. “That gap, between the demo and production, is what the next 25 minutes are about. So let's build a demo of our own, and watch the gap open up.”

### 1.2 · Build the PM Translator

1. “I'm a product manager, and I've got a problem: nobody reads the delivery team's notices. So, idea: an AI tool that rewrites them in the voice of the one person everyone definitely listens to. The product manager. The PM Translator.” The prompt types itself. “That's version 1 of the prompt. Two lines. That's the whole product. No code.”
2. “Let's try our PM Translator on some real notices we've collected from around the company. First, from the team Slack: ‘Good morning team, lunch is provided today.’” Read the answer in your best PM voice.
3. “From the kitchen: ‘The coffee machine is broken.’” Let the laugh land.
4. “And one off the HR wall: ‘Annual leave needs four weeks' notice.’” Read it fast and move on. Don't linger: it's the one that slips past.
5. “Give me one from your office. Something that deserves the PM treatment.” E to type it (or the box in this window), Enter to run it live through version 1. Take two at most. X removes the last one. *(keys: E type · Enter run · X remove last)*

### 1.3 · Ship it? The needle

1. “Ninety seconds, a handful of notices, and a working PM Translator. Twenty years ago that was a start-up. So: do we ship it? How sure are we? Tell me when to stop.” Tap or hold ↑ to push the needle toward Evidence while they cheer, ↓ to pull it back. → when they say stop. *(keys: ↑ ↓ move the needle · → lock it in)*
2. Locked. “That much?”
3. “Here's how much of that is evidence.” It snaps to Vibes. “None. We typed in a few notices, liked what came out, and called it done. That's vibes.”

### 1.4 · The reveal

1. “Let's look again at what we were about to ship.” The three answers come back.
2. “This one, from the HR wall.” The leave answer comes forward. Let them read it.
3. “The notice said four weeks.”
4. “Our PM Translator says two. And that it's already told the team.”
5. “It's one small detail. It sounds confident, it sounds exactly like a PM, and it was buried in a demo that felt great. That's the danger of moving fast: we skim, it sounds right, and a small detail slips through. This small detail halves everyone's notice period. We moved fast, and we accidentally shipped it.”

### 1.4 · Hold: the demo is not the evidence

1. “The demo is not the evidence.” Say it once, slowly. Then let the title card do the rest.

### 1.4 · Title drop

1. Introduce yourself in one line. “Today: how we get an AI feature like our PM Translator from a demo to evidence.”

### 1.5 · Five tries, five answers

1. “So was the leave notice just bad luck? Here's the thing about AI: it isn't like normal software. Ask it the same thing twice and you can get two different answers. So let's take a notice off the engineering wiki and run it through the PM Translator five times. Same notice, same prompt.”
2. Point at the outlined words as they appear. “One kept the rule. The others: ‘not this Friday’. ‘Fine if you're organised’. ‘Let's avoid’.”
3. “Five tries, five answers. One right, four different kinds of wrong. If we'd tested it once, and happened to get try three, we'd have said it works. That's how small changes with a big impact sneak through: it depends on how you test. What passes once can fail over five tries, or five thousand.”

### 1.5 · Version 2: more rules

1. “So we do what everyone does. We've seen it fail, so we add more rules to the prompt. One so it stops talking back, and two notes from the boss: more PM, and keep it short. PM Translator, version 2.” Three lines type in green.
2. “Then we run the same notices through version 1 and version 2, side by side.” The pairs deal in.
3. “So… which ones got better?” Let them try. Nobody can say for sure.

### 1.5 · Hold: we can't tell

1. “Some better, some worse, depending on what you think ‘better’ means. And next week someone changes one line of the prompt and breaks what we fixed today. We'd never know.”

## 2 · Say what good is

### 2.1 · Chapter: the loop with a gap

1. “If you've built product, you know this loop: build, measure, learn. I'm adding one step in front: define.”
2. “Here's what we did with the PM Translator. We skipped straight to build. We built it, ran it, and hoped.”
3. “We never said what a good translation looks like. So we can't measure it, and we can't learn from it. All we can do is build, get some vibes, and build again. Let's fill that gap, together.”

### 2.2 · The room writes the rules

1. “So instead of telling the PM Translator what to do, let's say what a good translation looks like. What must never change when we rewrite a notice into PM-speak? I'll start you off: numbers and dates stay put. Four weeks stays four weeks.” *(keys: E retype the card in the room's words)*
2. “What else? Shout.” E to retype the card in their words; Enter to keep it. *(keys: E retype · Enter keep)*
3. “Good. What else?” *(keys: E retype · Enter keep)*
4. “And it still has to sound like a PM, or nobody reads it. That's the whole point of the product.” *(keys: E retype · Enter keep)*
5. “Two of these are different. Break the number or the rule and it doesn't matter how funny the rest is: instant fail. In eval-speak, that's an invariant. You'll only hear that word once.”
6. “And some things we're deliberately not judging yet: emoji, how long it is, whether it's actually funny. We'll come back to them. Writing down ‘not now’ is a decision too. It stops the same argument every week.”

### 2.3 · Be the judge

1. “Now let's use those rules. Here are three real answers the PM Translator gave to the Friday notice. Mark them against your rules. Hands up: is A good or bad?” Press 1 (mostly good) to 5 (mostly bad), or → for the usual. *(keys: 1–5 the room's split)*
2. Read the reason. “Still a never. The attitude sits on top.” *(keys: 1–5 adjust)*
3. “B?” Hands. Expect a split. *(keys: 1–5 the room's split)*
4. Let the split sit. Don't resolve it yet. *(keys: 1–5 adjust)*
5. “C?” *(keys: 1–5 the room's split)*
6. “Reversed. Easy.” *(keys: 1–5 adjust)*

### 2.4 · The split

1. “Let's look at B again, because you didn't agree on it. The notice says never. That's a hard rule: no exceptions. B says ‘let's avoid’. That's a soft rule. A suggestion.”
2. “And notice what it didn't do. It didn't make up a date. It didn't promise the client anything. It sounds harmless. But it's added just enough wiggle room that the rule now means something different: ‘never’ has become ‘try not to’. Small words, big change.”
3. “So is that OK? The model can't answer that, and neither can a language expert. It's a product decision: how strict does ‘never’ have to be for our team? The people who know the work make that call, and write down the reason. Keep the borderline ones. They're where the rules are still fuzzy.”

### 2.5 · The golden wall

1. “What you just did has a name: golden examples. Real notices, real answers, marked by people who know the work, with the reason why. Your three go up first.”
2. “Then we do it again, and again, across the notices we've collected.” The rest arrive. “Notice which column is biggest.”
3. “Good examples show the PM Translator what to copy. Bad ones, with the reason, show what to avoid. Borderline ones show where our own rules are still fuzzy. Twelve here. In a real product, hundreds.”

### 2.5 · Hold: bad examples teach

1. Let it sit. “Hold onto that word: reason. It comes back.”

## 3 · Check every answer

### 3.0 · Recap: define, measure… at scale?

1. “Let's take stock. We built the PM Translator first. That's the bit everyone does.”
2. “Then we went back and defined good: four rules for a good PM translation, two of them instant fails.”
3. “Then we measured: we marked real answers against those rules ourselves, and kept them as golden examples, with the reasons.”
4. “But we marked three answers, by hand, with a room full of people. A real PM Translator gets ten thousand notices a day. You can't vote on ten thousand notices a day.”
5. “So we automate the checking. Every rule becomes an automatic check, run on every single translation, every time. That automatic check has a name: a judge.”

### 3.1 · Your rules become judges

1. “Here are our rules for a good PM translation.”
2. “Each one becomes a judge. Some are plain code: is the 4 still there? No AI needed, and it's instant. Some need judgement, like ‘is let's avoid still a never?’ For those, a second AI reads our rule and our golden examples, and marks the answer. And some still need people, for the ones that split the room. Cheapest first.”
3. “Now every translation gets checked by every judge. Here's PM Translator version 2 on every notice we've collected.” The montage runs, with the room's own notices in it. Let it play.
4. “That's an eval: our rules, applied to every answer, every time. Green passed, red failed. And keep an eye on those last few. We'll come back to them.”

### 3.2 · Zoom in: the leave notice, judged

1. “Let's zoom in on one row we know: the leave notice from the HR wall, through version 2.”
2. Stamps land one at a time. “Every judge gives a verdict and a reason. Numbers: the 4 is gone. Still a rule: the notice period's halved. Nothing added: it's told everyone. And it passed ‘sounds like a PM’ with flying colours. That's exactly why it fooled us.”
3. “Last judge is you. Room: thumbs?” Wait for them, then ↑ or ↓ (→ for thumbs down). *(keys: ↑ thumbs up · ↓ thumbs down)*
4. The room's stamp lands. “Fail. The same answer we nearly shipped, caught automatically this time, with the reasons why.” *(keys: ↑ ↓ change the room's call)*

### 3.3 · Read the failures, hone the prompt

1. “Now we've got something we never had before: a list of failures, each with a reason. So we do what any good team does. We read them.”
2. “And patterns jump out. The numbers keep moving. And the PM keeps promising things nobody agreed to.”
3. “And remember those last rows in the montage? The PM keeps waving work away as ‘tech debt’: ‘we'll sort it in v2’. That one really bugged us.”
4. “So we fix it by hand. Two new lines in the prompt, one for each pattern: keep every number, don't promise anything. PM Translator, version 3.”
5. “And that tech debt habit annoyed us so much, we changed a judge too. New rule: any answer that says ‘tech debt’ fails. Remember that rule. It comes back.”

### 3.4 · Better, and proven. Partly.

1. “Did it work? Same leave notice, five tries for each version of the prompt, every judge marking. The bar is how many of the five passed every judge. Version 1: none. Version 2, more rules by gut feel: none. Version 3, honed by reading the failures: two.”
2. “That's the first time in this talk we can say the PM Translator got better, and prove it. Look at the needle.”
3. “But two in five isn't shippable. And look what it took: we added lines that argue with the first line of our own prompt. People are great at spotting failures. We're not so great at fixing them without breaking something else. Hold that thought.”

## 4 · Learn from the reasons

### 4.0 · Chapter: learn

1. “The judges are marking every translation now. But remember: we wrote those judges ourselves, by hand, a few minutes ago. So who's checking the judges?” Beat. “You are.”

### 4.1 · A judge is wrong

1. “Here's a notice from the release notes, through PM Translator version 3: ‘The release is delayed so we can pay down tech debt.’”
2. Stamps land. “Three passes. One fail: nothing added.”
3. “Read why: it says ‘tech debt’. That's the rule we added by hand a few minutes ago. But here, tech debt isn't an excuse. Paying it down is the actual reason for the delay. It's the one honest sentence in the whole demo.”
4. “So: agree with the judge, or disagree? Hands.” 1 (agree) to 5 (disagree), or → for the usual. *(keys: 1–5 agree … disagree)*
5. “The judge did exactly what we told it. We told it the wrong thing. That's what happens when people fix things by gut feel: we spot the problem, and our fix breaks something else.” *(keys: 1–5 adjust)*

### 4.2 · Write the reasoning

1. “So how do we fix things without guessing? It starts with something you already did today. Whenever someone looks at an answer, they don't just say agree or disagree with the judge. They write the reason, in their own words.”
2. “Here's a few from our team.” The reasons type in. “Notice the last one: that's you, overruling the judge.”
3. “‘Wrong’ teaches nothing. The reason teaches everything.”

### 4.3 · Group them into drop-downs

1. “Once we've got a pile of reasons, we read them all and group them into a few drop-downs: the handful of ways our PM Translator actually goes wrong.” The reasons sort themselves.
2. “Now the feedback has a shape. Not ‘it feels a bit off’, but which problems, and how often.”
3. “And every drop-down points somewhere. Agree with a fail: the answer really is bad, so it's a fix for the prompt. Disagree: the judge got it wrong, so it's a fix for the judge.”

### 4.4 · Let the reasons rewrite it

1. “Here's the shift. Last time, we read the failures and edited the prompt ourselves, and broke a judge. This time, we hand the reasons and the drop-downs to an AI, and ask it to rewrite the prompt and the judge. We never tell it how to fix anything, only what went wrong, and why.”
2. “It rewrote the prompt. Version 4 stops listing habits, and describes what a good translation looks like, straight from your reasons.”
3. “And it rewrote the judge. Out goes our blunt ‘tech debt’ rule. In goes what we actually meant: catch work being waved away, not the words.”

### 4.5 · Did it work?

1. “Did it actually get better? A fair fight: the same six notices, five tries each, the same judges. Top: how often the PM Translator passes every judge. Version 3, honed by hand: seven in thirty. Version 4, rewritten from your reasons: twenty-one.”
2. “Bottom: how often the judge agrees with the room. With our hand-written tech debt rule: four in six. Rewritten from your reasons: all six.”

### 4.5 · Chapter: the loop, closed

1. “Define what good looks like. Build. Measure with judges. Learn from the reasons. And because the improving is automated now, we can go round again tonight, and every night. That's the loop, closed.”

### 4.6 · Months, not minutes

1. “Here's every version of the PM Translator on the same notices, every judge marking. More rules by gut feel: barely better than the first two lines. Honed by hand: a step up. Rewritten from your reasons: the jump.”
2. “And none of them is done. Getting to 70 or 80% takes an afternoon. The last 20 points take months, and the evals tell you which months were worth it.”

## 5 · Ship it?

### 5.1 · Ship it? Depends who it's for

1. “So, do we ship it? It depends who it's for, because different things need different rules.”
2. “A Friday drinks email? Vibes are fine. Paste it into a chatbot, read it, send it. If it's a bit off, nobody gets hurt. No rules, no judges.”
3. “A customer marketing email needs a few rules: sounds like our brand, promises nothing we can't deliver. One instant fail: no made-up claims. And the bar can sit lower, say 80%, because a person reviews it before it goes out.”
4. “The leave policy? Every rule we wrote today, and both instant fails. A hundred percent on those, and a human signs off.”
5. “Some things can run on vibes. Some need a few rules. Some need every rule and an instant fail. What matters is that you decide which, write the rules down before you see the results, and measure against them every time you change something.”

### 5.2 · The needle comes home

1. “Remember this? It started on vibes, pushed there by a demo that felt great.”
2. “Same notice we started with, through PM Translator version 4. Every judge passes it, a human signs off, and it ships behind the strictest gate. You wrote the rules, you marked the answers, you gave the reasons, and you overruled the judge.”

### 5.2 · Close

1. “The demo is not the evidence. Say what good looks like. Then prove it.”
2. “Homework. This week, pick one AI feature and write five golden examples, with a reason for each. Three of them bad. That's how it starts.”
3. “Thank you.”

