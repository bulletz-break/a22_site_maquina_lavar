let 
    washMach_form_boxes = {},
    washMach_form_inputs = {},
    washMach_json_history = [],
    washMach_step_current = 1
    washMach_json_final = {};

window.onload = function() {
    washMach_form_boxes = washMach_form_get_boxes(); // Obtendo as seções do formulário
    washMach_form_inputs = washMach_form_get_inputs(); // Obtendo os inputs do formulário
    
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
        } case 'a22_widget_washMach_input_Centrifugar': {
            washMach_option_centrifugar();
            break;
        } case 'a22_widget_washMach_input_Dreno': {
            washMach_option_drenar();
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

    if(washMach_btnClicked.prop('class') == 'a22_widget_washMach_function_button' || washMach_btnClicked.prop('id') == 'a22_widget_washMach_input_pronto') return;

    // Desativar o botão
    if(washMach_btnClicked.prop('selected')) washMach_button_disable(washMach_btnClicked); // Desativando o botão
    else washMach_button_enable(washMach_btnClicked); // Ativando o botão

    washMach_can_unlock_functions(); // Verificando se todos os dados necessários foram preenchidos
}

function washMach_button_disable(washMach_btnToDisable) {
    washMach_btnToDisable.prop('selected', false); // Alterando valor para desativado
    washMach_btnToDisable.removeClass('a22_widget_washMach_input_checked'); // Alterando CSS
}

function washMach_button_enable(washMach_btnToEnable) {
    washMach_btnToEnable.prop('selected', true); // Alterando valor para ativado
    washMach_btnToEnable.addClass('a22_widget_washMach_input_checked'); // Alterando CSS
}

// Função que gerencia o botão Lavar
function washMach_option_lavar() {
    if(washMach_form_inputs['Lavar'].prop('selected')) { // Lavar já ativo
        washMach_unlock_element(['Dreno', 'Centrifugar']); // Desbloqueando opções Dreno e Centrifugar
    } else {
        washMach_lock_element(['Dreno', 'Centrifugar']); // Bloqueando opções Dreno e Centrifugar
        washMach_screen_lavar();  // Mostrando as opções para Lavar
    }
}

// Função que gerencia o botão Centrifugar
function washMach_option_centrifugar() {
    if(washMach_form_inputs['Centrifugar'].prop('selected')) { // Centrifugar ativo
        washMach_unlock_element(['Lavar', 'Dreno']); // Desbloqueando Lavar e Dreno
        $('#input_RPM').css({'display' : 'none'}); // Escondendo RPM
        washMach_button_disable(washMach_form_inputs['Dreno']); // Desativando Dreno
    } else {
        washMach_lock_element(['Lavar', 'Dreno']); // Bloqueando Lavar e Dreno
        $('#input_RPM').css({'display' : 'block'}); // Mostrando RPM
        washMach_button_enable(washMach_form_inputs['Dreno']); // Ativando Dreno
    }
}

// Função que gerencia o botão Drenar
function washMach_option_drenar() {
    if(washMach_form_inputs['Dreno']) // Dreno ativo
        washMach_lock_element('Lavar');
    else
        washMach_unlock_element('Lavar');
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
    if(washMach_form_inputs.Centrifugar.prop('selected')) // Centrifugar está ativo
        if(washMach_form_inputs.Tempo.prop('value') > 0) // Tempo foi preenchido
            if(washMach_form_inputs.RPM.prop('value') > 0) // Se RPM foi preenchido
                return washMach_unlock_element(['proximo', 'salvar', 'voltar']);
    
    if(washMach_form_inputs.Dreno.prop('selected') && !washMach_form_inputs.Centrifugar.prop('selected')) // Se Dreno está ativo e Centrifugar está desativado
        if(washMach_form_inputs.Tempo.prop('value') > 0) // Se tempo foi preenchido
            washMach_unlock_element(['proximo', 'salvar', 'voltar']);


    if(washMach_form_inputs.Lavar.prop('selected')) {
        for(let i=1; i < 6; i++) // Percorrendo as 5 opções de sabão
            if(washMach_form_inputs[`Soap${i}`].prop('value') > 0) { // Se algum sabão foi preenchido
                washMach_unlock_element(['salvar', 'pronto']); // Informando que algum sabão foi preenchido
                if(washMach_form_inputs.Tempo.prop('value') > 0)
                    return washMach_unlock_element('proximo'); // Informando que algum sabão foi preenchido
                return;
            }

        if(!washMach_form_inputs.AguaFria.prop('selected') && !washMach_form_inputs.AguaQuente.prop('selected')) return washMach_lock_element(['proximo', 'salvar', 'pronto']); // Se Água Fria e Água Quente não foram ativos
        if(washMach_form_inputs.CmAgua.prop('value') == 0) return washMach_lock_element(['proximo', 'salvar', 'pronto']); // Se CmAgua não foi preenchido
        if(washMach_form_inputs.AquecerAgua.prop('selected') && washMach_form_inputs.TempAgua.prop('value') == 0) return washMach_lock_element(['proximo', 'salvar', 'pronto']); // Se Aquecer Água ativada e TempAgua não foi preenchido

        washMach_unlock_element(['proximo', 'salvar', 'pronto']); // Desbloqueando funções
        if(washMach_form_inputs.Tempo.prop('value') == 0) return washMach_lock_element(['proximo', 'salvar']); // Se Tempo não foi preenchido
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

// Função que delete um passo da programação
function washMach_step_delete() {
    if(washMach_step_current <= 1) {
        washMach_buttons_props_init();
        return washMach_lock_element(['voltar', 'proximo', 'salvar', 'pronto']);
    }
    
    washMach_json_history.splice(washMach_stepCurrent-1, 1);
    washMach_step_back();
}

// Função que volta um passo da programação
function washMach_step_back() {
    if(washMach_step_current <= 1) return;

    washMach_form_save_data(); // Salvando os dados do passo atual
    washMach_buttons_props_init(); // Resetando dados do formulário
    washMach_form_insert_data(washMach_step_current-2); // Preenchendo o formulário com os dados do passo anterior

    washMach_form_lcd_verifications(); // Verificando os botões LCD

    washMach_step_current--; // Decrementando do passo atual
    washMach_form_inputs.StepName.prop('value', `Passo ${washMach_step_current}`); // Alterando o nome do passo
}

function washMach_form_lcd_verifications() {
    if(washMach_form_inputs['Lavar'].prop('selected')) { // Se lavar estiver ativo
        washMach_form_inputs['Lavar'].prop('selected', false);
        washMach_option_lavar();
        washMach_form_inputs['Lavar'].prop('selected', true);
    } else if(washMach_form_inputs['Centrifugar'].prop('selected')) { // Se Centrifugar estiver ativo
        washMach_form_inputs['Centrifugar'].prop('selected', false);
        washMach_option_centrifugar();
        washMach_form_inputs['Centrifugar'].prop('selected', true);
    } else if(washMach_form_inputs['Dreno'].prop('selected')) {  // Se Dreno foi ativado
        washMach_form_inputs['Dreno'].prop('selected', false);
        washMach_option_drenar();
        washMach_form_inputs['Dreno'].prop('selected', true);
    }
}

// Função que avança um passo da programação
function washMach_step_next() {
    washMach_form_save_data(); // Salvando os dados do passo atual
    washMach_buttons_props_init(); // Resetando dados do formulário
    washMach_lock_element(['proximo', 'salvar', 'pronto']); // Bloqueando funções

    if(washMach_json_history[washMach_step_current]) // Existem dados inseridos
        washMach_form_insert_data(washMach_step_current); // Inserindo os dados

    if(!washMach_form_inputs.Centrifugar.prop('selected'))
        $('#input_RPM').css({'display' : 'none'});

    washMach_step_current++; // Incrementando ao passoa atual
    washMach_form_inputs.StepName.prop('value', `Passo ${washMach_step_current}`); // Alterando o nome do passo
    washMach_can_unlock_functions(); // Verificando se o passo já tem os dados necessários
    washMach_form_lcd_verifications(); // Verificando os botões LCD

    setTimeout(() => {
        $('#a22_widget_washMach_input_proximo').removeClass('a22_widget_washMach_input_checked') // Removendo estilização (algum bug)
    });
}

// Função que salva a programação
function washMach_step_save() {
    washMach_form_save_data(); // Salvando dados do passo atual
    washMach_json_mount(); // Montando o JSON para enviar
    washMach_json_send(); // Enviando o JSON
    washMach_form_show_saved_message(); // Mostrando mensagem de salvo
}

// Função que insere os dados de um passo salvo na programação
function washMach_form_insert_data(washMach_stepToInsData) {
    Object.keys(washMach_form_inputs).forEach(k => { // Percorrendo todos os atributos do passo
        if(washMach_form_inputs[k].prop('type') == 'button' && washMach_json_history[washMach_stepToInsData][k])// É um botão e foi ativado
            washMach_button_enable(washMach_form_inputs[k]); // Ativando o botão
        else if(washMach_form_inputs[k].prop('type') == 'number')
            washMach_form_inputs[k].prop('value', washMach_json_history[washMach_stepToInsData][k]); // Preenchendo com o valor do passo
    });

    washMach_form_inputs['StepName'].prop('value', washMach_json_history[washMach_stepToInsData]['StepName']); // Preenchendo o nome do passo
}

// Função que salva os dados do passo atual
function washMach_form_save_data() {
    washMach_json_history[washMach_step_current-1] = {}; // Definindo índice do array como objeto

    Object.keys(washMach_form_inputs).forEach(k => { // Percorrendo todos os atributos do passo
        if(washMach_form_inputs[k].prop('type') == 'button') // É um botão; valor booleano
            washMach_json_history[washMach_step_current-1][k] = washMach_form_inputs[k].prop('selected'); // Pegando se está ou não selecionado
        else if(washMach_form_inputs[k].prop('type') == 'number')
            washMach_json_history[washMach_step_current-1][k] = Number(washMach_form_inputs[k].prop('value')); // Pegando o valor do input
    });

    washMach_json_history[washMach_step_current-1]['StepName'] = washMach_form_inputs['StepName'].prop('value'); // Obtendo o nome do passo
}

// Função que monta o JSON para enviar para o ThingsBoard
function washMach_json_mount() {
    let washMach_json_mounted = {};
    Object.keys(washMach_json_history).forEach(k => { // Percorrendo todos os índices do array
        if(washMach_json_history[k].Centrifugar || washMach_json_history[k].Dreno) {
            // Limpando valores desnecessários
            washMach_json_history[k].CmAgua       = 0;
            washMach_json_history[k].TempAgua     = 0;
            washMach_json_history[k].AguaFria     = false;
            washMach_json_history[k].AguaQuente   = false;
            washMach_json_history[k].AquecerAgua  = false;
            washMach_json_history[k].Soap1        = 0;
            washMach_json_history[k].Soap2        = 0;
            washMach_json_history[k].Soap3        = 0;
            washMach_json_history[k].Soap4        = 0;
            washMach_json_history[k].Soap5        = 0;
        }

        if(!washMach_json_history[k].AquecerAgua) washMach_json_history[k].TempAgua = 0;
        washMach_json_mounted[k] = JSON.stringify(washMach_json_history[k]); // Sem "\"
    });

    washMach_json_final = JSON.stringify(washMach_json_mounted); // Com "\"
    console.log(washMach_json_final);
}

// Função que envia o JSON para o ThingsBoard
function washMach_json_send() {
    let stepAttributes = [], entityId = {
        entityType: "DEVICE",
        id: "5e6e0110-d7b6-11ec-8715-a95ef7ab7919"
    }, entityAttributeType = "SHARED_SCOPE";

    stepAttributes.push({
        key: "testeHoje",
        value: washMach_json_final
    });

    self.ctx.attributeService.saveEntityAttributes(entityId, entityAttributeType, stepAttributes).subscribe(
        function success() {
            self.ctx.$scope.error = "";
            self.ctx.detectChanges();
        }); 
}

function washMach_form_show_saved_message() {
    $('#a22_widget_washMach').css({'display' : 'none'}); // Sumindo com o elemento pai do formulário
    $('#a22_widget_washMach_saved_message').css({'display' : 'flex'}); // Mostrando mensagem
    $('#a22_widget_washMach_saved_message_counter').text('10'); // Alterando o texto

    let i = 10; // Contagem
    let interval = setInterval(() => { // Contagem
        i--; // Diminuindo o valor
        $('#a22_widget_washMach_saved_message_counter').text(i); // Alterando o texto
        if(i == 0) { // Contagem acabou            
            clearInterval(interval); // Finalizando repetição
            washMach_form_reset(); // Resetando o formulário
        }
    }, 1000);
}

function washMach_form_reset() {
    washMach_step_current = 1;
    washMach_json_final = {};
    washMach_json_history = [];
    washMach_form_inputs.StepName.prop('value', 'Passo 1');
    washMach_buttons_props_init();
    washMach_lock_element(['proximo', 'salvar', 'pronto']);

    $('#a22_widget_washMach').css({'display' : 'block'}); // Sumindo com o elemento pai do formulário
    $('#a22_widget_washMach_saved_message').css({'display' : 'none'}); // Mostrando mensagem
}