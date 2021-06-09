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
                c.find('.card-footer').removeClass('d-none');

                c.find('.doses_total_1').html('1ª Dose: <span class="fs-5 badge bg-info">'+numeral(data.total_vaccinations.doses_1).format('0,0')+'</span>');
                c.find('.doses_percentage_1').html(data.total_vaccinations.percentage_doses_1+'% da população');
                c.find('.doses_total_2').html('2ª Dose: <span class="fs-5 badge bg-info">'+numeral(data.total_vaccinations.doses_2).format('0,0')+'</span>');
                c.find('.doses_percentage_2').html(data.total_vaccinations.percentage_doses_2+'% da população');
                c.find('.last_update').html(moment(data.last_update).format('DD[/]MM[/]YY [às] HH[h]mm'));

                if($('#card_daily_vaccination').length) {
                    var d = $('#card_daily_vaccination');

                    d.find('.loading').addClass('d-none');
                    d.find('.card-body').removeClass('d-none');
                    d.find('.card-footer').removeClass('d-none');
    
                    if(moment(data.last_update).isSame(moment(), 'day')) {
                        d.find('.doses_total_1').html('1ª Dose: '+numeral(data.daily_vaccinations.doses_1).format('0,0'));
                        d.find('.doses_total_2').html('2ª Dose: '+numeral(data.daily_vaccinations.doses_2).format('0,0'));
                        d.find('.last_update').html(moment(data.last_update).format('DD[/]MM[/]YY [às] HH[h]mm'));
                    } else {
                        d.find('.doses_total_1').html('1ª Dose: 0');
                        d.find('.doses_total_2').html('2ª Dose: 0');
                        d.find('.last_update').html(moment(data.last_update).format('DD[/]MM[/]YY [às] HH[h]mm'));
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
                c.find('.card-footer').removeClass('d-none');

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
                c.find('.card-footer').removeClass('d-none');

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
                c.find('.card-footer').removeClass('d-none');

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
                c.find('.card-footer').removeClass('d-none');

                c.find('.total').html(numeral(data.total_suspects).format('0,0'));
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
                c.find('.card-footer').removeClass('d-none');

                c.find('.total').html(numeral(data.total_tests).format('0,0'));
                c.find('.last_update').html(moment(data.last_update).format('DD[/]MM[/]YY [às] HH[h]mm'));
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
                    var vaccinations_doses_1 = item.vaccinations.doses_1 == null ? '0' : item.vaccinations.doses_1;
                    var vaccinations_doses_2 = item.vaccinations.doses_2 == null ? '0' : item.vaccinations.doses_2;
                    var vaccinations_total = item.vaccinations.total == null ? '0' : item.vaccinations.total;
                    var vaccinations_doses_1_percentage = item.vaccinations.doses_1_percentage == null ? '0' : item.vaccinations.doses_1_percentage;
                    var vaccinations_doses_2_percentage = item.vaccinations.doses_2_percentage == null ? '0' : item.vaccinations.doses_2_percentage;

                    sum_cases_total += item.cases.total;
                    sum_cases_new += item.cases.new;
                    sum_deaths_total += item.deaths.total;
                    sum_deaths_new += item.deaths.new;
                    sum_tests += item.tests.total;
                    sum_suspects += item.suspects.total;
                    sum_recovered += item.recovered.total;
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
                        '<td class="text-lg-center d-none" data-hidden="doses_total">'+numeral(vaccinations_total).format('0,0')+'</td>' +
                        '<td class="text-lg-center" data-hidden="doses_percentage" style="'+chroma_style(['cdf5ff', '00429d'], vaccinations_doses_1_percentage)+'">'+vaccinations_doses_1_percentage+'%</td>' +
                        '<td class="text-lg-center" data-hidden="doses_percentage" style="'+chroma_style(['cdf5ff', '00429d'], vaccinations_doses_2_percentage)+'">'+vaccinations_doses_2_percentage+'%</td>' +
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
                    '<th class="text-lg-center border-start d-none" data-hidden="doses_total">'+numeral(sum_vaccinations_total).format('0,0')+'</th>' +
                    '<th class="border-start" data-hidden="doses_percentage"></th>' +
                    '<th data-hidden="doses_percentage"></th>' +
                '</tr>';
                c.find('tfoot').append(sum);

                c.tablesorter({
                    theme : 'bootstrap',
                    widgets : ['cssStickyHeaders'],
                    usNumberFormat: false
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
                
                var sum_vaccinations_doses_1 = 0;
                var sum_daily_vaccinations_doses_1 = 0;
                var sum_vaccinations_doses_2 = 0;
                var sum_daily_vaccinations_doses_2 = 0;
                var sum_vaccinations_total = 0;

                var doses_1_biggest = 0;
                var doses_2_biggest = 0;
                $.each(data, function (key, item) {
                    if (item.daily_vaccinations[1] > doses_1_biggest) {
                        doses_1_biggest = item.daily_vaccinations[1];
                    }
                    if (item.daily_vaccinations[2] > doses_2_biggest) {
                        doses_2_biggest = item.daily_vaccinations[2];
                    }
                });

                $.each(data, function (key, item) {
                    var vaccines = '';
                    $.each(item.vaccines,function(i, data){
                        if(data == 'Pfizer/BioNTech') {
                            var bg = 'pfizer-biontech';
                            var short = 'PZ/BI';
                        }
                        if(data == 'Moderna') {
                            var bg = 'moderna';
                            var short = 'MDN';
                        }
                        if(data == 'Oxford/AstraZeneca') {
                            var bg = 'oxford-astrazeneca';
                            var short = 'AZ';
                        }
                        if(data == 'Sputnik V') {
                            var bg = 'sputnik-v';
                            var short = 'SPV';
                        }
                        if(data == 'Covaxin') {
                            var bg = 'covaxin';
                            var short = 'COX';
                        }
                        if(data == 'Sinovac/Butantan') {
                            var bg = 'sinovac-butantan';
                            var short = 'SN/BT';
                        }
                        if(data == 'Johnson&Johnson') {
                            var bg = 'johnson-johnson';
                            var short = 'J&J';
                        }
                        var vaccine_style = data.toLowerCase().replace(' ','-').replace('/','-').replace('&','-')
                        vaccines += '<span class="me-1 badge bg-'+vaccine_style+'" title="'+data+'">'+short+'</span>';
                    });

                    var vaccinations_doses_1 = item.total_vaccinations[1] == null ? '0' : item.total_vaccinations[1];
                    var daily_vaccinations_doses_1 = item.daily_vaccinations[1] == null ? '0' : item.daily_vaccinations[1];
                    var vaccinations_doses_2 = item.total_vaccinations[2] == null ? '0' : item.total_vaccinations[2];
                    var daily_vaccinations_doses_2 = item.daily_vaccinations[2] == null ? '0' : item.daily_vaccinations[2];
                    var vaccinations_total = item.total_vaccinations.total == null ? '0' : item.total_vaccinations.total;
                    var vaccinations_doses_1_percentage = item.total_vaccinations.percentage_doses_1 == null ? '0' : item.total_vaccinations.percentage_doses_1;
                    var vaccinations_doses_2_percentage = item.total_vaccinations.percentage_doses_2 == null ? '0' : item.total_vaccinations.percentage_doses_2;

                    sum_vaccinations_doses_1 += item.total_vaccinations[1];
                    sum_daily_vaccinations_doses_1 += item.daily_vaccinations[1];
                    sum_vaccinations_doses_2 += item.total_vaccinations[2];
                    sum_daily_vaccinations_doses_2 += item.daily_vaccinations[2];
                    sum_vaccinations_total += item.total_vaccinations.total;

                    var progress_doses_1 = daily_vaccinations_doses_1 / doses_1_biggest * 100;
                    var progress_doses_2 = daily_vaccinations_doses_2 / doses_2_biggest * 100;

                    var td = '<tr>' +
                        '<td class="align-middle text-nowrap">' +
                            '<img class="mx-auto mb-1 rounded border border-secondary" src="//cdn.jsdelivr.net/gh/bgeneto/bandeiras-br/imagens/'+item.iso_code.toUpperCase()+'.png" width="20" />' +
                            '<span class="d-inline-block d-lg-none ms-2">'+item.iso_code.toUpperCase()+'</span>' +
                            '<span class="d-none d-lg-inline-block ms-2">'+item.state+'</span>' +
                        '</td>' +
                        '<td class="align-middle">'+vaccines+'</td>' +
                        '<td class="align-middle text-lg-center">'+numeral(vaccinations_doses_1).format('0,0')+'</td>' +
                        '<td class="text-lg-center align-middle">' +
                        '<div class="d-flex align-items-center">' +
                        '<div class="w-50 text-end pe-2">'+numeral(daily_vaccinations_doses_1).format('0,0')+'</div>' +
                        '<div class="w-50 progress"><div class="progress-bar bg-primary" role="progressbar" style="width: '+progress_doses_1+'%" aria-valuenow="'+progress_doses_1+'" aria-valuemin="0" aria-valuemax="100"></div></div>' +
                        '</div>' +
                        '</td>' +
                        '<td class="align-middle text-lg-center">'+numeral(vaccinations_doses_2).format('0,0')+'</td>' +
                        '<td class="text-lg-center align-middle">' +
                        '<div class="d-flex align-items-center">' +
                        '<div class="w-50 text-end pe-2">'+numeral(daily_vaccinations_doses_2).format('0,0')+'</div>' +
                        '<div class="w-50 progress"><div class="progress-bar bg-primary" role="progressbar" style="width: '+progress_doses_2+'%" aria-valuenow="'+progress_doses_2+'" aria-valuemin="0" aria-valuemax="100"></div></div>' +
                        '</div>' +
                        '</td>' +
                        '<td class="align-middle text-lg-center">'+numeral(vaccinations_total).format('0,0')+'</td>' +
                        '<td class="align-middle text-lg-center" style="'+chroma_style(['cdf5ff', '00429d'], vaccinations_doses_1_percentage)+'">'+vaccinations_doses_1_percentage+'%</td>' +
                        '<td class="align-middle text-lg-center" style="'+chroma_style(['cdf5ff', '00429d'], vaccinations_doses_2_percentage)+'">'+vaccinations_doses_2_percentage+'%</td>' +
                    '</tr>';
                    c.find('tbody').append(td);
                });

                var sum = '<tr>' +
                    '<th></th>' +
                    '<th class="border-start"></th>' +
                    '<th class="text-lg-center border-start">'+numeral(sum_vaccinations_doses_1).format('0,0')+'</th>' +
                    '<th class="text-lg-center border-start">'+numeral(sum_daily_vaccinations_doses_1).format('0,0')+'</th>' +
                    '<th class="text-lg-center border-start">'+numeral(sum_vaccinations_doses_2).format('0,0')+'</th>' +
                    '<th class="text-lg-center border-start">'+numeral(sum_daily_vaccinations_doses_2).format('0,0')+'</th>' +
                    '<th class="text-lg-center border-start">'+numeral(sum_vaccinations_total).format('0,0')+'</th>' +
                    '<th class="border-start"></th>' +
                    '<th data-hidden="doses_percentage"></th>' +
                '</tr>';
                c.find('tfoot').append(sum);

                c.tablesorter({
                    theme : 'bootstrap',
                    widgets : ['cssStickyHeaders'],
                    usNumberFormat: false
                });
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
                    var quantity = item.quantity == null ? '-' : numeral(item.quantity).format('0,0');
                    var occupied = item.occupied == null ? '-' : numeral(item.occupied).format('0,0');
                    var percentage = item.percentage == null ? '' : numeral(item.percentage).format('0,0')+'%';
                    var percentage_raw = item.percentage == null ? '' : chroma_style(['fff0f0', 'a60000'], item.percentage);
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
                        '<td>'+quantity+'</td>' +
                        '<td>'+occupied+'</td>' +
                        '<td class="text-center" style="'+percentage_raw+'">'+percentage+'</td>' +
                        '<td>'+moment(last_update).format('DD[/]MM[/]YY [às] HH[h]mm')+'</td>' +
                    '</tr>';
                    c.find('tbody').append(td);
                });

                var sum = '<tr>' +
                    '<th></th>' +
                    '<th></th>' +
                    '<th>'+numeral(sum_quantity).format('0,0')+'</th>' +
                    '<th>'+numeral(sum_occupied).format('0,0')+'</th>' +
                    '<th></th>' +
                    '<th></th>' +
                '</tr>';
                c.find('tfoot').append(sum);

                c.tablesorter({
                    theme : 'bootstrap',
                    widgets : ['cssStickyHeaders'],
                    usNumberFormat: false
                });
            }
        });
    }
});