import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import random
from datetime import datetime, timedelta

# Configuration de la page
st.set_page_config(
    page_title="Tableau de Bord Recyclage de Lithium",
    page_icon="♻️",
    layout="wide"
)

# Titre principal
st.title("♻️ Tableau de Bord - Recyclage de Lithium")

# Fonction pour générer des données aléatoires
def generate_random_data(num_plants=10):
    plants = [f"Usine {i+1}" for i in range(num_plants)]
    
    # Coordonnées aléatoires en France
    latitudes = [random.uniform(42.0, 51.0) for _ in range(num_plants)]
    longitudes = [random.uniform(-4.0, 8.0) for _ in range(num_plants)]
    
    # Production par mois (derniers 12 mois)
    dates = [(datetime.now() - timedelta(days=30*i)).strftime('%Y-%m') for i in range(12)]
    dates.reverse()
    
    data = []
    for i, plant in enumerate(plants):
        base_capacity = random.randint(500, 2000)
        efficiency = random.uniform(0.7, 0.95)
        
        for month in dates:
            monthly_variation = random.uniform(0.85, 1.15)
            production = base_capacity * efficiency * monthly_variation
            recycling_rate = random.uniform(0.65, 0.90)
            waste = production * (1 - recycling_rate)
            
            data.append({
                'plant': plant,
                'latitude': latitudes[i],
                'longitude': longitudes[i],
                'month': month,
                'production': round(production, 2),
                'recycling_rate': round(recycling_rate * 100, 2),
                'waste': round(waste, 2),
                'capacity': base_capacity
            })
    
    return pd.DataFrame(data)

# Générer les données
df = generate_random_data()

# Panneau latéral pour les filtres
st.sidebar.header("Filtres")

# Filtre pour sélectionner les usines
all_plants = df['plant'].unique()
selected_plants = st.sidebar.multiselect(
    "Sélectionner les usines",
    options=all_plants,
    default=all_plants[:5]
)

# Filtre pour la période
months = df['month'].unique()
selected_months = st.sidebar.slider(
    "Période",
    min_value=0,
    max_value=len(months)-1,
    value=(0, len(months)-1),
    format=None
)
selected_month_range = months[selected_months[0]:selected_months[1]+1]

# Filtrer les données
filtered_df = df[
    (df['plant'].isin(selected_plants)) &
    (df['month'].isin(selected_month_range))
]

# Créer un layout en colonnes
col1, col2 = st.columns(2)

# Statistiques résumées
with col1:
    st.subheader("Vue d'ensemble")
    
    # Métriques principales
    total_production = filtered_df['production'].sum()
    avg_recycling_rate = filtered_df['recycling_rate'].mean()
    total_waste = filtered_df['waste'].sum()
    
    col1a, col1b, col1c = st.columns(3)
    col1a.metric("Production Totale (kg)", f"{total_production:,.2f}")
    col1b.metric("Taux de Recyclage Moyen", f"{avg_recycling_rate:.2f}%")
    col1c.metric("Déchets Totaux (kg)", f"{total_waste:,.2f}")
    
    # Graphique de la production par usine
    st.subheader("Production par Usine")
    plant_production = filtered_df.groupby('plant')['production'].sum().reset_index()
    plant_production = plant_production.sort_values('production', ascending=False)
    
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.bar(plant_production['plant'], plant_production['production'], color='skyblue')
    ax.set_ylabel('Production (kg)')
    ax.set_xticklabels(plant_production['plant'], rotation=45, ha='right')
    st.pyplot(fig)

with col2:
    st.subheader("Performance de Recyclage")
    
    # Graphique du taux de recyclage par usine
    recycling_rate = filtered_df.groupby('plant')['recycling_rate'].mean().reset_index()
    recycling_rate = recycling_rate.sort_values('recycling_rate', ascending=False)
    
    fig, ax = plt.subplots(figsize=(10, 6))
    bars = ax.bar(recycling_rate['plant'], recycling_rate['recycling_rate'], color='green')
    ax.set_ylabel('Taux de Recyclage (%)')
    ax.set_xticklabels(recycling_rate['plant'], rotation=45, ha='right')
    ax.set_ylim(0, 100)
    
    # Ajouter les valeurs sur les barres
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 1, f'{height:.1f}%', 
                ha='center', va='bottom', rotation=0)
    
    st.pyplot(fig)
    
    # Tendance de la production au fil du temps
    st.subheader("Tendance de la Production")
    time_series = filtered_df.groupby('month')['production'].sum().reset_index()
    
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(time_series['month'], time_series['production'], marker='o', linestyle='-', color='purple')
    ax.set_ylabel('Production (kg)')
    ax.set_xticklabels(time_series['month'], rotation=45, ha='right')
    ax.grid(True, linestyle='--', alpha=0.7)
    st.pyplot(fig)

# Tableau de données détaillé
st.subheader("Données Détaillées")
st.dataframe(
    filtered_df[['plant', 'month', 'production', 'recycling_rate', 'waste']].sort_values(['plant', 'month']),
    hide_index=True,
    use_container_width=True
)

# Pied de page
st.markdown("---")
st.caption("Tableau de Bord de Recyclage de Lithium - Les données présentées sont générées aléatoirement à des fins de démonstration.") 