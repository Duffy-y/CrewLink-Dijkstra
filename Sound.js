"use strict";
exports.__esModule = true;
var TheSkeld_1 = require("./maps/TheSkeld");
var fs = require("fs");
/**
 * Determine the distance between two points
 * @param position1
 * @param position2
 */
function distanceBetweenTwoPoints(position1, position2) {
    return Math.sqrt(Math.pow(position1.x - position2.x, 2) + Math.pow(position1.y - position2.y, 2));
}
/**
 * This code isn't optimised, only use it to make value table.
 *
 */
var Dijkstra = /** @class */ (function () {
    function Dijkstra(map) {
        this.map = map;
        this.origin = 0;
        this.remainingNode = Array(map.length);
        for (var i = 0; i < map.length; ++i) {
            this.remainingNode[i] = i;
        }
        this.visitedNode = Array(map.length);
        for (var i = 0; i < map.length; ++i) {
            this.visitedNode[i] = false;
        }
        this.bestPath = Array(map.length);
        for (var i = 0; i < map.length; ++i) {
            this.bestPath[i] = { from: -1, totalDistance: 100 };
        }
        this.bestPath[0] = { from: 0, totalDistance: 0 };
        this.fileResult = "";
    }
    Dijkstra.prototype.reset = function (origin) {
        this.remainingNode = Array(this.map.length);
        for (var i = 0; i < this.map.length; ++i) {
            this.remainingNode[i] = i;
        }
        this.visitedNode = Array(this.map.length);
        for (var i = 0; i < this.map.length; ++i) {
            this.visitedNode[i] = false;
        }
        this.bestPath = Array(this.map.length);
        for (var i = 0; i < this.map.length; ++i) {
            this.bestPath[i] = { from: -1, totalDistance: 100 };
        }
        this.bestPath[origin] = { from: origin, totalDistance: 0 };
        this.origin = origin;
    };
    /**
     * Returns the distance between the two node
     * @param s1 Index of the first node
     * @param s2 Index of the second node
     */
    Dijkstra.prototype.distanceBetweenNode = function (s1, s2) {
        return distanceBetweenTwoPoints(this.map[s1].center, this.map[s2].center);
    };
    /**
     * Returns the closest room in remaining nodes.
     */
    Dijkstra.prototype.findMin = function () {
        var minDist = 100;
        var minNode = -1;
        for (var _i = 0, _a = this.remainingNode; _i < _a.length; _i++) {
            var node = _a[_i];
            if (this.bestPath[node].totalDistance < minDist) {
                minDist = this.bestPath[node].totalDistance;
                minNode = node;
            }
        }
        return minNode;
    };
    /**
     * Returns the intersection between adjacent nodes of "node" and remaining nodes.
     * @param node
     */
    Dijkstra.prototype.intersection = function (node) {
        var _this = this;
        return this.map[node].linkedRoom.filter(function (value) { return _this.remainingNode.indexOf(value) != -1; });
    };
    /**
     * Determine each best path from an origin.
     */
    Dijkstra.prototype.solve = function () {
        while (this.remainingNode.length !== 0) {
            var s1 = this.findMin();
            this.remainingNode.splice(this.remainingNode.indexOf(s1), 1);
            this.visitedNode[s1] = true;
            var intersection = this.intersection(s1);
            for (var _i = 0, _a = this.intersection(s1); _i < _a.length; _i++) {
                var s2 = _a[_i];
                var distance = this.bestPath[s1].totalDistance + this.distanceBetweenNode(s1, s2);
                if (this.bestPath[s2].totalDistance > distance) {
                    this.bestPath[s2] = { from: s1, totalDistance: distance };
                }
            }
        }
        this.fileResult += "{\n";
        for (var _b = 0, _c = this.bestPath; _b < _c.length; _b++) {
            var path = _c[_b];
            this.fileResult += "\t{from: " + path.from + ", totalDistance: " + path.totalDistance + "}\n";
        }
        this.fileResult += "},\n";
    };
    /**
     * Run the simulation from each rooms, and create a file with all paths.
     */
    Dijkstra.prototype.run = function () {
        for (var i = 0; i < this.map.length; ++i) {
            console.log("Determining each best path from " + i);
            this.reset(i);
            this.solve();
        }
        fs.writeFile('BestPath.txt', this.fileResult, function (err) {
            return;
        });
        console.log("Each best path has been determined and inserted into the text file : ./BestPath.txt ");
    };
    return Dijkstra;
}());
var dijSolver = new Dijkstra(TheSkeld_1.TheSkeldRooms);
dijSolver.run();
