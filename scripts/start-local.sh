#!/bin/bash

echo "🚀 Démarrage des serveurs locaux ATTRIB..."

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}✅ Build de production créé${NC}"
echo -e "${BLUE}📱 Serveur de développement : http://localhost:8081${NC}"
echo -e "${BLUE}🌐 Serveur de prévisualisation : http://localhost:4173${NC}"
echo -e "${YELLOW}💡 Utilisez Ctrl+C pour arrêter les serveurs${NC}"

# Démarrer le serveur de développement en arrière-plan
echo -e "${GREEN}🔄 Démarrage du serveur de développement...${NC}"
npm run dev &

# Attendre un peu puis démarrer le serveur de prévisualisation
sleep 5
echo -e "${GREEN}🔄 Démarrage du serveur de prévisualisation...${NC}"
npm run preview &

# Attendre que les serveurs démarrent
sleep 3

echo -e "${GREEN}🎉 Serveurs démarrés avec succès !${NC}"
echo ""
echo -e "${BLUE}📱 Développement : http://localhost:8081${NC}"
echo -e "${BLUE}🌐 Prévisualisation : http://localhost:4173${NC}"
echo -e "${BLUE}🚀 Production Vercel : https://uclouvain-course-assign-g3n2ccxwz-rdgdegs-projects.vercel.app${NC}"
echo ""

# Garder le script en vie
wait 