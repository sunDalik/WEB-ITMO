<template>
    <div class="gamePage">
        <div class="labGrid">
            <div class="grid--exit">
                <router-link to="MainMenu" class="exitButton">
                    Main Menu
                </router-link>
            </div>
            <div class="grid--graph flexColumn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" class="mainPracticeGraph"
                     @click="addDotFromGraph" id="mainGraph">
                    <g stroke="white" stroke-width="2px">
                        <!-- axis -->
                        <path d="M 0 200 h 400"></path>
                        <path d="M 200 0 v 400"></path>
                        <!-- arrows -->
                        <path d="M 200 0 l -4 7"></path>
                        <path d="M 200 0 l 4 7"></path>
                        <path d="M 400 200 l -7 -4"></path>
                        <path d="M 400 200 l -7 4"></path>
                        <!-- frame -->
                        <path d="M 0 0 h 50"></path>
                        <path d="M 0 0 v 50"></path>
                        <path d="M 400 0 h -50"></path>
                        <path d="M 400 0 v 50"></path>
                        <path d="M 0 400 h 50"></path>
                        <path d="M 0 400 v -50"></path>
                        <path d="M 400 400 h -50"></path>
                        <path d="M 400 400 v -50"></path>
                    </g>
                    <g stroke="black" fill="white" stroke-width="2px">
                        <path d="M 200 200 h -160 v -80 h 160 Z"></path>
                        <path d="M 200 200 v -80 q 80 0 80 80 Z"></path>
                        <path d="M 200 200 v 80 l -160 -80 Z"></path>
                    </g>
                    <g stroke="white" fill="white" font-size="22px">
                        <text x="32" y="225">R</text>
                        <text x="265" y="225">R/2</text>
                        <text x="150" y="110">R/2</text>
                        <text x="210" y="285">R/2</text>
                    </g>
                    <g id="graphDots"></g>
                </svg>
            </div>
            <GraphPanel id="panel" :message="message" @change-r="setR" @add-data="addDotFromPanel"
                        @erase-data="removeAllDots"/>
            <div class="historyTable">
                <table>
                    <thead>
                    <tr>
                        <td>
                            R
                        </td>
                        <td>
                            X
                        </td>
                        <td>
                            Y
                        </td>
                        <td>
                            FIGURA
                        </td>
                        <td>
                            TIME
                        </td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(result,i) in results" v-bind:key="i">
                        <td>
                            {{result.r}}
                        </td>
                        <td>
                            {{result.x}}
                        </td>
                        <td>
                            {{result.y}}
                        </td>
                        <td>
                            <span v-if="result.figura">Present</span>
                            <span v-else>Absent</span>
                        </td>
                        <td>
                            {{result.time}}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
    import GraphPanel from "../components/GraphPanel";
    import {postSetDot, getLabDots, postEraseDots, getRecomputeDots} from "../api";

    export default {
        name: "LabMode",
        components: {GraphPanel},
        data: function () {
            return {
                r: null,
                results: [],
                message: ""
            }
        },
        async mounted() {
            const response = await getLabDots();
            if (response == null) return; //надо ли?????
            response.forEach(dot => {
                this.addDot(dot.r, dot.x, dot.y, dot.hit, dot.time, true);
            });
        },
        methods: {
            async setR({r}) {
                if (r == null || this.r === "" || r < 1 || r > 5) {
                    this.message = "Invalid R";
                    return;
                }
                this.r = r;
                this.message = "";
                let graphDots = document.getElementById("graphDots");
                while (graphDots.firstChild) {
                    graphDots.removeChild(graphDots.firstChild);
                }
                const response = await getRecomputeDots(r);
                if (response == null) return;
                response.forEach(dot => {
                    this.addDot(r, dot.x, dot.y, dot.hit, false)
                })
            },
            async addDotFromPanel({x, y}) {
                if (this.r == null || this.r === "" || this.r < 1 || this.r > 5) {
                    this.message = "Invalid R";
                    return;
                }
                if (x == null || x === "" || x < -5 || x > 3) {
                    this.message = "Invalid X";
                    return;
                }
                if (y == null || y === "" || y < -3 || y > 3) {
                    this.message = "Invalid Y";
                    return;
                }
                this.message = "";
                const response = await postSetDot(parseFloat(x), parseFloat(y), parseFloat(this.r));
                await this.addDot(response.r, response.x, response.y, response.figura, response.time, true);
            },
            async addDotFromGraph(e) {
                if (this.r == null || this.r < 1 || this.r > 5) {
                    this.message = "Invalid R";
                    return;
                }
                let pt = document.getElementById('mainGraph').createSVGPoint();
                pt.x = e.clientX;
                pt.y = e.clientY;
                let cursorpt = pt.matrixTransform(document.getElementById('mainGraph').getScreenCTM().inverse());
                const x = (cursorpt.x - 200) / 160 * this.r;
                const y = -(cursorpt.y - 200) / 160 * this.r;
                const response = await postSetDot(parseFloat(x), parseFloat(y), parseFloat(this.r));
                await this.addDot(response.r, response.x, response.y, response.figura, response.time, true);
            },
            async addDot(r, x, y, figura, time, ifAddToTable) {
                const graphX = x * 160 / r + 200;
                const graphY = -y * 160 / r + 200;
                const circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
                circle.setAttributeNS(null, 'cx', graphX);
                circle.setAttributeNS(null, 'cy', graphY);
                circle.setAttributeNS(null, 'r', '3');
                if (figura) {
                    circle.setAttributeNS(null, 'style', 'fill: black; stroke: white; stroke-width: 1px;');
                } else {
                    circle.setAttributeNS(null, 'style', 'fill: white; stroke: black; stroke-width: 1px;');
                }
                document.getElementById("graphDots").appendChild(circle);
                if (ifAddToTable) this.results.push({r: r, x: x, y: y, figura: figura, time: time});
            },
            async removeAllDots() {
                if (await postEraseDots()) {
                    this.results = [];
                    let graphDots = document.getElementById("graphDots");
                    while (graphDots.firstChild) {
                        graphDots.removeChild(graphDots.firstChild);
                    }
                }
            }
        }
    }
</script>

<style scoped>
    .labGrid {
        display: grid;
        padding: 10px 20px;
        height: 100vh;
        grid-row-gap: 40px;
        grid-column-gap: 20px;
        grid: "exit nothing1 nothing2 nothing3" 50px "nothing0 graph graphPanel nothing3" calc(30vh + 100px) "nothing0 graphTable graphTable nothing3" auto;
        grid-template-columns: 6fr 10fr 10fr 6fr;
        box-sizing: border-box;
    }

    .exitButton {
        text-decoration: none;
        color: white;
        font-size: 20px;
    }

    .exitButton:hover {
        cursor: pointer;
        text-decoration: underline;
    }

    .grid--graph {
        grid-area: graph;
        user-select: none;
    }

    .grid--exit {
        grid-area: exit;
    }

    .mainPracticeGraph {
        cursor: pointer;
    }

    .historyTable {
        grid-area: graphTable;
    }

    table {
        border-radius: 10px;
        text-align: center;
        background: white;
        width: 95%;
        margin: 0 auto;
        border-collapse: collapse;
    }

    thead {
        border-bottom: 2px solid black;
    }

    td {
        padding: 4px 7px;
        border-right: 2px solid black;
    }

    td:last-child {
        border: none;
    }

    @media (max-width: 1200px) {
        .labGrid {
            grid: "exit exit nothing2 nothing3" 50px "nothing0 graph graphPanel nothing3" calc(30vh + 100px) "nothing0 graphTable graphTable nothing3" auto;
            grid-template-columns: 2fr 7fr 7fr 1fr;
            grid-column-gap: 15px;
            grid-row-gap: 30px;
        }

        .grid--exit {
            text-align: left;
            margin-top: 10px;
        }

        .exitButton {
            font-size: 25px;
        }
    }

    @media (max-width: 1055px) {
        .labGrid {
            grid: "exit exit nothing2 nothing3" 50px "nothing0 graph graphPanel nothing3" calc(30vh + 100px) "graphTable graphTable graphTable graphTable" auto;
            grid-template-columns: 0.5fr 7fr 4fr 0.5fr;
            grid-column-gap: 30px;
            grid-row-gap: 30px;
        }

        .grid--exit {
            text-align: left;
            margin-top: 10px;
        }

        .exitButton {
            font-size: 25px;
        }
    }

    @media (max-width: 850px) {
        .labGrid {
            grid-template-rows: 50px calc(35vh + 100px) auto;
            grid-column-gap: 20px;
            grid-row-gap: 20px;
            grid-template-columns: 0 10fr 7fr 0;
        }

        .exitButton {
            font-size: 25px;
            border: 2px solid white;
            padding: 3px 15px;
        }

        .exitButton:hover {
            text-decoration: none;
            color: black;
            background: white;
        }
    }

    @media (max-width: 700px) {
        .labGrid {
            grid: "exit" 50px "graph" calc(30vh + 100px) "graphPanel" auto "graphTable" auto;
            grid-row-gap: 15px;
            grid-column-gap: 0;
            padding: 0;
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 420px) {
        .labGrid {
            grid: "exit" 50px "graph" calc(25vh + 100px) "graphPanel" auto "graphTable" auto;
        }
    }

    @media (max-width: 380px) {
        .labGrid {
            grid: "exit" 50px "graph" calc(25vh) "graphPanel" auto "graphTable" auto;
        }
    }
</style>