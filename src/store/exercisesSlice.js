import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const normalizeDescriptionForUI = (text) => {
  if (!text) return '';
  let cleaned = String(text);
  cleaned = cleaned.replace(/\s+$/g, '');
  cleaned = cleaned.replace(/\.{4,}$/g, '');
  return cleaned;
};

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

      return categories
        .map((cat) => ({
          ...cat,
          name_pt: categoryTranslations[cat.name] || cat.name,
          order: categoryOrder[cat.name] || 999,
        }))
        .sort((a, b) => a.order - b.order)
        .map(({ order, ...cat }) => cat);
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao carregar categorias');
    }
  }
);

export const addExercise = createAsyncThunk(
  'exercises/addExercise',
  async (params, { rejectWithValue }) => {
    try {
      const name = params?.name;
      let categoryId = params?.categoryId;
      const description = params?.description;

      if (categoryId === null || categoryId === undefined || categoryId === '') {
        return rejectWithValue('Categoria é obrigatória');
      }

      const categoryIdNumber = typeof categoryId === 'number' ? categoryId : parseInt(categoryId, 10);

      if (isNaN(categoryIdNumber) || categoryIdNumber <= 0) {
        return rejectWithValue('Categoria inválida');
      }

      const payload = {
        category: categoryIdNumber,
      };

      const exerciseResponse = await api.post('exercise/', payload);

      const exerciseId = exerciseResponse.data.id;

      const originalDescription = description && description.trim() ? description.trim() : '';
      let finalDescription = originalDescription;

      if (finalDescription.length < 40) {
        finalDescription = finalDescription || 'Não se encontra uma descrição disponível';
        if (finalDescription.length < 40) {
          finalDescription = finalDescription.padEnd(40, '.');
        }
      }

      const translationPayload = {
        exercise: exerciseId,
        name: name,
        description: finalDescription,
        language: 2,
        license_author: '',
      };

      await api.post('exercise-translation/', translationPayload);

      const exerciseInfoResponse = await api.get(`exerciseinfo/${exerciseId}/`);
      const exerciseFromApi = exerciseInfoResponse.data;

      const categoriesResponse = await api.get('exercisecategory/', {
        params: {
          limit: 100,
          offset: 0,
        },
      });
      const categories = categoriesResponse.data.results;

      const exerciseCategoryId = exerciseFromApi.category?.id || exerciseFromApi.category;
      const categoryName = exerciseFromApi.category?.name;
      const category = categories.find((cat) => cat.id === exerciseCategoryId);
      const categoryNamePt = category?.name_pt || categoryTranslations[categoryName || ''] || categoryName || 'Sem categoria';

      const englishTranslation = exerciseFromApi.translations?.find((t) => t.language === 2);
      const translation = englishTranslation || exerciseFromApi.translations?.[0];
      const exerciseName = translation?.name || name;

      const uiDescription = normalizeDescriptionForUI(originalDescription || translation?.description || '');

      return {
        id: exerciseFromApi.id,
        name: exerciseName,
        category: exerciseCategoryId,
        category_name: categoryNamePt,
        description: uiDescription,
      };
    } catch (err) {
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

export const updateExercise = createAsyncThunk(
  'exercises/updateExercise',
  async (params, { rejectWithValue }) => {
    try {
      const { exerciseId, name, categoryId, description } = params;

      if (!exerciseId) {
        return rejectWithValue('ID do exercício é obrigatório');
      }

      const exerciseInfoResponse = await api.get(`exerciseinfo/${exerciseId}/`);
      const exerciseFromApi = exerciseInfoResponse.data;

      if (categoryId !== undefined && categoryId !== null) {
        const categoryIdNumber = typeof categoryId === 'number' ? categoryId : parseInt(categoryId, 10);
        if (!isNaN(categoryIdNumber) && categoryIdNumber > 0) {
          await api.patch(`exercise/${exerciseId}/`, {
            category: categoryIdNumber,
          });
        }
      }

      const englishTranslation = exerciseFromApi.translations?.find((t) => t.language === 2);
      if (englishTranslation) {
        const providedDescription = description !== undefined ? (description.trim() || '') : undefined;
        let finalDescription = providedDescription !== undefined
          ? (providedDescription || englishTranslation.description || '')
          : englishTranslation.description || '';
        
        if (finalDescription.length < 40 && finalDescription.length > 0) {
          finalDescription = finalDescription.padEnd(40, '.');
        } else if (finalDescription.length === 0) {
          finalDescription = 'Não se encontra uma descrição disponível'.padEnd(40, '.');
        }

        const translationPayload = {
          name: name !== undefined ? name : englishTranslation.name,
          description: finalDescription,
          language: 2,
        };

        await api.patch(`exercise-translation/${englishTranslation.id}/`, translationPayload);
      } else if (name !== undefined || description !== undefined) {
        let finalDescription = description ? description.trim() : '';
        if (finalDescription.length < 40) {
          finalDescription = finalDescription || 'Não se encontra uma descrição disponível';
          finalDescription = finalDescription.padEnd(40, '.');
        }

        await api.post('exercise-translation/', {
          exercise: exerciseId,
          name: name || 'Sem nome',
          description: finalDescription,
          language: 2,
          license_author: '',
        });
      }

      const updatedExerciseResponse = await api.get(`exerciseinfo/${exerciseId}/`);
      const updatedExercise = updatedExerciseResponse.data;

      const categoriesResponse = await api.get('exercisecategory/', {
        params: {
          limit: 100,
          offset: 0,
        },
      });
      const categories = categoriesResponse.data.results;

      const exerciseCategoryId = updatedExercise.category?.id || updatedExercise.category;
      const categoryName = updatedExercise.category?.name;
      const category = categories.find((cat) => cat.id === exerciseCategoryId);
      const categoryNamePt = category?.name_pt || categoryTranslations[categoryName || ''] || categoryName || 'Sem categoria';

      const updatedEnglishTranslation = updatedExercise.translations?.find((t) => t.language === 2);
      const updatedTranslation = updatedEnglishTranslation || updatedExercise.translations?.[0];
      const exerciseName = updatedTranslation?.name || name || 'Sem nome';

      const uiDescription = normalizeDescriptionForUI(
        (description && description.trim()) || updatedTranslation?.description || ''
      );

      return {
        id: updatedExercise.id,
        name: exerciseName,
        category: exerciseCategoryId,
        category_name: categoryNamePt,
        description: uiDescription,
      };
    } catch (err) {
      let errorMessage = 'Erro ao atualizar exercício';
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
        }
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchExercises = createAsyncThunk(
  'exercises/fetchExercises',
  async (params = {}, { rejectWithValue }) => {
    try {
      const limit = typeof params.limit === 'number' ? params.limit : 100;
      const offset = typeof params.offset === 'number' ? params.offset : 0;
      const response = await api.get('exerciseinfo/', {
        params: {
          limit,
          offset,
        },
      });

      const data = response.data || {};
      const exercises = data.results || data || [];
      const hasMore = Boolean(data.next);

      const mapped = (exercises || [])
        .filter((exercise) => {
          const hasId = exercise && exercise.id;
          const hasTranslations = exercise?.translations && exercise.translations.length > 0;
          return hasId && hasTranslations;
        })
        .map((exercise) => {
          const englishTranslation = exercise.translations.find((t) => t.language === 2);
          const translation = englishTranslation || exercise.translations[0];
          const exerciseName = translation?.name || 'Sem nome';

          const categoryId = exercise.category?.id || exercise.category;
          const categoryName = exercise.category?.name;

          const categoryNamePt = categoryTranslations[categoryName || ''] || categoryName || 'Sem categoria';

          return {
            id: exercise.id,
            name: exerciseName,
            category: categoryId,
            category_name: categoryNamePt,
            description: normalizeDescriptionForUI(translation?.description || ''),
          };
        });

      return { items: mapped, hasMore, nextOffset: offset + limit, isAppend: offset > 0 };
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
  hasMore: true,
  nextOffset: 0,
  isLoadingMore: false,
};

const exercisesSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExercises.pending, (state, action) => {
        const { offset } = action.meta.arg || {};
        if (offset && offset > 0) {
          state.isLoadingMore = true;
        } else {
          state.status = 'loading';
        }
      })
      .addCase(fetchExercises.fulfilled, (state, action) => {
        const { items, hasMore, nextOffset, isAppend } = action.payload;
        state.status = 'succeeded';
        state.hasMore = hasMore;
        state.nextOffset = nextOffset;
        state.isLoadingMore = false;
        if (isAppend) {
          const existingIds = new Set(state.items.map((i) => i.id));
          const toAdd = items.filter((i) => !existingIds.has(i.id));
          state.items = state.items.concat(toAdd);
        } else {
          state.items = items;
        }
      })
      .addCase(fetchExercises.rejected, (state, action) => {
        state.isLoadingMore = false;
        state.status = 'failed';
        state.error = action.payload || 'Erro ao carregar exercícios';
      })
      .addCase(fetchExerciseCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(addExercise.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(addExercise.rejected, (state, action) => {
        state.error = action.payload || 'Erro ao criar exercício';
      })
      .addCase(updateExercise.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateExercise.rejected, (state, action) => {
        state.error = action.payload || 'Erro ao atualizar exercício';
      });
  },
});

export default exercisesSlice.reducer;
