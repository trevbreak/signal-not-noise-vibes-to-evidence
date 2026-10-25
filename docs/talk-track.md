# Talk track: “Your AI feature works in the demo. Now prove it.”

Generated from `src/talk/content.ts` by `npm run talk-track`. Edit the lines there, not here: the presenter window shows the same text.

Each numbered line is one press of → (or the clicker). Quoted words are what to say; the rest is what to do. Make the words your own: the beats matter more than the phrasing.

| Movement | Finish by | Beats |
| --- | --- | --- |
| 1 · The demo | 7 min | 8 beats, 22 presses |
| 2 · Say what good is | 12.5 min | 5 beats, 19 presses |
| 3 · Check every answer | 16.5 min | 4 beats, 11 presses |
| 4 · Make it better | 21 min | 5 beats, 13 presses |
| 5 · Ship it? | 24 min | 5 beats, 11 presses |

## Before the talk

### 0 · Title (while people sit down)

1. Up while people arrive. When you're ready, → for the cold open.

## 1 · The demo

### 1.1 · Cold open

1. “All right, hands up if you've seen an AI demo this year that absolutely blew your mind. Something a colleague built, something an engineer showed off, or something you knocked up yourself in an afternoon.” Wait for the hands. Don't introduce yourself yet: the title card does that.
2. “Now, keep your hand up if it was just as good when it made it to production. Just as impressive.” Most go down. “That gap, between demo and production, is what we're going to talk about for the next 25 minutes. And we're going to do it by building a demo of our own, and watching that gap open up.”

### 1.2 · Build the PM Translator

1. “So, I'm a product manager, and I've got a problem: nobody in my team pays attention to company notices. So I'm building a tool that rewrites them in the voice of the one person everyone listens to: the product manager, of course. The PM Translator.” The prompt types itself. “And like most of us, I start with a prompt. That's the whole of version 1: a few lines, no code.”
2. “So let's try it on some real notices. First, a team lunch message from Slack: ‘Good morning team, lunch is provided today.’” Read the answer in your best PM voice.
3. “What about the kitchen: ‘The coffee machine is broken.’” Let the laugh land. “Again, taking the credit. That definitely sounds like a PM.”
4. “And one off the HR wall: ‘Annual leave needs four weeks' notice.’” Read it fast and move on. Don't linger: it's the one that slips past.
5. “Is there something from your world that deserves the PM treatment? Who wants to try out my PM Translator?” E to type it (or the box in this window), Enter to run it live through version 1. Take two at most. X removes the last one. *(keys: E type · Enter run · X remove last)*

### 1.3 · Ship it? The needle

1. “So, a quick prompt, a few simple instructions, and we've got a working translator. Years ago that would have been a whole start-up; now anyone can build it. But the question is: how good is it? Should we ship it? Is it up here, at evidence? Do you feel confident in it? Or is it more down here, in vibes?” Move the needle with the room: ↑ toward Evidence, ↓ toward Vibes. → when they've settled. *(keys: ↑ ↓ move the needle · → lock it in)*
2. Locked. “That much?”
3. It snaps to Vibes. “Of course, this is all vibes. It sounds like a PM we might have worked with, but we'd be reluctant to ship this to customers without knowing how reliable it is.”

### 1.4 · The reveal

1. “So let's start testing a little further, and see if we can turn this into something we can ship.” The three answers come back.
2. “Let's have a look at this HR policy.” The leave answer comes forward. Let them read it.
3. “The notice says four weeks.”
4. “But our translator has changed the meaning, and turned four weeks into two. Which, to be fair, is what product managers do with estimates.”
5. “And at a glance, it looks fine; it looks like the other answers. But this one's a policy. It's a small tweak that's changed the meaning, and it's going to have a real impact on people if we send it out. It's incredibly easy to build solutions like this and miss the small details, and the small details have big consequences.”

### 1.4 · Hold: a great demo isn't a shippable product

1. “A great demo doesn't mean a shippable product.” Say it once, slowly. Then let the title card do the rest.

### 1.4 · Title drop

1. Now introduce yourself. “I'm Trevor, a principal PM at Go1, and I look after some of our AI products. Today we're taking that PM Translator from a great demo to something we can ship. From vibes to evidence, and along the way, how we do this for our own AI products.”

### 1.5 · Five tries, five answers

1. “So, was that just bad luck? This is the thing that catches people out all the time with AI: it's non-deterministic. Send the same message twice, and you won't necessarily get the same answer. So here's a rule off our engineering wiki, sent through five times, with the same prompt.”
2. Point at the outlined words as they appear. “Only one of these really kept the rule, ‘never deploy on a Friday’. The rest softened it, or adapted it in different ways: ‘not this Friday’, ‘fine if you're organised’, ‘let's avoid’.”
3. “So, five tries, five different answers, and only one really kept the rule. If we'd tested it just once, we might never have seen the failures. Some failures show up early and quickly; some only show up at scale, in the hundreds or thousands. So we still don't really know how reliable it is.”

### 1.5 · Version 2: more rules, but no way to check

1. “So when we see stuff like this, we do what most people do: we add more to the prompt. Some instructions to stop it talking back, and a couple of other notes. More and more rules, all by gut feel. Now we've got a version 2 prompt. And if we try the same messages again, and line them up, version 1 against version 2…” Three lines type in green, then the pairs deal in.
2. “…we've got to ask ourselves: are these better? Some are, some are worse; it depends what you think ‘better’ means. We've added rules, but we've no way to really check them. And next week, if someone changes the prompt or the model, it might break in ways we don't know about. We're still very much on vibes.” The question marks land, then the caption.

## 2 · Say what good is

### 2.1 · Chapter: the loop with a gap

1. “Now, for those of us who've built products before, we know this loop: build, measure, learn, from Eric Ries and The Lean Startup. I want to add one more step at the front: define.”
2. “So with the PM Translator, what did we do? What most of us do with AI: we jumped straight to build, because it's so easy now. We ran a few notices, hoped for the best, and built again.”
3. “And that's why we're still stuck on vibes. We never really defined what good looks like. Without that, we can't measure it, we can't tell if we're heading in the right direction, and we can't learn from it. All we can do is build, get a feeling, and build again. So let's start filling that gap, together.”

### 2.2 · The room writes the rules

1. “So instead of telling the PM Translator what to do, let's start by defining what a good translation looks like. What must never change when we translate a notice? I'll start you off: numbers and dates stay put. Four weeks should stay four weeks, however confident the PM sounds.” *(keys: E retype the card in the room's words)*
2. “What else? Has anyone got another rule we should add?” E to retype the card in their words; Enter to keep it. *(keys: E retype · Enter keep)*
3. “Good. What else?” *(keys: E retype · Enter keep)*
4. “And we want it to still sound like a PM. That's the whole point of the product, after all.” *(keys: E retype · Enter keep)*
5. “Now, two of these are a bit different. We want to make them hard rules: in evaluation-speak, invariants. If one of those breaks, it doesn't matter how good or bad the rest of it is: it's a hard fail.”
6. “And as we go, there are things we decide not to test yet. Do we care about emoji? How long it is? Writing those down as future scope is worth doing: get clear on what's in and what's out, and we don't have the same debate next week.”

### 2.3 · Be the judge

1. “So now, let's take these rules and measure. By hand, for now. Here are three real answers the PM Translator gave to the Friday notice. Where would you put A: good, or bad?” Press 1 (mostly good) to 5 (mostly bad), or → for the usual. *(keys: 1–5 the room's split)*
2. Read the reason. “It's mostly good, right? The rule's still a rule, and it sounds like a PM who's seen this movie before.” *(keys: 1–5 adjust)*
3. “What about B?” Hands. Expect a split. *(keys: 1–5 the room's split)*
4. Let the split sit. “It's softening a bit. ‘Let's avoid’ isn't ‘never’, but it's not exactly wrong either. It's a 50/50 call.” Don't resolve it yet: that's the next slide. *(keys: 1–5 adjust)*
5. “And C?” *(keys: 1–5 the room's split)*
6. “‘Friday deploys are totally fine.’ That one's clearly breaking the rule. Clearly bad. And notice: this isn't gut feel any more. It's human feedback against our rules.” *(keys: 1–5 adjust)*

### 2.4 · The split: a human call

1. “So let's look at B again, the 50/50. It's gone from ‘never’ to ‘let's avoid’. It hasn't broken any of our rules; it's just added a bit of wiggle room. So which side does it land on? Is it acceptable or not? The model can't answer that: sometimes it'll say yes, sometimes no. It needs a human call, from the people who know the work, and they write down why.”

### 2.5 · The golden wall

1. “So what we've just done has a name: golden examples. Real answers, marked by people who know the work, with their reasoning. Your three go up first.”
2. “And we keep doing this with experts across the business.” The rest arrive. “And notice which column's biggest. Defining bad matters more than defining good: we can't write every rule down for a non-deterministic system. We'd be describing the whole universe. We're looking for the clear edges, where it tips into things we don't accept.” Don't point out the tech-debt card: 4.1 comes back to it.
3. “Good examples show the PM Translator what to copy. The bad ones, and especially their reasons, show it what to avoid. And the reason is the important bit. ‘Four weeks became two’ tells us why it's bad. That human judgement, from the people who know the work, is what we want to build into the system over time. We've got twelve here; in your real products, you'll want hundreds, or thousands. The more, the better.”

## 3 · Check every answer

### 3.0 · Recap: we can't vote on ten thousand a day

1. “So where have we got to? We've built a PM Translator, it's a bit vibey, and we've started defining what good looks like. But we can only measure it by hand, and it took this room a couple of minutes for three answers. Ship this, and we'll get thousands a day. So we need to automate the checking.”

### 3.1 · Testing the AI: the prompt is the brief, the judge is the editor

1. “So how do we do that with AI? We split it into two jobs. The prompt is the brief: it tells the PM Translator what to do. Here's how to do a PM translation.”
2. “And then we build in a judge: the editor. It's just another AI, with its own prompt, checking what was written against one of our rules, and telling us pass or fail, and why.”
3. The two cards move into place. “So here's how they fit together. The prompt produces the answer. Then we send it to our judges, who each check it against their own area of expertise: pass or fail, and why. And we keep them separate, for two good reasons.”
4. “One: you don't want writers judging their own work. The translator's job is to translate, not to judge.”
5. “And two: when we change the prompt, the judges stay the same. So we can ask: did I regress? Is it getting better or worse? If it was all one prompt, we'd be changing everything, every time.”

### 3.2 · Rules become judges, run at scale

1. “Now, not everything needs an AI judge. Each rule becomes a test, and there are a few kinds. Some are just code, the regular tests our developers write: is it still a number? Cheap. The ones that need interpretation get an AI judge: does ‘let's avoid’ actually mean ‘never’? That costs a bit more. And the most expensive is human feedback, for the borderline calls.”
2. “Now, with our tests in place, we can rerun version 2 against every notice we've collected. Far faster feedback: what's passing, what's failing, and why. That's what evals are: our rules and behaviours written down as tests, giving us objective data back.” The montage runs under the tests. Let it play.

### 3.3 · Zoom in: why you need different judges

1. “Now let's zoom in on that HR policy from the start.”
2. The stamps land in the order you say them: the code test, nothing added, sounds like a PM, then the fail. “First the code test: is the number still a number? It passes. Then the AIs check the work, each on its own rule. Nothing added: passes. Sounds like a PM: passes. But ‘a rule stays a rule’ spots that four weeks changed to two, and that changes what the policy means.”
3. “So it fails. The same mistake we saw at the start, but now caught automatically by our judges, across thousands of translations.”

## 4 · Make it better

### 4.0 · Chapter: wrong answer, or wrong test?

1. “So now we've defined what good looks like, we've built it, and we're measuring every answer. That connects the whole loop. So now we can start to learn.” The loop from 2.1 closes, and Learn lights up.
2. “But when something fails, ask one question: is it a wrong answer, or a wrong test? If the PM Translator's doing a poor job, that's a wrong answer: fix the prompt. If the test isn't picking it up properly, that's a wrong test: fix the judge. And check the test first, because if the test is wrong, everything it tells us is wrong.”

### 4.1 · A judge that's wrong

1. “So let's take some of our engineering release notes, and run them through our judges. ‘The release is delayed so we can pay down tech debt.’ Not something you hear a PM say very often! It's passed most of our judges, but it's failed ‘nothing added’, for waving work away as tech debt.”
2. “So why did it fail? When we built this judge, we gave it golden examples, and some of them, like this one down the bottom, were PMs waving work away as tech debt. So the judge learned the words, not the idea; we baked it in. But here, paying down tech debt is the real reason for the delay. Maybe the most honest thing our PM Translator has said all day.” The answer stays; the wall card and the judge's prompt appear under it.
3. “So the judge here is actually wrong, and that matters. If we'd trusted it, we'd have changed the prompt just to please a broken judge, and been chasing our tail. So check the judge first, then fix the prompt.”

### 4.2 · Reviews: a category and a reason, then sort

1. “So how do we fix things without guessing? We bring the human experts back into the loop. They review the answers and the judges' calls: do they agree or disagree with the judge? They pick a category, and write down why. That tells us where a judge is too strict, too lenient, or misreading things.” Rows land with their category and reason. (If you want the research terms: the reasons are open coding, the categories axial coding.)
2. “Then we sort them. Where the judge was wrong, we go and fix the judge first.” The blue box draws. “Where the prompt was wrong, we go and fix the prompt.” The teal box draws.

### 4.3 · The reasons go to an AI

1. The old judge and prompt sit on the left; the judge's feedback appears under the AI. “So we take the judge's own prompt, and the feedback on it, and give both to another AI: ‘Here's this judge, here's the feedback. Can you improve it?’”
2. The judge and its feedback fly into the AI, and the new judge comes out on the right. “And out comes a new, refined judge, updated with our feedback. That blunt ‘tech debt’ line is gone, replaced with what we actually meant: catch work being waved away.”
3. The prompt's feedback appears under the AI. “Now we've got a judge we can rely on, we go back to the translator. We take version 2, and the reasons it failed, and send them through.”
4. Version 2 and its feedback fly in, and version 3 comes out. “And out comes version 3, built from our human feedback. We didn't write it ourselves: that expertise gets baked in.”

### 4.4 · From vibes to measured

1. “So, did it work? Version 1 was total vibes. Version 2, we checked by hand, but it didn't scale. Version 3 has judges and a feedback loop: we've separated the work from checking it, and it keeps improving.”
2. “And it's getting quite good. But getting to extremely good, good enough to trust with every HR policy, takes a lot more time. The evals tell you whether you're heading in the right direction, but it's still up to you to decide when it's good enough to ship.” “Extremely good” lands.

## 5 · Ship it?

### 5.1 · How good is good enough?

1. “So, back to the question from the start: should we ship it? Earlier we were reluctant, because we didn't know how reliable it was. Now we can measure it. But shipping really depends on what we're trying to achieve.”
2. “If we're just writing a Friday drinks email, vibes are fine. Throw it into the prompt, paste it into Slack, and send it straight away.”
3. “But if we're automating HR policies at scale, we need a much higher bar: more rules, more invariants, more automated checks, and a human signing off. Most AI products sit somewhere in between. Our job is to decide where that bar is, before we build.”

### 5.2 · The leave policy ships

1. “And here's that same HR policy, through all those iterations, on the latest, improved prompt. Four weeks stays four weeks, and it's the same answer you'd have put on the good side of the golden wall. Every judge now passes it, a human signs it off, and we can ship it with the evidence to back it up.”

### 5.3 · Recap: the whole loop, connected

1. “So now we've got the whole loop connected. We defined what good looks like: our rules, and golden examples with the reasons why.”
2. “We built the PM Translator, through a few iterations.”
3. “We measured every answer, with code tests, AI judges and human feedback.”
4. “And we learned: fix the judge first, then the prompt. Define, build, measure, learn: the whole loop, connected.” The last arrow closes the loop.

### 5.4 · From vibes to evidence

1. “Remember the needle at the start? We were very much on vibes. With the loop running, we've got the evidence. We've moved from vibes to evidence.” The needle swings across.

### 5.5 · Close

1. “So, your AI feature works in the demo. That's the easy part, and that's OK. Define what good looks like, measure every answer, learn from every fail, and you can get from demo to a shippable product, fast.”
2. “Thank you.”

