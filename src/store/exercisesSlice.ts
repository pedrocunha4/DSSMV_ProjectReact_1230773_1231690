import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api';

export interface Exercise {
  id: number;
  name: string;
  category: number;
  category_name?: string;
  description?: string;
}

export interface ExerciseCategory {
  id: number;
  name: string;
  name_pt?: string; // Nome em português
}

// Mapeamento de categorias para português (conforme a imagem)
const categoryTranslations: { [key: string]: string } = {
  'Chest': 'Peito',
  'Back': 'Costas',
  'Shoulders': 'Ombros',
  'Biceps': 'Bíceps',
  'Triceps': 'Tríceps',
  'Forearms': 'Antebraços',
  'Abs': 'Abdominais',
  'Legs': 'Pernas',
  'Calves': 'Gémeos', // Mudado de "Panturrilhas" para "Gémeos"
  'Cardio': 'Cardio',
  'Other': 'Outros',
  'Arms': 'Braços',
  'Full body': 'Corpo inteiro',
  'Core': 'Core',
  'Glutes': 'Glúteos',
  'Hamstrings': 'Posteriores da coxa',
  'Quadriceps': 'Quadríceps',
};

interface ExercisesState {
  items: Exercise[];
  categories: ExerciseCategory[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Buscar categorias de exercícios
export const fetchExerciseCategories = createAsyncThunk<
  ExerciseCategory[],
  void,
  { rejectValue: string }
>('exercises/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('exercisecategory/', {
      params: {
        limit: 100,
        offset: 0,
      },
    });
    const categories = response.data.results as ExerciseCategory[];
    
    // Ordem desejada das categorias (conforme a imagem)
    const categoryOrder: { [key: string]: number } = {
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
        order: categoryOrder[cat.name] || 999, // Categorias não mapeadas vão para o fim
      }))
      .sort((a, b) => a.order - b.order)
      .map(({ order: _order, ...cat }) => cat); // Remover o campo order antes de retornar
    
    return categoriesWithTranslation;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || 'Erro ao carregar categorias');
  }
});

// Buscar exercícios
export const fetchExercises = createAsyncThunk<
  Exercise[],
  void,
  { rejectValue: string }
>('exercises/fetchExercises', async (_, { rejectWithValue }) => {
  try {
    // Buscar exercícios usando o endpoint correto exerciseinfo/
    const response = await api.get('exerciseinfo/', {
      params: {
        limit: 100,
        offset: 0,
      },
    });
    
    // A API pode retornar results ou diretamente um array
    const exercises = (response.data.results || response.data || []) as any[];
    
    // Buscar categorias para mapear os nomes
    const categoriesResponse = await api.get('exercisecategory/', {
      params: {
        limit: 100,
        offset: 0,
      },
    });
    const categories = categoriesResponse.data.results as ExerciseCategory[];
    
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
        const englishTranslation = exercise.translations.find((t: any) => t.language === 2);
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
          name: exerciseName, // Nome em inglês
          category: categoryId,
          category_name: categoryNamePt, // Categoria em português
          description: translation?.description || '',
        } as Exercise;
      });
    
    return exercisesWithCategories;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || 'Erro ao carregar exercícios');
  }
});

const initialState: ExercisesState = {
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
      .addCase(fetchExercises.pending, (state: ExercisesState) => {
        state.status = 'loading';
      })
      .addCase(fetchExercises.fulfilled, (state: ExercisesState, action: PayloadAction<Exercise[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchExercises.rejected, (state: ExercisesState, action: PayloadAction<string | undefined>) => {
        state.status = 'failed';
        state.error = action.payload || 'Erro ao carregar exercícios';
      })
      .addCase(fetchExerciseCategories.fulfilled, (state: ExercisesState, action: PayloadAction<ExerciseCategory[]>) => {
        state.categories = action.payload;
      });
  },
});

export default exercisesSlice.reducer;

