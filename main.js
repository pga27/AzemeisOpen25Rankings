
function buildTable(sorted, containerElement, events, type) {
    const table = document.createElement("table");
    table.className = "w-full table-fixed border border-gray-300 shadow-md rounded text-sm text-left";


    const scrollWrapper = document.createElement("div");
    scrollWrapper.className = "overflow-x-auto w-full";
    scrollWrapper.appendChild(table);

    const headers = ["Nome", "País", "Eventos", "Soma de tempos", "Página WCA"];
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    headers.forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        th.className = "px-4 py-2 bg-gray-200 border-b text-left font-semibold text-gray-700";
        headerRow.appendChild(th);
    });

    const tbody = table.createTBody();

    sorted.forEach((competitor, index) => {
        const row = tbody.insertRow();

        // Highlight top 3
        if (index === 0) row.className = "bg-yellow-200 font-semibold cursor-pointer";
        else if (index === 1) row.className = "bg-gray-200 font-semibold cursor-pointer";
        else if (index === 2) row.className = "bg-amber-300 font-semibold cursor-pointer";
        else row.className = index % 2 === 0 ? "bg-white cursor-pointer" : "bg-gray-50 cursor-pointer";
        const timeMinutes = Math.floor(competitor.totalSum / 6000);
        const timeSeconds = ((competitor.totalSum % 6000) / 100).toFixed(2).padStart(5, '0');
        const formattedTime = `${timeMinutes}:${timeSeconds}`;

        const nameCell = row.insertCell();
        nameCell.textContent = competitor.name;
        nameCell.className = "px-4 py-2 border-b text-blue-700";

        const countryCell = row.insertCell();
        countryCell.innerHTML = `<span class="inline-block" id="flag-${index}"></span>`;
        countryCell.className = "px-4 py-2 border-b countryFlag";
        countryCell.id = `flag-${index}`;


        const eventsCell = row.insertCell();
        eventsCell.textContent = competitor.totalEvents + ` / ${events.length} `;
        eventsCell.className = "px-4 py-2 border-b";

        const timeCell = row.insertCell();
        timeCell.textContent = formattedTime;
        timeCell.className = "px-4 py-2 border-b";

        const wcaCell = row.insertCell();
        wcaCell.className = "px-4 py-2 border-b";
        wcaCell.innerHTML = `<a href = "https://www.worldcubeassociation.org/persons/${competitor.wcaID}" target = "_blank" class="text-blue-700 hover:underline" >
            <img src='./logo_wca.png' class="w-6 h-6">
            </a>`;

        // Detail row
        const detailRow = tbody.insertRow();
        const detailCell = detailRow.insertCell();
        detailCell.colSpan = 5;
        detailCell.className = "px-4 py-2 border-b bg-gray-100 hidden";
        detailRow.classList.add("hidden");

        // Event boxes
        const eventBoxes = Object.entries(competitor)
            .filter(([k]) => events.includes(k))
            .map(([eventId, time]) => `
                <div class="flex items-center gap-2 p-2 border rounded shadow-sm bg-white" >
                    <img src="images_cropped/${eventId}.png" alt="${eventId}" class="w-6 h-6" />
                    <span class="text-sm font-medium">Best: ${transformTime(time, eventId)}</span>
                </div >
            `).join('');

        const detailsWrapper = document.createElement("div");
        detailsWrapper.className = "text-gray-800";

        const flagSpan = document.createElement("span");
        flagSpan.textContent = getFlagEmoji(competitor.country);

        detailsWrapper.innerHTML = `
            <p> <strong>WCA ID:</strong> ${competitor.wcaID || '—'}</p >
            <p><strong>Total Events:</strong> ${competitor.totalEvents} / ${events.length}</p>
            <div class="mt-4 space-y-2">
                <p class="font-semibold mb-2">Best Results:</p>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    ${eventBoxes}
                </div>
            </div>
        `;
        detailCell.appendChild(detailsWrapper);

        // Render emoji correctly
        setTimeout(() => {
            const flagContainer = document.getElementById(`flag-${index}`);
            if (flagContainer) flagContainer.textContent = getFlagEmoji(competitor.country);
        }, 0);

        // Toggle logic
        row.addEventListener("click", () => {
            const expanded = !detailRow.classList.contains("hidden");
            detailRow.classList.toggle("hidden", expanded);
            detailCell.classList.toggle("hidden", expanded);
        });
    });

    // Wrap and attach table
    const wrapper = document.createElement("div");
    wrapper.className = "p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-4xl mx-auto";

    const heading = document.createElement("h2");
    let headerVal = '';
    if (type == "psychSheet") headerVal = 'Melhores Resultados';
    if (type == "results") headerVal = 'Resultados em Direto';
    heading.textContent = "Azeméis Open 2025: " + headerVal;
    heading.className = "text-2xl font-bold mb-4 text-gray-800";
    wrapper.appendChild(heading);
    wrapper.appendChild(scrollWrapper);
    containerElement.innerHTML = "";
    containerElement.appendChild(wrapper);
}


function getFlagEmoji(countryCode) {
    if (!countryCode) return "";
    return countryCode
        .toUpperCase()
        .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt()));
}

function decodeMBLDTime(num) {
    const seconds = Math.floor(num / 100) % 10000;
    const tmp = Math.floor(num / 10000000);
    const missed = num % 100;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${99 - tmp + missed}/${99 - tmp + missed + missed} (${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')})`;
    }
    return `${99 - tmp + missed}/${99 - tmp + missed + missed} (${minutes}:${remainingSeconds.toString().padStart(2, '0')})`;
}

function MBLDTimeInSeconds(num) {
    return (Math.floor(num / 100) % 10000) * 100;
}

function transformTime(time, eventId) {
    if (eventId == '333mbf') return decodeMBLDTime(time);
    if (!time) return "—";
    if (time < 1000) {
        const seconds = ((time % 6000) / 100).toFixed(2).padStart(4, '0');
        return `${seconds}`;
    } else if (time < 6000) {
        const seconds = ((time % 6000) / 100).toFixed(2).padStart(5, '0');
        return `${seconds}`;
    } else {
        const minutes = Math.floor(time / 6000);
        const seconds = ((time % 6000) / 100).toFixed(2).padStart(5, '0');
        return `${minutes}:${seconds}`;
    }

}
function buildPsychSheet(data, table) {
    events = [];
    data.events.forEach(element => {
        events.push(element.id);
    });
    // Build a list of competitors with their sum of best averages for each event
    const competitors = [];
    for (const person of data.persons) {
        if (!person.registrantId) continue;
        let competitor = {
            name: person.name,
            wcaID: person.wcaId,
            country: person.countryIso2,
            totalSum: 0,
            totalEvents: 0
        };
        for (const result of person.personalBests) {
            if (person.registration.eventIds.includes(result.eventId) && result.type == "average") {
                competitor.totalSum += result.best;
                competitor[result.eventId] = result.best;
                competitor.totalEvents++;
            }
        }
        if (competitor.totalEvents > 0) {
            competitors.push(competitor);
        }
    }
    competitors.sort((a, b) => {
        if (b.totalEvents !== a.totalEvents) {
            return b.totalEvents - a.totalEvents;
        }
        return a.totalSum - b.totalSum;
    });
    buildTable(competitors, table, events, 'psychSheet');
}

function calculateRankings(data, table) {
    sumOfSingles = {}
    if (data.error) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = "bg-white bg-opacity-90 p-6 rounded-xl shadow-lg max-w-xl";

        const text = document.createElement('h2');
        text.className = "text-2xl font-bold text-gray-800 text-center";
        text.textContent = `Mais informações em breve...`;
        const lineBrak = document.createElement('br');
        const text2 = document.createElement('h2');
        text2.className = "text-2xl font-bold text-gray-800 text-center";
        text2.textContent = `More information soon...`;

        messageWrapper.appendChild(text);
        messageWrapper.appendChild(lineBrak);
        messageWrapper.appendChild(text2);

        table.innerHTML = "";

        // Center the wrapper inside the table container
        table.style.display = "flex";
        table.style.justifyContent = "center";
        table.style.alignItems = "center";
        table.style.minHeight = "60vh";
        table.style.textAlign = "center";

        table.appendChild(messageWrapper);
        return;
    }
    let today = new Date().getTime();
    if (new Date(data.registrationInfo.openTime.split('T')[0]) > today) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = "bg-white bg-opacity-90 p-6 rounded-xl shadow-lg max-w-xl";

        const text = document.createElement('h2');
        text.className = "text-2xl font-bold text-gray-800 text-center";
        text.textContent = `O registo da competição ainda não abriu. Volta dia ${data.registrationInfo.openTime.split('T')[0]}.`;
        const lineBrak = document.createElement('br');
        const text2 = document.createElement('h2');
        text2.className = "text-2xl font-bold text-gray-800 text-center";
        text2.textContent = `The registration for the competition hasn't opened yet. Come back on ${data.registrationInfo.openTime.split('T')[0]}.`;

        messageWrapper.appendChild(text);
        messageWrapper.appendChild(lineBrak);
        messageWrapper.appendChild(text2);

        table.innerHTML = "";

        // Center the wrapper inside the table container
        table.style.display = "flex";
        table.style.justifyContent = "center";
        table.style.alignItems = "center";
        table.style.minHeight = "60vh";
        table.style.textAlign = "center";

        table.appendChild(messageWrapper);
        return;
    }

    if (new Date(data.schedule.startDate) > today) {
        alert(`A competição começa no dia ${data.schedule.startDate}. Podes consultar os resultados atuais dos competidores inscritos.}`);
        buildPsychSheet(data, table);
        return;
    }
    persons = data.persons;

    for (let person of persons) {
        if (person.registrantId != null) {
            sumOfSingles[person.registrantId] = {
                'name': person.name,
                'wcaID': person.wcaId,
                'country': person.countryIso2
            }
        }
    }
    for (let event of data.events) {
        for (let round of event.rounds) {
            for (let result of round.results) {
                if (event.id in sumOfSingles[result.personId]) {
                    if (sumOfSingles[result.personId][event.id] > result.average && result.average > 0) {
                        sumOfSingles[result.personId][event.id] = result.average;
                    }
                } else {
                    if (result.average > 0) {
                        sumOfSingles[result.personId][event.id] = result.average;
                    }
                }
            }
        }
    }

    events = [];
    data.events.forEach(element => {
        events.push(element.id);
    });
    // Calculate the sum of results for each person across all events
    ranking = {};
    for (let personId in sumOfSingles) {
        let totalSum = 0;
        let eventCount = 0;
        for (let eventId of events) {
            if (sumOfSingles[personId][eventId] != null) {
                if (eventId == '333mbf') {
                    totalSum += MBLDTimeInSeconds(sumOfSingles[personId][eventId]);
                } else if (eventId == '333fm') {
                    eventCount++;
                    continue;
                } else {
                    totalSum += sumOfSingles[personId][eventId];
                }
                eventCount++;
            }
        }
        if (totalSum == 0) {
            delete sumOfSingles[personId];
        } else {
            sumOfSingles[personId]['totalSum'] = totalSum;
            sumOfSingles[personId]['totalEvents'] = eventCount;
            ranking.personId = totalSum;
        }
    }

    sortedSumOfSingles = Object.values(sumOfSingles).sort(function sortFunction(a, b) {
        if (b.totalEvents - a.totalEvents != 0) {
            return b.totalEvents - a.totalEvents;
        } else {
            return a.totalSum - b.totalSum;
        }
    });

    buildTable(sortedSumOfSingles, table, events, 'results');

}

async function getWCIF(table) {
    return await fetch(`https://www.worldcubeassociation.org/api/v0/competitions/AzemeisOpen2025/wcif/public`)
        .then(response => response.json())
        .then(data => calculateRankings(data, table))
        .catch(error => console.error('Error fetching WCIF:', error));
}