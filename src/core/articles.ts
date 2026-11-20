// Articles on the thinking behind the training. Every claim points to a numbered source in core/sources.ts.
import type { ModuleId } from './types';

export interface Article {
  id: string;
  title: string;
  kicker: string;
  lead: string;
  minutes: number;
  topic: ModuleId | 'rest' | 'all';
  group: 'Grunden' | 'Pelarna';
  sections: { h?: string; p: string[] }[];
  sources: number[];
}

export const ARTICLES: Article[] = [
  {
    id: 'filosofi', group: 'Grunden', topic: 'all', minutes: 4, kicker: 'Filosofin',
    title: 'Tre pelare för en frisk kropp',
    lead: 'Pelare har ett enda mål: att du ska må bra och hålla hela livet. Inte bli bäst på en sak, utan bra på det som gör störst skillnad för hälsan.',
    sections: [
      { h: 'Varför just tre pelare', p: [
        'Världshälsoorganisationen rekommenderar vuxna 150–300 minuter måttlig eller 75–150 minuter ansträngande konditionsträning i veckan, och muskelstärkande träning minst två dagar i veckan [25]. Det är golvet appen alltid siktar på.',
        'Styrka håller muskler, skelett och leder starka och har i stora befolkningsstudier kopplats till 10–20 % lägre risk för förtida död redan vid 30–60 minuter i veckan [28]. Kondition stärker hjärta och lungor. Rörlighet gör att du kan röra dig fritt, i träningen och i vardagen.',
        'Tillsammans täcker de det mesta av det kroppen behöver. Var och en räcker inte ensam.',
      ] },
      { h: 'Regelbundet slår perfekt', p: [
        'Det viktigaste är inte att varje pass är optimalt, utan att du tränar vecka efter vecka. Därför är passen så korta som de kan vara utan att tappa effekt, och därför finns alltid ett lättare alternativ.',
        'En missad dag tas inte igen. Appen tar bara nästa bästa beslut utifrån där du är nu.',
      ] },
      { h: 'Ärligt underlag', p: [
        'Allt appen föreslår kommer från regler med en källa och en evidensnivå. A betyder sammanställningar av många studier, B enskilda kontrollerade studier, C befolkningsstudier eller expertkonsensus och H beprövad praxis utan direkt forskningsstöd. Tips från coacher och videor (nivå D) får styra övningsval men aldrig ensamma ändra reglerna.',
      ] },
    ],
    sources: [25, 28],
  },
  {
    id: 'dagens-pass', group: 'Grunden', topic: 'all', minutes: 3, kicker: 'Så fungerar appen',
    title: 'Så väljs ditt pass för dagen',
    lead: 'Det finns inget fast schema. Varje dag frågar appen alla tre pelarna vad du borde göra, och väljer det som gör mest nytta just i dag.',
    sections: [
      { h: 'Fyra frågor varje dag', p: [
        'Vad saknas den här veckan? Varje pelare har ett veckomål, till exempel två–fyra styrkepass, två löppass och stretch fem dagar. Den pelare som ligger längst efter får företräde.',
        'Är kroppen redo? En muskel som tränats hårt de senaste två dygnen tränas inte hårt igen. Efter tunga ben läggs inte intervaller dagen efter, eftersom tunga ben och hård löpning bör ligga minst ett dygn isär [16].',
        'Hur mår du? Säger du att du är trött blir förslagen lugna. Har du redan tränat hårt i dag blir resten av dagen lätt.',
        'Hur mycket tid har du? Passet kortas så att det ryms, men aldrig så mycket att det tappar sin poäng.',
      ] },
      { h: 'Du bestämmer alltid', p: [
        'Förslaget är en rekommendation, inte en order. Under ”Eller” finns alltid ett alternativ från varje annan pelare, och vila är alltid ett giltigt val. Under ”Visa hela passet” ser du exakt vad som ingår.',
      ] },
    ],
    sources: [16],
  },
  {
    id: 'trygghet', group: 'Grunden', topic: 'all', minutes: 3, kicker: 'Träna tryggt',
    title: 'Kännbart, men aldrig smärtsamt',
    lead: 'Träning ska vara ansträngande, men den ska inte göra ont. Så här skiljer appen på bra ansträngning och varningssignaler.',
    sections: [
      { h: 'Ansträngning är rätt', p: [
        'I styrketräning ska de sista repetitionerna vara tunga – 1–3 reps kvar i flerledsövningar och 0–2 i isolering ger mest effekt [3]. Träningsvärk dagen efter är normalt, särskilt i början.',
        'I stretch ska det dra, inte göra ont. Andas lugnt och gå aldrig in i smärta.',
      ] },
      { h: 'När du ska backa', p: [
        'Skarp smärta, smärta i en led eller smärta som sitter i mer än ett par veckor är inte träningsvärk. Hoppa över övningar som gör ont och prata med en fysioterapeut eller läkare om det inte går över.',
        'Löpning ökar gradvis. Ett pass som är mer än 10 % längre än ditt längsta pass de senaste 30 dagarna ger högre skaderisk [19], så appen föreslår aldrig det.',
      ] },
      { h: 'Börja lugnt', p: [
        'De första veckorna har du lite mer marginal i varje set, och vikterna hittas genom kalibrering i stället för gissning. Det bygger teknik innan det bygger tyngd.',
      ] },
    ],
    sources: [3, 19],
  },
  {
    id: 'vardagen', group: 'Grunden', topic: 'all', minutes: 4, kicker: 'Hälsa utanför passen',
    title: 'Det mesta händer mellan passen',
    lead: 'Tre pass i veckan är ett par timmar. Resten av veckan – sömn, vardagsrörelse och mat – avgör minst lika mycket hur du mår.',
    sections: [
      { h: 'Rör dig i vardagen', p: [
        'I en sammanställning av 15 studier med över 47 000 vuxna minskade risken för förtida död tydligt med fler steg per dag. Den planade ut vid ungefär 6 000–8 000 steg för den som är över 60 och 8 000–10 000 steg för yngre [27]. Promenader räknas, även om de inte känns som träning.',
      ] },
      { h: 'Sov', p: [
        'Vuxna bör regelbundet sova minst sju timmar per natt [29]. Det är under sömnen kroppen återhämtar sig och bygger upp det träningen bröt ner. Sover du dåligt en natt, välj ett lugnare pass.',
      ] },
      { h: 'Ät så att du orkar och bygger', p: [
        'För den som styrketränar förstärker protein muskeltillväxten upp till ungefär 1,6 gram per kilo kroppsvikt och dag. Mer än så gav ingen ytterligare effekt [30]. Det behöver inte vara pulver – vanlig mat räcker för de flesta.',
      ] },
      { p: ['Appen loggar inte sömn eller mat i dag. Men dagsformen du anger varje morgon påverkar förslagen.'] },
    ],
    sources: [27, 29, 30],
  },
  {
    id: 'styrka', group: 'Pelarna', topic: 'gym', minutes: 4, kicker: 'Gym',
    title: 'Styrka: hårda set, varje vecka',
    lead: 'Muskler växer av signalen från hårda set som upprepas vecka efter vecka. Fler set ger mer – upp till en gräns.',
    sections: [
      { h: 'Hur mycket', p: [
        'Omkring 10–20 hårda set per muskelgrupp och vecka ger bra tillväxt, med avtagande effekt ju högre du går [1][2]. Nybörjare börjar i den lägre delen. Appen räknar set där muskeln bara hjälper till som ett halvt set och visar varje vecka hur nära målet du är.',
      ] },
      { h: 'Hur ofta', p: [
        'Varje muskel tränas minst två gånger i veckan. Det ger mer styrka än en gång, även om tillväxten vid samma volym är ungefär lika [1]. Därför finns inga program där en muskel bara tränas en dag.',
      ] },
      { h: 'Hur tungt', p: [
        'Sätt vikten så att du har 1–3 reps kvar i flerledsövningar och 0–2 i isolering [3]. Tillväxt sker över ett brett repintervall så länge seten går nära gränsen [4]. Vila minst en minut, gärna två–tre i tunga övningar [5].',
      ] },
      { h: 'Så går du framåt', p: [
        'Klarar du toppen av repintervallet i alla set höjs vikten med minsta steget. I kroppsvikt går du i stället till en svårare variant. Huvudövningarna ligger fast i block om sex veckor så att framstegen går att mäta [10].',
        'När prestationen sjunker två pass i rad och du är trött blir det en lätt vecka med halva volymen – inte ett helt uppehåll, som gav sämre styrka i en studie [12][13].',
      ] },
      { h: 'Mer än muskler', p: ['Styrketräning är också den träning som bäst förebygger skador [21] och den som tydligast kopplats till längre liv [28].'] },
    ],
    sources: [1, 2, 3, 4, 5, 10, 12, 13, 21, 28],
  },
  {
    id: 'lopning', group: 'Pelarna', topic: 'run', minutes: 3, kicker: 'Löpning',
    title: 'Löpning: mest lugnt, lite hårt',
    lead: 'De flesta springer för fort på de lugna passen och för lugnt på de hårda. Pelare gör tvärtom.',
    sections: [
      { h: '80/20', p: [
        'Ungefär 80 % av löptiden i pratbart tempo och 20 % hårdare ger lite bättre kondition än andra fördelningar [17]. Lugna pass bygger uthålligheten utan att slita.',
      ] },
      { h: 'Ett hårt pass räcker', p: [
        'Ett intervallpass i veckan, till exempel 4 × 4 minuter nära maxpuls, höjer syreupptagningen mer än lika mycket måttlig löpning [18]. Nybörjare börjar med kortare intervaller.',
      ] },
      { h: 'Öka försiktigt', p: [
        'Det enskilda pass som sticker ut är farligast. Mer än 10 % längre än ditt längsta pass senaste månaden ökar skaderisken [19], så långpasset växer i små steg.',
      ] },
      { h: 'Styrka gör dig till en bättre löpare', p: [
        'Styrketräning förbättrar löpekonomin [20], och löpning hindrar inte muskeltillväxt eller styrka nämnvärt [15]. Därför finns minst två styrkepass i veckan även när löpning är målet.',
      ] },
    ],
    sources: [15, 17, 18, 19, 20],
  },
  {
    id: 'rorlighet', group: 'Pelarna', topic: 'mobility', minutes: 3, kicker: 'Rörlighet',
    title: 'Rörlighet: lite, nästan varje dag',
    lead: 'Rörlighet kommer av regelbundenhet, inte av långa pass. Fem minuter om dagen tar dig längre än en timme i veckan.',
    sections: [
      { h: 'Dosen', p: [
        'Statisk stretch minst fem minuter i veckan per område, fördelat på minst fem dagar, ger tydligt ökad rörlighet [22]. Därför räknas rörlighet i dagar, inte i pass. Håll varje stretch 30–45 sekunder och kör två–tre varv.',
      ] },
      { h: 'Styrka räknas också', p: [
        'Styrketräning med fullt rörelseomfång ökar rörligheten ungefär lika mycket som stretching [23]. Djupa knäböj, rumänska marklyft och dips är också rörlighetsträning.',
      ] },
      { h: 'Före och efter passet', p: [
        'Före träning är dynamisk rörlighet – som djurrörelser eller världens bästa stretch – ett bra sätt att värma upp. Kort statisk stretch (under en minut per muskel) går också bra [24].',
      ] },
      { h: 'Vad stretch inte gör', p: [
        'Stretching förebygger inte skador – det gör styrketräning [21]. Vi stretchar för att bli rörligare och för att det känns bra, inte för att skydda oss.',
      ] },
    ],
    sources: [21, 22, 23, 24],
  },
  {
    id: 'vila', group: 'Pelarna', topic: 'rest', minutes: 3, kicker: 'Återhämtning',
    title: 'Vila är en del av planen',
    lead: 'Kroppen blir inte starkare under passet, utan efteråt. Vilodagar är inte brutna kedjor – de är planerade.',
    sections: [
      { h: 'Varför vila', p: [
        'Träning bryter ner, återhämtning bygger upp. En muskel som fortfarande är öm eller svag växer sämre och skadas lättare om den tränas hårt igen. Därför väntar appen tills musklerna har återhämtat sig.',
        'Efter två hårda dagar i rad blir det en lätt dag eller vila, och minst en dag i veckan är lätt.',
      ] },
      { h: 'Sömn och dagsform', p: [
        'Minst sju timmars sömn per natt är grunden för återhämtning [29]. Har du sovit dåligt eller känner dig trött, säg det i dagsformen – då blir förslagen lugna. Mätare som pulsvariabilitet ger bara en liten och osäker fördel [26], så appen litar i första hand på hur du själv känner dig.',
      ] },
      { h: 'Lätta veckor', p: [
        'Var sjätte till åttonde vecka, eller när prestationen dalar, blir det en lätt vecka med halva volymen och samma vikter. Det är bättre än att stå helt still [12][13].',
      ] },
    ],
    sources: [12, 13, 26, 29],
  },
];

export const ARTICLE: Record<string, Article> = Object.fromEntries(ARTICLES.map((a) => [a.id, a]));

/** The article that explains a given kind of session. */
export const articleFor = (topic: ModuleId | 'rest' | 'all') => ARTICLES.find((a) => a.topic === topic) ?? ARTICLE.filosofi;

/** One principle sentence per kind of session, shown on Idag as "Därför i dag". */
export const PRINCIPLE: Record<ModuleId | 'rest', { title: string; text: string }> = {
  gym: { title: 'Varför styrka i dag?', text: 'Muskler växer av hårda set som upprepas varje vecka, minst två gånger per muskel. Styrka är också det som bäst skyddar mot skador.' },
  run: { title: 'Varför löpning i dag?', text: 'Konditionen byggs mest av lugna pass i pratbart tempo, med ett hårdare pass i veckan. Längden ökar i små steg för att undvika skador.' },
  mobility: { title: 'Varför stretch i dag?', text: 'Rörlighet kommer av regelbundenhet. Några minuter de flesta dagar ger mer än ett långt pass i veckan.' },
  rest: { title: 'Varför vila i dag?', text: 'Kroppen blir starkare mellan passen, inte under dem. En lugn dag nu gör nästa pass bättre.' },
};
