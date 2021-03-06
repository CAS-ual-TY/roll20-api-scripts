// By:       Jefe
// Contact:  https://app.roll20.net/users/451842/jefe
var Calendar = Calendar || (function() {
    'use strict';
    
    var version = 0.13,
        helpMessage = "Calendar Help: see doc at https://github.com/jfflbnntt/roll20-api-scripts/blob/master/Calendar/Calendar.md",
        unitTable = {
            's': "second",
            'm': "minute",
            'h': "hour",
            'D': "day",
            'W': "week",
            'M': "month",
            'Y': "year"
        },
        overflowTable = {
            "second": "minute",
            "minute": "hour",
            "hour"  : "day",
            "day"   : "week",
            "week"  : "month",
            "month" : "year"
        },
        defaultMax = {
            "second": 60,
            "minute": 60,
            "hour"  : 24,
            "day"   : 7,
            "week"  : 4,
            "month" : 13,
            "year"  : 0
        },
        monthNames = [
            "Olidammara 'Galehome'",
            "Ehlonna 'The Bloom'",
            "Kord 'Drawblade'",
            "Ioun 'Magus Birth'",
            "Heironeous 'Wealwind'",
            "Pelor 'The Blaze'",
            "Avandra 'Starfall'",
            "Yondalla 'The Reap'",
            "Waukeen 'Cofferfill'",
            "Sehanine 'Emberfade'",
            "Eldath 'The Rime'",
            "Auril 'Hardfrost'",
            "Kelemvor 'The Shroud'"
        ],
        dayNames = [
            "Sundas (Sun day)",
            "Morndas (Moon day)",
            "Tirdas (Toil day)",
            "Windas (Winds day)",
            "Thordas (Lore day)",
            "Fredas (Free day)",
            "Stardas (Gods day)"
        ],
        defaultTimeFormat = "?h:?m:?s?t",
        defaultDateFormat = "?DoM/?M/?Y",
        defaultFullFormat = defaultTimeFormat+" on ?DoW ?DoMth of ?MoY, ?Y",

    applyToPattern = function(calendarId, pattern) {
        var hour = parseInt(getAttr(calendarId, "hour").get("current")),
            minute = parseInt(getAttr(calendarId, "minute").get("current")),
            second = parseInt(getAttr(calendarId, "second").get("current")),
            useMilitaryTime = getAttr(calendarId, "militaryTime", "false").get("current") == "true",
            dayTime = "",
            year =  parseInt(getAttr(calendarId, "year").get("current")), 
            month =  parseInt(getAttr(calendarId, "month").get("current")) + 1, 
            week =  parseInt(getAttr(calendarId, "week").get("current")) + 1, 
            day = parseInt(getAttr(calendarId, "day").get("current")) + 1,
            dayOfMonth = (parseInt(getAttr(calendarId, "day").get("max")) * (week - 1)) + day,
            monthName = monthNames[month - 1],
            dayOfWeek = dayNames[day - 1],
            dayOfMonthExt = dayOfMonth;

        if(dayOfMonth % 10 == 1) {
            dayOfMonthExt = dayOfMonth+"st";
        } else if (dayOfMonth % 10 == 2) {
            dayOfMonthExt = dayOfMonth+"nd";
        } else if (dayOfMonth % 10 == 3) {
            dayOfMonthExt = dayOfMonth+"rd";
        } else {
            dayOfMonthExt = dayOfMonth+"th";
        }

        if(!useMilitaryTime) {
            if(hour >= 12) {
                dayTime = " pm";
                if(hour >= 13) {
                    hour = hour - 12;
                }
            } else {
                dayTime = " am";
                if(hour == 0) {
                    hour = 12;
                }
            }
        }
        if(minute < 10) {
            minute = "0"+minute;
        }
        if(second < 10) {
            second = "0"+second;
        }

        return pattern
            .replace("?t", dayTime)
            .replace("?s", second)
            .replace("?m", minute)
            .replace("?h", hour)
            .replace("?DoMth", dayOfMonthExt)
            .replace("?DoM", dayOfMonth)
            .replace("?DoW", dayOfWeek)
            .replace("?D", day)
            .replace("?W", week)
            .replace("?MoY", monthName)
            .replace("?M", month)
            .replace("?Y", year);
    },

    showDate = function(calendarId, isWhisper) {
        var dateFormat = getAttr(calendarId, "dateFormat", defaultDateFormat).get("current");
        showFormat(calendarId, "Date", dateFormat, isWhisper);
    },

    showTime = function(calendarId, isWhisper) {
        var timeFormat = getAttr(calendarId, "timeFormat", defaultTimeFormat).get("current");
        showFormat(calendarId, "Time", timeFormat, isWhisper);
    },

    showFull = function(calendarId, isWhisper) {
        var fullFormat = getAttr(calendarId, "fullFormat", defaultFullFormat).get("current");
        showFormat(calendarId, "Time and Day", fullFormat, isWhisper);
    },

    showFormat = function(calendarId, from, formatMessage, isWhisper) {
        sendChat(from, applyToPattern(calendarId, chatType(isWhisper)+" "+formatMessage));
    },

    chatType = function(isWhisper) {
        if(isWhisper == true)
            return "/w GM";
        else 
            return "/as Calendar";
    },

    getCalendarId = function() {
        var calendar = findObjs({type: "character", name: "Calendar"})[0];
        if(calendar == undefined) {
            createObj("character", {name: "Calendar"});
            calendar = findObjs({type: "character", name: "Calendar"})[0];
        }
        return calendar.id;
    },

    getAttr = function(calendarId, attrName, defaultValue) {
        var attr = findObjs({type: "attribute", characterid: calendarId, name: attrName})[0];
        if(attr == undefined) {
            if(defaultValue == undefined) {
                defaultValue = 0;
            }
            createObj("attribute", {characterid: calendarId, name: attrName, current: defaultValue});
            attr = findObjs({type: "attribute", characterid: calendarId, name: attrName})[0];
            if(defaultMax[attrName] != undefined) {
                attr.set("max", defaultMax[attrName]);
            }
        }
        return attr;
    },

    showHelp = function() {
        var help = "/w gm " + helpMessage;
        sendChat("Calendar", help);
    },

    // set or add time (add negative to subtract)
    setTime = function(calendarId, unit, amount, addToCurrent) {
        var unitOverflow = overflowTable[unit],
            unitAttr = getAttr(calendarId, unit),
            current = parseInt(unitAttr.get("current")),
            max = parseInt(unitAttr.get("max")),
            result = 0, 
            overflowAmount = 0;

        // add or set check
        if(addToCurrent) {
            result = current + amount;
        } else {
            result = amount;
        }

        // determine overflow amount if any
        if(max > 0) {
            overflowAmount = Math.trunc(result / max);
            result = result % max;
            // handle negatives
            if(result < 0) {
                result +=  max;
                overflowAmount -= 1;
            }
            // handle overflow amount if applicable
            if (overflowAmount != 0 && unitOverflow != undefined) {
                setTime(calendarId, unitOverflow, overflowAmount, true);
            }
        }

        // finally set result
        unitAttr.set("current", result);
        showFull(calendarId, true);
    },

    processCalendarCommand = function(msg, command, args) {
        var arg1 = args.shift(),
            arg2 = args.shift(),
            calendarId = getCalendarId();

        if(arg1 != undefined && arg1.length > 1 && arg1.indexOf("+") == 0) {
            var unit = unitTable[arg1.charAt(1)],
                amount = parseInt(arg2);
            setTime(calendarId, unit, amount, true);
        } else if (arg1 != undefined && arg1.length > 1 && arg1.indexOf("-") == 0) {
            var unit = unitTable[arg1.charAt(1)],
                amount = -parseInt(arg2);
            setTime(calendarId, unit, amount, true);    
        } else if (arg1 != undefined && arg1.length > 1 && arg1.indexOf("=") == 0) {
            var unit = unitTable[arg1.charAt(1)],
                amount = parseInt(arg2);
            setTime(calendarId, unit, amount, false);  
        } else if(arg1 == "time") {
            showTime(calendarId); 
        } else if (arg1 == "date") {
            showDate(calendarId);             
        } else if (arg1 == "full") {
            showFull(calendarId);             
        } else if (arg1 == "format") {
            var pattern = [arg2].concat(args).join(" ");
            showFormat(calendarId, "Calendar:", applyToPattern(calendarId, pattern));
        } else {
            showHelp();
        }
    },

    handleInput = function(msg) {
        if ( "api" !== msg.type ) {
            return; 
        }

        var content = msg.content,
            args = content.split(/\s+/), 
            command = args.shift();

        switch(command) {
            case "!calendar":                
                processCalendarCommand(msg, command, args);
                return;
        }
    },
   
    checkInstall = function() {
        log('Calendar v'+version+' Ready');            
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
    };
        
    return {
        checkInstall: checkInstall,
        registerEventHandlers: registerEventHandlers
    };
}());

on('ready', function() {
    'use strict';
    Calendar.checkInstall();
    Calendar.registerEventHandlers();
});
