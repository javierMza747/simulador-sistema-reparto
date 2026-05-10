import type { GrupoEtario } from "./GrupoEtario";

export class Pais {
    constructor(public gruposEtarios: GrupoEtario[]){}

    getTotalPopulation(): number {
        return this.gruposEtarios.reduce((total, grupo) => total + grupo.cantHombres + grupo.cantMujeres, 0);
    }
}