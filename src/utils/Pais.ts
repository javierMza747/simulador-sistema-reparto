import { SistemaPrevisional } from "./SistemaPrevisional";
import { gruposEtariosCenso2022PorRango, obtenerClaveRangoDesdeEdad, parametrosDemograficos } from "./datos";
import type { GruposEtariosPorRango } from "./datos";

type Miembros = {
    cantHombres: number;
    cantMujeres: number;
};

type ResumenGrupoEtario = {
    rango: string;
    cantHombres: number;
    cantMujeres: number;
    total: number;
};

export class Pais {
    public sistemaPrevisional: SistemaPrevisional = new SistemaPrevisional();

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

    getPoblacionPorGrupoEtario(): ResumenGrupoEtario[] {
        const resumen: ResumenGrupoEtario[] = [];
        for (const claveRango in this.gruposEtariosPorRango) {
            const grupo = this.gruposEtariosPorRango[claveRango as keyof GruposEtariosPorRango];
            const cantHombres = grupo.cantHombres;
            const cantMujeres = grupo.cantMujeres;
            resumen.push({
                rango: claveRango,
                cantHombres,
                cantMujeres,
                total: cantHombres + cantMujeres,
            });
        }
        return resumen;
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
        let resultado = this.sistemaPrevisional.calcularBalanceAnual(this.gruposEtariosPorRango);
        this.envejecerPoblacion(); // Hace avanzar de edad a toda la población y crea nuevos hijos
        console.log("Avanzando un año...");
        console.log(this.gruposEtariosPorRango);
        return resultado;
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


    /**
     * Calcula la cantidad de hijos nacidos estimada durante un año.
     *
     * Utiliza el índice de fecundidad y la cantidad de mujeres en edad promedio
     * de maternidad para estimar el total de nacimientos. Los hijos se distribuyen
     * equitativamente entre hombres y mujeres.
     *
     * @returns Objeto con la cantidad de hijos varones y mujeres nacidos en el año.
     */
    crearHijos(): Miembros {
        const mujeresEnEdad = this.obtenerMujeresEnEdadDeTenerHijos();
        const hijosEstimados = Math.round(mujeresEnEdad * this.indiceFecundidad);
        // Distribuir los hijos en el grupo etario correspondiente a 0-4 años
        const hijosPorGenero = Math.round(hijosEstimados / 2);
        return {
            cantHombres: hijosPorGenero,
            cantMujeres: hijosPorGenero,
        };
    }

    /**
     * Envejece toda la población de la pirámide etaria un año.
     * 
     * Crea nuevos hijos y los agrega al grupo más joven (0-4 años),
     * luego hace avanzar de edad a todos los grupos etarios en orden:
     * 0-4 -> 5-9 -> 10-14 -> ... -> 85-115
     * 
     * Utiliza el método `aumentarEdad()` de cada GrupoEtario para desplazar
     * a los miembros de cada subrango hacia el siguiente grupo etario.
     * 
     * Nota: No se aplican muertes en este método.
     */
    envejecerPoblacion(): void {
        // Orden de los rangos etarios en la pirámide, derivado de los datos reales.
        const rangosPorOrden: Array<keyof GruposEtariosPorRango> = Object.entries(this.gruposEtariosPorRango)
            .sort(([, grupoA], [, grupoB]) => grupoA.rangoEdad[0] - grupoB.rangoEdad[0])
            .map(([claveRango]) => claveRango as keyof GruposEtariosPorRango);
        // Crear nuevos hijos para comenzar el ciclo
        let miembrosEnTransito = this.crearHijos();
        // Hacer avanzar de edad a cada grupo etario en orden
        for (const claveRango of rangosPorOrden) {
            const grupoEtario = this.gruposEtariosPorRango[claveRango];
            grupoEtario.eliminarMiembrosPorMortalidad(); // Aplica la tasa de mortalidad antes de avanzar de edad
            // miembrosEnTransito contiene los que pasan al siguiente rango
            miembrosEnTransito = grupoEtario.aumentarEdad(miembrosEnTransito);
            if (claveRango === rangosPorOrden[rangosPorOrden.length - 1]) {
                // En el último grupo, los miembros que pasan al siguiente rango se acumulan en el mismo grupo (envejecen dentro del mismo rango)
                grupoEtario.acumularMiembrosMasAncianos(miembrosEnTransito);
            }
        }
    }
}