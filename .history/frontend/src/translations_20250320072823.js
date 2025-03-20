// Définition des traductions pour l'application
const translations = {
  fr: {
    // Navigation
    dashboard: 'Tableau de Bord',
    plants: 'Installations',
    stats: 'Statistiques',
    reports: 'Rapports',
    settings: 'Paramètres',
    login: 'Connexion',
    logout: 'Déconnexion',
    
    // Menu Items
    home: 'Accueil',
    map: 'Carte',
    statistics: 'Statistiques',
    
    // Dashboard
    dashboard_title: 'Tableau de Bord de Recyclage de Lithium',
    subtitle: 'Plateforme de Collaboration Interuniversitaire',
    map_title: 'Carte des Installations',
    plants_list: 'Installations de Recyclage',
    recycling_rate: 'Taux de Recyclage par Installation',
    production_trends: 'Tendances de Production',
    height_label: 'Hauteur de la carte',
    
    // Map
    fullscreen: 'Plein écran',
    exit_fullscreen: 'Quitter le plein écran',
    legend: 'Légende',
    
    // Installation status
    status: 'Statut',
    operational: 'Opérationnel',
    maintenance: 'En maintenance',
    offline: 'Hors ligne',
    planning: 'En planification',
    capacity: 'Capacité',
    not_available: 'Non disponible',
    visit: 'Visiter',
    processing: 'Procédé',
    notes: 'Notes',
    website: 'Site web',
    
    // Tableau des installations
    name: 'Nom',
    location: 'Emplacement',
    country: 'Pays',
    production: 'Production',
    actions: 'Actions',
    more_info: 'Plus d\'informations',
    visit_website: 'Visiter le site web',
    
    // Analysis tabs
    installations_table: 'Tableau des installations',
    status_analysis: 'Analyse par statut',
    country_analysis: 'Analyse par pays',
    
    // Chart titles
    status_distribution: 'Répartition des installations par statut',
    country_distribution: 'Répartition des installations par pays',
    installations_count: 'Nombre d\'installations',
    
    // Settings
    theme: 'Thème',
    theme_light: 'Clair',
    theme_dark: 'Sombre',
    language: 'Langue',
    language_fr: 'Français',
    language_en: 'Anglais',
    animations: 'Animations',
    notifications: 'Notifications',
    high_performance: 'Haute performance',
    map_style: 'Style de carte',
    map_standard: 'Standard',
    map_satellite: 'Satellite',
    map_terrain: 'Terrain',
    default_zoom: 'Zoom par défaut',
    show_legend: 'Afficher la légende',
    marker_clustering: 'Regroupement de marqueurs',
    zoom_controls: 'Contrôles de zoom',
    save_settings: 'Enregistrer les paramètres',
    reset_settings: 'Réinitialiser',
    
    // Footer
    data_compiled: 'Données compilées par',
    last_update: 'Dernière mise à jour',
    version: 'Version',
    
    // Paramètres
    settings_title: 'Paramètres de la Plateforme',
    settings_subtitle: 'Personnalisez l\'affichage et les fonctionnalités de votre tableau de bord',
    display_settings: 'Paramètres d\'affichage',
    map_settings: 'Paramètres de la carte',
    system: 'Système',
    continent: 'Continent',
    region: 'Région',
    city: 'Ville',
    marker_clustering: 'Clustering des marqueurs',
    reset: 'Réinitialiser',
    save_changes: 'Enregistrer les modifications',
    settings_saved: 'Les paramètres ont été sauvegardés avec succès!',
    
    // Installations
    facility: 'Installation',
    location_unknown: 'Emplacement inconnu',
    no_plants_found: 'Aucune installation trouvée',
    
    // Carte
    website: 'Site web',
    
    // Chargement
    loading: 'Chargement...',
    
    // Login/Logout
    login_subtitle: 'Connectez-vous pour accéder au backend',
    username: 'Nom d\'utilisateur',
    password: 'Mot de passe',
    remember_me: 'Se souvenir de moi',
    login_failed: 'Identifiants incorrects. Veuillez réessayer.',
    login_error: 'Une erreur est survenue lors de la connexion.',
    login_help_text: 'Pour accéder au backend, utilisez les identifiants fournis par votre administrateur.',
    demo_credentials: 'Identifiants de démo',
    any_credentials: 'Utilisez n\'importe quels identifiants',
    login_error_fields: 'Veuillez remplir tous les champs',
    login_error_invalid: 'Email ou mot de passe invalide',
    signup_error_fields: 'Veuillez remplir tous les champs',
    signup_error_email_format: 'Format d\'email invalide',
    signup_error_password_length: 'Le mot de passe doit contenir au moins 6 caractères',
    signup_error_email_exists: 'Cet email est déjà utilisé',
    signup_error_general: 'Erreur lors de l\'inscription',
    signup_success_confirm_email: 'Inscription réussie! Vérifiez votre email pour confirmer votre compte.',
    create_account: 'Créer un compte',
    signup: 'S\'inscrire',
    logging_in: 'Connexion en cours...',
    creating_account: 'Création du compte...',
    no_account: 'Vous n\'avez pas de compte?',
    already_have_account: 'Vous avez déjà un compte?',
    password_requirements: 'Minimum 6 caractères',
    
    // Documents et rapports
    'add_document': 'Ajouter un document',
    'login_to_add_document': 'Se connecter pour ajouter un document',
    'documents_library': 'Consultez notre bibliothèque de {count} documents, rapports et études concernant l\'industrie du recyclage de lithium.',
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    plants: 'Recycling Facilities',
    reports: 'Reports',
    stats: 'Statistics',
    settings: 'Settings',
    subtitle: 'Lithium Battery Recycling Dashboard',

    // Authentication
    login: 'Log in',
    username: 'Username',
    password: 'Password',
    remember_me: 'Remember me',
    login_subtitle: 'Enter your credentials to access the dashboard',
    login_error: 'Invalid username or password',
    login_help_text: 'For demonstration purposes, the authentication is simulated.',
    demo_credentials: 'Demo credentials',
    any_credentials: 'Use any credentials',
    login_error_fields: 'Please fill in all fields',
    login_error_invalid: 'Invalid email or password',
    signup_error_fields: 'Please fill in all fields',
    signup_error_email_format: 'Invalid email format',
    signup_error_password_length: 'Password must be at least 6 characters long',
    signup_error_email_exists: 'This email is already in use',
    signup_error_general: 'Error during registration',
    signup_success_confirm_email: 'Registration successful! Check your email to confirm your account.',
    create_account: 'Create an account',
    signup: 'Sign up',
    logging_in: 'Logging in...',
    creating_account: 'Creating account...',
    no_account: 'Don\'t have an account?',
    already_have_account: 'Already have an account?',
    password_requirements: 'Minimum 6 characters',

    // Menu Items
    home: 'Home',
    map: 'Map',
    statistics: 'Statistics',
    
    // Dashboard
    dashboard_title: 'Lithium Recycling Dashboard',
    map_title: 'Facilities Map',
    plants_list: 'Recycling Facilities',
    recycling_rate: 'Recycling Rate by Facility',
    production_trends: 'Production Trends',
    
    // Map
    fullscreen: 'Fullscreen',
    exit_fullscreen: 'Exit fullscreen',
    
    // Installation status
    status: 'Status',
    operational: 'Operational',
    maintenance: 'In maintenance',
    offline: 'Offline',
    planning: 'Planned',
    capacity: 'Capacity',
    not_available: 'Not available',
    visit: 'Visit',
    processing: 'Processing',
    notes: 'Notes',
    website: 'Website',
    
    // Tableau des installations
    name: 'Name',
    location: 'Location',
    country: 'Country',
    production: 'Production',
    actions: 'Actions',
    more_info: 'More information',
    visit_website: 'Visit website',
    
    // Analysis tabs
    installations_table: 'Facilities table',
    status_analysis: 'Status analysis',
    country_analysis: 'Country analysis',
    
    // Chart titles
    status_distribution: 'Facilities distribution by status',
    country_distribution: 'Facilities distribution by country',
    installations_count: 'Number of facilities',
    
    // Settings
    theme: 'Theme',
    theme_light: 'Light',
    theme_dark: 'Dark',
    language: 'Language',
    language_fr: 'French',
    language_en: 'English',
    animations: 'Animations',
    notifications: 'Notifications',
    high_performance: 'High performance',
    map_style: 'Map style',
    map_standard: 'Standard',
    map_satellite: 'Satellite',
    map_terrain: 'Terrain',
    default_zoom: 'Default zoom',
    show_legend: 'Show legend',
    marker_clustering: 'Marker clustering',
    zoom_controls: 'Zoom controls',
    save_settings: 'Save settings',
    reset_settings: 'Reset',
    
    // Footer
    data_compiled: 'Data compiled by',
    last_update: 'Last update',
    version: 'Version',
    
    // Paramètres
    settings_title: 'Platform Settings',
    settings_subtitle: 'Customize the display and features of your dashboard',
    display_settings: 'Display Settings',
    map_settings: 'Map Settings',
    system: 'System',
    continent: 'Continent',
    region: 'Region',
    city: 'City',
    marker_clustering: 'Marker Clustering',
    reset: 'Reset',
    save_changes: 'Save Changes',
    settings_saved: 'Settings have been saved successfully!',
    
    // Installations
    facility: 'Facility',
    location_unknown: 'Unknown location',
    no_plants_found: 'No facilities found',
    
    // Carte
    website: 'Website',
    
    // Chargement
    loading: 'Loading...',
    
    // Documents et rapports
    'add_document': 'Add a document',
    'login_to_add_document': 'Log in to add a document',
    'documents_library': 'Check out our library of {count} documents, reports, and studies related to the lithium recycling industry.',
  }
};

export default translations; 