# Clara & David — Wedding invitation

Invitation de mariage bilingue français/hébreu construite avec Next.js, TypeScript et Tailwind CSS.

## Développement local

```bash
npm run dev
```

Sans configuration Baserow, `next dev` utilise uniquement les invités de démonstration définis dans `lib/mock-data.ts` :

- `/i/clara-david-demo`
- `/i/hebrew-demo`
- `/i/wedding-only`
- `/i/wedding-henna`
- `/i/rsvp-saved`

Les mocks ne sont jamais utilisés comme fallback silencieux en production.

## Configuration Baserow

Copier `.env.local.example` vers `.env.local`, puis renseigner le vrai token et les quatre identifiants de tables :

```dotenv
BASEROW_API_URL=https://api.baserow.io
BASEROW_API_TOKEN=
BASEROW_GUESTS_TABLE_ID=
BASEROW_EVENTS_TABLE_ID=
BASEROW_GALLERY_TABLE_ID=
BASEROW_SETTINGS_TABLE_ID=
```

Le projet utilise automatiquement Baserow lorsque les cinq valeurs requises sont présentes. Une configuration partielle provoque volontairement un état d’erreur générique au lieu de revenir silencieusement aux mocks.

Le client Baserow est marqué `server-only`. Les données personnelles Guest ne sont pas mises en cache et seules les données nécessaires à l’invité courant sont transmises au rendu. Events, Gallery et Settings utilisent une revalidation de cinq minutes.

## État de l’intégration

- Lecture Guest par token : active
- Lecture Events, Gallery et Settings : active
- Écriture RSVP : active (présences, nombre d’invités, intérêt pour une navette,
  message et date de réponse sont enregistrés dans la ligne Guest associée au
  lien d’invitation)

## Invitations personnalisées

Chaque lien `/i/[token]` correspond directement à une ligne de la table
`Guests`. Les sections Mariage, Henné et Chabbat sont affichées uniquement
quand les champs `Wedding Invited`, `Henna Invited` et `Shabbat Invited`
correspondants sont actifs. Le formulaire RSVP reprend exactement les mêmes
autorisations.

Le jeton Baserow doit disposer des droits `Read` et `Update` sur la table
`Guests`. Les autres tables peuvent rester en lecture seule.

Le choix de navette utilise la colonne `Shuttle Interest` lorsqu’elle existe ;
pour rester compatible avec la base actuelle, il utilise sinon l’ancienne
colonne `Dietary Requirements`.

## Vérifications

```bash
npm run lint
npm run build
```
