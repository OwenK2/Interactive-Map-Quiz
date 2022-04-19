let map, highlighted = [];
let game = {}, settings = {};
let geometry = {}, countries = [], subregions = {}, regions = {}, nameToCode = {}, autocompleteCountries = [], capitalToCode = {}, autocompleteCapitals = [];
const transitionTime = 1000;

const defaultGame = {
    mode: 1,
    ended: true,
    modeData: {q: 'map', a: 'name', numQuestions: 4},
    includeIslands: true,
    maxZoom: 16,
    region: 'All',
    countryPool: [],
    answered: 0,
    correct: 0,
    history: []
};
const defaultSettings = {
    audio: true,
};
const defaultCountryStyle = {
    weight: 1,
    color: "black",
    fill: false,
    fillColor: "var(--accent)",
    fillOpacity: .3,
    interactive: false
};
const highlightedCountryStyle = {
    weight: 3,
    fillOpacity: .3,
    color: "var(--accent)",
    fill: true
};
const autocompleteOptions = {
    limit: 5,
    allowTypo: true,
    threshold: -10000,
};
const defaultMapOptions = {
    attributionControl: false,
    zoomControl: false,
    boxZoom: false,
    zoomDelta: .5,
    zoomSnap: .5,
    bounceAtZoomLimits: false,
    maxBoundsViscosity: .5,
    center: [43.06888777,-15.46875],
    zoom: 3,
    keyboard: false,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    touchZoom: true,
};


//Event Handlers
window.addEventListener('load', function() {
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('serviceWorker.js', {scope: '.'})
        .then(function (registration) {}, function (err) {
            console.error('PWA: ServiceWorker registration failed: ', err);
        });
    }

    //Collect countries and region data
    countries = Object.keys(countryData);
    countries.forEach(function(id) {
        if(!subregions[countryData[id].subregion]) {subregions[countryData[id].subregion] = [];}
        if(!regions[countryData[id].region]) {regions[countryData[id].region] = [];}
        subregions[countryData[id].subregion].push(id);
        regions[countryData[id].region].push(id);
        nameToCode[sanitizeFRAnswer(countryData[id].name)] = id;
        autocompleteCountries.push(fuzzysort.prepare(sanitizeFRAnswer(countryData[id].name)));
        capitalToCode[sanitizeFRAnswer(countryData[id].capital)] = id;
        autocompleteCapitals.push(fuzzysort.prepare(sanitizeFRAnswer(countryData[id].capital)));
    });
  
    settings = defaultSettings;
    setSettingElements();
    game = defaultGame;

    document.getElementById('region').value = game.region;
    document.getElementById('includeIslands').checked = game.includeIslands;
    document.getElementById('resumeGameBtn').style.display = game.ended ? 'none' : 'block';
    onResize()
});
if(window.visualViewport) {
    window.visualViewport.addEventListener('resize', onResize);
}
else {
    window.addEventListener('resize', onResize);
}
window.addEventListener('orientationchange', onResize);

function onResize(event) {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    if(window.visualViewport) {
        document.documentElement.style.height = document.body.style.height = window.visualViewport.height + "px";
    }
    else {
        document.documentElement.style.height = document.body.style.height = window.innerHeight + "px";
    }
    if(map) {map.invalidateSize();}
}

//General UI
function toScreen(screen) {
    var e = document.getElementById(screen);
    if(e) {
        document.querySelectorAll('.screen.visible').forEach(function(e) {
            e.classList.remove('visible');
        });
        if(screen === 'home') {
            document.getElementById('resumeGameBtn').style.display = game.ended ? 'none' : 'block';
        }
        else if(screen === 'inGameMenu') {
            setSummaryData();
        }
        e.classList.add('visible');
    }
}

//Game Setup
function onGameModeChange(value) {
    var e = document.getElementById('settingGroup_'+value);
    if(e) {
        document.querySelectorAll('.settingGroup.visible').forEach(function(e) {
            e.classList.remove('visible'); 
        });
        e.classList.add('visible');
    }
}
function onQuestionRadioChange(elem) {
    var checkAnother = false;
    var answerElems = document.getElementsByName(elem.name.split('_')[0] + '_answer');

    for(var i = 0;i < answerElems.length;++i) {
        if(elem.id.split('_')[2] === answerElems[i].id.split('_')[2]) {
            checkAnother = answerElems[i].checked;
            answerElems[i].disabled = true;
        }
        else {answerElems[i].disabled = false;}
    }
    if(checkAnother) {
        for(var i = 0;i < answerElems.length;++i) {
            if(!answerElems[i].disabled) {
                answerElems[i].checked = true;
                return;
            }
        }
    }
}

//Settings
function setSettingElements() {
    Object.keys(settings).forEach(function(key) {
        var e = document.getElementById('setting_' + key);
        if(e) {
            if(e.type === 'checkbox') {e.checked = settings[key];}
            else {e.value = settings[key];}
        }
    });
}
function onSettingsInput(elem) {
    var key = elem.id.split('_')[1] || null;
    if(key in settings) {
        if(elem.type === 'checkbox') {
            settings[key] = elem.checked;
        }
        else {
            settings[key] = elem.value;
        }
    }
}



//Game Functions
function newGame() {
    //Clean Up DOM
    deleteMap();
    document.querySelectorAll('.mc_answers').forEach(function(e) {e.remove();});
    document.getElementById('fr_answer').classList.remove('visible');
    document.getElementById('fr_suggestions').innerHTML = '';
    
    //Reset Game Object
    game.modeData = {},
    game.history = [];
    game.correct = 0;
    game.answered = 0;
    game.mode = parseInt(document.querySelector('[name="gameMode"]:checked').value);
    game.region = document.getElementById('region').value;
    game.includeIslands = document.getElementById('includeIslands').checked;
    game.ended = false;
    if(game.region in regions) {
        game.countryPool = regions[game.region].slice();
    }
    else {
        game.countryPool = countries.slice();
    }
    if(!game.includeIslands) {
        for(var i = 0;i < tinyIslands.length;++i) {
            var j = game.countryPool.indexOf(tinyIslands[i]);
            if(j > -1) {game.countryPool.splice(j, 1);}
        }
    }
    
    //Game Mode Specific Settings
    if(game.mode === 1) {
        game.modeData = {
            q: document.querySelector('[name="mc_question"]:checked').value,
            a: document.querySelector('[name="mc_answer"]:checked').value,
            numQuestions: document.querySelector('[name="mc_numQuestions"]:checked').value,
        };
    }
    else if(game.mode === 2) {
        game.modeData = {
            q: document.querySelector('[name="fr_question"]:checked').value,
            a: document.querySelector('[name="fr_answer"]:checked').value,
            autocomplete: document.getElementById('fr_autocomplete').checked,
        };
        document.getElementById('fr_answer').classList.add('visible');
    }
    if(game.modeData.q === 'map') {
        loadMap({
            dragging: false,
            scrollWheelZoom: "center",
            doubleClickZoom: "center",
            touchZoom: "center",
        });
    }
    makeQuestion();
    toScreen('game');
}

function makeQuestion(c) {
    if(!c && game.countryPool.length === 0) {endGame();return;}
    var attempts = 0;
    while(attempts < 10 && (!c || !(c in countryData) || !hasRequirement(c))) {
        c = game.countryPool[Math.floor(Math.random() * game.countryPool.length)];
        ++attempts;
    }
    if(attempts >= 10) {
        endGame();
        return;
    }
    
    game.lastAnswer = game.answer;
    game.answer = c;
    removeItem(game.countryPool, c);
    
    fadeOutQuestion();
    switch(game.modeData.q) {
        case 'map':
            unHighlight();
            highlight(geometry[c]);
            disableControls(600);
            map.flyTo(countryData[c].center, c === 'RUS' ? 2.5 : 4.5, {duration: transitionTime/1000});
            break;
        case 'flag':
            fadeInQuestion('<img src="'+countryData[c].flag+'" />');
            break;
        case 'name':
            fadeInQuestion(countryData[c].name);
            break;
        case 'capital':
            fadeInQuestion(countryData[c].capital);
            break;
    }
    if(game.mode === 1) {setMCQuestions();}
}
var fsSymbolTimeout;
function submitAnswer(answer) {
    clearTimeout(fsSymbolTimeout);
    ++game.answered;
    game.history.push([game.answer, game.answer === answer]);
    if(answer === game.answer) {
        document.getElementById('fs_correct').classList.add('visible');
        playSound('res/correct.mp3', .1);
        ++game.correct;
    }
    else {
        document.getElementById('fs_incorrect').classList.add('visible');
        playSound('res/incorrect.mp3', .6);
    }
    
    if(game.mode === 1) {
        document.querySelectorAll('.mc_a').forEach(function(e) {
            if(e.dataset.value === game.answer) {e.classList.add('correct');}
            else {e.remove();}
        });
    }
    else if(game.mode === 2) {
        setFRInput('');
        document.getElementById('fr_suggestions').innerHTML = '';
        var e = document.createElement('div');
        e.className = 'mc_answers';
        e.innerHTML = '<div class="mc_a correct">' + (game.modeData.a === 'name' ? countryData[game.answer].name : countryData[game.answer].capital) + '</div>';
        document.getElementById('answerBank').insertBefore(e, document.getElementById('fr_answer'));
        setTimeout(function() {e.classList.add('visible');}, 5);
        setTimeout(function() {
            e.classList.remove('visible');
            setTimeout(function() {e.remove();}, 500);
        }, transitionTime);
    }
    fsSymbolTimeout = setTimeout(function() {
        var e = document.querySelector('.feedbackSymbol.visible');
        if(e) {e.classList.remove('visible');}
    }, transitionTime);
    makeQuestion();
}

var qVisibilityTimeout;
function setMCQuestions() {
    clearTimeout(qVisibilityTimeout);
    var e = document.createElement('div');
    e.className = 'mc_answers';
    document.getElementById('answerBank').appendChild(e);
    var picked = [game.answer];
    
    //First try other countries from subregion/bordering
    var p = 0, pools = [
        countryData[game.answer].borders.shuffle().slice(0, Math.min(game.modeData.numQuestions/2, countryData[game.answer].borders.length)) || [],
        subregions[countryData[game.answer].subregion].slice() || [],
        regions[countryData[game.answer].region].slice() || [],
        game.countryPool.slice() || [],
        countries.slice() || [],
    ];
    removeItem(pools, game.answer, true);
    while(picked.length < game.modeData.numQuestions) {
        while(pools[p].length === 0) {++p;}
        picked.push(pools[p][Math.floor(Math.random() * pools[p].length)]);
        removeItem(pools, picked[picked.length-1], true);
    }
    
    picked.shuffle();
    var fg;
    for(var i = 0;i < picked.length;++i) {
        switch(game.modeData.a) {
            case 'flag':
                e.innerHTML += '<div data-value="'+picked[i]+'" onclick="submitAnswer(\''+picked[i]+'\');" class="mc_a flag"><img src="'+countryData[picked[i]].flag+'" /></div>';
                break;
            case 'name':
                e.innerHTML += '<div data-value="'+picked[i]+'" onclick="submitAnswer(\''+picked[i]+'\');" class="mc_a">'+countryData[picked[i]].name+'</div>';
                break;
            case 'capital':
                e.innerHTML += '<div data-value="'+picked[i]+'" onclick="submitAnswer(\''+picked[i]+'\');" class="mc_a">'+countryData[picked[i]].capital+'</div>';
                break;
        }
    }
    qVisibilityTimeout = setTimeout(function() {
        document.querySelectorAll('.mc_answers').forEach(function(elem) {
            if(elem === e) {elem.classList.add('visible');}
            else {elem.classList.remove('visible');setTimeout(function(){elem.remove()}, 500);}
        })
    }, transitionTime);
}
function onFRKeyDown(event, input) {
    if(event.key === 'Enter' && input.value.trim() !== '') {
        var map = game.modeData.a === 'name' ? nameToCode : capitalToCode;
        var val = sanitizeFRAnswer(input.value);
        if(!(val in map) && game.modeData.autocomplete) {
            var e = document.querySelector('#fr_suggestions > div.selected');
            if(e) {
                e.click();
                setTimeout(function() {submitAnswer(map[sanitizeFRAnswer(input.value)])}, 100);
                return;
            }
        } 
        submitAnswer(map[val]);
    }
    else if(event.key === 'Tab') {
        event.preventDefault();
        var e = document.querySelector('#fr_suggestions > div.selected');
        if(e) {
            e.click();
        }
    }
    else if(event.key === 'ArrowUp') {
        event.preventDefault();
        var e = document.querySelector('#fr_suggestions > div.selected');
        if(e && e.nextElementSibling) {
            e.classList.remove('selected');
            e.nextElementSibling.classList.add('selected');
        } 
    }
    else if(event.key === 'ArrowDown') {
        event.preventDefault();
        var e = document.querySelector('#fr_suggestions > div.selected');
        if(e && e.previousElementSibling) {
            e.classList.remove('selected');
            e.previousElementSibling.classList.add('selected');
        }  
    }
}
function sanitizeFRAnswer(val) {
    return val.trim().normalize('NFKD').replace(/[\u0300-\u036F]/g, '').replace(/\s/g, ' ').toUpperCase();
}
var autocompletePromise;
function onFRInput(input) {
    var val = sanitizeFRAnswer(input.value);
    var map = game.modeData.a === 'name' ? nameToCode : capitalToCode;
    document.getElementById('fr_suggestions').innerHTML = '';
    if(game.modeData.autocomplete && val !== '' && !(val in map)) {
        if(autocompletePromise) {autocompletePromise.cancel();}
        var searchable = game.modeData.a === 'name' ? autocompleteCountries : autocompleteCapitals;
        autocompletePromise = fuzzysort.goAsync(val, searchable, autocompleteOptions);
        autocompletePromise.then(results => {
            for(var i = 0;i < results.length;++i) {
                document.getElementById('fr_suggestions').innerHTML += '<div ' + (i === 0 ? 'class="selected" ' : '') + 'onclick="setFRInput(this.textContent)">' + fuzzysort.highlight(results[i]).toLowerCase() + '</div>';
            }
        });
    }
}
function onFRFocus(input) {};
function onFRBlur(input) {};
// function onFRFocus(input) {
//     if(/iPad|iPhone|iPod/.test(navigator.platform)) {
//         setTimeout(function() {
//             document.body.style.height = document.documentElement.style.height = window.innerHeight + 'px';
//             document.body.scrollTop = document.documentElement.scrollTop = 0; 
//             if(map) {map.invalidateSize();}    
//         }, 500);
//     }
// }
// function onFRBlur(input) {
//     if(/iPad|iPhone|iPod/.test(navigator.platform)) {
//         document.body.style.height = document.documentElement.style.height = '100%';
//         if(map) {map.invalidateSize();}
//     }
// }
function setFRInput(val) {
    document.getElementById('fr_answer_input').value = val;
    document.getElementById('fr_answer_input').focus();
    document.getElementById('fr_answer_input').setSelectionRange(val.length, val.length);
    onFRInput(document.getElementById('fr_answer_input'));
}
function fadeInQuestion(content) {
    var q = document.createElement('div');
    q.className = 'question';
    q.innerHTML = content;
    document.getElementById('game').appendChild(q);
    setTimeout(function() {q.classList.add('visible');}, 100);
}
function fadeOutQuestion() {
    var q = document.getElementById('game').querySelector('.question.visible');
    if(q) {
        q.classList.remove('visible');
        setTimeout(function() {q.remove();}, transitionTime);
    }
}

function setSummaryData() {
    document.getElementById('menuStat').innerHTML = '<div>'+(Math.round(game.correct / game.answered * 100) || 0)+'%</div><div>' + game.correct + ' / ' + game.answered + '</div>';
    document.getElementById('menuSummary').innerHTML = '';
    for(var i = 0;i < game.history.length;++i) {
        if(game.history[i][1]) {
            document.getElementById('menuSummary').innerHTML += '<div><svg style="fill: var(--accent);" xmlns="http://www.w3.org/2000/svg" viewBox="0 -46 417.813 417"><path d="M159.988 318.582c-3.988 4.012-9.43 6.25-15.082 6.25s-11.094-2.238-15.082-6.25L9.375 198.113c-12.5-12.5-12.5-32.77 0-45.246l15.082-15.086c12.504-12.5 32.75-12.5 45.25 0l75.2 75.203L348.104 9.781c12.504-12.5 32.77-12.5 45.25 0l15.082 15.086c12.5 12.5 12.5 32.766 0 45.246zm0 0"/></svg>'+countryData[game.history[i][0]].name+'</div>';
        }
        else {
            document.getElementById('menuSummary').innerHTML += '<div><svg style="fill: var(--error);" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 249.499 249.499"><path d="M7.079 214.851l25.905 26.276c9.536 9.674 25.106 9.782 34.777.252l56.559-55.761 55.739 56.548c9.542 9.674 25.112 9.782 34.78.246l26.265-25.887c9.674-9.536 9.788-25.106.246-34.786l-55.742-56.547 56.565-55.754c9.667-9.536 9.787-25.106.239-34.786L216.52 8.375c-9.541-9.667-25.111-9.782-34.779-.252l-56.568 55.761-55.74-56.553C59.891-2.337 44.32-2.451 34.65 7.079L8.388 32.971c-9.674 9.542-9.791 25.106-.252 34.786l55.745 56.553-56.55 55.767c-9.674 9.53-9.791 25.106-.252 34.774z"/></svg>'+countryData[game.history[i][0]].name+'</div>';
        }
    }
    if(game.ended) {
        document.getElementById('inGameMenuBtn_new').style.display = 'block';
        document.getElementById('inGameMenuBtn_resume').style.display = 'none';
        document.getElementById('inGameMenuBtn_back').style.display = 'none';
    }
    else {
        document.getElementById('inGameMenuBtn_new').style.display = 'none';
        document.getElementById('inGameMenuBtn_resume').style.display = 'block';  
        document.getElementById('inGameMenuBtn_back').style.display = 'block';
    }
}

function endGame() {
    game.ended = true;
    setTimeout(function() {
        toScreen('inGameMenu');
    }, transitionTime);
    
}


//Helper Functions
function loadMap(options = {}, countryOptions = {}) {
    //Clear Up Old Map/data if exists
    deleteMap();
    
    //Make Map
    options = Object.assign({}, defaultMapOptions, options);
    map = L.map('map', options);
    
    //Set BASEMAP
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'}).addTo(map);
    // L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',maxZoom: 8}).addTo(map);
    
    //Add country geoJSON
    countryOptions = Object.assign({}, defaultCountryStyle, countryOptions);
    L.geoJSON(geoJSON, {
        style: function(f, e) {
          return countryOptions;
        },
        onEachFeature: function(f, e) {
            geometry[f.id] = e;
        }
    }).addTo(map);
}
function deleteMap() {
    geometry = {};
    if(map) {
        map.remove();
        map = null;
    }
}
function removeItem(arr, value, deep = false) {
    if(deep) {
        for(var j = 0;j < arr.length;++j) {
            var i = arr[j].indexOf(value);
            if(i > -1) {arr[j].splice(i, 1);}    
        }
    }
    else {
        var i = arr.indexOf(value);
        if(i > -1) {arr.splice(i, 1);}
    }
}
function unHighlight() {
    for(var i = 0;i < highlighted.length;++i) {
        highlighted[i].setStyle(defaultCountryStyle);
    }
    highlighted = [];
}
function highlight(elem, options = highlightedCountryStyle) {
    elem.setStyle(options);
    elem.bringToFront();
    highlighted.push(elem);
}

var disableControlsTimeout;
function disableControls(timeout) {
    clearTimeout(disableControlsTimeout);
    
    var dragging = map.dragging.enabled();
    var keyboard = map.keyboard.enabled();
    var touchZoom = map.touchZoom.enabled();
    var doubleClickZoom = map.doubleClickZoom.enabled();
    var scrollWheelZoom = map.scrollWheelZoom.enabled();
    
    map.dragging.disable();
    map.keyboard.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    
    disableControlsTimeout = setTimeout(function() {
        if(dragging) {map.dragging.enable();}
        if(keyboard) {map.keyboard.enable();}
        if(touchZoom) {map.touchZoom.enable();}
        if(doubleClickZoom) {map.doubleClickZoom.enable();}
        if(scrollWheelZoom) {map.scrollWheelZoom.enable();}
    }, timeout);
}
Array.prototype.shuffle = function() {
  for (let i = this.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [this[i], this[j]] = [this[j], this[i]];
  }
  return this;
}

function hasRequirement(country) {
    switch(game.modeData.a) {
        case 'map':
            return geometry[country];
        case 'flag':
            return countryData[country].flag;
        case 'name':
            return countryData[country].name;
        case 'capital':
            return countryData[country].capital;
    }
}
var aCtx;
var soundCache = {};
function playSound(file, volume = 1) {
    if(!aCtx) {aCtx = new (window.AudioContext || window.webkitAudioContext)();}
    if(settings.audio === true) {
        if(!(file in soundCache)) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', file, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function() {
                aCtx.decodeAudioData(xhr.response, function(buffer) {
                    soundCache[file] = buffer;
                    playSound(file, volume);
                }, console.error);
            }
            xhr.onerror = console.error;
            xhr.send();
        }
        else {
            var gn = aCtx.createGain();
            gn.gain.value = volume;
            gn.connect(aCtx.destination);
            var source = aCtx.createBufferSource();
            source.buffer = soundCache[file];
            source.volume = volume;
            source.connect(gn);
            if(!source.start) {source.start = source.noteOn;}
            source.start();
            source.onended = function() {
                source.disconnect(gn);
                gn.disconnect(aCtx.destination);
                delete source;
                delete gn;
            }
        }
    }
}

function unlockAudio() {
    if(!aCtx) {aCtx = new (window.AudioContext || window.webkitAudioContext)();}
    var buffer = aCtx.createBuffer(1, 1, 22050); // 1/10th of a second of silence
    var source = aCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(aCtx.destination);
    source.onended = function() {
        source.disconnect(aCtx.destination);
        window.removeEventListener("mousedown", unlockAudio);
        delete source;
    }
    source.start();
}

window.addEventListener('mousedown', unlockAudio);