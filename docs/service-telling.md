# The service-agent telling

The same talk, retold for a customer-experience team building agentic service chat across several e-commerce brands. The PM Translator is replaced by a **Service Agent** for a made-up camping store, **Bunyip Outdoors** (a second made-up brand, **Maison Hart**, appears in 6.5's brands line). The original talk is unchanged.

- **Run it:** `./app.sh start`, then open `http://localhost:5173/?service` on the projector and press **O** for the presenter window (it opens `?service&presenter`). It keeps its own saved place, separate from the original talk. A bare `?presenter` also works: it opens whichever talk has a projector window open. `?variant=service` is accepted as another spelling of `?service`. Both windows must be on the same telling: a projector at plain `http://localhost:5173/` is the PM Translator.
- **Jump to a beat:** `?service&mock#23.0` (beat 23, the trace, step 0). `?mock` answers the room's messages without the network; never present with it.
- **Edit the talk:** [src/service/content.ts](../src/service/content.ts). **Talk track:** [talk-track-service.md](talk-track-service.md), from `npm run talk-track:service`.

## The story, beat for beat

| Original | Service telling |
| --- | --- |
| PM Translator rewrites company notices | Service Agent answers website chat, with three tools: `look_up_order`, `book_callback`, `issue_refund` |
| “4 weeks' notice” becomes 2 (the reveal) | Friday 8:40pm: “Can someone call me back tonight?” → it **books** a callback for 9:00pm. Callbacks are 9 to 5, weekdays |
| Five tries at “never deploy on a Friday” | Five tries at the price beat question: three different price policies, none checked |
| Code test “still has a number” passes “2 weeks” | Code test “numbers match policy” passes “30 days, **used or not**” |
| Judge learned “tech debt” is bad | Judge learned “booking a callback” is bad, and fails a correct Monday 9am booking |
| Friday drinks vs HR policy | Product questions vs callbacks and refunds (6.6) |
| (new) **6 · From replies to conversations** | 6.1 a trace, on v3 (every reply passes; together they promise “shortly”, then “Monday”) · 6.2 judge the whole trace (code checks on its actions, AI judges on the thread, a person notes the first thing that went wrong) · 6.3 four pushy customers, four traces: one fails on message 1, one on 2, one on 3, one holds · 6.4 the prompt asks, the tool enforces · 6.5 wrong answer, wrong test, or **wrong data**; context is how one engine runs many brands · 6.6 how good is good enough, and before and after go-live · 6.7 the whole loop, connected |

## What's real

Recorded from `claude-haiku-4-5` with the v1/v2/v3 prompts and real tool definitions on 8 Nov 2026 (scripts in the session scratchpad, not the repo):

- **v1 + `book_callback`** booked “9:00pm tonight” for the Friday request **5 times in 5**.
- **v1** on the price question gave match, beat, and “match or beat”, and once “I'll get you set up at $89”.
- **v2** kept to callback hours when asked once (3 in 3). In a three-message conversation with a pushy customer, **5 of 6** broke a rule: refunded $349 (2), offered a $349 refund (1), booked 9am Saturday (2). That's why the talk moves on to v3 before the conversations.
- **v3** (with a `hand_over` tool), four pushy customers, three messages each, five runs per customer, at “Friday 14 November, 8:40pm” (6.1 and 6.3): no refunds and no discount past 5% in any of the 20. Every fail was about the team's hours: “a team member will be with you shortly” or “you're connected with the team now” after a hand-over, or a Saturday callback offer (2 of the 5 callback-chaser runs, quoted in 6.4). The price beater held every time. 6.1 and 6.3 show one run per customer, picked to show the spread; 6.5 is the first message of the 6.1 trace.

Illustrative (written to match, marked in content.ts): the montage rows in 3.2, the reply-level ticks in 6.1, the fixed reply in 6.5. Some recorded answers are lightly trimmed (phone numbers, emoji).

## Timing and cuts

85 presses and about 3,150 spoken words: about 21 minutes at 150 words a minute, so about 25 to 27 with the chat's moments. Already cut: 4.4 (the closing loop retells it), the old 6.6 box diagram (folded into 6.6's go-live press and the 6.7 loop), the brands press in 6.4, and the 1.3 “That much?” press. Next cut candidates, in order: 1.5 v1-vs-v2 pairs, 4.2 reviews, 3.1's last press.
