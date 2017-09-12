if (!window.RR) RR = {} ;
if (!window.RR.util) RR.util = {} ;

(function() {
    
    'use strict' ;
    
    RR.util.getCompability = (function() {
        function _checkSupport(enabled, check, isSupported) {
            var supported = {};
            Object.keys(check).forEach(function (key) {
                var chk = check[key];
                var value = false;
                if (chk instanceof Array) {
                    chk.forEach(function (c) {
                        value = isSupported(c);
                        return !value;
                    });
                } else {
                    value = isSupported(chk);
                }
                supported[key] = value;
            });
            return supported;
        }
        function getUpload() {
            try {
                var xhr = new XMLHttpRequest();
                return (!!(xhr && ('upload' in xhr) && ('onprogress' in xhr.upload)));
            } catch (e) {}
            return false;
        }
        function getCanvasSupported() {
            return document.createElement('canvas').getContext ? document.createElement('canvas') : null;
        }
        function getVideoSupported() {
            return document.createElement('video').canPlayType ? document.createElement('video') : null;
        }
        function canPlayCodec(support, check) {
            return _checkSupport(support, check, function (codec) {
                try {
                    return !!support.canPlayType(codec);
                } catch (e) {}
                return false;
            });
        }
        function getVideoTypesSupported() {
            return canPlayCodec(getVideoSupported(), {
                webm: 'video/webm; codecs="vp8.0, vorbis"',
                ogg: 'video/ogg; codecs="theora"',
                h264: [
                    'video/mp4; codecs="avc1.42E01E"',
                    'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
                ],
                mpeg: 'video/mp4; codecs="mp4v.20.8"',
                mkv: 'video/x-matroska; codecs="theora, vorbis"'
            });
        }
        function getAudioSupported() {
            return document.createElement('audio').canPlayType ? document.createElement('audio') : null;
        }
        function getAudioTypesSupported() {
            return canPlayCodec(getAudioSupported(), {
                ogg: 'audio/ogg; codecs="vorbis',
                mp3: 'audio/mpeg',
                wav: 'audio/wav; codecs="1"'
            });
        }
        function getAudioContext() {
            if (window.hasOwnProperty('AudioContext') || window.hasOwnProperty('webkitAudioContext')) {
                return true;
            }
            return false;
        }
        var getCanvasContexts = (function () {
            var cache = [];
            return function () {
                if (!cache.length) {
                    var canvas = getCanvasSupported();
                    if (canvas) {
                        var test = ['2d', 'webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];
                        test.forEach(function (tst, i) {
                            try {
                                if (!!canvas.getContext(tst)) {
                                    cache.push(tst);
                                }
                            } catch (eee) {}
                        });
                    }
                }
                return cache;
            };
        })();
        function getWebGL() {
            var result = false;
            var contexts = getCanvasContexts();
            try {
                result = (contexts.length > 1);
                if (!result) {
                    if ('WebGLRenderingContext' in window) {
                        result = true;
                    }
                }
            } catch (e) {}
            return result;
        }
        function detectCSSFeature(featurename) {
            var feature = false;
            var domPrefixes = 'Webkit Moz ms O'.split(' ');
            var elm = document.createElement('div');
            var featurenameCapital = null;
            featurename = featurename.toLowerCase();
            if (elm.style[featurename]) {
                feature = true;
            }
            if (feature === false) {
                featurenameCapital = featurename.charAt(0).toUpperCase() + featurename.substr(1);
                for (var i = 0; i < domPrefixes.length; i++) {
                    if (elm.style[domPrefixes[i] + featurenameCapital] !== undefined) {
                        feature = true;
                        break;
                    }
                }
            }
            return feature;
        }
        function getUserMedia() {
            var getMedia = false;
            if (window.navigator) {
                getMedia = (navigator.getUserMedia ||
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia ||
                    navigator.msGetUserMedia);
            }
            return !!getMedia;
        }
        function getRichText() {
            try {
                return !!document.createElement('textarea').contentEditable;
            } catch (e) {}
            return false;
        }
        function getTouch() {
            try {
                if (navigator.userAgent.match(/Windows NT 6\.(2|3)/)) {
                    return false;
                }
            } catch (e) {}
            try {
                if (navigator.userAgent.match(/iOS|Android|BlackBerry|IEMobile|iPad|iPhone|iPad/i)) {
                    return true;
                }
            } catch (e) {}
            return false;
        }
        function getDnD() {
            return !!('draggable' in document.createElement('span'));
        }
        function getSVG() {
            return (!!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect);
        }
        function getFileSystem() {
            return (('requestFileSystem' in window) || ('webkitRequestFileSystem' in window));
        }
        var checkWindow = {
            indexedDB: 'indexedDB',
            localStorage: 'localStorage',
            sessionStorage: 'sessionStorage',
            globalStorage: 'globalStorage',
            openDatabase: 'openDatabase',
            socket: 'WebSocket',
            worker: 'Worker',
            file: 'File',
            blob: 'Blob',
            orientation: 'onorientationchange'
        };
        var compability = {
            touch: getTouch(),
            upload: getUpload(),
            getUserMedia: getUserMedia(),
            fileSystem: getFileSystem(),
            localStorage: false,
            sessionStorage: false,
            globalStorage: false,
            openDatabase: false,
            socket: false,
            worker: false,
            file: false,
            blob: false,
            orientation: false,
            dnd: getDnD(),
            css: {
                transition: detectCSSFeature('transition'),
                animation: detectCSSFeature('animation')
            },
            canvas: !!getCanvasSupported(),
            canvasContext: getCanvasContexts(),
            webgl: getWebGL(),
            audioContext: getAudioContext(),
            svg: getSVG(),
            video: !!getVideoSupported(),
            videoTypes: getVideoTypesSupported(),
            audio: !!getAudioSupported(),
            audioTypes: getAudioTypesSupported(),
            richtext: getRichText()
        };
        Object.keys(checkWindow).forEach(function (key) {
            compability[key] = (checkWindow[key]in window) && window[checkWindow[key]] !== null;
        });
        return function () {
            return compability;
        };

    })(),
        
    RR.util.isIE = function() {
        var dm = parseInt(document.documentMode, 10);
        return dm <= 11 || !!navigator.userAgent.match(/(MSIE|Edge)/);
    } ;
    
    RR.util.isMobile = function() {
        return (
            (navigator.userAgent.match(/Android/i)) ||
            (navigator.userAgent.match(/webOS/i)) ||
            (navigator.userAgent.match(/iPhone/i)) ||
            (navigator.userAgent.match(/iPod/i)) ||
            (navigator.userAgent.match(/iPad/i)) ||
            (navigator.userAgent.match(/BlackBerry/))
        ) ;
    } ;
    
    RR.util.getRect = function() {
        return {
            top: 0,
            left: 0,
            width: document.body.offsetWidth,
            height: document.body.offsetHeight
        };
    } ;
    
    RR.util.getKeyboards = (function() {
        var list = {
            F1: 112,
            F2: 113,
            F3: 114,
            F4: 115,
            F6: 118,
            F7: 119,
            F8: 120,
            F9: 121,
            F10: 122,
            F11: 123,
            F12: 124,
            TILDE: 220,
            GRAVE: 192,
            CMD: 17,
            LSUPER: 91,
            RSUPER: 92,
            DELETE: 46,
            INSERT: 45,
            HOME: 36,
            END: 35,
            PGDOWN: 34,
            PGUP: 33,
            PAUSE: 19,
            BREAK: 19,
            CAPS_LOCK: 20,
            SCROLL_LOCK: 186,
            BACKSPACE: 8,
            SPACE: 32,
            TAB: 9,
            ENTER: 13,
            ESC: 27,
            LEFT: 37,
            RIGHT: 39,
            UP: 38,
            DOWN: 40
        };
        for (var n = 33; n <= 126; n++) {
            list[String.fromCharCode(n)] = n;
        }
        return Object.freeze(list);
    })() ;
    
    RR.util.getMousePosition = function(ev) {
        if (ev.detail && typeof ev.detail.x !== 'undefined' && typeof ev.detail.y !== 'undefined') {
            return {
                x: ev.detail.x,
                y: ev.detail.y
            };
        }
        var touch = ev.touches || ev.changedTouches;
        if (touch && touch[0]) {
            return {
                x: touch[0].clientX,
                y: touch[0].clientY
            };
        }
        return {
            x: ev.clientX,
            y: ev.clientY
        };
    } ;
    
    RR.util.getMouseButton = function(ev) {
        if (typeof ev.button !== 'undefined') {
            if (ev.button === 0) {
                return 'left';
            } else if (ev.button === 1) {
                return 'middle';
            }
            return 'right';
        }
        if (ev.which === 2 || ev.which === 4) {
            return 'middle';
        } else if (ev.which === 1) {
            return 'left';
        }
        return 'right';
    } ;
    
    RR.util.getKeyCombo = (function(ev) {
        var self = this ;
        var modifiers = {
            CTRL: function (ev) {
                return ev.ctrlKey;
            },
            SHIFT: function (ev) {
                return ev.shiftKey;
            },
            ALT: function (ev) {
                return ev.altKey;
            },
            META: function (ev) {
                return ev.metaKey;
            }
        };
        function getKeyName(keyCode) {
            var result = false;
            Object.keys(RR.util.getKeyboards).forEach(function (k) {
                if (!result && (keyCode ===  RR.util.getKeyboards[k])) {
                    result = k;
                }
            });
            return result;
        }
        return function (ev, checkFor) {
            var checks = checkFor.toUpperCase().split('+');
            var checkMods = {
                CTRL: false,
                SHIFT: false,
                ALT: false
            };
            var checkKeys = [];
            checks.forEach(function (f) {
                if (modifiers[f]) {
                    checkMods[f] = true;
                } else {
                    checkKeys.push(f);
                }
            });
            return Object.keys(checkMods).every(function (f) {
                var fk = !!modifiers[f](ev);
                return checkMods[f] === fk;
            }) && checkKeys.every(function (f) {
                return getKeyName(ev.keyCode) === f;
            });
        };
    })() ;

    RR.util.getCookie = function(k) {
        var map = {};
        document.cookie.split(/;\s+?/g).forEach(function (i) {
            var idx = i.indexOf('=');
            map[i.substr(i, idx)] = i.substr(idx + 1);
        });
        return k ? map[k] : map;
    } ;
    
    RR.util.format = function(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        var sprintfRegex = /\{(\d+)\}/g;
        function sprintf(match, number) {
            return number in args ? args[number] : match;
        }
        return format.replace(sprintfRegex, sprintf);
    } ;
    
    RR.util.cleanHTML = function(html) {
        return html.replace(/\n/g, '')
        .replace(/[\t ]+</g, '<')
        .replace(/\>[\t ]+</g, '><')
        .replace(/\>[\t ]+$/g, '>');
    } ;
    
    RR.util.parseUrl = function(url, modify) {
        modify = modify || {};
        if (!url.match(/^(\w+\:)\/\//)) {
            url = '//' + url;
        }
        var protocol = url.split(/^(\w+\:)?\/\//);
        var splitted = (function () {
            var tmp = protocol[2].replace(/^\/\//, '').split('/');
            return {
                proto: (modify.protocol || protocol[1] || window.location.protocol || '').replace(/\:$/, ''),
                host: modify.host || tmp.shift(),
                path: modify.path || '/' + tmp.join('/')
            };
        })();
        function _parts() {
            var parts = [splitted.proto, '://'];
            if (modify.username) {
                var authstr = String(modify.username) + ':' + String(modify.password);
                parts.push(authstr);
                parts.push('@');
            }
            parts.push(splitted.host);
            parts.push(splitted.path);
            return parts.join('');
        }
        return {
            protocol: splitted.proto,
            host: splitted.host,
            path: splitted.path,
            url: _parts()
        };
    } ;
    
    //純粹的後蓋前
    RR.util.argumentDefaults = function(args, defaults, undef) {
        args = args || {};
        Object.keys(defaults).forEach(function (key) {
            if (typeof defaults[key] === 'boolean' || typeof defaults[key] === 'number') {
                if (typeof args[key] === 'undefined' || args[key] === null) {
                    args[key] = defaults[key];
                }
            } else {
                args[key] = args[key] || defaults[key];
            }
        });
        return args ;
    } ;
    
    RR.util.cloneObject = function(o, alternative) {
        function _clone(i) {
            if (typeof i !== 'object' || i === null) {
                return i;
            } else if (i instanceof Array) {
                return i.map(_clone);
            }
            var iter = {};
            Object.keys(i).forEach(function (k) {
                iter[k] = _clone(i[k]);
            });
            return iter;
        }
        if (alternative) {
            return _clone(o);
        }
        return JSON.parse(JSON.stringify(o, function (key, value) {
                if (value && typeof value === 'object' && value.tagName) {
                    return undefined;
                }
                return value;
            }));
    } ;
    
    RR.util.colorName2Hex = function(colour) {
        var colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
                        "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
                        "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
                        "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
                        "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
                        "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
                        "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
                        "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
                        "honeydew":"#f0fff0","hotpink":"#ff69b4",
                        "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
                        "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
                        "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
                        "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
                        "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
                        "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
                        "navajowhite":"#ffdead","navy":"#000080",
                        "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
                        "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
                        "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
                        "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
                        "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
                        "violet":"#ee82ee",
                        "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
                        "yellow":"#ffff00","yellowgreen":"#9acd32"} ;
        
        if (typeof colours[colour.toLowerCase()] != 'undefined')
        return colours[colour.toLowerCase()];

        return false;
        
    } ;
    
    RR.util.colorHex2RGB = function(hex) {
        var rgb = parseInt(hex.replace('#', ''), 16);
        var val = {};
        val.r = (rgb & (255 << 16)) >> 16;
        val.g = (rgb & (255 << 8)) >> 8;
        val.b = (rgb & 255);
        return val;
    } ;
    
    RR.util.colorRGB2Hex = function(r, g, b) {
        if (typeof r === 'object') {
            g = r.g;
            b = r.b;
            r = r.r;
        }
        if (typeof r === 'undefined' || typeof g === 'undefined' || typeof b === 'undefined') {
            throw new Error('Invalid RGB supplied to convertToHEX()');
        }
        var hex = [
            parseInt(r, 10).toString(16),
            parseInt(g, 10).toString(16),
            parseInt(b, 10).toString(16)
        ];
        Object.keys(hex).forEach(function (i) {
            if (hex[i].length === 1) {
                hex[i] = '0' + hex[i];
            }
        });
        return '#' + hex.join('').toUpperCase();
    } ;
    
    RR.util.colorInvertHEX = function(hex) {
        var color = parseInt(hex.replace('#', ''), 16);
        color = 0xFFFFFF ^ color;
        color = color.toString(16);
        color = ('000000' + color).slice(-6);
        return '#' + color;
    } ;
    
    /*
    s -> single
    queue，function list，每一個function都必須有callback機制，在裡面要執行next
    */
    RR.util.asyncs = function(queue, onentry, ondone) {
        onentry = onentry || function (e, i, n) {
            return n();
        };
        ondone = ondone || function () {};
        var finished = [];
        var isdone = false;
        (function next(i) {
            if (isdone || finished.indexOf(i) !== -1) {
                return;
            }
            finished.push(i);
            if (i >= queue.length) {
                isdone = true;
                return ondone();
            }
            try {
                onentry(queue[i], i, function onAsyncIter() {
                    next(i + 1);
                });
            } catch (e) {
                console.warn('Utils::asyncs()', 'Exception while stepping', e.stack, e);
                next(i + 1);
            }
        })(0);
    } ;
    
    /*
    p -> parallel
    */
    RR.util.asyncp = function(queue, opts, onentry, ondone) {
        opts = opts || {};
        var running = 0;
        var max = opts.max || 3;
        var qleft = Object.keys(queue);
        var finished = [];
        var isdone = false;
        function spawn(i, cb) {
            function _done() {
                running--;
                cb();
            }
            if (finished.indexOf(i) !== -1) {
                return;
            }
            finished.push(i);
            running++;
            try {
                onentry(queue[i], i, _done);
            } catch (e) {
                console.warn('Utils::asyncp()', 'Exception while stepping', e.stack, e);
                _done();
            }
        }
        (function check() {
            if (!qleft.length) {
                if (running || isdone) {
                    return;
                }
                isdone = true;
                return ondone();
            }
            var d = Math.min(qleft.length, max - running);
            for (var i = 0; i < d; i++) {
                spawn(qleft.shift(), check);
            }
        })();
    } ;
    
    RR.util.getPathFromVirtual = function(str) {
        str = str || '';
        var res = str.split(/([A-z0-9\-_]+)\:\/\/(.*)/)[2] || '';
        return res.replace(/^\/?/, '/');
    } ;
    
    RR.util.getPathProtocol = function(orig) {
        var tmp = document.createElement('a');
        tmp.href = orig;
        return tmp.protocol.replace(/:$/, '');
    } ;
    
    RR.util.getFilext = function(d) {
        var ext =RR.util.getFilename(d).split('.').pop();
        return ext ? ext.toLowerCase() : null;
    } ;
    
    RR.util.getDirname = function(f) {
        function _parentDir(p) {
            var pstr = p.split(/^(.*)\:\/\/(.*)/).filter(function (n) {
                    return n !== '';
                });
            var args = pstr.pop();
            var prot = pstr.pop();
            var result = '';
            var tmp = args.split('/').filter(function (n) {
                    return n !== '';
                });
            if (tmp.length) {
                tmp.pop();
            }
            result = tmp.join('/');
            if (!result.match(/^\//)) {
                result = '/' + result;
            }
            if (prot) {
                result = prot + '://' + result;
            }
            return result;
        }
        return f.match(/^((.*)\:\/\/)?\/$/) ? f : _parentDir(f.replace(/\/$/, ''));
    } ;
    
    RR.util.getFilename = function(p) {
        return (p || '').replace(/\/$/, '').split('/').pop();
    } ;
    
    RR.util.escapeFilename = function(n) {
        return (n || '').replace(/[\|&;\$%@"<>\(\)\+,\*\/]/g, '').trim();
    } ;
    
    RR.util.humanFileSize = function(bytes, si) {
        var thresh = si ? 1000 : 1024;
        if (bytes < thresh) {
            return bytes + ' B';
        }
        var units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        var u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while (bytes >= thresh);
        return bytes.toFixed(1) + ' ' + units[u];
    } ;
    
    RR.util.humanSecFormat = function(sec) {
        if (!sec) return '00:00' ;
         
        var sec_num = parseInt(sec, 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        if (hours == '00') {
            var time    = minutes+':'+seconds;
        } else {
            var time    = hours+':'+minutes+':'+seconds;
        }
        
        return time;
    } ;
    
    RR.util.humanDateFormat = function(d, t) {
        var Y=d.getFullYear();
        var M=d.getMonth()+1;
        var D=d.getDate();
        var MM=(M>9)?M:'0'+M;
        var DD=(D>9)?D:'0'+D;
        var H = d.getHours() ;
            H = ('0'+H).substr(-2) ;
        var i = d.getMinutes() ;
        var s = d.getSeconds() ;
        switch(t){
            case 'YYYYMMDD':
                return Y+''+MM+''+DD;
            break;
            case 'YYYY-MM-DD':
                return Y+'-'+MM+'-'+DD;
            break;
            case 'YYYY/MM/DD':
                return Y+'/'+MM+'/'+DD;
            break;
            case 'YYYY/MM':
                return Y+'/'+MM;
            break;
            case 'YYYY-MM-DD H:i:s':
                return Y+'-'+MM+'-'+DD+' '+H+':'+i+':'+s;
            break;
            case 'MM/DD/YYYY H:i':
                return MM+'/'+DD+'/'+Y+' '+H+':'+i ;
            break;
            case 'MM/DD/YYYY H:i:s':
                return MM+'/'+DD+'/'+Y+' '+H+':'+i+':'+s;
            break;
        }
    } ;
    
})() ;

RR.util = $.extend(RR.util, (function() {
    
    return {
        
        showSysLoading: function() {
            $.r_loader() ;
        },
        
        hideSysLoading: function() {
            $.r_loader('close') ;
        },
        
        toast: function(string) {
            $.r_toast(string) ;
        },
        
        showLoading: function() {
            $.r_loader({
                spinner: 'spinner2',
                bgColor: 'black',
                bgOpacity: '0.2',
            }) ;
        },
        
        hideLoading: function() {
            $.r_loader('close') ;
        },
        
        loadjscssfile: function(filename, filetype, cb) {
            if (filetype=="js"){ //if filename is a external JavaScript file
                var fileref=document.createElement('script') ;
                fileref.setAttribute("type","text/javascript") ;
                fileref.setAttribute("src", filename) ;
            }
            else if (filetype=="css"){ //if filename is an external CSS file
                var fileref=document.createElement("link") ;
                fileref.setAttribute("rel", "stylesheet") ;
                fileref.setAttribute("type", "text/css") ;
                fileref.setAttribute("href", filename) ;
            }
            
            document.getElementsByTagName("head")[0].appendChild(fileref) ;
            
            fileref.onreadystatechange = fileref.onload = function() {
                cb() ;
            }
        },
        
    } ;
    
})())
