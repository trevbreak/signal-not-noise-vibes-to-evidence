# Talk track: “Your AI feature works in the demo. Now prove it.”

Generated from `src/talk/content.ts` by `npm run talk-track`. Edit the lines there, not here: the presenter window shows the same text.

Each numbered line is one press of → (or the clicker). Quoted words are what to say; the rest is what to do. Make the words your own: the beats matter more than the phrasing.

| Movement | Finish by | Beats |
| --- | --- | --- |
| 1 · The demo | 6.5 min | 9 beats, 24 presses |
| 2 · Say what good is | 12.5 min | 6 beats, 22 presses |
| 3 · Check every answer | 16.5 min | 4 beats, 11 presses |
| 4 · Make it better | 21 min | 6 beats, 13 presses |
| 5 · Ship it? | 23.5 min | 3 beats, 7 presses |

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
5. “At a glance it looks fine: there's still a notice period in it, and it still reads like a policy. Now, a PM making up an estimate, that's pretty normal. But this is an HR policy, and it shouldn't be made up. One small change, and it significantly changes the meaning: it's hallucinated a totally different HR policy, one with a real impact on people. It's incredibly easy to build and deploy solutions to problems like this. But miss the small details, and you can create big consequences.”

### 1.4 · Hold: a great demo isn't a shippable product

1. “A great demo doesn't mean a shippable product.” Say it once, slowly. Then let the title card do the rest.

### 1.4 · Title drop

1. Introduce yourself in one line. “So how do we get from a great demo to something we'd be confident shipping to customers? That's what today is about: taking our PM Translator from vibes to evidence.”

### 1.5 · Five tries, five answers

1. “So was that just bad luck? Let's test a bit further. One thing that catches people out with AI is that it isn't like normal software: ask it the same thing twice, and you can get two quite different answers. So let's take a rule off our engineering wiki and run it through the PM Translator five times, with the same prompt each time.”
2. Point at the outlined words as they appear. “Only one of these kept the rule. The others have each changed it in their own way: ‘not this Friday’, ‘fine if you're organised’, and ‘let's avoid’.”
3. “Five tries, and five different answers. Only one out of five kept the rule. If we'd only tested it once and happened to get try three, we'd have said it works and shipped it. That's how those small changes with big consequences sneak through. It depends on how you test, and something that passes once can easily fail over five tries, or five thousand. So we still don't know how reliable it is.”

### 1.5 · Version 2: more rules

1. “So we do what most of us do when we see it fail: we add more instructions to the prompt. One to stop it talking back, and a couple of notes from the boss: make it more PM, and keep it short. That gives us version 2 of our PM Translator: more rules, by gut feel.” Three lines type in green.
2. “Then we run the same notices through version 1 and version 2, side by side.” The pairs deal in.
3. “So, hands up if you can tell me which of these got better?” Let them try. Nobody can say for sure.

### 1.5 · Hold: we can't tell

1. “Some are better, some are worse, and it really depends on what you think ‘better’ means. We've added more rules to the prompt, but we've no way of checking whether it actually followed them. And next week someone changes one line of the prompt, breaks what we fixed today, and we'd never know. We're still on vibes.”

## 2 · Say what good is

### 2.1 · Chapter: the loop with a gap

1. “If you've built product before, you'll know this loop: build, measure, learn. I'd add one more step at the front, which is define.”
2. “And with the PM Translator, we skipped straight to build. We built it, ran a few notices through it, and hoped for the best.”
3. “The reason we're stuck on vibes is that we never said what a good translation looks like. Without that, we can't measure it, and we can't learn from it. All we can do is build, get a feeling, and build again. So let's fill that gap, together.”

### 2.2 · The room writes the rules

1. “So instead of telling the PM Translator what to do, let's start with define, and say what a good translation looks like. What must never change when we rewrite a notice into PM-speak? I'll start you off: numbers and dates stay put. Four weeks should stay four weeks, however confident our PM sounds.” *(keys: E retype the card in the room's words)*
2. “What else? Shout.” E to retype the card in their words; Enter to keep it. *(keys: E retype · Enter keep)*
3. “Good. What else?” *(keys: E retype · Enter keep)*
4. “And it still has to sound like a PM, or nobody reads it. That's the whole point of the product.” *(keys: E retype · Enter keep)*
5. “Two of these are a bit different. If we break the number or the rule, it doesn't matter how funny the rest is, it's an instant fail. That's exactly the mistake we nearly shipped earlier. In eval-speak these are called invariants, and that's the only time you'll hear that word today.”
6. “And there are some things we're deliberately not judging yet, like emoji, how long it is, or whether it's actually funny. We might come back to them later. Writing down ‘not now’ is a decision too, and it saves us having the same debate every week.”

### 2.3 · Be the judge

1. “Now let's measure, by hand for now. Here are three real answers the PM Translator gave to the Friday notice. Mark them against your rules. Hands up: is A good or bad?” Press 1 (mostly good) to 5 (mostly bad), or → for the usual. *(keys: 1–5 the room's split)*
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
2. “Then we do it again, and again, across the notices we've collected.” The rest arrive. “Notice which column is biggest.” Don't point out the tech-debt card: 4.1 comes back to it.
3. “Good examples show the PM Translator what to copy, and bad ones, with the reason why, show it what to avoid. The borderline ones show where our own rules are still fuzzy. We've got twelve here, but in a real product you'd want hundreds.”

### 2.5 · Hold: bad examples teach

1. Let it sit. “A reason tells whoever picks this up next, a person or an AI, what to actually fix.”

## 3 · Check every answer

### 3.0 · Recap: we can't vote on ten thousand a day

1. “So let's take stock. We built the PM Translator, we defined what a good translation looks like, and then we measured some real answers against those rules ourselves, by hand.”
2. “But it took a whole room of people to mark three answers. If we shipped this, it might get ten thousand notices a day, and we can't vote on all of those. So we need something that checks every answer for us.”

### 3.1 · The prompt and the judge

1. “That's where a judge comes in, and it's worth being clear on how it's different from the prompt. The prompt is what we tell the PM Translator to do. It's a request, and the AI does its best.”
2. “A judge is a separate check that looks at what it actually produced, and marks it against one of our rules, with a reason. So why not just put all the rules in the prompt? We should put them in there too. But we saw with version 2 that adding rules to a prompt doesn't mean they get followed. You don't get to mark your own homework.”
3. “And a judge isn't quite like a normal software test either. A normal test says: put this in, and you'll get exactly this out. But we saw five tries give five different answers. So a judge doesn't look for exact words. It checks whether our rules still hold.”

### 3.2 · Rules become judges, run on everything

1. “So each of our rules becomes a judge, and they're not all the same. Some are just code, the kind of test your engineers already write: is there still a number in the answer? That's cheap and instant. Others need judgement, like ‘is let's avoid still a never?’, so we use a second AI that reads our rule and our golden examples and marks the answer. And the borderline ones still go to people. We start with the cheapest.”
2. “Now we can test much further than a handful of notices. Here's version 2 running on every notice we've collected, with every judge checking every translation.” The montage runs, with the room's own notices in it. Let it play.
3. “And that's what an eval is: our rules, checked on every answer, every time. Green passed, red failed.”

### 3.3 · Zoom in: why you need different judges

1. “Let's zoom in on one we know well: the HR leave policy we nearly shipped.”
2. Stamps land one at a time. “Look at the first judge. It's a simple code check: is there still a number? And it passes, because two is still a number. That's the limit of simple tests. That simple check made exactly the same mistake we did at a glance. But the ‘rule stays a rule’ judge reads it properly and catches that four weeks became two. And ‘nothing added’ catches ‘I already told everyone’.”
3. “So it fails. It's the same answer we nearly shipped to customers, but this time it was caught automatically, and we know why.”

## 4 · Make it better

### 4.0 · Chapter: fix the judge first

1. “So now the judges are marking every translation, and we want to use what they tell us to make the PM Translator better. But there's an order to it. Before we fix the translator, we check the checker. Because if the judge is wrong, every score it gives us is wrong.”

### 4.1 · A judge that's wrong

1. “Here's one from our release notes: ‘The release is delayed so we can pay down tech debt.’ And the PM Translator's done a pretty good job. It kept the facts, and it sounds like a PM. But one of our judges fails it: ‘nothing added’.”
2. “Its reason is that it ‘waves work away as tech debt’. When we wrote this judge, our bad examples were full of the PM dodging work, like this one from the golden wall: ‘Classic tech debt, we'll sort it in v2’. So the judge learned to flag the words ‘tech debt’, not the idea. Here, paying down tech debt is the actual reason for the delay. It might be the most honest thing our PM has said all day.”
3. “So the judge is wrong, and that matters more than it looks. If we trusted it, we'd go and ‘fix’ the prompt to please a broken judge. So we always check the judge first, and then fix the prompt.”

### 4.2 · Reasons, then drop-downs

1. “So how do we fix things without guessing? It starts with something you've already done today. For every fail, someone who knows the work says whether they agree with the judge, and writes down why, in their own words. That's the reasoning.” The reasons type in.
2. “Then we tag each reason with a drop-down: the handful of ways the PM Translator goes wrong. Four here. After a few hundred reviews, those drop-downs tell us which problems we have and how often. That's evidence, not vibes.”
3. “And every drop-down tells us what to fix. Where we disagreed with the judge, the judge needs fixing, so that pile goes first. Where we agreed, the answer really is bad, so the prompt needs fixing.”

### 4.3 · The reasons go to an AI

1. “Then, rather than us guessing at fixes by hand, we give the reasons and the drop-downs to an AI, and ask it to rewrite the judge and the prompt. We don't tell it how to fix anything, just what went wrong, and why.”
2. “Judge first. Our blunt tech debt line is gone, replaced with what we actually meant: catch work being waved away, not the words.”
3. “Then the prompt. Version 3 stops listing a PM's bad habits, and describes what a good translation looks like instead, straight from your reasons.”

### 4.4 · Did it work?

1. “So did it work? We re-ran the same notices through every version, with the fixed judges checking. Out of every ten translations, the first version got none right. Adding rules by gut feel: still barely any. Improved from your reasons: seven out of ten. And because it's measured, we can actually show that.”
2. “And that's the pattern you'll see with most AI features. Getting something quite good happens quickly: that took us an afternoon. But getting it extremely good, good enough to trust with an HR policy, takes a lot more time and work. The evals are how you know whether that work is paying off.”

### 4.5 · Chapter: the loop, closed

1. “So that's the loop. We defined what good looks like, built it, measured every answer with judges, and learned from the reasons, feeding them back, judge first and then the prompt. And because the improving is automated now, we can go round again tonight, and every night after. People are still part of it, but now we can go round much faster.”

## 5 · Ship it?

### 5.1 · How good is good enough?

1. “So, back to the question from the start: should we ship it? Earlier we were reluctant without knowing how reliable it was, and now we can measure that. But how good it needs to be depends on what you're trying to achieve, and the quality you need.”
2. “At one end, a Friday drinks email. Vibes are fine. Version 1 would have done, and if it's a bit off, nobody gets hurt.”
3. “At the other end, our HR leave policy. Every rule we wrote today, both instant fails passing every time, and a human still signs off. Most things sit somewhere in between. Your job is to decide where, write it down before you see the results, and measure against it every time you change something.”

### 5.2 · The leave policy ships, from vibes to evidence

1. “And here's that same HR leave policy, through everything we built today. Four weeks stays four weeks. It's the same answer you'd have put on the good side of the golden wall. Every judge passes it, a human signs it off, and now we can ship it, with the evidence to back it up.”
2. “Remember the needle? At the start, the room put us firmly on vibes, and you were right. You wrote the rules and marked the answers, and the reasons behind them fixed the judge and the prompt. That's what moved it from vibes to evidence.” The needle swings across.

### 5.3 · Close

1. “A great demo doesn't mean a shippable product. So say what good looks like, and then prove it.”
2. “Thank you.”

