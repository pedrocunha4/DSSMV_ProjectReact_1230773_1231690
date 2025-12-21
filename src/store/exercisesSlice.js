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

// POST: Criar Exercício
export const addExercise = createAsyncThunk(
  'exercises/addExercise',
  async (params, { getState, rejectWithValue }) => {
    try {
      // Desestruturar manualmente para garantir
      const name = params?.name;
      let categoryId = params?.categoryId;
      const description = params?.description;

      // Se categoryId ainda for undefined, tentar outras formas
      if (categoryId === undefined) {
        categoryId = params?.categoryId || params?.['categoryId'];
      }

      // Validar categoryId
      if (categoryId === null || categoryId === undefined || categoryId === '') {
        return rejectWithValue('Categoria é obrigatória');
      }

      // Garantir que categoryId é um número
      const categoryIdNumber = typeof categoryId === 'number' ? categoryId : parseInt(categoryId, 10);

      if (isNaN(categoryIdNumber) || categoryIdNumber <= 0) {
        return rejectWithValue('Categoria inválida');
      }

      // Criar o exercício base - o endpoint exercise/ cria o exercício
      const payload = {
        category: categoryIdNumber, // Campo obrigatório - deve ser número
      };

      const exerciseResponse = await api.post('exercise/', payload);

      const exerciseId = exerciseResponse.data.id;

      // Criar a tradução usando o endpoint correto exercise-translation/
      // A API requer que description tenha no mínimo 40 caracteres
      let finalDescription = description && description.trim() ? description.trim() : '';

      // Se a descrição estiver vazia ou tiver menos de 40 caracteres, usar descrição padrão
      if (finalDescription.length < 40) {
        finalDescription = finalDescription || 'Não se encontra uma descrição disponível';
        // Preencher até 40 caracteres se necessário
        while (finalDescription.length < 40) {
          finalDescription += '.';
        }
      }

      const translationPayload = {
        exercise: exerciseId, // ID do exercício base criado acima
        name: name,
        description: finalDescription, // Mínimo 40 caracteres
        language: 2, // Inglês (language ID: 2)
        license_author: '', // Opcional
      };

      await api.post('exercise-translation/', translationPayload);

      // Buscar o exercício completo da API para ter o formato correto
      const exerciseInfoResponse = await api.get(`exerciseinfo/${exerciseId}/`);
      const exerciseFromApi = exerciseInfoResponse.data;

      // Buscar categorias para mapear os nomes
      const categoriesResponse = await api.get('exercisecategory/', {
        params: {
          limit: 100,
          offset: 0,
        },
      });
      const categories = categoriesResponse.data.results;

      // Formatar o exercício no mesmo formato que fetchExercises retorna
      const exerciseCategoryId = exerciseFromApi.category?.id || exerciseFromApi.category;
      const categoryName = exerciseFromApi.category?.name;
      const category = categories.find((cat) => cat.id === exerciseCategoryId);
      const categoryNamePt = category?.name_pt || categoryTranslations[categoryName || ''] || categoryName || 'Sem categoria';

      // Extrair nome da tradução
      const englishTranslation = exerciseFromApi.translations?.find((t) => t.language === 2);
      const translation = englishTranslation || exerciseFromApi.translations?.[0];
      const exerciseName = translation?.name || name;

      // Retornar no formato esperado
      return {
        id: exerciseFromApi.id,
        name: exerciseName,
        category: exerciseCategoryId,
        category_name: categoryNamePt,
        description: translation?.description || description || '',
      };
    } catch (err) {
      // Extrair mensagem de erro de forma mais limpa
      let errorMessage = 'Erro ao criar exercício';
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'object') {
          // Tentar extrair a primeira mensagem de erro se for um objeto
          const firstKey = Object.keys(errorData)[0];
          if (firstKey && Array.isArray(errorData[firstKey])) {
            errorMessage = errorData[firstKey][0] || errorMessage;
          } else if (firstKey) {
            errorMessage = String(errorData[firstKey]) || errorMessage;
          }
        }
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Buscar exercícios
export const fetchExercises = createAsyncThunk(
  'exercises/fetchExercises',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('exerciseinfo/', {
        params: {
          limit: 1000,
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
      })
      .addCase(addExercise.fulfilled, (state, action) => {
        // Adiciona o novo exercício ao INÍCIO da lista
        state.items.unshift(action.payload);
      })
      .addCase(addExercise.rejected, (state, action) => {
        state.error = action.payload || 'Erro ao criar exercício';
      });
  },
});

export default exercisesSlice.reducer;

