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

1. “A quick prompt with a few simple instructions, and we have a working translator. Years ago that would have been a whole start-up. Now it's so trivial that anyone can do it. But how good is it, and should we ship it? Would the room say it's built on vibes, or built on evidence?” Move the needle with the room: ↑ toward Evidence, ↓ toward Vibes. → when they've settled. *(keys: ↑ ↓ move the needle · → lock it in)*
2. Locked. “That much?”
3. It snaps to Vibes. “Of course, this is all vibes. It sounds like a PM we might have worked with, but we'd be reluctant to ship this to customers without knowing just how reliable it is.”

### 1.4 · The reveal

1. “Let's test further, to see if this is something we should ship.” The three answers come back.
2. “Let's try translating this HR policy on leave.” The leave answer comes forward. Let them read it.
3. “The notice said four weeks.”
4. “Yet our translator changes the meaning, and turns four weeks into two. Like all product managers seem to do!”
5. “One small change, and it significantly changes the meaning: it's hallucinated a totally different HR policy, one with a real impact on people. It's incredibly easy to build and deploy solutions to problems like this. But miss the small details, and you can create big consequences.”

### 1.4 · Hold: a great demo isn't a shippable product

1. “A great demo doesn't mean a shippable product.” Say it once, slowly. Then let the title card do the rest.

### 1.4 · Title drop

1. Introduce yourself in one line. “So how do we get from a great demo to something we'd be confident shipping to customers? That's what today is about: taking our PM Translator from vibes to evidence.”

### 1.5 · Five tries, five answers

1. “So was that just bad luck? Let's test a bit further. One thing that catches people out with AI is that it isn't like normal software: ask it the same thing twice, and you can get two quite different answers. So let's take a rule off our engineering wiki and run it through the PM Translator five times, with the same prompt each time.”
2. Point at the outlined words as they appear. “Only one of these kept the rule. The others have each changed it in their own way: ‘not this Friday’, ‘fine if you're organised’, and ‘let's avoid’.”
3. “Five tries, and five different answers. One is right, and four are wrong in different ways. If we'd only tested it once and happened to get try three, we'd have said it works and shipped it. That's how those small changes with big consequences sneak through. It depends on how you test, and something that passes once can easily fail over five tries, or five thousand. So we still don't know how reliable it is.”

### 1.5 · Version 2: more rules

1. “So we do what most of us do when we see it fail: we add more instructions to the prompt. One to stop it talking back, and a couple of notes from the boss: make it more PM, and keep it short. That gives us version 2 of our PM Translator.” Three lines type in green.
2. “Then we run the same notices through version 1 and version 2, side by side.” The pairs deal in.
3. “So, hands up if you can tell me which of these got better?” Let them try. Nobody can say for sure.

### 1.5 · Hold: we can't tell

1. “Some are better, some are worse, and it really depends on what you think ‘better’ means. And next week someone changes one line of the prompt, breaks what we fixed today, and we'd never know. We're still on vibes.”

## 2 · Say what good is

### 2.1 · Chapter: the loop with a gap

1. “If you've built product before, you'll know this loop: build, measure, learn. I'd add one more step at the front, which is define.”
2. “And with the PM Translator, we skipped straight to build. We built it, ran a few notices through it, and hoped for the best.”
3. “The reason we're stuck on vibes is that we never said what a good translation looks like. Without that, we can't measure it, and we can't learn from it. All we can do is build, get a feeling, and build again. So let's fill that gap, together.”

### 2.2 · The room writes the rules

1. “So instead of telling the PM Translator what to do, let's say what a good translation looks like. What must never change when we rewrite a notice into PM-speak? I'll start you off: numbers and dates stay put. Four weeks should stay four weeks, however confident our PM sounds.” *(keys: E retype the card in the room's words)*
2. “What else? Shout.” E to retype the card in their words; Enter to keep it. *(keys: E retype · Enter keep)*
3. “Good. What else?” *(keys: E retype · Enter keep)*
4. “And it still has to sound like a PM, or nobody reads it. That's the whole point of the product.” *(keys: E retype · Enter keep)*
5. “Two of these are a bit different. If we break the number or the rule, it doesn't matter how funny the rest is, it's an instant fail. That's exactly the mistake we nearly shipped earlier. In eval-speak these are called invariants, and that's the only time you'll hear that word today.”
6. “And there are some things we're deliberately not judging yet, like emoji, how long it is, or whether it's actually funny. We might come back to them later. Writing down ‘not now’ is a decision too, and it saves us having the same debate every week.”

### 2.3 · Be the judge

1. “Now let's use those rules. Here are three real answers the PM Translator gave to the Friday notice. Mark them against your rules. Hands up: is A good or bad?” Press 1 (mostly good) to 5 (mostly bad), or → for the usual. *(keys: 1–5 the room's split)*
2. Read the reason. “That one's still a never, with a bit of PM attitude on top.” *(keys: 1–5 adjust)*
3. “B?” Hands. Expect a split. *(keys: 1–5 the room's split)*
4. Let the split sit. Don't resolve it yet. *(keys: 1–5 adjust)*
5. “C?” *(keys: 1–5 the room's split)*
6. “And that one's flipped the rule completely. An easy one.” *(keys: 1–5 adjust)*

### 2.4 · The split

1. “Let's look at B again, because the room didn't agree on it. The original says never, which is a hard rule with no exceptions. B says ‘let's avoid’, which is a much softer rule. It's more of a suggestion.”
2. “And notice what it didn't do. It didn't make up a date, and it didn't promise the client anything, so it sounds pretty harmless. But it's added just enough wiggle room that the rule means something different now: ‘never’ has become ‘try not to’. It's the same thing we saw with the leave policy: a small change in wording, with a big change in meaning.”
3. “So is that OK? The model can't answer that for us. It's a product decision: how strict does ‘never’ need to be for our team? The people who know the work should make that call, and write down why. And it's worth keeping these borderline ones, because they show us where our rules are still fuzzy.”

### 2.5 · The golden wall

1. “What you've just done has a name: golden examples. Real notices and real answers, marked by people who know the work, with the reason why. Your three go up first.”
2. “Then we do it again, and again, across the notices we've collected.” The rest arrive. “Notice which column is biggest.”
3. “Good examples show the PM Translator what to copy, and bad ones, with the reason why, show it what to avoid. The borderline ones show where our own rules are still fuzzy. We've got twelve here, but in a real product you'd want hundreds.”

### 2.5 · Hold: bad examples teach

1. Let it sit. “Hold onto that word, ‘reason’. It'll come back later.”

## 3 · Check every answer

### 3.0 · Recap: define, measure… at scale?

1. “So let's take stock of where we are. We built the PM Translator first, which is the bit everyone does.”
2. “Then we went back and defined what good looks like: four rules for a good PM translation, and two of them are instant fails.”
3. “Then we measured, by marking real answers against those rules ourselves and keeping them as golden examples, with the reasons. That's our first bit of evidence.”
4. “But it took a whole room of people to mark three answers by hand. If we shipped the PM Translator, it might get ten thousand notices a day, and we can't vote on ten thousand notices a day.”
5. “So we automate the checking. Each rule becomes an automatic check that runs on every single translation, every time. That automatic check is called a judge.”

### 3.1 · Your rules become judges

1. “Here are our rules for a good PM translation.”
2. “Each rule becomes a judge, and they're not all the same. Some are just simple code: is the 4 still there? That doesn't need AI, and it's instant. Some need judgement, like ‘is let's avoid still a never?’ For those, we use a second AI that reads our rule and our golden examples and marks the answer. And some still need people, for the ones that split the room like B did. We start with the cheapest and work our way up.”
3. “So now we can test much further than a handful of notices. Here's version 2 of our PM Translator running on every notice we've collected, with every judge checking every translation.” The montage runs, with the room's own notices in it. Let it play.
4. “And that's what an eval is: our rules, applied to every answer, every time. Green has passed, red has failed. And keep an eye on those last few rows, because we'll come back to them.”

### 3.2 · Zoom in: the leave notice, judged

1. “Let's zoom in on one we know well: our HR leave policy, the one we nearly shipped earlier.”
2. Stamps land one at a time. “Each judge gives us a verdict and a reason. The numbers judge spotted the 4 is gone. The rule judge spotted the notice period's been halved. And ‘nothing added’ caught that it's told everyone. It still passed ‘sounds like a PM’ with flying colours, which is exactly why it slipped past us in the demo.”
3. “Last judge is you. Room: thumbs?” Wait for them, then ↑ or ↓ (→ for thumbs down). *(keys: ↑ thumbs up · ↓ thumbs down)*
4. The room's stamp lands. “So it fails. It's the same answer we nearly shipped to customers, but this time it was caught automatically, and we know why.” *(keys: ↑ ↓ change the room's call)*

### 3.3 · Read the failures, hone the prompt

1. “Now we've got something we didn't have before: a list of failures, each with a reason. So we do what any good team would do, and we read through them.”
2. “And some patterns jump out pretty quickly. The numbers keep moving, and our PM keeps promising things nobody agreed to. Which, to be fair, is very on brand.”
3. “And remember those last few rows in the montage? Our PM keeps waving work away as ‘tech debt’, saying ‘we'll sort it in v2’. That one really bugged us.”
4. “So we fix it by hand. We add two new lines to the prompt, one for each pattern: keep every number, and don't promise anything. That's version 3 of our PM Translator.”
5. “And that tech debt habit annoyed us so much that we changed a judge as well, with a new rule: any answer that says ‘tech debt’ fails. Remember that rule, because it'll come back.”

### 3.4 · Better, and proven. Partly.

1. “So did it work? Here's the same leave policy, five tries for each version of the prompt, with every judge marking. Each bar is how many of the five tries passed every judge. Version 1 got none. Version 2, where we added rules by gut feel, also got none. And version 3, where we read the failures, got two.”
2. “That's the first time today we can say the PM Translator actually got better, and show the evidence for it. And you can see the needle starting to move.”
3. “But two out of five still isn't something we'd ship to customers. And look at what it took: we added lines that argue with the first line of our own prompt. People are great at spotting failures, but we're not always great at fixing them without breaking something else. Hold that thought.”

## 4 · Learn from the reasons

### 4.0 · Chapter: learn

1. “So the judges are marking every translation now. But remember, we wrote those judges ourselves, by hand, a few minutes ago. So who's checking the judges?” Beat. “That's you.”

### 4.1 · A judge is wrong

1. “Here's one from our release notes, run through version 3: ‘The release is delayed so we can pay down tech debt.’”
2. Stamps land. “Three passes, and one fail, on ‘nothing added’.”
3. “But if we read why, it's failed because it says ‘tech debt’. That's the rule we added by hand a few minutes ago. Except here, tech debt isn't an excuse at all. Paying it down is the actual reason for the delay. It might be the most honest thing our PM has said all day.”
4. “So: agree with the judge, or disagree? Hands.” 1 (agree) to 5 (disagree), or → for the usual. *(keys: 1–5 agree … disagree)*
5. “The judge did exactly what we told it to. We just told it the wrong thing. That's what happens when we fix things by gut feel: we spot the problem, and the fix quietly breaks something else. Another small change with a big consequence.” *(keys: 1–5 adjust)*

### 4.2 · Write the reasoning

1. “So how do we fix things without guessing? It starts with something you've already done today. When someone reviews an answer, they don't just agree or disagree with the judge. They write down the reason, in their own words.”
2. “Here are a few from our team.” The reasons type in. “And notice the last one. That's the room, overruling the judge.”
3. “Just saying ‘wrong’ doesn't teach it anything. The reason why is what teaches it.”

### 4.3 · Group them into drop-downs

1. “Once we've got a pile of reasons, we read through them and group them into a few drop-downs: the handful of ways our PM Translator actually goes wrong.” The reasons sort themselves.
2. “Now our feedback has a shape. Instead of ‘it feels a bit off’, we know which problems we have, and how often they happen. That's evidence, not vibes.”
3. “And every drop-down points to what needs fixing. If we agreed with a fail, the answer really is bad, so the prompt needs fixing. If we disagreed, the judge got it wrong, so the judge needs fixing.”

### 4.4 · Let the reasons rewrite it

1. “And here's the big shift. Last time, we read the failures, edited things ourselves, and broke a judge along the way. This time, we hand the reasons and drop-downs to an AI and ask it to rewrite the prompt and the judge. We don't tell it how to fix anything, just what went wrong, and why.”
2. “So it rewrote the prompt. Version 4 stops listing a PM's bad habits, and describes what a good translation looks like instead, straight from your reasons.”
3. “And it rewrote the judge. Our blunt ‘tech debt’ rule is gone, and it's been replaced with what we actually meant: catch work being waved away, rather than banning the words.”

### 4.5 · Did it work?

1. “So did it actually get better? To keep it a fair fight, it's the same six notices, five tries each, and the same judges. The top bars are how often the PM Translator passes every judge. Version 3, which we fixed by hand, passed seven out of thirty. Version 4, rewritten from your reasons, passed twenty-one.”
2. “And the bottom bars are how often the judge agrees with the room. With our hand-written tech debt rule, it agreed four times out of six. Rewritten from your reasons, it agreed on all six.”

### 4.5 · Chapter: the loop, closed

1. “So we've defined what good looks like, built it, measured it with judges, and learned from the reasons. And because the improving is automated now, we can go round that loop again tonight, and every night after. That's the loop, closed.”

### 4.6 · Months, not minutes

1. “Here's every version of the PM Translator on the same notices, with every judge marking. Adding rules by gut feel was barely better than the first two lines. Fixing it by hand was a step up. And rewriting it from your reasons is where it really jumps.”
2. “And none of them is done. Getting to 70 or 80% takes an afternoon. The last 20 points take months, and the evals tell you which months were worth it.”

## 5 · Ship it?

### 5.1 · Ship it? Depends who it's for

1. “So, back to the question from the start: should we ship it? Earlier we said we'd be reluctant to ship this to customers without knowing how reliable it is. Now we can actually measure that. But how reliable it needs to be depends on who it's for, because different things need different rules.”
2. “If it's a Friday drinks email, vibes are fine. Paste it into a chatbot, give it a read, and send it. If it's a bit off, nobody gets hurt, so there's no need for rules or judges.”
3. “A customer marketing email needs a few rules, like sounding like our brand and not promising anything we can't deliver, plus one instant fail: no made-up claims. The bar can sit a bit lower, say 80%, because a person reviews it before it goes out.”
4. “But the leave policy, the one we nearly got wrong at the start, needs every rule we wrote today and both instant fails. It needs to pass those a hundred percent of the time, and a human still signs off.”
5. “So some things can run on vibes, some need a few rules, and some need every rule and an instant fail. What matters is that you decide which, write those rules down before you see the results, and measure against them every time you change something.”

### 5.2 · The needle comes home

1. “Remember this? At the start, the room put us firmly on vibes, and that was the right call.”
2. “And here's the same HR leave policy we started with, through version 4 of our PM Translator. Four weeks stays four weeks. Every judge passes it, a human signs off, and now we can ship it, with the evidence to back it up. And you did that: you wrote the rules, marked the answers, gave the reasons, and overruled the judge.”

### 5.2 · Close

1. “A great demo doesn't mean a shippable product. So say what good looks like, and then prove it.”
2. “So here's some homework. This week, pick one AI feature you're working on and write five golden examples, each with a reason why. Make three of them bad ones. That's how you start moving from vibes to evidence.”
3. “Thank you.”

