var select_data = {
    "Melon": {
        "melon_top100": "Melon Top 100 차트",
        "melon_realtime": "Melon 실시간 차트",
        "melon_daily": "Melon 일간 차트",
        "melon_weekly": "Melon 주간 차트",
        "melon_monthly": "Melon 월간 차트",
        "melon_24hour": "Melon 24시간 이용자 수"
    },
    "Genie": {
        "genie_realtime": "Genie 실시간 차트",
        "genie_daily": "Genie 일간 차트"
    },
    "Flo": {
        "flo_24hour": "Flo 24시간 차트"
    },
    "Bugs": {
        "bugs_realtime": "Bugs 실시간 차트",
        "bugs_daily": "Bugs 일간 차트",
    },
    "Vibe": {
        "vibe_daily": "Vibe 일간 차트"
    },
    "Circle": {
        "circle_weekly": "Circle 주간 차트"
    }
};

var chart_options = {
    backgroundColor: 'transparent',
    width: '100%',
    height: '800',
    series: {
        0: { color: '#FCA7BC' }
    },
    chartArea: { width: '90%' },
    hAxis: {
        textPosition: 'bottom',
        textStyle: { color: 'white' },
        format: 'yyyy년 M월 d일 HH시',
        gridlines: {
            color: "transparent"
        }
    },
    vAxis: {
        textPosition: 'none',
        direction: '-1',
        minValue: 1,
        maxValue: 100,
        baselineColor: "#555555",
        gridlines: {
            count: 5,
            color: "#555555"
        }
    },
    lineWidth: 3,
    // pointSize: 5,
    legend: {
        position: 'bottom',
        textStyle: { color: 'white' }
    },
    tooltip: {
        format: 'yyyy년 M월 d일 HH시'
    },
};


function displayAlbumPanel(data) {
    const queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    urlParams.set('album', data.id);
    urlParams.delete('song');

    var nav = document.getElementsByTagName("nav")[0];
    var album_div = document.createElement("div");
    album_div.classList.add("album")
    album_div.id = data.id;
    album_div.onclick = function () { openPage(urlParams.toString()) };
    var album_img = document.createElement("img");
    album_img.setAttribute("src", data.image_url);
    album_img.setAttribute("alt", data.album);
    var album_title = document.createElement("div");
    album_title.classList.add("album_title");
    album_title.innerHTML = data.album;
    var album_artist = document.createElement("div");
    album_artist.classList.add("album_artist");
    album_artist.innerHTML = data.artist;
    var album_release = document.createElement("div");
    album_release.classList.add("album_release");
    album_release.innerHTML = data.release_date;
    album_div.appendChild(album_img);
    album_div.appendChild(album_title);
    album_div.appendChild(album_artist);
    album_div.appendChild(album_release);
    nav.appendChild(album_div);
}

function loadPage() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    var chart_select = document.getElementById("chart_select");
    var select = document.createElement("select");
    select.onchange = function () { selectChart(this.selectedIndex) }

    for (var s in select_data) {
        var optgroup = document.createElement("optgroup");
        optgroup.label = s;

        for (var c in select_data[s]) {
            var option = document.createElement("option");
            option.value = c;
            option.text = select_data[s][c]
            if (urlParams.get("chart") == c) {
                option.selected = true;
            }
            optgroup.appendChild(option);
        }
        select.appendChild(optgroup);
    }

    chart_select.append(select);

    loadData(urlParams);
}

function loadData(urlParams) {
    fetch(location.origin + location.pathname + "data.json")
        .then((res) => res.json())
        .then((json) => {

            var album = urlParams.get('album');
            var song = urlParams.get('song');
            var chart = urlParams.get('chart');

            if (!album) {
                album = default_album;
            }

            for (var d of json.data) {
                displayAlbumPanel(d);
            }

            var selected_album = document.getElementById(album);
            selected_album.classList.add("selected");
            selected_album.scrollIntoView();

            var selected_data;
            var selected_song;

            for (var d of json.data) {
                if (d.id == album) {
                    var songs_div = document.getElementById("songs");
                    selected_data = d;

                    for (var s of d.songs) {
                        var song_div = document.createElement("div");
                        song_div.innerHTML = s.title;
                        song_div.id = s.json_id;

                        urlParams.set('song', s.json_id);

                        song_div.setAttribute("onclick", `openPage('${urlParams.toString()}')`);

                        if (s.json_id == song) {
                            song_div.classList.add("selected");
                            selected_song = s;
                        }

                        songs_div.appendChild(song_div);
                    }

                    if (!song) {
                        songs_div.firstChild.classList.add("selected");
                        selected_song = d.songs[0];
                    }
                }
            }

            var header = document.getElementsByTagName("header")[0];
            var header_div = document.createElement("div");
            header_div.id = "header_cover";
            header.style.backgroundImage = `url('${selected_data.image_url}')`;
            header_div.innerHTML += "<div id='header_album'>" + selected_data.album + "</div>";
            header_div.innerHTML += "<div id='header_artist'>" + selected_data.artist + "</div>";
            header_div.innerHTML += "<div id='header_release'>" + selected_data.release_date + "</div>";
            header.prepend(header_div);

            if (!chart) {
                displayMelonTop100(selected_data.artist, selected_song);
            } else if (chart == "melon_top100") {
                displayMelonTop100(selected_data.artist, selected_song);
            } else if (chart == "melon_realtime") {
                displayMelonRealtime(selected_data.artist, selected_song);
            } else if (chart == "melon_daily") {
                displayMelonDaily(selected_data.artist, selected_song);
            }
        });
}

function selectChart(index) {
    var select_div = document.getElementById("chart_select");
    var select = select_div.getElementsByTagName("select")[0];
    var option = select.getElementsByTagName("option")[index];

    const queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    urlParams.set('chart', option.value);
    openPage(urlParams.toString());
}

function displayMelonTop100(artist, song) {
    fetch(location.origin + location.pathname + `backup/${song.json_id}_melon_top100.json`)
        .then((res) => res.json())
        .then((json) => {
            var table = document.createElement("table");
            table.id = "melon_top100";
            var header_tr = document.createElement("tr");
            var header_th_1 = document.createElement("th");
            header_th_1.innerHTML = "날짜/시";
            header_tr.appendChild(header_th_1);
            for (var i = 0; i < 24; i++) {
                var header_th = document.createElement("th");
                header_th.innerHTML = i;
                header_tr.appendChild(header_th);
            }
            table.appendChild(header_tr);

            var rows = [];

            for (var d of json.body.data) {
                var date = new Date(d.time);
                var dateFormat = `${date.getFullYear()}-${pad((date.getMonth() + 1), 2)}-${pad(date.getDate(), 2)}`;

                if (!table.getElementsByClassName(dateFormat)[0]) {
                    var tr = document.createElement("tr");
                    tr.classList.add(dateFormat);
                    var td_1 = document.createElement("td");
                    td_1.innerHTML = dateFormat;
                    tr.appendChild(td_1);

                    for (var i = 0; i < 24; i++) {
                        var td = document.createElement("td")
                        td.classList.add(`T${pad(i, 2)}:00:00`);
                        tr.appendChild(td);
                    }

                    table.appendChild(tr);
                }

                var tr = table.getElementsByClassName(dateFormat)[0];
                var td = tr.getElementsByClassName(`T${pad(date.getHours(), 2)}:00:00`)[0];

                if (d.ranking) {
                    td.innerHTML = d.ranking;
                    if (d.ranking == 1) {
                        td.classList.add("table_1");
                    } else if (d.ranking == 2) {
                        td.classList.add("table_2");
                    } else if (d.ranking == 3) {
                        td.classList.add("table_3");
                    } else if (d.ranking) {
                        if (d.ranking % 10 == 0) {
                            td.classList.add(`table_${d.ranking - 10}`);
                        } else {
                            var c = d.ranking - (d.ranking % 10);
                            td.classList.add(`table_${c}`);
                        }
                    }
                }

                var r = [];
                r.push(date);

                if (d.ranking) {
                    r.push(d.ranking);
                } else {
                    r.push(null);
                }
                rows.push(r);
            }

            var chartData = new google.visualization.DataTable();
            chartData.addColumn('date', 'Date');
            chartData.addColumn('number', `${artist} - ${song.title}`);
            chartData.addRows(rows);

            var table_div = document.getElementById("trend-table");
            table_div.appendChild(table);

            var title = document.createElement("div");
            title.classList.add("title");
            var h1 = document.createElement("h1");
            h1.innerHTML = "Melon TOP 100 차트 추이"
            title.appendChild(h1);
            var h2 = document.createElement("span");
            h2.innerHTML = "Last Update: " + json.body.data[json.body.data.length - 1].time
            title.appendChild(h2);
            table_div.prepend(title);

            var chart_div = document.getElementById('trend-chart');
            var chart = new google.visualization.LineChart(chart_div);
            chart.draw(chartData, chart_options);
        })
        .catch(function () {
            var table_div = document.getElementById("trend-table");
            var title = document.createElement("div");
            title.classList.add("title");
            var h1 = document.createElement("h1");
            h1.innerHTML = "Melon TOP 100 차트 추이"
            title.appendChild(h1);
            table_div.prepend(title);

            table_div.innerHTML += "<span>데이터 없음</span>";
        });
}

function displayMelonRealtime(artist, song) {
    fetch(location.origin + location.pathname + `backup/${song.json_id}_melon_realtime.json`)
        .then((res) => res.json())
        .then((json) => {
            var table = document.createElement("table");
            table.id = "melon_realtime";
            var header_tr = document.createElement("tr");
            var header_th_1 = document.createElement("th");
            header_th_1.innerHTML = "날짜/시";
            header_tr.appendChild(header_th_1);
            for (var i = 0; i < 24; i++) {
                var header_th = document.createElement("th");
                header_th.innerHTML = i;
                header_tr.appendChild(header_th);
            }
            table.appendChild(header_tr);

            var rows = [];

            for (var d of json.body.data) {
                var date = new Date(d.time);
                var dateFormat = `${date.getFullYear()}-${pad((date.getMonth() + 1), 2)}-${pad(date.getDate(), 2)}`;

                if (!table.getElementsByClassName(dateFormat)[0]) {
                    var tr = document.createElement("tr");
                    tr.classList.add(dateFormat);
                    var td_1 = document.createElement("td");
                    td_1.innerHTML = dateFormat;
                    tr.appendChild(td_1);

                    for (var i = 0; i < 24; i++) {
                        var td = document.createElement("td")
                        td.classList.add(`T${pad(i, 2)}:00:00`);
                        tr.appendChild(td);
                    }

                    table.appendChild(tr);
                }

                var tr = table.getElementsByClassName(dateFormat)[0];
                var td = tr.getElementsByClassName(`T${pad(date.getHours(), 2)}:00:00`)[0];

                if (d.ranking) {
                    td.innerHTML = d.ranking;
                    if (d.ranking == 1) {
                        td.classList.add("table_1");
                    } else if (d.ranking == 2) {
                        td.classList.add("table_2");
                    } else if (d.ranking == 3) {
                        td.classList.add("table_3");
                    } else if (d.ranking <= 100) {
                        if (d.ranking % 10 == 0) {
                            td.classList.add(`table_${d.ranking - 10}`);
                        } else {
                            var c = d.ranking - (d.ranking % 10);
                            td.classList.add(`table_${c}`);
                        }
                    } else {
                        td.classList.add("table_100");
                    }
                }

                var r = [];
                r.push(date);

                if (d.ranking) {
                    r.push(d.ranking);
                } else {
                    r.push(null);
                }
                rows.push(r);
            }

            var chartData = new google.visualization.DataTable();
            chartData.addColumn('date', 'Date');
            chartData.addColumn('number', `${artist} - ${song.title}`);
            chartData.addRows(rows);

            var table_div = document.getElementById("trend-table");
            table_div.appendChild(table);

            var title = document.createElement("div");
            title.classList.add("title");
            var h1 = document.createElement("h1");
            h1.innerHTML = "Melon 실시간 차트 추이"
            title.appendChild(h1);
            var h2 = document.createElement("span");
            h2.innerHTML = "Last Update: " + json.body.data[json.body.data.length - 1].time
            title.appendChild(h2);
            table_div.prepend(title);

            var chart_div = document.getElementById('trend-chart');
            var chart = new google.visualization.LineChart(chart_div);
            chart.draw(chartData, chart_options);
        })
        .catch(function () {
            var table_div = document.getElementById("trend-table");
            var title = document.createElement("div");
            title.classList.add("title");
            var h1 = document.createElement("h1");
            h1.innerHTML = "Melon 실시간 차트 추이"
            title.appendChild(h1);
            table_div.prepend(title);

            table_div.innerHTML += "<span>데이터 없음</span>";
        });
}

function displayMelonDaily(artist, song) {
    fetch(location.origin + location.pathname + `backup/${song.json_id}_melon_daily.json`)
        .then((res) => res.json())
        .then((json) => {
            var table = document.createElement("table");
            table.id = "melon_daily"
            var header_tr = document.createElement("tr");
            var header_th_1 = document.createElement("th");
            header_th_1.innerHTML = "날짜";
            var header_th_2 = document.createElement("th");
            header_th_2.innerHTML = "순위";
            var header_th_3 = document.createElement("th");
            header_th_3.innerHTML = "이용자수";
            var header_th_4 = document.createElement("th");
            header_th_4.innerHTML = "변화량";
            header_tr.append(header_th_1, header_th_2, header_th_3, header_th_4);
            table.appendChild(header_tr);

            var rows = [];
            var prev_count;

            for (var d of json.body.data) {
                var date = new Date(d.time);
                var dateFormat = `${date.getFullYear()}-${pad((date.getMonth() + 1), 2)}-${pad(date.getDate(), 2)}`;

                var tr = document.createElement("tr");
                var td_1 = document.createElement("td");
                td_1.innerHTML = dateFormat;
                if (date.getDay() == 6) {
                    td_1.style.color = "blue";
                } else if (date.getDay() == 0) {
                    td_1.style.color = "red";
                }
                var td_2 = document.createElement("td");
                td_2.innerHTML = d.ranking;
                var td_3 = document.createElement("td");
                td_3.innerHTML = d.count.toLocaleString('en-US');
                var td_4 = document.createElement("td");
                if (prev_count) {
                    var diff = d.count - prev_count;
                    if (diff > 0) {
                        td_4.innerHTML = "+" + diff.toLocaleString('en-US');
                        td_4.style.color = "red";
                    } else {
                        td_4.innerHTML = diff.toLocaleString('en-US');
                        td_4.style.color = "blue";
                    }
                }
                prev_count = d.count;
                tr.append(td_1, td_2, td_3, td_4);
                table.appendChild(tr);

                var r = [];
                r.push(date);

                if (d.ranking) {
                    r.push(d.ranking);
                } else {
                    r.push(null);
                }
                rows.push(r);
            }

            var chartData = new google.visualization.DataTable();
            chartData.addColumn('date', 'Date');
            chartData.addColumn('number', `${artist} - ${song.title}`);
            chartData.addRows(rows);

            var table_div = document.getElementById("trend-table");
            table_div.appendChild(table);

            var title = document.createElement("div");
            title.classList.add("title");
            var h1 = document.createElement("h1");
            h1.innerHTML = "Melon 일간 차트 추이"
            title.appendChild(h1);
            var h2 = document.createElement("span");
            h2.innerHTML = "Last Update: " + json.body.data[json.body.data.length - 1].time
            title.appendChild(h2);
            table_div.prepend(title);

            var chart_div = document.getElementById('trend-chart');
            var chart = new google.visualization.LineChart(chart_div);
            chart.draw(chartData, chart_options);
        })
        .catch(function () {
            var table_div = document.getElementById("trend-table");
            var title = document.createElement("div");
            title.classList.add("title");
            var h1 = document.createElement("h1");
            h1.innerHTML = "Melon 일간 차트 추이"
            title.appendChild(h1);
            table_div.prepend(title);

            table_div.innerHTML += "<span>데이터 없음</span>";
        });
}

function openPage(param) {
    var url = location.origin;
    if (param) {
        url += "?" + param;
    }
    location.href = url;
}

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}