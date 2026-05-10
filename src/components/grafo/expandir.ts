import * as d3 from 'd3';
import type { Persona } from './Persona';

export const FACTOR_COMPRESION = 100_000;
export const JUBILADOS_INICIALES = 6_000_000;

export type LinkDatum = d3.SimulationLinkDatum<Persona>;

export interface ExpansionResult {
  nodes: Persona[];
  links: LinkDatum[];
  currentLevel: number;
  aportantes: number;
  jubilados: number;
  fallecidosEnCiclo: number;
  reserva: number;
  poblacionTotal: number;
}

// Aportantes cuyo nodo receptor murio y quedan a la espera de reasignacion.
const reservaAportantes: Persona[] = [];

function resolveNodeId(endpoint: LinkDatum['source'] | LinkDatum['target']): number | null {
  if (typeof endpoint === 'number') return endpoint;
  if (typeof endpoint === 'object' && endpoint && 'id' in endpoint) {
    return (endpoint as Persona).id;
  }
  return null;
}

export function expandirGeneracion(
  nodes: Persona[],
  links: LinkDatum[],
  currentLevel: number,
  ratio: number
): ExpansionResult {
  const siguienteNivel = currentLevel + 1;
  const hijosPorPadre = Math.max(0, Math.floor(ratio));
  const nodosVisualesPorPadre = Math.min(hijosPorPadre, 2);

  // Cada avance de generacion envejece a toda la poblacion en 10 anos.
  nodes.forEach((n) => {
    n.edad += 10;
  });

  // Se eliminan personas mayores de 85 anos.
  const fallecidosEnCiclo = nodes
    .filter((n) => n.edad > 85)
    .reduce((acc, n) => acc + n.peso, 0);
  const nodesVivos = nodes.filter((n) => n.edad <= 85);
  const idsVivos = new Set(nodesVivos.map((n) => n.id));
  const idsMuertos = new Set(nodes.filter((n) => n.edad > 85).map((n) => n.id));

  // Si el nodo receptor muere, sus aportantes vivos pasan a reserva.
  links.forEach((l) => {
    const sourceId = resolveNodeId(l.source);
    const targetId = resolveNodeId(l.target);

    if (sourceId === null || targetId === null) return;

    const sourceMuerto = idsMuertos.has(sourceId);
    const targetVivo = idsVivos.has(targetId);

    if (sourceMuerto && targetVivo) {
      const aportante = nodesVivos.find((n) => n.id === targetId);
      if (aportante && !reservaAportantes.some((n) => n.id === aportante.id)) {
        reservaAportantes.push(aportante);
      }
    }
  });

  // Se limpian enlaces que apuntan a nodos eliminados.
  const linksVivos = links.filter((l) => {
    const sourceId = resolveNodeId(l.source);
    const targetId = resolveNodeId(l.target);

    return sourceId !== null && targetId !== null && idsVivos.has(sourceId) && idsVivos.has(targetId);
  });

  const padresActuales = nodesVivos.filter((n) => n.level === currentLevel);
  let nextId = nodesVivos.reduce((maxId, n) => Math.max(maxId, n.id), -1) + 1;
  const nuevosNodos: Persona[] = [];

  padresActuales.forEach((padre) => {
    if (hijosPorPadre === 0 || nodosVisualesPorPadre === 0) return;

    for (let i = 0; i < nodosVisualesPorPadre; i++) {
      const nuevoNodo: Persona = {
        id: nextId++,
        edad: 25,
        level: siguienteNivel,
        color: '#38bdf8',
        peso: FACTOR_COMPRESION,
      };

      nodesVivos.push(nuevoNodo);
      nuevosNodos.push(nuevoNodo);
      linksVivos.push({ source: padre, target: nuevoNodo });
    }
  });

  // Se reasignan aportantes en reserva hacia nodos nuevos si existen.
  if (nuevosNodos.length > 0 && reservaAportantes.length > 0) {
    const targetsConLink = new Set(
      linksVivos
        .map((l) => resolveNodeId(l.target))
        .filter((id): id is number => id !== null)
    );

    let receptorIndex = 0;
    const aportantesRestantes: Persona[] = [];

    reservaAportantes.forEach((aportante) => {
      // Si ya tiene un receptor activo, no hace falta reasignarlo.
      if (targetsConLink.has(aportante.id) || !idsVivos.has(aportante.id)) {
        return;
      }

      const receptor = nuevosNodos[receptorIndex % nuevosNodos.length];
      receptorIndex += 1;

      if (!receptor) {
        aportantesRestantes.push(aportante);
        return;
      }

      linksVivos.push({ source: receptor, target: aportante });
      targetsConLink.add(aportante.id);
    });

    reservaAportantes.length = 0;
    reservaAportantes.push(...aportantesRestantes);
  } else {
    // Limpia de reserva nodos que ya no existen.
    for (let i = reservaAportantes.length - 1; i >= 0; i--) {
      if (!idsVivos.has(reservaAportantes[i].id)) {
        reservaAportantes.splice(i, 1);
      }
    }
  }

  // Recalculo visual simple por estado etario.
  nodesVivos.forEach((n) => {
    if (n.edad >= 65) {
      n.color = '#f87171';
    } else {
      n.color = '#38bdf8';
    }
  });

  const aportantes = nodesVivos
    .filter((n) => n.edad >= 25 && n.edad < 65)
    .reduce((acc, n) => acc + n.peso, 0);
  const jubilados = nodesVivos
    .filter((n) => n.edad >= 65)
    .reduce((acc, n) => acc + n.peso, 0);
  const poblacionTotal = nodesVivos.reduce((acc, n) => acc + n.peso, 0);

  return {
    nodes: nodesVivos,
    links: linksVivos,
    currentLevel: siguienteNivel,
    aportantes,
    jubilados,
    fallecidosEnCiclo,
    reserva: reservaAportantes.length,
    poblacionTotal,
  };
}
