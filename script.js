let map, canvasLayer, exploreMap, highlighted = [];
let game = {}, settings = {};
let geoJSON, geometry = {}, topCities, exploreGeometry = {}, countries = [], subregions = {}, regions = {}, nameToCode = {}, autocompleteCountries = [], capitalToCode = {}, autocompleteCapitals = [], countryStyle = {};
let aliases, countryData, timerInterval, alertIcon;
let exploreCountry;
const transitionTime = 1000;

const tinyIslands = ["ABW","AIA","ALA","ASM","ATF","ATG","BES","BHR","BHS","BLM","BMU","BRB","BRN","BVT","CCK","COK","COM","CPV","CUW","CXR","CYM","CYP","DMA","FJI","FLK","FRO","FSM","GGY","GLP","GRD","GUM","HMD","IMN","IOT","JEY","JAM","KIR","KNA","LCA","MAF","MDV","MHL","MLT","MNP","MSR","MTQ","MUS","MYT","NFK","NIU","NRU","PCN","PLW","PYF","REU","SGS","SHN","SJM","SLB","SMR","SPM","STP","SXM","SYC","TCA","TKL","TLS","TON","TTO","TUV","VCT","VGB","VIR","VUT","WLF","WSM"];
let extendedNames = {"ALAND":["ALA"],"SAMOA":["ASM"],"ANTIGUA":["ATG"],"BARBUDA":["ATG"],"BENGAL":["BGD"],"BIM":["BRB"],"GUDIJA":["BLR"],"DAHOMEY":["BEN"],"BONAIRE":["BES"],"EUSTATIUS":["BES"],"SABA":["BES"],"BOSNIA":["BIH"],"HERZEGOVINA":["BIH"],"BRASIL":["BRA"],"BRITISHINDIAN":["IOT"],"VIRGIN":["VGB","VIR"],"BRITISHVIRGIN":["VGB"],"UKVIRGIN":["VGB"],"USVIRGIN":["VIR"],"UNITEDSTATESVIRGIN":["VIR"],"DARUSSALAM":["BRN"],"BOURKINAFASSO":["BFA"],"KAMPUCHEA":["KHM"],"KHMER":["KHM"],"TCHAD":["TCD"],"CHILLI":["CHL"],"CHILI":["CHL"],"KEELING":["CCK"],"KOMORI":["COM"],"BRAZZAVILLE":["COG"],"DRC":["COD"],"KINSHASA":["COD"],"HRVATSKA":["HRV"],"CZECH":["CZE"],"BOHEMIA":["CZE"],"DANMARK":["DNK"],"DR":["DOM"],"DOMINICAN":["DOM"],"DOMINICANA":["DOM"],"REPUBLICADOMINICANA":["DOM"],"KIMI":["EGY"],"GUINEAEQUATORIAL":["GNQ"],"EESTI":["EST"],"ABYSSINIA":["ETH"],"MALVINAS":["FLK"],"SUOMI":["FIN"],"GUYANE":["GUF"],"POLYNESIA":["PYF"],"FRENCHSOUTHERN":["ATF"],"IVERIA":["GEO"],"DEUTSCHLAND":["DEU"],"GDR":["DEU"],"BRD":["DEU"],"GOLDCOAST":["GHA"],"HELLADA":["GRC"],"HELLAS":["GRC"],"BISSAU":["GIN"],"HEARD":["HMD"],"MCDONALD":["HMD"],"VATICAN":["VAT"],"BHARAT":["IND"],"NUSANTARA":["IDN"],"DUTCHEASTINDIES":["IDN"],"INDUNESIA":["IDN"],"IVORYCOAST":["CIV"],"EIRE":["IRL"],"ZION":["ISR"],"ITALIANA":["ITA"],"ITALIA":["ITA"],"XAMAYCA":["JAM"],"NIPPON":["JPN"],"CHANNEL":["JEY","GGY"],"KYRGYZ":["KGZ"],"LAO":["LAO"],"LATVIJA":["LVA"],"MACEDONIA":["MKD"],"MOLDAVIA":["MDA"],"BURMA":["MMR"],"MARIANA":["MNP"],"NORGE":["NOR"],"FILIPINAS":["PHL"],"POLSKA":["POL"],"RF":["RUS"],"SOVIETUNION":["RUS"],"RUSSIANFEDERATION":["RUS"],"RUANDA":["RWA"],"HELENA":["SHN"],"ASCENSION":["SHN"],"TRISTANDACUNHA":["SHN"],"KITTS":["KNA"],"NEVIS":["KNA"],"MARTIN":["MAF","SXM"],"PIERRE":["SPM"],"MIQUELON":["SPM"],"VINCENT":["VCT"],"GRENADINES":["VCT"],"SAOTOME":["STP"],"PRINCIPE":["STP"],"SOUTHGEORGIA":["SGS"],"SANDWHICH":["SGS"],"HISPANIA":["ESP"],"ESPANA":["ESP"],"EASTTIMOR":["TLS"],"TIMOR":["TLS"],"TRINIDAD":["TTO"],"TOBAGO":["TTO"],"CAICOS":["TCA"],"UAE":["ARE"],"UK":["GBR"],"BRITAIN":["GBR"],"GREATBRITAIN":["GBR"],"USA":["USA"],"AMERICA":["USA"],"WALLIS":["WLF"],"FUTUNA":["WLF"],"SAHRAWI":["ESH"],"MOROCCO":["ESH"],"CABOVERDE":["CPV"],"MACAU":["MAC"]};

const defaultGame = {
    mode: 1,
    ended: true,
    modeData: {q: 'map', a: 'name', numQuestions: 4, autocomplete: true, maxTime: 900},
    includeIslands: false,
    recognizedOnly: true,
    maxZoom: 16,
    regions: ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania', 'Polar'],
    countryPool: [],
    answered: 0,
    correct: 0,
    history: [],
    isPaused: false,
    timerValue: 0,
    timer: false,
};
const defaultSettings = {
    audio: true,
};
const defaultCountryStyle = {
    weight: 2,
    color: "black",
    fill: false,
    fillColor: "var(--accent)",
    fillOpacity: .3,
    interactive: false
};
const defaultHighlightedCountryStyle = {
    weight: 3,
    fillOpacity: .3,
    color: "var(--accent)",
    fill: true
};
const defaultHiddenCountryStyle = {
    stroke: false,
    fillOpacity: .2,
    fill: true
};
const exploreCountryStyle = {
    weight: 2,
    color: "black",
    fill: true,
    fillOpacity: 0,
    interactive: true,
    bubblingMouseEvents: false,
    opacity: 1,
};
const exploreCountryHoveredStyle = {
    weight: 2,
    fillOpacity: .2,
    color: "black",
    fillColor: "var(--accent3)",
};
const exploreCountryHighlightedStyle = {
    weight: 2,
    fillOpacity: .4,
    color: "var(--accent)",
    fillColor: "var(--accent)",
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
    keyboard: false,
    doubleClickZoom: true,
    touchZoom: true,
    scrollWheelZoom: false, // disable original zoom function
    smoothWheelZoom: true,  // enable smooth zoom 
    smoothSensitivity: 1,   // zoom speed. default is 1
};
const exploreMapOptions = {
    attributionControl: false,
    zoomControl: false,
    boxZoom: true,
    zoomDelta: .5,
    zoomSnap: .5,
    maxBounds: [[-90, -180],[90, 180]],
    minZoom: 1,
    bounceAtZoomLimits: false,
    maxBoundsViscosity: .5,
    keyboard: true,
    doubleClickZoom: true,
    touchZoom: true,
    scrollWheelZoom: false, // disable original zoom function
    smoothWheelZoom: true,  // enable smooth zoom 
    smoothSensitivity: 1,   // zoom speed. default is 1
};
const centerLatLng = [43.06888777,-15.46875];
const centerZoom = 3;


//Event Handlers
window.addEventListener('load', function() {
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('serviceWorker.js', {scope: '.'})
        .then(function (registration) {}, function (err) {
            console.error('PWA: ServiceWorker registration failed: ', err);
        });
    }
  
    settings = defaultSettings;
    setSettingElements();
    game = defaultGame;

    setRegionSetting(game.regions);
    document.getElementById('includeIslands').checked = game.includeIslands;
    document.getElementById('isRecognized').checked = game.recognizedOnly;
    document.getElementById('resumeGameBtn').style.display = game.ended ? 'none' : 'block';
    document.getElementById('fm_timer').checked = game.timer;
    document.getElementById('fm_time').value = Math.round(game.modeData.maxTime / 60);
    fmTimerInput(document.getElementById('fm_timer'));

    onResize();
    if(window.visualViewport) {
        window.visualViewport.addEventListener('resize', onResize);
    }
    else {
        window.addEventListener('resize', onResize);
    }
    window.addEventListener('orientationchange', onResize);
    window.addEventListener('keydown', function(event) {
        if(event.key === 'Escape' && !game.ended && document.getElementById('inGameMenu').classList.contains('visible')) {
            resumeGame();
        }
        else if(event.key === 'Escape' && !game.ended && document.getElementById('game').classList.contains('visible')) {
            toScreen('inGameMenu');
        }
        if(event.key === '/' && exploreMap) {
            toggleExploreSearch();
        }
    });

    alertIcon = L.divIcon({
        html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M479.55 265.75a27.28 27.28 0 0 1 0-19.52l19.47-51.1a27.4 27.4 0 0 0-10.63-32.72l-45.8-29.9a27.44 27.44 0 0 1-11.47-15.8l-14.3-52.8A27.43 27.43 0 0 0 389 43.67l-54.63 2.73a27.47 27.47 0 0 1-18.57-6.03L273.2 6.08a27.4 27.4 0 0 0-34.4 0l-42.6 34.3a27.48 27.48 0 0 1-18.57 6.03L123 43.68a27.43 27.43 0 0 0-27.83 20.23L80.9 116.7a27.48 27.48 0 0 1-11.48 15.8l-45.8 29.9a27.41 27.41 0 0 0-10.63 32.71l19.48 51.12c2.4 6.29 2.4 13.24 0 19.52l-19.48 51.12a27.42 27.42 0 0 0 10.63 32.7l45.8 29.92a27.35 27.35 0 0 1 11.48 15.79l14.28 52.8A27.42 27.42 0 0 0 123 468.3l54.63-2.72a27.38 27.38 0 0 1 18.57 6.02l42.6 34.32a27.4 27.4 0 0 0 34.4 0l42.6-34.32a27.37 27.37 0 0 1 18.56-6.02l54.63 2.72a27.42 27.42 0 0 0 27.83-20.23l14.3-52.8a27.3 27.3 0 0 1 11.47-15.78l45.8-29.91A27.4 27.4 0 0 0 499 316.88l-19.46-51.13zM288.78 369.13a18.94 18.94 0 0 1-18.93 18.94h-27.7a18.95 18.95 0 0 1-18.94-18.94V340.2a18.95 18.95 0 0 1 18.94-18.94h27.7c10.45 0 18.93 8.49 18.93 18.94v28.92zm0-100.18a18.93 18.93 0 0 1-18.93 18.93h-27.7a18.94 18.94 0 0 1-18.94-18.93V142.88a18.94 18.94 0 0 1 18.94-18.94h27.7a18.93 18.93 0 0 1 18.93 18.94v126.07z"/></svg>',
        bgPos: [12, 12],
        className: 'countryMarker',
        iconSize: [24, 24]
    });
});

function onResize(event) {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    if(window.visualViewport) {
        document.documentElement.style.height = document.body.style.height = window.visualViewport.height + "px";
    }
    else {
        document.documentElement.style.height = document.body.style.height = window.innerHeight + "px";
    }
    if(map) {map.invalidateSize();}
    if(exploreMap) {exploreMap.invalidateSize();}
}

//General UI
function toScreen(screen) {
    var e = document.getElementById(screen);
    if(e) {
        document.querySelectorAll('.screen.visible').forEach(function(e) {
            e.classList.remove('visible');
        });

        // Special cases
        if(screen === 'home') {
            document.getElementById('resumeGameBtn').style.display = game.ended ? 'none' : 'block';
        }
        else if(screen === 'game') {
            game.isPaused = false;
        }
        else if(screen === 'inGameMenu') {
            setSummaryData();
            game.isPaused = true;
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
function regionSettingUpdate(elemChanged) {
    var checkboxes = document.querySelectorAll('#regionCheckboxes input:not(#regionAll)');
    var allCheckbox = document.getElementById('regionAll');
    if(elemChanged === allCheckbox) {
        for(var i = 0; i < checkboxes.length; ++i) {
            checkboxes[i].checked = allCheckbox.checked;
        }
    }
    else {
        var allChecked = true;
        for(var i = 0; i < checkboxes.length; ++i) {
            if(!checkboxes[i].checked) {allChecked = false; break;}
        }
        allCheckbox.checked = allChecked;
    }
}
function setRegionSetting(regions) {
    var checkboxes = document.querySelectorAll('#regionCheckboxes input:not(#regionAll)');
    for(var i = 0; i < checkboxes.length; ++i) {
        checkboxes[i].checked = regions.indexOf(checkboxes[i].id.substring(6)) > -1;
    }
    regionSettingUpdate();
}
function getRegionSetting() {
    var checkboxes = document.querySelectorAll('#regionCheckboxes input:not(#regionAll)');
    var regions = [];
    for(var i = 0; i < checkboxes.length; ++i) {
        if(checkboxes[i].checked) {
            regions.push(checkboxes[i].id.substring(6));
        }
    }
    return regions;
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
    toScreen('loading');

    //Clean Up DOM
    deleteMap();
    document.querySelectorAll('.mc_answers').forEach(function(e) {e.remove();});
    document.getElementById('fr_answer').classList.remove('visible');
    document.getElementById('fr_answer_input').spellcheck = "false";
    document.getElementById('fr_suggestions').innerHTML = '';
    document.getElementById('newGameErr').style.display = 'none';
    document.getElementById('gameTimerStat').textContent = '';
    document.getElementById('revealCountriesBtn').style.display = 'none';

    // Lazy load json
    if(!countryData) {
        loadJSON('countryInfo.json', function(res) {
            setupDataStructs(res);
            setupGameObject();
        });
    }
    else {setupGameObject();}
}
function resumeGame() {
    toScreen('game');
    if(game.mode === 2 || game.mode === 3) {
        document.getElementById('fr_answer_input').focus();
    }
}
function setupGameObject() {
    game.modeData = {},
    game.history = [];
    game.correct = 0;
    game.answered = 0;
    game.mode = parseInt(document.querySelector('[name="gameMode"]:checked').value);
    game.regions = getRegionSetting();
    game.includeIslands = document.getElementById('includeIslands').checked;
    game.recognizedOnly = document.getElementById('isRecognized').checked;
    game.ended = false;
    game.isPaused = false;
    game.timerValue = 0;

    // Create countryPool
    game.countryPool = [];
    game.regions.forEach(function(r) {
        regions[r].forEach(function(c) {
            if(!game.includeIslands && tinyIslands.indexOf(c) > -1) {return;}
            else if(game.recognizedOnly && countryData[c].sovereignty !== undefined) {return;}
            else {game.countryPool.push(c);}
        });
    });

    if(game.countryPool.length === 0) {
        endGame('newGame');
        document.getElementById('newGame').scrollTop = 0
        document.getElementById('newGameErr').style.display = 'block';
        return;
    }

    //Game Mode Specific Settings
    document.getElementById('answerBank').classList.remove('floating');
    if(game.mode === 1) {
        game.modeData = {
            q: document.querySelector('[name="mc_question"]:checked').value,
            a: document.querySelector('[name="mc_answer"]:checked').value,
            numQuestions: document.querySelector('[name="mc_numQuestions"]:checked').value,
        };
        document.getElementById('answerBank').classList.add('floating');
    }
    else if(game.mode === 2) {
        game.modeData = {
            q: document.querySelector('[name="fr_question"]:checked').value,
            a: document.querySelector('[name="fr_answer"]:checked').value,
            autocomplete: document.getElementById('fr_autocomplete').checked,
        };
        document.getElementById('fr_answer').classList.add('visible');
        document.getElementById('fr_answer_input').focus();
    }
    else if(game.mode === 3) {
        var timer = document.getElementById('fm_timer').checked;
        var maxTime = parseInt(document.getElementById('fm_time').value) * 60 || 900;
        game.modeData = {
            q: 'map',
            a: 'name',
            autocomplete: false,
            timer: timer,
            maxTime: timer ? maxTime : Infinity,
        };
        game.timer = timer;
        game.timerValue = timer ? maxTime : 0;
        document.getElementById('fr_answer').classList.add('visible');
        document.getElementById('fr_answer_input').spellcheck = "true";
        document.getElementById('fr_answer_input').focus();
    }

    if(game.modeData.q === 'map') {
        loadMap(game.mode === 3 ? exploreMapOptions : {
            dragging: false,
            smoothWheelZoom: "center",  // enable smooth zoom 
            smoothSensitivity: 1,   // zoom speed. default is 1
            doubleClickZoom: "center",
            touchZoom: "center",
        });
    }
    else {
        makeQuestion(null, true);
        toScreen('game');
    }
}
function makeQuestion(c, isFirst) {
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
    
    setTimeout(function() {
        fadeOutQuestion(isFirst);
        switch(game.modeData.q) {
            case 'map':
                unHighlight();
                highlight(geometry[c]);
                if(game.recognizedOnly) {callOnDownstream(c, function(id) {highlight(geometry[id]);});}
                disableControls(600);
                map.flyTo(countryData[c].center, calculateZoomLevel(c), {duration: transitionTime/1000});
                break;
            case 'flag':
                fadeInQuestion('<img onerror="makeQuestion();" src="res/flags/'+c+'.svg" />');
                break;
            case 'name':
                resizeQuestionText(fadeInQuestion(countryData[c].name));
                break;
            case 'capital':
                resizeQuestionText(fadeInQuestion(countryData[c].capital));
                break;
            case 'shape':
                fadeInQuestion('<img class="countryShapeQuestion" onerror="makeQuestion();" src="https://worldle.teuteuf.fr/images/countries/'+countryData[c].a2.toLowerCase()+'/vector.svg" />');
                break;
        }
    }, (game.modeData.q === 'map' || isFirst) ? 0 : transitionTime-250);
    if(game.mode === 1) {setMCAnswers(isFirst);}
}
var fsSymbolTimeout;
function submitAnswer(answer) {
    clearTimeout(fsSymbolTimeout);
    ++game.answered;
    game.history.push([game.answer, game.answer === answer]);
    if(answer === game.answer) {
        document.getElementById('fs_correct').classList.add('visible');
        playSound('res/audio/correct.mp3', .1);
        ++game.correct;
    }
    else {
        document.getElementById('fs_incorrect').classList.add('visible');
        playSound('res/audio/incorrect.mp3', .6);
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
    updateGameTimerStat();
    makeQuestion();
}
function submitFillOutAnswer(input) {
    var ids = name2codeEx(input.value);
    if(ids.length > 0) {
        var oneCorrect = false;
        var errs = [];
        ids.forEach(id => {
            if(game.countryPool.indexOf(id) > -1) {
                ++game.answered;
                ++game.correct;
                oneCorrect = true;
                game.history.push([id, true]);
                removeItem(game.countryPool, id);
                hidden(geometry[id]);
                if(game.recognizedOnly) {callOnDownstream(id, function(c) {hidden(geometry[c]);});}
                if(id in mapMarkers) {mapMarkers[id].remove();delete mapMarkers[id];}
            }
            else if(game.history.find(x => x[0] === id)) {
                errs.push(countryData[id].name + " has already been entered");
            }
            else if(id in countryData) {
                errs.push(countryData[id].name + " was not included via game settings");
            }
        });
        if(oneCorrect) {
            playSound('res/audio/correct.mp3', .1);
            input.value = '';
            setTimeout(function() {input.value = '';}, 100);
            updateGameTimerStat();
        }
        else if(errs.length > 0) {
            var prevVal = input.value;
            setTimeout(function() {
                if(input.value === prevVal) {
                    errs.forEach(err => {
                        var exists = document.evaluate('//span[text()="'+err+'"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        if(exists) {return;}
                        var elem = document.createElement('span');
                        elem.className = 'err';
                        elem.textContent = err;
                        document.getElementById('fr_suggestions').appendChild(elem);
                        setTimeout(function() {elem.remove();}, 4000);
                    });
                }
            }, 500);
        }
        if(game.countryPool.length === 0) {endGame();}
        document.getElementById('revealCountriesBtn').style.display = game.countryPool.length < 25 ? 'block' : 'none';
    }
}
function handleTimer(isFirst) {
    if(game.isPaused) {return;}
    var isFinale = false;
    if(game.timer) {
        if(game.timerValue <= 0) {endGame();return;}
        --game.timerValue;
        isFinale = game.timerValue <= 10;
    }
    else if(!isFirst) {
        ++game.timerValue;
    }
    document.getElementById('gameTimerValue').textContent = Math.floor(game.timerValue / 60).toString().padStart(2, '0') + ':' + (game.timerValue % 60).toString().padStart(2, '0');
    document.getElementById('gameTimer').className = isFinale ? 'finale' : '';
}
function updateGameTimerStat() {
    if(game.mode === 3) {
        document.getElementById('gameTimerStat').innerHTML = '<b>' + game.correct + '</b> / ' + (game.countryPool.length + game.answered);
    }
    else {
        document.getElementById('gameTimerStat').textContent = (Math.round(game.correct / (game.countryPool.length + game.answered) * 100) || 0) + '%';
    }
}
var mapMarkers = {};
var mapMarkerTimeout;
function identifyRemainingCountries() {
    clearMapMarkers();
    game.countryPool.forEach(x => {
        var marker = L.marker(countryData[x].center, {icon: alertIcon, pane: "markers"});
        mapMarkers[x] = marker;
        marker.addTo(map);
    });
    var group = new L.featureGroup(Object.values(mapMarkers));
    map.flyToBounds(group.getBounds(), {padding: [15, 15]});
    mapMarkerTimeout = setTimeout(clearMapMarkers, 10000);
}
function clearMapMarkers() {
    clearTimeout(mapMarkerTimeout);
    Object.values(mapMarkers).forEach(x => x.remove());
    mapMarkers = {};
}

var qVisibilityTimeout;
function setMCAnswers(isFirst) {
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
                e.innerHTML += '<div data-value="'+picked[i]+'" onclick="submitAnswer(\''+picked[i]+'\');" class="mc_a flag"><img src="res/flags/'+picked[i]+'.svg" /></div>';
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
    }, isFirst ? 0 : transitionTime);
}
function fmTimerInput(input) {
    document.getElementById('timeInput').style.display = input.checked ? 'inline-block' : 'none';
}
function onFRKeyDown(event, input) {
    if(event.key === 'Enter' && input.value.trim() !== '') {
        event.preventDefault();
        if(game.mode === 3) {submitFillOutAnswer(input);return;}
        var id = game.modeData.a === 'name' ? name2code(input.value) : capital2code(input.value);
        if(!id && game.modeData.autocomplete) {
            var e = document.querySelector('#fr_suggestions > div.selected');
            if(e) {
                e.click();
                setTimeout(function() {submitAnswer(game.modeData.a === 'name' ? name2code(input.value) : capital2code(input.value))}, 100);
                return;
            }
        } 
        submitAnswer(id);
    }
    else if(event.key === 'Tab' && game.modeData.autocomplete) {
        event.preventDefault();
        if(game.mode === 3) {submitFillOutAnswer(input);return;}
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
var autocompletePromise;
function onFRInput(input) {
    if(game.mode === 3) {submitFillOutAnswer(input);return;}
    var val = normalizeName(input.value);
    var code = game.modeData.a === 'name' ? name2code(input.value) : capital2code(input.value);
    document.getElementById('fr_suggestions').innerHTML = '';
    if(game.modeData.autocomplete && val !== '' && !code) {
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
function onFRBlur(input) {
    if(!game.ended && !game.isPaused) {input.focus();}
};
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
    return q;
}
function resizeQuestionText(elem) {
    var textSize = 5;
    while(textSize > .1 && elem.scrollWidth > elem.offsetWidth) {
        textSize -= .1;
        elem.style.fontSize = textSize + "em";
    }

    // Add buffer for padding
    if(textSize > .5 && textSize < 5) {textSize -= .3;}
    elem.style.fontSize = textSize + "em";
}
function fadeOutQuestion(isFirst) {
    var q = document.getElementById('game').querySelector('.question.visible');
    if(q) {
        q.classList.remove('visible');
        setTimeout(function() {q.remove();}, isFirst ? 0 : transitionTime);
    }
}

function setSummaryData() {
    if(game.mode === 3) {
        document.getElementById('menuStat').innerHTML = '<div>'+(Math.round(game.correct / (game.countryPool.length + game.answered) * 100) || 0)+'%</div><div>' + game.correct + ' / ' + (game.countryPool.length + game.answered) + '</div>';
    }
    else {
        document.getElementById('menuStat').innerHTML = '<div>'+(Math.round(game.correct / game.answered * 100) || 0)+'%</div><div>' + game.correct + ' / ' + game.answered + '</div>';
    }
    document.getElementById('timeStat').innerHTML = '<div>' + (game.timer ? 'Time Remaining' : 'Time') + '</div>' + Math.floor(game.timerValue / 60).toString().padStart(2, '0') + ':' + (game.timerValue % 60).toString().padStart(2, '0');
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

function endGame(screen = 'inGameMenu') {
    game.ended = true;
    clearTimeout(timerInterval);
    setTimeout(function() {
        toScreen(screen);
    }, transitionTime);
    
}


//Helper Functions
function loadJSON(fileName, callback) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function(evt) {
        if(callback instanceof Function) {callback(xhr.response);}
    });
    xhr.responseType = 'json';
    xhr.open('GET', 'res/data/' + fileName, true);
    xhr.send();
}
function setupDataStructs(res) {
    countryData = res;
    countries = Object.keys(countryData);
    countries.forEach(function(id) {
        if(!(id in countryData) || !countryData[id].name) {console.log(id); return;}
        if(!subregions[countryData[id].subregion]) {subregions[countryData[id].subregion] = [];}
        if(!regions[countryData[id].region]) {regions[countryData[id].region] = [];}
        subregions[countryData[id].subregion].push(id);
        regions[countryData[id].region].push(id);
        nameToCode[normalizeName(countryData[id].name)] = id;
        autocompleteCountries.push(fuzzysort.prepare(normalizeName(countryData[id].name)));
        capitalToCode[normalizeName(countryData[id].capital)] = id;
        autocompleteCapitals.push(fuzzysort.prepare(normalizeName(countryData[id].capital)));
    });
    // Generate even more aliases for extended names
    Object.keys(nameToCode).forEach(x => {
        var name = normalizeNameExtended(x);
        if(name !== x) {
            if(name in extendedNames) {
                if(extendedNames[name].indexOf(nameToCode[x]) === -1) {
                    extendedNames[name].push(nameToCode[x]);
                }
            }
            else {
                extendedNames[name] = [nameToCode[x]];
            }   
        }
    });
}
var mapLoadedParts = 0;
function loadMap(options = {}, countryOptions = {}, baseMap = true) {
    //Clear Up Old Map/data if exists
    deleteMap();
    
    //Make Map
    options = Object.assign({}, defaultMapOptions, options);
    map = L.map('map', options);
    map.on('load', checkLoad);
    map.setView(centerLatLng, centerZoom);
    map.createPane('markers');
    
    //Set BASEMAP
    if(baseMap) {
        var bm = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'}).addTo(map);
    }

    // Lazy load geoJSON
    if(!geoJSON) {
        loadJSON('countries.geojson', function(res) {
            geoJSON = res;
            setGeoJSON(countryOptions);
        });
    }
    else {setGeoJSON(countryOptions);}
    
}
function checkLoad() {
    if(++mapLoadedParts >= 2) {
        if(game.mode !== 3) {
            makeQuestion(null, true);
        }
        else {
            map.fitBounds(L.latLngBounds(map.geoCenters), {padding: [15, 15]});
        }
        clearInterval(timerInterval);
        handleTimer(true);
        timerInterval = setInterval(handleTimer, 1000);
        toScreen('game');
    }
}
function setGeoJSON(countryOptions) {
    countryStyle = Object.assign({}, defaultCountryStyle, countryOptions);
    map.geoCenters = [];
    L.geoJSON(geoJSON, {
        style: countryStyle,
        onEachFeature: function(feature, layer) {
            geometry[feature.id] = layer;
            if(game.mode === 3) {
                if(game.countryPool.indexOf(feature.id) === -1)  {
                    if(!game.recognizedOnly || game.countryPool.indexOf(countryData[feature.id].sovereignty) === -1) {
                        hidden(layer);
                    }
                }
                else {
                    map.geoCenters.push(countryData[feature.id].center);
                }
            }
        }
    }).addTo(map);
    checkLoad();
}
function deleteMap() {
    geometry = {};
    if(map) {
        map.remove();
        map = null;
        mapLoadedParts = 0;
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
        highlighted[i].setStyle(countryStyle);
    }
    highlighted = [];
}
function highlight(elem, options = defaultHighlightedCountryStyle) {
    elem.setStyle(options);
    elem.bringToFront();
    highlighted.push(elem);
}
function hidden(elem, options = defaultHiddenCountryStyle) {
    elem.setStyle(options);
    elem.bringToBack();
    highlighted.push(elem);
}
function callOnDownstream(id, func) {
    Object.keys(countryData).forEach(c => {
        if(countryData[c].sovereignty && countryData[c].sovereignty === id) {
            func(c);
        }
    });
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
            return true;
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

function calculateZoomLevel(c) {
    switch(c) {
        case 'RUS': return 2.5; break;
        case 'CHN': return 4; break;
        case 'USA': return 3.5; break;
        case 'CAN': return 3.5; break;
        case 'BRA': return 4; break;
        case 'ATA': return 2.3; break;
        default: return 4.5;
    }
}




// Explore map
var exploreMapLoadedParts = 0;
function loadExploreMap(baseMap = true) {
    // Show loading screen
    toScreen('loading');

    //Clear Up Old Map/data if exists
    deleteExploreMap();

    // Lazy load data
    if(!countryData) {
        loadJSON('countryInfo.json', function(res) {
            setupDataStructs(res);
            checkExploreLoad();
        });
    }
    else {checkExploreLoad();}
    
    //Make Map
    exploreMap = L.map('exploreMap', exploreMapOptions);
    exploreMap.on('load', checkExploreLoad);
    exploreMap.setView(centerLatLng, centerZoom);
    
    //Set BASEMAPs
    if(baseMap) {
        var base = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community', noWrap: true, bounds: [[-90, -180],[90, 180]]}).addTo(exploreMap);
        var pane = exploreMap.createPane('labels');
        pane.style.zIndex = 650;
        pane.style.pointerEvents = 'none';
        var labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_only_labels/{z}/{x}/{y}{r}.png', {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>', subdomains: 'abcd', maxZoom: 20, pane: 'labels', noWrap: true,   bounds: [[-90, -180],[90, 180]]}).addTo(exploreMap);
    }

    if(!geoJSON) {
        loadJSON('countries.geojson', function(res) {
            geoJSON = res;
            setExploreGeoJSON();
        });
    }
    else {setExploreGeoJSON();}
}
function setExploreGeoJSON() {
    L.geoJSON(geoJSON, {
        style: exploreCountryStyle,
        onEachFeature: function(feature, layer) {
            exploreGeometry[feature.id] = layer;
            layer.setStyle(exploreCountryStyle);
            layer.on('mouseover', function(evt) {
                if(this.feature.id !== exploreCountry) {
                    this.setStyle(exploreCountryHoveredStyle);
                }
            });
            layer.on('mouseout', function(evt) {
                if(this.feature.id !== exploreCountry) {
                    this.setStyle(exploreCountryStyle);
                    this.bringToFront();
                    if(exploreCountry) {exploreGeometry[exploreCountry].bringToFront();}
                }
            });
            layer.on('click', function(evt) {
                selectExploreCountry(this.feature.id);
            });
        }
    }).addTo(exploreMap);
    checkExploreLoad();
}
function checkExploreLoad() {
    if(++exploreMapLoadedParts >= 3) {
        toScreen('explore');
    }
}
function deleteExploreMap() {
    exploreMapLoadedParts = 0;
    exploreGeometry = {};
    if(exploreMap) {
        exploreMap.remove();
        exploreMap = null;
    }
}
function selectExploreCountry(id) {
    if(exploreCountry) {exploreGeometry[exploreCountry].setStyle(exploreCountryStyle);}
    exploreGeometry[id].setStyle(exploreCountryHighlightedStyle);
    exploreGeometry[id].bringToFront();
    exploreCountry = id;
    setExploreDetails(id);
}
function hideExploreDetails() {
    if(exploreMap) {
        exploreMap.getContainer().style.width = "100vw";
        exploreMap.getContainer().style.height = "100vh";
        exploreMap.invalidateSize();
    }
}
function setExploreDetails(id) {
    if(exploreMap.getContainer().style.width !== "100%") {
        exploreMap.getContainer().style.width = "100%";
        exploreMap.getContainer().style.height = "100%";
        exploreMap.invalidateSize();
    }
    document.getElementById('exploreFlag').style.display = 'block';
    document.getElementById('exploreFacts').style.display = 'block';
    document.getElementById('exploreFlag').src = 'res/flags/' + id + '.svg';
    document.getElementById('exploreCountryName').textContent = countryData[id].name;
    document.getElementById('exploreRecognized').style.display =  'block';
    document.getElementById('exploreDetailSovereigntyWrapper').style.display = 'none';
    document.getElementById('exploreCountryCodes').innerHTML = '<span title="Alpha-3 Code">' + id + '</span> · <span title="Alpha-2 Code">' + countryData[id].a2 + '</span>';
    document.getElementById('exploreDetailCapital').textContent = countryData[id].capital || '-';
    document.getElementById('exploreDetailRegion').innerHTML = countryData[id].subregion || '-';
    document.getElementById('exploreDetailPopulation').textContent = (countryData[id].population || '-').toLocaleString();
    document.getElementById('exploreDetailArea').innerHTML = (countryData[id].area || '-').toLocaleString();
    document.getElementById('exploreDetailCenter').innerHTML = countryData[id].center ? (countryData[id].center[1].toFixed(2) || '-') + '&#176;, ' + (countryData[id].center[1].toFixed(2) || '-') + '&#176;' : '-';

    if(countryData[id].sovereignty !== undefined) {
        document.getElementById('exploreRecognized').style.display =  'none';
        var sid = countryData[id].sovereignty.toUpperCase();
        if(sid in countryData) {
            document.getElementById('exploreDetailSovereigntyWrapper').style.display = 'flex';
            document.getElementById('exploreDetailSovereigntyImg').src = 'res/flags/' + sid + '.svg';
            document.getElementById('exploreDetailSovereigntyImg').onclick = function() {selectExploreCountry(sid);};
            document.getElementById('exploreDetailSovereignty').textContent = countryData[sid].name;
        }
    }

    // borders
    if(countryData[id].borders.length === 0) {
        document.getElementById('bordersWrapper').style.display = 'none';
    }
    else {
        document.getElementById('bordersWrapper').style.display = 'block';
        document.getElementById('borderCountries').innerHTML = '';
        countryData[id].borders.forEach((c) => {
            document.getElementById('borderCountries').innerHTML += '<div data-id="' + c + '" onclick="selectExploreCountry(this.dataset.id)" ><img src="res/flags/' + c + '.svg" /> ' + countryData[c].name + '</div>';
        }); 
    }

    // territories
    var territories = Object.keys(countryData).filter(x => countryData[x].sovereignty === id);
    if(territories.length === 0) {
        document.getElementById('territoriesWrapper').style.display = 'none';
    }
    else {
        document.getElementById('territoriesWrapper').style.display = 'block';
        document.getElementById('territoryCountries').innerHTML = '';
        territories.forEach((c) => {
            document.getElementById('territoryCountries').innerHTML += '<div data-id="' + c + '" onclick="selectExploreCountry(this.dataset.id)" ><img src="res/flags/' + c + '.svg" /> ' + countryData[c].name + '</div>';
        }); 
    }

    // cities
    if(!topCities) {
        loadJSON('cities.json', function(res) {
            topCities = res;
            setTopCities(id)
        });
    }
    else {setTopCities(id);}

    // languages
    var langHTML = '';
    if(countryData[id].languages.length == 0) {
        langHTML = '<span class="noData">No data</span>';
    }
    else {
        langHTML = '<ul>';
        countryData[id].languages.forEach((l) => {
            langHTML += '<li>' + l + '</li>';
        });
        langHTML += '</ul>';
    }
    document.getElementById('exploreDetailsLanguages').innerHTML = langHTML;

    if(!aliases) {
        loadJSON('countryAliases.json', function(res) {aliases=res;setExploreAliases(id);});
    }
    else {setExploreAliases(id);}
}
function setTopCities(id) {
    var citiesHTML = '';
    var a2 = countryData[id].a2.toLowerCase();
    if(!(a2 in topCities) || topCities[a2].length === 0) {
        citiesHTML = '<span class="noData">No data</span>';
    }
    else {
        citiesHTML = '<table class="subtleTable"><thead><tr><th>#</th><th>City</th><th>Population</th></tr></thead><tbody>';
        topCities[a2].forEach(function(city, x) {
            citiesHTML += '<tr><td>' + (x+1) + '</td><td>' + city[0] + '</td><td>' + (city[1] ? city[1].toLocaleString() : 'Unknown') + '</td></tr>';
        });
        citiesHTML += '</tbody></table>';
    }
    document.getElementById('explorePopulatedCities').innerHTML = citiesHTML;
}
function setExploreAliases(id) {
    var aliasesHTML = '';
    var names = id in aliases ? aliases[id].slice() : [];
    if(countryData[id].nativeName && countryData[id].nativeName !== countryData[id].name) {
        names.push([countryData[id].nativeName, 'native name']);
    }
    if(names.length == 0) {
        aliasesHTML = '<span class="noData">No alternative names</span>';
    }
    else {
        aliasesHTML = '<ul>';
        names.forEach((x) => {
            aliasesHTML += '<li>' + x[0] + ' <d>(' + x[1] + ')</d></li>';
        });
        aliasesHTML += '</ul>';
    }
    document.getElementById('exploreAlternativeNames').innerHTML = aliasesHTML;
}
function toggleExploreSearch() {
    document.getElementById('exploreSearch').classList.toggle('visible');
    if(document.getElementById('exploreSearch').classList.contains('visible')) {
        document.getElementById('countrySearch').value = '';
        document.getElementById('countrySearch').focus();
        document.getElementById('searchBarWrapper').classList.remove('hasResults');
    }
}
function filterSearch(input) {
    var cursor = input.selectionStart;
    var len = input.value.length;
    input.value = input.value.replace(/[\/]/gi, '');
    var d = len - input.value.length;
	input.setSelectionRange(cursor-d+1, cursor-d);
}
function filterPosInt(input) {
    var cursor = input.selectionStart;
    var len = input.value.length;
    input.value = input.value.replace(/[^0-9]/gi, '');
    var d = len - input.value.length;
	input.setSelectionRange(cursor-d+1, cursor-d);
}
function onExploreSearchInput(input) {
    filterSearch(input);
    var val = normalizeName(input.value);
    document.getElementById('exploreSearchSuggestions').innerHTML = '';
    document.getElementById('searchBarWrapper').classList.remove('hasResults');
    if(val !== '') {
        if(autocompletePromise) {autocompletePromise.cancel();}
        autocompletePromise = fuzzysort.goAsync(val, autocompleteCountries, autocompleteOptions);
        autocompletePromise.then(results => {
            if(results.length > 0) {document.getElementById('searchBarWrapper').classList.add('hasResults');}
            for(var i = 0;i < results.length;++i) {
                document.getElementById('exploreSearchSuggestions').innerHTML += '<div ' + (i === 0 ? 'class="active" ' : '') + 'onclick="chooseSearchCountry(this.textContent)">' + fuzzysort.highlight(results[i]).toLowerCase() + '</div>';
            }
        });
    }
}
function onExploreSearchKeyDown(event, input) {
    if(event.key === 'Enter' && input.value.trim() !== '') {
        event.preventDefault();
        if(input.value.toUpperCase() in countryData) {chooseSearchCountry(input.value);return;}
        var e = document.querySelector('#exploreSearchSuggestions > div.active');
        if(e) {e.click();}
        input.blur();
    }
    else if(event.key === 'Tab') {
        event.preventDefault();
        if(input.value.toUpperCase() in countryData) {chooseSearchCountry(input.value);return;}
        var e = document.querySelector('#exploreSearchSuggestions > div.active');
        if(e) {e.click();}
        input.blur();
    }
    else if(event.key === 'ArrowUp') {
        event.preventDefault();
        var e = document.querySelector('#exploreSearchSuggestions > div.active');
        if(e && e.previousElementSibling) {
            e.classList.remove('active');
            e.previousElementSibling.classList.add('active');
        } 
    }
    else if(event.key === 'ArrowDown') {
        event.preventDefault();
        var e = document.querySelector('#exploreSearchSuggestions > div.active');
        if(e && e.nextElementSibling) {
            e.classList.remove('active');
            e.nextElementSibling.classList.add('active');
        }  
    }
    else if(event.key === 'Escape') {
        event.preventDefault();
        toggleExploreSearch();
        input.blur();
    }
}
function chooseSearchCountry(name) {
    name = name.toUpperCase();
    var id = name in countryData ? name : name2code(name);
    if(id && id in countryData) {
        exploreMap.flyTo(countryData[id].center, calculateZoomLevel(id), {duration: transitionTime/1000});
        toggleExploreSearch();
        selectExploreCountry(id);
    }
}
function name2code(name) {
    name = normalizeName(name);
    if(name in nameToCode) {
        return nameToCode[name];
    }
    return null;
}
function name2codeEx(name) {
    var results = [];
    var normalName = normalizeName(name);
    var normalNameEx = normalizeNameExtended(name);
    if(normalNameEx in extendedNames) {results.push(...extendedNames[normalNameEx]);}
    if(normalName in nameToCode) {results.push(nameToCode[normalName]);}
    Object.keys(nameToCode).reduce((res, x) => {
        if(normalizeNameExtended(x) === normalNameEx) {
            res.push(nameToCode[x]);
        }
        return res;
    }, []);
    return [...new Set(results)];
}
function capital2code(name) {
    name = normalizeName(name);
    if(name in nameToCapital) {return nameToCapital[name];}
    return null;
}
function normalizeNameExtended(name) {
    return name.normalize('NFKD')
    .replace(/\bislands?\b/gi, '') // replace island(s)
    .replace(/\bilas?\b/gi, '') // replace ila(s)
    .replace(/\(.*\)/, '') // replace anything in parenthesses
    .replace(/^.*\bof\b/gi, '') // replace all words up to "of" including of
    .replace(/\b(the|saint|sint|san|republic)\b/gi, '') // replace some specific words
    .replace(/[^a-z]/gi, '') // delete everything except a-z (delete spaces)
    .toUpperCase(); 
}
function normalizeName(name) {
    return name.normalize('NFKD')
    .trim()
    .replace(/\s/gi, ' ')
    .replace(/[^a-z ]/gi, '') // delete everything except a-z
    .toUpperCase(); 
}