# Talk track: “Your AI feature works in the demo. Now prove it.”

Generated from `src/talk/content.ts` by `npm run talk-track`. Edit the lines there, not here: the presenter window shows the same text.

Each numbered line is one press of → (or the clicker). Quoted words are what to say; the rest is what to do. Make the words your own: the beats matter more than the phrasing.

| Movement | Finish by | Beats |
| --- | --- | --- |
| 1 · The demo | 7 min | 8 beats, 22 presses |
| 2 · Say what good is | 12.5 min | 5 beats, 19 presses |
| 3 · Check every answer | 16.5 min | 4 beats, 11 presses |
| 4 · Make it better | 21 min | 5 beats, 13 presses |
| 5 · Ship it? | 24 min | 5 beats, 8 presses |

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
3. “So, five tries, five different answers, and only one out of five kept the rule. If we'd tested it once, we might have got the good one and shipped it. Some failures show up in five tries; some take hundreds, or thousands. So we still don't know how reliable it is.”

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
5. “Now, two of these are a bit different. They're hard rules, what we call invariants: break the number or the rule, and it doesn't matter how funny the rest is, it's an instant fail.”
6. “And there are things we've thought about, but decided are out of scope for now: emoji, length, whether it's actually funny. Writing those down matters too. Every time we say what's in and what's out, we get clearer on what's important, and we don't have the same debate next week.”

### 2.3 · Be the judge

1. “So now, let's measure. By hand, for now. Here are three real answers the PM Translator gave to the Friday notice. Let's mark them against our rules. Where would you put A: good, or bad?” Press 1 (mostly good) to 5 (mostly bad), or → for the usual. *(keys: 1–5 the room's split)*
2. Read the reason. “That's looking pretty good. It's still a never, and it sounds like a PM who's seen this movie before.” *(keys: 1–5 adjust)*
3. “What about B?” Hands. Expect a split. *(keys: 1–5 the room's split)*
4. Let the split sit. “It's getting softer. ‘Let's avoid’ isn't ‘never’. Not wrong, exactly, but not right either.” Don't resolve it yet: that's the next slide. *(keys: 1–5 adjust)*
5. “And C?” *(keys: 1–5 the room's split)*
6. “‘Friday deploys are totally fine.’ It's funny, and probably true of some PMs, but it's changed the rule. That one's clearly bad.” *(keys: 1–5 adjust)*

### 2.4 · The split: a human call

1. “So let's look at B again, because we split right down the middle. It's gone from a never to ‘let's avoid’. It hasn't broken any of our rules, but it's added just enough wiggle room to change what it means. So which side does it land on? The model can't answer that. That's a human call: the people who know the work decide, and write down why.”

### 2.5 · The golden wall

1. “And what we've just done has a name: golden examples. Real answers, marked by the people who know the work, with the reason why. Your three go up first.”
2. “And we keep doing this with the people who know the work, across every notice we've collected.” The rest arrive. “And notice which column's biggest. We spend far more time defining bad than good, because with AI we can't write every rule down. We have to find the edges.” Don't point out the tech-debt card: 4.1 comes back to it.
3. “Good examples show the PM Translator what to copy. The bad ones, with the reason why, show it what to avoid. And the reason is the important bit. ‘Bad’ just tells someone it's bad. ‘Four weeks became two’ tells them why. That reason is human judgement, from the people who know the work, and that's what we want to build into the system over time. We've got twelve here; in a real product, you'd want hundreds.”

## 3 · Check every answer

### 3.0 · Recap: we can't vote on ten thousand a day

1. “So let's take stock. We've built a PM Translator, we've defined what good looks like, and we've started measuring, by hand. But it took this whole room a few minutes to mark three answers, and if we ship this, we'll get thousands of notices a day. We need something that checks every answer for us.”

### 3.1 · Testing the AI: the prompt is the brief, the judge is the editor

1. “So how do we test an AI? We split it into two different jobs. The prompt is the brief: it tells the PM Translator what to do, and it does its best.”
2. “And the judge is the editor. It's just another AI, with its own prompt, and it checks what was actually written against our rules, and tells us why.”
3. The two cards move into place. “So here's how they fit together. The prompt produces the answer. Then we put the judges after it, each one checking that answer against one of our rules. And we keep them separate, for two reasons.”
4. “One: a writer shouldn't edit their own work.”
5. “And two: when we change the prompt, the judges stay the same, so we can tell whether the change made the answers better or worse.”

### 3.2 · Rules become judges, run at scale

1. “Now, not every rule needs an AI judge. Each of our rules becomes a test, and there are three kinds. Some are just code, like the tests we've always written: is there still a number? Cheap and instant. The ones that need interpretation get an AI judge: does ‘let's avoid’ still mean ‘never’? And the borderline calls still need human feedback. Cheapest first.”
2. “Now with our tests automated, we can rerun version 2 against every notice we've collected. It's far faster than marking by hand, and it gives us a baseline. That's what evals are: our rules and behaviours written down as tests, giving us objective data back.” The montage runs under the tests. Let it play.

### 3.3 · Zoom in: why you need different judges

1. “Now let's zoom in on the HR policy we translated at the start.”
2. The stamps land in the order you say them: the code test, nothing added, sounds like a PM, then the fail. “So we run our tests. First a code test: is the number still a number? It is, so that looks fine. Then our judges run: other AIs checking the first one's work, each on its own rule. Nothing added: pass. Sounds like a PM: pass. But ‘a rule stays a rule’ spots that four weeks became two, and that changes what the policy means.”
3. “So it fails. It's the same mistake we saw at the start, but now it's caught automatically. Across thousands of translations, we'd never have caught that by hand.”

## 4 · Make it better

### 4.0 · Chapter: wrong answer, or wrong test?

1. “And look: we've defined what good looks like, we've built it, and we're measuring every answer. That connects the whole loop, so now we can learn.” The loop from 2.1 closes, and Learn lights up.
2. “And when something fails, there's one question: is it a wrong answer, or a wrong test? Wrong answer, fix the prompt. Wrong test, fix the judge. And always check the test first, because if the test is wrong, every score it gives us is wrong.”

### 4.1 · A judge that's wrong

1. “Here's one from our engineering release notes: ‘The release is delayed so we can pay down tech debt.’ Not something you hear a PM say very often! The translator's done a decent job: it's kept the facts, and it sounds like a PM. But one of our judges fails it: ‘nothing added’.”
2. “So why did it fail? When we built this judge, we gave it our golden examples, and a lot of the bad ones were PMs waving work away as tech debt, like this one. So the judge learned the words, not the idea. But here, paying down tech debt is the actual reason for the delay. It might be the most honest thing our PM Translator has said all day.” The answer stays; the wall card and the judge's prompt appear under it.
3. “So the judge is wrong, and that matters. If we'd trusted it, we'd have changed the prompt to please a broken judge, and been chasing our tail. So check the judge first, then fix the prompt.”

### 4.2 · Reviews: a category and a reason, then sort

1. “So how do we fix things without guessing? We bring in people. The experts who know the work review a sample of the answers, passes and fails, but especially the fails. Do they agree with the judge? They pick a category, and write down why, in their own words. The more words, the better. The categories show us the patterns, like a judge that's too strict, and the reasons tell us how to fix them.” Rows land with their category and reason. (If you want the research terms: the reasons are open coding, the categories axial coding.)
2. “Then we sort them. Where the judge was wrong, that's a wrong test: fix the judge first.” The blue box draws. “Where the judge was right, that's a wrong answer: fix the prompt.” The teal box draws.

### 4.3 · The reasons go to an AI

1. The old judge and prompt sit on the left; the judge's feedback appears under the AI. “Then we take the judge's own prompt, and everything people said about it, and give both to another AI: ‘Here's the judge, here's the feedback. Can you improve it?’”
2. The judge and its feedback fly into the AI, and the new judge comes out on the right. “And out comes a better judge. The blunt ‘tech debt’ line is gone, replaced with what we actually meant: catch work being waved away, not the words.”
3. The prompt's feedback appears under the AI. “Now we've got a calibrated judge, we fix the brief. We take version 2, the prompt we were still vibing over, and all the reasons it failed, and ask an AI to improve it.”
4. Version 2 and its feedback fly in, and version 3 comes out. “And out comes version 3, built from what people told us. We didn't write it ourselves.”

### 4.4 · From vibes to measured

1. “So, did it work? Version 1 was total vibes: we made up a prompt and went with it. Version 2, we checked by hand, but that didn't scale. Version 3 has judges: we've separated doing the work from checking it, and it's improving from our feedback.”
2. “And it's getting quite good. But getting to extremely good, good enough to trust with every HR policy, takes a lot more time. The evals tell you whether you're heading in the right direction. You still decide when it's good enough to ship.” “Extremely good” lands.

## 5 · Ship it?

### 5.1 · How good is good enough?

1. “So, back to the question from the start: should we ship it? Earlier we were reluctant, because we didn't know how reliable it was. Now we can measure it. But whether we ship really depends on what we're trying to achieve.”
2. “If we were just writing a Friday drinks email, vibes are fine. We'd have shipped version 1: write the prompt, paste it into Slack or Teams, done.”
3. “But if we're automating HR policies or legal documents, we need a much higher bar: more rules, every rule passing every time, and a human signing off. Most AI products sit somewhere in between. Our job is to decide where the bar is, by deciding the rules and what good looks like, before we build.”

### 5.2 · The leave policy ships

1. “And here's that same HR policy, through everything we've built today. Four weeks stays four weeks, and it's the same answer you'd have put on the good side of the golden wall. Every judge passes it, a human signs it off, and now we can ship it, with the evidence to back it up.”

### 5.3 · Recap: the whole loop, connected

1. Each stage lights up as you say it. “So let's recap. We defined what good looks like: our rules, and golden examples with the reasons why. We built the PM Translator. We measured every answer, with code tests, AI judges and people. And we learned: fix the judge first, then the prompt. That's the whole loop, connected.”

### 5.4 · From vibes to evidence

1. “Remember the needle at the start? We were firmly on vibes. With that loop running, we've got the evidence. That's how we moved from vibes to evidence.” The needle swings across.

### 5.5 · Close

1. “So, your AI feature works in the demo. That's the easy part, and that's OK. Define what good looks like, measure every answer, learn from every fail, and you can get from demo to shippable, fast.”
2. “Thank you.”

