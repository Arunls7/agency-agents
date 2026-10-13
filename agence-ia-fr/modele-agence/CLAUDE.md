# Contexte de l'agence

> Claude lit ce fichier à chaque session ouverte dans ce dossier. Les agents `-fr` s'en servent pour
> rédiger les devis, les messages et les contenus à votre image. Remplissez-le avec `/configurer-agence`
> ou à la main, et mettez-le à jour quand vos offres ou vos prix changent.

## L'agence

- Nom commercial : {{NOM}}
- Forme juridique et statut du dirigeant : {{STATUT}}
- Ville et zone d'intervention : {{ZONE}}
- Site web : {{SITE}}
- Signature des e-mails :

```
{{SIGNATURE}}
```

## Offres et tarifs (en euros HT, TVA à 20 % sauf franchise en base)

| Offre | Pour qui | Contenu | Délai | Prix HT |
|---|---|---|---|---|
| {{OFFRE_1}} | | | | |
| {{OFFRE_2}} | | | | |
| Abonnement de maintenance | | | | /mois |

Conditions de paiement habituelles : {{CONDITIONS}} (par exemple acompte de 30 % à la commande, solde à la recette, paiement à 30 jours).

## Clients cibles

- Métiers prioritaires : {{METIERS}} (cabinets d'expertise comptable, agences immobilières, artisans du bâtiment, e-commerçants…)
- Taille : {{TAILLE}}
- Problèmes que vous résolvez le mieux : {{PROBLEMES}}
- Ce que vous refusez : {{REFUS}}

## Ton et style

- Vouvoiement avec les clients et prospects ; tutoiement seulement si le client le propose.
- Avec le fondateur : tutoiement (remplacez par « vouvoiement » si vous préférez que les agents vous vouvoient).
- Ton : {{TON}} (par exemple direct, concret, sans jargon).
- Mots à éviter : {{MOTS_A_EVITER}}

## Outils utilisés par l'agence

- Automatisation : {{AUTOMATISATION}} (n8n auto-hébergé, Make…)
- Modèles d'IA et hébergement : {{IA}} (préciser la région d'hébergement des données)
- CRM et facturation : {{CRM}}

## Règles de l'agence

- Jamais de données réelles de clients dans une démo : données fictives ou anonymisées.
- Toute automatisation livrée prévoit une validation humaine pour les envois, paiements et suppressions, et une procédure de reprise manuelle.
- Contrat de sous-traitance RGPD (art. 28) signé avant tout traitement de données d'un client.
- Les contenus générés par IA réalistes sont signalés ; pas de faux avis ni de faux témoignages.
- Les règles datées (droit, fiscalité, aides) viennent du registre `~/.claude/agence-ia-fr/faits-dates.md` ; en cas de doute, vérifier la source officielle.

## Quel agent pour quoi

Tapez `/agence` suivi de votre demande si vous ne savez pas quel agent choisir. Commandes les plus utiles :
`/decouverte`, `/proposition`, `/tarif`, `/offre`, `/prospection`, `/post-linkedin`, `/contenu-semaine`, `/video`,
`/pub`, `/avis`, `/automatisation`, `/recette`, `/rgpd`, `/contrat`, `/tresorerie`, `/relance`, `/aides`,
`/partenaires`, `/veille`, `/bilan-client`.
