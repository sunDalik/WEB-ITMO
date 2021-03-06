function post(url, body = '{}') {
    return fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
}

function get(url) {
    return fetch(url, {
        method: 'GET',
        credentials: 'same-origin'
    });
}

export async function postRegister(credentials) {
    const response = await post('/auth/register', credentials);
    const json = await response.json();
    return json.message;
}

export async function postLogin(username, password) {
    const response = await post('/auth/login?username=' + encodeURIComponent(username) + "&password=" + encodeURIComponent(password));
    if (response.status === 200) {
        return '200';
    } else if (response.status === 401) {
        return 'Incorrect username/password';
    }
}

export async function postSetDot(x, y, r) {
    const response = await post("/dotCheck", {x: x, y: y, r: r});
    const json = await response.json();
    return {r: json.r, x: json.x, y: json.y, figura: json.hit, time: json.time}
}

export async function getRecomputeDots(r) {
    const response = await get("/dotCheck/update/" + r);
    return await response.json();
}

export async function getLabDots() {
    const response = await get("/dotCheck/fetchResults");
    return await response.json();
}

export async function postEraseDots() {
    return await post("/dotCheck/clear");
}

export async function postStartPractice() {
    const response = await post("/pracCheck");
    return await response.json();
}

export async function postSetPracticeDot(x, y) {
    const response = await post("/pracCheck/checkDot", {x: x, y: y});
    const json = await response.json();
    return {x: json.x, y: json.y, figura: json.hit};
}

export async function postFinishPractice(graph) {
    return post("/pracCheck/getResult", graph);
}

export async function postStartCompetitive() {
    const response = await post("/compCheck");
    return await response.json();
}

export async function postSetCompetitiveDot(x, y) {
    const response = await post("/compCheck/checkDot", {x: x, y: y});
    const json = await response.json();
    return {x: json.x, y: json.y, figura: json.hit};
}

export async function postFinishCompetitive(graph) {
    return post("/compCheck/getResult", graph);
}

export async function getUserStats() {
    const response = await get("/leaderboards");
    return await response.json();
}

export async function getLeaderboardsPage(page) {
    const response = await get("/leaderboards/getLeaderboard/" + page);
    return await response.json();
}

export async function getPageCount() {
    const response = await get("/leaderboards/getPageCount");
    return await response.json();
}

export async function getAuth() {
    const response = await get('/username');
    if (response.status === 401) {
        return null
    } else return await response.text();
}