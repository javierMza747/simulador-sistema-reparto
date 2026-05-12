import  { GrupoEtario } from "./GrupoEtario";
import { Pais } from "./Pais";

export class Main {
  private appElement: HTMLElement | null;

  constructor() {
    this.appElement = document.getElementById('app');
  }

  init() {
    let pais: Pais = new Pais();
    console.log("Población total del país:", pais.getTotalPopulation());
    console.log("Cantidad de jubilados en el sistema previsional:", pais.getCantidadJubilados());
    console.log("Cantidad de población activa potencial:", pais.getCantidadPoblacionActiva());
    const resumenAnual = pais.obtenerResumenAnualFormateado();
    console.log("\n--- Resumen Anual del Sistema Previsional ---");
    console.log("Gasto en jubilaciones:", resumenAnual.gastoJubilaciones);
    console.log("Aportes al sistema:", resumenAnual.aportesDelSistema);
    console.log("Balance anual:", resumenAnual.balance);
    console.log("\n muejres que van a tener hijos en el año siguiente:", pais.obtenerMujeresEnEdadDeTenerHijos());
  }
}