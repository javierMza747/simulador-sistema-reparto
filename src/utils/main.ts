import { Pais } from "./Pais";
import * as d3 from "d3";

export class Main {
  private pais: Pais = new Pais();
  private año: number = 2022;
  private maxEscalaPiramide: number = 1;

  constructor() {}

  init() {
    const btn = document.getElementById('btn-avanzar-año');
    btn?.addEventListener('click', () => this.avanzarAño());
  }

  private avanzarAño(): void {
    this.año++;
    const resumen = this.pais.obtenerResumenAnualFormateado();
    const poblacionTotal = this.pais.getTotalPopulation();
    const cantidadJubilados = this.pais.getCantidadJubilados();
    const poblacionActiva = this.pais.getCantidadPoblacionActiva();
    const poblacionPorGrupo = this.pais.getPoblacionPorGrupoEtario();

    const seccion = document.getElementById('resumen-anual') as HTMLElement;
    seccion.hidden = false;

    (document.getElementById('poblacion-total') as HTMLElement).textContent = `${Math.round(poblacionTotal).toLocaleString('es-AR')} habitantes`;
    (document.getElementById('cantidad-jubilados') as HTMLElement).textContent = `${Math.round(cantidadJubilados).toLocaleString('es-AR')} personas`;
    (document.getElementById('poblacion-activa') as HTMLElement).textContent = `${Math.round(poblacionActiva).toLocaleString('es-AR')} personas`;
    (document.getElementById('año-actual') as HTMLElement).textContent = `Año ${this.año}`;
    (document.getElementById('gasto-jubilaciones') as HTMLElement).textContent = resumen.gastoJubilaciones;
    (document.getElementById('aportes-sistema') as HTMLElement).textContent = resumen.aportesDelSistema;
    (document.getElementById('balance') as HTMLElement).textContent = resumen.balance;

    this.renderPiramidePoblacional(poblacionPorGrupo);

    const cuerpoTabla = document.getElementById('tabla-grupos-etarios') as HTMLElement;
    cuerpoTabla.innerHTML = poblacionPorGrupo
      .map((grupo) => `
        <tr>
          <td>${grupo.rango}</td>
          <td>${Math.round(grupo.cantHombres).toLocaleString('es-AR')}</td>
          <td>${Math.round(grupo.cantMujeres).toLocaleString('es-AR')}</td>
          <td>${Math.round(grupo.total).toLocaleString('es-AR')}</td>
        </tr>
      `)
      .join('');
  }

  private renderPiramidePoblacional(poblacionPorGrupo: Array<{ rango: string; cantHombres: number; cantMujeres: number }>): void {
    const contenedor = document.getElementById('grafico-piramide');
    if (!contenedor) {
      return;
    }

    const datos = [...poblacionPorGrupo]
      .sort((a, b) => this.obtenerEdadMinima(a.rango) - this.obtenerEdadMinima(b.rango))
      .map((d) => ({
        rango: d.rango,
        hombres: Math.max(0, Math.round(d.cantHombres)),
        mujeres: Math.max(0, Math.round(d.cantMujeres)),
      }));

    const ancho = Math.max(760, contenedor.clientWidth || 760);
    const margen = { top: 48, right: 48, bottom: 28, left: 48, middle: 80 };
    const alto = Math.max(420, datos.length * 28 + margen.top + margen.bottom);
    const anchoGrafico = ancho - margen.left - margen.right;
    const anchoMitad = (anchoGrafico - margen.middle) / 2;
    const inicioIzquierda = margen.left;
    const inicioDerecha = margen.left + anchoMitad + margen.middle;
    const centroEtiquetas = margen.left + anchoMitad + margen.middle / 2;

    const maximoActual = d3.max(datos, (d) => Math.max(d.hombres, d.mujeres)) ?? 0;
    this.maxEscalaPiramide = Math.max(this.maxEscalaPiramide, maximoActual);
    const dominioMax = this.maxEscalaPiramide;

    const escalaY = d3
      .scaleBand<string>()
      .domain(datos.map((d) => d.rango))
      .range([alto - margen.bottom, margen.top])
      .padding(0.12);

    const escalaXIzquierda = d3.scaleLinear().domain([0, dominioMax]).range([anchoMitad, 0]);
    const escalaXDerecha = d3.scaleLinear().domain([0, dominioMax]).range([0, anchoMitad]);
    const formatearNumero = d3.format(",");

    contenedor.innerHTML = '';
    const svg = d3
      .select(contenedor)
      .append('svg')
      .attr('viewBox', `0 0 ${ancho} ${alto}`)
      .attr('role', 'img')
      .attr('aria-label', 'Pirámide poblacional por grupo etario');

    svg
      .append('text')
      .attr('x', inicioIzquierda + anchoMitad / 2)
      .attr('y', margen.top - 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('font-weight', 600)
      .attr('fill', '#1e3a8a')
      .text('Hombres');

    svg
      .append('text')
      .attr('x', inicioDerecha + anchoMitad / 2)
      .attr('y', margen.top - 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('font-weight', 600)
      .attr('fill', '#9f1239')
      .text('Mujeres');

    svg
      .append('line')
      .attr('x1', centroEtiquetas)
      .attr('x2', centroEtiquetas)
      .attr('y1', margen.top - 6)
      .attr('y2', alto - margen.bottom)
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1);

    const grupoIzquierdo = svg.append('g').attr('transform', `translate(${inicioIzquierda},0)`);
    grupoIzquierdo
      .selectAll('rect')
      .data(datos)
      .join('rect')
      .attr('x', (d) => escalaXIzquierda(d.hombres))
      .attr('y', (d) => escalaY(d.rango) ?? 0)
      .attr('width', (d) => anchoMitad - escalaXIzquierda(d.hombres))
      .attr('height', escalaY.bandwidth())
      .attr('fill', '#2563eb');

    const grupoDerecho = svg.append('g').attr('transform', `translate(${inicioDerecha},0)`);
    grupoDerecho
      .selectAll('rect')
      .data(datos)
      .join('rect')
      .attr('x', 0)
      .attr('y', (d) => escalaY(d.rango) ?? 0)
      .attr('width', (d) => escalaXDerecha(d.mujeres))
      .attr('height', escalaY.bandwidth())
      .attr('fill', '#e11d48');

    svg
      .append('g')
      .selectAll('text')
      .data(datos)
      .join('text')
      .attr('x', centroEtiquetas)
      .attr('y', (d) => (escalaY(d.rango) ?? 0) + escalaY.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', 11)
      .attr('fill', '#0f172a')
      .text((d) => d.rango);

    svg
      .append('g')
      .attr('transform', `translate(${inicioIzquierda},${margen.top - 8})`)
      .call(d3.axisTop(escalaXIzquierda).ticks(5).tickFormat((d) => formatearNumero(Number(d))));

    svg
      .append('g')
      .attr('transform', `translate(${inicioDerecha},${margen.top - 8})`)
      .call(d3.axisTop(escalaXDerecha).ticks(5).tickFormat((d) => formatearNumero(Number(d))));
  }

  private obtenerEdadMinima(rango: string): number {
    const [minima] = rango.split('-');
    return Number(minima);
  }
}