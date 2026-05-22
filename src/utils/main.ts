import { Pais } from "./Pais";

export class Main {
  private pais: Pais = new Pais();
  private año: number = 2022;

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
}