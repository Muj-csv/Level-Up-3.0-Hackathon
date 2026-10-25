# Writing rules for Taympers text

From the Simpler Filipino and English PRD (Section 2, Oct 25, 2026). Every piece of text in the
game follows these rules: `content/fil.json`, `content/en.json` (Phase 2), the built-in fallbacks
in `index.html` and, from Phase 3, the `ui` section of the content files.

Write the way an ate or kuya would explain the game to a younger cousin at the kanto, not the way
a textbook would.

## Protected terms

These words are part of what Taympers teaches, so they are **never reworded, respelled, shortened
or translated**, in either language. A rewrite changes only the words around them. The list lives
in [`content/terms.json`](../content/terms.json), which the checks read; add new terms there.

| Kind | Terms |
| --- | --- |
| Title | Taympers, and its tagline "Ang mga laro sa kalye, nasa ulap na." |
| Minigames | Tumbang Preso, Patintero, Sipa, Palosebo, Luksong Tinik, Piko, Pukpok Palayok, Saranggola, Hilahang Lubid, Taguan, Tag-tagan, Agawan Base, Sungka, Holen |
| Modes and features | Maglaro, Torneo, Hamon ng Araw, Pagsasanay, Huling Hirit, Pasaporte ng Laro, Tanong ni Lola, Sa totoong kalye, Subukan sa labas |
| Board and money | korona, piso, Swerte, Utang, Tikbalang, Sari-sari, Jack en Poy, Kasama |
| Island spaces and rides | Banda, Kampana, Munisipyo, Rizal, Tawad, Timbangan, Suki, Basa, Ulan, Alon, Huli, Buko, Taog, Araw, Tanim, Ani, Bayanihan, Balang; Kalesa, Padyak, Bangka, Kariton ng kalabaw |
| Items and bonuses | Dobleng dice, Kendi, Gintong dice, Agimat; Hari ng Laro, Mayaman, Malas sa Dice |
| Places and people | Plaza, Palengke, Aplaya, Palayan; Jun, Neneng, Totoy, Bunso; Lito, Mayumi, Boyet, Dodong; Lola |
| Bot levels | Madali, Sakto, Mahirap |
| Street-game words | taya, pamato, tsinelas, tinik, sipa (the toy), palayok, panyo, pista, barangay |

In English these stay exactly as written. The first time one shows on a screen, a short meaning
may follow it in brackets, such as "Agimat (lucky charm)", and How to Play explains every one. The
meaning sits next to the term, never in its place.

## Filipino

1. **Short sentences, one idea each.** Aim for 8–12 words, and no more than 3 short lines on a card.
2. **Talk to the player.** Use "ka" and "mo", and start with the action: "I-tap…", "Takbo!", "Kunin mo…".
3. **Use the English words kids already say:** level, score, team, player, bonus, tap, item.
4. **Swap deep words for everyday ones** (table below).
5. **Keep the protected terms.** Every term above stays exactly as written. Explain a term the
   first time it appears, with a picture or a few words, without replacing it.
6. **Numbers as digits:** "+3 piso", "5 tira", "20 segundo".
7. **Same facts, new words.** A rewrite never changes a rule, a number or a fact.

| Instead of | Write |
| --- | --- |
| koponan | team |
| manlalaro | player, kalaro |
| antas | level |
| kalahok | sumali, players |
| ideklara | ginawa |
| sumasagi | tumatama |
| pinababagsak | nahuhulog |
| sasalagin (ng agimat) | "Hindi ka aatras kung may Agimat ka" |
| upang | para |
| subalit | pero |

## English

1. **Plain words a Grade 2 reader knows:** "Hit the can", "Tap when the ring glows".
2. **Same meaning as the Filipino card, not word for word.** Short sentences, no idioms.
3. **Protected terms stay in Filipino.** The first time one appears on a card, add its meaning in
   brackets: "tsinelas (slippers)", "taya (the one who chases)".
4. **American spelling** (color, favorite), as in Philippine schools.

`content/en.json` has the same entries as `content/fil.json`, with the same ids, in the same order,
and the Tanong ni Lola answers in the same order (the right one first). When you add or move an
entry in one file, do the same in the other: `node tests/content.mjs` fails until both match, and
checks that every protected term in a Filipino entry is in its English twin. An English entry left
out or blank shows the Filipino one. Players pick the language with **Wika** (title screen and the
in-game menu); `?lang=en` opens English for testers without saving it.

## Examples

| Now | Simpler Filipino | English |
| --- | --- | --- |
| Kapag tumumba ito, kukunin nila ang tsinelas habang itinatayo ng taya ang lata, at ang mataya habang kumukuha ang bagong taya. | Pag natumba ang lata, kunin agad ang tsinelas mo habang itinatayo ng taya ang lata. Pag nataya ka, ikaw na ang taya! | When the can falls, grab your tsinelas (slippers) while the taya stands the can up again. If you get tagged, you're the new taya! |
| …nang ideklara ang arnis bilang pambansang sining ng pakikipaglaban at isport. | Ngayon, arnis na ang pambansang sport natin. | Today, arnis is our national sport. |
| Tataas at bibilis ang tinik bawat antas. Pinakamataas na antas ang panalo. | Bawat level, tataas at bibilis ang tinik. Pinakamataas na level, panalo! | Every level, the tinik gets higher and faster. Highest level wins! |

## The check

Read the card out loud to a 7-year-old. If they can't say it back in their own words, rewrite it.

The full list of text to rewrite is in [`TEXT_INVENTORY.md`](TEXT_INVENTORY.md)
(`node tools/text-scan.mjs` makes it again after a change).

After a rewrite, `node tools/text-check.mjs` compares the text with `lang/testing`: every id
and key is still there, each minigame still has 3 rule lines, every protected term in an old
entry is still in the new one (spelled the same), and no word from the swap list is left.
Built-in copies in `index.html` (the `TANONG`, `SOON` and `MG` text used when the content file
doesn't load) must stay word for word the same as `content/fil.json`.
