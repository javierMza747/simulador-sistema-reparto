import { SistemaPrevisional } from "./SistemaPrevisional";
import { gruposEtariosCenso2022PorRango, obtenerClaveRangoDesdeEdad, parametrosDemograficos, parametrosEconomicos } from "./datos";
import type { GruposEtariosPorRango } from "./datos";

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
    private gruposEtariosPorRango: GruposEtariosPorRango = { ...gruposEtariosCenso2022PorRango };
    
    constructor() {}

    getTotalPopulation(): number {
        let total = 0;
        for (const claveRango in this.gruposEtariosPorRango) {
            const grupo = this.gruposEtariosPorRango[claveRango as keyof GruposEtariosPorRango];
            total += grupo.cantHombres + grupo.cantMujeres;
        }
        return total;
    }

    getCantidadJubilados(): number {
        return this.sistemaPrevisional.getCantidadJubilados(this.gruposEtariosPorRango);
    }

    getCantidadPoblacionActiva(): number {
        return this.sistemaPrevisional.getCantidadPoblacionActiva(this.gruposEtariosPorRango);
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
     * Busca directamente el grupo etario correspondiente a `edadPromedioMaternidad`
     * usando el indice por rango y calcula mujeres estimadas para esa edad,
     * distribuyendo el total del grupo en partes iguales por cada edad.
     *
     * @returns Cantidad estimada de mujeres en edad de tener hijos segun el modelo.
     */
    obtenerMujeresEnEdadDeTenerHijos(): number {
        const claveRango = obtenerClaveRangoDesdeEdad(this.edadPromedioMaternidad);
        const grupo = this.gruposEtariosPorRango[claveRango];
        if (!grupo) {
            return 0;
        }
        return Math.ceil(grupo.rangoEdad5.cantMujeres); // Asumiendo que el último subrango del grupo es el que corresponde a la edad promedio de maternidad
    }

    crearHijos(): void {
    }

}