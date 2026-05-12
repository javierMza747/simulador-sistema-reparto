import type { GrupoEtario } from "./GrupoEtario";
import { SistemaPrevisional } from "./SistemaPrevisional";
import { gruposEtariosCenso2022, parametrosDemograficos, parametrosEconomicos } from "./datos";

export class Pais {
    public sistemaPrevisional: SistemaPrevisional = new SistemaPrevisional();
    // Copias locales de los parámetros económicos
    private tasaEmpleabilidad: number = parametrosEconomicos.tasaEmpleabilidad;
    private salarioPromedio: number = parametrosEconomicos.salarioPromedio;
    private jubilacionPromedio: number = parametrosEconomicos.jubilacionPromedio;
    private tasaAporteJubilatorio: number = parametrosEconomicos.tasaAporteJubilatorio;

    // Copias locales de los parámetros demográficos
    private indiceFecundidad: number = parametrosDemograficos.indiceFecundidad;
    private edadPromedioMaternidad: number = parametrosDemograficos.edadPromedioMaternidad;
    private gruposEtarios: GrupoEtario[] = [...gruposEtariosCenso2022];
    
    constructor() {}

    getTotalPopulation(): number {
        return this.gruposEtarios.reduce((total, grupo) => total + grupo.cantHombres + grupo.cantMujeres, 0);
    }

    getCantidadJubilados(): number {
        return this.sistemaPrevisional.getCantidadJubilados(this.gruposEtarios);
    }

    getCantidadPoblacionActiva(): number {
        return this.sistemaPrevisional.getCantidadPoblacionActiva(this.gruposEtarios);
    }
    

    /**
     * Avanza un año en la simulación del sistema previsional.
     * Calcula el gasto total en jubilaciones y los aportes del sistema durante ese año.
     *
     * @returns Objeto con valores en millones de pesos: gastoJubilaciones, aportesDelSistema y balance.
     *          Balance positivo = superávit (más aportes que gasto)
     *          Balance negativo = déficit (más gasto que aportes)
     */
    avanzarAño(): { gastoJubilaciones: number; aportesDelSistema: number; balance: number } {
        const cantidadJubilados = this.getCantidadJubilados();
        const poblacionActiva = this.getCantidadPoblacionActiva();

        // Gasto total en jubilaciones para todo el año (12 meses)
        const gastoJubilacionesEnPesos = cantidadJubilados * this.jubilacionPromedio * 12;

        // Aportes totales al sistema: población activa × salario × tasa aporte × tasa empleabilidad × 12 meses
        const poblacionEmpleada = poblacionActiva * this.tasaEmpleabilidad;
        const aportesDelSistemaEnPesos = poblacionEmpleada * this.salarioPromedio * this.tasaAporteJubilatorio * 12;

        // Convertir a millones
        const gastoJubilaciones = gastoJubilacionesEnPesos / 1_000_000;
        const aportesDelSistema = aportesDelSistemaEnPesos / 1_000_000;
        const balance = aportesDelSistema - gastoJubilaciones;

        return {
            gastoJubilaciones,
            aportesDelSistema,
            balance,
        };
    }

    /**
     * Retorna el resumen anual formateado y legible.
     * Los valores están en millones de pesos sin decimales.
     *
     * @returns Objeto con texto formateado de cada concepto.
     */
    obtenerResumenAnualFormateado(): { gastoJubilaciones: string; aportesDelSistema: string; balance: string } {
        const resultado = this.avanzarAño();

        const formatoNumero = (num: number): string => {
            return Math.round(num).toLocaleString('es-AR');
        };

        return {
            gastoJubilaciones: `${formatoNumero(resultado.gastoJubilaciones)} millones de pesos`,
            aportesDelSistema: `${formatoNumero(resultado.aportesDelSistema)} millones de pesos`,
            balance: `${formatoNumero(resultado.balance)} millones de pesos`,
        };
    }

    /**
     * Obtiene la cantidad estimada de mujeres en la edad promedio de maternidad.
     *
     * Recorre los grupos etarios y detecta el grupo que contiene la edad definida
     * por `edadPromedioMaternidad`. Luego toma la cantidad de mujeres del subrango
     * asociado a esa edad dentro del grupo.
     *
     * @returns Cantidad estimada de mujeres en edad de tener hijos segun el modelo.
     */
    obtenerMujeresEnEdadDeTenerHijos(): number {
        let totalMujeresEnEdad = 0;
        for (const grupo of this.gruposEtarios) {
            if (grupo.rangoEdad[0] <= this.edadPromedioMaternidad && grupo.rangoEdad[1] >= this.edadPromedioMaternidad) {
                totalMujeresEnEdad += grupo.rangoEdad5.cantMujeres; // Asumiendo que el último subrango es el que contiene a las mujeres en edad de maternidad
            }
        }
        return Math.ceil(totalMujeresEnEdad);
    }
}