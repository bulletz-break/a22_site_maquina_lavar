let 
    washMach_form_boxes = {},
    washMach_form_inputss = {},
    washMach_json_history = [],
    washMach_step_current = 1;

window.onload = function() {
    washMach_form_boxes = washMach_form_get_boxes(); // Obtendo as seções do formulário
    washMach_form_inputss = washMach_form_get_inputs(); // Obtendo os inputs do formulário
    
    $('input[type="button"]').click(function() { // Quando qualquer botão for clicado
        washMach_manage_buttons($(this)); // Chamando a função que gerencia os botões
    });

    $('input[type="number"]').change(function() { // Quando qualquer input for alterado
        washMach_manage_inputs($(this)); // Chamando a função que gerencia os inputs
    });

    washMach_buttons_props_init(); // Setando as propriedades dos botões e inputs

    washMach_screen_initial(); // Mostrando a tela inicial da configuração
    washMach_lock_element(['proximo', 'salvar', 'voltar', 'pronto']);
}

// Função que define todas as propriedas necessárias para os botões e inputs
function washMach_buttons_props_init() {
    // Propriedades dos botões
    $('input[type="button"]').prop({
        selected    : false,
        blocked     : false
    });

    // Propriedades dos inputs
    $('input[type="number"]').prop({
        blocked     : false,
        value       : 0
    });

    // Removendo CSS dos botões e inputs
    $('input').removeClass('a22_widget_washMach_input_locked a22_widget_washMach_input_checked');
}

// Função que gerencia os clicks de todos os botões
function washMach_manage_buttons(washMach_btnClicked) {
    switch(washMach_btnClicked.prop('id')) {
        case 'a22_widget_washMach_input_Lavar': {
            washMach_option_lavar(); // Lavar selecionado
            break;
        } case 'a22_widget_washMach_input_excluir': {
            washMach_step_delete(); // Deletar passo
            break;
        } case 'a22_widget_washMach_input_voltar': {
            washMach_step_back(); // Voltar passo
            break;
        } case 'a22_widget_washMach_input_proximo': {
            washMach_step_next(); // Avançar passo
            break;
        } case 'a22_widget_washMach_input_salvar': {
            washMach_step_save(); // Salvar programação
            break;
        } case 'a22_widget_washMach_input_pronto': {
            washMach_screen_initial(); // Voltar para a tela inicial do formulário
            break;
        }
    }

    if(washMach_btnClicked.prop('id') == 'a22_widget_washMach_input_pronto') return;

    if(washMach_btnClicked.prop('selected')) { // Desativar o botão
        washMach_btnClicked.prop('selected', false); // Desativando botão
        washMach_btnClicked.removeClass('a22_widget_washMach_input_checked'); // Alterando CSS
    } else { // Ativar o botão
        washMach_btnClicked.prop('selected', true); // Ativando o botão
        washMach_btnClicked.addClass('a22_widget_washMach_input_checked'); // Alterando CSS
    }

    washMach_can_unlock_functions(); // Verificando se todos os dados necessários foram preenchidos
}

// Função que gerencia o botão Lavar
function washMach_option_lavar() {
    if($('#a22_widget_washMach_input_Lavar').prop('selected')) { // Lavar já ativo
        washMach_unlock_element(['Dreno', 'Centrifugar']); // Desbloqueando opções Dreno e Centrifugar
    } else {
        washMach_lock_element(['Dreno', 'Centrifugar']); // Bloqueando opções Dreno e Centrifugar
        washMach_screen_lavar();  // Mostrando as opções para Lavar
    }
}

// Função que bloqueia um elemento
function washMach_lock_element(washMach_elmntLock) {
    if(Array.isArray(washMach_elmntLock)) { // Mais de um elemento para bloquear
        washMach_elmntLock.forEach(v => { // Percorrendo todos os valores do array
            $(`#a22_widget_washMach_input_${v}`).prop('blocked', true); // Bloqueando o elemento
            $(`#a22_widget_washMach_input_${v}`).addClass('a22_widget_washMach_input_locked'); // Alterando CSS
        });
    } else { // Elemento único para bloquear
        $(`#a22_widget_washMach_input_${washMach_elmntLock}`).prop('blocked', true); // Bloqueando o elemento
        $(`#a22_widget_washMach_input_${washMach_elmntLock}`).addClass('a22_widget_washMach_input_locked'); // Alterando CSS
    }
}

// Função que desbloqueia um elemento
function washMach_unlock_element(washMach_elmtUnlock) {
    if(Array.isArray(washMach_elmtUnlock)) { // Mais de um elemento para desbloquear
        washMach_elmtUnlock.forEach(v => { // Percorrendo todos os valores do array
            $(`#a22_widget_washMach_input_${v}`).prop('blocked', false); // Desbloqueando o elemento
            $(`#a22_widget_washMach_input_${v}`).removeClass('a22_widget_washMach_input_locked') // Alterando CSS
        });
    } else { // Elemento único para desbloquear
        $(`#a22_widget_washMach_input_${washMach_elmtUnlock}`).prop('blocked', false); // Desbloqueando o elemento
        $(`#a22_widget_washMach_input_${washMach_elmtUnlock}`).removeClass('a22_widget_washMach_input_locked') // Alterando CSS
    }
}

// Função que gerencia as alterações de todos os inputs
function washMach_manage_inputs(washmach_iptChanged) {
    if(washmach_iptChanged.prop('value') < 0) // Valor negativo no input
        washmach_iptChanged.prop('value', 0); // Voltando o valor para 0
    
    washMach_can_unlock_functions(); // Verificando se todos os dados necessários foram preenchidos
}

// Função que obtém os elementos das seções e os retorna num objeto
function washMach_form_get_boxes() {
    return {
        tempo   : $('#a22_widget_washMach_form_box_tempo'),
        lcd     : $('#a22_widget_washMach_form_box_lcd'),
        agua    : $('#a22_widget_washMach_form_box_agua'),
        aquecer : $('#a22_widget_washMach_form_box_aquecer'),
        sabao   : $('#a22_widget_washMach_form_box_sabao'),
        funcoes : $('#a22_widget_washMach_widgetFunctions_container'),
        pronto  : $('#a22_widget_washMach_form_box_done')
    };
}

// Função que mostra a tela inicial do formulário
function washMach_screen_initial() {
    washMach_form_boxes.tempo.css({'display' : 'flex'});
    washMach_form_boxes.lcd.css({'display' : 'flex'});
    washMach_form_boxes.agua.css({'display' : 'none'});
    washMach_form_boxes.aquecer.css({'display' : 'none'});
    washMach_form_boxes.sabao.css({'display' : 'none'});
    washMach_form_boxes.funcoes.css({'display' : 'flex'});
    washMach_form_boxes.pronto.css({'display' : 'none'});
}

// Fução que mostra a tela para Lavar
function washMach_screen_lavar() {
    washMach_form_boxes.tempo.css({'display' : 'none'});
    washMach_form_boxes.lcd.css({'display' : 'none'});
    washMach_form_boxes.agua.css({'display' : 'flex'});
    washMach_form_boxes.aquecer.css({'display' : 'flex'});
    washMach_form_boxes.sabao.css({'display' : 'flex'});
    washMach_form_boxes.funcoes.css({'display' : 'none'});
    washMach_form_boxes.pronto.css({'display' : 'flex'});
}

// Função que verifica se os dados necessários foram preenchidos para prosseguir a programação
function washMach_can_unlock_functions() {
    let washMach_soap_setted = false, washMach_canUnlock = true;

    if(washMach_form_inputss.Centrifugar.prop('selected') || washMach_form_inputss.Dreno.prop('selected')) // Se Centrifugar ou Dreno foi selecionado
        if(washMach_form_inputss.Tempo.prop('value') > 0) return washMach_unlock_element(['proximo', 'salvar', 'voltar']);

    if(washMach_form_inputss.Lavar.prop('selected')) {
        for(let i=1; i < 6; i++) // Percorrendo as 5 opções de sabão
            if(washMach_form_inputss[`Soap${i}`].prop('value') > 0) // Se algum sabão foi preenchido
                washMach_soap_setted = true; // Informando que algum sabão foi preenchido

        if(!washMach_form_inputss.AguaFria.prop('selected') && !washMach_form_inputss.AguaQuente.prop('selected')) washMach_canUnlock = false // Se Água Fria e Água Quente não foram ativos
        if(washMach_form_inputss.CmAgua.prop('value') == 0) washMach_canUnlock = false; // Se CmAgua não foi preenchido
        if(washMach_form_inputss.AquecerAgua.prop('selected') && washMach_form_inputss.TempAgua.prop('value') == 0) washMach_canUnlock = false; // Se Aquecer Água ativada e TempAgua não foi preenchido
        if(washMach_form_inputss.Tempo.prop('value') > 0) washMach_canUnlock = false; // Se Tempo não foi preenchido

        if(washMach_canUnlock || washMach_soap_setted) // ARRUMAR
            return washMach_unlock_element(['proximo', 'salvar', 'voltar', 'pronto']); // Desbloqueando funções
        washMach_lock_element(['proximo', 'salvar', 'voltar', 'pronto']); // Bloqueando funções
    }
}

// Função que obtém os elementos inputs do formulário
function washMach_form_get_inputs() {
    return {
        "StepName"      : $('#a22_widget_washMach_widgetStepName'),
        "RPM"           : $('#a22_widget_washMach_input_RPM'),
		"Tempo"         : $('#a22_widget_washMach_input_Tempo'),
		"CmAgua"        : $('#a22_widget_washMach_input_CmAgua'),
		"TempAgua"      : $('#a22_widget_washMach_input_TempAgua'),
		"AguaFria"      : $('#a22_widget_washMach_input_AguaFria'),
		"AguaQuente"    : $('#a22_widget_washMach_input_AguaQuente'),
		"AquecerAgua"   : $('#a22_widget_washMach_input_AquecerAgua'),
		"Lavar"         : $('#a22_widget_washMach_input_Lavar'),
		"Centrifugar"   : $('#a22_widget_washMach_input_Centrifugar'),
		"Dreno"         : $('#a22_widget_washMach_input_Dreno'),
		"Soap1"         : $('#a22_widget_washMach_input_Soap1'),
		"Soap2"         : $('#a22_widget_washMach_input_Soap2'),
		"Soap3"         : $('#a22_widget_washMach_input_Soap3'),
		"Soap4"         : $('#a22_widget_washMach_input_Soap4'),
		"Soap5"         : $('#a22_widget_washMach_input_Soap5')
    };
}

function washMach_step_delete() {
    alert('a')
    if(washMach_step_current <= 1)
        return washMach_buttons_props_init();
}