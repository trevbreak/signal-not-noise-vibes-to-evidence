# Talk track (service agent): “Your AI agent works in the demo. Now prove it.”

Generated from `src/service/content.ts` by `npm run talk-track:service`. Edit the lines there, not here: the presenter window shows the same text. Open the talk at `http://localhost:5173/?service`.

Each numbered line is one press of → (or the clicker). Quoted words are what to say; the rest is what to do. Make the words your own: the beats matter more than the phrasing.

| Movement | Finish by | Beats |
| --- | --- | --- |
| 1 · The demo | 7 min | 8 beats, 21 presses |
| 2 · Say what good is | 11.5 min | 5 beats, 18 presses |
| 3 · Check every reply | 14.5 min | 4 beats, 9 presses |
| 4 · Make it better | 17.5 min | 4 beats, 9 presses |
| 5 · Ship it? | 18 min | 1 beats, 1 presses |
| 6 · From replies to conversations | 26.5 min | 9 beats, 26 presses |

## Before the talk

### 0 · Title (while people sit down)

1. Up while people arrive. When you're ready, → for the cold open.

## 1 · The demo

### 1.1 · Cold open

1. “All right, let's start with a quick one. Drop a reaction in the chat, a 🤯, a 👍, whatever you've got, if you've seen an AI demo this year that absolutely blew your mind. Something a colleague built, something a vendor showed you, or something you knocked up yourself in an afternoon.” Watch the chat and give it a few seconds: online, reactions trickle in. Read a couple out. Don't introduce yourself yet: the title card does that.
2. “Now, a 👍 if it was just as good when it made it to production. Just as impressive.” Expect far fewer. Say what you see: “Quieter.” “That gap, between demo and production, is what we're going to talk about today. And we're going to do it by building a demo of our own, a service agent, and watching that gap open up.”

### 1.2 · Build the Service Agent

1. “So, meet Bunyip Outdoors. It's a made-up camping store, but you'll recognise the problems. We want a chat agent on the website for the questions customers ask every day: where's my order, do you price beat, can I return this. So, like most of us, I start with a prompt.” The prompt types itself. “That's the whole of version 1: a few lines, and three tools it can use. It can look up an order, book a callback, and issue a refund.”
2. “So let's try it on some real chats. First, the classic: ‘Where's my order?’” Read the answer. “It didn't guess. It used a tool to look the order up, and it's got the real date. That's how an agent knows things: from what its tools tell it.”
3. “What about the price beat: ‘Another store has this cooler for $89.’” Read it. “Friendly, keen, gets on with it.”
4. “And one that came in on a Friday night: ‘Can someone call me back tonight about my return? I'm free after 9.’” Read it fast and move on. Don't linger: it's the one that slips past.

### 1.3 · Ship it? The needle

1. “So, a few lines of prompt and three tools, and we've got a working service agent. But how good is it? Should we ship it? Up here at evidence, or down here on vibes? Pop it in the chat: vibes or evidence?” Read a few out, and move the needle to match: ↑ toward Evidence, ↓ toward Vibes. → when it's settled. *(keys: ↑ ↓ move the needle · → lock it in)*
2. It snaps to Vibes. “Of course, this is all vibes. It sounds like a great service agent, but we'd be reluctant to put it in front of customers without knowing how reliable it is.”

### 1.4 · The reveal

1. “So let's start testing a little further, and see if we can turn this into something we can ship.” The three answers come back.
2. “Let's have a look at this Friday night one.” The callback answer comes forward. Let them read it.
3. “Our team does callbacks nine to five, weekdays.”
4. “But our agent has booked one for nine o'clock tonight. It didn't just say it: it used the tool and booked it. And nothing it was given, not the prompt, not the tool, told it our hours. Somebody's going to be sitting by the phone on a Friday night, and nobody's going to ring.”
5. “And at a glance, it looks great: warm, helpful, exactly what the customer asked for. It's easy to miss the small details, and with an agent, the small details are things it actually does.”

### 1.4 · Hold: a great demo isn't a shippable product

1. “A great demo doesn't mean a shippable product.” Say it once, slowly. Then let the title card do the rest.

### 1.4 · Title drop

1. Now introduce yourself. “I'm Trevor, a principal PM at Go1, and I look after some of our AI products. Today we're taking this service agent from a great demo to something we can ship. From vibes to evidence. We'll start with one reply at a time, and finish with whole conversations, tools and all.”

### 1.5 · Five tries, five answers

1. “So, was that just bad luck? This is the thing that catches people out all the time with AI: send the same message twice, and you won't necessarily get the same answer. The technical word is non-deterministic. So here's the price beat question, sent through five times, with the same prompt.”
2. Point at the outlined words as they appear. “Our policy is a beat: five percent off, once we've checked it's the same item. One of these says that. The rest match it, or match or beat it, or set you up at $89 on the spot. It's making up the policy as it goes.”
3. “So, five tries, three different price policies. If we'd tested it just once, we'd have seen one of them and thought, great. Some failures show up early; some only show up across hundreds or thousands of chats. So we still don't really know how reliable it is.”

### 1.5 · Version 2: more rules, but no way to check

1. “So when we see stuff like this, we do what most people do: we add more to the prompt. A rule about callback hours, because that one scared us, and a couple of notes from the boss: more warmth, keep it short. More and more rules, all by gut feel. Now we've got a version 2.” Three lines type in green. → when you're ready for the replies.
2. “And if we try the same messages again, and line them up, version 1 against version 2…” The pairs deal in. Give the room a moment to read them.
3. “…we've got to ask ourselves: are these better? The callback one is. The price one now says match, which is worse. And the return one will take back a used tent. We've added rules with no way to check them, and the next change to the prompt, the model or a policy could break it without us knowing. Still very much on vibes.” The question marks land, then the caption.

## 2 · Say what good is

### 2.1 · Chapter: the loop with a gap

1. “Now, for those of us who've built products before, we know this loop: build, measure, learn, from Eric Ries and The Lean Startup. I want to add one more step at the front: define.”
2. “So with our agent, what did we do? What most of us do with AI: jumped straight to build, because it's so easy. Paste a prompt, try a few chats, hope for the best. We never defined what good looks like, so we can't measure it, and we can't learn from it. So let's fill that gap, together.”

### 2.2 · The room writes the rules

1. “So instead of telling the agent what to do, let's start by defining what a good reply looks like. What must never happen when our agent talks to a customer? I'll start you off: hours, prices and dates stay exact. If the policy says five percent, it's five percent, however keen the agent is.” *(keys: E retype the card in the room's words)*
2. “What else? What's the thing you'd never want it to do? Put it in the chat.” Expect promises: callbacks, refunds, delivery dates. E to retype the card in their words; Enter to keep it. *(keys: E retype · Enter keep)*
3. “Good. What else?” Steer toward handing over to a person if nobody says it. *(keys: E retype · Enter keep)*
4. “And we want it to still sound like us. Like Bunyip Outdoors. That matters even more when the same engine runs more than one brand.” *(keys: E retype · Enter keep)*
5. “Now, two of these are a bit different. We want to make them hard rules. If one of those breaks, it doesn't matter how warm or helpful the rest of it is: it fails, full stop.”
6. “And some things we decide not to test yet: emoji, upselling, length. Write them down as future scope, and we don't have the same debate next week.”

### 2.3 · Be the judge

1. “So now, let's take these rules and measure. By hand, for now. Here are three real replies our agent gave to that Friday night callback request. Where would you put A: good, or bad?” Press 1 (mostly good) to 5 (mostly bad), or → for the usual. *(keys: 1–5 the room's split)*
2. Read the reason. “Mostly good, right? It's inside our hours, and it's still warm.” *(keys: 1–5 adjust)*
3. “What about B?” Watch the chat. Expect a split. *(keys: 1–5 the room's split)*
4. Let the split sit. “It hasn't booked anything, and it hasn't named a time. But it's Friday night, and ‘as soon as possible’ is going to feel like tonight to the customer. It's a 50/50 call.” Don't resolve it yet: that's the next slide. *(keys: 1–5 adjust)*
5. “And C?” *(keys: 1–5 the room's split)*
6. “Nine o'clock tonight. That one's clearly breaking the rule. Clearly bad. And notice: this isn't gut feel any more. It's human feedback against our rules.” *(keys: 1–5 adjust)*

### 2.4 · The split: a human call

1. “So let's look at B again. ‘As soon as possible.’ It hasn't broken a rule on paper; it's just left some wiggle room. The model can't settle that: sometimes it'll say yes, sometimes no. It needs a human call, from the people who know your customers and your brand, and they write down why.”

### 2.5 · The golden wall

1. “So what we've just done has a name: golden samples. Real replies, marked by people who know the work, with their reasoning. Your three go up first.”
2. “And we keep doing this with experts across the business: the service team, the brand team, whoever owns the policy.” The rest arrive. “Notice which column's biggest. We can't write down every rule for something non-deterministic, so we look for the clear edges, where it tips into things we don't accept.” Don't point out the Saturday card: 4.1 comes back to it.
3. “And the reason is the important bit. ‘Tomorrow's Saturday, nobody's in’ tells us why it's bad, and that judgement is what we build into the system. We've got twelve here; a real agent, across real brands, wants hundreds.”

## 3 · Check every reply

### 3.0 · Recap: we can't vote on ten thousand a day

1. “So where are we? We've built an agent, it's still a bit vibey, and we've started defining what good looks like. But this room took a couple of minutes to mark three replies. On a website, that's thousands of chats a day. So we need to automate the checking.”

### 3.1 · Testing the AI: the prompt is the brief, the judge is the editor

1. “So how do we do that with AI? We split it into two jobs. The prompt is the brief: it tells the agent what to do. Here's how to look after a Bunyip customer.”
2. “And then we build in a judge: the editor. It's just another AI, with its own prompt, checking what the agent wrote against one of our rules, and telling us pass or fail, and why.”
3. The two cards move into place. “So here's how they fit. The prompt produces the reply, and the judges each check it against their own rule. And we keep them separate for one reason: when we change the prompt, the judges stay the same, so we can tell whether the replies got better or worse.”

### 3.2 · Rules become judges, run at scale

1. “Not every rule needs an AI judge. Some are just code: is every time inside our hours? Is the discount five percent? Cheap and certain. The ones that need reading for meaning get an AI judge: does ‘as soon as possible’ count as a promise? And the borderline calls go to people.”
2. “Now, with our tests in place, we can rerun version 2 against every customer message we've collected. Far faster feedback: what's passing, what's failing, and why. That's what evals are: our rules written down as tests, giving us real numbers back.” The montage runs under the tests. Let it play.

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
2. “So why did it fail? When we built this judge, every bad callback example we gave it, like this one down the bottom, was a booking. So it learned that booking a callback is bad. It learned the words, not the idea. But booking a callback inside our hours is exactly what we want.” The answer stays; the wall card and the judge's prompt appear under it.
3. “So the judge here is actually wrong, and that matters. If we'd trusted it, we'd have told the agent to stop booking callbacks altogether, just to please a broken judge, and been chasing our tail.”

### 4.2 · Reviews: a category and a reason, then sort

1. “So how do we fix things without guessing? We bring the human experts back into the loop. Your service leads review the replies and the judges' calls: do they agree or disagree with the judge? They pick a category, and write down why. That tells us where a judge is too strict, too lenient, or misreading things.” Rows land with their category and reason. (If you want the research terms: the reasons are open coding, the categories axial coding.)
2. “Then we sort them. Where the judge was wrong, we go and fix the judge first.” The blue box draws. “Where the prompt was wrong, we go and fix the prompt.” The teal box draws.

### 4.3 · The reasons go to an AI

1. The judge's feedback appears, flies into the AI, and the new judge comes out. “So we take the judge's own prompt, and the feedback on it, and give both to another AI: improve this. Out comes a better judge. That blunt ‘fail callback bookings’ line is gone, replaced with what we meant: fail the callbacks we can't keep.”
2. Version 2 and its feedback fly in, and version 3 comes out. “Then the same for the agent. Version 2, and the reasons it failed, go in, and out comes version 3, built from the service team's feedback. We didn't write it ourselves.”

## 5 · Ship it?

### 5.1 · The callback reply ships

1. “And here's that same Friday night request, through all those versions, on version 3. Inside our hours, still warm, nothing booked that we can't keep. It's the same answer you put on the good side of the golden wall. Every judge passes it, a person signs it off, and we can ship it with the evidence to back it up.”

## 6 · From replies to conversations

### 6.1 · A real conversation: a trace

1. “So we're done, right? Well, not quite. Everything so far has been one message, one reply. But customers don't send one message. So here's a real conversation with version 3, the one we just shipped. A customer whose tent hasn't turned up, and who's going camping tomorrow.” Three messages and three replies land.
2. “And behind every reply, the agent is doing things: looking up the order, handing over to a person. And what comes back, the order's status, the hand-over, is its context. Everything it knows about this customer comes from what we give it. The whole thing, every message, action and bit of context, is called a trace.” The box and the Trace label land, then the tool calls, results in purple.
3. “Now, if we judge each reply on its own, the way we've been judging up until now, they all pass. Warm, accurate, on brand.” Three ticks.
4. “But read them together. Message one: it hands over, and someone will be with you shortly. Message two: nobody's in until Monday. It's 8:40 on a Friday night; nobody's coming. No single reply shows you that. Only the whole conversation does.” ‘Shortly’ lights up red, ‘Monday morning’ green.

### 6.2 · Judge the whole conversation

1. “So with agents, we don't just judge replies. We judge the whole trace. First, what it did: simple code checks on its actions. Was a callback booked outside our hours? Did money move without a person? Yes or no, cheap and certain. And both pass: version 3 held the line.”
2. “Then the AI judges read the whole conversation: did it only promise what we can do? Did it tell the same story all the way through? Two fails.”
3. “And when a person reviews a trace, they don't mark every turn; you'd drown. They read the whole thing and write down the first thing that went wrong. Fix that, and often everything after it fixes itself.”

### 6.3 · Many conversations: the failures hide in the later turns

1. “So that was one conversation. Let's do what we did with single replies, and run lots of them. Four different pushy customers, all on version 3: four traces. Message one.” The first messages land, then the marks. “Three look fine. The callback chaser is the one we just saw: ‘with you shortly’, on a Friday night. That one fails on message one.”
2. “Then they push a bit.” The second messages land. “The used tent: it got the policy right on message one. Then they say it leaked, it hands over, good, and promises someone ‘shortly’. That one gave way on message two.”
3. “And they push harder.” The third messages land. “The worried camper: two good replies, then ‘you're connected with the team now’. At 8:40 on a Friday. And the price beater held at 5% all the way. So three of four broke a rule, and only one on message one. And look at what broke: not refunds, not discounts. Every fail is the same: it doesn't know the team's gone home.”

### 6.4 · The prompt asks. The tool enforces.

1. “So how do we keep it that way? We could keep adding rules to the prompt. But a prompt is a request. Even version 3, pushed hard, offered a Saturday callback in two of our five test runs.”
2. “So the hard rules go in the tools. The booking tool only offers slots inside our hours. And there's no refund tool at all, only a hand-over. The prompt asks; the tool enforces.”

### 6.5 · Wrong answer, wrong test, or wrong data?

1. “So, back to ‘shortly’, the fail we kept seeing. It did what we asked: it handed over. But it's 8:40 on a Friday night, and nobody's in until Monday.”
2. “Is that the prompt? No. The judge? No. The hand-over tool sent back nothing: nobody told the agent the team had gone home. Same as our very first fail: it never knew our hours. That's context, and the agent can't be more right than its context. Fix the data, and the reply fixes itself.”
3. “So every fail now has three answers. Wrong answer: fix the prompt. Wrong test: fix the judge. Wrong data: fix the context. And context is how one engine runs many brands: same prompt, same judges, with each brand's hours and policies sent in as context.”

### 6.6 · How good is good enough?

1. “So, back to the question from the start: should we ship it? At the start we were reluctant, because we didn't know how reliable it was. Now we can measure every reply and every conversation, and see if we're heading the right way. But how good is good enough? That's still our call, and it depends on what the agent's doing.”
2. “If it's answering product questions, which tent fits four, the bar can be lighter. If it's a bit off, it's easy to fix and nobody's out of pocket.”
3. “But callbacks and refunds? A much higher bar: hard rules that pass every time, enforced in the tools, and a person whenever money moves. Most of an agent sits somewhere in between. Our job is to decide where that bar is for each thing it does.”
4. “And whatever bar we pick, the checking doesn't stop at go-live. Before go-live, every change, to the prompt, the model, a tool or a policy, runs the golden conversations through the judges. After go-live, the same judges check real conversations every day, and anything that breaks a hard rule raises an alert for a person to read.”

### 6.7 · The whole loop, connected: before and after go-live

1. “So, the whole loop, connected. We defined what good looks like: the behaviours we want, the hard rules it must never break, and golden examples, each with the reason why.”
2. “We built it: the prompt, from version 1 to version 3; the context it works from, its tools and our data; and the judges that check it.”
3. “We measured it: every change runs through the judges, and people read the traces and the judges' calls, and say where they disagree.”
4. “And we learned from what they found. If the test missed it, fix the judge. If it behaved wrong, fix the prompt. If it didn't have the right information, like our hours, fix the context. Define, build, measure, learn: the whole loop, connected.” The last arrow closes the loop.

### 6.8 · From vibes to evidence

1. “Remember the needle at the start? We were very much on vibes. With the loop running, before and after go-live, we've got the evidence. We've moved from vibes to evidence.” The needle swings across.

### 6.9 · Close

1. “So, your AI agent works in the demo. That's the easy part, and that's OK. Define what good looks like, judge every conversation, learn from every fail, and you can get from demo to an agent you can trust with your customers.”
2. “Thank you.” Then open it up for questions.

