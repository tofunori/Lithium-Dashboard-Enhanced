// Structure de données pour les rapports, articles, PDF et entrevues
export const reportsData = {
  // Rapports généraux sur l'industrie
  general_reports: [
    {
      title: "L'état du marché du recyclage des batteries lithium-ion en 2025",
      type: "report",
      format: "pdf",
      date: "2025-01-15",
      author: "Institut d'Énergie Renouvelable",
      description: "Une analyse complète du marché mondial du recyclage des batteries lithium-ion, y compris les tendances, les défis et les opportunités pour les acteurs de l'industrie.",
      url: "https://example.com/market-report-2025",
      thumbnail: "/images/report1.jpg"
    },
    {
      title: "Comparaison des technologies de recyclage de lithium : Hydrometallurgie vs Pyrometallurgie",
      type: "study",
      format: "article",
      date: "2024-11-22",
      author: "Journal des Technologies Durables",
      description: "Cette étude compare l'efficacité, les coûts et l'impact environnemental des deux principales méthodes de recyclage du lithium actuellement utilisées dans l'industrie.",
      url: "https://example.com/recycling-tech-comparison",
      thumbnail: "/images/tech-comparison.jpg"
    }
  ],
  
  // Rapports spécifiques aux fonderies
  foundry_reports: {
    // Li-Cycle
    "1": [
      {
        title: "Rapport d'impact environnemental 2024 de Li-Cycle",
        type: "report",
        format: "pdf",
        date: "2024-09-10",
        author: "Li-Cycle Corp.",
        description: "Rapport détaillant les performances environnementales et la réduction des émissions de carbone de l'installation de Rochester au cours de l'année 2024.",
        url: "https://example.com/li-cycle-environment-2024",
        thumbnail: "/images/li-cycle-report.jpg"
      },
      {
        title: "Entrevue avec le PDG de Li-Cycle sur l'expansion nord-américaine",
        type: "interview",
        format: "video",
        date: "2024-07-15",
        author: "CleanTech Magazine",
        description: "Discussion sur les plans d'expansion de Li-Cycle dans le marché nord-américain et les perspectives de croissance pour les cinq prochaines années.",
        url: "https://example.com/li-cycle-interview",
        thumbnail: "/images/li-cycle-ceo.jpg"
      },
      {
        title: "Innovation du procédé Spoke & Hub : Comment Li-Cycle transforme le recyclage",
        type: "case study",
        format: "pdf",
        date: "2024-05-22",
        author: "Journal of Sustainable Materials",
        description: "Étude de cas détaillant la technologie Spoke & Hub de Li-Cycle et comment elle a révolutionné l'efficacité du recyclage des batteries lithium-ion.",
        url: "https://example.com/li-cycle-innovation",
        thumbnail: "/images/spoke-hub.jpg"
      }
    ],
    
    // Lithion Technologies
    "2": [
      {
        title: "Lithion Recycling annonce un partenariat stratégique avec Tesla",
        type: "press release",
        format: "article",
        date: "2024-10-05",
        author: "Lithion Recycling Inc.",
        description: "Communiqué de presse annonçant un nouveau partenariat entre Lithion Recycling et Tesla pour la fourniture de matériaux recyclés pour la production de batteries.",
        url: "https://example.com/lithion-tesla-partnership",
        thumbnail: "/images/lithion-tesla.jpg"
      },
      {
        title: "Analyse chimique des matériaux récupérés par le processus Lithion",
        type: "research",
        format: "pdf",
        date: "2024-08-18",
        author: "Université de Montréal",
        description: "Recherche scientifique analysant la pureté et les propriétés des matériaux récupérés par le processus de recyclage breveté de Lithion.",
        url: "https://example.com/lithion-materials-analysis",
        thumbnail: "/images/lithion-analysis.jpg"
      }
    ],
    
    // Redwood Materials
    "3": [
      {
        title: "Comment Redwood Materials construit l'économie circulaire des batteries",
        type: "article",
        format: "article",
        date: "2024-11-30",
        author: "GreenTech Insights",
        description: "Article de fond explorant la vision de JB Straubel et la stratégie de Redwood Materials pour créer une véritable économie circulaire pour les batteries lithium-ion.",
        url: "https://example.com/redwood-circular-economy",
        thumbnail: "/images/redwood-circular.jpg"
      },
      {
        title: "Redwood Materials: De la récupération à la production de cathodes",
        type: "report",
        format: "pdf",
        date: "2024-06-15",
        author: "Institut des Matériaux Durables",
        description: "Rapport détaillant la chaîne de valeur complète de Redwood Materials, de la récupération des batteries usagées à la production de matériaux cathodiques pour les nouvelles batteries.",
        url: "https://example.com/redwood-value-chain",
        thumbnail: "/images/redwood-cathodes.jpg"
      },
      {
        title: "L'impact de l'usine de Redwood Materials au Nevada sur l'économie locale",
        type: "analysis",
        format: "pdf",
        date: "2024-04-10",
        author: "Nevada Economic Development Council",
        description: "Analyse des retombées économiques de l'usine de Redwood Materials à Carson City sur l'emploi local, les recettes fiscales et le développement régional.",
        url: "https://example.com/redwood-nevada-impact",
        thumbnail: "/images/redwood-nevada.jpg"
      }
    ],
    
    // Tesla Gigafactory
    "4": [
      {
        title: "Recyclage interne à la Gigafactory: Le modèle d'intégration verticale de Tesla",
        type: "case study",
        format: "pdf",
        date: "2024-10-22",
        author: "Manufacturing Innovation Journal",
        description: "Étude de cas sur l'approche de Tesla pour intégrer le recyclage des batteries directement dans ses opérations de fabrication à la Gigafactory du Nevada.",
        url: "https://example.com/tesla-vertical-integration",
        thumbnail: "/images/tesla-gigafactory.jpg"
      },
      {
        title: "Entrevue avec le directeur des opérations de recyclage de la Gigafactory",
        type: "interview",
        format: "video",
        date: "2024-09-05",
        author: "EV Technology Today",
        description: "Discussion approfondie sur les défis et les solutions pour recycler les batteries à grande échelle dans l'un des plus grands sites de fabrication de batteries au monde.",
        url: "https://example.com/gigafactory-recycling-interview",
        thumbnail: "/images/giga-recycling.jpg"
      }
    ]
  },
  
  // Couleurs de statut pour les installations
  status_colors: {
    "operational": "#4caf50", // Vert
    "construction": "#ff9800", // Orange
    "planned": "#2196f3",     // Bleu
    "pilot": "#9c27b0"        // Violet
  }
};

export default reportsData; 