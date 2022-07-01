// Variáveis
let
    washMach_CanUnlockFunc = true,
    washMach_form_lockedElements = [],
    washMach_json_history = [],
    washMach_form_box = {},
    washMach_form_input = {},
    washMach_stepCurrent = 1,
    washMach_json;

window.onload = function() {
    washMach_form_box = washMach_getBoxes();
    washMach_form_input = washMach_initSettingsStep();

    // Bloqueando funções
    washMach_lockElement(['proximo', 'salvar', 'done']);

    // Escondendo outras opções para lavagem
    washMach_hideElement([washMach_form_box.agua, washMach_form_box.aquecer, washMach_form_box.sabao]);

    // Botão Lavar
    $('#a22_widget_washMach_input_Lavar').click(function() {
        if(washMach_form_input.Lavar) { // Lavar já ativado
            washMach_form_input.Lavar = false; // Desativando Lavar
            return washMach_lockElement(['Centrifugar', 'Dreno']); // Destrancando elementos Centrifugar e Dreno
        }

        washMach_lockElement(['Centrifugar', 'Dreno']); // Trancando elementos Centrifugar e Dreno
        washMach_form_input.Lavar = true; // Ativando Lavar
    });

    // Botão Centrifugar
    $('#a22_widget_washMach_input_Centrifugar').click(function() {
        if(washMach_form_input.Centrifugar) { // Centrifugar ativado
            washMach_form_input.Centrifugar = false; // Desativando Centrifugar
            washMach_form_input.Dreno = false; // Desativando Dreno

            washMach_lockElement(['Lavar', 'Dreno']); // Trancando / Destrancando Lavar e Drenar

            $('a22_widget_washMach_input_Lavar').toggleClass('a22_widget_washMach_input_checked'); // Alterando CSS para desativado
            return $('#a22_widget_washMach_input_Dreno').toggleClass('a22_widget_washMach_input_checked'); // Alterando CSS para ativado
        } 
        
        washMach_lockElement('Dreno'); // Trancando Dreno
        
        if(!washMach_form_input.Dreno) { // Dreno desativado
            washMach_lockElement('Lavar'); // Trancando / Destrancando Lavar
            $('#a22_widget_washMach_input_Dreno').toggleClass('a22_widget_washMach_input_checked'); // Alterando CSS para ativado
            washMach_form_input.Dreno = true;
        }

        washMach_form_input.Centrifugar = true; // Ativando Centrifugar
    });

    // Botão Dreno
    $('#a22_widget_washMach_input_Dreno').click(function() {
        washMach_lockElement('Lavar'); // Trancando / Destrancando Lavar

        if(washMach_form_input.Dreno) { // Dreno ativado
            return washMach_form_input.Dreno = false; // Desativando Dreno
        }

        washMach_form_input.Dreno = true; // Ativando Dreno
    });

    // Botão Água Fria
    $('#a22_widget_washMach_input_AguaFria').click(function() {
        if(washMach_form_input.AguaFria) {
            return washMach_form_input.AguaFria = false; // Desativando Água Fria
        }

        washMach_form_input.AguaFria = true; // Desativando Água Fria
    });

    // Botão Água Quente
    $('#a22_widget_washMach_input_AguaQuente').click(function() {
        if(washMach_form_input.AguaQuente) { // Água Quente ativada
            return washMach_form_input.AguaQuente = false; // Desativando Água Quente
        }
        
        washMach_form_input.AguaQuente = true; // Ativando Água Quente
    });

    // Botão Aquecer Água
    $('#a22_widget_washMach_input_AquecerAgua').click(function() {
        if(washMach_form_input.AquecerAgua) { // Verificando se Aquecer Água está ativado
            return washMach_form_input.AquecerAgua = false; // Desativando Aquecer Água
        }
        
        $('#input_TempAgua').css({'display' : 'block'}); // Mostrando elemento Temperatura da Água

        washMach_form_input.AquecerAgua = true; // Ativando Aquecer Água
    });

    $("input[type='button']").click(function() { 
        if($(this).prop('id') != 'a22_widget_washMach_input_done') // Não estilizar o botão 'Pronto'
            $(this).toggleClass('a22_widget_washMach_input_checked'); // Alterando classe CSS quando o input for clicado
        washMach_managementButtons($(this).prop('id')); // Mandando o botão clicado para ser gerenciado
    });

    $('input[type="number"]').change(function() {
        if($(this).prop('value') < 0)
            $(this).prop('value', 0);
    });

    $('input[type="number"]').prop('value', 0);

    $('.a22_widget_washMach_input_check').unbind('click').bind('click', function() { // Quando qualquer input selecionável for clicado
        washMach_checkUnlockFunctions(); // Destrancando funções
    });

    $('.a22_widget_washMach_input_number').change(function() { // Quando qualquer input numérico for alterado
        washMach_checkUnlockFunctions(); // Destrancando funções
    });

    $('#a22_widget_washMach_input_proximo').click(function() {
        washMach_step_next();
    });

    $('#a22_widget_washMach_input_voltar').click(function() {
        washMach_step_back();

    });

    $('#a22_widget_washMach_input_excluir').click(function() {
        washMach_step_delete();
    });

    $('#a22_widget_washMach_input_salvar').click(function() {
        washMach_step_save();
    });
}

// Função que exclui o passo atual
function washMach_step_delete() {
    if(washMach_stepCurrent <= 1) {
        washMach_unlockAllElements();
        return washMach_cleanForm();
    }
    
    washMach_json_history.splice(washMach_stepCurrent-1, 1);
    washMach_step_back();
}

// Função que preenche o formulário com os dados do passo anterior
function washMach_step_back() {
    if(washMach_stepCurrent <= 1) // Caso seja o primeiro passo
        return;

    washMach_unlockAllElements(); // Liberando todos os elementos trancados
    washMach_json_history[washMach_stepCurrent-1] = washMach_form_get_values(); // Obtendo dados do formulário
    washMach_json_history[washMach_stepCurrent-1].StepName = $('#a22_widget_washMach_widgetStepName').prop('value') // Obtendo o nome do passo
    washMach_step_insertData(washMach_stepCurrent-2); // Inserindo os dados do passo anterior no formulário

    $('#a22_widget_washMach_widgetStepName').prop('value', washMach_json_history[washMach_stepCurrent-2].StepName); // Alterando nome do passo
    washMach_stepCurrent--; // Decrementando do passo atual
}

// Função que gerencia o passo atual da programação da máquina
function washMach_step_next() {
    if(!washMach_form_input.Lavar && !washMach_form_input.Centrifugar && !washMach_form_input.Dreno) return; // Algum bug

    washMach_stepCurrent++; // Incrementando ao passo atual

    washMach_json_history[washMach_stepCurrent-2] = washMach_form_get_values(); // Obtendo dados do formulário
    washMach_json_history[washMach_stepCurrent-2].StepName = $('#a22_widget_washMach_widgetStepName').prop('value') // Obtendo o nome do passo
    washMach_cleanForm(); // Limpando dados do formulário

    if(washMach_json_history[washMach_stepCurrent-1]) // Existe um passo já configurado
        washMach_step_insertData(washMach_stepCurrent-1); // Preenchendo o formulário com os dados do passo

    $('#a22_widget_washMach_widgetStepName').prop('value', `Passo ${washMach_stepCurrent}`); // Alterando nome do passo

    if(!washMach_elementIsLocked('proximo')) // Próximo destrancado
        washMach_lockElement(['proximo', 'salvar', 'done']); // Trancando funções e botão 'pronto'
}

// Função que salva os passos e envia para o ThingsBoard
function washMach_step_save() {
    $('#a22_widget_washMach_widgetProgress_container').css({'border' : '2px solid lightgreen', 'text-align' : 'center'})
    $('#a22_widget_washMach_widgetProgress').text('Programação salva com sucesso!'); // Alterando texto do Widget Header

    washMach_json_history[washMach_stepCurrent-1] = washMach_form_get_values(); // Obtendo dados do formulário
    washMach_json_history[washMach_stepCurrent-1].StepName = $('#a22_widget_washMach_widgetStepName').prop('value') // Obtendo o nome do passo
    washMach_json = washMach_step_mountJson(washMach_json_history);

    console.log(washMach_json);
}

// Função que limpa dados do formulário
function washMach_cleanForm() {
    $('input[type="number"]').prop('value', 0); // Definindo os valores numéricos para 0

    washMach_unlockAllElements(); // Liberando todos os elementos trancados
    washMach_hideElement([washMach_form_box.agua, washMach_form_box.aquecer, washMach_form_box.sabao]); // Escondendo elementos
    washMach_showElement([washMach_form_box.lcd, washMach_form_box.tempo]); // Mostrando seção LCD e Tempo
    $('#input_RPM').css({'display' : 'none'});

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

// Função chamada para destrancar as funções
function washMach_checkUnlockFunctions() {
    washMach_form_input = washMach_form_get_values(); // Obtendo dados do formulário para verificação
    if(washMach_stepCurrent > 1 && washMach_elementIsLocked('voltar')) // Passo 2 ou superior e está trancado
        washMach_lockElement('voltar'); // Destrancando função Voltar

    if(washMach_form_input.Lavar) { // Se Lavar estiver selecionado
        // O passo talvez somente adicione sabão
        if(washMach_form_input.Soap1 > 0 || washMach_form_input.Soap2 > 0 || washMach_form_input.Soap3 > 0 || washMach_form_input.Soap4 > 0 || washMach_form_input.Soap5 > 0 )
            if(washMach_elementIsLocked('proximo'))
                return washMach_lockElement(['proximo', 'salvar', 'done']); // Destrancando funções Proximo e Salvar

        if(washMach_form_input.CmAgua <= 0) return washMach_LockFunctions(); // Se CmAgua não foi preenchido
        if(!washMach_form_input.AguaFria && !washMach_form_input.AguaQuente) return washMach_LockFunctions(); // Se Água Fria e Água Quente não foram selecionados
        if(washMach_form_input.AquecerAgua && washMach_form_input.TempAgua <= 0) return washMach_LockFunctions(); // Se Aquecer Água está ativo e Temperatura da Água não foi preenchido
    } else if(!washMach_form_input.Dreno) return washMach_LockFunctions(); // Se Lavar, Centrifugar e/ou Dreno não foram selecionados

    if(washMach_form_input.Centrifugar && washMach_form_input.RPM <= 0) return washMach_LockFunctions(); // Se centrifugar foi selecionado e RPM não foi preenchido

    if(washMach_form_input.Tempo <= 0) return washMach_LockFunctions(); // Se Tempo não foi preenchido

    if(washMach_elementIsLocked('proximo'))
        washMach_lockElement(['proximo', 'salvar', 'done']); // Destrancando funções Proximo e Salvar
}

// Função que apenas tranca as funções
function washMach_LockFunctions() {
    if(!washMach_elementIsLocked('proximo'))
        return washMach_lockElement(['proximo', 'salvar', 'done']); // Trancando funções Proximo e Salvar
}

// Função que gerencia os botões clicados
function washMach_managementButtons(btnClicked) {
    switch(btnClicked) {
        case 'a22_widget_washMach_input_Lavar': {
            // Se tempo não preenchido ou Lavar não selecionado
            if(washMach_form_input.Tempo <= 0 || !washMach_form_input.Lavar) break;

            washMach_hideElement([washMach_form_box.lcd, washMach_form_box.tempo, washMach_form_box.funcoes]); // Limpando a tela para as novas opções
            washMach_showElement([washMach_form_box.agua, washMach_form_box.aquecer, washMach_form_box.sabao, washMach_form_box.pronto]); // Mostrando as outras seções

            // Movendo o elemento RPM de lugar
            $('#input_RPM').css({'display' : 'block'}); // Mostrando RPM
            $('#a22_widget_washMach_form_box_done').append($('#input_RPM')); // Movendo RPM
            $('#a22_widget_washMach_form_box_tempo').remove('#input_RPM'); // Excluindo RPM anterior
            break;
        } case 'a22_widget_washMach_input_Centrifugar': {
            $('#input_RPM').css({'display' : 'block'}); // Mostrando RPM
            $('#a22_widget_washMach_form_box_tempo').append($('#input_RPM')); // Movendo RPM
            $('#a22_widget_washMach_form_box_done').remove('#input_RPM'); // Excluindo RPM anterior
            break;
        } case 'a22_widget_washMach_input_AquecerAgua': {
            if(!washMach_elementIsLocked('proximo')) // Funções 'próximo' e 'salvar' estão destrancadas
                washMach_lockElement(['proximo', 'salvar', 'done']); // Trancando funções
            
            if(washMach_form_input.TempAgua > 0 && washMach_elementIsLocked('proximo')) // Funções 'próximo' e 'salvar' trancadas e TempAgua foi preenchido
                washMach_lockElement(['proximo', 'salvar', 'done']); // Destrancando funções
            break;
        }

        case 'a22_widget_washMach_input_done': {
            // Voltando para a tela inicial
            washMach_hideElement([washMach_form_box.agua, washMach_form_box.aquecer, washMach_form_box.sabao, washMach_form_box.pronto]);
            washMach_showElement([washMach_form_box.lcd, washMach_form_box.tempo, washMach_form_box.funcoes]);
            break;
        }

        case 'a22_widget_washMach_input_proximo': {
            washMach_lockElement(['proximo', 'salvar', 'done']);
        } case 'a22_widget_washMach_input_voltar': {
            washMach_lockElement(['proximo', 'salvar', 'done']);
        }
    }
}

// Função que desabilita e habilita funções da máquina de serem selecionadas
function washMach_lockElement(toLock) {
    if(Array.isArray(toLock)) // Mais de um item
        Object.keys(toLock).forEach(key => {
            if(washMach_elementIsLocked(toLock[key])) { // Item já está trancado
                $(`#a22_widget_washMach_input_${toLock[key]}`).removeClass(); // Removendo todas as classes
                $(`#a22_widget_washMach_input_${toLock[key]}`).addClass('a22_widget_washMach_input'); // Adicionando novamente classe padrão
                if(typeof washMach_form_input[toLock[key]] != 'number') // Não é um input numérico
                    $(`#a22_widget_washMach_input_${toLock[key]}`).addClass('a22_widget_washMach_input_check') // Adicionando classe
                else
                    $(`#a22_widget_washMach_input_${toLock[key]}`).addClass('a22_widget_washMach_input_number') // Adicionando classe
                washMach_form_lockedElements.splice(washMach_form_lockedElements.indexOf(`a22_widget_washMach_input_${toLock[key]}`), 1); // Removendo o item da lista
            } else {
                $(`#a22_widget_washMach_input_${toLock[key]}`).toggleClass('a22_widget_washMach_input_locked');
                washMach_form_lockedElements.push(`a22_widget_washMach_input_${toLock[key]}`); // Adicionando item na lista
            }
            if(toLock[key] == 'voltar' || toLock[key] == 'proximo' || toLock[key] == 'salvar' || toLock[key] == 'excluir')
                $(`#a22_widget_washMach_input_${toLock[key]}`).addClass('a22_widget_washMach_function_button') // Adicionando novamente a classe padrão
        });
    else { // Item único
        if(washMach_elementIsLocked(toLock)) { // Item já está trancado
            $(`#a22_widget_washMach_input_${toLock}`).removeClass(); // Removendo todas as classes
            $(`#a22_widget_washMach_input_${toLock}`).addClass('a22_widget_washMach_input'); // Adicionando novamente classe padrão
            if(typeof washMach_form_input[toLock] != 'number') // Não é um input numérico
                $(`#a22_widget_washMach_input_${toLock}`).addClass('a22_widget_washMach_input_check') // Adicionando classe
            else
                $(`#a22_widget_washMach_input_${toLock}`).addClass('a22_widget_washMach_input_number') // Adicionando classe
            washMach_form_lockedElements.splice(washMach_form_lockedElements.indexOf(`a22_widget_washMach_input_${toLock}`)); // Removendo item da lista
        } else {
            $(`#a22_widget_washMach_input_${toLock}`).addClass('a22_widget_washMach_input_locked');
            washMach_form_lockedElements.push(`a22_widget_washMach_input_${toLock}`); // Adicionando item na lista
        }
        if(toLock == 'voltar' || toLock == 'proximo' || toLock == 'salvar' || toLock == 'excluir')
            $(`#a22_widget_washMach_input_${toLock}`).addClass('a22_widget_washMach_function_button') // Adicionando novamente a classe padrão
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
        tempo   : $('#a22_widget_washMach_form_box_tempo'),
        lcd     : $('#a22_widget_washMach_form_box_lcd'),
        agua    : $('#a22_widget_washMach_form_box_agua'),
        aquecer : $('#a22_widget_washMach_form_box_aquecer'),
        sabao   : $('#a22_widget_washMach_form_box_sabao'),
        funcoes : $('#a22_widget_washMach_widgetFunctions_container'),
        pronto  : $('#a22_widget_washMach_form_box_done')
    };
}

// Função que inicia o objeto do passo da programação
function washMach_initSettingsStep() {
    return {
        "StepName"      : String('asd'),
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
    $('#a22_widget_washMach_widgetStepName').prop('value', washMach_json_history[stepToInsert].StepName); // Preenchendo o nome do passo
}

// Função que monta o JSON final para enviar
function washMach_step_mountJson() {
    let washMach_finalJson = {};

    Object.keys(washMach_json_history).forEach(key => {
        if(washMach_json_history[key].Centrifugar || washMach_json_history[key].Dreno) { // Se Centrifugar ou Dreno foi selecionado
            // Limpando valores desnecessários
            washMach_json_history[key].CmAgua       = 0;
            washMach_json_history[key].TempAgua     = 0;
            washMach_json_history[key].AguaFria     = false;
            washMach_json_history[key].AguaQuente   = false;
            washMach_json_history[key].AquecerAgua  = false;
            washMach_json_history[key].Soap1        = 0;
            washMach_json_history[key].Soap2        = 0;
            washMach_json_history[key].Soap3        = 0;
            washMach_json_history[key].Soap4        = 0;
            washMach_json_history[key].Soap5        = 0;
        }

        if(!washMach_json_history[key].AquecerAgua) washMach_json_history[key].TempAgua = 0; // Aquecer Água não selecionado, zerar Temperatura da água

        washMach_finalJson[key] = JSON.stringify(washMach_json_history); // Montando o JSON
    });

    return washMach_finalJson;
}

// Função que verifica se um elemento está trancado
function washMach_elementIsLocked(elementToCheck) {
    if(washMach_form_lockedElements.indexOf(`a22_widget_washMach_input_${elementToCheck}`) > -1) return true;
    else return false;
}