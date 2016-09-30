/**
 * autoNumeric.js
 * @author: Bob Knothe
 * @author: Sokolov Yura
 * @version: 1.9.36 - 2015-05-10 GMT 8:00 PM / 20:00
 *
 * Created by Robert J. Knothe on 2010-10-25. Please report any bugs to https://github.com/BobKnothe/autoNumeric
 * Created by Sokolov Yura on 2010-11-07
 *
 * Copyright (c) 2011 Robert J. Knothe http://www.decorplanit.com/plugin/
 *
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
(function ($) {
    "use strict";
    /*jslint browser: true*/
    /*global jQuery: false*/
    /*Cross browser routine for getting selected range/cursor position
     */

    /**
     * Cross browser routine for getting selected range/cursor position
     */
    function getElementSelection(that) {
        var position = {};
        if (that.selectionStart === undefined) {
            that.focus();
            var select = document.selection.createRange();
            position.length = select.text.length;
            select.moveStart('character', -that.value.length);
            position.end = select.text.length;
            position.start = position.end - position.length;
        } else {
            position.start = that.selectionStart;
            position.end = that.selectionEnd;
            position.length = position.end - position.start;
        }
        return position;
    }

    /**
     * Cross browser routine for setting selected range/cursor position
     */
    function setElementSelection(that, start, end) {
        if (that.selectionStart === undefined) {
            that.focus();
            var r = that.createTextRange();
            r.collapse(true);
            r.moveEnd('character', end);
            r.moveStart('character', start);
            r.select();
        } else {
            that.selectionStart = start;
            that.selectionEnd = end;
        }
    }

    /**
     * run callbacks in parameters if any
     * any parameter could be a callback:
     * - a function, which invoked with jQuery element, parameters and this parameter name and returns parameter value
     * - a name of function, attached to $(selector).autoNumeric.functionName(){} - which was called previously
     */
    function runCallbacks($this, settings) {
        /**
         * loops through the settings object (option array) to find the following
         * k = option name example k=aNum
         * val = option value example val=0123456789
         */
        $.each(settings, function (k, val) {
            if (typeof val === 'function') {
                settings[k] = val($this, settings, k);
            } else if (typeof $this.autoNumeric[val] === 'function') {
                /**
                 * calls the attached function from the html5 data example: data-a-sign="functionName"
                 */
                settings[k] = $this.autoNumeric[val]($this, settings, k);
            }
        });
    }

    /**
     * Converts the vMin, vMax & mDec string to numeric value
     */
    function convertKeyToNumber(settings, key) {
        if (typeof (settings[key]) === 'string') {
            settings[key] *= 1;
        }
    }

    /**
     * Preparing user defined options for further usage
     * merge them with defaults appropriately
     */
    function autoCode($this, settings) {
        runCallbacks($this, settings);
        settings.tagList = ['b', 'caption', 'cite', 'code', 'dd', 'del', 'div', 'dfn', 'dt', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ins', 'kdb', 'label', 'li', 'output', 'p', 'q', 's', 'sample', 'span', 'strong', 'td', 'th', 'u', 'var'];
        var vmax = settings.vMax.toString().split('.'),
            vmin = (!settings.vMin && settings.vMin !== 0) ? [] : settings.vMin.toString().split('.');
        convertKeyToNumber(settings, 'vMax');
        convertKeyToNumber(settings, 'vMin');
        convertKeyToNumber(settings, 'mDec'); /** set mDec if not defined by user */
        settings.mDec = (settings.mRound === 'CHF') ? '2' : settings.mDec;
        settings.allowLeading = true;
        settings.aNeg = settings.vMin < 0 ? '-' : '';
        vmax[0] = vmax[0].replace('-', '');
        vmin[0] = vmin[0].replace('-', '');
        settings.mInt = Math.max(vmax[0].length, vmin[0].length, 1);
        if (settings.mDec === null) {
            var vmaxLength = 0,
                vminLength = 0;
            if (vmax[1]) {
                vmaxLength = vmax[1].length;
            }
            if (vmin[1]) {
                vminLength = vmin[1].length;
            }
            settings.mDec = Math.max(vmaxLength, vminLength);
        } /** set alternative decimal separator key */
        if (settings.altDec === null && settings.mDec > 0) {
            if (settings.aDec === '.' && settings.aSep !== ',') {
                settings.altDec = ',';
            } else if (settings.aDec === ',' && settings.aSep !== '.') {
                settings.altDec = '.';
            }
        }
        /** cache regexps for autoStrip */
        var aNegReg = settings.aNeg ? '([-\\' + settings.aNeg + ']?)' : '(-?)';
        settings.aNegRegAutoStrip = aNegReg;
        settings.skipFirstAutoStrip = new RegExp(aNegReg + '[^-' + (settings.aNeg ? '\\' + settings.aNeg : '') + '\\' + settings.aDec + '\\d]' + '.*?(\\d|\\' + settings.aDec + '\\d)');
        settings.skipLastAutoStrip = new RegExp('(\\d\\' + settings.aDec + '?)[^\\' + settings.aDec + '\\d]\\D*$');
        var allowed = '-' + settings.aNum + '\\' + settings.aDec;
        settings.allowedAutoStrip = new RegExp('[^' + allowed + ']', 'gi');
        settings.numRegAutoStrip = new RegExp(aNegReg + '(?:\\' + settings.aDec + '?(\\d+\\' + settings.aDec + '\\d+)|(\\d*(?:\\' + settings.aDec + '\\d*)?))');
        return settings;
    }

    /**
     * strips all unwanted characters and leave only a number alert
     */
    function autoStrip(s, settings, strip_zero) {
        if (settings.aSign) { /** remove currency sign */
            while (s.indexOf(settings.aSign) > -1) {
                s = s.replace(settings.aSign, '');
            }
        }
        s = s.replace(settings.skipFirstAutoStrip, '$1$2'); /** first replace anything before digits */
        s = s.replace(settings.skipLastAutoStrip, '$1'); /** then replace anything after digits */
        s = s.replace(settings.allowedAutoStrip, ''); /** then remove any uninterested characters */
        if (settings.altDec) {
            s = s.replace(settings.altDec, settings.aDec);
        } /** get only number string */
        var m = s.match(settings.numRegAutoStrip);
        s = m ? [m[1], m[2], m[3]].join('') : '';
        if ((settings.lZero === 'allow' || settings.lZero === 'keep') && strip_zero !== 'strip') {
            var parts = [],
                nSign = '';
            parts = s.split(settings.aDec);
            if (parts[0].indexOf('-') !== -1) {
                nSign = '-';
                parts[0] = parts[0].replace('-', '');
            }
            if (parts[0].length > settings.mInt && parts[0].charAt(0) === '0') { /** strip leading zero if need */
            parts[0] = parts[0].slice(1);
            }
            s = nSign + parts.join(settings.aDec);
        }
        if ((strip_zero && settings.lZero === 'deny') || (strip_zero && settings.lZero === 'allow' && settings.allowLeading === false)) {
            var strip_reg = '^' + settings.aNegRegAutoStrip + '0*(\\d' + (strip_zero === 'leading' ? ')' : '|$)');
            strip_reg = new RegExp(strip_reg);
            s = s.replace(strip_reg, '$1$2');
        }
        return s;
    }

    /**
     * places or removes brackets on negative values
     * works only when with pSign: 'p'
     */
    function negativeBracket(s, settings) {
        if (settings.pSign === 'p') {
            var brackets = settings.nBracket.split(',');
            if (!settings.hasFocus && !settings.removeBrackets) {
                s = s.replace(settings.aNeg, '');
                s = brackets[0] + s + brackets[1];
            } else if ((settings.hasFocus && s.charAt(0) === brackets[0]) || (settings.removeBrackets && s.charAt(0) === brackets[0])) {
                s = s.replace(brackets[0], settings.aNeg);
                s = s.replace(brackets[1], '');
            }
        }
        return s;
    }

    /**
     * function to handle numbers less than 0 that are stored in Exponential notation ex: .0000001 stored as 1e-7
     */
    function checkValue(value, settings) {
        if (value) {
            var checkSmall = +value;
            if (checkSmall < 0.000001 && checkSmall > -1) {
                value = +value;
                if (value < 0.000001 && value > 0) {
                    value = (value + 10).toString();
                    value = value.substring(1);
                }
                if (value < 0 && value > -1) {
                    value = (value - 10).toString();
                    value = '-' + value.substring(2);
                }
                value = value.toString();
            } else {
                var parts = value.split('.');
                if (parts[1] !== undefined) {
                    if (+parts[1] === 0) {
                        value = parts[0];
                    } else {
                        parts[1] = parts[1].replace(/0*$/, '');
                        value = parts.join('.');
                    }
                }
            }
        }
        return (settings.lZero === 'keep') ? value : value.replace(/^0*(\d)/, '$1');
    }

    /**
     * prepare number string to be converted to real number
     */
    function fixNumber(s, aDec, aNeg) {
        if (aDec && aDec !== '.') {
            s = s.replace(aDec, '.');
        }
        if (aNeg && aNeg !== '-') {
            s = s.replace(aNeg, '-');
        }
        if (!s.match(/\d/)) {
            s += '0';
        }
        return s;
    }

    /**
     * prepare real number to be converted to our format
     */
    function presentNumber(s, aDec, aNeg) {
        if (aNeg && aNeg !== '-') {
            s = s.replace('-', aNeg);
        }
        if (aDec && aDec !== '.') {
            s = s.replace('.', aDec);
        }
        return s;
    }

    /**
     * private function to check for empty value
     */
    function checkEmpty(iv, settings, signOnEmpty) {
        if (iv === '' || iv === settings.aNeg) {
            if (settings.wEmpty === 'zero') {
                return iv + '0';
            }
            if (settings.wEmpty === 'sign' || signOnEmpty) {
                return iv + settings.aSign;
            }
            return iv;
        }
        return null;
    }

    /**
     * private function that formats our number
     */
    function autoGroup(iv, settings) {
        iv = autoStrip(iv, settings);
        var testNeg = iv.replace(',', '.'),
            empty = checkEmpty(iv, settings, true);
        if (empty !== null) {
            return empty;
        }
        var digitalGroup = '';
        if (settings.dGroup === 2) {
            digitalGroup = /(\d)((\d)(\d{2}?)+)$/;
        } else if (settings.dGroup === 4) {
            digitalGroup = /(\d)((\d{4}?)+)$/;
        } else {
            digitalGroup = /(\d)((\d{3}?)+)$/;
        } /** splits the string at the decimal string */
        var ivSplit = iv.split(settings.aDec);
        if (settings.altDec && ivSplit.length === 1) {
            ivSplit = iv.split(settings.altDec);
        } /** assigns the whole number to the a variable (s) */
        var s = ivSplit[0];
        if (settings.aSep) {
            while (digitalGroup.test(s)) { /** re-inserts the thousand separator via a regular expression */
            s = s.replace(digitalGroup, '$1' + settings.aSep + '$2');
            }
        }
        if (settings.mDec !== 0 && ivSplit.length > 1) {
            if (ivSplit[1].length > settings.mDec) {
                ivSplit[1] = ivSplit[1].substring(0, settings.mDec);
            } /** joins the whole number with the decimal value */
            iv = s + settings.aDec + ivSplit[1];
        } else { /** if whole numbers only */
        iv = s;
        }
        if (settings.aSign) {
            var has_aNeg = iv.indexOf(settings.aNeg) !== -1;
            iv = iv.replace(settings.aNeg, '');
            iv = settings.pSign === 'p' ? settings.aSign + iv : iv + settings.aSign;
            if (has_aNeg) {
                iv = settings.aNeg + iv;
            }
        }
        if (testNeg < 0 && settings.nBracket !== null) { /** removes the negative sign and places brackets */
        iv = negativeBracket(iv, settings);
        }
        return iv;
    }

    /**
     * round number after setting by pasting or $().autoNumericSet()
     * private function for round the number
     * please note this handled as text - JavaScript math function can return inaccurate values
     * also this offers multiple rounding methods that are not easily accomplished in JavaScript
     */
    function autoRound(iv, settings) { /** value to string */
    iv = (iv === '') ? '0' : iv.toString();
        convertKeyToNumber(settings, 'mDec'); /** set mDec to number needed when mDec set by 'update method */
        if (settings.mRound === 'CHF') {
            iv = (Math.round(iv * 20) / 20).toString();
        }
        var ivRounded = '',
            i = 0,
            nSign = '',
            rDec = (typeof (settings.aPad) === 'boolean' || settings.aPad === null) ? (settings.aPad ? settings.mDec : 0) : +settings.aPad;
        var truncateZeros = function (ivRounded) { /** truncate not needed zeros */
        var regex = (rDec === 0) ? (/(\.(?:\d*[1-9])?)0*$/) : rDec === 1 ? (/(\.\d(?:\d*[1-9])?)0*$/) : new RegExp('(\\.\\d{' + rDec + '}(?:\\d*[1-9])?)0*$');
            ivRounded = ivRounded.replace(regex, '$1'); /** If there are no decimal places, we don't need a decimal point at the end */
            if (rDec === 0) {
                ivRounded = ivRounded.replace(/\.$/, '');
            }
            return ivRounded;
        };
        if (iv.charAt(0) === '-') { /** Checks if the iv (input Value)is a negative value */
        nSign = '-';
            iv = iv.replace('-', ''); /** removes the negative sign will be added back later if required */
        }
        if (!iv.match(/^\d/)) { /** append a zero if first character is not a digit (then it is likely to be a dot)*/
        iv = '0' + iv;
        }
        if (nSign === '-' && +iv === 0) { /** determines if the value is zero - if zero no negative sign */
        nSign = '';
        }
        if ((+iv > 0 && settings.lZero !== 'keep') || (iv.length > 0 && settings.lZero === 'allow')) { /** trims leading zero's if needed */
        iv = iv.replace(/^0*(\d)/, '$1');
        }
        var dPos = iv.lastIndexOf('.'),
            /** virtual decimal position */
            vdPos = (dPos === -1) ? iv.length - 1 : dPos,
            /** checks decimal places to determine if rounding is required */
            cDec = (iv.length - 1) - vdPos; /** check if no rounding is required */
        if (cDec <= settings.mDec) {
            ivRounded = iv; /** check if we need to pad with zeros */
            if (cDec < rDec) {
                if (dPos === -1) {
                    ivRounded += '.';
                }
                var zeros = '000000';
                while (cDec < rDec) {
                    zeros = zeros.substring(0, rDec - cDec);
                    ivRounded += zeros;
                    cDec += zeros.length;
                }
            } else if (cDec > rDec) {
                ivRounded = truncateZeros(ivRounded);
            } else if (cDec === 0 && rDec === 0) {
                ivRounded = ivRounded.replace(/\.$/, '');
            }
            if (settings.mRound !== 'CHF') {
                return (+ivRounded === 0) ? ivRounded : nSign + ivRounded;
            }
            if (settings.mRound === 'CHF') {
                dPos = ivRounded.lastIndexOf('.');
                iv = ivRounded;
            }

        } /** rounded length of the string after rounding */
        var rLength = dPos + settings.mDec,
            tRound = +iv.charAt(rLength + 1),
            ivArray = iv.substring(0, rLength + 1).split(''),
            odd = (iv.charAt(rLength) === '.') ? (iv.charAt(rLength - 1) % 2) : (iv.charAt(rLength) % 2),
            onePass = true;
        if (odd !== 1) {
            odd = (odd === 0 && (iv.substring(rLength + 2, iv.length) > 0)) ? 1 : 0;
        }
        /*jslint white: true*/
        if ((tRound > 4 && settings.mRound === 'S') || /**                      Round half up symmetric */
            (tRound > 4 && settings.mRound === 'A' && nSign === '') || /**      Round half up asymmetric positive values */
            (tRound > 5 && settings.mRound === 'A' && nSign === '-') || /**     Round half up asymmetric negative values */
            (tRound > 5 && settings.mRound === 's') || /**                      Round half down symmetric */
            (tRound > 5 && settings.mRound === 'a' && nSign === '') || /**      Round half down asymmetric positive values */
            (tRound > 4 && settings.mRound === 'a' && nSign === '-') || /**     Round half down asymmetric negative values */
            (tRound > 5 && settings.mRound === 'B') || /**                      Round half even "Banker's Rounding" */
            (tRound === 5 && settings.mRound === 'B' && odd === 1) || /**       Round half even "Banker's Rounding" */
            (tRound > 0 && settings.mRound === 'C' && nSign === '') || /**      Round to ceiling toward positive infinite */
            (tRound > 0 && settings.mRound === 'F' && nSign === '-') || /**     Round to floor toward negative infinite */
            (tRound > 0 && settings.mRound === 'U') || /**                      round up away from zero */
            (settings.mRound === 'CHF')) { /**                                  Round Swiss FRanc */
            /*jslint white: false*/
            for (i = (ivArray.length - 1); i >= 0; i -= 1) { /** Round up the last digit if required, and continue until no more 9's are found */
                if (ivArray[i] !== '.') {
                    if (settings.mRound === 'CHF' && ivArray[i] <= 2 && onePass) {
                        ivArray[i] = 0;
                        onePass = false;
                        break;
                    }
                    if (settings.mRound === 'CHF' && ivArray[i] <= 7 && onePass) {
                        ivArray[i] = 5;
                        onePass = false;
                        break;
                    }
                    if (settings.mRound === 'CHF' && onePass) {
                        ivArray[i] = 10;
                        onePass = false;
                    } else {
                        ivArray[i] = +ivArray[i] + 1;
                    }
                    if (ivArray[i] < 10) {
                        break;
                    }
                    if (i > 0) {
                        ivArray[i] = '0';
                    }
                }
            }
        }
        ivArray = ivArray.slice(0, rLength + 1); /** Reconstruct the string, converting any 10's to 0's */
        ivRounded = truncateZeros(ivArray.join('')); /** return rounded value */
        return (+ivRounded === 0) ? ivRounded : nSign + ivRounded;
    }

    /**
     * truncate decimal part of a number
     */
    function truncateDecimal(s, settings, paste) {
        var aDec = settings.aDec,
            mDec = settings.mDec;
        s = (paste === 'paste') ? autoRound(s, settings) : s;
        if (aDec && mDec) {
            var parts = s.split(aDec);
            /** truncate decimal part to satisfying length
             * cause we would round it anyway */
            if (parts[1] && parts[1].length > mDec) {
                if (mDec > 0) {
                    parts[1] = parts[1].substring(0, mDec);
                    s = parts.join(aDec);
                } else {
                    s = parts[0];
                }
            }
        }
        return s;
    }

    /**
     * checking that number satisfy format conditions
     * and lays between settings.vMin and settings.vMax
     * and the string length does not exceed the digits in settings.vMin and settings.vMax
     */
    function autoCheck(s, settings) {
        s = autoStrip(s, settings);
        s = truncateDecimal(s, settings);
        s = fixNumber(s, settings.aDec, settings.aNeg);
        var value = +s;
        return value >= settings.vMin && value <= settings.vMax;
    }

    /**
     * Holder object for field properties
     */
    function AutoNumericHolder(that, settings) {
        this.settings = settings;
        this.that = that;
        this.$that = $(that);
        this.formatted = false;
        this.settingsClone = autoCode(this.$that, this.settings);
        this.value = that.value;
    }
    AutoNumericHolder.prototype = {
        init: function (e) {
            this.value = this.that.value;
            this.settingsClone = autoCode(this.$that, this.settings);
            this.ctrlKey = e.ctrlKey;
            this.cmdKey = e.metaKey;
            this.shiftKey = e.shiftKey;
            this.selection = getElementSelection(this.that); /** keypress event overwrites meaningful value of e.keyCode */
            if (e.type === 'keydown' || e.type === 'keyup') {
                this.kdCode = e.keyCode;
            }
            this.which = e.which;
            this.processed = false;
            this.formatted = false;
        },
        setSelection: function (start, end, setReal) {
            start = Math.max(start, 0);
            end = Math.min(end, this.that.value.length);
            this.selection = {
                start: start,
                end: end,
                length: end - start
            };
            if (setReal === undefined || setReal) {
                setElementSelection(this.that, start, end);
            }
        },
        setPosition: function (pos, setReal) {
            this.setSelection(pos, pos, setReal);
        },
        getBeforeAfter: function () {
            var value = this.value,
                left = value.substring(0, this.selection.start),
                right = value.substring(this.selection.end, value.length);
            return [left, right];
        },
        getBeforeAfterStriped: function () {
            var parts = this.getBeforeAfter();
            parts[0] = autoStrip(parts[0], this.settingsClone);
            parts[1] = autoStrip(parts[1], this.settingsClone);
            return parts;
        },

        /**
         * strip parts from excess characters and leading zeroes
         */
        normalizeParts: function (left, right) {
            var settingsClone = this.settingsClone;
            right = autoStrip(right, settingsClone); /** if right is not empty and first character is not aDec, */
            /** we could strip all zeros, otherwise only leading */
            var strip = right.match(/^\d/) ? true : 'leading';
            left = autoStrip(left, settingsClone, strip); /** prevents multiple leading zeros from being entered */
            if ((left === '' || left === settingsClone.aNeg) && settingsClone.lZero === 'deny') {
                if (right > '') {
                    right = right.replace(/^0*(\d)/, '$1');
                }
            }
            var new_value = left + right; /** insert zero if has leading dot */
            if (settingsClone.aDec) {
                var m = new_value.match(new RegExp('^' + settingsClone.aNegRegAutoStrip + '\\' + settingsClone.aDec));
                if (m) {
                    left = left.replace(m[1], m[1] + '0');
                    new_value = left + right;
                }
            } /** insert zero if number is empty and io.wEmpty == 'zero' */
            if (settingsClone.wEmpty === 'zero' && (new_value === settingsClone.aNeg || new_value === '')) {
                left += '0';
            }
            return [left, right];
        },

        /**
         * set part of number to value keeping position of cursor
         */
        setValueParts: function (left, right, paste) {
            var settingsClone = this.settingsClone,
                parts = this.normalizeParts(left, right),
                new_value = parts.join(''),
                position = parts[0].length;
            if (autoCheck(new_value, settingsClone)) {
                new_value = truncateDecimal(new_value, settingsClone, paste);
                if (position > new_value.length) {
                    position = new_value.length;
                }
                this.value = new_value;
                this.setPosition(position, false);
                return true;
            }
            return false;
        },

        /**
         * helper function for expandSelectionOnSign
         * returns sign position of a formatted value
         */
        signPosition: function () {
            var settingsClone = this.settingsClone,
                aSign = settingsClone.aSign,
                that = this.that;
            if (aSign) {
                var aSignLen = aSign.length;
                if (settingsClone.pSign === 'p') {
                    var hasNeg = settingsClone.aNeg && that.value && that.value.charAt(0) === settingsClone.aNeg;
                    return hasNeg ? [1, aSignLen + 1] : [0, aSignLen];
                }
                var valueLen = that.value.length;
                return [valueLen - aSignLen, valueLen];
            }
            return [1000, -1];
        },

        /**
         * expands selection to cover whole sign
         * prevents partial deletion/copying/overwriting of a sign
         */
        expandSelectionOnSign: function (setReal) {
            var sign_position = this.signPosition(),
                selection = this.selection;
            if (selection.start < sign_position[1] && selection.end > sign_position[0]) { /** if selection catches something except sign and catches only space from sign */
                if ((selection.start < sign_position[0] || selection.end > sign_position[1]) && this.value.substring(Math.max(selection.start, sign_position[0]), Math.min(selection.end, sign_position[1])).match(/^\s*$/)) { /** then select without empty space */
                    if (selection.start < sign_position[0]) {
                        this.setSelection(selection.start, sign_position[0], setReal);
                    } else {
                        this.setSelection(sign_position[1], selection.end, setReal);
                    }
                } else { /** else select with whole sign */
                this.setSelection(Math.min(selection.start, sign_position[0]), Math.max(selection.end, sign_position[1]), setReal);
                }
            }
        },

        /**
         * try to strip pasted value to digits
         */
        checkPaste: function () {
            if (this.valuePartsBeforePaste !== undefined) {
                var parts = this.getBeforeAfter(),

                    oldParts = this.valuePartsBeforePaste;
                delete this.valuePartsBeforePaste; /** try to strip pasted value first */
                parts[0] = parts[0].substr(0, oldParts[0].length) + autoStrip(parts[0].substr(oldParts[0].length), this.settingsClone);
                if (!this.setValueParts(parts[0], parts[1], 'paste')) {
                    this.value = oldParts.join('');
                    this.setPosition(oldParts[0].length, false);
                }
            }
        },

        /**
         * process pasting, cursor moving and skipping of not interesting keys
         * if returns true, further processing is not performed
         */
        skipAllways: function (e) {
            var kdCode = this.kdCode,
                which = this.which,
                ctrlKey = this.ctrlKey,
                cmdKey = this.cmdKey,
                shiftKey = this.shiftKey; /** catch the ctrl up on ctrl-v */
            if (((ctrlKey || cmdKey) && e.type === 'keyup' && this.valuePartsBeforePaste !== undefined) || (shiftKey && kdCode === 45)) {
                this.checkPaste();
                return false;
            }
            /** codes are taken from http://www.cambiaresearch.com/c4/702b8cd1-e5b0-42e6-83ac-25f0306e3e25/Javascript-Char-Codes-Key-Codes.aspx
             * skip Fx keys, windows keys, other special keys
             * Thanks Ney Estrabelli for the FF for Mac meta key support "keycode 224"
             */
            if ((kdCode >= 112 && kdCode <= 123) || (kdCode >= 91 && kdCode <= 93) || (kdCode >= 9 && kdCode <= 31) || (kdCode < 8 && (which === 0 || which === kdCode)) || kdCode === 144 || kdCode === 145 || kdCode === 45 || kdCode === 224) {
                return true;
            }
            if ((ctrlKey || cmdKey) && kdCode === 65) { /** if select all (a=65)*/
                return true;
            }
            if ((ctrlKey || cmdKey) && (kdCode === 67 || kdCode === 86 || kdCode === 88)) { /** if copy (c=67) paste (v=86) or cut (x=88) */
                if (e.type === 'keydown') {
                    this.expandSelectionOnSign();
                }
                if (kdCode === 86 || kdCode === 45) { /** try to prevent wrong paste */
                    if (e.type === 'keydown' || e.type === 'keypress') {
                        if (this.valuePartsBeforePaste === undefined) {
                            this.valuePartsBeforePaste = this.getBeforeAfter();
                        }
                    } else {
                        this.checkPaste();
                    }
                }
                return e.type === 'keydown' || e.type === 'keypress' || kdCode === 67;
            }
            if (ctrlKey || cmdKey) {
                return true;
            }
            if (kdCode === 37 || kdCode === 39) { /** jump over thousand separator */
            var aSep = this.settingsClone.aSep,
                start = this.selection.start,
                value = this.that.value;
                if (e.type === 'keydown' && aSep && !this.shiftKey) {
                    if (kdCode === 37 && value.charAt(start - 2) === aSep) {
                        this.setPosition(start - 1);
                    } else if (kdCode === 39 && value.charAt(start + 1) === aSep) {
                        this.setPosition(start + 1);
                    }
                }
                return true;
            }
            if (kdCode >= 34 && kdCode <= 40) {
                return true;
            }
            return false;
        },

        /**
         * process deletion of characters
         * returns true if processing performed
         */
        processAllways: function () {
            var parts; /** process backspace or delete */
            if (this.kdCode === 8 || this.kdCode === 46) {
                if (!this.selection.length) {
                    parts = this.getBeforeAfterStriped();
                    if (this.kdCode === 8) {
                        parts[0] = parts[0].substring(0, parts[0].length - 1);
                    } else {
                        parts[1] = parts[1].substring(1, parts[1].length);
                    }
                    this.setValueParts(parts[0], parts[1]);
                } else {
                    this.expandSelectionOnSign(false);
                    parts = this.getBeforeAfterStriped();
                    this.setValueParts(parts[0], parts[1]);
                }
                return true;
            }
            return false;
        },

        /**
         * process insertion of characters
         * returns true if processing performed
         */
        processKeypress: function () {
            var settingsClone = this.settingsClone,
                cCode = String.fromCharCode(this.which),
                parts = this.getBeforeAfterStriped(),
                left = parts[0],
                right = parts[1]; /** start rules when the decimal character key is pressed */
            /** always use numeric pad dot to insert decimal separator */
            if (cCode === settingsClone.aDec || (settingsClone.altDec && cCode === settingsClone.altDec) || ((cCode === '.' || cCode === ',') && this.kdCode === 110)) { /** do not allow decimal character if no decimal part allowed */
                if (!settingsClone.mDec || !settingsClone.aDec) {
                    return true;
                } /** do not allow decimal character before aNeg character */
                if (settingsClone.aNeg && right.indexOf(settingsClone.aNeg) > -1) {
                    return true;
                } /** do not allow decimal character if other decimal character present */
                if (left.indexOf(settingsClone.aDec) > -1) {
                    return true;
                }
                if (right.indexOf(settingsClone.aDec) > 0) {
                    return true;
                }
                if (right.indexOf(settingsClone.aDec) === 0) {
                    right = right.substr(1);
                }
                this.setValueParts(left + settingsClone.aDec, right);
                return true;
            }
            /**
             * start rule on negative sign & prevent minus if not allowed
             */
            if (cCode === '-' || cCode === '+') {
                if (!settingsClone.aNeg) {
                    return true;
                } /** caret is always after minus */
                if (left === '' && right.indexOf(settingsClone.aNeg) > -1) {
                    left = settingsClone.aNeg;
                    right = right.substring(1, right.length);
                } /** change sign of number, remove part if should */
                if (left.charAt(0) === settingsClone.aNeg) {
                    left = left.substring(1, left.length);
                } else {
                    left = (cCode === '-') ? settingsClone.aNeg + left : left;
                }
                this.setValueParts(left, right);
                return true;
            } /** digits */
            if (cCode >= '0' && cCode <= '9') { /** if try to insert digit before minus */
                if (settingsClone.aNeg && left === '' && right.indexOf(settingsClone.aNeg) > -1) {
                    left = settingsClone.aNeg;
                    right = right.substring(1, right.length);
                }
                if (settingsClone.vMax <= 0 && settingsClone.vMin < settingsClone.vMax && this.value.indexOf(settingsClone.aNeg) === -1 && cCode !== '0') {
                    left = settingsClone.aNeg + left;
                }
                this.setValueParts(left + cCode, right);
                return true;
            } /** prevent any other character */
            return true;
        },

        /**
         * formatting of just processed value with keeping of cursor position
         */
        formatQuick: function () {
            var settingsClone = this.settingsClone,
                parts = this.getBeforeAfterStriped(),
                leftLength = this.value;
            if ((settingsClone.aSep === '' || (settingsClone.aSep !== '' && leftLength.indexOf(settingsClone.aSep) === -1)) && (settingsClone.aSign === '' || (settingsClone.aSign !== '' && leftLength.indexOf(settingsClone.aSign) === -1))) {
                var subParts = [],
                    nSign = '';
                subParts = leftLength.split(settingsClone.aDec);
                if (subParts[0].indexOf('-') > -1) {
                    nSign = '-';
                    subParts[0] = subParts[0].replace('-', '');
                    parts[0] = parts[0].replace('-', '');
                }
                if (subParts[0].length > settingsClone.mInt && parts[0].charAt(0) === '0') { /** strip leading zero if need */
                parts[0] = parts[0].slice(1);
                }
                parts[0] = nSign + parts[0];
            }
            var value = autoGroup(this.value, this.settingsClone),
                position = value.length;
            if (value) {
                /** prepare regexp which searches for cursor position from unformatted left part */
                var left_ar = parts[0].split(''),
                    i = 0;
                for (i; i < left_ar.length; i += 1) { /** thanks Peter Kovari */
                    if (!left_ar[i].match('\\d')) {
                        left_ar[i] = '\\' + left_ar[i];
                    }
                }
                var leftReg = new RegExp('^.*?' + left_ar.join('.*?'));
                /** search cursor position in formatted value */
                var newLeft = value.match(leftReg);
                if (newLeft) {
                    position = newLeft[0].length;
                    /** if we are just before sign which is in prefix position */
                    if (((position === 0 && value.charAt(0) !== settingsClone.aNeg) || (position === 1 && value.charAt(0) === settingsClone.aNeg)) && settingsClone.aSign && settingsClone.pSign === 'p') {
                        /** place caret after prefix sign */
                        position = this.settingsClone.aSign.length + (value.charAt(0) === '-' ? 1 : 0);
                    }
                } else if (settingsClone.aSign && settingsClone.pSign === 's') {
                    /** if we could not find a place for cursor and have a sign as a suffix */
                    /** place carret before suffix currency sign */
                    position -= settingsClone.aSign.length;
                }
            }
            this.that.value = value;
            this.setPosition(position);
            this.formatted = true;
        }
    };

    /**
     * thanks to Anthony & Evan C
     */
    function autoGet(obj) {
        if (typeof obj === 'string') {
            obj = obj.replace(/\[/g, "\\[").replace(/\]/g, "\\]");
            obj = '#' + obj.replace(/(:|\.)/g, '\\$1');
            /** obj = '#' + obj.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1'); */
            /** possible modification to replace the above 2 lines */
        }
        return $(obj);
    }

    /**
     * function to attach data to the element
     * and imitate the holder
     */
    function getHolder($that, settings, update) {
        var data = $that.data('autoNumeric');
        if (!data) {
            data = {};
            $that.data('autoNumeric', data);
        }
        var holder = data.holder;
        if ((holder === undefined && settings) || update) {
            holder = new AutoNumericHolder($that.get(0), settings);
            data.holder = holder;
        }
        return holder;
    }

    var methods = {

        /**
         * Method to initiate autoNumeric and attached the settings (default and options passed as a parameter
         * $(someSelector).autoNumeric('init'); // initiate autoNumeric with defaults
         * $(someSelector).autoNumeric('init', {option}); // initiate autoNumeric with options
         * $(someSelector).autoNumeric(); // initiate autoNumeric with defaults
         * $(someSelector).autoNumeric({option}); // initiate autoNumeric with options
         * options passes as a parameter example '{aSep: '.', aDec: ',', aSign: '€ '}
         */
        init: function (options) {
            return this.each(function () {
                var $this = $(this),
                    settings = $this.data('autoNumeric'), /** attempt to grab 'autoNumeric' settings, if they don't exist returns "undefined". */
                    tagData = $this.data(), /** attempt to grab HTML5 data, if they don't exist we'll get "undefined".*/
                    $input = $this.is('input[type=text], input[type=hidden], input[type=tel], input:not([type])');
                if (typeof settings !== 'object') { /** If we couldn't grab settings, create them from defaults and passed options. */
                settings = $.extend({}, $.fn.autoNumeric.defaults, tagData, options, {
                    aNum: '0123456789',
                    hasFocus: false,
                    removeBrackets: false,
                    runOnce: false,
                    tagList: ['b', 'caption', 'cite', 'code', 'dd', 'del', 'div', 'dfn', 'dt', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ins', 'kdb', 'label', 'li', 'output', 'p', 'q', 's', 'sample', 'span', 'strong', 'td', 'th', 'u', 'var']
                }); /** Merge defaults, tagData and options */
                    if (settings.aDec === settings.aSep) {
                        $.error("autoNumeric will not function properly when the decimal character aDec: '" + settings.aDec + "' and thousand separator aSep: '" + settings.aSep + "' are the same character");
                    }
                    $this.data('autoNumeric', settings); /** Save our new settings */
                } else {
                    return this;
                }
                var holder = getHolder($this, settings);
                if (!$input && $this.prop('tagName').toLowerCase() === 'input') { /** checks for non-supported input types */
                $.error('The input type "' + $this.prop('type') + '" is not supported by autoNumeric()');

                }
                if ($.inArray($this.prop('tagName').toLowerCase(), settings.tagList) === -1 && $this.prop('tagName').toLowerCase() !== 'input') {
                    $.error("The <" + $this.prop('tagName').toLowerCase() + "> is not supported by autoNumeric()");

                }
                if (settings.runOnce === false && settings.aForm) { /** routine to format default value on page load */
                    if ($input) {
                        var setValue = true;
                        if ($this[0].value === '' && settings.wEmpty === 'empty') {
                            $this[0].value = '';
                            setValue = false;
                        }
                        if ($this[0].value === '' && settings.wEmpty === 'sign') {
                            $this[0].value = settings.aSign;
                            setValue = false;
                        }
                        if (setValue && $this[0].value === $this.prop('defaultValue')) {
                            $this.autoNumeric('set', $this.val());
                        }
                    }
                    if ($.inArray($this.prop('tagName').toLowerCase(), settings.tagList) !== -1 && $this.text() !== '') {
                        $this.autoNumeric('set', $this.text());
                    }
                }
                settings.runOnce = true;
                if ($this.is('input[type=text], input[type=hidden], input[type=tel], input:not([type])')) { /**added hidden type */
                $this.on('keydown.autoNumeric', function (e) {
                    holder = getHolder($this);
                    if (holder.settings.aDec === holder.settings.aSep) {
                        $.error("autoNumeric will not function properly when the decimal character aDec: '" + holder.settings.aDec + "' and thousand separator aSep: '" + holder.settings.aSep + "' are the same character");
                    }
                    if (holder.that.readOnly) {
                        holder.processed = true;
                        return true;
                    }
                    /** The below streamed code / comment allows the "enter" keydown to throw a change() event */
                    /** if (e.keyCode === 13 && holder.inVal !== $this.val()){
                            $this.change();
                            holder.inVal = $this.val();
                        }*/
                    holder.init(e);
                    if (holder.skipAllways(e)) {
                        holder.processed = true;
                        return true;
                    }
                    if (holder.processAllways()) {
                        holder.processed = true;
                        holder.formatQuick();
                        e.preventDefault();
                        return false;
                    }
                    holder.formatted = false;
                    return true;
                });
                    $this.on('keypress.autoNumeric', function (e) {
                        holder = getHolder($this);
                        var processed = holder.processed;
                        holder.init(e);
                        if (holder.skipAllways(e)) {
                            return true;
                        }
                        if (processed) {
                            e.preventDefault();
                            return false;
                        }
                        if (holder.processAllways() || holder.processKeypress()) {
                            holder.formatQuick();
                            e.preventDefault();
                            return false;
                        }
                        holder.formatted = false;
                    });
                    $this.on('keyup.autoNumeric', function (e) {
                        holder = getHolder($this);
                        holder.init(e);
                        var skip = holder.skipAllways(e);
                        holder.kdCode = 0;
                        delete holder.valuePartsBeforePaste;
                        if ($this[0].value === holder.settings.aSign) { /** added to properly place the caret when only the currency is present */
                            if (holder.settings.pSign === 's') {
                                setElementSelection(this, 0, 0);
                            } else {
                                setElementSelection(this, holder.settings.aSign.length, holder.settings.aSign.length);
                            }
                        }
                        if (skip) {
                            return true;
                        }
                        if (this.value === '') {
                            return true;
                        }
                        if (!holder.formatted) {
                            holder.formatQuick();
                        }
                    });
                    $this.on('focusin.autoNumeric', function () {
                        holder = getHolder($this);
                        var $settings = holder.settingsClone;
                        $settings.hasFocus = true;
                        if ($settings.nBracket !== null) {
                            var checkVal = $this.val();
                            $this.val(negativeBracket(checkVal, $settings));
                        }
                        holder.inVal = $this.val();
                        var onEmpty = checkEmpty(holder.inVal, $settings, true);
                        if (onEmpty !== null && onEmpty !== '') {
                            $this.val(onEmpty);
                        }
                    });
                    $this.on('focusout.autoNumeric', function () {
                        holder = getHolder($this);
                        var $settings = holder.settingsClone,
                            value = $this.val(),
                            origValue = value;
                        $settings.hasFocus = false;
                        var strip_zero = ''; /** added to control leading zero */
                        if ($settings.lZero === 'allow') { /** added to control leading zero */
                        $settings.allowLeading = false;
                            strip_zero = 'leading';
                        }
                        if (value !== '') {
                            value = autoStrip(value, $settings, strip_zero);
                            if (checkEmpty(value, $settings) === null && autoCheck(value, $settings, $this[0])) {
                                value = fixNumber(value, $settings.aDec, $settings.aNeg);
                                value = autoRound(value, $settings);
                                value = presentNumber(value, $settings.aDec, $settings.aNeg);
                            } else {
                                value = '';
                            }
                        }
                        var groupedValue = checkEmpty(value, $settings, false);
                        if (groupedValue === null) {
                            groupedValue = autoGroup(value, $settings);
                        }
                        if (groupedValue !== holder.inVal || groupedValue !== origValue) {
                            $this.change();
                            $this.val(groupedValue);
                            delete holder.inVal;
                        }
                    });
                }
            });
        },

        /**
         * method to remove settings and stop autoNumeric() - does not remove the formatting
         * $(someSelector).autoNumeric('destroy'); // destroy autoNumeric
         * no parameters accepted
         */
        destroy: function () {
            return $(this).each(function () {
                var $this = $(this);
                $this.off('.autoNumeric');
                $this.removeData('autoNumeric');
            });
        },

        /**
         * method to update settings - can be call as many times
         * $(someSelector).autoNumeric('update', {options}); // updates the settings
         * options passes as a parameter example '{aSep: '.', aDec: ',', aSign: '€ '}
         */
        update: function (options) {
            return $(this).each(function () {
                var $this = autoGet($(this)),
                    settings = $this.data('autoNumeric');
                if (typeof settings !== 'object') {
                    $.error("You must initialize autoNumeric('init', {options}) prior to calling the 'update' method");
                }
                var strip = $this.autoNumeric('get');
                settings = $.extend(settings, options);
                getHolder($this, settings, true);
                if (settings.aDec === settings.aSep) {
                    $.error("autoNumeric will not function properly when the decimal character aDec: '" + settings.aDec + "' and thousand separator aSep: '" + settings.aSep + "' are the same character");
                }
                $this.data('autoNumeric', settings);
                if ($this.val() !== '' || $this.text() !== '') {
                    return $this.autoNumeric('set', strip);
                }
                return;
            });
        },

        /**
         * method to format value sent as a parameter ""
         * $(someSelector).autoNumeric('set', 'value'}); // formats the value being passed
         * value passed as a string - can be a integer '1234' or double '1234.56789'
         * must contain only numbers and one decimal (period) character
         */
        set: function (valueIn) {
            if (valueIn === null) {
                return;
            }
            return $(this).each(function () {
                var $this = autoGet($(this)),
                    settings = $this.data('autoNumeric'),
                    value = valueIn.toString(),
                    testValue = valueIn.toString(),
                    $input = $this.is('input[type=text], input[type=hidden], input[type=tel], input:not([type])');
                if (typeof settings !== 'object') {
                    $.error("You must initialize autoNumeric('init', {options}) prior to calling the 'set' method");
                }
                /** routine to handle page re-load from back button */
                if (testValue !== $this.attr('value') && $this.prop('tagName').toLowerCase() === 'input' && settings.runOnce === false) {
                    value = (settings.nBracket !== null) ? negativeBracket($this.val(), settings) : value;
                    value = autoStrip(value, settings);
                }
                /** allows locale decimal separator to be a comma */
                if ((testValue === $this.attr('value') || testValue === $this.text()) && settings.runOnce === false) {
                    value = value.replace(',', '.');
                }
                if (!$.isNumeric(+value)) {
                    $.error("The value (" + value + ") being 'set' is not numeric and has caused a error to be thrown");
                }
                value = checkValue(value, settings);
                settings.setEvent = true;
                value.toString();
                if (value !== '') {
                    value = autoRound(value, settings);
                }
                value = presentNumber(value, settings.aDec, settings.aNeg);
                if (!autoCheck(value, settings)) {
                    value = autoRound('', settings);
                }
                value = autoGroup(value, settings);
                if ($input) {
                    return $this.val(value);
                }
                if ($.inArray($this.prop('tagName').toLowerCase(), settings.tagList) !== -1) {
                    return $this.text(value);
                }
                return false;
            });
        },

        /**
         * method to get the unformatted that accepts up to one parameter
         * $(someSelector).autoNumeric('get'); no parameters accepted
         * values returned as ISO numeric string "1234.56" where the decimal character is a period
         * only the first element in the selector is returned
         */
        get: function () {
            var $this = autoGet($(this)),
                settings = $this.data('autoNumeric');
            if (typeof settings !== 'object') {
                $.error("You must initialize autoNumeric('init', {options}) prior to calling the 'get' method");
            }
            var getValue = '';
            /** determine the element type then use .eq(0) selector to grab the value of the first element in selector */
            if ($this.is('input[type=text], input[type=hidden], input[type=tel], input:not([type])')) { /**added hidden type */
            getValue = $this.eq(0).val();
            } else if ($.inArray($this.prop('tagName').toLowerCase(), settings.tagList) !== -1) {
                getValue = $this.eq(0).text();
            } else {
                $.error("The <" + $this.prop('tagName').toLowerCase() + "> is not supported by autoNumeric()");
            }
            if ((getValue === '' && settings.wEmpty === 'empty') || (getValue === settings.aSign && (settings.wEmpty === 'sign' || settings.wEmpty === 'empty'))) {
                return '';
            }
            if (getValue !== '' && settings.nBracket !== null) {
                settings.removeBrackets = true;
                getValue = negativeBracket(getValue, settings);
                settings.removeBrackets = false;
            }
            if (settings.runOnce || settings.aForm === false) {
                getValue = autoStrip(getValue, settings);
            }
            getValue = fixNumber(getValue, settings.aDec, settings.aNeg);
            if (+getValue === 0 && settings.lZero !== 'keep') {
                getValue = '0';
            }
            if (settings.lZero === 'keep') {
                return getValue;
            }
            getValue = checkValue(getValue, settings);
            return getValue; /** returned Numeric String */
        },

        /**
         * The 'getString' method used jQuerys .serialize() method that creates a text string in standard URL-encoded notation
         * it then loops through the string and un-formats the inputs with autoNumeric
         * $(someSelector).autoNumeric('getString'); no parameter accepted
         * values returned as ISO numeric string "1234.56" where the decimal character is a period
         */
        getString: function () {
            var isAutoNumeric = false,
                $this = autoGet($(this)),
                formFields = $this.serialize(),
                formParts = formFields.split('&'),
                formIndex = $('form').index($this),
                allFormElements = $('form:eq(' + formIndex + ')'),
                aiIndex = [], /* all input index */
                scIndex = [], /* successful control index */
                rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i, /* from jQuery serialize method */
                rsubmittable = /^(?:input|select|textarea|keygen)/i, /* from jQuery serialize method */
                rcheckableType = /^(?:checkbox|radio)$/i,
                rnonAutoNumericTypes = /^(?:button|checkbox|color|date|datetime|datetime-local|email|file|image|month|number|password|radio|range|reset|search|submit|time|url|week)/i,
                count = 0;
            /*jslint unparam: true*/
            /* index of successful elements */
            $.each(allFormElements[0], function (i, field) {
                if (field.name !== '' && rsubmittable.test(field.localName) && !rsubmitterTypes.test(field.type) && !field.disabled && (field.checked || !rcheckableType.test(field.type))) {
                    scIndex.push(count);
                    count = count + 1;
                } else {
                    scIndex.push(-1);
                }
            });
            /* index of all inputs tags except checkbox */
            count = 0;
            $.each(allFormElements[0], function (i, field) {
                if (field.localName === 'input' && (field.type === '' || field.type === 'text' || field.type === 'hidden' || field.type === 'tel')) {
                    aiIndex.push(count);
                    count = count + 1;
                } else {
                    aiIndex.push(-1);
                    if (field.localName === 'input' && rnonAutoNumericTypes.test(field.type)) {
                        count = count + 1;
                    }
                }
            });
            $.each(formParts, function (i, miniParts) {
                miniParts = formParts[i].split('=');
                var scElement = $.inArray(i, scIndex);
                if (scElement > -1 && aiIndex[scElement] > -1) {
                    var testInput = $('form:eq(' + formIndex + ') input:eq(' + aiIndex[scElement] + ')'),
                        settings = testInput.data('autoNumeric');
                    if (typeof settings === 'object') {
                        if (miniParts[1] !== null) {
                            miniParts[1] = $('form:eq(' + formIndex + ') input:eq(' + aiIndex[scElement] + ')').autoNumeric('get').toString();
                            formParts[i] = miniParts.join('=');
                            isAutoNumeric = true;
                        }
                    }
                }
            });
            /*jslint unparam: false*/
            if (!isAutoNumeric) {
                $.error("You must initialize autoNumeric('init', {options}) prior to calling the 'getString' method");
            }
            return formParts.join('&');
        },

        /**
         * The 'getString' method used jQuerys .serializeArray() method that creates array or objects that can be encoded as a JSON string
         * it then loops through the string and un-formats the inputs with autoNumeric
         * $(someSelector).autoNumeric('getArray'); no parameter accepted
         * values returned as ISO numeric string "1234.56" where the decimal character is a period
         */
        getArray: function () {
            var isAutoNumeric = false,
                $this = autoGet($(this)),
                formFields = $this.serializeArray(),
                formIndex = $('form').index($this),
                allFormElements = $('form:eq(' + formIndex + ')'),
                aiIndex = [], /* all input index */
                scIndex = [], /* successful control index */
                rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i, /* from jQuery serialize method */
                rsubmittable = /^(?:input|select|textarea|keygen)/i, /* from jQuery serialize method */
                rcheckableType = /^(?:checkbox|radio)$/i,
                rnonAutoNumericTypes = /^(?:button|checkbox|color|date|datetime|datetime-local|email|file|image|month|number|password|radio|range|reset|search|submit|time|url|week)/i,
                count = 0;
            /*jslint unparam: true*/
            /* index of successful elements */
            $.each(allFormElements[0], function (i, field) {
                if (field.name !== '' && rsubmittable.test(field.localName) && !rsubmitterTypes.test(field.type) && !field.disabled && (field.checked || !rcheckableType.test(field.type))) {
                    scIndex.push(count);
                    count = count + 1;
                } else {
                    scIndex.push(-1);
                }
            });
            /* index of all inputs tags */
            count = 0;
            $.each(allFormElements[0], function (i, field) {
                if (field.localName === 'input' && (field.type === '' || field.type === 'text' || field.type === 'hidden' || field.type === 'tel')) {
                    aiIndex.push(count);
                    count = count + 1;
                } else {
                    aiIndex.push(-1);
                    if (field.localName === 'input' && rnonAutoNumericTypes.test(field.type)) {
                        count = count + 1;
                    }
                }
            });
            $.each(formFields, function (i, field) {
                var scElement = $.inArray(i, scIndex);
                if (scElement > -1 && aiIndex[scElement] > -1) {
                    var testInput = $('form:eq(' + formIndex + ') input:eq(' + aiIndex[scElement] + ')'),
                        settings = testInput.data('autoNumeric');
                    if (typeof settings === 'object') {
                        field.value = $('form:eq(' + formIndex + ') input:eq(' + aiIndex[scElement] + ')').autoNumeric('get').toString();
                        isAutoNumeric = true;
                    }
                }
            });
            /*jslint unparam: false*/
            if (!isAutoNumeric) {
                $.error("None of the successful form inputs are initialized by autoNumeric.");
            }
            return formFields;
        },

        /**
         * The 'getSteetings returns the object with autoNumeric settings for those who need to look under the hood
         * $(someSelector).autoNumeric('getSettings'); // no parameters accepted
         * $(someSelector).autoNumeric('getSettings').aDec; // return the aDec setting as a string - ant valid setting can be used
         */
        getSettings: function () {
            var $this = autoGet($(this));
            return $this.eq(0).data('autoNumeric');
        }
    };

    /**
     * autoNumeric function
     */
    $.fn.autoNumeric = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        $.error('Method "' + method + '" is not supported by autoNumeric()');
    };

    /**
     * Defaults are public - these can be overridden by the following:
     * HTML5 data attributes
     * Options passed by the 'init' or 'update' methods
     * Use jQuery's $.extend method - great way to pass ASP.NET current culture settings
     */
    $.fn.autoNumeric.defaults = {
        /** allowed thousand separator characters
         * comma = ','
         * period "full stop" = '.'
         * apostrophe is escaped = '\''
         * space = ' '
         * none = ''
         * NOTE: do not use numeric characters
         */
        aSep: ',',
        /** digital grouping for the thousand separator used in Format
         * dGroup: '2', results in 99,99,99,999 common in India for values less than 1 billion and greater than -1 billion
         * dGroup: '3', results in 999,999,999 default
         * dGroup: '4', results in 9999,9999,9999 used in some Asian countries
         */
        dGroup: '3',
        /** allowed decimal separator characters
         * period "full stop" = '.'
         * comma = ','
         */
        aDec: '.',
        /** allow to declare alternative decimal separator which is automatically replaced by aDec
         * developed for countries the use a comma ',' as the decimal character
         * and have keyboards\numeric pads that have a period 'full stop' as the decimal characters (Spain is an example)
         */
        altDec: null,
        /** allowed currency symbol
         * Must be in quotes aSign: '$', a space is allowed aSign: '$ '
         */
        aSign: '',
        /** placement of currency sign
         * for prefix pSign: 'p',
         * for suffix pSign: 's',
         */
        pSign: 'p',
        /** maximum possible value
         * value must be enclosed in quotes and use the period for the decimal point
         * value must be larger than vMin
         */
        vMax: '9999999999999.99',
        /** minimum possible value
         * value must be enclosed in quotes and use the period for the decimal point
         * value must be smaller than vMax
         */
        vMin: '-9999999999999.99',
        /** max number of decimal places = used to override decimal places set by the vMin & vMax values
         * value must be enclosed in quotes example mDec: '3',
         * This can also set the value via a call back function mDec: 'css:#
         */
        mDec: null,
        /** method used for rounding
         * mRound: 'S', Round-Half-Up Symmetric (default)
         * mRound: 'A', Round-Half-Up Asymmetric
         * mRound: 's', Round-Half-Down Symmetric (lower case s)
         * mRound: 'a', Round-Half-Down Asymmetric (lower case a)
         * mRound: 'B', Round-Half-Even "Bankers Rounding"
         * mRound: 'U', Round Up "Round-Away-From-Zero"
         * mRound: 'D', Round Down "Round-Toward-Zero" - same as truncate
         * mRound: 'C', Round to Ceiling "Toward Positive Infinity"
         * mRound: 'F', Round to Floor "Toward Negative Infinity"
         */
        mRound: 'S',
        /** controls decimal padding
         * aPad: true - always Pad decimals with zeros
         * aPad: false - does not pad with zeros.
         * aPad: `some number` - pad decimals with zero to number different from mDec
         * thanks to Jonas Johansson for the suggestion
         */
        aPad: true,
        /** places brackets on negative value -$ 999.99 to (999.99)
         * visible only when the field does NOT have focus the left and right symbols should be enclosed in quotes and seperated by a comma
         * nBracket: null, nBracket: '(,)', nBracket: '[,]', nBracket: '<,>' or nBracket: '{,}'
         */
        nBracket: null,
        /** Displayed on empty string
         * wEmpty: 'empty', - input can be blank
         * wEmpty: 'zero', - displays zero
         * wEmpty: 'sign', - displays the currency sign
         */
        wEmpty: 'empty',
        /** controls leading zero behavior
         * lZero: 'allow', - allows leading zeros to be entered. Zeros will be truncated when entering additional digits. On focusout zeros will be deleted.
         * lZero: 'deny', - allows only one leading zero on values less than one
         * lZero: 'keep', - allows leading zeros to be entered. on fousout zeros will be retained.
         */
        lZero: 'allow',
        /** determine if the default value will be formatted on page ready.
         * true = automatically formats the default value on page ready
         * false = will not format the default value
         */
        aForm: true
    };
}(jQuery));// инициализация вычисления параметров займа в калькуляторе
function calculateDealParameters(selector){
    var parent = $(selector).parents('.calculator').first();
    var inputs = parent.find('.scroller__input input');

    if (inputs.length >= 3) {
        var sum = parseFloat($(inputs[0]).autoNumeric('get'));
        var period = parseInt($(inputs[1]).autoNumeric('get'));
        var rate = parseFloat($(inputs[2]).autoNumeric('get'));

        var end = new Date(Date.now() + period * 24 * 60 * 60000);
        var returnSum = sum + sum * period * rate / 100;

        var results = parent.find('.calculator-result__item-block span');

        if (results.length >= 3) {
            $(results[0]).autoNumeric('set', sum);
            var dateFormat = $(results[1]).attr('date-format');
            if (dateFormat != null) {
                $(results[1]).text($.format.date(end, dateFormat));
            } else {
                $(results[1]).text(end);
            }
            $(results[2]).autoNumeric('set', returnSum);
        }
    }
}

var convertDateString = function(date) {
    if (date.length != 14) {
        return "";
    }
    date = date.replace(new RegExp('_', 'g'), ' ');
    if (date.charAt(1) == ' ') {
        date = ' ' + date.charAt(0) + date.slice(2,14)
    }
    if (date.charAt(8) == ' ') {
        date = date.slice(0,7) + ' ' + date.charAt(7) + date.slice(9,14)
    }
    var numbersOnly = /[^0-9]/g;
    var numbers = date.replace(numbersOnly, '');
    return numbers.length == 0 ? '' : date;
};

(function ($) {
    $.fn.toddler = function (selector) {
        var uniqueClass = "id" + Math.floor(Math.random() * 100000);
        $(this).addClass(uniqueClass);

        var slider = new Slider('.' + uniqueClass + selector);
        var min = slider.options.min;
        var max = slider.options.max;

        function normalizeRange(val) {
            var newValue = parseInt(val.replace(/ /g, '').replace(/,/g, '.'));
            if (newValue < min) {
                newValue = min;
            }
            if (newValue > max) {
                newValue = max;
            }
            return newValue;
        }

        if ($(this).hasClass('range')) {
            var fromInput = $(this).find('input.full-width').first();
            var tillInput = $(this).find('input.full-width').last();
            slider.on('change', function (data) {
                var values = ('' + data.newValue).split(',');
                fromInput.autoNumeric('set', values[0]);
                tillInput.autoNumeric('set', values[1]);
            });
            fromInput.on('blur', function () {
                var newValue = normalizeRange($(this).val());
                slider.setValue([newValue, parseInt(tillInput.val().autoNumeric('get'))]);
                $(this).autoNumeric('set', newValue);
            });
            tillInput.on('blur', function () {
                var newValue = normalizeRange($(this).val());
                slider.setValue([parseInt(fromInput.val().autoNumeric('get')), newValue]);
                $(this).autoNumeric('set', newValue);
            });
        } else {
            var input = $(this).find('input.full-width').first();
            slider.on('change', function (data) {
                input.autoNumeric('set', data.newValue);
                calculateDealParameters('.calculator .scroller__body input');
            });
            input.on('blur', function(){
                var newValue = normalizeRange($(this).val());
                slider.setValue(newValue);
                $(this).autoNumeric('set', newValue);
                calculateDealParameters('.calculator .scroller__body input');
            });
        }
    };

    $.fn.counter = function () {
        var plus = $(this).find('.block-with-counter__plus').first();
        var minus = $(this).find('.block-with-counter__minus').first();
        var input = $(this).find('.block-with-counter__input-counter').first();
        var step = parseFloat(input.attr('counter-step'));

        function disableButtons() {
            if (parseFloat(input.autoNumeric('get')) >= parseFloat(input.attr('data-v-max'))) {
                plus.attr('disabled', 'disabled');
            } else {
                plus.removeAttr('disabled');
            }
            if (parseFloat(input.autoNumeric('get')) <= parseFloat(input.attr('data-v-min'))) {
                minus.attr('disabled', 'disabled');
            } else {
                minus.removeAttr('disabled');
            }
        }

        disableButtons();

        plus.on('click', function(e){
            input.autoNumeric('set', parseFloat(input.autoNumeric('get')) + step);
            disableButtons();
            if (input.parents('form.validatable').length > 0) {
                input.valid();
            }
            e.preventDefault();
        });
        minus.on('click', function(e){
            input.autoNumeric('set', parseFloat(input.autoNumeric('get')) - step);
            disableButtons();
            if (input.parents('form.validatable').length > 0) {
                input.valid();
            }
            e.preventDefault();
        });
        input.on('change', function(){
            disableButtons();
        });
    }
})(jQuery);

$(document).ready(function () {

    // popup
    $('.popup-modal').magnificPopup({
        type: 'inline',
        preloader: false,
        focus: '#username',
        modal: true
    });
    $(document).on('click', '.fgr-popup__close', function (e) {
        e.preventDefault();
        $.magnificPopup.close();
        $('.fgr-modal form.validatable').each(
            function() {
                $(this).validate().resetForm();
                $(this).find('.error-elem').each(function(){$(this).removeClass('error-elem')});
            }
        );
    });
    $('.popup-modal.auto-open').click();

    $(".role-auth-block__role-mode__links").click(function () {

        if ($(".role-auth-block__role-mode__links").hasClass('open')) {
            $(this).removeClass('open');
        }
        else {
            $(this).addClass('open');
        }
    });

    // инициализация ползунков
    $('.field.scroller').each(function () {
        $(this).toddler('.field.scroller input');
    });

    // инициализация галок с картинками
    $('.field.type-checkbox input,.field.type-radio input').on('change', function(){
        var image = $(this).parent().find('label i').first();
        if ($(this).is(':checked')) {
            image.addClass('active');
        } else {
            image.removeClass('active');
        }
    });

    // инициализация числовых полей
    $('.formatted input,span.formatted').each(function () {
        $(this).autoNumeric('init');
    });

    // инициализация кредитного калькулятора
    var calculator = $('.calculator .scroller__body input');
    calculateDealParameters(calculator);

    // инициализация счетчиков
    $('.block-with-counter').each(function () {
        $(this).counter();
    });

    // инициализация полей со стажем
    $.mask.definitions['d'] = '[0-9 _]';
    $('.work-length input[mask]').each(function(){
        $(this).mask($(this).attr('mask'), {completed:function(){this.val(convertDateString(this.val()));}});
        $(this).change(function(e) {
            var self = $(this);
            self.val(convertDateString(self.val()));
        });
    });

    // инициализация масок
    $(':not(.work-length) input[mask]').each(function (){
        $(this).mask($(this).attr('mask'));
    });

    // инициализация валидации
    jQuery.validator.addMethod("assert", function(value, element, params) {
        return params;
    }, "");

    jQuery.validator.setDefaults({
        errorPlacement: function(error, element) {
            var fieldContainer = element.parents('.field').first();
            var errorContainer = fieldContainer.find('.error-message-box').first();
            if (errorContainer.length > 0) {
                error.appendTo(errorContainer[0]);
            }
            fieldContainer.find('button.btn.dropdown-toggle').first().attr('title', error.text());
            element.parents('.block-with-counter').first().attr('title', error.text());
            fieldContainer.find('.bootstrap-filestyle').first().attr('title', error.text());
            if (fieldContainer.hasClass('autocomplete')) {
                fieldContainer.attr('title', error.text());
            }
        },
        highlight: function(element, errorClass) {
            var fieldContainer = $(element).parents('.field').first();
            fieldContainer.addClass("error-elem");
            var hintContainer = fieldContainer.find('.simple-message-box').first();
            hintContainer.css('display', 'none');
        },
        unhighlight: function(element, errorClass) {
            var fieldContainer = $(element).parents('.field').first();
            fieldContainer.removeClass("error-elem");
            var hintContainer = fieldContainer.find('.simple-message-box').first();
            hintContainer.css('display', '');

            fieldContainer.find('button.btn.dropdown-toggle').first().attr('title', $(element).val());
            $(element).parents('.block-with-counter').first().attr('title', '');
            fieldContainer.find('.bootstrap-filestyle').first().attr('title', '');
            if (fieldContainer.hasClass('autocomplete')) {
                fieldContainer.attr('title', '');
            }
        },
        invalidHandler: function(form, validator) {
            if (!validator.numberOfInvalids()) {
                return;
            }

            var first =  $(validator.errorList[0].element).parents('.field').first();
            var container = $('html,body');
            container.animate({
                scrollTop: first.offset().top - container.offset().top + container.scrollTop()
            }, 100);
            first.find('input:not(:hidden)').first().focus();
        },
        ignore: ':hidden:not(.selectpicker,input[type=radio],input[type=checkbox],.autocomplete input[type=hidden])',
        focusInvalid: false // это сделаем сами
    });

    $('form.validatable').each(function () {
        var formId = $(this).attr('id');
        if (formId != null && formId != '') {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = formId + '.validation.js';
            var body = document.getElementsByTagName('body')[0];
            body.appendChild(script);
        }
    });

    $('.yoxview').yoxview({
        autoHideMenu: false,
        lang: 'ru',
        imagesFolder: '/static/dist/img/yoxview/'
    });

    $('.yoxview img').each(function(){
        var scale = $(this).attr('scale');
        if (scale) {
            $(this).css('width', $(this).width() * scale + 'px');
        }
    });

    $('.autocomplete').each(function(){
        var result = $(this).find('input.result').first();
        var expression = $(this).find('input.expression').first();
        var full = $(this).find('input.full').first();
        var icon = $(this).find('i.search-icon').first();

        var options = {
            autoSelectFirst: true,
            orientation: 'auto',
            zIndex: 101,
            appendTo: $(this),
            noCache: true,

            beforeRender: function() {
                $(this).addClass('opened');
                icon.removeClass('visible');
            },
            onHide: function() {
                $(this).removeClass('opened');
            },
            onSearchStart: function(query) {
                expression.val(query['query']);
                icon.addClass('visible');
            },
            onSearchComplete: function(query, suggestions) {
                if (suggestions.length == 0) {
                    result.val('').trigger('change');
                    icon.removeClass('visible');
                    result.valid();
                }
            },
            onSelect: function(suggestion) {
                result.val(suggestion.data).trigger('change');
                icon.removeClass('visible');
                result.valid();
            }
        };
        if (full.attr('auto-serviceUrl') != undefined) {
            options.serviceUrl = full.attr('auto-serviceUrl');
        }
        if (full.attr('auto-dependsOn') != undefined) {
            var dependencies = $(full.attr('auto-dependsOn'));
            dependencies.each(function(){
                $(this).on('change', function() {
                    options.params = {};
                    dependencies.each(function () {
                        var name = $(this).attr('name');
                        options.params[name] = $(this).val();
                    });
                    full.devbridgeAutocomplete().setOptions(options);
                    result.val('');
                    full.val('');
                });
                options.params = {};
                dependencies.each(function () {
                    var name = $(this).attr('name');
                    options.params[name] = $(this).val();
                });
            });
        }

        full.devbridgeAutocomplete(options);

        full.on('focus', function(){
            full.val(expression.val());
            full.devbridgeAutocomplete().onValueChange();
        });
        full.on('blur', function(){
            icon.removeClass('visible');
            result.valid();
            full.devbridgeAutocomplete().abortAjax();
        });
    });

    $('.search-block__submit').on('click', function(e) {
        $('.ya-site-form__input-text').val($('.search-block input').val());
        $('.ya-site-form__submit').click();
        e.preventDefault();
    });

    // Инициализация формы ввода кода подтверждения
    var confirmCodePopup = $('#confirmCodePopup');
    confirmCodePopup.find('.btn.submit').first().on('click', function(e) {
        e.preventDefault();

        confirmCodePopup.find('.fgr-popup__close').click();
        var code = confirmCodePopup.find('input[name="confirmCode"]').first();
        if (confirmCodePopup.form != null && confirmCodePopup.form.length > 0) {
            confirmCodePopup.form.append("<input type='hidden' name='confirmCode' value='" + code.val() + "'/>");
            confirmCodePopup.form.submit();
        } else if (confirmCodePopup.link != null) {
            var confirmCode = "confirmCode=" + code.val();
            if (confirmCodePopup.link.contains('?')) {
                confirmCode = '&' + confirmCode;
            } else {
                confirmCode = '?' + confirmCode;
            }
            window.location.href = confirmCodePopup.link + confirmCode;
        }
    });

    confirmCodePopup.find('.btn.reset').first().on('click', function(e) {
        e.preventDefault();
        confirmCodePopup.find('.fgr-popup__close').click();
    });
    confirmCodePopup.find('.btn.request').first().on('click', function(e) {
        e.preventDefault();
        if (confirmCodePopup.link != null) {
            confirmCodePopup.link.click();
        }
    });

    $('.confirm-code').on('click', function(e) {
        e.preventDefault();
        confirmCodePopup.link = $(this);

        var form = $(this).parents('form').first();
        confirmCodePopup.form = form;
        confirmCodePopup.url = null;

        if (form.length > 0) {
            if (form.hasClass('validatable')) {
                if (!form.valid()) {
                    return;
                }
            }
        } else if ($(this).attr('href') != null) {
            confirmCodePopup.url = $(this).attr('href');
        }

        var data = {};
        var url = '/confirm-code/generate.do';
        if ($(this).attr('confirm-code-phone')) {
            var phone = $($(this).attr('confirm-code-phone')).val();
            var code = $($(this).attr('confirm-code-countryCode')).val();
            if (code == null || code == '') {
                code = '7';
            }
            data.phone = phone;
            data.countryCode = code;
            url = '/confirm-code/generate-by-phone.do';
        } else if ($(this).attr('confirm-code-email')) {
            data.email = $($(this).attr('confirm-code-email')).val();
            url = '/confirm-code/generate-by-email.do';
        } else if ($(this).attr('confirm-code-userId')) {
            data.userId = $($(this).attr('confirm-code-userId')).val();
        }

        var regexp = /(\/.*?)\/.*/g;
        var context = regexp.exec(window.location.pathname)[1];

        confirmCodePopup.find('.description,.error-elem').removeClass('visible');
        confirmCodePopup.find('form').show();

        $.ajax({
            url: context + url,
            data: data
        }).done(function(data){
            if (data.error != null) {
                confirmCodePopup.find('.error-elem').first().addClass('visible');
                confirmCodePopup.find('form').first().hide();
            } else {
                if (data.destinationType == 'PHONE') {
                    confirmCodePopup.find('.description.phone').first().addClass('visible');
                } else {
                    confirmCodePopup.find('.description.email').first().addClass('visible');
                }
            }

            $.magnificPopup.open({
                items: {
                    src: '#confirmCodePopup',
                    type: 'inline'
                },
                preloader: false,
                focus: '#confirmCodePopup input[name="confirmCode"]',
                modal: true
            });
        });
    });

    // инициализация зависимых блоков форм
    var dependencyChecker = $('.dependent-block-opener input[type="checkbox"],.dependent-block-opener input[type="radio"]');
    dependencyChecker.on('change', function(){
        var dependent = $('.dependent-block');
        if ($(this).is(':checked')) {
            dependent.hide();
        } else {
            dependent.find(':input').each(function() {
                switch(this.type) {
                    case 'password':
                    case 'text':
                    case 'textarea':
                    case 'file':
                    case 'hidden':
                        $(this).val('');
                        break;
                    case 'select-one':
                    case 'select-multiple':
                        $(this).selectpicker('val', ['']);
                        break;
                    case 'checkbox':
                    case 'radio':
                        this.checked = false;
                }
            });
            dependent.show();
        }
    });
    dependencyChecker.trigger('change');

    // инициализация компоновки страницы под баннеры
    var banners = $('.banners-block');
    if (typeof bannerRised !== 'undefined' && banners.length > 0) {
        banners.css("display", "block");
        var content = banners.prev();
        content.removeClass("col-xs-14");
        content.addClass("col-xs-10");
    }

    // заплатка для выпадающего списка (чтоб валидировался при смене значения)
    $('.validatable .selectpicker').each(function(){
        $(this).on('change', function(){$(this).valid()});
    });

    // заплатка для datepicker'а (чтоб валидировался при смене значения)
    $('[data-provide=datepicker]').each(function(){
        $(this).datepicker().on('changeDate', function(){$(this).find('input').first().valid()});
    });

    // запуск смены success story на главной
    if ($('.stat-user-block.visible').length > 0) {
        setInterval(function () {
            var successStories = $('.stat-user-block');
            var first = successStories.first();
            var last = successStories.last();

            first.removeClass('visible');
            last.prependTo(last.parent());
            last.addClass('visible');
        }, 15000);
    }

    // инициализация поля с галкой
    $('.activation').each(function(){
        var checkbox = $(this).find('input[type=checkbox]').first();
        var input = $(this).find('input:not([type=checkbox])').first();

        checkbox.on('change', function() {
            input.prop('disabled', !checkbox.is(':checked'));
            input.focus();
        });
    });

    //инициализация пейджеров
    $('.paginator__select select').each(function(){
        $(this).on('change', function(){
            var selectName = $(this).attr('name');
            var hash = $(this).parents('.paginator').first().find('a[name]').first().attr('name');

            var location = window.location;
            var params = location.search.substring(1).split('&');
            var paramFound = false;
            var query = '';
            for (var i = 0; i < params.length; i++) {
                if (params[i].startsWith(selectName + '=')) {
                    query = query + '&' + selectName + '=' + $(this).val();
                    paramFound = true;
                } else if (params[i] != '') {
                    query = query + '&' + params[i];
                }
            }
            if (!paramFound) {
                query = query + '&' + selectName + '=' + $(this).val();
            }
            location.hash = hash;
            location.search = query.substring(1);
        });
    });

    function oneFieldFormSend(field){
        var matches = $(field).val().match(/\d+/g);
        if (matches != null) {
            $('#submit').removeAttr('disabled');
        } else {
            $('#submit').attr('disabled', true);
        }
    }

    var callbackFormInput = $('form.one-field-form input');
    callbackFormInput.keyup(function() {
        oneFieldFormSend(this);
    });

    callbackFormInput.blur(function() {
        oneFieldFormSend(this);
    });

    $('#data.validatable').find('input[type="checkbox"]').on('change', function(){
        var form = $(this).parents('form').first();
        var checkboxes = form.find('input[type="checkbox"]');
        var countChecked = 0;
        checkboxes.each(function(){
            if ($(this).is(':checked')) {
                countChecked++;
            }
        });
        form.find('button[type="submit"]').prop('disabled', countChecked != checkboxes.length);
    });
});
