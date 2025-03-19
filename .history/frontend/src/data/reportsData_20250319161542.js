// Données des rapports, articles et documents relatifs aux fonderies
export const reportsData = {
  // Rapports généraux (non liés à une fonderie spécifique)
  general: [
    {
      id: "gen1",
      title: "État du marché du recyclage de batteries lithium-ion en Amérique du Nord",
      type: "rapport",
      format: "pdf",
      date: "2024-02-15",
      author: "Centre d'Innovation en Recyclage de Batteries",
      description: "Rapport annuel sur l'état du marché, les tendances et les projections pour le recyclage des batteries lithium-ion.",
      url: "#",
      thumbnail: "https://via.placeholder.com/100x140"
    },
    {
      id: "gen2",
      title: "Comparaison des technologies de recyclage de batteries",
      type: "article",
      format: "pdf",
      date: "2023-11-10",
      author: "Journal of Battery Recycling",
      description: "Analyse comparative des différentes technologies de recyclage des batteries lithium-ion.",
      url: "#",
      thumbnail: "https://via.placeholder.com/100x140"
    }
  ],
  
  // Rapports par fonderie (identificateur = ID de la fonderie)
  "1": [ // Li-Cycle (Kingston)
    {
      id: "lc1",
      title: "Rapport d'impact environnemental - Li-Cycle Kingston",
      type: "rapport",
      format: "pdf",
      date: "2023-09-22",
      author: "Ministère de l'Environnement du Canada",
      description: "Évaluation des impacts environnementaux des opérations de l'usine Li-Cycle à Kingston.",
      url: "#",
      thumbnail: "https://via.placeholder.com/100x140"
    },
    {
      id: "lc2",
      title: "Entrevue avec le directeur technique de Li-Cycle",
      type: "entrevue",
      format: "video",
      date: "2023-07-15",
      author: "TechBattery Magazine",
      description: "Discussion sur les innovations techniques et les défis du recyclage à grande échelle.",
      url: "#",
      thumbnail: "https://via.placeholder.com/160x90"
    }
  ],
  
  "2": [ // Lithion Technologies
    {
      id: "lt1",
      title: "Étude de cas - Procédé hydrométallurgique de Lithion",
      type: "étude",
      format: "pdf",
      date: "2023-05-18",
      author: "Université de Montréal",
      description: "Analyse détaillée du procédé hydrométallurgique en deux étapes développé par Lithion Technologies.",
      url: "#",
      thumbnail: "https://via.placeholder.com/100x140"
    }
  ],
  
  "15": [ // Redwood Materials
    {
      id: "rm1",
      title: "Redwood Materials - De la récupération à la production",
      type: "article",
      format: "pdf",
      date: "2023-12-05",
      author: "Green Tech Journal",
      description: "Comment Redwood Materials ferme la boucle entre recyclage et production de matériaux pour batteries.",
      url: "#",
      thumbnail: "https://via.placeholder.com/100x140"
    },
    {
      id: "rm2",
      title: "Entrevue avec le fondateur de Redwood Materials",
      type: "entrevue",
      format: "audio",
      date: "2023-10-30",
      author: "Tech & Green Podcast",
      description: "Discussion sur la vision et la stratégie à long terme de l'entreprise.",
      url: "#",
      thumbnail: "https://via.placeholder.com/100x100"
    },
    {
      id: "rm3",
      title: "Rapport trimestriel - Expansion des capacités",
      type: "rapport",
      format: "pdf",
      date: "2024-01-20",
      author: "Redwood Materials",
      description: "Rapport détaillant l'expansion des capacités de production et de recyclage de l'entreprise.",
      url: "#",
      thumbnail: "https://via.placeholder.com/100x140"
    }
  ],
  
  "17": [ // Tesla Gigafactory
    {
      id: "tg1",
      title: "Analyse du circuit fermé de recyclage de Tesla",
      type: "étude",
      format: "pdf",
      date: "2023-08-12",
      author: "Journal of Sustainable Manufacturing",
      description: "Étude détaillée du système de recyclage interne de Tesla et de son impact sur la chaîne d'approvisionnement.",
      url: "#",
      thumbnail: "https://via.placeholder.com/100x140"
    }
  ]
}; 