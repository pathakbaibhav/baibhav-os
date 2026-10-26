// Posts for the Writing app, newest first. Bodies are Markdown. Each post gets
// its own page at /writing/<slug>.

export type Post = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  summary: string;
  tags: string[];
  body: string;
};

export const POSTS: Post[] = [
  {
    slug: "asl-api-micro-batching",
    title: "How micro-batching took the ASL API from 443 to 1,569 req/s",
    date: "2026-10-26",
    summary: "Left hands, dark rooms and 32 clients at once: what it took to make a sign language API answer in 2.7 ms and scale 3.5×.",
    tags: ["Backend", "ML", "Performance"],
    body: `I built a tool that reads American Sign Language fingerspelling from a webcam: hold up a letter, and the app types it. The first version worked on my own hand, on my desk, with one browser tab open. This post is about everything that broke after that, and what it took to make the API answer in **2.7 ms** and keep up with **1,569 requests a second**.

The full project is in [the case study](/projects/asl-engine), and you can [try the live demo](https://pathakbaibhav.github.io/ASL-Interpretation-And-Learning-Tool/) right now: allow the camera and fingerspell.

## How it works

The browser runs MediaPipe hand tracking, which finds **21 landmarks** on your hand: the wrist, every knuckle and every fingertip. Those points go to a Flask API, which:

1. validates and normalises them,
2. checks a small response cache,
3. hands them to a micro-batcher,
4. asks two models, a scikit-learn Random Forest and a small TensorFlow network, to vote on one of **27 classes** (A to Z, plus space).

Signs held steadily are assembled into words, and the browser can read the result aloud. There's also a practice mode that shows a reference handshape and tracks your streak.

A nice side effect of doing hand tracking in the browser: the video never leaves your device. The server only ever sees **42 numbers per frame**.

## Problem 1: it only knew my hand

The first model scored 100% on its test set, which sounds great until you notice where the test set came from: my hand, my webcam, one session. Then I tried it with the hand closer to the camera, rotated a little, or with my left hand:

- hand nearer or farther: **88%**
- rotated and rescaled: **89%**
- left-handed: **54%**

Two changes fixed it.

**Normalise the landmarks.** Instead of raw screen coordinates, every point is shifted to the hand's bounding box and scaled by its longest side. Now the model doesn't care where your hand is in the frame or how far it is from the camera.

**Augment the training data.** Every training sample gets five copies that are randomly mirrored, rotated by up to 15°, scaled and jittered. Mirroring is the reason left-handed signing works: the model has simply seen it.

After both, the ensemble scores **100% on every variant**, including left hands.

> An honest caveat: the dataset is about 100 consecutive webcam frames per letter, from one signer in one session. A random split puts near-duplicate frames on both sides, so the clean test is easy. Expect lower accuracy with new people, backgrounds and cameras. More signers is the most valuable next step.

## Problem 2: the dark

Hand detection fell apart in a dim room. The fix is a fallback: if no hand is found *and* the frame is dark, gamma-correct it toward mid-grey and try again. Well-lit frames never pay for the second pass.

At 25% brightness and below, detection went from **33% to 64%**. I also tried CLAHE plus gamma, which sounds smarter, but it amplifies sensor noise; plain gamma won.

## Problem 3: 32 clients at once

A single user is easy. The real test was 32 simulated webcam clients sending requests back to back. The baseline server, one process and one thread, topped out at **443 requests a second**, with p95 latency at **77 ms** and climbing.

Three things changed that.

### Micro-batching

Models are much faster per item when you give them a batch. So concurrent requests are coalesced into one vectorised model call. The important detail: **a lone request is never delayed**. The batcher doesn't wait for company; it only batches requests that are already waiting. A single user still gets 2.7 ms.

### More workers

The API runs under gunicorn with **4 worker processes × 4 threads**. MediaPipe detectors aren't thread-safe, so each frame borrows one from a pre-warmed pool. If every detector stays busy for a full second, the request gets an HTTP 503 instead of queueing forever. Failing fast beats a queue that grows without limit.

### Dropping TensorFlow at serving time

The neural network is trained in TensorFlow, but its weights are exported and evaluated with plain NumPy on the server. The output is identical (checked to within 0.0001), a prediction takes **0.013 ms instead of about 2 ms** through Keras, and the server no longer needs TensorFlow installed at all.

### The result

At 32 concurrent clients:

- landmark requests: **443 → 1,569 req/s**, a **3.5×** jump
- p95 latency: **77 ms → 33 ms**, down **57%**
- frame uploads: **35 → 248 req/s**, about **7×**

## The cache that didn't matter (much)

There's also a thread-safe LRU cache, keyed on landmarks rounded to a 0.005 grid. I checked that the rounding doesn't change a single test prediction. It answers repeats in about 0.2 ms.

But on a live webcam, landmarks jitter a little from frame to frame, so the cache rarely hits. The throughput gains above come from batching and parallelism, not caching. I kept the cache, and I kept the honesty about it.

## Measure everything

Every number in this post comes from a script in the repo, so it can be reproduced. The API also reports on itself: \`GET /api/metrics\` returns request counts, errors, p50/p95/p99 latency, cache hit rate and average batch size, and every response carries a \`Server-Timing\` header you can see in your browser's devtools.

That habit, a number before and after every change, is the thing I'd keep from this project even if I forgot everything else.

## What I'd do next

- **More signers.** The model has really only met one person. Data from many people is the biggest win left.
- **Words, not just letters.** Fingerspelling is a small slice of ASL; real signs involve motion over time.
- **Run it all on the device.** The live demo already runs the network in the browser. Pushing the rest there would remove the server entirely.

Thanks for reading. The code, the tests and the benchmark scripts are all [on GitHub](https://github.com/pathakbaibhav/ASL-Interpretation-And-Learning-Tool).`,
  },
  {
    slug: "money-is-harder-than-it-looks",
    title: "Money is harder than it looks: 8 lessons from building an expense tracker",
    date: "2026-10-26",
    summary: "Floats that can't add, payments that arrive twice, card bills that double your spending, and why AI should be the last resort, not the first.",
    tags: ["Backend", "Fintech", "AI"],
    body: `I started building an expense tracker thinking it would be a weekend of forms and tables. Add a transaction, pick a category, draw a chart. A few design sessions in, I'd found a different problem under every one of those steps.

None of them is exotic. They're the kind of thing every banking app, accounting tool and fintech startup has had to solve, and most people never think about. Here are the ones I found most interesting, whether or not you ever build a money app.

## 1. Never store money as a float

Open a JavaScript console and type \`0.1 + 0.2\`. You get \`0.30000000000000004\`.

That isn't a bug in JavaScript. Floating-point numbers are stored in binary, and most decimal fractions, like 0.1, have no exact binary form, much as 1/3 has no exact decimal form. For a physics simulation, an error in the 17th digit doesn't matter. For money it does: add up a few thousand transactions and the totals start disagreeing by a paisa here and there, and a ledger that doesn't balance is a ledger nobody trusts.

The fix is old and simple: **store money as an integer in the smallest unit.** ₹432.00 is stored as \`43200\` paise. Integers add, subtract and compare exactly. You only turn them back into rupees at the very last moment, when showing them on screen.

If your language or database has a proper decimal type, that works too. What doesn't work is \`float\` or \`double\`.

## 2. One payment can arrive twice

In India, when you pay by UPI or card, your bank usually tells you more than once: an SMS, then often an email alert, and finally a line on the monthly statement. If an app imports all three, you've apparently spent the money three times.

So a tracker needs **deduplication**, and it's fuzzier than it sounds. The SMS and the email rarely look alike. One might say "Rs.432.00 debited", the other "INR 432 spent". The timestamps differ by a few seconds or minutes. The reliable approach is to match on several things at once:

- the same account (often only the last four digits are given),
- the same amount,
- a small time window,
- and the bank's reference number, when both messages include one.

When enough of those agree, the two records are merged into one transaction.

## 3. Paying your credit card bill isn't spending

This one surprised me most. Say you buy groceries for ₹2,000 on your credit card. That's spending. At the end of the month, you pay the card bill of ₹2,000 from your savings account. Your bank sends a debit SMS for that too.

Count both, and your groceries cost ₹4,000.

The bill payment is a **self-transfer**: money moving between two of your own accounts. It needs to be recognised and excluded from spending. The same goes for moving money into a savings account or topping up a wallet. Get this wrong and every chart in the app is quietly inflated.

## 4. Store the raw message before you understand it

The tempting design is: an SMS arrives, you parse it, you save the transaction. The trouble is that parsers have bugs and banks change their message formats. If you only kept the parsed result, a wrong parse is a lost transaction.

The better design is to **save every message exactly as it arrived, first**, and parse it afterwards in a background job. Two properties make this safe:

- **Asynchronous:** receiving a message is instant and never fails because the parser is slow or broken.
- **Idempotent:** processing the same message twice gives the same result, not two transactions.

When the parser improves, you can re-run it over every old message and fix history. Nothing is lost and nothing is counted twice. This pattern shows up everywhere data comes from the outside world, from payment webhooks to IoT sensors, and it's one of the most useful ideas in backend engineering.

## 5. Use regex first and AI second

In 2026, the obvious way to read a message like

\`\`\`
Rs.432.00 debited from A/c XX1234 to VPA swiggy@icici on 24-10-26
\`\`\`

is to send it to a large language model and ask for the amount and merchant. It works, but it's slow, it costs money per message, and it sends your bank messages to someone else's servers.

Bank SMS formats are actually very repetitive. A handful of **regular-expression templates per bank** covers most messages instantly and for free. The AI is only needed for the leftovers, and even then it can run **locally**, on your own machine, so nothing leaves it.

Two lessons came out of trying this:

- **Local models are slower than you'd hope at first.** My first test of a 7-billion-parameter model on a single HDFC message took 9.4 seconds, most of it loading the model into memory. Fine for a fallback; not for every message.
- **Never trust free-form AI output.** The model got the amount and merchant right, but described the direction as "debited from" instead of simply "debit". The fix is to force the model to answer in a strict schema, check the answer, and send anything with low confidence to a human to review.

The nice part: every message the AI parses correctly can suggest a new regex template, so over time the fast, free layer handles more and the AI is needed less.

## 6. Subscriptions don't need AI at all

Finding recurring payments, like Netflix, a gym membership or a monthly SIP, sounds like a job for machine learning. It's mostly a job for basic statistics.

Group payments by merchant, then look at the gaps between them. If the gaps cluster around 7, 30 or 365 days and the amounts are steady, it's almost certainly recurring. From there you can warn when a subscription is about to renew, or when its price quietly goes up. Not everything needs a model, and the simple version is easier to test and explain.

## 7. "My investment is up 10%" can be misleading

Say you invest ₹10,000 in January and another ₹10,000 in December. At the end of December, the whole thing is worth ₹22,000. A simple calculation says you made ₹2,000 on ₹20,000: 10%.

But the December money has barely been invested at all. Almost all of that ₹2,000 was earned by the January money, which makes your real annual return much closer to 20%.

That's why investment apps use **XIRR**: the yearly rate of return that accounts for *when* each rupee went in and came out. If you invest through monthly SIPs, it's the only return figure that means much, and it's worth knowing how to read it on your own statements.

## 8. Don't let an AI write SQL against your money

It's tempting to let a chatbot answer "How much did I spend eating out in September?" by writing a database query. It's also a good way to get wrong answers, or to leak data if the query isn't properly limited to one user.

A safer pattern is to give the AI **a small set of typed tools**, such as \`spend_by_category(start, end)\` or \`compare_periods(a, b)\`. The backend runs those as tested, user-scoped queries, and the AI only decides which tool to call and how to explain the result. It's less magical, but you can test every tool and reason about exactly what the AI can and can't see.

## The takeaway

The interesting part of a money app isn't the forms or the charts. It's being exactly right: integers instead of floats, one payment counted once, transfers that aren't spending, and returns that account for time. Most of these problems are solved with plain engineering, and the AI is most useful where it's kept on a short leash.

I'm building this tracker in public, so you can follow along on the [project page](/projects/expense-tracker) and on [GitHub](https://github.com/pathakbaibhav/smart-expense-investment-tracker). If you've built something similar, or there's a feature you wish your money app had, I'd love to hear it: [get in touch](/contact).`,
  },
];

/** Shown while there are no posts yet; the real posts come from the content questionnaire. */
export const PLANNED = [
  "Rerouting Boston's subway around live closures",
  "50+ automation tools later: lessons from shipping internal tooling at PPD",
  "Squeezing a Vision Transformer onto an edge chip",
];

/** Rough reading time at 220 words a minute. */
export const readingMinutes = (body: string) => Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 220));
