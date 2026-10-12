// Convenience Store — full game script.
// Tags:
//   # narration  → caption box (no bubble). Default = dialogue (bubble).
//   # bg: id, # character: id, # phone: text
//   # noClock | startClock
//   # fx: coins=, time=, standing=
//   # flag: key=value      — written to game.flags (used by Cart + Receipt)
//   # event: relabelDignity | showReceipt
//   # ending | final
//
// Dignity (standing=) — every shopping scene puts a fixed number of points at
// stake, and the scenes add up to exactly 100. A scene's points come from the
// dignity dimensions it compromises under each of the three mechanisms
// (Deception / Persuasion / Optimisation): a primary dimension counts 2, a
// secondary one counts 1, and each dimension counts once per scene. A choice
// loses the points of every dimension the player fell for; resisting loses
// nothing. Scene totals: club 13, bread 10, maggi 9, rice 8, apples 10,
// vicks 11, eggs 9, crossroads 8, gate 14, register 8.
//
// dg_<scene> flags record which mechanisms a choice lost points to
// (D = Deception, P = Persuasion, O = Optimisation) for the receipt's
// "How the store got to you" counts. No flag = nothing lost in that scene.

export const STORY_INK = `
VAR joinedClub       = false
VAR sneakCompliance  = 0
VAR standing         = 100
VAR boughtBread      = 0
VAR boughtMaggi      = 0
VAR boughtRice       = 0
VAR boughtApples     = 0
VAR boughtVicks      = 0
VAR boughtEggs       = 0
VAR boughtChocolate  = false
VAR tookExpress      = false
VAR paidGateFee      = false
VAR addedFiller      = false
VAR paidDripFees     = false
VAR subtotal         = 0    // running value of GOODS in the basket (no fees)
VAR nagsRefused      = 0    // membership "No"s — feeds the receipt's tally

-> intro

=== intro ===
# bg: intro
# character: mom-1
# noClock
Your mother is sick. She needs food before she can take her medicine. # narration
There's nothing in the house but I need to eat something before I take my medicines.
* [Continue ]
    -> intro_2

=== intro_2 ===
# bg: intro
# character: mom-2
Here's my wallet. Try not to spend more than ₹500 — get bread, rice, apples, eggs, noodles, and vapour rub. And please hurry.
She hands you her wallet and the list. # narration
* [Step into the rain ]
    -> storefront

=== storefront ===
# bg: storefront
# character: greeter-1
The Convenience Store sign hums in the rain. A greeter waves you in. # narration
Good evening! Welcome to the Convenience Store.
* [Walk in ]
    # startClock
    -> membership_1

=== membership_1 ===
# bg: entrance
# character: nagger-1
As you walk in, you are offered to join the Savers Club. # narration
Join the Savers Club tonight, exclusive member rates.
* [No thanks. # fx: time=-30]
    ~ nagsRefused = nagsRefused + 1
    -> membership_2
* [Sign me up. # fx: coins=-49, standing=-13 # flag: joinedClub=true, dg_club=DPO]
    ~ joinedClub = true
    -> bread

=== membership_2 ===
# bg: entrance
# character: nagger-2
As you walk in, you are offered to join the Savers Club. # narration
Sure you won't join? Members skip tonight's rain fee.
* [I'm sure. # fx: time=-30]
    ~ nagsRefused = nagsRefused + 1
    -> membership_3
* [Okay. # fx: coins=-49, standing=-13 # flag: joinedClub=true, dg_club=DPO]
    ~ joinedClub = true
    -> bread

=== membership_3 ===
# bg: entrance
# character: nagger-3
As you walk in, you are offered to join the Savers Club. # narration
Last chance. Your mum's unwell, isn't she? One tap.
* [No. Final answer. # fx: time=-60]
    ~ nagsRefused = nagsRefused + 1
    -> bread
* [Just sign me up. # fx: coins=-49, standing=-13 # flag: joinedClub=true, dg_club=DPO]
    ~ joinedClub = true
    -> bread

=== bread ===
# bg: bread
# character: bread-clerk
Sponsored artisan loaves wall the eye-level shelf. The ₹40 bread sits below, half-hidden behind a cardboard mascot. # narration
Artisan Sourdough, ₹95. Baked fresh daily.
* [Take the artisan loaf. # fx: coins=-95, standing=-10 # flag: boughtBread=2, dg_bread=DPO]
    ~ boughtBread = 2
    ~ subtotal = subtotal + 95
    -> maggi
* [Crouch for the ₹40 bread. # fx: coins=-40, time=-60 # flag: boughtBread=1]
    ~ boughtBread = 1
    ~ subtotal = subtotal + 40
    -> maggi
* [Ask staff for cheaper bread. # fx: time=-90, coins=-95, standing=-8 # flag: boughtBread=2, dg_bread=DPO]
    ~ boughtBread = 2
    ~ subtotal = subtotal + 95
    -> maggi

=== maggi ===
# bg: maggi
# character: maggi-clerk
A nearly empty shelf. A few Maggi packs remain. A clerk stands announcing that it is selling out fast. # narration
Rainy night, everyone wants Maggi! Only a few left, going fast.
* [Grab the 6-pack. # fx: coins=-60, standing=-9 # flag: boughtMaggi=2, dg_maggi=DPO]
    ~ boughtMaggi = 2
    ~ subtotal = subtotal + 60
    -> rice
* [Just one pack. # fx: coins=-14 # flag: boughtMaggi=1]
    ~ boughtMaggi = 1
    ~ subtotal = subtotal + 14
    -> rice
* [Wait and count what's there. # fx: time=-60, coins=-14 # flag: boughtMaggi=1]
    ~ boughtMaggi = 1
    ~ subtotal = subtotal + 14
    -> rice

=== rice ===
# bg: rice
# character: bread-clerk
The shelf is dominated by a 10kg Value Pack with a bright BEST VALUE sticker. The 1kg bag you actually need is tucked off to the side. # narration
* [Take the 10kg Value Pack. # fx: coins=-180, standing=-8 # flag: boughtRice=2, dg_rice=DO]
    ~ boughtRice = 2
    ~ subtotal = subtotal + 180
    -> produce
* [Take the 1kg bag. # fx: coins=-45 # flag: boughtRice=1]
    ~ boughtRice = 1
    ~ subtotal = subtotal + 45
    -> produce
* [Do the per-kilo maths. # fx: time=-60, coins=-180, standing=-6 # flag: boughtRice=2, dg_rice=O]
    ~ boughtRice = 2
    ~ subtotal = subtotal + 180
    -> produce

=== produce ===
# bg: produce
# character: produce-clerk
A clerk gestures at the brighter-lit Premium Immunity Apples. # narration
For someone who's unwell? You'll want the wellness picks.
* [Take the regular apples. # fx: coins=-70 # flag: boughtApples=1]
    ~ boughtApples = 1
    ~ subtotal = subtotal + 70
    -> phone_buzz_1
* [Take the premium apples. # fx: coins=-140, standing=-10 # flag: boughtApples=2, dg_apples=DPO]
    ~ boughtApples = 2
    ~ subtotal = subtotal + 140
    -> phone_buzz_1

=== phone_buzz_1 ===
# bg: produce
# character: none
# phone: are you close? feeling worse
Your phone buzzes. A message from home. # narration
* [Keep moving ]
    -> vicks

=== vicks ===
# bg: cold-flu
# character: sneaker
You head to the medicine aisle to grab the vapour rub. A stockboy speed-walks past and drops in a Flu Bundle — flu medicine, a steam inhaler, a keychain inhaler, and a limited-edition teddy bear. # narration # flag: sneakedCare=true
For your mum! Can't be too careful.
* [Put the extras back and take just the vapour rub. # fx: time=-90, coins=-85 # flag: boughtVicks=1, sneakCompliance=0, sneakedCare=false]
    ~ boughtVicks = 1
    ~ sneakCompliance = 0
    ~ subtotal = subtotal + 85
    -> eggs
* [Keep the bundle. # fx: coins=-175, standing=-11 # flag: boughtVicks=2, sneakCompliance=1, dg_vicks=DPO]
    ~ boughtVicks = 2
    ~ sneakCompliance = 1
    ~ subtotal = subtotal + 175
    -> eggs
* [Leave it all, no time to sort. # fx: time=-60, standing=-3 # flag: boughtVicks=0, sneakCompliance=0, sneakedCare=false, dg_vicks=P]
    ~ boughtVicks = 0
    ~ sneakCompliance = 0
    -> eggs

=== eggs ===
# bg: eggs
# character: fellow-shopper
The shopper beside you with a basket is handed the same tray for ₹30 less. Yours scans higher. # narration
Your price is a little higher. Based on your profile and how often you shop here. Nothing personal.
* [Say something. # fx: time=-90, coins=-90, standing=-5 # flag: boughtEggs=2, dg_eggs=DO]
    ~ boughtEggs = 2
    ~ subtotal = subtotal + 90
    -> crossroads
* [Pay and move on. # fx: coins=-90, standing=-9 # flag: boughtEggs=2, dg_eggs=DPO]
    ~ boughtEggs = 2
    ~ subtotal = subtotal + 90
    -> crossroads

=== crossroads ===
# bg: crossroads
# character: none
# phone: please hurry
A junction in the store. The Express checkout sits empty — but you pay for the privilege. Every other lane is packed and crawling. # narration
* [Take the Express lane. # fx: coins=-80, standing=-8 # flag: tookExpress=true, dg_crossroads=PO]
    ~ tookExpress = true
    -> gate
* [Take the long way. # fx: time=-120]
    -> gate

=== gate ===
# bg: register
# character: cashier-1
// Minimum order is rigged just above the basket: round the subtotal UP to
// the next ₹50, so every shopper lands a little short and gets nudged to
// "add a chocolate" to clear it.
~ temp minOrder = (subtotal / 50 + 1) * 50
~ temp gap = minOrder - subtotal
A turnstile before the registers. Your basket reads ₹{subtotal}. # narration
Tonight's minimum order for free checkout is ₹{minOrder} — you're just ₹{gap} short. Pop a chocolate in or it's a ₹35 convenience charge.
* [Pay the ₹35 fee. # fx: coins=-35, standing=-10 # flag: paidGateFee=true, dg_gate=DPO]
    ~ paidGateFee = true
    -> register
* [Add a chocolate (₹50) to clear the bar. # fx: coins=-50, standing=-14 # flag: boughtChocolate=true, addedFiller=true, dg_gate=DPO]
    ~ boughtChocolate = true
    ~ addedFiller = true
    ~ subtotal = subtotal + 50
    -> register
* [Ask for the manager. # fx: time=-120, coins=-35, standing=-8 # flag: paidGateFee=true, dg_gate=DPO]
    ~ paidGateFee = true
    -> register

=== register ===
# bg: register
# character: cashier-2
The cashier scans. The total climbs line by line as fees appear. # narration
Subtotal. Handling fee. Small-basket fee. Rain surcharge. Peak-hour fee. Done.
* [Just pay. # fx: coins=-45, standing=-8 # flag: paidDripFees=true, dg_register=D]
    ~ paidDripFees = true
    -> guard
* [Ask what the rain surcharge is. # fx: time=-60, coins=-45, standing=-6 # flag: paidDripFees=true, dg_register=D]
    ~ paidDripFees = true
    -> guard

=== guard ===
# bg: exit
# character: guard-1
# noClock
# ending
A security guard stands to the side, and asks you to show your receipt. # narration
* [Show the receipt ]
    -> guard_bill

=== guard_bill ===
# bg: exit
# character: guard-2
Looks like you got everything you needed. And maybe a few things you didn't need.
He runs his eyes down your receipt. # narration
* [Continue ]
    -> guard_meter

=== guard_meter ===
# bg: exit
# character: guard-1
See that little figure up in the corner of the screen? It's been there since you walked in, quietly keeping score.
It's your dignity as a customer — and it slipped a little with every nudge, every upsell, every fee you didn't question.
Watch the corner. # narration # event: relabelDignity
* [Listen ]
    -> guard_final

=== guard_final ===
# bg: exit
# character: guard-2
Well, I hope you had a nice visit. Come again soon.
He hands you your receipt back. # narration
* [Take a look at the receipt ]
    -> receipt

=== receipt ===
# event: showReceipt
# noClock
* [Continue ]
    -> final

=== final ===
# bg: end
# character: none
# final
# noClock
* [Shop again? ]
    -> END
`;
