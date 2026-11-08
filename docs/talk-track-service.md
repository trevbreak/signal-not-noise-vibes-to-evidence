# Talk track (service agent): “Your AI agent works in the demo. Now prove it.”

Generated from `src/service/content.ts` by `npm run talk-track:service`. Edit the lines there, not here: the presenter window shows the same text. Open the talk at `http://localhost:5173/?service`.

Each numbered line is one press of → (or the clicker). Quoted words are what to say; the rest is what to do. Make the words your own: the beats matter more than the phrasing.

| Movement | Finish by | Beats |
| --- | --- | --- |
| 1 · The demo | 7 min | 8 beats, 22 presses |
| 2 · Say what good is | 12.5 min | 5 beats, 19 presses |
| 3 · Check every reply | 16.5 min | 4 beats, 10 presses |
| 4 · Make it better | 21 min | 5 beats, 13 presses |
| 5 · Ship it? | 23 min | 2 beats, 4 presses |
| 6 · From replies to conversations | 31 min | 9 beats, 26 presses |

## Before the talk

### 0 · Title (while people sit down)

1. Up while people arrive. When you're ready, → for the cold open.

## 1 · The demo

### 1.1 · Cold open

1. “All right, hands up if you've seen an AI demo this year that absolutely blew your mind. Something a colleague built, something a vendor showed you, or something you knocked up yourself in an afternoon.” Wait for the hands. Don't introduce yourself yet: the title card does that.
2. “Now, keep your hand up if it was just as good when it made it to production. Just as impressive.” Most go down. “That gap, between demo and production, is what we're going to talk about today. And we're going to do it by building a demo of our own, a service agent, and watching that gap open up.”

### 1.2 · Build the Service Agent

1. “So, meet Bunyip Outdoors. It's a made-up camping store, but you'll recognise the problems. We want a chat agent on the website for the questions customers ask every day: where's my order, do you price beat, can I return this. So, like most of us, I start with a prompt.” The prompt types itself. “That's the whole of version 1: a few lines, and three tools it can use. It can look up an order, book a callback, and issue a refund.”
2. “So let's try it on some real chats. First, the classic: ‘Where's my order?’” Read the answer. “It looked the order up, and it's got the real date. Nice.”
3. “What about the price beat: ‘Another store has this cooler for $89.’” Read it. “Friendly, keen, gets on with it.”
4. “And one that came in on a Friday night: ‘Can someone call me back tonight about my return? I'm free after 9.’” Read it fast and move on. Don't linger: it's the one that slips past.
5. “Who's got a question they'd ask a store like this? Who wants to be a customer?” E to type it (or the box in this window), Enter to run it live through version 1. Take two at most. X removes the last one. *(keys: E type · Enter run · X remove last)*

### 1.3 · Ship it? The needle

1. “So, a few lines of prompt and three tools, and we've got a working service agent. Years ago that was a call centre and a six-month project. Now it's a prompt and a bit of JavaScript on the page. But the question is: how good is it? Should we ship it? Is it up here, at evidence? Do you feel confident in it? Or is it more down here, in vibes?” Move the needle with the room: ↑ toward Evidence, ↓ toward Vibes. → when they've settled. *(keys: ↑ ↓ move the needle · → lock it in)*
2. Locked. “That much?”
3. It snaps to Vibes. “Of course, this is all vibes. It sounds like a great service agent, but we'd be reluctant to put it in front of customers without knowing how reliable it is.”

### 1.4 · The reveal

1. “So let's start testing a little further, and see if we can turn this into something we can ship.” The three answers come back.
2. “Let's have a look at this Friday night one.” The callback answer comes forward. Let them read it.
3. “Our team does callbacks nine to five, weekdays.”
4. “But our agent has booked one for nine o'clock tonight. It didn't just say it: it used the tool and booked it. Somebody's going to be sitting by the phone on a Friday night, and nobody's going to ring.”
5. “And at a glance, it looks great. It's warm, it's helpful, it's exactly what the customer asked for. It's incredibly easy to build solutions like this and miss the small details, and with an agent, the small details are things it actually does. Some of you might have seen something like this before.”

### 1.4 · Hold: a great demo isn't a shippable product

1. “A great demo doesn't mean a shippable product.” Say it once, slowly. Then let the title card do the rest.

### 1.4 · Title drop

1. Now introduce yourself. “I'm Trevor, a principal PM at Go1, and I look after some of our AI products. Today we're taking this service agent from a great demo to something we can ship. From vibes to evidence. We'll start with one reply at a time, and finish with whole conversations, tools and all.”

### 1.5 · Five tries, five answers

1. “So, was that just bad luck? This is the thing that catches people out all the time with AI: it's non-deterministic. Send the same message twice, and you won't necessarily get the same answer. So here's the price beat question, sent through five times, with the same prompt.”
2. Point at the outlined words as they appear. “Our policy is a beat: five percent off, once we've checked it's the same item. One of these says that. The rest match it, or match or beat it, or set you up at $89 on the spot. It's making up the policy as it goes.”
3. “So, five tries, three different price policies. If we'd tested it just once, we'd have seen one of them and thought, great. Some failures show up early; some only show up at scale, in the hundreds or thousands of chats. So we still don't really know how reliable it is.”

### 1.5 · Version 2: more rules, but no way to check

1. “So when we see stuff like this, we do what most people do: we add more to the prompt. A rule about callback hours, because that one scared us, and a couple of notes from the boss: more warmth, keep it short. More and more rules, all by gut feel. Now we've got a version 2. And if we try the same messages again, and line them up, version 1 against version 2…” Three lines type in green, then the pairs deal in.
2. “…we've got to ask ourselves: are these better? The callback one is. The price one now says match, which is worse. And the return one has decided you can return a used tent. We've added rules, but we've no way to really check them. And next week, when someone changes the prompt, or the model, or a policy, it might break in ways we don't know about. We're still very much on vibes.” The question marks land, then the caption.

## 2 · Say what good is

### 2.1 · Chapter: the loop with a gap

1. “Now, for those of us who've built products before, we know this loop: build, measure, learn, from Eric Ries and The Lean Startup. I want to add one more step at the front: define.”
2. “So with our agent, what did we do? What most of us do with AI: we jumped straight to build, because it's so easy now. Paste the prompt, add the JavaScript, try a few chats, hope for the best, and build again.”
3. “And that's why we're still stuck on vibes. We never really defined what good looks like. Without that, we can't measure it, we can't tell if we're heading in the right direction, and we can't learn from it. All we can do is build, get a feeling, and build again. So let's start filling that gap, together.”

### 2.2 · The room writes the rules

1. “So instead of telling the agent what to do, let's start by defining what a good reply looks like. What must never happen when our agent talks to a customer? I'll start you off: hours, prices and dates stay exact. If the policy says five percent, it's five percent, however keen the agent is.” *(keys: E retype the card in the room's words)*
2. “What else? What's the thing you'd never want it to do?” Expect promises: callbacks, refunds, delivery dates. E to retype the card in their words; Enter to keep it. *(keys: E retype · Enter keep)*
3. “Good. What else?” Steer toward handing over to a person if nobody says it. *(keys: E retype · Enter keep)*
4. “And we want it to still sound like us. Like Bunyip Outdoors. That matters even more when the same engine runs more than one brand.” *(keys: E retype · Enter keep)*
5. “Now, two of these are a bit different. We want to make them hard rules: in evaluation-speak, invariants. Guardrails, if you like. If one of those breaks, it doesn't matter how warm or helpful the rest of it is: it's a hard fail.”
6. “And as we go, there are things we decide not to test yet. Do we care about emoji? Upselling? How long it is? Writing those down as future scope is worth doing: get clear on what's in and what's out, and we don't have the same debate next week.”

### 2.3 · Be the judge

1. “So now, let's take these rules and measure. By hand, for now. Here are three real replies our agent gave to that Friday night callback request. Where would you put A: good, or bad?” Press 1 (mostly good) to 5 (mostly bad), or → for the usual. *(keys: 1–5 the room's split)*
2. Read the reason. “Mostly good, right? It's inside our hours, and it's still warm.” *(keys: 1–5 adjust)*
3. “What about B?” Hands. Expect a split. *(keys: 1–5 the room's split)*
4. Let the split sit. “It hasn't booked anything, and it hasn't named a time. But it's Friday night, and ‘as soon as possible’ is going to feel like tonight to the customer. It's a 50/50 call.” Don't resolve it yet: that's the next slide. *(keys: 1–5 adjust)*
5. “And C?” *(keys: 1–5 the room's split)*
6. “Nine o'clock tonight. That one's clearly breaking the rule. Clearly bad. And notice: this isn't gut feel any more. It's human feedback against our rules.” *(keys: 1–5 adjust)*

### 2.4 · The split: a human call

1. “So let's look at B again, the 50/50. ‘As soon as possible.’ It hasn't broken any of our rules on paper; it's just left some wiggle room. So which side does it land on? The model can't answer that: sometimes it'll say yes, sometimes no. It needs a human call, from the people who know your customers, your service team, your brand, and they write down why.”

### 2.5 · The golden wall

1. “So what we've just done has a name: golden samples. Real replies, marked by people who know the work, with their reasoning. Your three go up first.”
2. “And we keep doing this with experts across the business: the service team, the brand team, whoever owns the policy.” The rest arrive. “And notice which column's biggest. Defining bad matters more than defining good: we can't write every rule down for a non-deterministic system. We'd be describing the whole universe. We're looking for the clear edges, where it tips into things we don't accept.” Don't point out the Saturday card: 4.1 comes back to it.
3. “Good examples show the agent what to copy. The bad ones, and especially their reasons, show it what to avoid. And the reason is the important bit. ‘Tomorrow's Saturday, nobody's in’ tells us why it's bad. That human judgement is what we want to build into the system over time. We've got twelve here; for a real agent, across real brands, you'll want hundreds, or thousands. The more, the better.”

## 3 · Check every reply

### 3.0 · Recap: we can't vote on ten thousand a day

1. “So where have we got to? We've built a service agent, it's a bit vibey, and we've started defining what good looks like. But we can only measure it by hand, and it took this room a couple of minutes for three replies. Put this on a website, and we'll get thousands of chats a day. So we need to automate the checking.”

### 3.1 · Testing the AI: the prompt is the brief, the judge is the editor

1. “So how do we do that with AI? We split it into two jobs. The prompt is the brief: it tells the agent what to do. Here's how to look after a Bunyip customer.”
2. “And then we build in a judge: the editor. It's just another AI, with its own prompt, checking what the agent wrote against one of our rules, and telling us pass or fail, and why.”
3. The two cards move into place. “So here's how they fit together. The prompt produces the reply. Then we send it to our judges, who each check it against their own area of expertise: pass or fail, and why. And we keep them separate, for one good reason.”
4. “When we change the prompt, the judges stay the same. So we can ask: did the replies get better or worse? If it was all one prompt, we'd be changing everything, every time, and we'd never know.”

### 3.2 · Rules become judges, run at scale

1. “Now, not everything needs an AI judge. Each rule becomes a test, and there are a few kinds. Some are just code, the regular tests our developers write: does every time it mentions sit inside our hours? Is the percentage five? That's deterministic. Cheap, and certain. The ones that need interpretation get an AI judge: does ‘as soon as possible’ count as a promise? That's probabilistic, and it costs a bit more. And the most expensive is human feedback, for the borderline calls. Sorting your rules into those buckets early saves a lot of pain.”
2. “Now, with our tests in place, we can rerun version 2 against every customer message we've collected. Far faster feedback: what's passing, what's failing, and why. That's what evals are: our rules and behaviours written down as tests, giving us objective data back.” The montage runs under the tests. Let it play.

### 3.3 · Zoom in: why you need different judges

1. “Now let's zoom in on that return question.”
2. The stamps land in the order you say them: the code test, hands over, brand, then the fail. “First the code test: is the number right? Thirty days. That's our policy. It passes. Then the AIs check the work, each on its own rule. Nothing to hand over: passes. Sounds like us: passes. But ‘nothing we can't do’ spots ‘used or not’. We don't take back used tents.”
3. “So it fails. The number was right, and the promise was wrong. A code test could never have caught that; it needed a judge that reads for meaning. And now it's caught automatically, across thousands of chats.”

## 4 · Make it better

### 4.0 · Chapter: wrong answer, or wrong test?

1. “So now we've defined what good looks like, we've built it, and we're measuring every reply. That connects the whole loop. So now we can start to learn.” The loop from 2.1 closes, and Learn lights up.
2. “But when something fails, ask one question: is it a wrong answer, or a wrong test? If the agent's doing a poor job, that's a wrong answer: fix the prompt. If the test isn't picking it up properly, that's a wrong test: fix the judge. And check the test first, because if the test is wrong, everything it tells us is wrong.”

### 4.1 · A judge that's wrong

1. “So here's that Friday night callback again, on version 2. It's booked a callback for Monday at 9am. That's inside our hours. It's passed most of our judges, but it's failed ‘nothing we can't do’, for booking a callback.”
2. “So why did it fail? When we built this judge, we gave it golden samples, and the bad ones about callbacks, like this one down the bottom, were all bookings. So the judge learned that booking a callback is bad. It learned the words, not the idea; we baked it in. But here, booking a callback inside our hours is exactly what we want it to do.” The answer stays; the wall card and the judge's prompt appear under it.
3. “So the judge here is actually wrong, and that matters. If we'd trusted it, we'd have told the agent to stop booking callbacks altogether, just to please a broken judge, and been chasing our tail. So check the judge first, then fix the prompt.”

### 4.2 · Reviews: a category and a reason, then sort

1. “So how do we fix things without guessing? We bring the human experts back into the loop. Your service leads review the replies and the judges' calls: do they agree or disagree with the judge? They pick a category, and write down why. That tells us where a judge is too strict, too lenient, or misreading things.” Rows land with their category and reason. (If you want the research terms: the reasons are open coding, the categories axial coding.)
2. “Then we sort them. Where the judge was wrong, we go and fix the judge first.” The blue box draws. “Where the prompt was wrong, we go and fix the prompt.” The teal box draws.

### 4.3 · The reasons go to an AI

1. The old judge and prompt sit on the left; the judge's feedback appears under the AI. “So we take the judge's own prompt, and the feedback on it, and give both to another AI: ‘Here's this judge, here's the feedback. Can you improve it?’”
2. The judge and its feedback fly into the AI, and the new judge comes out on the right. “And out comes a new, refined judge, updated with our feedback. That blunt ‘fail callback bookings’ line is gone, replaced with what we actually meant: fail the callbacks we can't keep.”
3. The prompt's feedback appears under the AI. “Now we've got a judge we can rely on, we go back to the agent. We take version 2, and the reasons it failed, and send them through.”
4. Version 2 and its feedback fly in, and version 3 comes out. “And out comes version 3, built from our human feedback. We didn't write it ourselves: the service team's expertise gets baked in.”

### 4.4 · From vibes to measured

1. “So, did it work? Version 1 was total vibes. Version 2, we checked by hand, but it didn't scale. Version 3 has judges and a feedback loop: we've separated the work from checking it, and it keeps improving.”
2. “And it's getting quite good. But getting to extremely good, good enough to trust with every refund and every callback, takes a lot more time. The evals tell you whether you're heading in the right direction, but it's still up to you to decide when it's good enough to ship.” “Extremely good” lands.

## 5 · Ship it?

### 5.1 · How good is good enough?

1. “So, back to the question from the start: should we ship it? Earlier we were reluctant, because we didn't know how reliable it was. Now we can measure it. But shipping really depends on what we're trying to achieve.”
2. “If it's answering product questions, which tent fits four, the bar can be lighter. If it's a bit off, it's easy to fix and nobody's out of pocket.”
3. “But callbacks and refunds, at scale? We need a much higher bar: more rules, more invariants, more automated checks, and a person whenever money moves. Most of an agent sits somewhere in between. Our job is to decide where that bar is for each thing it does, before we build.”

### 5.2 · The callback reply ships

1. “And here's that same Friday night request, through all those iterations, on version 3. Inside our hours, still warm, nothing booked that we can't keep. It's the same answer you put on the good side of the golden wall. Every judge passes it, a person signs it off, and we can ship it with the evidence to back it up.”

## 6 · From replies to conversations

### 6.1 · A real conversation: a trace

1. “So we're done, right? Well, not quite. Everything so far has been one message, one reply. But customers don't send one message. So here's a real conversation with version 2. A customer whose tent hasn't turned up, and who's going camping tomorrow.” Three messages and three replies land.
2. “And behind every reply, the agent is doing things. Looking up the order, booking a callback, issuing a refund. This whole thing, the messages, the replies and every action in between, is called a trace.” The tool calls appear between the messages.
3. “Now, if we judge each reply on its own, the way we have all talk, they all pass. Warm, accurate, on brand.” Three ticks.
4. “But look at what it did on message three. Under pressure, it refunded $349 on its own. Nobody approved that. No single reply shows you that. Only the whole conversation does.” The refund lights up red.

### 6.2 · Judge the whole conversation

1. “So with agents, we don't just judge replies. We judge the whole trace. First, the actions: these are code tests on the tool calls. Was the callback booked inside our hours? Did money move without a person? Those are yes or no, cheap and certain.”
2. “Then the AI judges read the whole conversation: did it hand over when it should have? Did it hold the line under pressure?”
3. “And when a person reviews a trace, they don't mark every turn; you'd drown. They read the whole thing and write down the first thing that went wrong. Fix that, and often everything after it fixes itself.”

### 6.3 · Many conversations: the failures hide in the later turns

1. “And this wasn't a one-off. We ran that same pushy customer through version 2 six times. When we asked about the callback once, it kept to our hours every time. Pushed three times…”
2. “…five of the six conversations broke a rule. Two refunds, one refund offer, and two callbacks booked for 9am Saturday. The first message was almost always fine. The failures hide in the later turns, under pressure.” The red cells land.
3. “So we test agents with conversations, not just messages. Golden conversations: the pushy customer, the confused one, the one who changes their mind halfway, written once and run on every change.”

### 6.4 · The prompt asks. The tool enforces.

1. “So how do we stop it? We could keep adding rules to the prompt. But a prompt is a request: the agent does its best, and under pressure, its best gives way.”
2. “So the hard rules go into the tools. The booking tool only offers slots inside our hours: the agent can't book 9pm even if it wants to. And it doesn't get a refund tool at all. It gets a hand-over tool. An agent only gets the tools it needs. The prompt asks; the tool enforces.”
3. “And this is how one engine runs more than one brand. The shared rules, never move money, hand over complaints, policies exact, are the same judges everywhere. Each brand's hours and policies come in as data, not as a different prompt for every brand. And each brand's voice gets its own judge. Same engine, same guardrails, different brands.”

### 6.5 · Wrong answer, wrong test, or wrong data?

1. “Now here's version 3, doing exactly what we asked: it handed over. But it's 8:40 on a Friday night, and it's told the customer a team member will be with them shortly. Nobody's in until Monday.”
2. “Is that the prompt? No. Is it the judge? No. The hand-over tool came back with nothing: it never told the agent the team had gone home. The agent can't be more right than what we give it. So we fix the data, and the reply fixes itself.”
3. “So our question gets a third answer. Wrong answer: fix the prompt. Wrong test: fix the judge. Wrong data: fix the context. The tools, the order system, the knowledge articles. If your returns page says thirty days and an old FAQ says sixty, the agent will pick one, and the evals will tell you it's wrong, every time. Good data is one of the cheapest ways to make an agent better.”

### 6.6 · Before and after go-live

1. “So how does this run day to day? Before go-live: every change, a new prompt, a new model, a changed tool, a policy update, an edited knowledge article, runs the golden conversations, per brand. The instant fails have to be a hundred percent before anything ships.”
2. “After go-live: we sample real conversations every day and run the same judges over them. An instant fail raises an alert. People review the flagged ones, and write down the first thing that went wrong. That's your observability: not just is it up, but is it good.”
3. “And every real failure becomes a new golden conversation. So the tests grow with the agent. The loop never stops; that's continuous testing.”

### 6.7 · Recap: the whole loop, connected

1. “So now we've got the whole loop connected. We defined what good looks like: our rules, and golden samples with the reasons why.”
2. “We built the service agent, through a few iterations, and put the hard rules in its tools.”
3. “We measured every reply, and every conversation, with code tests, AI judges and human review.”
4. “And we learned: fix the judge first, then the prompt, and check the data it was given. Define, build, measure, learn: the whole loop, connected.” The last arrow closes the loop.

### 6.8 · From vibes to evidence

1. “Remember the needle at the start? We were very much on vibes. With the loop running, before and after go-live, we've got the evidence. We've moved from vibes to evidence.” The needle swings across.

### 6.9 · Close

1. “So, your AI agent works in the demo. That's the easy part, and that's OK. Define what good looks like, judge every conversation, learn from every fail, and you can get from demo to an agent you can trust with your customers.”
2. “Thank you.” Then open it up for questions.

