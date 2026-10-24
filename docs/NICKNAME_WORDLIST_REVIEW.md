# F8.1 nickname word-list review

For: 2 team members screening the Filipino adjective + noun word lists that will
replace the free-text name field, per the PRD's F8 acceptance ("the word lists are
reviewed by 2 team members for words that could offend").

**Source file:** `content/fil.json`, the `nicknames` block — this packet is a
reviewer-friendly copy of exactly what's there. Nothing is marked reviewed yet
(`nicknames.reviewed_by` is `[]`).

## What you're checking

The picker combines one adjective + one noun, e.g. "Masipag na Kalabaw" ("Hardworking
Carabao"). For each word below, check it doesn't:

- carry a slang or double meaning that could read as an insult, a slur, or sexual in
  Filipino (including Bisaya/other major regional readings if you know them)
- sound babyish/condescending in a way a 7–12 year old would find annoying
- clash badly with every noun it could be paired with (adjectives and nouns mix freely,
  so check a word on its own, not just in the one example pairing)

Mark each: **✅ Fine** / **✏️ Suggest a different word** (say which) / **⚠️ Flag for
discussion**.

## Adjectives (16)

| Word | Meaning | ✅ / ✏️ / ⚠️ |
|---|---|---|
| Masipag | hardworking | ⬜ |
| Matapang | brave | ⬜ |
| Mabait | kind | ⬜ |
| Masaya | happy | ⬜ |
| Matalino | smart | ⬜ |
| Matatag | steadfast/strong-willed | ⬜ |
| Mabilis | fast | ⬜ |
| Matiyaga | patient/persevering | ⬜ |
| Masigla | lively/energetic | ⬜ |
| Magiliw | friendly/warm | ⬜ |
| Mausisa | curious | ⬜ |
| Matulungin | helpful | ⬜ |
| Maalalahanin | thoughtful/considerate | ⬜ |
| Mapagmahal | loving/affectionate | ⬜ |
| Matapat | honest/loyal | ⬜ |
| Malakas | strong | ⬜ |

## Nouns (16) — all native Philippine animals

| Word | Meaning | ✅ / ✏️ / ⚠️ |
|---|---|---|
| Kalabaw | carabao | ⬜ |
| Tamaraw | tamaraw (native wild buffalo, Mindoro) | ⬜ |
| Agila | eagle (Philippine eagle) | ⬜ |
| Maya | Philippine maya (sparrow), the old national bird | ⬜ |
| Pawikan | sea turtle | ⬜ |
| Tarsier | tarsier | ⬜ |
| Tutubi | dragonfly | ⬜ |
| Alitaptap | firefly | ⬜ |
| Paruparo | butterfly | ⬜ |
| Palaka | frog | ⬜ |
| Alimango | crab | ⬜ |
| Pusa | cat | ⬜ |
| Aso | dog | ⬜ |
| Kuting | kitten | ⬜ |
| Ibon | bird (generic) | ⬜ |
| Bubuyog | bee | ⬜ |

## Words already screened out and left off this list

So reviewers aren't re-litigating the same calls, these animal nouns were considered
and deliberately **not** included, because Filipino slang gives them a negative or
loaded second meaning:

- **Buwaya** (crocodile) — common slang for a corrupt/greedy person
- **Unggoy** (monkey) — can be used as a mild insult
- **Baboy** (pig) — common insult for being messy/greedy
- **Daga** (rat/mouse) — slang for an informant/snitch
- **Ahas** (snake) — slang for a traitor/backstabber

If a reviewer disagrees with any of these exclusions, or wants to flag a word that
*is* in the list above for a similar reason we missed, use the ⚠️ column.

## Sign-off

Once 2 team members have gone through both tables with no unresolved ⚠️ flags, copy
both names and the date into `content/fil.json`'s `nicknames.reviewed_by` (array of
both names) and `nicknames.reviewed_at`.

Reviewer 1 name: ________________________________ Date: ______________
Reviewer 2 name: ________________________________ Date: ______________
Notes / words changed: _________________________________________________
_________________________________________________________________________
