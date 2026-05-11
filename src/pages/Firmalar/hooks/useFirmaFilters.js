// Enes Doğanay | 11 Mayıs 2026: Sidebar filtre verisi + seçim yönetimi (şehir, sektör, kategori)
import { useState, useEffect } from 'react';
import { fetchSidebarData } from '../services/firmaService';
import { SEKTORLER } from '../utils/firmaUtils';

const PRIORITY_CITIES = ['İstanbul (Avrupa)', 'İstanbul (Anadolu)', 'Ankara', 'Kocaeli'];

const buildSortedCities = (cityData) => {
  const expanded = [];
  cityData.forEach(c => {
    if (c.sehir === 'İstanbul') {
      expanded.push({ sehir: 'İstanbul (Avrupa)' });
      expanded.push({ sehir: 'İstanbul (Anadolu)' });
    } else {
      expanded.push(c);
    }
  });
  return expanded.sort((a, b) => {
    const ai = PRIORITY_CITIES.indexOf(a.sehir);
    const bi = PRIORITY_CITIES.indexOf(b.sehir);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.sehir.localeCompare(b.sehir, 'tr');
  });
};

const getNewSelection = (current, value) =>
  current.includes(value) ? current.filter(x => x !== value) : [...current, value];

export const useFirmaFilters = (activeFilters, onApplyFilters) => {
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedCities(activeFilters.cities || []);
    setSelectedCategories(activeFilters.categories || []);
    setSelectedSectors(activeFilters.sectors || []);
  }, [activeFilters]);

  useEffect(() => {
    const load = async () => {
      try {
        const { cityData, categoryData } = await fetchSidebarData();
        setCities(buildSortedCities(cityData));
        const uniqueCats = [...new Set(categoryData.map(c => c.category_name))].filter(Boolean).sort();
        setCategories(uniqueCats);
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggle = (type, value) => {
    const newCities = type === 'cities' ? getNewSelection(selectedCities, value) : selectedCities;
    const newSectors = type === 'sectors' ? getNewSelection(selectedSectors, value) : selectedSectors;
    const newCats = type === 'categories' ? getNewSelection(selectedCategories, value) : selectedCategories;
    if (type === 'cities') setSelectedCities(newCities);
    if (type === 'sectors') setSelectedSectors(newSectors);
    if (type === 'categories') setSelectedCategories(newCats);
    onApplyFilters({
      cities: newCities.length === cities.length ? [] : newCities,
      categories: newCats.length === categories.length ? [] : newCats,
      sectors: newSectors.length === SEKTORLER.length ? [] : newSectors,
    });
  };

  const handleClearAll = () => {
    setSelectedCities([]);
    setSelectedCategories([]);
    setSelectedSectors([]);
    onApplyFilters({ cities: [], categories: [], sectors: [] });
  };

  return {
    loading, cities, categories,
    selectedCities, selectedCategories, selectedSectors,
    handleToggle, handleClearAll,
  };
};
