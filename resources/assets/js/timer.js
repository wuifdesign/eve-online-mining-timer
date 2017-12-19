(function ($) {
    'use strict';

    var configData;

    var sounds = {
        'sound-1': 'Sound 1',
        'sound-2': 'Sound 2',
        'sound-3': 'Sound 3',
        'sound-4': 'Sound 4',
        'sound-5': 'Sound 5',
        'sound-6': 'Sound 6',
        'sound-7': 'Sound 7'
    };

    var parseScanResult = function (result) {
        var scan_data = [];
        $.each(result.split('\n'), function (index, element) {
            try {
                var scanElement = {};
                var elementPart = element.split('\t');

                console.log(elementPart);

                if (elementPart.length != 4) {
                    console.log('length not 4');
                    throw 'shorter 4';
                }

                scanElement.label = elementPart[0] + ' - ' + elementPart[3];
                scanElement.count = parseInt(elementPart[1].replace(/\u00a0/g, '').replace(' ', '').replace('.', '').replace(',', ''));

                var type = elementPart[0].split(' ');
                var ore;

                if (type.length > 1) {
                    ore = type[1].toLowerCase();
                } else {
                    ore = type[0].toLowerCase();
                }

                if (ore === 'ochre') {
                    ore = 'dark ochre';
                } else if (ore === 'arisite') {
                    ore = 'green arisite';
                }

                scanElement.ore = ore;
                scan_data.push(scanElement);
            } catch (err) {
            }
        });
        return scan_data;
    };

    Vue.filter('time', function (value) {
        var minutes = Math.floor((value / 60));
        var seconds = value - (minutes * 60);
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        if (seconds < 10) {
            seconds = '0' + seconds;
        }
        return minutes + ':' + seconds;
    });

    Vue.filter('number', function (value) {
        return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    });

    Vue.filter('toFixed', function (value) {
        var data = Math.round(value * 100).toString();
        var number = data.substr(0, data.length-2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        var add = Math.round(data.slice(-2));
        if(number === '') { number = 0; }
        if(add < 10) { add = '0' + add; }
        return number + '.' + add;
    });

    Vue.filter('round', {
        read: function(val) {
            return Math.round(val);
        },
        write: function(val, oldVal) {
            return isNaN(val) ? 0 : Math.round(val);
        }
    });

    Vue.component('task-row', {
        template: '#grid-template',
        replace: true,
        props: {
            data: Object,
            current_ship: Object,
            settings: Object,
            yield_per_sec_m3: Number,
            'remove-task': {
                type: Function,
                required: true
            },
            'add-cargo': {
                type: Function,
                required: true
            }
        },
        data: function () {
            return {
                turrets: 1,
                turrets_select: [],
                running: false,
                select: configData['select'],
                interval: null
            };
        },
        created: function () {
            var self = this;
            this.$on('stop-tasks', function() {
                self.stop();
            });
            this.updateTurretData();
        },
        watch: {
            current_ship: function(val) {
                this.updateTurretData();
            }
        },
        computed: {
            ore_size: function () {
                if (this.data.ore === '') {
                    return 0;
                }
                return configData.size[this.data.ore];
            },
            total_ore_size: function () {
                if (isNaN(this.data.count)) {
                    return 0;
                }
                return Math.round(this.data.count * this.ore_size);
            },
            ore_per_sec: function () {
                var yield_per_turret = this.yield_per_sec_m3 / this.ore_size / this.current_ship.turrets
                return yield_per_turret * this.turrets;
            },
            circles: function () {
                var circles = this.total_ore_size / this.current_ship.yield_per_turret / this.turrets;
                return isNaN(circles) || !isFinite(circles) ? 0 : circles;
            },
            time: function () {
                var time =  Math.round(this.circles * this.current_ship.circle_time);
                return isNaN(time) ? 0 : time;
            }
        },
        methods: {
            updateTurretData: function () {
                if(this.current_ship !== null) {
                    this.turrets_select = [];
                    for(var i = 1; i <= this.current_ship.turrets; i++) {
                        this.turrets_select.push(i);
                    }
                    if(this.current_ship.split_turrets) {
                        this.turrets = 1;
                    } else {
                        this.turrets = this.current_ship.turrets;
                    }
                }

            },
            start: function () {
                if (this.time <= 0) {
                    return;
                }
                var self = this;
                this.interval = setInterval(function () {
                    var oreCount = self.ore_per_sec;
                    if (self.data.count < self.ore_per_sec) {
                        oreCount = self.data.count;
                    }
                    self.data.count -= self.ore_per_sec;
                    self.addCargo(oreCount * self.ore_size);
                    if (self.data.count <= 0) {
                        $('#' + self.settings.task_sound)[0].play();
                        self.data.count = 0;
                        self.stop();
                    }
                }, 1000);
                this.running = true;
            },
            stop: function () {
                clearInterval(this.interval);
                this.interval = null;
                this.running = false;
            },
            remove: function () {
                this.removeTask(this.data);
            }
        }
    });

    var initApp = function () {

        $.each(sounds, function(key, value) {
            $('#app-audio-holder').append('<audio id="' + key + '" src="./assets/audio/' + key + '.mp3"></audio>');
        });

        var miningApp = new Vue({
            el: '#mining-app',
            data: {
                cargo: 0,
                sounds: sounds,
                scanner_data: '',
                current_ship_index: null,
                ships: [],
                ships_list: [],
                settings: {
                    cargo_limit: 95,
                    task_sound: 'sound-1',
                    cargo_full_sound: 'sound-1'
                },
                tasks: []
            },
            created: function () {
                this.current_ship_index = localStorage.getItem('current_ship_index');

                var stored_ships = localStorage.getItem('ships');
                if (stored_ships === null) {
                    this.addEmptyShip();
                } else {
                    this.ships = JSON.parse(stored_ships);
                }

                var settings = localStorage.getItem('settings');
                if (settings !== null) {
                    this.settings = JSON.parse(settings);
                }
            },
            watch: {
                ship_count: function (val) {
                    if(val > 0 && this.current_ship_index === null) {
                        this.current_ship_index = 0;
                    } else if (val == 0) {
                        this.current_ship_index = null;
                        localStorage.removeItem('current_ship_index');
                    }
                },
                current_ship_index: function (val) {
                    if (typeof val !== 'undefined') {
                        localStorage.setItem('current_ship_index', val);
                    }
                }
            },
            computed: {
                current_ship: function () {
                    var ship = this.ships[this.current_ship_index];
                    if (typeof ship === 'undefined') {
                        return {
                            name: '',
                            cargo: 0,
                            yield_per_turret: 0,
                            circle_time: 0,
                            turrets: 1,
                            split_turrets: false
                        };
                    }
                    return ship;
                },
                ship_count: function () {
                    var count = 0;
                    $.each(this.ships, function(key, value) {
                        if(value.name !== '') {
                            count++;
                        }
                    });
                    return count;
                },
                yield_per_sec_m3: function () {
                    var yield_per_sec = (this.current_ship.yield_per_turret * this.current_ship.turrets) / this.current_ship.circle_time;
                    return isNaN(yield_per_sec) ? 0 : yield_per_sec;
                },
                max_cargo: function () {
                    return this.current_ship.cargo;
                },
                cargo_nearly_full: function () {
                    if (this.current_ship.cargo === 0) {
                        return false;
                    }
                    return this.cargo >= this.current_ship.cargo * (this.settings.cargo_limit / 100);
                },
                cargo_full: function () {
                    if (this.current_ship.cargo === 0) {
                        return false;
                    }
                    if(this.cargo >= this.current_ship.cargo) {
                        this.$broadcast('stop-tasks');
                        $('#' + this.settings.cargo_full_sound)[0].play();
                        return true;
                    }
                    return false;
                },
                full_cargo_time: function () {
                    var time = Math.round(this.current_ship.cargo / this.yield_per_sec_m3);
                    return isNaN(time) ? 0 : time;
                }
            },
            methods: {
                saveSettings: function () {
                    localStorage.setItem('settings', JSON.stringify(this.settings));
                },
                addEmptyShip: function () {
                    this.ships.push({
                        name: '',
                        cargo: 0,
                        yield_per_turret: 0,
                        circle_time: 0,
                        turrets: 1
                    });
                },
                saveShips: function () {
                    localStorage.setItem('ships', JSON.stringify(this.ships));
                },
                removeShip: function (ship) {
                    this.ships.$remove(ship);
                    this.saveShips();
                },
                addEmptyTask: function () {
                    this.tasks.push({
                        label: '',
                        ore: 'veldspar',
                        count: 0
                    })
                },
                addCargo: function (add_yield) {
                    this.cargo += add_yield;
                },
                playSound: function (sound) {
                    $('#' + sound)[0].play();
                },
                resetCargo: function () {
                    this.cargo = 0;
                },
                removeTask: function (task) {
                    this.tasks.$remove(task);
                },
                removeEmptyTasks: function () {
                    var self = this;
                    $.each(this.tasks, function (key, value) {
                        if (value.count === 0) {
                            setTimeout(function() {
                                self.tasks.$remove(value);
                            }, 0);
                        }
                    });
                },
                parseScannerData: function () {
                    var self = this;
                    setTimeout(function () {
                        var data = parseScanResult(self.scanner_data);
                        $.each(data, function (key, value) {
                            self.tasks.push({
                                label: value.label,
                                ore: value.ore,
                                count: value.count
                            });
                        });
                        self.scanner_data = '';
                    }, 10);
                }
            }
        });
        miningApp.addEmptyTask();
    };

    $.getJSON('./assets/json/config.json', function (data) {
        configData = data;
        initApp();
    });

}(jQuery));
