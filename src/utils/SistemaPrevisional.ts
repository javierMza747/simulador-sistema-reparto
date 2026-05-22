import { parametrosEconomicos } from "./datos";
import type { GruposEtariosPorRango } from "./datos";

export class SistemaPrevisional {

    private edadJubilatoriaMujer: number = 60;
    private edadJubilatoriaHombre: number = 65;

    private fondoDisponible: number = 0; // Fondo total disponible para pagar jubilaciones

    private tasaEmpleabilidad: number = parametrosEconomicos.tasaEmpleabilidad;
    private salarioPromedio: number = parametrosEconomicos.salarioPromedio;
    private jubilacionPromedio: number = parametrosEconomicos.jubilacionPromedio;
    private tasaAporteJubilatorio: number = parametrosEconomicos.tasaAporteJubilatorio;

    constructor(){}

    /**
     * Calcula la cantidad total de jubilados en el sistema.
     * Considera mujeres de 60 años o más y hombres de 65 años o más,
     * sumando la población que cumple con la edad jubilatoria reglamentaria.
     * Nota: Cada grupo etario tiene una tasaMortalidad que debe considerarse en proyecciones futuras.
     *
     * @returns Total de personas que alcanzan la edad jubilatoria.
     */
    getCantidadJubilados(gruposEtarios: GruposEtariosPorRango): number {
        let total: number = 0;
        for (const claveRango in gruposEtarios) {
            const grupo = gruposEtarios[claveRango as keyof GruposEtariosPorRango];
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
    getCantidadPoblacionActiva(gruposEtarios: GruposEtariosPorRango): number {
        let total: number = 0;

        for (const claveRango in gruposEtarios) {
            const grupo = gruposEtarios[claveRango as keyof GruposEtariosPorRango];
            if (grupo.rangoEdad[0] >= 18 && grupo.rangoEdad[1] <= 64) {
                total += grupo.cantHombres;
            }

            if (grupo.rangoEdad[0] >= 18 && grupo.rangoEdad[1] <= 59) {
                total += grupo.cantMujeres;
            }
        }

        return total;
    }

    /**
     * Calcula el balance financiero anual del sistema previsional.
     *
     * Determina el gasto total en jubilaciones y los aportes del sistema
     * para un período de 12 meses, en base a la población activa y jubilada.
     *
     * @param gruposEtarios Distribución etaria actual de la población.
     * @returns Objeto con valores en millones de pesos: gastoJubilaciones, aportesDelSistema y balance.
     *          Balance positivo = superávit. Balance negativo = déficit.
     */
    calcularBalanceAnual(gruposEtarios: GruposEtariosPorRango): { gastoJubilaciones: number; aportesDelSistema: number; balance: number } {
        const cantidadJubilados = this.getCantidadJubilados(gruposEtarios);
        const poblacionActiva = this.getCantidadPoblacionActiva(gruposEtarios);

        // Gasto total en jubilaciones para todo el año (12 meses)
        const gastoJubilacionesEnPesos = cantidadJubilados * this.jubilacionPromedio * 12;

        // Aportes totales al sistema: población activa × salario × tasa aporte × tasa empleabilidad × 12 meses
        const poblacionEmpleada = poblacionActiva * this.tasaEmpleabilidad;
        const aportesDelSistemaEnPesos = poblacionEmpleada * this.salarioPromedio * this.tasaAporteJubilatorio * 12;

        // Convertir a millones
        const gastoJubilaciones = gastoJubilacionesEnPesos / 1_000_000;
        const aportesDelSistema = aportesDelSistemaEnPesos / 1_000_000;
        const balance = aportesDelSistema - gastoJubilaciones;

        return { gastoJubilaciones, aportesDelSistema, balance };
    }

}