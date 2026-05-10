import type { GrupoEtario } from "./GrupoEtario";
import { SistemaPrevisional } from "./SistemaPrevisional";
import { parametrosEconomicos } from "./datos";

export class Pais {
    public sistemaPrevisional: SistemaPrevisional;
    // Copias locales de los parámetros económicos
    private tasaEmpleabilidad: number = parametrosEconomicos.tasaEmpleabilidad;
    private salarioPromedio: number = parametrosEconomicos.salarioPromedio;
    private jubilacionPromedio: number = parametrosEconomicos.jubilacionPromedio;
    private tasaAporteJubilatorio: number = parametrosEconomicos.tasaAporteJubilatorio;

    constructor(public gruposEtarios: GrupoEtario[]) {
        this.sistemaPrevisional = new SistemaPrevisional(gruposEtarios);
    }

    getTotalPopulation(): number {
        return this.gruposEtarios.reduce((total, grupo) => total + grupo.cantHombres + grupo.cantMujeres, 0);
    }

    getCantidadJubilados(): number {
        return this.sistemaPrevisional.getCantidadJubilados();
    }

    getCantidadPoblacionActiva(): number {
        return this.sistemaPrevisional.getCantidadPoblacionActiva();
    }
}