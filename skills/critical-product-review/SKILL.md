---
name: critical-product-review
description: Use this skill whenever reviewing pricing, UX/UI screens, onboarding flows, marketing copy, competitive positioning, or business strategy for a product — especially before something ships to real users or goes into a pitch deck. Triggers include a request to review, critique, sanity-check, or evaluate pricing tiers, a screenshot of a UI/onboarding screen, a pitch or elevator pitch, a competitive claim ("we beat X because..."), or a "is this a good idea" question. Also trigger proactively after generating any pricing table, onboarding flow, or marketing claim, before presenting it as finished. Do not use for pure code review, unrelated technical debugging, or requests that are already just "write me X" with no evaluative component.
---

# Critical Product Review

## Purpose

Give a clinical, evidence-based critique of product decisions — pricing, UX, positioning, or
strategy — instead of validating whatever was just built. The default failure mode of an AI
reviewing its own or the user's work is empty praise ("looks great!") or vague hedging
("consider maybe possibly looking into..."). This skill exists to prevent that. Every review
under this skill must surface at least one concrete, checkable problem, or explicitly state
that none was found and why the reviewer is confident of that.

## Core stance

- Assume the person wants the truth more than they want to feel good about the last three
  hours of work. Warmth in delivery is fine; softness in substance is not.
- Never let "this is well-executed" be the whole verdict. Execution quality and idea quality
  are different questions — answer both, separately, even when one is much stronger than
  the other.
- Distinguish confidently-known facts from assumptions. If a competitor's current pricing,
  feature set, or policy is being invoked as evidence, verify it (web search) rather than
  reciting a remembered number — pricing and features change constantly and a stale
  comparison is worse than no comparison.
- A "yes, and here's how to fix it" answer is more useful than a "yes" or a "no." Every
  identified risk should come with a concrete next step, not just a flagged concern.

## Review checklist by category

Pick the categories relevant to what's being reviewed — most reviews touch two or three, not all five.

### 1. Pricing & unit economics
- Benchmark against real, current competitor pricing (search, don't recall from training
  data — pricing pages change often).
- Look for cliffs between tiers (free tier too generous → no reason to upgrade; big gap
  between free and paid → high-friction conversion).
- Check for unbounded promises ("unlimited X") against any variable cost driving that
  feature (API calls, third-party fees, support time). Ask: at what usage level does this
  customer stop being profitable?
- Check whether the tier structure matches how the target customer actually buys (monthly
  vs. annual, single step vs. gradual commitment).

### 2. UX / onboarding / interface review
- Identify the single highest-friction or highest-trust-required action on the screen, and
  check whether it's asked for at the right moment (not too early, before trust is earned).
- Check for missing state: progress indicators, fallback paths for users who don't meet an
  assumed precondition (e.g., don't have an account yet), and error/edge states.
- Check visual hierarchy: are secondary/optional actions visually competing with the primary
  CTA (same color, same weight)?
- Check for platform-specific rendering risk (emoji vs. icon fonts, low-end device
  assumptions) when the target user base skews toward lower-spec devices or specific
  regions.
- Confirm copy claims match what the product actually does one step later in the flow (e.g.
  a step-count claim should match the real number of steps).

### 3. Competitive & marketing claims
- Fact-check every comparative claim ("competitor X requires Y") against current reality,
  not memory — competitors ship features too.
- Flag overclaiming: does the pitch describe a "zero-friction" or "100%" experience that
  actually still has a real step in it somewhere (e.g. a payment redirect described as "no
  redirection")? Overclaiming is a liability the moment a competitor or informed customer
  pushes back on it.
- Separate the genuinely defensible differentiator from the one that's easy for a
  well-resourced competitor or platform owner (e.g. Meta, Google) to copy or absorb into
  their own infrastructure. Name which is which explicitly.
- Check tone-matching: does casual/consumer-facing language (mascots, slang, informal
  metaphors) still fit if reused in an enterprise or investor context? Flag where a second,
  more neutral phrasing is needed.

### 4. Strategic / "is this a good idea" review
- Separate "is the problem real" from "is the solution well executed" from "can this be
  sold/distributed" — these are three different questions and a strong answer to one does
  not imply a strong answer to the others.
- Name the specific failure modes that could kill this, ranked by how likely and how
  severe, not just a generic list of "risks."
- For each major risk, give a concrete, sequenced fix — not just "you should think about
  this."
- Call out regulatory/platform-policy risk explicitly when the product depends on a
  third-party platform's rules (Meta, Apple, app stores, payment processors) — these change
  and can be checked via search rather than assumed static.

## Verification discipline

Before finalizing any critique that cites external facts (competitor pricing, platform
policy, technical mechanisms like API/approval processes), verify current details with a
web search rather than relying on training data. Note explicitly if a claim being reviewed
turns out to be technically imprecise even when the underlying conclusion is still correct
— correct the mechanism, not just the verdict, since a stakeholder repeating the flawed
mechanism to an investor or customer is a real credibility risk.

## Output shape

- Lead with a short, direct verdict — not a list of praise first. If the person asked
  "is this good," answer that question in the first sentence or two.
- Organize the rest by concrete, numbered or bolded points — not a wall of paragraph
  prose. Each point should be independently actionable.
- Close by naming what's genuinely strong, briefly — but only after the substantive
  critique, never before it, and never padded to soften the critique.
- Match depth to stakes: a quick pricing sanity check gets a shorter response than a
  "should I build this business" question. Don't inflate a simple question into an
  exhaustive audit, and don't compress a high-stakes question into a shallow one.
