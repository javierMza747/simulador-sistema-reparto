import * as d3 from 'd3';

export interface Persona extends d3.SimulationNodeDatum {
    id: number;
    edad: number;
    level: number;
    color: string;
    peso: number;
}