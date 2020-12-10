import {TheSkeldRooms} from "./maps/TheSkeld";
import * as fs from 'fs';

/**
 * Represents a path between two rooms.
 *
 * We don't need to know the destination since we will store
 * the interface in an array where the index represents
 * the destination
 */
export interface IPath {
    [id : number]: number,
    from: number,
    totalDistance: number
}

/**
 * Represents a 2D Points
 */
export interface ICoordinate {
    [id : number]: number,
    x: number,
    y: number,
}

/**
 * Represents a room in a map.
 *
 * Note : polygon is an array of points which should
 * contains the represented rooms to avoid wrong
 * sound estimation.
 */
export interface IRoom {
    [id : number]: number,
    name: string,
    linkedRoom: number[],
    center: ICoordinate,
    polygon: ICoordinate[],
}

/**
 * Determine the distance between two points
 * @param position1
 * @param position2
 */
function distanceBetweenTwoPoints(position1 : ICoordinate, position2 : ICoordinate) : number {
    return Math.sqrt(Math.pow(position1.x - position2.x, 2) + Math.pow(position1.y - position2.y, 2));
}

/**
 * This code isn't optimised, only use it to make value table.
 *
 */
class Dijkstra {
    map : IRoom[];
    remainingNode : number[];
    visitedNode : boolean[];
    bestPath : IPath[];
    origin : number
    fileResult : string;

    constructor(map : IRoom[]) {
        this.map = map;
        this.origin = 0;
        this.remainingNode = Array<number>(map.length);

        for (let i = 0; i < map.length; ++i) {
            this.remainingNode[i] = i;
        }

        this.visitedNode = Array<boolean>(map.length);
        for (let i = 0; i < map.length; ++i) {
            this.visitedNode[i] = false;
        }

        this.bestPath = Array<IPath>(map.length);
        for (let i = 0; i < map.length; ++i) {
            this.bestPath[i] = {from: -1, totalDistance: 100}
        }

        this.bestPath[0] = {from: 0, totalDistance: 0}
        this.fileResult = "";
    }

    reset(origin : number) {
        this.remainingNode = Array<number>(this.map.length);

        for (let i = 0; i < this.map.length; ++i) {
            this.remainingNode[i] = i;
        }

        this.visitedNode = Array<boolean>(this.map.length);
        for (let i = 0; i < this.map.length; ++i) {
            this.visitedNode[i] = false;
        }

        this.bestPath = Array<IPath>(this.map.length);
        for (let i = 0; i < this.map.length; ++i) {
            this.bestPath[i] = {from: -1, totalDistance: 100}
        }

        this.bestPath[origin] = {from: origin, totalDistance: 0};
        this.origin = origin;
    }

    /**
     * Returns the distance between the two node
     * @param s1 Index of the first node
     * @param s2 Index of the second node
     */
    distanceBetweenNode(s1 : number, s2 : number) {
        return distanceBetweenTwoPoints(this.map[s1].center, this.map[s2].center);
    }

    /**
     * Returns the closest room in remaining nodes.
     */
    findMin() : number {
        let minDist = 100;
        let minNode = -1;
        for (let node of this.remainingNode) {
            if (this.bestPath[node].totalDistance < minDist) {
                minDist = this.bestPath[node].totalDistance;
                minNode = node;
            }
        }
        return minNode;
    }

    /**
     * Returns the intersection between adjacent nodes of "node" and remaining nodes.
     * @param node
     */
    intersection(node : number) : number[] {
        return this.map[node].linkedRoom.filter(value => this.remainingNode.indexOf(value) != -1);
    }

    /**
     * Determine each best path from an origin.
     */
    solve() {
        while (this.remainingNode.length !== 0) {
            let s1 = this.findMin();
            this.remainingNode.splice(this.remainingNode.indexOf(s1), 1);
            this.visitedNode[s1] = true;
            let intersection = this.intersection(s1)
            for (let s2 of this.intersection(s1)) {
                let distance : number = this.bestPath[s1].totalDistance + this.distanceBetweenNode(s1, s2);
                if (this.bestPath[s2].totalDistance > distance) {
                    this.bestPath[s2] = {from: s1, totalDistance: distance};
                }
            }
        }

        this.fileResult += "{\n";
        for (let path of this.bestPath) {
            this.fileResult += "\t{from: " + path.from + ", totalDistance: " + path.totalDistance + "}\n";
        }
        this.fileResult += "},\n";
    }

    /**
     * Run the simulation from each rooms, and create a file with all paths.
     */
    run() {
        for (let i = 0; i < this.map.length; ++i) {
            console.log("Determining each best path from " + i);
            this.reset(i);
            this.solve();
        }
        fs.writeFile('BestPath.txt', this.fileResult, err => {
            return;
        });
        console.log("Each best path has been determined and inserted into the text file : ./BestPath.txt ");
    }
}

let dijSolver = new Dijkstra(TheSkeldRooms);
dijSolver.run();