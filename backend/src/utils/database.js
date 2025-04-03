//Ejemplo de base de datos para supabase 


import { supabase } from '../config/supabase.js';

// Función genérica para obtener datos
export const getData = async (table, query = {}) => {
  let request = supabase.from(table).select('*');
  
  // Aplicar filtros si existen
  if (Object.keys(query).length > 0) {
    request = request.match(query);
  }
  
  const { data, error } = await request;
  
  if (error) throw error;
  return data;
};

// Función genérica para insertar datos
export const insertData = async (table, data) => {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select();
  
  if (error) throw error;
  return result;
};

// Función genérica para actualizar datos
export const updateData = async (table, id, data) => {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return result;
};

// Función genérica para eliminar datos
export const deleteData = async (table, id) => {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};