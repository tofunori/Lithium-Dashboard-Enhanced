import { useContext } from 'react';
import { SettingsContext } from '../App';
import translations from '../translations';

/**
 * Hook personnalisé pour la traduction
 * @returns {function} - Fonction de traduction qui retourne le texte traduit selon la langue actuelle
 */
const useTranslation = () => {
  const { settings } = useContext(SettingsContext) || { settings: { language: 'fr' } };
  
  // Récupérer la langue actuelle, par défaut français
  const currentLanguage = settings?.language || 'fr';
  
  // Créer la fonction de traduction
  const t = (key) => {
    // Si la clé n'existe pas, retourner la clé elle-même
    if (!translations[currentLanguage] || !translations[currentLanguage][key]) {
      console.warn(`Traduction manquante: ${key} pour la langue ${currentLanguage}`);
      
      // Essayer de trouver la clé dans la langue par défaut (fr)
      if (translations.fr && translations.fr[key]) {
        return translations.fr[key];
      }
      
      return key;
    }
    
    return translations[currentLanguage][key];
  };
  
  return { t, currentLanguage };
};

export default useTranslation; 