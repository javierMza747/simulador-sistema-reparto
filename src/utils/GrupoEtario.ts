type Miembros = {
    cantHombres: number;
    cantMujeres: number;
};

export class GrupoEtario {
    /*
        Se declara una variable por cada edad posible dentro del rango, por ejemplo 5 a 9 anios
        rangoEdad1 = 5
        rangoEdad2 = 6
        rangoEdad3 = 7
        rangoEdad4 = 8
        rangoEdad5 = 9
    */
    public rangoEdad1: Miembros;
    public rangoEdad2: Miembros;
    public rangoEdad3: Miembros;
    public rangoEdad4: Miembros;
    public rangoEdad5: Miembros;

    /**
     * Crea una instancia de un grupo etario con su distribucion de poblacion.
     * @param rangoEdad Rango de edad del grupo [edadMinima, edadMaxima]
     * @param cantHombres Total de hombres en este rango de edad
     * @param cantMujeres Total de mujeres en este rango de edad
     * @param tasaMortalidad Tasa de mortalidad anual para este grupo (valor entre 0 y 1)
     */
    constructor(
        public rangoEdad: [number, number],
        public cantHombres: number,
        public cantMujeres: number,
        public tasaMortalidad: number
    ) {
        const hombresPorSubrango = cantHombres / 5;
        const mujeresPorSubrango = cantMujeres / 5;

        this.rangoEdad1 = { cantHombres: hombresPorSubrango, cantMujeres: mujeresPorSubrango };
        this.rangoEdad2 = { cantHombres: hombresPorSubrango, cantMujeres: mujeresPorSubrango };
        this.rangoEdad3 = { cantHombres: hombresPorSubrango, cantMujeres: mujeresPorSubrango };
        this.rangoEdad4 = { cantHombres: hombresPorSubrango, cantMujeres: mujeresPorSubrango };
        this.rangoEdad5 = { cantHombres: hombresPorSubrango, cantMujeres: mujeresPorSubrango };
    }

    /**
     * Avanza un anio la distribucion etaria interna del grupo.
     * Los miembros del ultimo subrango se devuelven para
     * incorporarlos al siguiente grupo etario externo.
     * La tasa de mortalidad de este grupo es considerada en calculos posteriores.
     *
     * @param nuevosMiembros Miembros que ingresan al primer subrango del grupo.
     * @returns Miembros que salen del ultimo subrango y pasan al siguiente grupo etario.
     */
    aumentarEdad(nuevosMiembros: Miembros): Miembros {
        const miembrosQuePasanAlSiguienteRango = { ...this.rangoEdad5 };

        const rangoAnterior1 = { ...this.rangoEdad1 };
        const rangoAnterior2 = { ...this.rangoEdad2 };
        const rangoAnterior3 = { ...this.rangoEdad3 };
        const rangoAnterior4 = { ...this.rangoEdad4 };

        this.rangoEdad2 = rangoAnterior1;
        this.rangoEdad3 = rangoAnterior2;
        this.rangoEdad4 = rangoAnterior3;
        this.rangoEdad5 = rangoAnterior4;
        this.rangoEdad1 = { ...nuevosMiembros };

        this.actualizarTotales();
        return miembrosQuePasanAlSiguienteRango;
    }


    /**
     * Acumula miembros adicionales en el subrango más antiguo del grupo etario.
     * 
     * Suma los miembros nuevos al subrango de edad más avanzada (rangoEdad5),
     * típicamente utilizado para el grupo 85-115 donde los miembros se acumulan
     * sin ser desplazados a otro grupo superior.
     * 
     * También actualiza los totales del grupo después de la acumulación.
     *
     * @param nuevosMiembros Objeto con la cantidad de hombres y mujeres a acumular.
     */
    acumularMiembrosMasAncianos(nuevosMiembros: Miembros): void {
        this.rangoEdad5.cantHombres += nuevosMiembros.cantHombres;
        this.rangoEdad5.cantMujeres += nuevosMiembros.cantMujeres;
        this.actualizarTotales();
    }

    /**
     * Aplica la tasa de mortalidad del grupo a todos los subrangos etarios.
     *
     * Reduce la cantidad de hombres y mujeres en cada subrango (rangoEdad1 a rangoEdad5)
     * en proporción a la `tasaMortalidad` del grupo. El resultado se redondea al entero más
     * cercano. Actualiza los totales del grupo al finalizar.
     *
     * La misma tasa de mortalidad se aplica uniformemente a todos los subrangos del grupo,
     * independientemente de la edad específica dentro del rango.
     */
    eliminarMiembrosPorMortalidad(): void {
        this.rangoEdad1.cantHombres -= Math.round(this.rangoEdad1.cantHombres * this.tasaMortalidad);
        this.rangoEdad1.cantMujeres -= Math.round(this.rangoEdad1.cantMujeres * this.tasaMortalidad);

        this.rangoEdad2.cantHombres -= Math.round(this.rangoEdad2.cantHombres * this.tasaMortalidad);
        this.rangoEdad2.cantMujeres -= Math.round(this.rangoEdad2.cantMujeres * this.tasaMortalidad);

        this.rangoEdad3.cantHombres -= Math.round(this.rangoEdad3.cantHombres * this.tasaMortalidad);
        this.rangoEdad3.cantMujeres -= Math.round(this.rangoEdad3.cantMujeres * this.tasaMortalidad);
        
        this.rangoEdad4.cantHombres -= Math.round(this.rangoEdad4.cantHombres * this.tasaMortalidad);
        this.rangoEdad4.cantMujeres -= Math.round(this.rangoEdad4.cantMujeres * this.tasaMortalidad);

        this.rangoEdad5.cantHombres -= Math.round(this.rangoEdad5.cantHombres * this.tasaMortalidad);
        this.rangoEdad5.cantMujeres -= Math.round(this.rangoEdad5.cantMujeres * this.tasaMortalidad);
        this.actualizarTotales();
    }


    private actualizarTotales(): void {
        this.cantHombres =
            this.rangoEdad1.cantHombres +
            this.rangoEdad2.cantHombres +
            this.rangoEdad3.cantHombres +
            this.rangoEdad4.cantHombres +
            this.rangoEdad5.cantHombres;

        this.cantMujeres =
            this.rangoEdad1.cantMujeres +
            this.rangoEdad2.cantMujeres +
            this.rangoEdad3.cantMujeres +
            this.rangoEdad4.cantMujeres +
            this.rangoEdad5.cantMujeres;
    }
}