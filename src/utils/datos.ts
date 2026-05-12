import { GrupoEtario } from "./GrupoEtario";

export type ClaveRangoEtario = `${number}-${number}`;
export type GruposEtariosPorRango = Record<ClaveRangoEtario, GrupoEtario>;

export const crearClaveRangoEtario = (edadMinima: number, edadMaxima: number): ClaveRangoEtario => {
  return `${edadMinima}-${edadMaxima}`;
};

export const obtenerClaveRangoDesdeEdad = (edad: number): ClaveRangoEtario => {
  if (edad >= 85) {
    return "85-115";
  }

  const edadNormalizada = Math.floor(edad);
  const edadMinima = Math.floor(edadNormalizada / 5) * 5;
  const edadMaxima = edadMinima + 4;
  return crearClaveRangoEtario(edadMinima, edadMaxima);
};

/*
  Formato de cada instancia:
  new GrupoEtario([edadMinima, edadMaxima], cantidadHombres, cantidadMujeres, tasaMortalidad)
  - [edadMinima, edadMaxima]: rango de edad del grupo etario
  - cantidadHombres: total de hombres dentro de ese rango
  - cantidadMujeres: total de mujeres dentro de ese rango
  - tasaMortalidad: tasa de mortalidad anual para este grupo etario (valor entre 0 y 1)
*/
export const gruposEtariosCenso2022PorRango: GruposEtariosPorRango = {
  "0-4": new GrupoEtario([0, 4], 1072307, 1392682, 0.00152),
  "5-9": new GrupoEtario([5, 9], 1824234, 1772183, 0.00073),
  "10-14": new GrupoEtario([10, 14], 1842705, 1786201, 0.0011),
  "15-19": new GrupoEtario([15, 19], 1794417, 1764602, 0.00295),
  "20-24": new GrupoEtario([20, 24], 1794417, 1764602, 0.00435),
  "25-29": new GrupoEtario([25, 29], 1729539, 1820852, 0.00483),
  "30-34": new GrupoEtario([30, 34], 1684646, 1784888, 0.00535),
  "35-39": new GrupoEtario([35, 39], 1598863, 1689906, 0.00679),
  "40-44": new GrupoEtario([40, 44], 1603622, 1711533, 0.00961),
  "45-49": new GrupoEtario([45, 49], 1376718, 1486233, 0.01463),
  "50-54": new GrupoEtario([50, 54], 1169613, 1278561, 0.02303),
  "55-59": new GrupoEtario([55, 59], 1038682, 1155449, 0.03664),
  "60-64": new GrupoEtario([60, 64], 923244, 1054462, 0.05818),
  "65-69": new GrupoEtario([65, 69], 790896, 941658, 0.09139),
  "70-74": new GrupoEtario([70, 74], 622529, 793035, 0.14122),
  "75-79": new GrupoEtario([75, 79], 419408, 602502, 0.21402),
  "80-84": new GrupoEtario([80, 84], 241330, 404175, 0.31597),
  "85-115": new GrupoEtario([85, 115], 174517, 383373, 0.59167),
};

// Compatibilidad hacia atras para funciones que esperan un arreglo.
export const gruposEtariosCenso2022: GrupoEtario[] = Object.values(gruposEtariosCenso2022PorRango);

/* Parámetros económicos del sistema */
export const parametrosEconomicos = {
  tasaEmpleabilidad: 0.45, // Porcentaje de la población activa que está empleada
  salarioPromedio: 1_800_000, // Salario promedio mensual en pesos
  jubilacionPromedio: 668_515, // Monto promedio de jubilación mensual en pesos
  tasaAporteJubilatorio: 0.11, // Porcentaje del salario que se aporta a la jubilación
};

export const parametrosDemograficos = {
  indiceFecundidad: 1.40, // Tasa de natalidad anual (nacimientos por mujer)
  edadPromedioMaternidad: 30, // Edad promedio en la que las mujeres tienen hijos en argentina
}