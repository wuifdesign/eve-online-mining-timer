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
    'sound-7': 'Sound 7',
  };

  var parseScanResult = function (result) {
    var scan_data = [];
    $.each(result.split('\n'), function (index, element) {
      try {
        var scanElement = {};
        var elementPart = element.split('\t');

        if (elementPart.length !== 4) {
          console.log('length not 4');
          throw 'shorter 4';
        }

        scanElement.variant = elementPart[0];
        scanElement.label = elementPart[0] + ' - ' + elementPart[3];
        scanElement.count = parseInt(elementPart[1].replace(/\u00a0/g, '').replace(' ', '').replace('.', '').replace(',', ''));

        var type = elementPart[0].split(' ');
        var ore;

        if (type.length > 1) {
          ore = type[1].toLowerCase();
        } else {
          ore = type[0].toLowerCase();
        }

        switch (ore) {
          case 'ochre':
            ore = 'dark ochre';
            break;
          case 'arisite':
            ore = 'green arisite';
            break;
          case 'icicle':
            ore = 'clear icicle';
            break;
          case 'glaze':
            ore = 'white glaze';
            break;
          case 'ice':
            ore = 'blue ice';
            break;
          case 'mass':
            ore = 'glacial mass';
            break;
          case 'crust':
            ore = 'glare crust';
            break;
          case 'glitter':
            ore = 'dark glitter';
            break;
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
    return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  });

  Vue.filter('numberHuman', function (value) {
    var suffix = ''
    var display = value;
    if(value >= 1000000) {
      display = (value / 1000000).toFixed(2);
      suffix = 'M';
    } else if(value >= 100000) {
      display = (value / 1000).toFixed(2);
      suffix = 'K';
    }
    return display.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + " " + suffix;
  });

  Vue.filter('toFixed', function (value) {
    var data = Math.round(value * 100).toString();
    var number = data.substr(0, data.length - 2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var add = Math.round(data.slice(-2));
    if (number === '') {
      number = 0;
    }
    if (add < 10) {
      add = '0' + add;
    }
    return number + '.' + add;
  });

  Vue.filter('round', {
    read: function (val) {
      return Math.round(val);
    },
    write: function (val) {
      return isNaN(val) ? 0 : Math.round(val);
    },
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
        required: true,
      },
      'add-cargo': {
        type: Function,
        required: true,
      },
      'add-ore': {
        type: Function,
        required: true
      },
    },
    data: function () {
      return {
        turrets: 1,
        turrets_select: [],
        running: false,
        select: configData['select'],
        interval: null,
      };
    },
    created: function () {
      var self = this;
      this.$on('stop-tasks', function () {
        self.stop();
      });
      this.updateTurretData();
    },
    watch: {
      current_ship: function () {
        this.updateTurretData();
      },
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
        var yield_per_turret = this.yield_per_sec_m3 / this.ore_size / this.current_ship.turrets;
        return yield_per_turret * this.turrets;
      },
      circles: function () {
        var circles = this.total_ore_size / this.current_ship.yield_per_turret / this.turrets;
        return isNaN(circles) || !isFinite(circles) ? 0 : circles;
      },
      time: function () {
        var time = Math.round(this.circles * this.current_ship.circle_time);
        return isNaN(time) ? 0 : time;
      },
    },
    methods: {
      updateTurretData: function () {
        if (this.current_ship !== null) {
          this.turrets_select = [];
          for (var i = 1; i <= this.current_ship.turrets; i++) {
            this.turrets_select.push(i);
          }
          if (this.current_ship.split_turrets) {
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
          self.addOre(self.data.ore, self.data.variant, oreCount);
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
      },
    },
  });

  var initApp = function () {

    $.each(sounds, function (key) {
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
          cargo_full_sound: 'sound-1',
        },
        tasks: [],
        ores: {
          "veldspar": { "Veldspar": { count: 0, ratio: 1 }, "Concentrated Veldspar": { count: 0, ratio: 1.05 }, "Dense Veldspar": { count: 0, ratio: 1.1 }, "Stable Veldspar": { count: 0, ratio: 1.15 } },
          "scordite": { "Scordite": { count: 0, ratio: 1 }, "Condensed Scordite": { count: 0, ratio: 1.05 }, "Massive Scordite": { count: 0, ratio: 1.1 }, "Glossy Scordite": { count: 0, ratio: 1.15 } },
          "pyroxeres": { "Pyroxeres": { count: 0, ratio: 1 }, "Solid Pyroxeres": { count: 0, ratio: 1.05 }, "Viscous Pyroxeres": { count: 0, ratio: 1.1 }, "Opulent Pyroxeres": { count: 0, ratio: 1.15 } },
          "plagioclase": { "Plagioclase": { count: 0, ratio: 1 }, "Azure Plagioclase": { count: 0, ratio: 1.05 }, "Rich Plagioclase": { count: 0, ratio: 1.1 }, "Sparkling Plagioclase": { count: 0, ratio: 1.15 } },
          "omber": { "Omber": { count: 0, ratio: 1 }, "Silvery Omber": { count: 0, ratio: 1.05 }, "Golden Omber": { count: 0, ratio: 1.1 }, "Platinoid Omber": { count: 0, ratio: 1.15 } },
          "kernite": { "Kernite": { count: 0, ratio: 1 }, "Luminous Kernite": { count: 0, ratio: 1.05 }, "Fiery Kernite": { count: 0, ratio: 1.1 }, "Resplendant Kernite": { count: 0, ratio: 1.15 } },
          "jaspet": { "Jaspet": { count: 0, ratio: 1 }, "Pure Jaspet": { count: 0, ratio: 1.05 }, "Pristine Jaspet": { count: 0, ratio: 1.1 }, "Immaculate Jaspet": { count: 0, ratio: 1.15 } },
          "hemorphite": { "Hemorphite": { count: 0, ratio: 1 }, "Vivid Hemorphite": { count: 0, ratio: 1.05 }, "Radiant Hemorphite": { count: 0, ratio: 1.1 }, "Scintillating Hemorphite": { count: 0, ratio: 1.15 } },
          "hedbergite": { "Hedbergite": { count: 0, ratio: 1 }, "Vitric Hedbergite": { count: 0, ratio: 1.05 }, "Glazed Hedbergite": { count: 0, ratio: 1.1 }, "Lustrous Hedbergite": { count: 0, ratio: 1.15 } },
          "gneiss": { "Gneiss": { count: 0, ratio: 1 }, "Iridescent Gneiss": { count: 0, ratio: 1.05 }, "Prismatic Gneiss": { count: 0, ratio: 1.1 }, "Brilliant Gneiss": { count: 0, ratio: 1.15 } },
          "dark ochre": { "Dark Ochre": { count: 0, ratio: 1 }, "Onyx Ochre": { count: 0, ratio: 1.05 }, "Obsidian Ochre": { count: 0, ratio: 1.1 }, "Jet Ochre": { count: 0, ratio: 1.15 } },
          "spodumain": { "Spodumain": { count: 0, ratio: 1 }, "Bright Spodumain": { count: 0, ratio: 1.05 }, "Gleaming Spodumain": { count: 0, ratio: 1.1 }, "Dazzling Spodumain": { count: 0, ratio: 1.15 } },
          "crokite": { "Crokite": { count: 0, ratio: 1 }, "Sharp Crokite": { count: 0, ratio: 1.05 }, "Crystalline Crokite": { count: 0, ratio: 1.1 }, "Pellucid Crokite": { count: 0, ratio: 1.15 } },
          "bistot": { "Bistot": { count: 0, ratio: 1 }, "Triclinic Bistot": { count: 0, ratio: 1.05 }, "Monoclinic Bistot": { count: 0, ratio: 1.1 }, "Cubic Bistot": { count: 0, ratio: 1.15 } },
          "arkonor": { "Arkonor": { count: 0, ratio: 1 }, "Crimson Arkonor": { count: 0, ratio: 1.05 }, "Prime Arkonor": { count: 0, ratio: 1.1 }, "Flawless Arkonor": { count: 0, ratio: 1.15 } },
          "mercoxit": { "Mercoxit": { count: 0, ratio: 1 }, "Magma Mercoxit": { count: 0, ratio: 1.05 }, "Vitreous Mercoxit": { count: 0, ratio: 1.1 } },
        },
        refine: {
          "tritanium": 0,
          "pyerite": 0,
          "mexallon": 0,
          "isogen": 0,
          "nocxium": 0,
          "zydrine": 0,
          "megacyte": 0,
          "morphite": 0
        },
        gather: {
          "tritanium": 0,
          "pyerite": 0,
          "mexallon": 0,
          "isogen": 0,
          "nocxium": 0,
          "zydrine": 0,
          "megacyte": 0,
          "morphite": 0
        },
        refinery: {
          reprocessingYield: 0.5,
          reprocessingType: true,
          reprocessingFlat: 50,
          reprocessingStation: 50,
          reprocessingTax: 0,
          skillProcessing: 5,
          skillProcessingEfficiency: 5,
          skillImplant: 0,
          skillOres: {
            "veldspar": 4,
            "scordite": 4,
            "pyroxeres": 4,
            "plagioclase": 4,
            "omber": 4,
            "kernite": 4,
            "jaspet": 4,
            "hemorphite": 4,
            "hedbergite": 4,
            "gneiss": 4,
            "dark ochre": 4,
            "spodumain": 4,
            "crokite": 4,
            "bistot": 4,
            "arkonor": 4,
            "mercoxit": 4,
          }
        },
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

        var refinery = localStorage.getItem('refinery');
        if (refinery !== null) {
          this.refinery = JSON.parse(refinery);
        }

        var gather = localStorage.getItem('gather');
        if (gather !== null) {
          this.gather = JSON.parse(gather);
        }
      },
      watch: {
        ship_count: function (val) {
          if (val > 0 && this.current_ship_index === null) {
            this.current_ship_index = 0;
          } else if (val === 0) {
            this.current_ship_index = null;
            localStorage.removeItem('current_ship_index');
          }
        },
        current_ship_index: function (val) {
          if (typeof val !== 'undefined') {
            localStorage.setItem('current_ship_index', val);
          }
        },
      },
      computed: {
        validShips: function () {
          return this.ships.filter(function (ship) {
            return ship.name !== '';
          });
        },
        current_ship: function () {
          var ship = this.ships[this.current_ship_index];
          if (typeof ship === 'undefined') {
            return {
              name: '',
              cargo: 0,
              yield_per_turret: 0,
              circle_time: 0,
              turrets: 1,
              split_turrets: false,
            };
          }
          return ship;
        },
        ship_count: function () {
          var count = 0;
          $.each(this.ships, function (key, value) {
            if (value.name !== '') {
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
          if (this.cargo >= this.current_ship.cargo) {
            this.$broadcast('stop-tasks');
            $('#' + this.settings.cargo_full_sound)[0].play();
            return true;
          }
          return false;
        },
        full_cargo_time: function () {
          var time = Math.round(this.current_ship.cargo / this.yield_per_sec_m3);
          return isNaN(time) ? 0 : time;
        },
        reprocessingYield: function() {
          var reprocessingYield = 0.5;
          if (this.refinery !== null) {
            if (this.refinery.reprocessingType) {
              reprocessingYield = (this.refinery.reprocessingStation / 100)
                                * (1 + this.refinery.skillProcessing * 0.03)
                                * (1 + this.refinery.skillProcessingEfficiency * 0.02)
                                * (1 + this.refinery.skillImplant / 100);
              this.refinery.reprocessingYield = reprocessingYield;
              return ((reprocessingYield * (1 + 4 * 0.02)) * 100).toFixed(2);
            } else if (this.refinery.reprocessingFlat && !isNaN(this.refinery.reprocessingFlat)) {
              reprocessingYield = parseFloat(this.refinery.reprocessingFlat, 10).toFixed(2) / 100;
            } else {
            }
          }

          this.refinery.reprocessingYield = reprocessingYield;
          return (reprocessingYield * 100).toFixed(2);
        }
      },
      methods: {
        saveSettings: function () {
          localStorage.setItem('settings', JSON.stringify(this.settings));
        },
        saveRefinery: function () {
          localStorage.setItem('refinery', JSON.stringify(this.refinery));
        },
        saveGather: function () {
          localStorage.setItem('gather', JSON.stringify(this.gather));
        },
        addEmptyShip: function () {
          this.ships.push({
            name: '',
            cargo: 0,
            yield_per_turret: 0,
            circle_time: 0,
            turrets: 1,
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
            count: 0,
          });
        },
        addCargo: function (add_yield) {
          this.cargo += add_yield;
        },
        addOre: function (oreType, oreVariant, oreYield) {
          if (this.ores[oreType] && oreYield) {
            if (!this.ores[oreType][oreVariant]) {
              oreVariant = Object.keys(this.ores[oreType])[0];
            }
            this.ores[oreType][oreVariant].count += oreYield;
            this.addMinerals(oreType, oreVariant, oreYield);
          }
        },
        addMinerals: function(oreType, oreVariant, oreYield) {
          var oreRatio = this.ores[oreType][oreVariant].ratio;
          var oreRefine = configData.refine[oreType];
          var refineryYield = this.refinery.reprocessingYield;
          var refinerySkill = this.refinery.skillOres[oreType];

          if (refinerySkill) {
            refineryYield = refineryYield * (1 + refinerySkill * 0.02);
          }

          this.refine.tritanium += oreYield * oreRatio * refineryYield * oreRefine.tritanium;
          this.refine.pyerite += oreYield * oreRatio * refineryYield * oreRefine.pyerite;
          this.refine.mexallon += oreYield * oreRatio * refineryYield * oreRefine.mexallon;
          this.refine.isogen += oreYield * oreRatio * refineryYield * oreRefine.isogen;
          this.refine.nocxium += oreYield * oreRatio * refineryYield * oreRefine.nocxium;
          this.refine.zydrine += oreYield * oreRatio * refineryYield * oreRefine.zydrine;
          this.refine.megacyte += oreYield * oreRatio * refineryYield * oreRefine.megacyte;
          this.refine.morphite += oreYield * oreRatio * refineryYield * oreRefine.morphite;
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
              setTimeout(function () {
                self.tasks.$remove(value);
              }, 0);
            }
          });
        },
        clearSummary: function () {
          var oreTypes = Object.keys(this.ores);
          for(var i = 0; i < oreTypes.length; i++) {
            var oreVariants = Object.keys(this.ores[oreTypes[i]]);
            for(var j = 0; j < oreVariants.length; j++) {
              this.ores[oreTypes[i]][oreVariants[j]].count = 0;
            }
          }
        },
        clearRefine: function () {
          this.refine.tritanium = 0;
          this.refine.pyerite = 0;
          this.refine.mexallon = 0;
          this.refine.isogen = 0;
          this.refine.nocxium = 0;
          this.refine.zydrine = 0;
          this.refine.megacyte = 0;
          this.refine.morphite = 0;
        },
        oreTypeCheck: function(ores) {
          var oreTypes = Object.keys(ores);
          var oreSummary = [];
          for (var i = 0; i < oreTypes.length; i++) {
            var oreVariants = Object.keys(ores[oreTypes[i]]);
            for (var j = 0; j < oreVariants.length; j++) {
              if(ores[oreTypes[i]][oreVariants[j]].count !== 0 && !oreSummary.includes(oreTypes[i])) {
                oreSummary.push(oreTypes[i]);
              }
            }
          }
          return oreSummary; // use oreTypes for testing
        },
        oreVariantCheck: function(oreType) {
          var oreVariants = Object.keys(this.ores[oreType]);
          var variantSummary = [];
          for (var i = 0; i < oreVariants.length; i++) {
            if(this.ores[oreType][oreVariants[i]].count !== 0 && !variantSummary.includes(oreVariants[i])) {
              variantSummary.push(oreVariants[i]);
            }
          }
          return variantSummary; // use oreVariants for testing
        },
        summaryType: function(oreType) {
          var baseVariant = Object.keys(this.ores[oreType])[0];
          return baseVariant;
        },
        summaryCount: function(oreType) {
          var oreVariants = Object.keys(this.ores[oreType]);
          var oreCounts = 0;
          for (var i = 0; i < oreVariants.length; i++) {
            oreCounts += this.ores[oreType][oreVariants[i]].count;
          }
          return oreCounts;
        },
        variantCount: function(oreType, oreVariant) {
          var oreCount = this.ores[oreType][oreVariant].count;

          if(!oreType || !oreVariant || isNaN(oreCount)) {
            return 0;
          } else {
            return oreCount;
          }
        },
        summaryVolume: function(oreType, summaryCount) {
          var oreSize = configData.size[oreType];

          if(!oreType || isNaN(summaryCount) || isNaN(oreSize)) {
            return 0;
          } else {
            return Math.round(summaryCount * oreSize * 100) / 100;
          }
        },
        variantVolume: function(oreType, oreVariant) {
          var oreCount = this.ores[oreType][oreVariant].count;
          var oreSize = configData.size[oreType];

          if(!oreType || !oreVariant || isNaN(oreCount) || isNaN(oreSize)) {
            return 0;
          } else {
            return Math.round(oreCount * oreSize * 100) / 100;
          }
        },
        gatheringLeft: function(mineralName) {
          var mineralHave = this.refine[mineralName];
          var mineralNeed = parseInt(this.gather[mineralName],10);
          var mineralLeft = (mineralNeed - mineralHave);

          if (isNaN(mineralLeft) || mineralLeft < 0) {
            return 0;
          } else {
            return mineralLeft;
          }
        },
        parseScannerData: function () {
          var self = this;
          setTimeout(function () {
            var data = parseScanResult(self.scanner_data);
            $.each(data, function (key, value) {
              self.tasks.push({
                label: value.label,
                ore: value.ore,
                count: value.count,
                variant: value.variant,
              });
            });
            self.scanner_data = '';
          }, 10);
        },
      },
    });
    miningApp.addEmptyTask();
  };

  $.getJSON('./assets/json/config.json', function (data) {
    configData = data;
    initApp();
  });

}(jQuery));
