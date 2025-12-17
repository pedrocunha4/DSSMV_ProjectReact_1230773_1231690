import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Mapeamento de categorias para português (conforme a imagem)
const categoryTranslations = {
  'Chest': 'Peito',
  'Back': 'Costas',
  'Shoulders': 'Ombros',
  'Biceps': 'Bíceps',
  'Triceps': 'Tríceps',
  'Forearms': 'Antebraços',
  'Abs': 'Abdominais',
  'Legs': 'Pernas',
  'Calves': 'Gémeos',
  'Cardio': 'Cardio',
  'Other': 'Outros',
  'Arms': 'Braços',
  'Full body': 'Corpo inteiro',
  'Core': 'Core',
  'Glutes': 'Glúteos',
  'Hamstrings': 'Posteriores da coxa',
  'Quadriceps': 'Quadríceps',
};

// Buscar categorias de exercícios
export const fetchExerciseCategories = createAsyncThunk(
  'exercises/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('exercisecategory/', {
        params: {
          limit: 100,
          offset: 0,
        },
      });
      const categories = response.data.results;
      
      // Ordem desejada das categorias (conforme a imagem)
      const categoryOrder = {
        'Arms': 1,
        'Legs': 2,
        'Abs': 3,
        'Chest': 4,
        'Back': 5,
        'Shoulders': 6,
        'Calves': 7,
        'Cardio': 8,
      };
      
      // Adicionar tradução em português e ordenar
      const categoriesWithTranslation = categories
        .map((cat) => ({
          ...cat,
          name_pt: categoryTranslations[cat.name] || cat.name,
          order: categoryOrder[cat.name] || 999,
        }))
        .sort((a, b) => a.order - b.order)
        .map(({ order, ...cat }) => cat);
      
      return categoriesWithTranslation;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao carregar categorias');
    }
  }
);

// Buscar exercícios
export const fetchExercises = createAsyncThunk(
  'exercises/fetchExercises',
  async (_, { rejectWithValue }) => {
    try {
      // Buscar exercícios usando o endpoint correto exerciseinfo/
      const response = await api.get('exerciseinfo/', {
        params: {
          limit: 100,
          offset: 0,
        },
      });
      
      // A API pode retornar results ou diretamente um array
      const exercises = response.data.results || response.data || [];
      
      // Buscar categorias para mapear os nomes
      const categoriesResponse = await api.get('exercisecategory/', {
        params: {
          limit: 100,
          offset: 0,
        },
      });
      const categories = categoriesResponse.data.results;
      
      // Mapear exercícios - a estrutura real tem translations e category como objeto
      const exercisesWithCategories = exercises
        .filter((exercise) => {
          // Verificar se tem id e translations com nome
          const hasId = exercise && exercise.id;
          const hasTranslations = exercise?.translations && exercise.translations.length > 0;
          return hasId && hasTranslations;
        })
        .map((exercise) => {
          // Extrair nome em INGLÊS (language: 2)
          const englishTranslation = exercise.translations.find((t) => t.language === 2);
          const translation = englishTranslation || exercise.translations[0];
          const exerciseName = translation?.name || 'Sem nome';
          
          // Extrair category - pode ser objeto { id, name } ou número
          const categoryId = exercise.category?.id || exercise.category;
          const categoryName = exercise.category?.name;
          
          // Encontrar categoria nas categorias buscadas
          const category = categories.find((cat) => cat.id === categoryId);
          
          // Usar nome em português da categoria se disponível
          const categoryNamePt = category?.name_pt || categoryTranslations[categoryName || ''] || categoryName || 'Sem categoria';
          
          return {
            id: exercise.id,
            name: exerciseName,
            category: categoryId,
            category_name: categoryNamePt,
            description: translation?.description || '',
          };
        });
      
      return exercisesWithCategories;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao carregar exercícios');
    }
  }
);

const initialState = {
  items: [],
  categories: [],
  status: 'idle',
  error: null,
};

const exercisesSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExercises.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchExercises.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchExercises.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Erro ao carregar exercícios';
      })
      .addCase(fetchExerciseCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export default exercisesSlice.reducer;

