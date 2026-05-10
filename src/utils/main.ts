import { gruposEtariosCenso2022 } from "./datos";
import  { GrupoEtario } from "./GrupoEtario";
import { Pais } from "./Pais";

export class Main {
  private appElement: HTMLElement | null;

  constructor() {
    this.appElement = document.getElementById('app');
  }

  init() {
    let gruposEtarios: GrupoEtario[] = [...gruposEtariosCenso2022];
    console.log("Grupos Etarios del Censo 2022:", gruposEtarios);
    let pais: Pais = new Pais(gruposEtarios);
    console.log("Población total del país:", pais.getTotalPopulation());
  }
}