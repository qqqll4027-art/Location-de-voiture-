# CHAKROUN BENZCAR

Site de location de voitures responsive, en français, avec demandes de réservation enregistrées dans SQLite, envoi WhatsApp et espace d'administration.

## Prérequis
- Node.js 18 ou plus récent
- npm

## Installation
1. Décompresser le projet.
2. Ouvrir un terminal dans le dossier du projet.
3. Installer les dépendances :
   ```bash
   npm install
   ```
4. Copier `.env.example` vers `.env`.
5. Modifier `ADMIN_PASSWORD` et `SESSION_SECRET` dans `.env`.
6. Vérifier `WHATSAPP_NUMBER=212661630867` (format international, chiffres uniquement).
7. Démarrer :
   ```bash
   npm start
   ```
8. Ouvrir http://localhost:3000

## Coordonnées configurées
- WhatsApp : +212 661 630 867
- Adresse : 48 AVENUE FAL OULED OUMEIR, APPT 01, AGDAL, RABAT, MAROC

## Administration
- Adresse : http://localhost:3000/admin.html
- Identifiant par défaut : `admin`
- Mot de passe : celui défini dans `.env`

## Personnalisation / mise en ligne
- Modifiez les véhicules, descriptions, photos et tarifs depuis l'administration ou directement dans la base SQLite.
- Le numéro WhatsApp peut être modifié dans `.env`.
- Pour une mise en production : utilisez HTTPS, un hébergement Node.js, un mot de passe fort, un `SESSION_SECRET` aléatoire, et un stockage persistant pour `data.sqlite`.
- Les tarifs affichés sont des exemples à remplacer par vos vrais tarifs.
- Le site enregistre une demande mais ne confirme pas automatiquement la disponibilité. La confirmation reste manuelle.
- Les photos actuelles sont des images d'illustration distantes ; remplacez-les par vos photos autorisées.
