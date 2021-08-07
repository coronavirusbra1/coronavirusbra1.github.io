// Chroma.js
function chroma_style(array, value) {
    var scale = chroma.scale(array).domain([0, 100]);
    var background_color = scale(value).hex();

    var contrast_ratio = 2;
    var white = chroma.contrast(background_color, 'white');
    var black = chroma.contrast(background_color, 'black');

    if (white >= contrast_ratio) {
        var text_color = "#fff";
    } else if (black >= contrast_ratio) {
        var text_color = "#000";
    }

    var style = 'background-color: '+background_color+'; color: '+text_color+';';

    return style;
}

// Moment
moment.locale('pt-br');

// Numeral
numeral.locale('pt-br');

// TableSorter
$.tablesorter.addParser({
    id: "dots",
    is: function(s) {
        return false;
    },
    format: function(s) {
        s = s.replaceAll(",", "")
             .replaceAll(".", "")
        return s;
    },
    type: "numeric"
});     

function show_tooltip() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Popover(tooltipTriggerEl)
    });
}

// Toasty
// -- https://www.uplabs.com/posts/toasty-konami-code
// -- UP, UP, DOWN, DOWN, LEFT, RIGHT, LEFT, RIGHT, B, A
var konami_keys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    65: 'a',
    66: 'b'
};
var konami_code = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];
var konami_position = 0;
document.addEventListener('keydown', function(e) {
    var key = konami_keys[e.keyCode];
    var required_key = konami_code[konami_position];
    if (key == required_key) {
        konami_position++;
        if (konami_position == konami_code.length) {
            activate_toasty();
            konami_position = 0;
        }
    } else {
        konami_position = 0;
    }
});
function activate_toasty() {
    var audio = new Audio('/assets/toasty.mp3');
    audio.play();
    $('.toasty').addClass('toasty--start');
    setTimeout(function(){
        $('.toasty').removeClass('toasty--start');
    }, 3500);
}

$(function() {
    var endpoint = 'https://api.vacinacao-covid19.com/coronavirusbra1';

    // Cards
    $('#card_switch input').on('change',function() {
        var value = $(this).val();
        var id = $(this).attr('id');
        if($(this).is(':checked')) {
            $('#card_'+value).removeClass('d-none');
            Cookies.set(id, 1);
        } else {
            $('#card_'+value).addClass('d-none');
            Cookies.set(id, 0);            
        }
    });
    //-- Cookies
    $('#card_switch input[type=checkbox]').each(function () {
        var value = $(this).val();
        var id = $(this).attr('id');
        var cookie = Cookies.get(id);

        if($('#card_'+value).length) {
            if(cookie == 1) {
                $('#card_'+value).removeClass('d-none');
                $(this).prop('checked', true);
            } else if(cookie == 0) {
                $('#card_'+value).addClass('d-none');
                $(this).prop('checked', false);
            }     
        }   
    });
    //-- Vaccination
    if($('#card_vaccination').length) {
        $.ajax({
            url: endpoint+'/cards/vaccination.json',
            cache: false,
            method: 'GET',
            success: function(data) {
                var c = $('#card_vaccination');

                c.find('.loading').addClass('d-none');
                c.find('.card-body').removeClass('d-none');

                c.find('.doses_total_1').html(numeral(data.total_vaccinations.doses_1).format('0,0'));
                c.find('.doses_percentage_1').html(data.total_vaccinations.percentage_doses_1);
                c.find('.doses_total_fully_vaccinated').html(numeral(data.total_vaccinations.fully_vaccinated).format('0,0'));
                c.find('.doses_percentage_fully_vaccinated').html(data.total_vaccinations.percentage_fully_vaccinated);
                c.find('.doses_total').html(numeral(data.total_vaccinations.total).format('0,0'));
                c.find('.last_update').html(moment(data.last_update).format('DD[/]MM[/]YY [às] HH[h]mm'));

                if($('#card_daily_vaccination').length) {
                    var d = $('#card_daily_vaccination');

                    d.find('.loading').addClass('d-none');
                    d.find('.card-body').removeClass('d-none');
    
                    d.find('.doses_total_fully_vaccinated').html(numeral(data.daily_vaccinations.fully_vaccinated).format('0,0'));
                    d.find('.doses_total_0').html(numeral(data.daily_vaccinations.doses_0).format('0,0'));
                    d.find('.doses_total_1').html(numeral(data.daily_vaccinations.doses_1).format('0,0'));
                    d.find('.doses_total_2').html(numeral(data.daily_vaccinations.doses_2).format('0,0'));
                    d.find('.doses_total').html(numeral(data.daily_vaccinations.total).format('0,0'));
                    d.find('.last_update').html(moment(data.last_update).format('DD[/]MM[/]YY [às] HH[h]mm'));

                    if(moment(data.last_update).isSame(moment(), 'day')) {
                        d.find('.daily').html('Hoje');
                    } else {
                        d.find('.daily').html('Ontem');
                    }
                }
            }
        });
    }
    //-- Cases
    if($('#card_cases').length) {
        $.ajax({
            url: endpoint+'/cards/cases.json',
            cache: false,
            method: 'GET',
            success: function(data) {
                var c = $('#card_cases');

                c.find('.loading').addClass('d-none');
                c.find('.card-body').removeClass('d-none');

                if(moment(data.date).isSame(moment(), 'day')) {
                    var compare_date = 'Hoje: ';
                } else {
                    var compare_date = 'Ontem: ';
                }
                c.find('.total').html(numeral(data.total).format('0,0'));
                c.find('.new').html(compare_date+numeral(data.new).format('0,0'));
                c.find('.last_update').html(moment(data.last_update).format('DD[/]MM[/]YY [às] HH[h]mm'));
            }
        });
    }
    //-- Deaths
    if($('#card_deaths').length) {
        $.ajax({
            url: endpoint+'/cards/deaths.json',
            cache: false,
            method: 'GET',
            success: function(data) {
                var c = $('#card_deaths');

                c.find('.loading').addClass('d-none');
                c.find('.card-body').removeClass('d-none');

                if(moment(data.date).isSame(moment(), 'day')) {
                    var compare_date = 'Hoje: ';
                } else {
                    var compare_date = 'Ontem: ';
                }
                c.find('.total').html(numeral(data.total).format('0,0'));
                c.find('.new').html(compare_date+numeral(data.new).format('0,0'));
                c.find('.last_update').html(moment(data.last_update).format('DD[/]MM[/]YY [às] HH[h]mm'));
            }
        });
    }
    //-- Recovered
    if($('#card_recovered').length) {
        $.ajax({
            url: endpoint+'/cards/recovered.json',
            cache: false,
            method: 'GET',
            success: function(data) {
                var c = $('#card_recovered');

                c.find('.loading').addClass('d-none');
                c.find('.card-body').removeClass('d-none');

                c.find('.total').html(numeral(data.total).format('0,0'));
                c.find('.last_update').html(moment(data.last_update).format('DD[/]MM[/]YY [às] HH[h]mm'));
            }
        });
    }
    //-- Suspects
    if($('#card_suspects').length) {
        $.ajax({
            url: endpoint+'/cards/suspects.json',
            cache: false,
            method: 'GET',
            success: function(data) {
                var c = $('#card_suspects');

                c.find('.loading').addClass('d-none');
                c.find('.card-body').removeClass('d-none');

                c.find('.total').html(numeral(data.total_suspects).format('0,0'));
                c.find('.last_update').html(moment(data.last_update).format('DD[/]MM[/]YY [às] HH[h]mm'));
            }
        });
    }
    //-- UTI
    if($('#card_uti').length) {
        $.ajax({
            url: endpoint+'/cards/uti.json',
            cache: false,
            method: 'GET',
            success: function(data) {
                var c = $('#card_uti');

                c.find('.loading').addClass('d-none');
                c.find('.card-body').removeClass('d-none');

                c.find('.quantity').html(numeral(data.total_quantity).format('0,0'));
                c.find('.occupied').html(numeral(data.total_occupied).format('0,0'));
                c.find('.percentage').html(numeral(data.total_percentage).format('0,0')+'%');
                c.find('.last_update').html(moment(data.last_update).format('DD[/]MM[/]YY [às] HH[h]mm'));
            }
        });
    }
    //-- Tests
    if($('#card_tests').length) {
        $.ajax({
            url: endpoint+'/cards/tests.json',
            cache: false,
            method: 'GET',
            success: function(data) {
                var c = $('#card_tests');

                c.find('.loading').addClass('d-none');
                c.find('.card-body').removeClass('d-none');

                c.find('.total').html(numeral(data.total_tests).format('0,0'));
                c.find('.last_update').html(moment(data.last_update).format('DD[/]MM[/]YY [às] HH[h]mm'));
            }
        });
    }
    //-- Doses MS
    if($('#card_doses_ms').length) {
        $.ajax({
            url: endpoint+'/cards/vacinacovidbr.json',
            cache: false,
            method: 'GET',
            success: function(data) {
                var c = $('#card_doses_ms');

                c.find('.loading').addClass('d-none');
                c.find('.card-body').removeClass('d-none');

                c.find('.total').html(data.round);
                var tweet = 'https://twitter.com/intent/tweet?text=O%20@minsaude%20tem%20'+data.round+'%20milh%C3%B5es%20doses%20armazenadas%20pendentes%20de%20distribui%C3%A7%C3%A3o%20aos%20estados!%20Para%20acelerar%20a%20vacina%C3%A7%C3%A3o,%20distribua%20as%20doses!&hashtags=distribuiMS&via=vacinacovidbr&url=https://apolinar.io/vacinas/quantasdoses/';
                c.find('.tweet').attr('href',tweet);
                c.find('.updated').html(data.updated);
            }
        });
    }

    // Tables
    $('#table_switch input').on('change',function() {
        var value = $(this).val();
        var id = $(this).attr('id');
        if($(this).is(':checked')) {
            $('[data-hidden='+value+']').removeClass('d-none');
            Cookies.set(id, 1);
        } else {
            $('[data-hidden='+value+']').addClass('d-none');
            Cookies.set(id, 0);
        }
    });
    //-- Global
    if($('#table_global').length) {
        $.ajax({
            url: endpoint+'/tables/global.json',
            cache: false,
            method: 'GET',
            success: function(data) {
                var c = $('#table_global');
                c.find('tbody').html('');
                
                var sum_cases_total = 0;
                var sum_cases_new = 0;
                var sum_deaths_total = 0;
                var sum_deaths_new = 0;
                var sum_tests = 0;
                var sum_suspects = 0;
                var sum_recovered = 0;
                var sum_vaccinations_doses_0 = 0;
                var sum_vaccinations_doses_1 = 0;
                var sum_vaccinations_doses_2 = 0;
                var sum_vaccinations_total = 0;

                var cases_biggest = 0;
                var deaths_biggest = 0;
                $.each(data, function (key, item) {
                    if (item.cases.new > cases_biggest) {
                        cases_biggest = item.cases.new;
                    }
                    if (item.deaths.new > deaths_biggest) {
                        deaths_biggest = item.deaths.new;
                    }
                });

                $.each(data, function (key, item) {
                    var cases_total = item.cases.total == null ? '0' : item.cases.total;
                    var cases_new = item.cases.new == null ? '0' : item.cases.new;
                    var deaths_total = item.deaths.total == null ? '0' : item.deaths.total;
                    var deaths_new = item.deaths.new == null ? '0' : item.deaths.new;
                    var tests = item.tests.total == null ? '0' : item.tests.total;
                    var suspects = item.suspects.total == null ? '0' : item.suspects.total;
                    var recovered = item.recovered.total == null ? '0' : item.recovered.total;
                    var vaccinations_doses_0 = item.vaccinations.doses_0 == null ? '0' : item.vaccinations.doses_0;
                    var vaccinations_doses_1 = item.vaccinations.doses_1 == null ? '0' : item.vaccinations.doses_1;
                    var vaccinations_doses_2 = item.vaccinations.doses_2 == null ? '0' : item.vaccinations.doses_2;
                    var vaccinations_total = item.vaccinations.total == null ? '0' : item.vaccinations.total;
                    var vaccinations_doses_0_percentage = item.vaccinations.doses_0_percentage == null ? '0' : item.vaccinations.doses_0_percentage;
                    var vaccinations_doses_1_percentage = item.vaccinations.doses_1_percentage == null ? '0' : item.vaccinations.doses_1_percentage;
                    var vaccinations_doses_2_percentage = item.vaccinations.doses_2_percentage == null ? '0' : item.vaccinations.doses_2_percentage;
                    var vaccinations_fully_vaccinated_percentage = item.vaccinations.percentage_fully_vaccinated == null ? '0' : item.vaccinations.percentage_fully_vaccinated;

                    sum_cases_total += item.cases.total;
                    sum_cases_new += item.cases.new;
                    sum_deaths_total += item.deaths.total;
                    sum_deaths_new += item.deaths.new;
                    sum_tests += item.tests.total;
                    sum_suspects += item.suspects.total;
                    sum_recovered += item.recovered.total;
                    sum_vaccinations_doses_0 += item.vaccinations.doses_0;
                    sum_vaccinations_doses_1 += item.vaccinations.doses_1;
                    sum_vaccinations_doses_2 += item.vaccinations.doses_2;
                    sum_vaccinations_total += item.vaccinations.total;

                    var progress_cases_new = cases_new / cases_biggest * 100;
                    var progress_deaths_new = deaths_new / deaths_biggest * 100;

                    var td = '<tr>' +
                        '<td class="align-middle text-nowrap">' +
                            '<img class="mx-auto mb-1 rounded border border-secondary" src="//cdn.jsdelivr.net/gh/bgeneto/bandeiras-br/imagens/'+item.iso_code.toUpperCase()+'.png" width="20" />' +
                            '<span class="d-inline-block d-lg-none ms-2">'+item.iso_code.toUpperCase()+'</span>' +
                            '<span class="d-none d-lg-inline-block ms-2">'+item.state+'</span>' +
                        '</td>' +
                        '<td class="text-lg-center" data-hidden="cases">'+numeral(cases_total).format('0,0')+'</td>' +
                        '<td class="text-lg-center" data-hidden="cases">' +
                        '<div class="d-flex align-items-center">' +
                        '<div class="w-50 text-end pe-2">'+numeral(cases_new).format('0,0')+'</div>' +
                        '<div class="w-50 progress"><div class="progress-bar bg-primary" role="progressbar" style="width: '+progress_cases_new+'%" aria-valuenow="'+progress_cases_new+'" aria-valuemin="0" aria-valuemax="100"></div></div>' +
                        '</div>' +
                        '</td>' +
                        '<td class="text-lg-center" data-hidden="deaths">'+numeral(deaths_total).format('0,0')+'</td>' +
                        '<td class="text-lg-center" data-hidden="deaths">' +
                        '<div class="d-flex align-items-center">' +
                        '<div class="w-50 text-end pe-2">'+numeral(deaths_new).format('0,0')+'</div>' +
                        '<div class="w-50 progress"><div class="progress-bar bg-danger" role="progressbar" style="width: '+progress_deaths_new+'%" aria-valuenow="'+progress_deaths_new+'" aria-valuemin="0" aria-valuemax="100"></div></div>' +
                        '</div>' +
                        '</td>' +
                        '<td class="text-lg-center d-none" data-hidden="tests">'+numeral(tests).format('0,0')+'</td>' +
                        '<td class="text-lg-center d-none" data-hidden="suspects">'+numeral(suspects).format('0,0')+'</td>' +
                        '<td class="text-lg-center d-none" data-hidden="recovered">'+numeral(recovered).format('0,0')+'</td>' +
                        '<td class="text-lg-center" data-hidden="doses">'+numeral(vaccinations_doses_1).format('0,0')+'</td>' +
                        '<td class="text-lg-center" data-hidden="doses">'+numeral(vaccinations_doses_2).format('0,0')+'</td>' +
                        '<td class="text-lg-center" data-hidden="doses">'+numeral(vaccinations_doses_0).format('0,0')+'</td>' +
                        '<td class="text-lg-center d-none" data-hidden="doses_total">'+numeral(vaccinations_total).format('0,0')+'</td>' +
                        '<td class="text-lg-center" data-hidden="doses_percentage" style="'+chroma_style(['cdf5ff', '00429d'], vaccinations_doses_1_percentage)+'">'+vaccinations_doses_1_percentage+'%</td>' +
                        '<td class="text-lg-center" data-hidden="doses_percentage" style="'+chroma_style(['cdf5ff', '00429d'], vaccinations_fully_vaccinated_percentage)+'">'+vaccinations_fully_vaccinated_percentage+'%</td>' +
                    '</tr>';
                    c.find('tbody').append(td);
                });

                var sum = '<tr>' +
                    '<th></th>' +
                    '<th class="text-lg-center border-start" data-hidden="cases">'+numeral(sum_cases_total).format('0,0')+'</th>' +
                    '<th class="text-lg-center" data-hidden="cases">'+numeral(sum_cases_new).format('0,0')+'</th>' +
                    '<th class="text-lg-center border-start" data-hidden="deaths">'+numeral(sum_deaths_total).format('0,0')+'</th>' +
                    '<th class="text-lg-center" data-hidden="deaths">'+numeral(sum_deaths_new).format('0,0')+'</th>' +
                    '<th class="text-lg-center border-start d-none" data-hidden="tests">'+numeral(sum_tests).format('0,0')+'</th>' +
                    '<th class="text-lg-center border-start d-none" data-hidden="suspects">'+numeral(sum_suspects).format('0,0')+'</th>' +
                    '<th class="text-lg-center border-start d-none" data-hidden="recovered">'+numeral(sum_recovered).format('0,0')+'</th>' +
                    '<th class="text-lg-center border-start" data-hidden="doses">'+numeral(sum_vaccinations_doses_1).format('0,0')+'</th>' +
                    '<th class="text-lg-center" data-hidden="doses">'+numeral(sum_vaccinations_doses_2).format('0,0')+'</th>' +
                    '<th class="text-lg-center" data-hidden="doses">'+numeral(sum_vaccinations_doses_0).format('0,0')+'</th>' +
                    '<th class="text-lg-center border-start d-none" data-hidden="doses_total">'+numeral(sum_vaccinations_total).format('0,0')+'</th>' +
                    '<th class="border-start" data-hidden="doses_percentage"></th>' +
                    '<th data-hidden="doses_percentage"></th>' +
                '</tr>';
                c.find('tfoot').append(sum);

                c.tablesorter({
                    theme : 'bootstrap',
                    widgets : ['cssStickyHeaders'],
                    sortReset: true
                });

                $('#table_switch input[type=checkbox]').each(function () {
                    var value = $(this).val();
                    var id = $(this).attr('id');
                    var cookie = Cookies.get(id);

                    if(cookie == 1) {
                        $('[data-hidden='+value+']').removeClass('d-none');
                        $(this).prop('checked', true);
                    } else if(cookie == 0) {
                        $('[data-hidden='+value+']').addClass('d-none');
                        $(this).prop('checked', false);
                    }
                });
            }
        });
    }
    //-- Vaccination
    if($('#table_vaccination').length) {
        $.ajax({
            url: endpoint+'/tables/vaccination.json',
            cache: false,
            method: 'GET',
            success: function(data) {
                var c = $('#table_vaccination');
                c.find('tbody').html('');
                
                var sum_vaccinations_doses_0 = 0;
                var sum_daily_vaccinations_doses_0 = 0;
                var sum_vaccinations_doses_1 = 0;
                var sum_daily_vaccinations_doses_1 = 0;
                var sum_vaccinations_doses_2 = 0;
                var sum_daily_vaccinations_doses_2 = 0;
                var sum_vaccinations_total = 0;

                var doses_0_biggest = 0;
                var doses_1_biggest = 0;
                var doses_2_biggest = 0;
                $.each(data, function (key, item) {
                    if (item.daily_vaccinations[0] > doses_0_biggest) {
                        doses_0_biggest = item.daily_vaccinations[0];
                    }
                    if (item.daily_vaccinations[1] > doses_1_biggest) {
                        doses_1_biggest = item.daily_vaccinations[1];
                    }
                    if (item.daily_vaccinations[2] > doses_2_biggest) {
                        doses_2_biggest = item.daily_vaccinations[2];
                    }
                });

                $.each(data, function (key, item) {
                    var vaccines = item.vaccines.toString();
                    var vaccines = vaccines.replaceAll(',','<br/>');

                    var vaccinations_doses_0 = item.total_vaccinations[0] == null ? '0' : item.total_vaccinations[0];
                    var daily_vaccinations_doses_0 = item.daily_vaccinations[0] == null ? '0' : item.daily_vaccinations[0];
                    var vaccinations_doses_1 = item.total_vaccinations[1] == null ? '0' : item.total_vaccinations[1];
                    var daily_vaccinations_doses_1 = item.daily_vaccinations[1] == null ? '0' : item.daily_vaccinations[1];
                    var vaccinations_doses_2 = item.total_vaccinations[2] == null ? '0' : item.total_vaccinations[2];
                    var daily_vaccinations_doses_2 = item.daily_vaccinations[2] == null ? '0' : item.daily_vaccinations[2];
                    var vaccinations_total = item.total_vaccinations.total == null ? '0' : item.total_vaccinations.total;
                    var vaccinations_doses_0_percentage = item.total_vaccinations.percentage_doses_0 == null ? '0' : item.total_vaccinations.percentage_doses_0;
                    var vaccinations_doses_1_percentage = item.total_vaccinations.percentage_doses_1 == null ? '0' : item.total_vaccinations.percentage_doses_1;
                    var vaccinations_doses_2_percentage = item.total_vaccinations.percentage_doses_2 == null ? '0' : item.total_vaccinations.percentage_doses_2;
                    var vaccinations_fully_vaccinated_percentage = item.total_vaccinations.percentage_fully_vaccinated == null ? '0' : item.total_vaccinations.percentage_fully_vaccinated;

                    sum_vaccinations_doses_0 += item.total_vaccinations[0];
                    sum_daily_vaccinations_doses_0 += item.daily_vaccinations[0];
                    sum_vaccinations_doses_1 += item.total_vaccinations[1];
                    sum_daily_vaccinations_doses_1 += item.daily_vaccinations[1];
                    sum_vaccinations_doses_2 += item.total_vaccinations[2];
                    sum_daily_vaccinations_doses_2 += item.daily_vaccinations[2];
                    sum_vaccinations_total += item.total_vaccinations.total;

                    var progress_doses_0 = daily_vaccinations_doses_0 / doses_0_biggest * 100;
                    var progress_doses_1 = daily_vaccinations_doses_1 / doses_1_biggest * 100;
                    var progress_doses_2 = daily_vaccinations_doses_2 / doses_2_biggest * 100;

                    var td = '<tr>' +
                        '<td class="align-middle text-nowrap">' +
                            '<img class="mx-auto mb-1 rounded border border-secondary" src="//cdn.jsdelivr.net/gh/bgeneto/bandeiras-br/imagens/'+item.iso_code.toUpperCase()+'.png" width="20" />' +
                            '<span class="d-inline-block d-lg-none ms-2">'+item.iso_code.toUpperCase()+'</span>' +
                            '<span class="d-none d-lg-inline-block ms-2">'+item.state+'</span>' +
                            '<span role="button" data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-html="true" data-bs-content="'+vaccines+'"><svg class="bi d-inline-block ms-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 512 512"><defs/><path d="M505.4 107.3L404.7 6.6C384.5-13.5 354 17 374.2 37.1l12.2 12.3-58.8 58.8-51-51C256.4 37 225.9 67.5 246 87.7l23.5 23.5-28.5 28.5 48.8 48.8c20.2 20.1-10.3 50.7-30.5 30.5l-48.8-48.8-17.3 17.3 48.8 48.8c20.2 20.1-10.3 50.7-30.5 30.5L162.8 218l-17.3 17.3 48.8 48.8c20.2 20.1-10.3 50.7-30.5 30.5L115 265.8l-43.7 43.7c-8.4 8.4-8.4 22.1 0 30.5l35 35.1L6.7 475C-13.5 495 17 525.6 37.1 505.4l99.8-99.8 35 35.1c8.5 8.4 22.2 8.4 30.6 0l198.3-198.3 23.5 23.5c20 20 51-10 30.5-30.5l-51-51 58.8-58.8 12.3 12.2c20.1 20.2 50.7-10.3 30.5-30.5zm-132.1 46.6l-15.2-15.2 58.8-58.8L432.1 95l-58.8 58.8z"/></svg></span>' +
                        '</td>' +
                        '<td class="align-middle text-lg-center">'+numeral(vaccinations_doses_1).format('0,0')+'</td>' +
                        '<td class="text-lg-center align-middle">' +
                            '<div class="d-flex align-items-center">' +
                                '<div class="w-50 text-end pe-2">'+numeral(daily_vaccinations_doses_1).format('0,0')+'</div>' +
                                '<div class="w-50 progress"><div class="progress-bar bg-primary" role="progressbar" style="width: '+progress_doses_1+'%" aria-valuenow="'+progress_doses_1+'" aria-valuemin="0" aria-valuemax="100"></div>' +
                            '</div>' +
                        '</div>' +
                        '</td>' +
                        '<td class="align-middle text-lg-center">'+numeral(vaccinations_doses_2).format('0,0')+'</td>' +
                        '<td class="text-lg-center align-middle">' +
                            '<div class="d-flex align-items-center">' +
                                '<div class="w-50 text-end pe-2">'+numeral(daily_vaccinations_doses_2).format('0,0')+'</div>' +
                                    '<div class="w-50 progress"><div class="progress-bar bg-primary" role="progressbar" style="width: '+progress_doses_2+'%" aria-valuenow="'+progress_doses_2+'" aria-valuemin="0" aria-valuemax="100"></div>' +
                                '</div>' +
                            '</div>' +
                        '</td>' +
                        '<td class="align-middle text-lg-center">'+numeral(vaccinations_doses_0).format('0,0')+'</td>' +
                        '<td class="text-lg-center align-middle">' +
                            '<div class="d-flex align-items-center">' +
                                '<div class="w-50 text-end pe-2">'+numeral(daily_vaccinations_doses_0).format('0,0')+'</div>' +
                                '<div class="w-50 progress"><div class="progress-bar bg-primary" role="progressbar" style="width: '+progress_doses_0+'%" aria-valuenow="'+progress_doses_0+'" aria-valuemin="0" aria-valuemax="100"></div></div>' +
                            '</div>' +
                        '</td>' +
                        '<td class="align-middle text-lg-center">'+numeral(vaccinations_total).format('0,0')+'</td>' +
                        '<td class="align-middle text-lg-center" style="'+chroma_style(['cdf5ff', '00429d'], vaccinations_doses_1_percentage)+'">'+vaccinations_doses_1_percentage+'%</td>' +
                        '<td class="align-middle text-lg-center" style="'+chroma_style(['cdf5ff', '00429d'], vaccinations_fully_vaccinated_percentage)+'">'+vaccinations_fully_vaccinated_percentage+'%</td>' +
                    '</tr>';
                    c.find('tbody').append(td); 
                });

                var sum = '<tr>' +
                    '<th></th>' +
                    '<th class="text-lg-center border-start">'+numeral(sum_vaccinations_doses_1).format('0,0')+'</th>' +
                    '<th class="text-lg-center border-start">'+numeral(sum_daily_vaccinations_doses_1).format('0,0')+'</th>' +
                    '<th class="text-lg-center border-start">'+numeral(sum_vaccinations_doses_2).format('0,0')+'</th>' +
                    '<th class="text-lg-center border-start">'+numeral(sum_daily_vaccinations_doses_2).format('0,0')+'</th>' +
                    '<th class="text-lg-center border-start">'+numeral(sum_vaccinations_doses_0).format('0,0')+'</th>' +
                    '<th class="text-lg-center border-start">'+numeral(sum_daily_vaccinations_doses_0).format('0,0')+'</th>' +
                    '<th class="text-lg-center border-start">'+numeral(sum_vaccinations_total).format('0,0')+'</th>' +
                    '<th class="border-start"></th>' +
                    '<th data-hidden="doses_percentage"></th>' +
                '</tr>';
                c.find('tfoot').append(sum);

                c.tablesorter({
                    theme : 'bootstrap',
                    widgets : ['cssStickyHeaders'],
                    sortReset: true
                });

                show_tooltip();
            }
        });
    }
    //-- UTI
    if($('#table_uti').length) {
        $.ajax({
            url: endpoint+'/tables/uti.json',
            cache: false,
            method: 'GET',
            success: function(data) {
                var c = $('#table_uti');
                c.find('tbody').html('');
                
                var sum_quantity = 0;
                var sum_occupied = 0;

                $.each(data, function (key, item) {
                    var label = item.label == null ? '-' : item.label;
                    var quantity = item.quantity == null ? '-' : item.quantity;
                    var occupied = item.occupied == null ? '-' : item.occupied;
                    var percentage = item.percentage == null ? '' : item.percentage;
                    var last_update = item.last_update == null ? '-' : item.last_update;

                    sum_quantity += item.quantity;
                    sum_occupied += item.occupied;

                    var td = '<tr>' +
                        '<td>' +
                            '<img class="mx-auto mb-1 rounded border border-secondary" src="//cdn.jsdelivr.net/gh/bgeneto/bandeiras-br/imagens/'+item.iso_code.toUpperCase()+'.png" width="20" />' +
                            '<span class="d-inline-block d-lg-none ms-2">'+item.iso_code.toUpperCase()+'</span>' +
                            '<span class="d-none d-lg-inline-block ms-2">'+item.state+'</span>' +
                        '</td>' +
                        '<td>'+label+'</td>' +
                        '<td>'+numeral(occupied).format('0,0')+'</td>' +
                        '<td>'+numeral(quantity).format('0,0')+'</td>' +
                        '<td class="align-middle text-lg-center" style="'+chroma_style(['fff0f0', 'a60000'], percentage)+'">'+percentage+'%</td>' +
                        '<td>'+moment(last_update).format('DD[/]MM[/]YY [às] HH[h]mm')+'</td>' +
                    '</tr>';
                    c.find('tbody').append(td);
                });

                var sum = '<tr>' +
                    '<th></th>' +
                    '<th></th>' +
                    '<th>'+numeral(sum_occupied).format('0,0')+'</th>' +
                    '<th>'+numeral(sum_quantity).format('0,0')+'</th>' +
                    '<th></th>' +
                    '<th></th>' +
                '</tr>';
                c.find('tfoot').append(sum);

                c.tablesorter({
                    theme : 'bootstrap',
                    widgets : ['cssStickyHeaders'],
                    sortReset: true
                });
            }
        });
    }
});