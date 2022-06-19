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

    $("input[type='button']").click(function() { // Alterando classe CSS quando o input for clicado
  
        $(this).toggleClass('a22_widget_washMach_input_checked');
    });

    $('input[type="number"]').change(function() {
        if($(this).prop('value') < 0)
            $(this).prop('value', 0);
    });

    $('input[type="number"]').prop('value', 0);

    // Campo Tempo de Execução
    $('#a22_widget_washMach_input_Tempo').change(function() {
        if($(this).prop('value') > 0) { // Veirificando se Tempo de Execução é maior que 0
            washMach_showElement(washMach_form_box.lcd); // Mostrando seção LCD
            washMach_showElement(washMach_form_box.sabao); // Mostrando seção LCD
        } else {
            washMach_hideElement(washMach_form_box.lcd); // Mostrando seção LCD
            washMach_hideElement(washMach_form_box.sabao); // Escondendo seção LCD
        }
    });

    // Botão Lavar
    $('#a22_widget_washMach_input_Lavar').click(function() {
        if(washMach_form_input.Lavar) { // Lavar já ativado
            washMach_form_input.Lavar = false; // Desativando Lavar
            return washMach_lockElement(['Centrifugar', 'Dreno']); // Destrancando elementos Centrifugar e Dreno
        }

        washMach_showElement(washMach_form_box.agua); // Mostrando seção da água
        washMach_lockElement(['Centrifugar', 'Dreno']); // Trancando elementos Centrifugar e Dreno
        washMach_form_input.Lavar = true; // Ativando Lavar
    });

    // Botão Centrifugar
    $('#a22_widget_washMach_input_Centrifugar').click(function() {
        if(washMach_form_input.Centrifugar) { // Centrifugar ativado
            washMach_form_input.Centrifugar = false; // Desativando Centrifugar
            washMach_form_input.Dreno = false; // Desativando Dreno

            washMach_lockElement(['Lavar', 'Dreno', 'Soap1', 'Soap2', 'Soap3', 'Soap4', 'Soap5']); // Trancando / Destrancando Lavar, Drenar e Sabão X...

            $('a22_widget_washMach_input_Lavar').toggleClass('a22_widget_washMach_input_checked'); // Alterando CSS para desativado
            return $('#a22_widget_washMach_input_Dreno').toggleClass('a22_widget_washMach_input_checked'); // Alterando CSS para ativado
        } 
        
        washMach_lockElement('Dreno'); // Trancando Dreno
        
        if(!washMach_form_input.Dreno) { // Dreno desativado
            washMach_lockElement(['Lavar', 'Soap1', 'Soap2', 'Soap3', 'Soap4', 'Soap5']); // Trancando / Destrancando Lavar e Sabão X...
            $('#a22_widget_washMach_input_Dreno').toggleClass('a22_widget_washMach_input_checked'); // Alterando CSS para ativado
            washMach_form_input.Dreno = true;
        }

        washMach_form_input.Centrifugar = true; // Ativando Centrifugar
    });

    // Botão Dreno
    $('#a22_widget_washMach_input_Dreno').click(function() {
        washMach_lockElement(['Lavar', 'Soap1', 'Soap2', 'Soap3', 'Soap4', 'Soap5']); // Trancando / Destrancando Lavar e Sabão X...

        if(washMach_form_input.Dreno) // Dreno ativado
            return washMach_form_input.Dreno = false; // Desativando Dreno
        
        washMach_form_input.Dreno = true; // Ativando Dreno
    });

    // Botão Água Fria
    $('#a22_widget_washMach_input_AguaFria').click(function() {
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

    for(let i=1; i < 6; i++) {
        $(`#a22_widget_washMach_input_Soap${i}`).change(function() {
            if(washMach_form_input.Dreno)
                $(`#a22_widget_washMach_input_Soap${i}`).prop('value', 0);
        });
    }

    $('#a22_widget_washMach_function_proximo').click(function() {
        washMach_step_next();
    });

    $('#a22_widget_washMach_function_voltar').click(function() {
        washMach_step_back();
    });

    $('#a22_widget_washMach_function_excluir').click(function() {
        washMach_step_delete();
    });

    $('#a22_widget_washMach_function_salvar').click(function() {
        washMach_step_save();
    });
}

// Função que salva os passos e envia para o ThingsBoard
function washMach_step_save() {
    $('#a22_widget_washMach_widgetProgress_container').css({'border' : '2px solid lightgreen', 'text-align' : 'center'})
    $('#a22_widget_washMach_widgetProgress').text('Programação salva com sucesso!'); // Alterando texto do Widget Header

    washMach_json_history[washMach_stepCurrent-1] = washMach_form_get_values(); // Obtendo dados do formulário
    washMach_json = washMach_step_mountJson(washMach_json_history);

    console.log(washMach_json);
}

// Função que gerencia o passo atual da programação da máquina
function washMach_step_next() {
    let stepContainValues = false;

    washMach_stepCurrent++; // Incrementando ao passo atual
    $('#a22_widget_washMach_widgetProgress').text('Passo '+washMach_stepCurrent); // Alterando texto do Widget Header

    Object.keys(washMach_form_input).keys(key => { // Lendo os valores
        if(typeof washMach_json_history[washMach_stepCurrent][key] == 'number') { // É um campo númerico
            if(washMach_json_history[washMach_stepCurrent][key] > 0) { // Se o campo foi preenchido
                $(`#a22_widget_washMach_input_${key}`).prop('value', washMach_json_history[washMach_stepCurrent][key]); // Inserindo o valor no campo
                stepContainValues = true; // Informando que o passo continha valores preenchidos
            }
        } else { // É um campo booleano
            if(washMach_json_history[washMach_stepCurrent][key]) { // Se a opção foi selecionada
                $(`#a22_widget_washMach_input_${key}`).click(); // Ativando a opção
                stepContainValues = true; // Informando que o passo continha valores preenchidos
            }
        }
    });

    console.log(washMach_json_history);
    
    if(!stepContainValues) { // Caso o passo não tenha valores preenchidos
        washMach_json_history[washMach_stepCurrent-2] = washMach_form_get_values(); // Obtendo dados do formulário
        washMach_cleanForm(); // Limpando dados do formulário
    } 
}

// Função que preenche o formulário com os dados do passo anterior
function washMach_step_back() {
    if(washMach_stepCurrent <= 1) // Caso seja o primeiro passo
        return;

    washMach_unlockAllElements(); // Liberando todos os elementos trancados
    washMach_json_history[washMach_stepCurrent-1] = washMach_form_get_values(); // Obtendo dados do formulário
    washMach_step_insertData(washMach_stepCurrent-2); // Inserindo os dados do passo anterior no formulário

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

    Object.keys(washMach_json_history).forEach(key => {
        washMach_finalJson[key] = JSON.stringify(washMach_json_history); // Montando o JSON
    });

    return washMach_finalJson;
}

// Função que limpa dados do formulário
function washMach_cleanForm() {
    $('input[type="number"]').prop('value', 0); // Definindo os valores vazios para 0

    washMach_unlockAllElements(); // Liberando todos os elementos trancados
    washMach_hideElement([washMach_form_box.lcd, washMach_form_box.agua, washMach_form_box.aquecer, washMach_form_box.sabao]); // Escondendo elementos

    washMach_form_input = washMach_initSettingsStep();
}

// Função que libera todos os elementos trancados
function washMach_unlockAllElements() {
    $('input[type="button"]').removeClass(); // Removendo todas as classes CSS
    $('input[type="button"]').addClass('a22_widget_washMach_input a22_widget_washMach_input_check'); // Adicionando as classes necessárias
    washMach_form_lockedElements.splice(0, washMach_form_lockedElements.length);
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
            if(washMach_form_lockedElements.indexOf(`a22_widget_washMach_input_${toLock[key]}`) >= 0) // Verificando se o item já está n alista
                washMach_form_lockedElements.splice(washMach_form_lockedElements.indexOf(`a22_widget_washMach_input_${toLock[key]}`), 1); // Removendo o item da lista
            else // Trancar item
                washMach_form_lockedElements.push(`a22_widget_washMach_input_${toLock[key]}`); // Adicionando item na lista
            
                $(`#a22_widget_washMach_input_${toLock[key]}`).toggleClass('a22_widget_washMach_input_locked'); // Alterando classe CSS
                if(typeof washMach_form_input[toLock[key]] != 'number')
                    $(`#a22_widget_washMach_input_${toLock[key]}`).toggleClass('a22_widget_washMach_input_check'); // Alterando classe CSS
        });
    else { // Item único
        if(washMach_form_lockedElements.indexOf(`a22_widget_washMach_input_${toLock}`) >= 0) // Verificando se o item já está na lista
            washMach_form_lockedElements.splice(washMach_form_lockedElements.indexOf(`a22_widget_washMach_input_${toLock[key]}`)); // Removendo item da lista
        else
            washMach_form_lockedElements.push(`a22_widget_washMach_input_${toLock}`); // Adicionando item na lista
        
        $(`#a22_widget_washMach_input_${toLock}`).toggleClass('a22_widget_washMach_input_locked'); // Alterando classe CSS
        if(typeof washMach_form_input[toLock] != 'number')
            $(`#a22_widget_washMach_input_${toLock}`).toggleClass('a22_widget_washMach_input_check'); // Alterando classe CSS
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

// Função que insere os dados no formulário
function washMach_step_insertData(stepToInsert) {
    Object.keys(washMach_json_history[stepToInsert]).forEach(key => { // Lendo informações do passo
        if(typeof washMach_json_history[stepToInsert][key] == 'number') // Se for um campo de número
            $(`#a22_widget_washMach_input_${key}`).prop('value', washMach_json_history[stepToInsert][key]) // Inserindo valor
        else if(washMach_json_history[stepToInsert][key]) // Se for verdadeiro / falso
            $(`#a22_widget_washMach_input_${key}`).click(); // Ativando a opção
    });
}