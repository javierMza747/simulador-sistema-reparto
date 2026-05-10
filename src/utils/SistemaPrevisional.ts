import { GrupoEtario } from "./GrupoEtario";

export class SistemaPrevisional {

    private edadJubilatoriaMujer: number = 60;
    private edadJubilatoriaHombre: number = 65;
    
    private fondoDisponible: number = 0; // Fondo total disponible para pagar jubilaciones
    constructor(public gruposEtarios: GrupoEtario[]){}

    /**
     * Calcula la cantidad total de jubilados en el sistema.
     * Considera mujeres de 60 años o más y hombres de 65 años o más,
     * sumando la población que cumple con la edad jubilatoria reglamentaria.
     * Nota: Cada grupo etario tiene una tasaMortalidad que debe considerarse en proyecciones futuras.
     *
     * @returns Total de personas que alcanzan la edad jubilatoria.
     */
    getCantidadJubilados(): number {
        let total: number = 0;
        for (const grupo of this.gruposEtarios) {
            const [edadMinima, edadMaxima] = grupo.rangoEdad;
            if (edadMinima >= this.edadJubilatoriaMujer) {
                total += grupo.cantMujeres;
            }
            if (edadMinima >= this.edadJubilatoriaHombre) {
                total += grupo.cantHombres;
            }
        }
        return total;
    }

    /**
     * Calcula la cantidad de personas con posibilidad de trabajar en todo el sistema.
     * Este valor representa poblacion en edad laboral segun las reglas usadas por el modelo,
     * no necesariamente personas que actualmente tienen trabajo.
     * Cada grupo etario considera su tasaMortalidad en cálculos de proyección.
     *
     * @returns Total de personas consideradas parte de la poblacion activa potencial.
     */
    getCantidadPoblacionActiva(): number {
        let total: number = 0;

        for (const grupo of this.gruposEtarios) {
            if (grupo.rangoEdad[0] >= 18 && grupo.rangoEdad[1] <= 64) {
                total += grupo.cantHombres;
            }

            if (grupo.rangoEdad[0] >= 18 && grupo.rangoEdad[1] <= 59) {
                total += grupo.cantMujeres;
            }
        }

        return total;
    }
    
}