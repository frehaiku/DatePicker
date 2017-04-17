var DatePicker;

(function () {
    "use strict";

    /**
     * 日历组件
     * @param config {target: DOM, defaultDate: '2017-04-15', selectInterval: [2000, 2020]}
     * @constructor
     */
    function Calendar(config) {

        this.target = config.el;
        this.defaultDate = config.default || 'today';
        this.selectInterval = config.interval || [1970, 2030];
        // 当前日历数据
        this.nonceYear = 0;
        this.nonceMonth = 0;
        this.nonceDay = 0;

        // 选中的数据
        this.selectedYear = 0;
        this.selectedMonth = 0;
        // 日期数组
        this.renderDate = [];
        this.init();
    }

    DatePicker = Calendar;
    var utils = {
        bind: function (el, event, listener) {
            var handler;
            if (el.addEventListener) {
                handler = el.addEventListener(event, listener);
            } else if (el.attachEvent) {
                handler = document.attachEvent.call(el);
            } else {
                handler = el.on[event] = listener;
            }
            return handler;
        },

        delegates: function (e, tagName, fn) {
            var event = e || window.event,
                target = event.target || event.srcElement;
            if (target.tagName.toLowerCase() === tagName) {
                fn.call(null, target);
            }
        },

        addClass: function (el, className) {

            var ol = el.className;
            if (ol.split(' ').indexOf(className) === -1) {
                el.className = ol + " " + className;
            }

        },

        removeClass: function (el, className) {
            ([]).forEach.call(el, function (ele) {

                var ol = ele.className,
                    reg = new RegExp("(\\s)*" + className);
                ele.className = ol.replace(reg, '');
            });


        }
    }

    Calendar.prototype = {
        constructor: Calendar,

        /**
         * 初始化
         */
        init: function () {
            // compute select year
            var yearOpts = this._productOptions(this.selectInterval, '年');
            var dateOpts = this._productOptions([1, 12], '月');
            // 初始化布局
            var navTop = "<div class='calendar-wrapper'>" +
                "<div class='calendar-header'>" +
                "<span class='leftArrow'></span>" +
                "<div class='calendar-mid'>" +
                "<select class='year'>" +
                yearOpts +
                "</select>" +
                "<select class='date'>" +
                dateOpts +
                "</select>" +
                "</div>" +
                "<span class='rightArrow'></span>" +
                "</div>" +
                "</div>";

            this.target.innerHTML = navTop;

            this._setDefault();

            this.eventListener();
        },
        /**
         * 生成选项
         * @param between
         * @param concat
         * @returns {string}
         * @private
         */
        _productOptions: function (between, concat) {
            var opts = "";
            for (var i = between[0]; i <= between[1]; i++) {
                opts += "<option value='" + i + "'>" +
                    i + concat +
                    "</option>";
            }
            return opts;
        },
        /**
         * 设置默认的日期
         * @private
         */
        _setDefault: function () {
            var defaultD = this.defaultDate,
                self = this;
            if (defaultD === 'today') {
                var d = new Date();
                self.nonceYear = d.getFullYear();
                self.nonceMonth = d.getMonth();
                self.nonceDay = d.getDate();
            } else {
                var relate = defaultD.split('-');
                if (relate.length <= 1)
                    throw "default option is invalid, please check the options and reset `YYYY-mm-dd` or `YYYY-mm`";
                else {
                    self.nonceYear = relate[0];
                    self.nonceMonth = +relate[1] - 1;
                    self.nonceDay = relate[2] || 1;
                }
            }
            // 设置选中的默认年份与月份
            self.selectedYear = self.nonceYear;
            self.selectedMonth = self.nonceMonth;
            self._setDateList();


        },

        /**
         *  处理日期数组
         * @returns {Array}
         * @private
         */
        _setDateList: function () {
            /*一个月的第一天星期几*/
            var whatday = new Date(this.nonceYear, this.nonceMonth, 1).getDay();

            var monthMuchDay = [31,
                (this.nonceYear % 4 === 0 && (this.nonceYear % 100 !== 0 || this.nonceYear % 400 === 0))
                    ? 29 : 28
                , 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

            var renderList = [],
                /*4/16 Fixed 当前月为1月份，手动设置上一个月为12月份*/
                prevMonthDays = this.nonceMonth - 1 > 0 ? monthMuchDay[this.nonceMonth - 1] : 31,
                nonceMonthDays = monthMuchDay[this.nonceMonth];
            /*一个月的最后一天星期几*/
            var monthLastDay = new Date(this.nonceYear, this.nonceMonth, nonceMonthDays).getDay();

            /*前置补空*/
            var prevOnce = whatday, obj;
            while (prevOnce > 0) {
                obj = {
                    isInner: false,
                    num: prevMonthDays--
                };
                prevOnce--;
                renderList.unshift(obj);
            }
            /*当前月天数*/
            for (var i = 1; i <= nonceMonthDays; i++) {
                obj = {
                    isInner: true,
                    num: i
                };
                renderList.push(obj);
            }
            /*后置补空*/
            for (var i = 1; monthLastDay < 6; monthLastDay++, i++) {
                obj = {
                    isInner: false,
                    num: i
                };
                renderList.push(obj);
            }
            this.renderDate = renderList;

            this._doRender(renderList);
        },
        /**
         * 根据日期数组渲染DOM
         * @param arr
         * @private
         */
        _doRender: function (arr) {

            var self = this,
                date = "<ul class='weekTip'>" +
                    "<li class='weekend'>日</li>" +
                    "<li>一</li>" +
                    "<li>二</li>" +
                    "<li>三</li>" +
                    "<li>四</li>" +
                    "<li>五</li>" +
                    "<li class='weekend'>六</li>" +
                    "</ul>";
            date += "<ul class='date'>";
            arr.forEach(function (ele, ind) {
                var line = Math.floor(ind / 6);
                if (!ele.isInner)
                    date += "<li class='disabled'>" + ele.num + "</li>";
                else if (ele.num === self.nonceDay &&
                    self.nonceMonth === self.selectedMonth &&
                    self.nonceYear === self.selectedYear)
                    date += "<li class='abled active'>" + ele.num + "</li>";
                else if (!(ind % 7) || ind === line * 6 + line - 1)
                    date += "<li class='weekend'>" + ele.num + "</li>";
                else
                    date += "<li class='abled'>" + ele.num + "</li>";
            });
            date += "</ul>";

            var dateContainer = document.createElement('div');
            dateContainer.className = 'dateWrap';
            dateContainer.innerHTML = date;

            var header = this.target.querySelector(" .calendar-header");
            // add
            var fload;
            if (fload = (header.nextElementSibling)) {
                header.parentNode.replaceChild(dateContainer, fload);
            } else {
                header.parentNode.insertBefore(dateContainer, null);
            }

            this._selected(" .year option", this.nonceYear);
            this._selected(" .date option", this.nonceMonth + 1);
        },
        /**
         *  默认选中年份和月份选择框
         * @param selector
         * @param tag
         * @private
         */
        _selected: function (selector, tag) {
            var options = this.target.querySelectorAll(selector);
            ([]).forEach.call(options, function (ele) {
                if (ele.value === tag.toString()) {
                    ele.setAttribute('selected', 'selected');
                } else {
                    ele.removeAttribute('selected');
                }
            });
        },

        /**
         * 上一个月的操作
         * @private
         */
        _prevMonth: function () {
            if (this.nonceMonth === 0) {
                this.nonceYear--;
                this.nonceMonth = 11;
            } else {
                this.nonceMonth--;
            }
            this._setDateList();
        },

        /**
         * 下一个月的操作
         * @private
         */
        _nextMonth: function () {
            if (this.nonceMonth === 11) {
                this.nonceYear++;
                this.nonceMonth = 0;
            } else {
                this.nonceMonth++;
            }
            this._setDateList();
        },

        /**
         * 各种事件监听
         */
        eventListener: function () {
            var self = this;
            /**
             * 左箭头监听
             */
            utils.bind(self.target.querySelector(".leftArrow"),
                'click',
                function () {
                    self._prevMonth();
                });

            /**
             * 右箭头监听
             */
            utils.bind(self.target.querySelector(".rightArrow"),
                'click',
                function () {
                    self._nextMonth();
                });

            /**
             * 日期点击监听
             * 2017/4/14 fixed：用事件冒泡的方式监听动态添加元素的绑定事件
             */
            utils.bind(document,
                'click',
                function (e) {
                    utils.delegates(e,
                        'li',
                        function (t) {
                            // 父元素不是ul.date时跳出
                            if (!t.parentNode.classList.contains('date')) return;

                            self.nonceDay = +(t.innerHTML);
                            // 点击的是非本月的日期
                            var clkId = [].indexOf.call(t.parentElement.children, t);
                            if (!self.renderDate[clkId].isInner) {
                                if (self.nonceDay > 15) {
                                    self.selectedMonth = self.nonceMonth - 1;
                                    self._prevMonth();
                                } else {
                                    self.selectedMonth = self.nonceMonth + 1;
                                    self._nextMonth();
                                }
                            } else {
                                self.selectedMonth = self.nonceMonth;
                            }

                            self.selectedYear = self.nonceYear;

                            self._setDateList();
                        })
                });

            /**
             * 年份选择框监听
             */
            utils.bind(self.target.querySelector("select.year"),
                'change',
                function (e) {
                    self.nonceYear = e.target.value;
                    self._setDateList();

                });

            /**
             * 月份选择框监听
             */
            utils.bind(self.target.querySelector("select.date"),
                'change',
                function (e) {
                    self.nonceMonth = e.target.value - 1;
                    self._setDateList();

                });
        }
    }

})();