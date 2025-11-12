# justright-music
Web Topics Project - Rythme Game


JustRight is een online en offline ritmespel waarin je vallende noten op het juiste moment moet raken.
Door op het juiste ritme te drukken met de toetsen Q, S, D, F verdien je punten.
Hoe beter je timing, hoe hoger je combo en score.
Je kan spelen op drie moeilijkheidsgraden: easy, medium en hard.

p5.js
Wordt gebruikt om het spel te tekenen en te animeren.
De noten, banen en effecten worden met p5.js op het canvas weergegeven.

GSAP
Zorgt voor vloeiende overgangen tussen start-, spel- en eindschermen.
Wordt ook gebruikt voor animaties van de scorebalk, combo en het “GO!” startsignaal.

Web Components
De elementen <score-display> en <combo-display> zijn eigen webcomponenten.
Ze tonen live de score en combo van de speler in een moderne, herbruikbare vorm.

Web Workers
De worker.js voert achtergrondtaken uit.
Zo blijft het spel snel en soepel, zelfs wanneer zware berekeningen gebeuren.
In het geval dat het aan het laden is verschijnt een “Loading...” melding.

PWA
Door het gebruik van een manifest.json en service-worker.js kan het spel offline gespeeld worden.

SEO Optimalisatie
In plaats van Tone.js heb ik gekozen om mijn site SEO-vriendelijk te maken.
De <meta>-tags in de <head> verbeteren vindbaarheid op zoekmachines.
De Engelse zoekwoorden (“rhythm game”, “browser game”) helpen bij online zichtbaarheid.


Waarom geen Tone.js?
Ik wilde eerst Tone.js gebruiken om muziek te synchroniseren met de animaties.
Maar dit veroorzaakte foutmeldingen en conflicten met p5.js en WCAG-animaties.
Daarom koos ik ervoor om in plaats daarvan SEO-optimalisatie te gebruiken.
Ik realiseer ook na het project dat dit een onrealistisch idee was.


Licentie
Dit project is open source en valt onder de MIT License.
Iedereen mag de code bekijken en gebruiken.

<img width="673" height="630" alt="een foto van de game JustRight-Music" src="https://github.com/user-attachments/assets/46330fc8-7072-4802-8ee0-4c7fc81b01c4" />
