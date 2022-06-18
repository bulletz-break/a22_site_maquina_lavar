let 
    washMach_form_lockedElements = [],
    washMach_json_history = [],
    washMach_form_box = {},
    washMach_form_input = {},
    washMach_stepCurrent = 1,
    washMach_json;

window.onload = function() {
    // Variáveis
    washMach_form_box = washMach_getBoxes();

    washMach_form_input = washMach_initSettingsStep();

    // Escondendo outras opções para lavagem
    washMach_hideElement([washMach_form_box.lcd, washMach_form_box.agua, washMach_form_box.aquecer, washMach_form_box.sabao]);
    washMach_hideElement($('#input_TempAgua'));
    for(let i=1; i < 6; i++) {
        $(`#a22_widget_washMach_input_usar_sabao_${i}`).css({'display' : 'none'});
        $(`#a22_widget_washMach_input_Soap${i}`).css({'display' : 'none'});
    }

    $(`#a22_widget_washMach_input_usar_sabao_1`).css({'display' : 'block'});

    $("input[type='button']").click(function() { // Alterando classe CSS quando o input for clicado
        if(washMach_form_lockedElements.indexOf($(this).attr('id')) >= 0) // Input trancado
            return;
        $(this).toggleClass('a22_widget_washMach_input_checked');
    });

    $('input[type="number"]').change(function() {
        if($(this).prop('value') < 0)
            $(this).prop('value', 0);
    });

    $('input[type="number"]').prop('value', 0);

    // Campo Tempo de Execução
    $('#a22_widget_washMach_input_Tempo').change(function() {
        if($(this).prop('value') > 0) // Veirificando se Tempo de Execução é maior que 0
            washMach_showElement(washMach_form_box.lcd); // Mostrando seção LCD
        else
            washMach_hideElement(washMach_form_box.lcd); // Escondendo seção LCD
    });

    // Botão Lavar
    $('#a22_widget_washMach_input_Lavar').click(function() {
        if(washMach_form_lockedElements.indexOf($(this).attr('id')) >= 0) // Elemento trancado
            return;

        if(washMach_form_input.Lavar) { // Lavar já ativado
            washMach_form_input.Lavar = false; // Desativando Lavar
            return washMach_lockElement(['a22_widget_washMach_input_Centrifugar', 'a22_widget_washMach_input_Dreno']); // Destrancando elementos Centrifugar e Dreno
        }

        washMach_showElement(washMach_form_box.agua); // Mostrando seção da água
        washMach_lockElement(['a22_widget_washMach_input_Centrifugar', 'a22_widget_washMach_input_Dreno']); // Trancando elementos Centrifugar e Dreno
        washMach_form_input.Lavar = true; // Ativando Lavar
    });

    // Botão Centrifugar
    $('#a22_widget_washMach_input_Centrifugar').click(function() {
        if(washMach_form_lockedElements.indexOf($(this).attr('id')) >= 0) // Elemento trancado
            return;
        
        if(washMach_form_input.Centrifugar) { // Centrifugar ativado
            washMach_form_input.Centrifugar = false; // Desativando Centrifugar
            washMach_form_input.Dreno = false; // Desativando Dreno
            washMach_lockElement('a22_widget_washMach_input_Lavar'); // Destrancando Lavar
            $('a22_widget_washMach_input_Lavar').toggleClass('a22_widget_washMach_input_checked'); // Alterando CSS para desativado
            washMach_lockElement('a22_widget_washMach_input_Dreno'); // Destrancando Dreno
            return $('#a22_widget_washMach_input_Dreno').toggleClass('a22_widget_washMach_input_checked');
        } 
        
        washMach_lockElement('a22_widget_washMach_input_Dreno'); // Trancando Dreno
        
        if(!washMach_form_input.Dreno) { // Dreno desativado
            washMach_lockElement('a22_widget_washMach_input_Lavar'); // Trancando Lavar
            $('#a22_widget_washMach_input_Dreno').toggleClass('a22_widget_washMach_input_checked'); // Alterando CSS para ativado
            washMach_form_input.Dreno = true;
        }

        washMach_form_input.Centrifugar = true; // Ativando Centrifugar
    });

    // Botão Dreno
    $('#a22_widget_washMach_input_Dreno').click(function() {
        if(washMach_form_lockedElements.indexOf($(this).attr('id')) >= 0) // Elemento trancado
            return;
        
        if(washMach_form_input.Dreno) { // Dreno ativado
            washMach_lockElement('a22_widget_washMach_input_Lavar'); // Trancando Lavar
            return washMach_form_input.Dreno = false; // Desativando Dreno
        }
        
        washMach_lockElement('a22_widget_washMach_input_Lavar'); // Trancando Lavar
        
        washMach_form_input.Dreno = true; // Ativando Dreno
    });

    // Botão Água Fria
    $('#a22_widget_washMach_input_AguaFria').click(function() {
        if(washMach_form_lockedElements.indexOf($(this).attr('id')) >= 0) // Elemento trancado
            return;
    
        if(washMach_form_input.AguaFria) {
            if(!washMach_form_input.AguaQuente) // Verificando se Água Quente está ativada
                washMach_hideElement(washMach_form_box.aquecer); // Esconder seção Aquecer
            return washMach_form_input.AguaFria = false; // Desativando Água Fria
        }

        if($('#a22_widget_washMach_input_CmAgua').prop('value') > 0) // Se Centímetros de Água é maior que 0
            washMach_showElement(washMach_form_box.aquecer); // Mostrando seção Aquecer

        washMach_form_input.AguaFria = true; // Desativando Água Fria
    });

    // Botão Água Quente
    $('#a22_widget_washMach_input_AguaQuente').click(function() {
        if(washMach_form_lockedElements.indexOf($(this).attr('id')) >= 0) // Elemento trancado
            return;
    
        if(washMach_form_input.AguaQuente) {
            if(!washMach_form_input.AguaFria) // Verificando se Água Fria está ativada
                washMach_hideElement(washMach_form_box.aquecer); // Escondendo seção Aquecer
            return washMach_form_input.AguaQuente = false; // Desativando Água Quente
        }

        if($('#a22_widget_washMach_input_CmAgua').prop('value') > 0) // Se Centímetros de água é maior que 0
            washMach_showElement(washMach_form_box.aquecer); // Mostrando seção Aquecer
        
        washMach_form_input.AguaQuente = true; // Ativando Água Quente
    });

    // Campo Centímetros de Água
    $('#a22_widget_washMach_input_CmAgua').change(function() {
        if(washMach_form_input.AguaFria || washMach_form_input.AguaQuente) // Se Água Fria / Quente está ativada
            washMach_showElement(washMach_form_box.aquecer);

        if($(this).prop('value') <= 0) // Verificando se Centímetros de água é menor ou igual a 0
            washMach_hideElement(washMach_form_box.aquecer); // Escondendo seção Aquecer
    });

    // Botão Aquecer Água
    $('#a22_widget_washMach_input_AquecerAgua').click(function() {
        if(washMach_form_lockedElements.indexOf($(this).attr('id')) >= 0) // Elemento trancado
            return;

        if(washMach_form_input.AquecerAgua) { // Verificando se Aquecer Água está ativado
            washMach_hideElement($('#input_TempAgua')); // Escondendo elemento Temperatura da Água
            return washMach_form_input.AquecerAgua = false; // Desativando Aquecer Água
        }

        $('#input_TempAgua').css({'display' : 'block'}); // Mostrando elemento Temperatura da Água

        washMach_form_input.AquecerAgua = true; // Ativando Aquecer Água
    });

    // Campo Temperatura da Água
    $('#a22_widget_washMach_input_TempAgua').change(function() { // Quando o valor de Temperatura da Água for alterado
        if(washMach_form_input.AquecerAgua && $(this).prop('value') <= 0) // Verificando se Aquecer Água está ativado && Temperatura da Água é menor ou igual a 0
            washMach_hideElement(washMach_form_box.sabao); // Escondendo seção Sabão
        
        if($('#a22_widget_washMach_input_RPM').prop('value') > 0) // Verificando se RPM é maior que 0
            washMach_showElement(washMach_form_box.sabao) // Mostrando seção Sabão
    });

    // Campo Rotações por Minuto
    $('#a22_widget_washMach_input_RPM').change(function() { // Quando o valor de RPM for alterado
        if($(this).prop('value') > 0) // Verificando se RPM é maior que 0
            washMach_showElement(washMach_form_box.sabao); // Mostrando seção Sabão
        else
            washMach_hideElement(washMach_form_box.sabao); // Escondendo seção Sabão
        
        if(washMach_form_input.AquecerAgua) // Verificando se Aquecer Água está ativado
            if($('#a22_widget_washMach_input_TempAgua').prop('value') <= 0) // Verificando se Temperatura da Água é menor ou igual a 0
                washMach_hideElement(washMach_form_box.sabao); // Escondendo seção Sabão
    });

    // Sabão
    for(let i=1; i < 6; i++) { // Aplicar para todos os botões de sabão
        $(`#a22_widget_washMach_input_usar_sabao_${i}`).click(function() {
            if(washMach_form_lockedElements.indexOf($(this).attr('id')) >= 0) // Elemento trancado
                return;

            if(i > 1) { // Mais de um sabão
                if($(`#a22_widget_washMach_input_Soap${i-1}`).prop('value') <= 0) // Verificando se o Tempo do sabão é menor ou igual a 0
                    return $(`#a22_widget_washMach_input_Soap${i-1}`).css({'border' : '2px solid red'}); // Obrigar a inserir um valor válido
                washMach_lockElement(`a22_widget_washMach_input_usar_sabao_${i-1}`); // Trancando elemento
            }

            if(washMach_form_input[`Soap${i}`]) { // Verificando se o Sabão X está ativado
                $(`#a22_widget_washMach_input_Soap${i}`).css({'display' : 'none'}); // Escondendo elemento
                $(`#a22_widget_washMach_input_usar_sabao_${i+1}`).css({'display' : 'none'}); // Escondendo elemento
                return washMach_form_input[`IsSelectedSoap${i}`] = false; // Desativando Sabão X
            }

            $(`#a22_widget_washMach_input_Soap${i}`).css({'display' : 'block'}); // Mostrando elemento

            washMach_form_input[`IsSelectedSoap${i}`] = true; // Ativando Sabão X
        });

        $(`#a22_widget_washMach_input_Soap${i}`).change(function() { // Quando o valor do Tempo do Sabão X for alterado
            if($(this).prop('value') > 0) { // Se o valor do Sabão X é maior que 0
                $(this).css({'border' : '2px solid blue'});  // Voltando o input para o design inicial
                $(`#a22_widget_washMach_input_usar_sabao_${i+1}`).css({'display' : 'block'}); // Mostrando botão Sabão X
            } else
                $(`#a22_widget_washMach_input_usar_sabao_${i+1}`).css({'display' : 'none'}); // Escondendo botão Sabão X
        });
    }

    $('#a22_widget_washMach_function_proximo').click(function() {
        if(washMach_form_lockedElements.indexOf($(this).attr('id')) >= 0) // Elemento trancado
            return;
        washMach_step_next();
    });

    $('#a22_widget_washMach_function_voltar').click(function() {
        if(washMach_form_lockedElements.indexOf($(this).attr('id')) >= 0) // Elemento trancado
            return;
        washMach_step_back();
    });

    $('#a22_widget_washMach_function_excluir').click(function() {
        if(washMach_form_lockedElements.indexOf($(this).attr('id')) >= 0) // Elemento trancado
            return;
        washMach_step_delete();
    });

    $('#a22_widget_washMach_function_salvar').click(function() {
        if(washMach_form_lockedElements.indexOf($(this).attr('id')) >= 0) // Elemento trancado
            return;
        washMach_step_save();
    });
}

// Função que salva os passos e envia para o ThingsBoard
function washMach_step_save() {
    $('#a22_widget_washMach_widgetProgress_container').css({'border' : '2px solid lightgreen', 'text-align' : 'center'})
    $('#a22_widget_washMach_widgetProgress').text('Programação salva com sucesso!'); // Alterando texto do Widget Header

    washMach_json_history.push(washMach_form_get_values());
    washMach_json = washMach_step_mountJson(washMach_json_history);

    console.log(washMach_json);
}

// Função que gerencia o passo atual da programação da máquina
function washMach_step_next() {
    washMach_stepCurrent++; // Incrementando ao passo atual
    $('#a22_widget_washMach_widgetProgress').text('Passo '+washMach_stepCurrent); // Alterando texto do Widget Header
    washMach_json_history.push(washMach_form_get_values()); // Obtendo dados do formulário
    console.log(washMach_json_history);
    washMach_cleanForm(); // Limpando dados do formulário
}

// Função que preenche o formulário com os dados do passo anterior
function washMach_step_back() {
    if(washMach_stepCurrent <= 1)
        return;
    
    Object.keys(washMach_json_history[washMach_stepCurrent-2]).forEach(key => {
        if(typeof washMach_json_history[washMach_stepCurrent-2][key] == 'number')
            $(`#a22_widget_washMach_input_${key}`).prop('value', washMach_json_history[washMach_stepCurrent-2][key])
        else if(washMach_json_history[washMach_stepCurrent-2][key])
            $(`#a22_widget_washMach_input_${key}`).click();
    });

    for(let i=1; i < 6; i++)
        if(washMach_json_history[washMach_stepCurrent-2][`IsSelectedSoap${i}`])
            $(`#a22_widget_washMach_input_usar_sabao_${i}`).click();

    washMach_stepCurrent--; // Incrementando ao passo atual
    $('#a22_widget_washMach_widgetProgress').text('Passo '+washMach_stepCurrent); // Alterando texto do Widget Header
}

// Função que exclui o passo atual
function washMach_step_delete() {
    if(washMach_stepCurrent <= 1)
        return washMach_cleanForm();
    
    washMach_json_history.splice(washMach_stepCurrent-1, 1);
    washMach_step_back();
}

// Função que monta o JSON final para enviar
function washMach_step_mountJson() {
    let washMach_finalJson = {};

    for(let i=0; i < washMach_json_history.length; i++)
        washMach_finalJson[i] = JSON.stringify(washMach_json_history[i]);
    return washMach_finalJson;
}

// Função que limpa dados do formuçário
function washMach_cleanForm() {
    $('input[type="number"]').prop('value', 0); // Definindo os valores vazios para 0

    $('input[type="button"]').removeClass(); // Removendo todas as classes CSS
    $('input[type="button"]').addClass('a22_widget_washMach_input a22_widget_washMach_input_check'); // Adicionando as classes necessárias

    washMach_form_lockedElements.splice(0, washMach_form_lockedElements.length);
    washMach_form_input = washMach_initSettingsStep();
}

// Função que pega os dados do formulário
function washMach_form_get_values() {
    let stepValues = {};

    Object.keys(washMach_form_input).forEach(key => {
        if(typeof washMach_form_input[key] == 'boolean')
            stepValues[key] = washMach_form_input[key];
        else
            stepValues[key] = Number($(`#a22_widget_washMach_input_${key}`).prop('value'));
    });

    return stepValues;
}

// Função que desabilita e habilita funções da máquina de serem selecionadas
function washMach_lockElement(toLock) {
    if(Array.isArray(toLock)) // Mais de um item
        Object.keys(toLock).forEach(key => {
            if(washMach_form_lockedElements.indexOf(toLock[key]) >= 0) // Verificando se o item já está n alista
                washMach_form_lockedElements.splice(washMach_form_lockedElements.indexOf(toLock[key]), 1); // Removendo o item da lista
            else // Trancar item
                washMach_form_lockedElements.push(toLock[key]); // Adicionando item na lista
            $(`#${toLock[key]}`).toggleClass('a22_widget_washMach_input_locked'); // Alterando classe CSS
            $(`#${toLock[key]}`).toggleClass('a22_widget_washMach_input_check'); // Alterando classe CSS
        });
    else { // Item único
        if(washMach_form_lockedElements.indexOf(toLock) >= 0) // Verificando se o item já está na lista
            washMach_form_lockedElements.splice(washMach_form_lockedElements.indexOf(toLock)); // Removendo item da lista
        else
            washMach_form_lockedElements.push(toLock); // Adicionando item na lista
        $(`#${toLock}`).toggleClass('a22_widget_washMach_input_locked'); // Alterando classe CSS
        $(`#${toLock}`).toggleClass('a22_widget_washMach_input_check'); // Alterando classe CSS
    }
}

// Função que esconde um elemento
function washMach_hideElement(toHide) {
    if(Array.isArray(toHide)) // Mais de um item
        Object.keys(toHide).forEach(key => {
            toHide[key].css({'display' : 'none'}); // Escondendo elemento
        });
    else toHide.css({'display' : 'none'}); // Item único; Escondendo elemento
}

// Função que mostra um elemento
function washMach_showElement(toShow) {
    if(Array.isArray(toShow)) // Mais de um item
        Object.keys(toShow).forEach(key => {
            toShow[key].css({'display' : 'flex'}); // Mostrando elemento
        });
    else toShow.css({'display' : 'flex'}); // Item único; Mostrando elemento
}

// Função que pega os elementos das seções do formulário
function washMach_getBoxes() {
    return {
        lcd     : $('#a22_widget_washMach_form_box_lcd'),
        agua    : $('#a22_widget_washMach_form_box_agua'),
        aquecer : $('#a22_widget_washMach_form_box_aquecer'),
        sabao   : $('#a22_widget_washMach_form_box_sabao'),
    };
}

// Função que inicia o objeto do passo da programação
function washMach_initSettingsStep() {
    return {
        "RPM"           : 0,
		"Tempo"         : 0,
		"CmAgua"        : 0,
		"TempAgua"      : 0,
		"AguaFria"      : false,
		"AguaQuente"    : false,
		"AquecerAgua"   : false,
		"Lavar"         : false,
		"Centrifugar"   : false,
		"Dreno"         : false,
		"Soap1"         : 0,
		"Soap2"         : 0,
		"Soap3"         : 0,
		"Soap4"         : 0,
		"Soap5"         : 0 
    };
}
