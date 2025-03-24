# Système de Gestion des Opérations Immobilières

## Description

Ce projet implémente un système de gestion des opérations immobilières. Le système permet de créer et visualiser des opérations, avec des informations telles que le nom commercial, l'association avec une entreprise, les dates de livraison, l'adresse et la disponibilité des lots.

Le système adopte une architecture propre avec une séparation claire entre la logique métier, les services applicatifs et l'infrastructure. Il est conçu avec des technologies modernes, en mettant l'accent sur la bonne fonctionnement avec un design réactif.

## Technologies Utilisées

### Backend
- Node.js (v20)
- Express.js
- TypeScript
- Prisma ORM (pour la gestion de la base de données)
- Jest
- Swagger (pour la documentation de l'API)

### Frontend
- React (v19)
- TypeScript
- CSS3
- Vite (bundler)

### Architecture
- Architecture propre
- Design Centré Domaine (DDD)
- Repository Pattern
- Use Case Pattern
- Factory Pattern

## Installation

### Prérequis

- Node.js (version 14 ou supérieure)
- npm 

### Execution manuelle de client et serveur : 

1. Clonez le repository sur votre machine locale :

```bash
   git clone https://github.com/khaled-henchir/operation-register
```

#### Au niveau de répertoire 'server'  : 

1. Ajoutez l'url de base do donnée à votre environnement de variabel ( vous devez créer .env file ) :
   
   Ici vous devez utiliser un base de bonnée compatible avec Prisma ORM ( PostgreSQL, MySQL, MongoDB, Sqlite... ) 
   J'ai utilisé Mysql alors l'url et sous cette forme : 

```bash .env 
   DATABASE_URL = mysql://username:password@host:port/database
 ```

2. Installez les dépendances :

```bash
   npm install
```   

3. Appliquer les migrations et créer le schéma avec :
Cette commande va à la fois créer la base de données (si elle n'existe pas déjà) et appliquer les migrations pour créer les tables nécessaires.
Une fois la migration réussie, votre base de données sera configurée avec les tables définies dans votre schéma Prisma (server/prisma/schema.prisma).

```bash
   npx prisma migrate dev --name init
```   

4. Générer le client Prisma :

```npx prisma generate```   

5. Remplissez votre base de données avec des exemples d'entreprises et d'opérations ( Optionnelle ) :

```bash
   npm run seed
```
   Les exemples sont créé avec le fichier server/prisma/seed.ts   

6. Construire et éxecuter le serveur avec :

```bash
   npm run build
```

```bash
   npm run start	
```   

#### Au niveau de répertoire 'client' : 


1. Installez les dépendances :

```bash
   npm install
```

6. Construire et éxecuter le client avec :

```bash
   npm run build
```

```bash
   npm run start	
```   

#### Avec Docker : 

1. Executez ce command ( vous devez avoir docker installé ) :
Vous devez uninstaller le fichier .env (s'il existe) pour que le conteneur docker de backend
pointe vers la bonner URL de base donnée.

```bash
   docker-compose up --build
```


## Documentation de l'API

Une fois le serveur lancé, la documentation de l'API est disponible via Swagger à l'adresse suivante (adaptée selon votre configuration) :

```
http://localhost:<port>/api-docs
```

## Tests

Les tests unitaires et d'intégration sont réalisés avec Jest. Pour exécuter les tests dans le répertoire du serveur, utilisez la commande suivante :

```
npm run test
```


