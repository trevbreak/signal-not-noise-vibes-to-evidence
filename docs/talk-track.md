# Talk track: “Your AI feature works in the demo. Now prove it.”

Generated from `src/talk/content.ts` by `npm run talk-track`. Edit the lines there, not here: the presenter window shows the same text.

Each numbered line is one press of → (or the clicker). Quoted words are what to say; the rest is what to do. Make the words your own: the beats matter more than the phrasing.

| Movement | Finish by | Beats |
| --- | --- | --- |
| 1 · The demo | 7 min | 8 beats, 22 presses |
| 2 · Say what good is | 12.5 min | 5 beats, 19 presses |
| 3 · Check every answer | 16.5 min | 4 beats, 10 presses |
| 4 · Make it better | 21 min | 5 beats, 11 presses |
| 5 · Ship it? | 23.5 min | 3 beats, 7 presses |

## Before the talk

### 0 · Title (while people sit down)

1. Up while people arrive. When you're ready, → for the cold open.

## 1 · The demo

### 1.1 · Cold open

1. “Hands up if you've seen an AI demo this year that blew your mind. Something a colleague built, something an engineer showed off, or something you knocked up yourself in an afternoon.” Wait for the hands. Don't introduce yourself yet: the title card does that.
2. “Now, keep your hand up if it was just as good when it hit production. Just as impressive.” Most go down. “That gap, between the demo and production, is what we're going to talk about for the next 25 minutes. So we're going to build a demo of our own, and watch that gap open up.”

### 1.2 · Build the PM Translator

1. “So, I'm a product manager, and I've got a problem: nobody in my team reads the notices I send out. So I'm building a tool that rewrites them in the voice of the one person everyone listens to: the product manager. The PM Translator.” The prompt types itself. “Like most of us, I start with a prompt. That's version 1. Two lines, and that's the whole product. No code.”
2. “So let's try it on some real notices we've collected from around the company. First, from the team Slack: ‘Good morning team, lunch is provided today.’” Read the answer in your best PM voice.
3. “From the kitchen: ‘The coffee machine is broken.’” Let the laugh land. “That definitely sounds like a PM taking the credit.”
4. “And one off the HR wall: ‘Annual leave needs four weeks' notice.’” Read it fast and move on. Don't linger: it's the one that slips past.
5. “What about one from your world? Give me something from your office that deserves the PM treatment.” E to type it (or the box in this window), Enter to run it live through version 1. Take two at most. X removes the last one. *(keys: E type · Enter run · X remove last)*

### 1.3 · Ship it? The needle

1. “So, a quick prompt with a few simple instructions, and we've got a working translator. Years ago that would have been a whole start-up; now anyone can build it. But how good is it? Should we ship it? Is it built on vibes, or built on evidence? Up here at evidence, or down here at vibes?” Move the needle with the room: ↑ toward Evidence, ↓ toward Vibes. → when they've settled. *(keys: ↑ ↓ move the needle · → lock it in)*
2. Locked. “That much?”
3. It snaps to Vibes. “Of course, this is all vibes. It sounds like a PM we might have worked with, but we'd be reluctant to ship this to customers without knowing how reliable it is.”

### 1.4 · The reveal

1. “So let's start testing further, and see if we can turn this into something we can ship.” The three answers come back.
2. “Let's look at this HR leave policy.” The leave answer comes forward. Let them read it.
3. “The notice says four weeks.”
4. “But our translator has changed the meaning, and turned four weeks into two. Which, to be fair, is what product managers do with estimates.”
5. “And at a glance, it looks fine: there's still a notice period, and it still reads like a PM. But it's hallucinating, and this is an HR policy. One small tweak, and it's changed the meaning, with a real impact on people if we send it out. It's incredibly easy to build solutions like this, but miss the small details and you create big consequences.”

### 1.4 · Hold: a great demo isn't a shippable product

1. “A great demo doesn't mean a shippable product.” Say it once, slowly. Then let the title card do the rest.

### 1.4 · Title drop

1. Now introduce yourself. “I'm Trevor, I'm a principal product manager at Go1, and I look after our AI products. Today we're going to take that PM Translator from a great demo to something we can ship to customers. From vibes to evidence.”

### 1.5 · Five tries, five answers

1. “So was that just bad luck? This is the thing that catches people out all the time: AI isn't like normal software. It's not deterministic. Ask it the same thing twice and you'll get two different answers. So here's a rule off our engineering wiki, run through the PM Translator five times, with the same prompt.”
2. Point at the outlined words as they appear. “Only one of these kept the rule. Everything else has changed it in some way, softened it or adapted it: ‘not this Friday’, ‘fine if you're organised’, ‘let's avoid’.”
3. “So, five tries, five different answers, and only one out of five kept the rule. If we'd tested it once, we might have got the one that worked, and shipped it. Something that passes five times might only fail at five thousand. So we still don't know how reliable it is.”

### 1.5 · Version 2: more rules, but no way to check

1. “So when we see stuff like this, we do what most people do: there's a problem in the prompt, let's add more to it. One instruction to stop it talking back, and a couple of notes from the boss: more PM, and keep it short. That's version 2: more rules, by gut feel. And here it is side by side with version 1.” Three lines type in green, then the pairs deal in.
2. “So, is version 2 better? Some are, some are worse; it depends what you think ‘better’ means. We've added rules, but we've no way to check it followed them. And next week someone changes the prompt, or a new model drops, and it breaks in ways we won't know about. We're still on vibes.” The question marks land, then the caption.

## 2 · Say what good is

### 2.1 · Chapter: the loop with a gap

1. “If you've built a product before, you'll know this loop: build, measure, learn, from Eric Ries and The Lean Startup. I'd add one more step at the front: define.”
2. “And with the PM Translator, what did we do? What most of us do with AI, because it's so easy: we jumped straight into building. We built it, ran a few notices, and hoped for the best.”
3. “And that's the reason we're stuck on vibes. We never defined what good looks like. Without that, we can't really measure it, and we can't learn from it. All we can do is build, get a feeling, make some changes, and build again. So let's start filling that gap, together.”

### 2.2 · The room writes the rules

1. “So instead of just telling the PM Translator what to do, let's start with define: what does a good translation look like? What must never change when we translate a notice? I'll start you off: numbers and dates stay put. Four weeks should stay four weeks, however confident our PM sounds.” *(keys: E retype the card in the room's words)*
2. “What else? Has anyone got another rule we should add?” E to retype the card in their words; Enter to keep it. *(keys: E retype · Enter keep)*
3. “Good. What else?” *(keys: E retype · Enter keep)*
4. “And it still has to sound like a PM, or nobody reads it. That's the whole point of the product.” *(keys: E retype · Enter keep)*
5. “Now, two of these are a bit different. They're hard rules: break the number or the rule, and it doesn't matter how funny the rest is, it's an instant fail. In eval-speak these are invariants, and that's the only time you'll hear that word today.”
6. “And some things we'll just capture as ‘not now’: emoji, length, whether it's actually funny. We're scoping what our translator does. Writing that down is a decision too, and it saves us the same debate week on week.”

### 2.3 · Be the judge

1. “So now, let's measure. By hand, for now. Here are three real answers the PM Translator gave to the Friday notice. Let's mark them against our rules. Where would you put A: good, or bad?” Press 1 (mostly good) to 5 (mostly bad), or → for the usual. *(keys: 1–5 the room's split)*
2. Read the reason. “That's looking pretty good. It's still a never, with a quip on top.” *(keys: 1–5 adjust)*
3. “What about B?” Hands. Expect a split. *(keys: 1–5 the room's split)*
4. Let the split sit. “It's getting a bit softer.” Don't resolve it yet: that's the next slide. *(keys: 1–5 adjust)*
5. “And C?” *(keys: 1–5 the room's split)*
6. “It's funny, and probably like some PMs we've worked with, but it's flipped the rule. That one's bad.” *(keys: 1–5 adjust)*

### 2.4 · The split: a softer rule

1. “So let's look at B again, because we didn't agree on it. We've gone from a never to ‘let's avoid’: a much softer suggestion. It didn't make up a date, it didn't promise anything, and it hasn't broken an instant fail. But it's added just enough wiggle room that the rule means something different. So is that OK? The model can't answer that for us. It's a product decision, and the people who know the work should make that call, and write down why.” Everything lands on one press: point at each piece as you say it.

### 2.5 · The golden wall

1. “And what we've just done has a name: golden examples. Real answers, marked by the people who know the work, with the reason why. Your three go up first.”
2. “And we keep doing this, working with the people who know the work, across all the notices we've collected.” The rest arrive. “And notice which column's biggest. We spend a lot more time defining what's bad than what's good, because with non-deterministic systems we can't write everything down. We have to go and find the edges.” Don't point out the tech-debt card: 4.1 comes back to it.
3. “Good examples show the PM Translator what to copy, but the bad ones, with the reason why, show it what to avoid. We've got twelve here; in a real product you'd want hundreds. And the reason matters: ‘bad’ just tells someone it's bad. The reason tells them, or an AI, what to actually fix.”

## 3 · Check every answer

### 3.0 · Recap: we can't vote on ten thousand a day

1. “So let's take stock. We've built a PM Translator. We've defined what good looks like. And we've started measuring, by hand.”
2. “But it took this whole room a few minutes to mark three answers. If we ship this, we'll get thousands of notices a day, maybe millions, and we can't vote on all of those. We need something that checks every answer for us.”

### 3.1 · The prompt and the judge

1. “And this is where judges come in. It's worth being clear on what a judge is, and how it's different to a prompt. A prompt is what we tell the PM Translator to do. It's a request: go do these things. And the AI does its best.”
2. “A judge is separate: its own prompt, often its own model, that checks what was produced against one of our rules, and gives a reason. So why not just put more rules in the prompt? We should put some in there too. But version 2 showed us that adding rules doesn't mean they get followed. You don't get to mark your own homework.”
3. “And a judge isn't quite like a normal software test either. In a normal test, we say: put this in, and you'll get exactly this out. But we saw five tries give five different answers. So a judge doesn't look for exact words. It checks whether our rules still hold.”

### 3.2 · Rules become judges, run at scale

1. “So each of our rules becomes a judge, and they're not all the same. Some are just code: is there still a number? If you can write a normal test, do that first. Others need judgement, like ‘is let's avoid still a never?’, so a second AI reads our rule and our golden examples. And the borderline ones go to people. Cheapest first.”
2. “And now we can test much further. Here's version 2 running on every notice we've collected, with every judge checking every translation: faster, broader feedback than we could ever get by hand. And that's what an eval is: our rules, written down so we can check every answer, every time, and get objective data back.” The montage runs under the judges. Let it play.

### 3.3 · Zoom in: why you need different judges

1. “Now let's zoom in on one from the start: that HR policy we nearly shipped.”
2. Stamps land one at a time. “Look at the first judge. It's a simple code check: is there still a number? And yes, the number's changed, but it's still a number. That's the limit of simple tests: it made the same mistake we did at a glance. But the ‘rule stays a rule’ judge reads it properly, and catches that four weeks became two.”
3. “So it fails. It's the same answer we nearly shipped earlier, but now it's caught automatically, and we know why.”

## 4 · Make it better

### 4.0 · Chapter: fix the judge first

1. “So now the judges are marking every translation, or a sample if that gets expensive, and they tell us how to make it better. But there's an order. Before we fix the translator, we check the checker: if the judge is wrong, every score it gives us is wrong.”

### 4.1 · A judge that's wrong

1. “Here's one from our release notes: ‘The release is delayed so we can pay down tech debt.’ Now, no PM I know pays down tech debt, but the PM Translator's done a decent job: it's kept the facts, and it sounds like a PM. But one of our judges fails it: ‘nothing added’.”
2. “And its reason? It ‘waves work away as tech debt’. Our bad examples were full of PMs dodging work, like this one from the golden wall: ‘Classic tech debt, we'll sort it in v2’. So the judge learned the words, not the idea. Here, paying it down is the actual reason for the delay. It might be the most honest thing our PM has said all day.”
3. “So the judge is wrong, and that matters more than it looks. If we trusted it, we'd go and ‘fix’ the prompt just to please a broken judge. So we always check the judge first, and then fix the prompt.”

### 4.2 · Reasons, then drop-downs

1. “So how do we fix things without guessing? It starts with something you've already done today. Every time we see a failure, someone who knows the work says whether they agree with the judge, and writes down why, in their own words. That's the reasoning. In research-speak, it's called open coding.” The reasons type in.
2. “Then we tag each one with a drop-down, so we can group them together. That's axial coding. After a few hundred reviews, those drop-downs tell us which problems we have and how often. That's evidence, not vibes.”
3. “And those drop-downs tell us where to fix. Where we disagreed with the judge, the judge needs fixing, and that comes first.” The blue box draws. “Where we agreed, the answer really is bad, so the prompt needs fixing.” The teal box draws.

### 4.3 · The reasons go to an AI

1. “So rather than guessing at fixes by hand, we give it to another AI. Judge first: the judge and our feedback on it go in, and a better judge comes out. The blunt tech debt line is gone, and it's replaced with what we actually meant: catch work being waved away, not the words.” Let the judge and its feedback fly into the AI.
2. “Then we do the same with the prompt. Version 2 and the reasons it failed go in, and version 3 comes out. It stops listing a PM's bad habits, and starts describing what a good translation looks like, straight from your reasoning. We never told it how to fix anything, just what went wrong, and why.”

### 4.4 · From vibes to measured

1. “So, did it work? Look how far we've come. Version 1, built in minutes, with no way of telling how good it was: pure vibes. Version 2, measured by hand, with this whole room. Version 3, measured by judges on every answer, and seven in ten now pass. That's no longer gut feel.”
2. “And that's the pattern with most AI features. Getting something quite good happens really quickly. Getting it extremely good, good enough to trust with HR policies, takes a lot more time and a lot more data. The evals tell you whether that work is paying off.”

## 5 · Ship it?

### 5.1 · How good is good enough?

1. “So, back to the question from the start: should we ship it? Earlier we were reluctant, because we didn't know how reliable it was. Now we can measure that. But it depends on what you're trying to achieve, and the quality you need.”
2. “If you're sending a Friday drinks email, just write a prompt and fire it off. Vibes are fine, and if it's a bit off, nobody gets hurt.”
3. “But if you're PM-translating HR policies, you want strict rules, instant fails, and a human still signs off. Most things sit somewhere in between. Our job is to decide where, and write those rules down before we build, so we know what we're measuring against.”

### 5.2 · The leave policy ships, from vibes to evidence

1. “And here's that same HR policy, through everything we've built today. Four weeks stays four weeks, and it's the same answer you'd have put on the good side of the golden wall. Every judge passes it, a human signs it off, and now we can ship it, with the evidence to back it up.”
2. “Remember the needle at the start? We were firmly on vibes. You wrote the rules, you marked the answers, and the reasons behind them improved the judge and the prompt. That's how we moved from vibes to evidence.” The needle swings across.

### 5.3 · Close

1. “A great demo doesn't mean a shippable product. So say what good looks like, and then prove it.”
2. “Thank you.”

