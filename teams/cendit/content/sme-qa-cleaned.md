# Denver Water SME Q&A — Cleaned Transcript

Edited for readability from `sme-qa-transcript.md` (the raw auto-generated
transcript). Filler words, false starts, and side remarks are removed and
fragmented sentences are joined; wording is otherwise the speakers'.

The raw transcript's speaker numbering is unreliable — labels change mid-sentence
and a single answer is often split across three numbers. Rather than guess, this
version marks turns only as **Q** (a participant) and **A** (the Denver Water
subject-matter experts). Where a claim matters, check it against the raw file.

Uncertain transcription is marked with `[?]`.

---

### Opening — orienting on the data and the map (00:00)

**A:** Everything is there. Once you start pulling the data, I think all of them
have location labels associated with them, so you'll be able to correlate where
they are on the map — Strontia Springs Reservoir [?], and we have additional
information on where the Foothills treatment plant is. Once you get into it you'll
be able to see the progression of water.

Jake and I can help you tomorrow if you have questions: what does the big picture
look like, what should we focus on, what's the random red line that crosses the map
and what does it mean. Feel free to bring all of those questions tomorrow morning.

### Biggest problem to solve (00:59)

**Q:** If you could wave a magic wand and solve some problems, what are your
top-of-mind biggest problems right now?

**A:** The simple answer: our biggest problem is that we don't have visualization
on this. You're all probably familiar with the digital twin concept — that would be
my pie-in-the-sky. A visual tool where we can model all of these different
constituents, model against historical years, and integrate all of these data sets
that we have on our own but can't easily digest — clean them up and write that
story, so we can explain different conditions to people across the organization.

### Interpolating between monitoring points (02:01)

**Q:** How reasonable is it to interpolate some of the water data? We're missing
pieces in between at points.

**A:** That's a great question, and it's one we're trying to figure out. All of this
is real-time monitoring data — you have certain instantaneous points in time. One of
the questions we have right now is what are we missing in that story, and can we
actually begin to draw the picture that tells us that.

Everything we do right now is real time. We look at these either in the past or
while things are happening, from the treatment plant perspective of what's happening
right now. If we can start to look at this in the future and model these things
ahead of time, then it starts to tell us that story.

### Predictive models and alerting (02:59)

**Q:** Are you using barometric pressure or radar in your predictive models?

**A:** A little bit, when they're doing water quantity estimations. They pull in the
historical data sets and look at real-time streams — SNOTEL-type data [?] —
estimating what the snow water equivalent might look like, so how much water is
coming from that snow. Then they use those storms to predict what the scale might
be.

But it's purely a big-picture frame. It's not for acute things; it's not for looking
at a point in a stream to figure out what's going on. It's a big-picture look at
what we might see this year.

**Q:** So there aren't alerts generated off of that data?

**A:** Not usually.

### Political and organizational constraints (03:59)

**Q:** On the decision making around low or high water levels — what political or
organizational problems are you facing that sit outside the actual technical
problems?

**A:** A big one is water rights, which is both legal and political. You have a
right to water in various locations and can use as much as you can, but you also
have an obligation to provide water downstream. In a year like this one you want to
be cognizant that you're not burying [?] another city that uses a water source you
share — while still having enough water to provide to your constituents.

A more public-facing one: we're in a drought, we've put in water restrictions, only
water two days a week. But in our system, to get good water quality, you'll often
see us flushing hydrants — sending a bunch of water down the sanitary sewer. So you
get phone calls: "You're telling me I can't water my grass and you're flushing
gallons and gallons of water down the drain." It's telling the story of, if we don't
do that, we're going to have a water quality issue and you're not going to be able
to drink the water.

You also run into issues where parks and public areas are watering and may not have
the same restrictions as individual users, because of different rules, agreements,
and MOUs we have with various partners.

And it depends on those around you. We share a lot of water sources with recreation
uses — if you love rafting, it's been a really terrible year for rafting. Fisheries
hate us, because they want certain amounts of stream flow and certain temperatures,
and we're often moving so much water. Our target is how we move water to meet water
demands, not necessarily what's the best condition for the fish in your fishery.

### Filtration and pathogen risk (06:32)

**Q:** In your water treatment plants, is your filtration replacement schedule based
on pathogen risk?

**A:** It is. That one's interesting, though, because you determine your pathogen
risk at the beginning of your treatment process. You calculate a risk factor, and
then you have to have a certain filtration time and a certain disinfection residual.

### How stations are selected (07:05)

**Q:** In the SNOTEL data set, we're seeing stations identified by a number. Are
there groups of stations, or how do you pick out the stations that matter for a
certain area?

**A:** Really off of locational data — the geographic coordinates. They're not
necessarily a group; they're scattered throughout the state.

We actually started with Michigan Creek initially in the model, and we found data
anomalies — errors in the data — in that one, so we switched. I think Buckskin Joe
is what they switched to [?].

### Audience for the visualization (07:51)

**Q:** Going back to visualization being the biggest problem — who's the target
audience? You and your team, the public, the water treatment plants?

**A:** It's a lot of groups, for different reasons.

- We have a whole team of about 50 folks who handle water **quantity**. Their focus
  is how much water there is, how we move it, and how we meet the demand and the
  water rights we have.
- My team and the watershed scientists are focused on the **quality** of that water
  and the implications of moving it — how we hit regulation, how we make sure we're
  being good environmental stewards while also meeting drinking water requirements.
- The **treatment plants** look at it more acutely: what's the water coming in, how
  do we treat it, and how do we treat it efficiently and at low cost. Treatment
  plant chemicals are expensive — hundreds of millions of dollars expensive.

### An event that caught them off guard (09:12)

**Q:** Can you tell us about a recent event where runoff or snow caught you off
guard and led to a bad outcome?

**A:** A good example is 2023, I think it was. We had a hundred-year storm in the
South Platte watershed. We didn't have a heads-up on the scale of it — we knew it
was coming, but we didn't know how big.

What happened is that water hit the treatment plant and we almost had to shut it
down. The turbidity and water quality coming in was too much for our filters to
handle. We were able to treat it with chemicals, but it took filters offline, we had
to do massive cleaning, and we had to slow down the rate at which we could put water
into the system.

That was a really big one where it was like, this is probably something we need to
start looking at more closely. The trigger on the water quality and treatment side
is: this is something you could look at ahead of time. It really shouldn't be
happening.

### Close (10:23)

Fifteen-minute break before the panel on AI and DDD. Tomorrow starts at nine,
continuing in cohorts. Cassidy and Jake will be there to circulate and answer
questions.

---

## Notes for the team

- **Station switch:** the SME recalled switching from Michigan Creek to "Buckskin
  Joe." The repo's own record differs — `AGENTS.md` and the models use
  `data/HoosierPass.csv` after the `data/MichiganCreek.csv` SWE artifact. Worth
  confirming with Jake before citing either name.
- **Proper nouns marked `[?]`** ("Estrella Springs" → likely Strontia Springs,
  "no-tell" → likely SNOTEL, "football treatment plan" → Foothills) were corrected
  in the text above; the raw transcript has the original audio artifacts.

Denver Water's data terms (`data/TERMS.md`) apply to anything derived from this
session.
