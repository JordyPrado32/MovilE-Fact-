import { Platform } from 'react-native';

const DEFAULT_API_PORT = '5196';

function getDefaultApiBaseUrl() {
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${DEFAULT_API_PORT}`;
  }

  return `http://localhost:${DEFAULT_API_PORT}`;
}

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || getDefaultApiBaseUrl();
// Se configura cuando el backend publique el equivalente movil de MenuService.GetMenusByRol.
export const MENUS_BY_ROLE_PATH = process.env.EXPO_PUBLIC_MENUS_BY_ROLE_PATH?.trim() || '';
export const PRODUCTOS_PATH = process.env.EXPO_PUBLIC_PRODUCTOS_PATH?.trim() || '/api/productos';
export const CATEGORIAS_PATH = process.env.EXPO_PUBLIC_CATEGORIAS_PATH?.trim() || '/api/categorias';
export const SUBCATEGORIAS_PATH = process.env.EXPO_PUBLIC_SUBCATEGORIAS_PATH?.trim() || '/api/subcategorias';
